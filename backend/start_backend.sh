#!/bin/bash

echo "🎵 AI Music Separation Backend Installer & Runner"
echo "=================================================="
echo ""

# Check if Python is installed
if ! command -v python &> /dev/null; then
    echo "❌ Python is not installed. Please install Python 3.8+ first."
    echo "   Download from: https://www.python.org/downloads/"
    exit 1
fi

echo "✅ Python found: $(python --version)"
echo ""

# Navigate to backend directory
cd "$(dirname "$0")"

echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
else
    echo "❌ Failed to install dependencies. Please check your Python/pip installation."
    exit 1
fi

echo ""
echo "🚀 Starting AI Music Separation Backend..."
echo "📡 Server will be available at: http://localhost:5000"
echo "🔗 Health check: http://localhost:5000/health"
echo "🎤 Separation endpoint: http://localhost:5000/separate"
echo ""
echo "⏹️  Press Ctrl+C to stop the server"
echo "=================================================="
echo ""

# Start the Flask server
python app.py
