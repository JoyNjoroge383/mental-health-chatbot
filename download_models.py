import os
import gdown

def download_models():
    print("Checking for model files...")

    files = {
        "intents.json": "1E3Arq0UjcDy19jlBItt5lW9GgZHyJ03t",
        "labels.pkl": "1i0RAgOOlz--uP51DEj3yFZ8JDpBY1mEu",
        "model.h5": "1KUzM_3QIqv6QPkdX-e_A0lXA9iLdSkk7",
        "texts.pkl": "1qoOKValeyuokWdI5YRdNbDygyLJC7LPq",
    }

    for filename, file_id in files.items():
        if not os.path.exists(filename):
            print(f"Downloading {filename}...")
            gdown.download(f"https://drive.google.com/uc?id={file_id}", filename, quiet=False)
        else:
            print(f"{filename} already exists, skipping.")

    models_dir = "models"
    if not os.path.exists(models_dir):
        print("Downloading models folder...")
        gdown.download_folder(
            f"https://drive.google.com/drive/folders/10_cG_r_iCBVTpI7hfxV2ucTqFX4EFeMF",
            output=models_dir,
            quiet=False
        )
    else:
        print("models folder already exists, skipping.")

    print("All model files ready!")

if __name__ == "__main__":
    download_models()