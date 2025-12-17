#!/bin/bash

# MoneyMinder Run Script
echo "=================================================="
echo "MoneyMinder - Starting Application"
echo "=================================================="

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Shutting down MoneyMinder..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start Backend
echo "Starting Backend API..."
cd backend
source venv/bin/activate
python app.py &
BACKEND_PID=$!
cd ..

sleep 3

# Check if backend started successfully
if ps -p $BACKEND_PID > /dev/null; then
    echo "✓ Backend running on http://localhost:5000"
else
    echo "❌ Failed to start backend"
    exit 1
fi

# Start Frontend
echo "Starting Frontend..."
cd frontend

# Kill any existing process on port 8080
lsof -ti:8080 | xargs kill -9 2>/dev/null || true
sleep 1

# Check if Python's http.server is available
if command -v python3 &> /dev/null; then
    python3 -m http.server 8080 &
    FRONTEND_PID=$!
    sleep 2
    
    if ps -p $FRONTEND_PID > /dev/null; then
        echo "✓ Frontend running on http://localhost:8080"
    else
        echo "❌ Failed to start frontend"
        kill $BACKEND_PID
        exit 1
    fi
else
    echo "❌ Python3 not found"
    kill $BACKEND_PID
    exit 1
fi

cd ..

echo ""
echo "=================================================="
echo "MoneyMinder is running! 🚀"
echo "=================================================="
echo ""
echo "Backend API: http://localhost:5000"
echo "Frontend:    http://localhost:8080"
echo ""
echo "Demo Account:"
echo "  Email:    john.doe@example.com"
echo "  Password: Demo@2024"
echo ""
echo "Press Ctrl+C to stop all services"
echo "=================================================="

# Wait for user interrupt
wait
