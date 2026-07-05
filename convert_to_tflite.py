"""One-time conversion of the trained Keras model (model.h5) -> TFLite (model.tflite).

Run this locally on a machine that has TensorFlow installed:

    python convert_to_tflite.py

The Flask app (app.py) then loads only `model.tflite` through a lightweight
TFLite runtime at inference time, so `tensorflow-cpu` (~350 MB) is no longer a
deployment dependency. Re-run this only when the model is retrained.

IMPORTANT: this deliberately does NOT set `converter.optimizations =
[tf.lite.Optimize.DEFAULT]`. That flag enables post-training (dynamic-range)
quantization, which emits newer TFLite ops (e.g. FULLY_CONNECTED version 12)
that older/lightweight runtimes such as tflite-runtime (PyPI tops out at
2.14.0) don't know how to read - that mismatch is what causes:
    "Didn't find op for builtin opcode 'FULLY_CONNECTED' version '12'."
Keeping the model float32 (no quantization) avoids that op version entirely.
"""
import os
import tempfile
import numpy as np
import tensorflow as tf

SRC = "model.h5"
DST = "model.tflite"


def convert():
    if not os.path.exists(SRC):
        raise SystemExit(f"{SRC} not found. Run `python download_models.py` first.")

    print(f"Loading {SRC} ...")
    model = tf.keras.models.load_model(SRC, compile=False)

    # Prefer the direct Keras -> TFLite path. On some Keras 3 / TF combos that
    # path is unsupported, so fall back to exporting a SavedModel first.
    try:
        print("Converting via from_keras_model ...")
        converter = tf.lite.TFLiteConverter.from_keras_model(model)
        tflite_model = converter.convert()
    except Exception as e:
        print(f"from_keras_model failed ({e}); falling back to SavedModel export ...")
        with tempfile.TemporaryDirectory() as tmp:
            saved_dir = os.path.join(tmp, "saved_model")
            model.export(saved_dir)  # Keras 3 SavedModel export
            converter = tf.lite.TFLiteConverter.from_saved_model(saved_dir)
            tflite_model = converter.convert()

    with open(DST, "wb") as f:
        f.write(tflite_model)
    print(f"Wrote {DST} ({os.path.getsize(DST) / 1024:.1f} KB)")

    # --- Sanity check: interpreter loads and produces the same output as Keras ---
    interp = tf.lite.Interpreter(model_path=DST)
    interp.allocate_tensors()
    inp = interp.get_input_details()[0]
    out = interp.get_output_details()[0]
    print(f"Input:  shape={list(inp['shape'])} dtype={np.dtype(inp['dtype']).name}")
    print(f"Output: shape={list(out['shape'])} dtype={np.dtype(out['dtype']).name}")

    n_features = int(inp["shape"][-1])
    sample = np.zeros((1, n_features), dtype=inp["dtype"])
    sample[0, 0] = 1.0  # arbitrary non-empty bag-of-words vector

    interp.set_tensor(inp["index"], sample)
    interp.invoke()
    tflite_out = interp.get_tensor(out["index"])[0]
    keras_out = model.predict(sample, verbose=0)[0]

    max_diff = float(np.max(np.abs(tflite_out - keras_out)))
    print(f"Max |tflite - keras| on sample: {max_diff:.2e}")
    if max_diff > 1e-4:
        print("WARNING: outputs diverge more than expected - inspect the model.")
    else:
        print("OK: TFLite output matches Keras output.")


if __name__ == "__main__":
    convert()
