#!/bin/bash
echo "Installing TrendWise AI Dependencies..."

echo -e "\n[1/3] Setting up Python Backend..."
cd backend/python-backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate

echo "Checking for NVIDIA GPU for CUDA support..."
if command -v nvidia-smi &> /dev/null; then
    echo "NVIDIA GPU detected. Installing PyTorch with CUDA 12.6 support..."
    pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu126
else
    echo "No NVIDIA GPU detected. Proceeding with standard PyTorch installation..."
fi

pip install -r requirements.txt
echo "Downloading Models..."
python3 download_models.py
cd ../..

echo -e "\n[2/3] Setting up Node Backend..."
cd backend/node-backend
npm install
cd ../..

echo -e "\n[3/3] Setting up Frontend..."
cd frontend
npm install
cd ..

echo -e "\nInstallation complete! Make sure to run 'chmod +x start.sh' before running ./start.sh to launch the application."
