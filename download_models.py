import os
import shutil
from huggingface_hub import hf_hub_download

REPO_ID = "Tamara254/mindcare-models"
FILES = ["model.h5", "texts.pkl", "labels.pkl", "intents.json"]
DEST_DIR = os.path.dirname(os.path.abspath(__file__))  # saves next to this script

def download_models(force=False):
    for filename in FILES:
        local_path = os.path.join(DEST_DIR, filename)
        if os.path.exists(local_path) and not force:
            print(f"{filename} already exists. Skipping.")
            continue
        try:
            print(f"Downloading {filename} from Hugging Face...")
            cached_path = hf_hub_download(repo_id=REPO_ID, filename=filename)
            shutil.copy(cached_path, local_path)
            print(f"Saved to {local_path}")
        except Exception as e:
            print(f"Error downloading {filename}: {e}")

if __name__ == "__main__":
    download_models()
