#!/bin/bash
echo "Starting TrendWise AI..."

# Start python backend in background
echo -e "\nStarting Python Backend (Port 8000)..."
cd backend/python-backend

if [ ! -f "models/trendwise_topic_model.pth" ]; then
    echo -e "\n[ERROR] The AI Models are missing!"
    echo "Please run ./install.sh first to download the necessary models from HuggingFace."
    exit 1
fi

source venv/bin/activate
uvicorn app:app --host 0.0.0.0 --port 8000 --reload &
PYTHON_PID=$!
cd ../..

# Start node backend in background
echo -e "\nStarting Node Backend (Port 5000)..."
cd backend/node-backend
npm start &
NODE_PID=$!
cd ../..

# Start frontend in background
echo -e "\nStarting Frontend (Vite)..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo -e "\n=============================================="
echo "All services started! TrendWise AI is running."
echo "Press Ctrl+C at any time to softly kill all 3 services."
echo "=============================================="

# Trap Ctrl+C to kill all background processes
trap "echo -e '\nStopping services...'; kill $PYTHON_PID $NODE_PID $FRONTEND_PID; exit" SIGINT SIGTERM

# Wait for background processes to keep script running
wait
