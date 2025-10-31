@echo off
echo 🎬 Starting Video Editor Services...

REM Kill any existing processes on these ports
echo 🔄 Cleaning up existing services...
taskkill /F /IM uvicorn.exe >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1

REM Start Python Engine
echo 🚀 Starting Python Engine on port 8000...
cd Engine_video
start "Python Engine" cmd /k "python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
cd ..

REM Wait for Python engine to start
echo ⏳ Waiting for Python Engine to start...
timeout /t 3 >nul

REM Start Node.js Server
echo 🚀 Starting Node.js Server on port 3000...
cd server
start "Node.js Server" cmd /k "npm run dev"
cd ..

REM Wait for server to start
echo ⏳ Waiting for Node.js Server to start...
timeout /t 3 >nul

REM Start Vite Client
echo 🚀 Starting Vite Client on port 5173...
cd client
start "Vite Client" cmd /k "npm run dev"
cd ..

echo.
echo 🎉 All services started!
echo.
echo 📱 Frontend:        http://localhost:5173
echo 🖥️  Backend API:     http://localhost:3000
echo 🎬 Video Engine:    http://localhost:8000
echo.
echo 🔗 Full Video Editor: http://localhost:5173/editor
echo.
echo Services are running in separate windows.
echo Close the individual command windows to stop each service.
pause
