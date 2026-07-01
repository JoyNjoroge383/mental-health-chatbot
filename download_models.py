import os
import requests

def download_file(file_id, filename):
    if os.path.exists(filename):
        print(f"{filename} already exists, skipping.")
        return

    print(f"Downloading {filename}...")
    session = requests.Session()
    url = f"https://drive.google.com/uc?export=download&id={file_id}&confirm=t"
    response = session.get(url, stream=True)

    for key, value in response.cookies.items():
        if key.startswith('download_warning'):
            url = f"https://drive.google.com/uc?export=download&id={file_id}&confirm={value}"
            response = session.get(url, stream=True)
            break

    with open(filename, 'wb') as f:
        for chunk in response.iter_content(32768):
            if chunk:
                f.write(chunk)
    print(f"{filename} downloaded successfully.")

def download_models():
    print("Checking for model files...")

    files = {
        "intents.json": "1E3Arq0UjcDy19jlBItt5lW9GgZHyJ03t",
        "labels.pkl": "1i0RAgOOlz--uP51DEj3yFZ8JDpBY1mEu",
        "model.h5": "1KUzM_3QIqv6QPkdX-e_A0lXA9iLdSkk7",
        "texts.pkl": "1qoOKValeyuokWdI5YRdNbDygyLJC7LPq",
    }

    for filename, file_id in files.items():
        download_file(file_id, filename)

    print("All model files ready!")

if __name__ == "__main__":
    download_models()