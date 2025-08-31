@echo off
echo 🚀 Starting FREE Demo Backend (No AI dependencies required)...
echo.

cd /d "%~dp0"

echo 📦 Installing minimal Python dependencies...
pip install -r requirements-demo.txt

echo.
echo 🎭 Starting Simple Demo Backend Server...
echo 📡 Server will be available at: http://localhost:5000
echo 🔗 Health check: http://localhost:5000/health
echo 🎤 Demo separation endpoint: http://localhost:5000/separate
echo.
echo ⚠️  Note: This creates demo tracks (copies) for testing the UI
echo ✨ For real AI separation, use start_backend.bat instead
echo.
echo ⏹️  Press Ctrl+C to stop the server
echo.

python app-simple.py

pause
