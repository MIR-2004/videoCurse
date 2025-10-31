#!/bin/bash

# Video Editor Startup Script
echo "🎬 Starting Video Editor Services..."

# Kill any existing processes on these ports
echo "🔄 Cleaning up existing services..."
pkill -f "uvicorn.*8000" 2>/dev/null || true
pkill -f "node.*3000" 2>/dev/null || true
pkill -f "vite.*5173" 2>/dev/null || true

# Function to start services in background
start_service() {
    local name=$1
    local command=$2
    local dir=$3
    local port=$4
    
    echo "🚀 Starting $name on port $port..."
    cd "$dir"
    $command &
    local pid=$!
    echo "   ✅ $name started with PID $pid"
    cd - > /dev/null
}

# Start Python Engine
start_service "Python Engine" "python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload" "Engine_video" "8000"

# Wait for Python engine to start
echo "⏳ Waiting for Python Engine to start..."
sleep 3

# Start Node.js Server
start_service "Node.js Server" "npm run dev" "server" "3000"

# Wait for server to start
echo "⏳ Waiting for Node.js Server to start..."
sleep 3

# Start Vite Client
start_service "Vite Client" "npm run dev" "client" "5173"

echo ""
echo "🎉 All services started!"
echo ""
echo "📱 Frontend:        http://localhost:5173"
echo "🖥️  Backend API:     http://localhost:3000"
echo "🎬 Video Engine:    http://localhost:8000"
echo ""
echo "🔗 Full Video Editor: http://localhost:5173/editor"
echo ""
echo "To stop all services, run: pkill -f 'uvicorn|node.*3000|vite'"
echo ""
echo "📊 Service Status:"
curl -s http://localhost:8000/health > /dev/null && echo "   ✅ Python Engine - Running" || echo "   ❌ Python Engine - Not responding"
curl -s http://localhost:3000/api/upload > /dev/null && echo "   ✅ Node.js Server - Running" || echo "   ❌ Node.js Server - Not responding"
curl -s http://localhost:5173 > /dev/null && echo "   ✅ Vite Client - Running" || echo "   ❌ Vite Client - Not responding"
