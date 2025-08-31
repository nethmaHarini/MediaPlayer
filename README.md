# 🎵 AI Music Separation & Player App

A professional React Native music player with advanced AI-powered source separation capabilities. Load any song and separate it into individual vocal and instrumental tracks with studio-quality results.

## ✨ Key Features

### 🎤 **Voice-Preserving Vocal Isolation**

- **Ultra-clean vocal extraction** with minimal music bleed
- **Complete vocal preservation** - no vocal parts lost
- **Advanced ICA + Spectral Analysis** for professional results
- **Voice-first processing** that prioritizes vocal content

### 🎛️ **Professional Track Separation**

- **5 Separated Tracks**: Vocals, Accompaniment, Bass, Drums, Other
- **Studio-grade processing** with professional EQ and dynamics
- **Real-time mixing** with individual volume controls
- **High-quality audio** with proper normalization

### 📱 **Enhanced Music Player**

- **Smart song title extraction** from file names
- **Automatic separation reset** when loading new songs
- **Safe audio management** with proper cleanup
- **Intuitive waveform display** and controls

### 🔧 **Professional Backend**

- **Multi-trial ICA** for optimal source selection
- **Gentle spectral processing** to preserve audio quality
- **Voice-friendly noise gating** and cleanup
- **Sample rate adaptive** algorithms

## 🚀 Quick Start

### 🎯 Single Command Launch (Recommended)

Choose the best option for your environment:

```bash
# Unix/Linux/Mac/Git Bash users (most common)
chmod +x run.sh
./run.sh
```

```cmd
# Windows users (Command Prompt)
run.bat
```

```powershell
# Windows users (PowerShell)
./run.ps1
```

**Windows Users:** You can also double-click `run.bat` for a GUI experience!

> **💡 Tip:** The `run.sh` script works perfectly in Git Bash on Windows and includes advanced Windows compatibility features.

That's it! The script will:

- ✅ Check all requirements (Python 3.8+, Node.js 16+, project files)
- ✅ Detect your environment (Windows, Linux, Mac, Git Bash)
- ✅ Start backend and frontend in separate terminals automatically
- ✅ Provide clear status updates and service URLs
- ✅ Handle all path issues automatically (including spaces in directory names)
- ✅ Create optimized launch configurations for your platform

### 🔍 What Happens When You Run `./run.sh`

**Step 1: Requirements Check**

- Verifies Python 3.8+ is installed
- Checks Node.js 16+ availability
- Confirms all project files are present
- Reports any missing dependencies

**Step 2: Smart Environment Detection**

- **Git Bash on Windows**: Uses advanced cross-platform script with Windows compatibility
- **Windows Command Prompt**: Uses optimized batch file with dynamic path handling
- **Windows PowerShell**: Uses PowerShell script with execution policy management
- **Linux/Mac**: Uses native Unix shell launcher
- **Automatic Fallback**: Detects best available method for your system

**Step 3: Service Launch**

- Opens backend in dedicated terminal: "AI Music Backend"
- Opens frontend in separate terminal: "Expo Frontend"
- Provides clear status updates and service URLs

### Option 2: Manual Setup (For Development)

**Terminal 1 - Backend:**

```bash
cd backend
pip install -r requirements.txt
python app-professional.py
```

**Terminal 2 - Frontend:**

```bash
npm install
npx expo start --tunnel --clear
```

### Start Script Benefits

- ✅ **Single entry point** - just run `./run.sh` (works everywhere!)
- ✅ **Automatic requirements checking** - Python 3.8+, Node.js 16+, project files
- ✅ **Smart environment detection** - optimal method for your platform
- ✅ **Separate terminal monitoring** - dedicated windows for backend and frontend
- ✅ **Universal cross-platform support** - Windows, Linux, Mac, Git Bash, WSL
- ✅ **Bulletproof path handling** - handles spaces and special characters
- ✅ **Professional developer experience** - clear status messages and guidance
- ✅ **Minimal, organized structure** - clean file organization, maximum functionality

## 📋 Script Structure

```
MediaPlayer/
├── run.sh                     # 🎯 MAIN LAUNCHER (Unix/Linux/Mac/Git Bash)
├── run.bat                    # 🎯 MAIN LAUNCHER (Windows - Command Prompt)
├── run.ps1                    # 🎯 MAIN LAUNCHER (Windows - PowerShell)
└── scripts/                   # Internal utilities
    └── check-requirements.sh  # Prerequisites verification
```

**💡 You only need to run one of the main launchers - everything else is managed automatically!**

## ⚡ Quick Commands Summary

| Action            | Command                         | Platform                     |
| ----------------- | ------------------------------- | ---------------------------- |
| **🎯 Start App**  | `./run.sh`                      | Unix/Linux/Mac/Git Bash      |
| **🎯 Start App**  | `run.bat` or double-click       | Windows (Command Prompt/GUI) |
| **🎯 Start App**  | `./run.ps1`                     | Windows (PowerShell)         |
| **🔍 Check Only** | `scripts/check-requirements.sh` | All platforms (manual check) |

### ✨ What Makes This Better

- **🎯 Single Entry Point**: One script (`run.sh`) works everywhere - Git Bash, Linux, Mac, WSL
- **🔧 Intelligent Auto-Management**: Detects your environment and uses the best launch method
- **📁 Clean, Minimal Organization**: Only essential scripts, maximum functionality
- **🌐 True Universal Compatibility**: Tested on Windows, Mac, Linux, Git Bash, WSL
- **🛡️ Bulletproof Reliability**: Comprehensive error checking and robust path handling
- **🎨 Professional User Experience**: Clear status messages, helpful guidance, and smooth workflow

## 🔧 Troubleshooting

### Quick Solutions

**Most Common Issues:**

1. **For any platform - use the main launcher:**

   ```bash
   # Unix/Linux/Mac/Git Bash
   chmod +x run.sh
   ./run.sh

   # Windows (alternative - double-click)
   run.bat
   ```

2. **If "The system cannot find the path specified" error occurs:**

   ```bash
   # Check if you're in the correct directory
   pwd  # Should show the MediaPlayer project root

   # Make sure Python and Node.js are in your PATH
   python --version
   node --version

   # The latest scripts handle all path issues automatically
   ./run.sh    # For Git Bash/Unix
   run.bat     # For Windows Command Prompt
   ```

3. **If the main script doesn't work:**

   ````bash
   # For PowerShell execution policy issues (Windows)
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

   # Then run the main launcher
   ./run.sh

   # Alternative: Run requirements check manually
   chmod +x scripts/check-requirements.sh
   scripts/check-requirements.sh
   ```4. **Manual fallback method:**

   ```bash
   # Terminal 1 - Backend
   cd backend
   python app-professional.py

   # Terminal 2 - Frontend (new terminal, from project root)
   npx expo start --tunnel --clear
   ````

### Advanced Troubleshooting

- **Path with spaces:** ✅ **FIXED** - All scripts now use robust path handling for directories with spaces
- **PowerShell execution policy:** Run `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` if needed
- **Permission issues:** Run `chmod +x run.sh` on Unix systems
- **Missing dependencies:** Scripts check requirements automatically and provide clear error messages
- **Script organization:** All launch scripts are now optimized and minimal for better organization

### Service URLs After Startup

- **Backend API:** http://localhost:5000
- **Frontend:** Check QR code in the Expo terminal for mobile testing
- **Metro Bundler:** http://localhost:8081 (automatic)

## 📂 Project Structure

```
MediaPlayer/
├── app/                     # React Native app screens
│   ├── (tabs)/             # Tab navigation screens
│   │   ├── index.tsx       # Player tab with smart file handling
│   │   ├── separation.tsx  # AI separation with auto-reset
│   │   └── settings.tsx    # App configuration
│   └── _layout.tsx         # App layout and navigation
├── components/             # Reusable UI components
│   ├── TrackSeparationView.tsx  # Individual track controls
│   ├── SeparationProgress.tsx   # Processing progress
│   ├── WaveformView.tsx        # Audio waveform display
│   └── VolumeSlider.tsx        # Enhanced volume controls
├── contexts/               # Global state management
│   ├── AudioContext.tsx    # Audio playback state
│   └── SettingsContext.tsx # App settings
├── services/               # API and processing services
│   ├── AudioService.ts     # Audio file handling
│   └── ChordAnalyzer.ts   # Music analysis
├── backend/                # Professional AI backend
│   └── app-professional.py # Voice-preserving separation API
├── utils/                  # Utility functions
│   └── AudioUtils.ts      # Audio processing helpers
├── run.sh                 # 🎯 MAIN LAUNCHER (Unix/Linux/Mac/Git Bash)
├── run.bat                # 🎯 MAIN LAUNCHER (Windows - Command Prompt)
├── run.ps1                # 🎯 MAIN LAUNCHER (Windows - PowerShell)
├── scripts/               # Internal utilities
│   └── check-requirements.sh  # Prerequisites verification
└── README.md              # This file
```

## 🎯 How It Works

### 1. **Load Audio**

- Select any audio file (MP3, WAV, etc.)
- Smart title extraction from filenames
- Automatic format detection and validation

### 2. **AI Separation**

- Professional voice-preserving algorithms
- Multi-stage spectral analysis
- Real-time progress tracking
- Studio-quality output

### 3. **Mix & Control**

- Individual track volume controls
- Mute/unmute specific instruments
- Real-time audio mixing
- Waveform visualization

### 4. **Export & Save**

- Download separated tracks
- Multiple format support
- Custom save locations
- High-quality audio output

## 🔬 Technical Specifications

### **AI Processing Pipeline**

1. **Multi-trial ICA** - Multiple attempts for optimal source separation
2. **Advanced vocal detection** - Comprehensive vocal confidence scoring
3. **Gentle spectral subtraction** - Preserves vocal content while removing music
4. **Voice-friendly gating** - Protects quiet vocal parts
5. **Professional EQ** - Studio-grade frequency processing

### **Audio Quality**

- **Sample Rate Adaptive**: Works with any audio sample rate
- **Professional Normalization**: -18 LUFS target with proper headroom
- **Voice Preservation**: Prioritizes vocal content over aggressive separation
- **Studio Processing**: Professional EQ curves and dynamics

### **Smart Features**

- **Automatic cleanup** when switching songs
- **Safe audio management** with proper resource handling
- **Error resilience** with graceful fallbacks
- **Real-time monitoring** with detailed logging

## 🛠️ Backend Dependencies

```python
# Core audio processing
librosa>=0.10.0          # Advanced audio analysis
soundfile>=0.12.0        # Audio file I/O
numpy>=1.24.0           # Numerical computing
scipy>=1.10.0           # Signal processing

# Machine learning
scikit-learn>=1.3.0     # ICA and ML algorithms

# Web framework
flask>=2.3.0            # API server
flask-cors>=4.0.0       # Cross-origin support

# Utilities
werkzeug>=2.3.0         # WSGI utilities
```

## 🎵 Supported Formats

**Input:** MP3, WAV, FLAC, M4A, OGG  
**Output:** WAV, MP3 (configurable)  
**Quality:** Up to 48kHz/24-bit processing

## 📱 Mobile App Features

### **Player Tab**

- Smart file picker with proper title extraction
- Enhanced playback controls
- Automatic audio management
- Real-time position tracking

### **Separation Tab**

- Professional AI separation interface
- Auto-reset when loading new songs
- Real-time progress monitoring
- Individual track controls with mixing

### **Settings Tab**

- Audio quality configuration
- Save location preferences
- Processing model selection
- Advanced options

## 🔧 Development

### **Frontend (React Native)**

```bash
npm install
npx expo start --tunnel --clear
```

### **Backend (Python Flask)**

```bash
cd backend
pip install -r requirements.txt
python app-professional.py
```

### **Key Technologies**

- **React Native + Expo**: Cross-platform mobile development
- **TypeScript**: Type-safe development
- **Expo Audio**: Professional audio playback
- **React Navigation**: Tab-based navigation
- **Context API**: Global state management

## 🎤 Voice Processing Highlights

- **Complete vocal preservation** - Never loses vocal content
- **Music bleed minimization** - Removes instruments while keeping voice
- **Natural vocal character** - Maintains original vocal timbre
- **Dynamic range preservation** - Keeps vocal expression intact
- **Harmonic enhancement** - Boosts vocal formants for clarity

## 🎼 Professional Results

✅ **Clean vocal tracks** for karaoke and vocal study  
✅ **Isolated instruments** for learning and practice  
✅ **Custom mixes** by adjusting track volumes  
✅ **High-quality exports** for professional use  
✅ **Real-time feedback** during processing

## 📊 Performance

- **Processing Time**: 1-3 minutes for average songs
- **Quality**: Studio-grade separation results
- **Efficiency**: Optimized algorithms for mobile devices
- **Reliability**: Robust error handling and recovery

---

**🎵 Professional AI Music Separation - Studio Quality Results 🎵**

_Experience the future of music separation with voice-preserving AI technology._
