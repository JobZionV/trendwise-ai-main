@echo off
echo Starting TrendWise AI...

echo.
echo ==============================================
echo Starting Python Backend (Port 8000)...
echo ==============================================
cd backend\python-backend

if not exist "models\trendwise_topic_model.pth" (
    echo [ERROR] The AI Models are missing!
    echo Please run install.bat first to download the necessary models from HuggingFace.
    pause
    exit /b 1
)

start cmd /k "call venv\Scripts\activate && uvicorn app:app --host 0.0.0.0 --port 8000 --reload"
cd ..\..

echo.
echo ==============================================
echo Starting Node Backend (Port 5000)...
echo ==============================================
cd backend\node-backend
start cmd /k "npm start"
cd ..\..

echo.
echo ==============================================
echo Starting Frontend (Vite)...
echo ==============================================
cd frontend
start cmd /k "npm run dev"
cd ..

echo.
echo All services have been launched in separate windows!
echo Close this window to keep them running, or close the individual windows to stop them.
