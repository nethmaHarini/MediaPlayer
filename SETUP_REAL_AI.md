# 🎵 Complete Setup Guide: Real AI Music Separation

## 🎯 Overview

This guide will help you set up **real AI-powered music separation** using Spleeter that actually creates distinct audio tracks (like Moises AI).

---

## 🚀 Backend Setup (Python + Spleeter)

### Step 1: Install Python Backend

```bash
# Navigate to the backend folder
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start the backend server
python app.py
```

The server will start at `http://localhost:5000`

### Step 2: Verify Backend is Working

Open your browser and go to: http://localhost:5000/health

You should see:

```json
{
  "status": "healthy",
  "service": "AI Music Separation Backend",
  "models": ["spleeter:4stems-model"],
  "version": "1.0.0"
}
```

### Step 3: Test Separation

You can test the backend directly:

```bash
curl -X POST -F "file=@test.mp3" http://localhost:5000/separate
```

---

## 📱 React Native Setup

### Step 4: Update Service URL

In `services/RealAISeparationService.ts`, update the backend URL:

```typescript
private readonly BACKEND_URL = 'http://YOUR_COMPUTER_IP:5000';
```

For development:

- **Same machine**: `http://localhost:5000`
- **Different device**: `http://192.168.1.100:5000` (use your actual IP)

### Step 5: Switch to Real AI Service

In `app/(tabs)/separation.tsx`, change the import:

```typescript
// Replace this:
import { freeAISeparationService } from '../../services/FreeAISeparationService';

// With this:
import { realAISeparationService } from '../../services/RealAISeparationService';
```

And update the service call:

```typescript
// Replace this:
const separatedTracks = await freeAISeparationService.separateAudio(...)

// With this:
const separatedTracks = await realAISeparationService.separateAudio(...)
```

---

## 🔧 How Real AI Separation Works

### What Happens:

1. **Upload**: React Native app sends MP3/WAV to Python backend
2. **AI Processing**: Spleeter AI model separates into 4 tracks:
   - 🎤 **Vocals**: Pure vocal track (no instruments)
   - 🥁 **Drums**: Isolated drums and percussion
   - 🎸 **Bass**: Bass guitar and low frequencies
   - 🎹 **Other**: Piano, guitar, other instruments
3. **Download**: App downloads each track as separate WAV files
4. **Playback**: Each track plays independently with volume control

### Processing Time:

- **30-120 seconds** depending on song length
- **Real AI separation** using Facebook's Spleeter model
- **Professional quality** like Moises AI

---

## 🌐 Network Configuration

### For Local Development:

```typescript
// In RealAISeparationService.ts
private readonly BACKEND_URL = 'http://localhost:5000';
```

### For Phone Testing:

1. **Find your computer's IP address**:

   ```bash
   # Windows
   ipconfig

   # Mac/Linux
   ifconfig
   ```

2. **Update the URL**:

   ```typescript
   private readonly BACKEND_URL = 'http://192.168.1.100:5000'; // Your actual IP
   ```

3. **Make sure firewall allows port 5000**

### For Production:

Deploy the Python backend to:

- **Heroku**: Free tier available
- **Railway**: Simple deployment
- **Google Cloud Run**: Serverless auto-scaling
- **AWS EC2**: Full control

---

## 🎛️ Backend Features

### Supported Audio Formats:

- MP3, WAV, FLAC, M4A, AAC
- Max file size: 50MB
- Auto-converts to 44.1kHz stereo

### API Endpoints:

- `GET /health` - Check server status
- `POST /separate` - Separate audio file
- `GET /download/<session_id>/<filename>` - Download track
- `DELETE /cleanup/<session_id>` - Clean up files

### Auto-cleanup:

- Files older than 1 hour are automatically deleted
- Session-based file management
- No storage bloat

---

## 🔍 Troubleshooting

### Backend Issues:

**"Cannot connect to AI backend"**

- Make sure Python backend is running: `python backend/app.py`
- Check firewall settings
- Verify IP address is correct

**"Spleeter installation failed"**

```bash
pip install --upgrade pip
pip install tensorflow==2.13.0
pip install spleeter==2.3.2
```

**"Out of memory"**

- Close other applications
- Try shorter audio files
- Reduce audio quality in code

### React Native Issues:

**"File upload failed"**

- Check file size (max 50MB)
- Verify audio format is supported
- Ensure network connectivity

**"Tracks sound the same"**

- This means you're still using FreeAISeparationService
- Switch to RealAISeparationService as shown above

**"Download failed"**

- Check available storage space
- Verify all tracks were processed successfully

---

## ⚡ Performance Tips

### Backend Optimization:

- **Use SSD storage** for faster file I/O
- **Close unnecessary applications** during processing
- **Process shorter clips** for faster results

### Network Optimization:

- **Use WiFi** instead of mobile data
- **Stay on same network** as backend server
- **Use quality audio files** (not too compressed)

---

## 🎉 Results

After setup, you'll have:

✅ **Real vocal isolation** - Pure vocals without instruments  
✅ **Clean instrumental tracks** - Music without vocals  
✅ **Separated drums** - Isolated percussion  
✅ **Isolated bass** - Pure bass frequencies  
✅ **Other instruments** - Piano, guitar, etc.  
✅ **Independent control** - Mix any combination  
✅ **Professional quality** - Like Moises AI

Each track is truly separate and can be controlled independently!

---

## 💰 Cost

- **Backend**: FREE (runs on your computer)
- **AI Models**: FREE (Spleeter is open source)
- **Processing**: FREE (local processing)
- **Storage**: Uses your local storage
- **No API fees**: No external service costs

**Total Cost: $0** 🎉

---

## 🔄 Quick Commands

Start everything:

```bash
# Terminal 1: Start backend
cd backend
python app.py

# Terminal 2: Start React Native
cd ..
npx expo start
```

Test backend:

```bash
curl http://localhost:5000/health
```

Check logs:

- Backend logs appear in Python terminal
- React Native logs in Expo terminal

---

This setup gives you **real AI separation that actually works** with truly distinct tracks, just like Moises AI! 🎵
