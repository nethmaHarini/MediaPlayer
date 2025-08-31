#!/bin/bash

# Test script to verify installation requirements
echo "🔍 Checking AI Music Separation App Requirements..."
echo "=================================================="
echo ""

# Get the project root directory (parent of scripts directory)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Change to project root for file checks
cd "$PROJECT_ROOT"

ERRORS=0

# Check Python
echo "🐍 Checking Python..."
if command -v python &> /dev/null; then
    PYTHON_VERSION=$(python --version 2>&1)
    echo "   ✅ Found: $PYTHON_VERSION"
else
    echo "   ❌ Python not found in PATH"
    ERRORS=$((ERRORS + 1))
fi

# Check Node.js
echo ""
echo "📦 Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version 2>&1)
    echo "   ✅ Found: Node.js $NODE_VERSION"
else
    echo "   ❌ Node.js not found in PATH"
    ERRORS=$((ERRORS + 1))
fi

# Check npm
echo ""
echo "📦 Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version 2>&1)
    echo "   ✅ Found: npm $NPM_VERSION"
else
    echo "   ❌ npm not found in PATH"
    ERRORS=$((ERRORS + 1))
fi

# Check backend files
echo ""
echo "🔧 Checking backend files..."
if [ -f "backend/app-professional.py" ]; then
    echo "   ✅ Backend Python script found"
else
    echo "   ❌ Backend Python script missing"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "backend/requirements.txt" ]; then
    echo "   ✅ Backend requirements file found"
else
    echo "   ❌ Backend requirements file missing"
    ERRORS=$((ERRORS + 1))
fi

# Check frontend files
echo ""
echo "📱 Checking frontend files..."
if [ -f "package.json" ]; then
    echo "   ✅ Frontend package.json found"
else
    echo "   ❌ Frontend package.json missing"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "app.json" ]; then
    echo "   ✅ Expo app.json found"
else
    echo "   ❌ Expo app.json missing"
    ERRORS=$((ERRORS + 1))
fi

# Summary
echo ""
echo "=================================================="
if [ $ERRORS -eq 0 ]; then
    echo "🎉 All requirements met! Ready to launch."
    echo ""
    echo "To start the app, run from project root:"
    echo "   ./run.sh     (main launcher)"
else
    echo "⚠️  Found $ERRORS issue(s). Please install missing requirements."
    echo ""
    echo "Installation help:"
    echo "• Python: https://python.org/downloads/"
    echo "• Node.js: https://nodejs.org/downloads/"
    echo "• Missing files: Check if you're in the correct directory"
fi
echo "=================================================="
