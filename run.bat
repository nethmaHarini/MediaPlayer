@echo off
echo 🎵 AI Music Separation App - Windows Launcher 🎵
echo ===============================================
echo.

REM Change to the directory where this batch file is located
pushd "%~dp0"
set "PROJECT_DIR=%CD%"

echo Project directory: "%PROJECT_DIR%"
echo Starting application...
echo.

REM Check if Python and Node.js are available
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Python not found! Please install Python 3.8+ and add it to PATH.
    echo Visit: https://python.org/downloads/
    pause
    exit /b 1
)

node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js not found! Please install Node.js 16+ and add it to PATH.
    echo Visit: https://nodejs.org/downloads/
    pause
    exit /b 1
)

echo ✅ Python and Node.js found!
echo.

echo Opening backend server in new terminal...
start "AI Music Backend" cmd /k "cd /d \"%PROJECT_DIR%\" && cd backend && echo Starting Professional AI Backend... && python app-professional.py"

echo.
echo Waiting 3 seconds for backend to initialize...
ping 127.0.0.1 -n 4 >nul

echo.
echo Opening Expo development server in new terminal...
start "Expo Frontend" cmd /k "cd /d \"%PROJECT_DIR%\" && echo Starting Expo Development Server... && npx expo start --tunnel --clear"

echo.
echo Application launch completed!
echo.
pause
