@echo off
echo Installing TrendWise AI Dependencies...

echo.
echo [1/3] Setting up Python Backend...
cd backend\python-backend
if not exist venv (
    python -m venv venv
)
call venv\Scripts\activate

echo Checking for NVIDIA GPU for CUDA support...
nvidia-smi >nul 2>&1
if %errorlevel% equ 0 (
    echo NVIDIA GPU detected. Installing PyTorch with CUDA 12.6 support...
    pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu126
) else (
    echo No NVIDIA GPU detected. Proceeding with standard PyTorch installation...
)

pip install -r requirements.txt
echo Downloading Models...
python download_models.py
cd ..\..

echo.
echo [2/3] Setting up Node Backend...
cd backend\node-backend
call npm install
cd ..\..

echo.
echo [3/3] Setting up Frontend...
cd frontend
call npm install
cd ..

echo.
echo Installation complete! You can now run start.bat to launch the application.
pause
