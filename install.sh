#!/bin/bash
echo "Installing TrendWise AI Dependencies..."

echo -e "\n[1/3] Setting up Python Backend..."
cd backend/python-backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
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
