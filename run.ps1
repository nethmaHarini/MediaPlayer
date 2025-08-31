# Simple PowerShell launcher for AI Music Separation App
Write-Host "🎵 AI Music Separation App - PowerShell Launcher 🎵" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green
Write-Host ""

# Get the current directory (should be project root)
$ProjectDir = Get-Location

Write-Host "Project directory: $ProjectDir" -ForegroundColor Cyan
Write-Host ""

# Check if Python and Node.js are available
try {
    $pythonVersion = python --version 2>$null
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found! Please install Python 3.8+ and add it to PATH." -ForegroundColor Red
    Write-Host "Visit: https://python.org/downloads/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

try {
    $nodeVersion = node --version 2>$null
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found! Please install Node.js 16+ and add it to PATH." -ForegroundColor Red
    Write-Host "Visit: https://nodejs.org/downloads/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Opening backend server in new terminal..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ProjectDir\backend'; Write-Host 'Starting Professional AI Backend...' -ForegroundColor Green; python app-professional.py" -WindowStyle Normal

Write-Host ""
Write-Host "Waiting 3 seconds for backend to initialize..." -ForegroundColor Cyan
Start-Sleep 3

Write-Host ""
Write-Host "Opening Expo development server in new terminal..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ProjectDir'; Write-Host 'Starting Expo Development Server...' -ForegroundColor Green; npx expo start --tunnel --clear" -WindowStyle Normal

Write-Host ""
Write-Host "🎉 Application launch completed!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 What's running:" -ForegroundColor White
Write-Host "• Backend API: http://localhost:5000" -ForegroundColor Cyan
Write-Host "• Frontend: Check QR code in Expo terminal" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor White
Write-Host "• Each service runs in its own terminal window" -ForegroundColor Gray
Write-Host "• Press Ctrl+C in each terminal to stop services" -ForegroundColor Gray
Write-Host "• Check terminal windows for logs and status" -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Yellow
Read-Host
