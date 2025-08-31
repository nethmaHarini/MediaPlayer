#!/bin/bash

# AI Music Separation App - Main Launcher
# This is the single entry point for running the application

echo "🎵 AI Music Separation App 🎵"
echo "=============================="
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPTS_DIR="$SCRIPT_DIR/scripts"

# Function to check if we're on Windows
is_windows() {
    [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]] || [[ -n "$WINDIR" ]]
}

echo "🔍 Step 1: Checking requirements..."
echo "-----------------------------------"

# Run requirements check
if [ -f "$SCRIPTS_DIR/check-requirements.sh" ]; then
    chmod +x "$SCRIPTS_DIR/check-requirements.sh"
    bash "$SCRIPTS_DIR/check-requirements.sh"
    
    # Check if requirements check passed
    if [ $? -ne 0 ]; then
        echo ""
        echo "❌ Requirements check failed. Please install missing dependencies."
        exit 1
    fi
else
    echo "⚠️  Requirements checker not found, proceeding anyway..."
fi

echo ""
echo "🚀 Step 2: Launching application..."
echo "-----------------------------------"

# Launch application based on environment
if is_windows; then
    echo "✅ Windows environment detected"
    echo "🚀 Using Git Bash launcher with Windows compatibility"
    echo ""
    
    echo "Starting AI Music Separation App in separate terminals..."
    echo ""
    
    # Create temporary batch files for Windows terminals
    TEMP_BACKEND="$SCRIPT_DIR/temp-backend.bat"
    TEMP_FRONTEND="$SCRIPT_DIR/temp-frontend.bat"
    
    # Create temporary backend launcher
    cat > "$TEMP_BACKEND" << 'EOF'
@echo off
cd /d %~dp0
cd backend
echo Starting Professional AI Backend...
python app-professional.py
pause
EOF
    
    # Create temporary frontend launcher
    cat > "$TEMP_FRONTEND" << 'EOF'
@echo off
cd /d %~dp0
echo Starting Expo Development Server...
npx expo start --tunnel --clear
pause
EOF
    
    # Convert to Windows paths and start
    BACKEND_WIN=$(cygpath -w "$TEMP_BACKEND")
    FRONTEND_WIN=$(cygpath -w "$TEMP_FRONTEND")
    
    echo "Opening backend server in new terminal..."
    cmd.exe //c start "AI Music Backend" cmd //k "$BACKEND_WIN"
    
    echo ""
    echo "Waiting 3 seconds for backend to initialize..."
    sleep 3
    
    echo ""
    echo "Opening Expo development server in new terminal..."
    cmd.exe //c start "Expo Frontend" cmd //k "$FRONTEND_WIN"
    
    # Clean up temp files after a delay
    (sleep 10 && rm -f "$TEMP_BACKEND" "$TEMP_FRONTEND") &
    
else
    echo "✅ Unix/Linux environment detected"
    echo "🚀 Using Unix launcher"
    echo ""
    
    echo "Starting AI Music Separation App in separate terminals..."
    echo ""
    
    # Try different terminal emulators for Unix/Linux
    if command -v gnome-terminal &> /dev/null; then
        TERMINAL_CMD="gnome-terminal"
    elif command -v xterm &> /dev/null; then
        TERMINAL_CMD="xterm"
    elif command -v konsole &> /dev/null; then
        TERMINAL_CMD="konsole"
    elif command -v terminator &> /dev/null; then
        TERMINAL_CMD="terminator"
    else
        echo "No suitable terminal emulator found. Please install gnome-terminal, xterm, konsole, or terminator."
        exit 1
    fi
    
    echo "Opening backend server in new terminal..."
    if [[ "$TERMINAL_CMD" == "gnome-terminal" ]]; then
        gnome-terminal --title="AI Music Backend" --working-directory="$SCRIPT_DIR/backend" -- bash -c "echo 'Starting Professional AI Backend...' && python app-professional.py; exec bash" &
    elif [[ "$TERMINAL_CMD" == "xterm" ]]; then
        xterm -title "AI Music Backend" -e "cd '$SCRIPT_DIR/backend' && echo 'Starting Professional AI Backend...' && python app-professional.py; bash" &
    elif [[ "$TERMINAL_CMD" == "konsole" ]]; then
        konsole --new-tab --workdir "$SCRIPT_DIR/backend" -e bash -c "echo 'Starting Professional AI Backend...' && python app-professional.py; exec bash" &
    elif [[ "$TERMINAL_CMD" == "terminator" ]]; then
        terminator --new-tab --working-directory="$SCRIPT_DIR/backend" -e "bash -c 'echo Starting Professional AI Backend... && python app-professional.py; exec bash'" &
    fi
    
    echo ""
    echo "Waiting 3 seconds for backend to initialize..."
    sleep 3
    
    echo ""
    echo "Opening Expo development server in new terminal..."
    if [[ "$TERMINAL_CMD" == "gnome-terminal" ]]; then
        gnome-terminal --title="Expo Frontend" --working-directory="$SCRIPT_DIR" -- bash -c "echo 'Starting Expo Development Server...' && npx expo start --tunnel --clear; exec bash" &
    elif [[ "$TERMINAL_CMD" == "xterm" ]]; then
        xterm -title "Expo Frontend" -e "cd '$SCRIPT_DIR' && echo 'Starting Expo Development Server...' && npx expo start --tunnel --clear; bash" &
    elif [[ "$TERMINAL_CMD" == "konsole" ]]; then
        konsole --new-tab --workdir "$SCRIPT_DIR" -e bash -c "echo 'Starting Expo Development Server...' && npx expo start --tunnel --clear; exec bash" &
    elif [[ "$TERMINAL_CMD" == "terminator" ]]; then
        terminator --new-tab --working-directory="$SCRIPT_DIR" -e "bash -c 'echo Starting Expo Development Server... && npx expo start --tunnel --clear; exec bash'" &
    fi
fi

echo ""
echo "🎉 Application launch completed!"
echo "================================"
echo ""
echo "📋 What's running:"
echo "• Backend API: http://localhost:5000"
echo "• Frontend: Check QR code in Expo terminal"
echo ""
echo "💡 Tips:"
echo "• Each service runs in its own terminal window"
echo "• Press Ctrl+C in each terminal to stop services"
echo "• Check terminal windows for logs and status"
