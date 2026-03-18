@echo off
echo Installing TrendWise AI Dependencies...

echo.
echo [1/3] Setting up Python Backend...
cd backend\python-backend
if not exist venv (
    python -m venv venv
)
call venv\Scripts\activate
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
