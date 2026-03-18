import os
from huggingface_hub import snapshot_download

def download_models():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    models_dir = os.path.join(base_dir, "models")
    
    print(f"Downloading TrendWise AI models to: {models_dir}")
    print("Depending on your internet connection, this may take a few minutes...")
    
    # Download the repository JobZionV/Trendwise-AI directly into the models folder
    snapshot_download(
        repo_id="JobZionV/Trendwise-AI",
        local_dir=models_dir,
        local_dir_use_symlinks=False # Ensure actual files are downloaded, not symlinks
    )
    
    print("Model download complete!")

if __name__ == "__main__":
    download_models()
