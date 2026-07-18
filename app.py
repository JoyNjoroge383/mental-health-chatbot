import base64
import json
import os
import pickle
import random
import re
import urllib.error
import urllib.request
from datetime import datetime

import numpy as np
import requests
import sqlite3
import spacy
import nltk

from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from spacy.language import Language
from spacy_langdetect import LanguageDetector
from dotenv import load_dotenv
from nltk.stem import WordNetLemmatizer
from nltk.corpus import wordnet
from textblob import TextBlob
from transformers import MarianTokenizer, MarianMTModel

# --- TFLite Interpreter ---
# Inference runs through a lightweight TFLite interpreter instead of full
# TensorFlow/Keras, so the deployment image stays small. The .h5 model is
# converted once, offline, via convert_to_tflite.py (WITHOUT post-training
# quantization - quantization emits newer ops like FULLY_CONNECTED v12 that
# older/lightweight runtimes can't read); re-run that script if the model
# is ever retrained.
#
# Import order:
#   1. tflite_runtime  - standalone runtime used in production (Linux, via requirements.txt)
#   2. ai_edge_litert  - its actively maintained successor, if installed instead
#   3. tensorflow.lite - fallback for local dev machines that already have full TF
try:
    from tflite_runtime.interpreter import Interpreter
except ImportError:
    try:
        from ai_edge_litert.interpreter import Interpreter
    except ImportError:
        import tensorflow as tf
        Interpreter = tf.lite.Interpreter

# --- Load environment variables from .env for local development ---
load_dotenv()

# --- NLTK Setup ---
# Only download if not present, to speed up restarts
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('popular')
    nltk.download('punkt_tab')

# WordNet is required by the lemmatizer and can fail under lazy-load race conditions.
try:
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('wordnet')

# Force eager load once during startup to avoid first-request lazy loader issues.
wordnet.ensure_loaded()
lemmatizer = WordNetLemmatizer()

# --- Load Chatbot Model (TFLite) ---
from download_models import download_models

download_models()

interpreter = Interpreter(model_path='model.tflite')
interpreter.allocate_tensors()
_input_detail = interpreter.get_input_details()[0]
_output_detail = interpreter.get_output_details()[0]


def model_predict(x):
    """Run one forward pass through the TFLite model.

    x: array shaped (1, num_features). Returns a 2D array of class
    probabilities, matching the shape the old keras model.predict() gave.
    """
    x = np.asarray(x, dtype=_input_detail['dtype'])
    interpreter.set_tensor(_input_detail['index'], x)
    interpreter.invoke()
    return interpreter.get_tensor(_output_detail['index'])

intents = json.loads(open('intents.json').read())
words = pickle.load(open('texts.pkl', 'rb'))
classes = pickle.load(open('labels.pkl', 'rb'))

# --- Spacy Language Detection ---
def get_lang_detector(nlp, name):
    return LanguageDetector()


nlp = spacy.load("en_core_web_sm")

if not Language.has_factory("language_detector"):
    Language.factory("language_detector", func=get_lang_detector)
    nlp.add_pipe('language_detector', last=True)


# --- Robust language detection (English vs Swahili) ---
# langdetect (used by spacy-langdetect) is unreliable on short text: it tags
# "Habari" as Somali and "Nisaidie tafadhali" as Somali/Afrikaans, so the
# Swahili branch never fired and the bot replied in English. A Swahili keyword
# hit is a much stronger signal for short messages, so we check that first and
# only fall back to the statistical detector for longer text.
SWAHILI_MARKERS = {
    # greetings / courtesy
    "habari", "mambo", "sasa", "shikamoo", "hujambo", "sijambo", "salama",
    "asante", "karibu", "tafadhali", "pole", "samahani", "nzuri", "sawa",
    # pronouns / common verbs
    "nina", "sina", "nataka", "sitaki", "nahitaji", "ninahitaji", "nisaidie",
    "naomba", "sijui", "najisikia", "ninajisikia", "nafikiri", "niko", "uko",
    "mimi", "wewe", "yeye", "sisi", "nyinyi", "wao", "ni", "na", "kwa",
    # question words
    "nini", "nani", "wapi", "lini", "vipi", "kwanini", "kwani", "je",
    # connectors / frequent words
    "sana", "kama", "lakini", "bado", "tena", "ndio", "hapana", "yangu",
    "wangu", "hii", "hiyo", "huyu",
    # feelings / mental-health domain
    "huzuni", "furaha", "wasiwasi", "hofu", "uchovu", "msongo", "mawazo",
    "maisha", "msaada", "afya", "akili", "moyo", "kufa", "kujiua", "sikitiko",
    "upweke", "hasira", "machozi", "shida", "matatizo",
}


def detect_language(text):
    """Return 'sw' for Swahili or 'en' for English.

    A Swahili keyword hit overrides the statistical detector (which misreads
    short Swahili). Only trust the detector's 'sw' verdict when it is
    reasonably confident; otherwise default to English.
    """
    if not text or not text.strip():
        return "en"

    tokens = re.findall(r"[a-zA-Z']+", text.lower())
    if any(tok in SWAHILI_MARKERS for tok in tokens):
        return "sw"

    try:
        detected = nlp(text)._.language
        if detected.get("language") == "sw" and detected.get("score", 0.0) >= 0.9:
            return "sw"
    except Exception as e:
        print(f"Language detection fallback error: {e}")

    return "en"

# --- NLP: Sentence Transformer for Semantic Understanding (disabled) ---
print("Sentence Transformer disabled")
sentence_model = None

# Build semantic search index from all patterns (kept for future use)
print("Building semantic search index...")
pattern_to_intent = []  # List of (pattern, intent_tag) tuples
all_patterns = []

for intent in intents['intents']:
    for pattern in intent['patterns']:
        if pattern.strip():
            pattern_to_intent.append((pattern, intent['tag']))
            all_patterns.append(pattern)

print(f"Indexed {len(all_patterns)} patterns for semantic search")


def analyze_sentiment(text):
    """Analyze the sentiment of the text using TextBlob"""
    blob = TextBlob(text)
    polarity = blob.sentiment.polarity        # -1 to 1
    subjectivity = blob.sentiment.subjectivity  # 0 to 1

    if polarity < -0.3:
        sentiment = "negative"
    elif polarity > 0.3:
        sentiment = "positive"
    else:
        sentiment = "neutral"

    return {
        "polarity": polarity,
        "subjectivity": subjectivity,
        "sentiment": sentiment,
    }


def extract_entities(text):
    doc = nlp(text)
    entities = []
    for ent in doc.ents:
        entities.append({
            "text": ent.text,
            "label": ent.label_,
            "description": spacy.explain(ent.label_),
        })
    return entities


def semantic_search(query, top_k=3):
    return []


def get_nlp_prediction(sentence):
    """
    Hybrid prediction using both bag-of-words model and semantic search.
    Returns the best matching intent with confidence.
    """
    negation_words = [
        "not", "n't", "don't", "dont", "doesn't", "doesnt", "never", "no",
        "can't", "cant", "won't", "wont", "isn't", "isnt", "aren't", "arent",
        "wasn't", "wasnt", "weren't", "werent",
    ]
    sentence_lower = sentence.lower()
    has_negation = any(neg in sentence_lower for neg in negation_words)

    positive_words = ["ok", "okay", "good", "fine", "great", "well", "happy", "alright"]
    has_positive_word = any(pos in sentence_lower for pos in positive_words)

    bow_results = predict_class(sentence)
    semantic_results = semantic_search(sentence, top_k=3)

    if semantic_results and semantic_results[0]['score'] > 0.5:
        best_intent = semantic_results[0]['intent']
        confidence = semantic_results[0]['score']
        method = "semantic"
    elif bow_results and float(bow_results[0]['probability']) > 0.3:
        best_intent = bow_results[0]['intent']
        confidence = float(bow_results[0]['probability'])
        method = "bow"
    elif semantic_results:
        best_intent = semantic_results[0]['intent']
        confidence = semantic_results[0]['score']
        method = "semantic_fallback"
    else:
        return None, 0, "none"

    if has_negation and has_positive_word and best_intent == "happy":
        best_intent = "sad"
        method = method + "_negation_corrected"
        print(" [Negation detected] Flipped intent from 'happy' to 'sad'")

    return best_intent, confidence, method


# --- Translation Models ---
# Anchor the local model cache to this file's directory, not the process's
# current working directory. Under gunicorn (production) the cwd is not
# guaranteed to be the project root, which previously made the relative
# "models/en-sw" path resolve to nothing and load as a (nonexistent) Hub id.
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

TRANSLATION_MODELS = {
    "en-sw": "Rogendo/en-sw",  # English  -> Swahili
    "sw-en": "Rogendo/sw-en",  # Swahili  -> English
}


def _is_valid_model_dir(path):
    """A model folder is only usable if it actually contains a config.json.
    An empty or half-downloaded directory must NOT be trusted."""
    return os.path.isfile(os.path.join(path, "config.json"))


def load_translation_model(repo_id, local_dirname):
    """Load one MarianMT model, resilient to a missing/incomplete local cache.

    Order of attempts:
      1. Load from the local folder if it looks complete (offline, fast).
      2. Otherwise download from the Hugging Face Hub, then save locally so
         subsequent starts are offline.
    Returns (tokenizer, model), or (None, None) if every attempt fails.
    """
    local_path = os.path.join(MODELS_DIR, local_dirname)

    if _is_valid_model_dir(local_path):
        try:
            print(f"Loading {local_dirname} translation model from local cache...")
            return (
                MarianTokenizer.from_pretrained(local_path),
                MarianMTModel.from_pretrained(local_path),
            )
        except Exception as e:
            print(f"Local load failed for {local_dirname} ({e}); will try the Hub.")

    try:
        print(f"Downloading {repo_id} from the Hugging Face Hub...")
        tokenizer = MarianTokenizer.from_pretrained(repo_id)
        model = MarianMTModel.from_pretrained(repo_id)
        # Best-effort save so the next startup can load offline.
        try:
            os.makedirs(local_path, exist_ok=True)
            tokenizer.save_pretrained(local_path)
            model.save_pretrained(local_path)
            print(f"Cached {repo_id} to {local_path}.")
        except Exception as e:
            print(f"Warning: could not cache {repo_id} locally: {e}")
        return tokenizer, model
    except Exception as e:
        print(f"ERROR: Could not load translation model {repo_id}: {e}")
        return None, None


eng_swa_tokenizer, eng_swa_model = load_translation_model(
    TRANSLATION_MODELS["en-sw"], "en-sw"
)
swa_eng_tokenizer, swa_eng_model = load_translation_model(
    TRANSLATION_MODELS["sw-en"], "sw-en"
)

if eng_swa_model and swa_eng_model:
    print("Translation models loaded successfully.")
else:
    print("WARNING: One or more translation models are unavailable. "
          "Swahili support will be degraded until they load.")


def _translate(text, tokenizer, model, direction):
    """Translate text sentence-by-sentence.

    The previous implementation truncated the whole message at 128 tokens, so
    any multi-sentence text (crisis message, offline fallback reply) lost most
    of its content. Splitting on sentence boundaries first means each piece
    fits comfortably and the full message is translated.
    """
    if not text or not model:
        return ""
    try:
        chunks = [c.strip() for c in re.split(r"(?<=[.!?])\s+", text.strip()) if c.strip()]
        outputs = []
        for chunk in chunks:
            inputs = tokenizer(chunk, return_tensors="pt", padding=True, truncation=True, max_length=512)
            translated = model.generate(**inputs, max_length=512)
            outputs.append(tokenizer.decode(translated[0], skip_special_tokens=True))
        return " ".join(outputs).strip() or text
    except Exception as e:
        print(f"Translation Error ({direction}): {e}")
        return text


def translate_to_swahili(text):
    return _translate(text, eng_swa_tokenizer, eng_swa_model, "En->Sw")


def translate_to_english(text):
    return _translate(text, swa_eng_tokenizer, swa_eng_model, "Sw->En")


# --- Chatbot Logic ---
def clean_up_sentence(sentence):
    sentence_words = nltk.word_tokenize(sentence)
    sentence_words = [lemmatizer.lemmatize(word.lower()) for word in sentence_words]
    return sentence_words


def bow(sentence, words, show_details=True):
    sentence_words = clean_up_sentence(sentence)
    bag = [0] * len(words)
    for s in sentence_words:
        for i, w in enumerate(words):
            if w == s:
                bag[i] = 1
    return np.array(bag)


def predict_class(sentence, model=None):
    p = bow(sentence, words, show_details=False)
    res = model_predict(np.array([p]))[0]

    ERROR_THRESHOLD = 0.1
    results = [[i, r] for i, r in enumerate(res) if r > ERROR_THRESHOLD]
    results.sort(key=lambda x: x[1], reverse=True)

    return_list = []
    for r in results:
        return_list.append({"intent": classes[r[0]], "probability": str(r[1])})
    return return_list


def getResponse(ints, intents_json):
    if ints:
        tag = ints[0]['intent']
        confidence = float(ints[0]['probability'])
        list_of_intents = intents_json['intents']
        result = None
        for i in list_of_intents:
            if i['tag'] == tag:
                result = random.choice(i['responses'])
                break

        if result is None:
            return "I'm not sure I fully understand. Could you tell me more about how you're feeling?"

        if confidence < 0.3:
            result = result + " (If this doesn't address your concern, please tell me more about how you're feeling.)"
        return result
    else:
        return "I'm not sure I fully understand. Could you tell me more about how you're feeling or what's on your mind?"


def get_response_by_intent(intent_tag, intents_json):
    """Get a response for a given intent tag"""
    for intent in intents_json['intents']:
        if intent['tag'] == intent_tag:
            return random.choice(intent['responses'])
    return None


def generate_nlp_response(user_text, sentiment_info):
    """
    Generate a response using NLP-enhanced understanding.
    Combines semantic search, sentiment analysis, and entity recognition.
    """
    best_intent, confidence, method = get_nlp_prediction(user_text)
    print(f" NLP Method: {method}, Intent: {best_intent}, Confidence: {confidence:.3f}")
    print(f" Sentiment: {sentiment_info['sentiment']} (polarity: {sentiment_info['polarity']:.2f})")

    entities = extract_entities(user_text)
    if entities:
        print(f" Entities: {[e['text'] + ' (' + e['label'] + ')' for e in entities]}")

    if best_intent and confidence > 0.25:
        response = get_response_by_intent(best_intent, intents)
        if response:
            if sentiment_info['sentiment'] == 'negative' and sentiment_info['polarity'] < -0.5:
                empathy_prefixes = [
                    "I can sense you're going through a difficult time. ",
                    "I hear that you're struggling. ",
                    "I understand this is hard for you. ",
                ]
                response = random.choice(empathy_prefixes) + response

            if confidence < 0.4:
                response += " Feel free to tell me more if I didn't fully address your concern."

            return response

    if sentiment_info['sentiment'] == 'negative':
        return "I can tell something is troubling you. I'm here to listen. Could you tell me more about what's on your mind?"
    elif sentiment_info['sentiment'] == 'positive':
        return "That's great to hear! Is there anything specific you'd like to talk about today?"
    else:
        return "I'm here to help. Could you tell me more about what you'd like to discuss?"


# --- LLM Configuration (Groq, Gemini, or Ollama) ---
USE_LLM = os.getenv("USE_LLM", "true").lower() == "true"
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "groq").lower()  # "groq", "gemini", or "ollama"

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions"

DEFAULT_HTTP_USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/125.0 Safari/537.36"
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-pro")
GEMINI_CHAT_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5:14b-instruct")
OLLAMA_CHAT_URL = os.getenv("OLLAMA_CHAT_URL", "http://localhost:11434/api/chat")
OLLAMA_TAGS_URL = os.getenv("OLLAMA_TAGS_URL", "http://localhost:11434/api/tags")

LLM_TIMEOUT_SECONDS = int(os.getenv("LLM_TIMEOUT_SECONDS", "45"))
LLM_TEMPERATURE = float(os.getenv("LLM_TEMPERATURE", "0.5"))
LLM_TOP_P = float(os.getenv("LLM_TOP_P", "0.9"))
DEFAULT_RESPONSE_STYLE = os.getenv("RESPONSE_STYLE", "balanced").strip().lower()

MENTAL_HEALTH_SYSTEM_PROMPT = (
    "You are a supportive mental-health assistant for educational and emotional support only. "
    "Use warm, non-judgmental language. Do not diagnose medical conditions, and do not claim to be a therapist or doctor. "
    "Provide practical coping steps (breathing, grounding, journaling, sleep hygiene, social support), and encourage professional help when symptoms persist or worsen. "
    "If user indicates self-harm, suicide, or immediate danger, prioritize safety: advise contacting local emergency services and a trusted person immediately. "
    "Keep answers concise, clear, and actionable."
)

STYLE_INSTRUCTIONS = {
    "balanced": "Give a warm, practical response in about 4-7 sentences with concrete next steps.",
    "concise": "Keep the response brief (2-4 sentences), direct, and practical.",
    "therapeutic": "Use a more reflective, validating tone and include 1-2 grounding or coping exercises.",
}

CRISIS_PATTERNS = [
    # English phrases
    re.compile(r"\b(kill|hurt)\s+myself\b", re.IGNORECASE),
    re.compile(r"\b(end\s+my\s+life|want\s+to\s+die|commit\s+suicide)\b", re.IGNORECASE),
    re.compile(r"\b(no\s+reason\s+to\s+live|better\s+off\s+dead)\b", re.IGNORECASE),
    re.compile(r"\b(i\s+am\s+going\s+to\s+die|i\s+will\s+kill\s+myself)\b", re.IGNORECASE),
    # Swahili phrases
    re.compile(r"\bnataka\s+kufa\b", re.IGNORECASE),
    re.compile(r"\bnitajiua\b", re.IGNORECASE),
    re.compile(r"\bkujiua\b", re.IGNORECASE),
    re.compile(r"\bsiwezi\s+kuendelea\s+kuishi\b", re.IGNORECASE),
]


LANGUAGE_NAMES = {"sw": "Swahili (Kiswahili)", "en": "English"}


def get_style_instruction(style):
    """Return style instruction for prompt tuning."""
    normalized = (style or DEFAULT_RESPONSE_STYLE).strip().lower()
    return STYLE_INSTRUCTIONS.get(normalized, STYLE_INSTRUCTIONS["balanced"])


def get_language_instruction(target_language):
    """Tell the LLM which language to reply in.

    The LLM (e.g. gpt-oss-120b) is multilingual, so for Swahili we ask it to
    reply in Swahili directly instead of round-tripping a long English answer
    through the MarianMT model (which truncates at 128 tokens and can garble or
    drop most of the reply). This is what makes Swahili answers actually work
    on the LLM path.
    """
    name = LANGUAGE_NAMES.get(target_language, "English")
    return f"Write your ENTIRE response in {name}. Do not use any other language."


def contains_crisis_language(raw_text, processing_text):
    """Detect high-risk language using regex, multilingual phrases, and intent confidence."""
    text_candidates = [raw_text or "", processing_text or ""]

    for text in text_candidates:
        for pattern in CRISIS_PATTERNS:
            if pattern.search(text):
                return True

    intent, confidence, _ = get_nlp_prediction(processing_text or "")
    if intent == "suicide" and confidence >= 0.25:
        return True

    return False


def get_crisis_response():
    """Safety-first response for high-risk messages."""
    return (
        "I'm really glad you shared this. You deserve immediate support right now. "
        "If you might act on these thoughts, please call your local emergency number now and reach out to someone you trust who can stay with you. "
        "You can also contact a crisis hotline in your country right away. "
        "If you want, I can help you write a short message to ask for urgent help."
    )


def generate_groq_response(user_text, sentiment_info, response_style=None, target_language="en"):
    """Generate response via Groq API (OpenAI-compatible). Returns None on failure."""
    if not GROQ_API_KEY:
        print("Groq API key not configured.")
        return None

    try:
        style_instruction = get_style_instruction(response_style)
        language_instruction = get_language_instruction(target_language)
        user_prompt = (
            f"User message: {user_text}\n"
            f"Detected sentiment: {sentiment_info['sentiment']} (polarity={sentiment_info['polarity']:.2f}).\n"
            f"Style instruction: {style_instruction}\n"
            f"Language instruction: {language_instruction}\n"
            "Respond with emotional support and practical next steps."
        )
        payload = {
            "model": GROQ_MODEL,
            "messages": [
                {"role": "system", "content": MENTAL_HEALTH_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": LLM_TEMPERATURE,
            "top_p": LLM_TOP_P,
            "max_tokens": 500,
        }
        req = urllib.request.Request(
            GROQ_CHAT_URL,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "User-Agent": DEFAULT_HTTP_USER_AGENT,
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=LLM_TIMEOUT_SECONDS) as response:
            response_text = response.read().decode("utf-8")
            response_data = json.loads(response_text)

        if "choices" in response_data and response_data["choices"]:
            message = response_data["choices"][0].get("message", {})
            content = message.get("content", "").strip()
            return content or None
        return None

    except urllib.error.HTTPError as e:
        error_body = ""
        try:
            error_body = e.read().decode("utf-8", errors="ignore")
        except Exception:
            pass
        print(f"Groq Error: {e}")
        if error_body:
            print(f"Groq Error Body: {error_body}")
        return None
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as e:
        print(f"Groq Error: {e}")
        return None


def generate_gemini_response(user_text, sentiment_info, response_style=None, target_language="en"):
    """Generate response via Google Gemini API. Returns None on failure."""
    if not GEMINI_API_KEY:
        print("Gemini API key not configured.")
        return None

    try:
        style_instruction = get_style_instruction(response_style)
        language_instruction = get_language_instruction(target_language)
        user_prompt = (
            f"User message: {user_text}\n"
            f"Detected sentiment: {sentiment_info['sentiment']} (polarity={sentiment_info['polarity']:.2f}).\n"
            f"Style instruction: {style_instruction}\n"
            f"Language instruction: {language_instruction}\n"
            "Respond with emotional support and practical next steps."
        )
        url = GEMINI_CHAT_URL.format(model=GEMINI_MODEL) + f"?key={GEMINI_API_KEY}"
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": MENTAL_HEALTH_SYSTEM_PROMPT},
                        {"text": user_prompt},
                    ]
                }
            ],
            "generationConfig": {
                "temperature": LLM_TEMPERATURE,
                "topP": LLM_TOP_P,
                "maxOutputTokens": 500,
            },
        }
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "User-Agent": DEFAULT_HTTP_USER_AGENT,
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=LLM_TIMEOUT_SECONDS) as response:
            response_text = response.read().decode("utf-8")
            response_data = json.loads(response_text)

        if "candidates" in response_data and response_data["candidates"]:
            content = response_data["candidates"][0].get("content", {})
            parts = content.get("parts", [])
            if parts:
                return parts[0].get("text", "").strip() or None
        return None

    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, json.JSONDecodeError) as e:
        print(f"Gemini Error: {e}")
        return None


def generate_ollama_response(user_text, sentiment_info, response_style=None, target_language="en"):
    """Generate response via Ollama chat API. Returns None on failure."""
    try:
        style_instruction = get_style_instruction(response_style)
        language_instruction = get_language_instruction(target_language)
        user_prompt = (
            f"User message: {user_text}\n"
            f"Detected sentiment: {sentiment_info['sentiment']} (polarity={sentiment_info['polarity']:.2f}).\n"
            f"Style instruction: {style_instruction}\n"
            f"Language instruction: {language_instruction}\n"
            "Respond with emotional support and practical next steps."
        )
        payload = {
            "model": OLLAMA_MODEL,
            "stream": False,
            "messages": [
                {"role": "system", "content": MENTAL_HEALTH_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            "options": {
                "temperature": LLM_TEMPERATURE,
                "top_p": LLM_TOP_P,
            },
        }
        req = urllib.request.Request(
            OLLAMA_CHAT_URL,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=LLM_TIMEOUT_SECONDS) as response:
            response_text = response.read().decode("utf-8")
            response_data = json.loads(response_text)

        message = response_data.get("message", {})
        content = message.get("content", "").strip()
        return content or None

    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, json.JSONDecodeError) as e:
        print(f"Ollama Error: {e}")
        return None


def generate_llm_response(user_text, sentiment_info, response_style=None, target_language="en"):
    """Generate response via configured LLM provider (Groq, Gemini, or Ollama). Returns None on failure."""
    if LLM_PROVIDER == "groq":
        return generate_groq_response(user_text, sentiment_info, response_style, target_language)
    elif LLM_PROVIDER == "gemini":
        return generate_gemini_response(user_text, sentiment_info, response_style, target_language)
    else:
        return generate_ollama_response(user_text, sentiment_info, response_style, target_language)


def check_groq_status():
    status = {
        "provider": "groq",
        "model": GROQ_MODEL,
        "service_reachable": False,
        "api_key_configured": bool(GROQ_API_KEY),
        "error": None,
    }
    if not GROQ_API_KEY:
        status["error"] = "Groq API key not configured"
        return status
    try:
        payload = {
            "model": GROQ_MODEL,
            "messages": [{"role": "user", "content": "test"}],
            "max_tokens": 10,
        }
        req = urllib.request.Request(
            GROQ_CHAT_URL,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "User-Agent": DEFAULT_HTTP_USER_AGENT,
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            response.read()
        status["service_reachable"] = True
    except Exception as e:
        status["error"] = str(e)
    return status


def check_gemini_status():
    status = {
        "provider": "gemini",
        "model": GEMINI_MODEL,
        "service_reachable": False,
        "api_key_configured": bool(GEMINI_API_KEY),
        "error": None,
    }
    if not GEMINI_API_KEY:
        status["error"] = "Gemini API key not configured"
        return status
    try:
        url = GEMINI_CHAT_URL.format(model=GEMINI_MODEL) + f"?key={GEMINI_API_KEY}"
        payload = {"contents": [{"parts": [{"text": "test"}]}]}
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "User-Agent": DEFAULT_HTTP_USER_AGENT,
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            response.read()
        status["service_reachable"] = True
    except Exception as e:
        status["error"] = str(e)
    return status


def check_ollama_status():
    status = {
        "provider": "ollama",
        "chat_url": OLLAMA_CHAT_URL,
        "tags_url": OLLAMA_TAGS_URL,
        "model": OLLAMA_MODEL,
        "service_reachable": False,
        "model_available": False,
        "error": None,
    }
    try:
        req = urllib.request.Request(OLLAMA_TAGS_URL, method="GET")
        with urllib.request.urlopen(req, timeout=10) as response:
            response_text = response.read().decode("utf-8")
            data = json.loads(response_text)
        models = data.get("models", [])
        names = [m.get("name", "") for m in models]
        status["service_reachable"] = True
        status["model_available"] = any(name.startswith(OLLAMA_MODEL) for name in names)
    except Exception as e:
        status["error"] = str(e)
    return status


# --- Database setup ---
DB_PATH = os.getenv("DATABASE_PATH", "appointments.db")


def init_db():
    """Create the appointments table if it doesn't exist yet.
    This was missing in the original app, which caused /booking to
    crash on a fresh deploy with 'no such table: appointments'."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()


# --- FLASK APP ---
app = Flask(__name__)
app.static_folder = 'static'

# ---------------------------------------------------------------------------
# CORS CONFIGURATION
# ---------------------------------------------------------------------------
# The original app just did CORS(app), which allows every origin. That works
# but is loose for a production app that talks to M-Pesa and stores personal
# data (name/email) via /booking. Instead we explicitly allow:
#   - the deployed Vercel frontend (set via FRONTEND_URL env var)
#   - any Vercel preview deployment for this project (*.vercel.app)
#   - localhost dev servers (Vite default ports)
# and enable credentials so cookies/auth headers can be sent if you add auth
# later. Set FRONTEND_URL in your backend's environment (Render/Railway/etc.)
# to your real Vercel production URL, e.g.:
#   FRONTEND_URL=https://mental-health-chatbot-seven-gold.vercel.app
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://joyhealth.vercel.app")

ALLOWED_ORIGINS = [
    FRONTEND_URL,
    "https://joyhealth.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    re.compile(r"^https://.*\.vercel\.app$"),  # any Vercel preview/prod deployment
]

CORS(
    app,
    resources={r"/*": {"origins": ALLOWED_ORIGINS}},
    supports_credentials=True,
    methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/get")
def get_bot_response():
    userText = request.args.get('msg')
    response_style = request.args.get('style', DEFAULT_RESPONSE_STYLE)

    if not userText:
        return "Please type a message so I can help."

    print(f"\n{'='*50}")
    print(f"Raw Input: {userText}")

    # 1. Detect Language (Swahili vs English)
    detected_language = detect_language(userText)
    print(f"Detected Language: {detected_language}")

    # 2. Prepare text for processing (Must be English for the chatbot model)
    processing_text = userText
    if detected_language == 'sw':
        processing_text = translate_to_english(userText)
        print(f"Translated to English: {processing_text}")

    # 3. NLP Analysis
    sentiment_info = analyze_sentiment(processing_text)

    # 4. Safety gate + response selection.
    #    The LLM replies directly in the user's language (see get_language_instruction),
    #    so its output must NOT be re-translated. The crisis message and the offline
    #    NLP fallback are English, so those are translated to Swahili when needed.
    if contains_crisis_language(userText, processing_text):
        final_response = get_crisis_response()  # English
        needs_translation = True
    else:
        llm_response = None
        if USE_LLM:
            llm_response = generate_llm_response(
                processing_text, sentiment_info, response_style, detected_language
            )
        if llm_response:
            final_response = llm_response       # already in the target language
            needs_translation = False
        else:
            final_response = generate_nlp_response(processing_text, sentiment_info)  # English
            needs_translation = True

    print(f"Bot Response: {final_response}")

    # 5. Translate English (crisis / offline fallback) responses back to Swahili.
    if detected_language == 'sw' and needs_translation:
        final_response = translate_to_swahili(final_response)
        print(f"Translated Response (Sw): {final_response}")

    print(f"{'='*50}\n")
    return final_response


@app.route("/health")
def health_check():
    """Health endpoint for Flask + LLM provider (Groq, Gemini, or Ollama)."""
    if LLM_PROVIDER == "groq":
        llm_status = check_groq_status()
    elif LLM_PROVIDER == "gemini":
        llm_status = check_gemini_status()
    else:
        llm_status = check_ollama_status()

    return jsonify({
        "status": "ok",
        "flask": {"up": True},
        "llm": {
            "enabled": USE_LLM,
            "provider": LLM_PROVIDER,
            **llm_status,
        },
        "response_style": DEFAULT_RESPONSE_STYLE,
        "llm_temperature": LLM_TEMPERATURE,
        "llm_top_p": LLM_TOP_P,
    })


@app.route("/analyze")
def analyze_text():
    """API endpoint to get NLP analysis of text"""
    userText = request.args.get('msg', '')
    if not userText:
        return jsonify({"error": "No text provided"}), 400

    sentiment = analyze_sentiment(userText)
    entities = extract_entities(userText)
    semantic_matches = semantic_search(userText, top_k=3)
    best_intent, confidence, method = get_nlp_prediction(userText)

    return jsonify({
        "input": userText,
        "sentiment": sentiment,
        "entities": entities,
        "semantic_matches": semantic_matches,
        "predicted_intent": {
            "intent": best_intent,
            "confidence": confidence,
            "method": method,
        },
    })


@app.route('/booking', methods=['GET', 'POST'])
def booking():
    if request.method == 'POST':
        # Accept both form posts (legacy HTML) and JSON posts (React frontend)
        data = request.get_json(silent=True) or request.form

        name = (data.get('name') or '').strip()
        email = (data.get('email') or '').strip()
        date = (data.get('date') or '').strip()
        time = (data.get('time') or '').strip()

        if not all([name, email, date, time]):
            error_msg = "All fields (name, email, date, time) are required."
            if request.is_json:
                return jsonify({"success": False, "message": error_msg}), 400
            return f"<h2>Booking Failed</h2>{error_msg}", 400

        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO appointments (name, email, date, time)
            VALUES (?, ?, ?, ?)
        """, (name, email, date, time))
        conn.commit()
        conn.close()

        if request.is_json:
            return jsonify({"success": True, "message": "Booking successful!"})

        return f"""
        <h2>Booking Successful!</h2>
        Name: {name}<br>
        Email: {email}<br>
        Date: {date}<br>
        Time: {time}
        """

    return render_template('booking.html')


@app.route('/bookings_json')
def bookings_json():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM appointments")
    rows = cursor.fetchall()
    conn.close()

    bookings = [
        {"id": r[0], "name": r[1], "email": r[2], "date": r[3], "time": r[4]}
        for r in rows
    ]
    return jsonify(bookings)


@app.route('/view_bookings')
def view_bookings():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM appointments")
    bookings = cursor.fetchall()
    conn.close()
    return render_template('view_bookings.html', bookings=bookings)


def get_mpesa_token():
    consumer_key = os.getenv('MPESA_CONSUMER_KEY')
    consumer_secret = os.getenv('MPESA_CONSUMER_SECRET')
    credentials = base64.b64encode(f"{consumer_key}:{consumer_secret}".encode()).decode()

    response = requests.get(
        'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
        headers={'Authorization': f'Basic {credentials}'},
        timeout=30,
    )
    return response.json().get('access_token')


@app.route('/mpesa/stk_push', methods=['POST'])
def stk_push():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'No JSON body provided.'}), 400

        phone = data.get('phone')
        amount = data.get('amount')

        if not phone or not amount:
            return jsonify({'success': False, 'message': 'phone and amount are required.'}), 400

        # Format phone number — convert 07XX to 2547XX
        if phone.startswith('0'):
            phone = '254' + phone[1:]

        token = get_mpesa_token()
        if not token:
            return jsonify({'success': False, 'message': 'Could not authenticate with M-Pesa.'}), 502

        shortcode = os.getenv('MPESA_SHORTCODE')
        passkey = os.getenv('MPESA_PASSKEY')
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        password = base64.b64encode(f"{shortcode}{passkey}{timestamp}".encode()).decode()

        payload = {
            "BusinessShortCode": shortcode,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": int(amount),
            "PartyA": phone,
            "PartyB": shortcode,
            "PhoneNumber": phone,
            "CallBackURL": os.getenv('MPESA_CALLBACK_URL'),
            "AccountReference": "MindCare Donation",
            "TransactionDesc": "Mental Health Support Donation",
        }

        response = requests.post(
            'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
            json=payload,
            headers={
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json',
            },
            timeout=30,
        )
        result = response.json()

        if result.get('ResponseCode') == '0':
            return jsonify({'success': True, 'message': 'STK Push sent. Check your phone to complete payment.'})
        else:
            return jsonify({'success': False, 'message': result.get('errorMessage', 'Payment request failed.')})

    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/mpesa/callback', methods=['POST'])
def mpesa_callback():
    data = request.get_json()
    print('M-Pesa Callback:', data)
    return jsonify({'ResultCode': 0, 'ResultDesc': 'Success'})


# Make sure the appointments table exists before the app serves any requests.
init_db()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "0") == "1"
    app.run(host="0.0.0.0", port=port, debug=debug)