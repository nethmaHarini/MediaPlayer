@echo off
echo 🚀 Starting AI Music Separation Backend...
echo.

cd /d "%~dp0"

echo 📦 Installing Python dependencies...
pip install -r requirements.txt

echo.
echo 🎵 Starting Spleeter AI Backend Server...
echo 📡 Server will be available at: http://localhost:5000
echo 🔗 Health check: http://localhost:5000/health
echo 🎤 Separation endpoint: http://localhost:5000/separate
echo.
echo ⏹️  Press Ctrl+C to stop the server
echo.

python app.py

pause
