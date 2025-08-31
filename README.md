# React Native Media Player with AI Features

A sophisticated React Native media player app built with Expo that includes AI-powered music source separation and real-time chord analysis.

## 🎵 Features

### Core Media Player

- **Local File Support**: Select audio files from device storage
- **Professional Controls**: Play, pause, stop, seek, volume, loop
- **Visual Waveform**: Interactive waveform visualization with seeking
- **Time Display**: Current position and total duration
- **Scrollable Interface**: Smooth scrolling UI optimized for mobile

### AI-Powered Track Separation

- **Source Separation**: Split songs into vocals, drums, bass, and instruments
- **Individual Volume Control**: Adjust volume for each separated track
- **Visual Track Management**: Beautiful UI for managing separated stems
- **Download Stems**: Save separated tracks to device
- **Real-time Processing**: Live progress tracking during AI separation

### Advanced Chord Analysis

- **Real-time Chord Detection**: Live chord recognition during playback
- **Musical Analysis**: Key signature, tempo, and time signature detection
- **Chord Timeline**: Visual timeline showing chord progressions
- **Confidence Scores**: AI confidence levels for each detected chord
- **Note Display**: Shows individual notes in each chord

### Modern UI/UX

- **Dark Theme**: Sleek gradient design optimized for mobile
- **Animated Components**: Smooth animations and transitions
- **Touch-Friendly**: Large buttons and intuitive gestures
- **Tab Navigation**: Organized into Player, Separation, and Settings tabs

## 🛠️ Technical Architecture

### Built With

- **React Native** with Expo
- **TypeScript** for type safety
- **Expo Audio** for media playback
- **Expo Document Picker** for file selection
- **React Native Reanimated** for animations
- **Lucide React Native** for icons
- **Linear Gradient** for visual effects

### AI Services Structure

```
services/
├── SeparationService.ts    # AI music source separation
├── ChordAnalyzer.ts       # Chord detection and analysis
└── AudioService.ts        # Core audio processing
```

### Component Architecture

```
components/
├── WaveformView.tsx       # Interactive audio waveform
├── VolumeSlider.tsx       # Custom volume controls
├── ChordDisplay.tsx       # Advanced chord visualization
├── TrackSeparationView.tsx # Individual track management
└── SeparationProgress.tsx  # AI processing progress
```

## 📱 Screen Structure

### 1. Player Tab (`index.tsx`)

- File selection and basic playback
- Waveform visualization
- Transport controls
- Real-time chord display

### 2. Separation Tab (`separation.tsx`)

- Audio file selection for separation
- AI processing with progress tracking
- Individual track volume controls
- Download separated stems

### 3. Settings Tab (`settings.tsx`)

- AI model configuration
- Processing quality settings
- Export preferences
- Model status information

## 🚀 Setup Instructions

### Prerequisites

- Node.js 18+
- Expo CLI
- iOS Simulator or Android Emulator
- Physical device for testing

### Installation

1. **Clone and Install**

```bash
cd MediaPlayer
npm install
```

2. **Install Additional Dependencies**

```bash
npx expo install expo-document-picker expo-file-system
```

3. **Start Development Server**

```bash
npx expo start
```

4. **Run on Device**

- Scan QR code with Expo Go app
- Or press 'i' for iOS simulator
- Or press 'a' for Android emulator

### AI Backend Setup (Optional)

To enable real AI processing, set up your backend API:

1. **Update Service Endpoints**

```typescript
// In services/SeparationService.ts
private apiEndpoint = 'https://your-ai-backend.com/api';

// In services/ChordAnalyzer.ts
private apiEndpoint = 'https://your-chord-ai-backend.com/api';
```

2. **Backend Requirements**

- Audio processing API (Spleeter, Demucs, etc.)
- Chord analysis API
- File upload/download endpoints

## 🎯 Current Implementation Status

### ✅ Completed Features

- [x] Core media player functionality
- [x] Local file selection and playback
- [x] Visual waveform with seeking
- [x] Professional transport controls
- [x] Volume control with visual feedback
- [x] Real-time chord display with analysis
- [x] Track separation UI and workflow
- [x] Individual track volume controls
- [x] AI processing progress tracking
- [x] Settings and configuration screen
- [x] Download functionality for separated tracks
- [x] Responsive scrollable interface

### 🔄 Mock Implementation (Ready for Backend)

- [x] AI music source separation (using placeholder service)
- [x] Chord detection and analysis (using mock data)
- [x] Key signature and tempo detection
- [x] Confidence scoring for AI predictions

### 🚀 Ready for Production

The app is structurally complete and ready for:

1. Backend AI service integration
2. Real audio processing APIs
3. Production deployment
4. App store submission

## 🔧 Customization

### Adding New AI Models

```typescript
// In services/SeparationService.ts
export interface SeparationOptions {
  model: 'demucs' | 'spleeter' | 'htdemucs' | 'your-model';
  quality: 'low' | 'medium' | 'high';
  stems: ('vocals' | 'drums' | 'bass' | 'other')[];
}
```

### Extending Chord Analysis

```typescript
// In services/ChordAnalyzer.ts
interface Chord {
  time: number;
  name: string;
  quality: 'major' | 'minor' | 'your-quality';
  confidence: number;
  notes: string[];
  duration: number;
}
```

## 📱 Platform Support

- **iOS**: Full support with native audio capabilities
- **Android**: Full support with optimized performance
- **Web**: Basic support (limited audio features)

## 🎨 Theming

The app uses a dark theme with customizable colors:

- Primary: `#8B5CF6` (Purple)
- Secondary: `#10B981` (Green)
- Background: Gradient from `#1F2937` to `#000000`
- Text: Various shades of white and gray

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🐛 Known Issues

- AI processing currently uses mock data (requires backend integration)
- Large file handling needs optimization for production
- Some advanced chord types need additional UI polish

## 🔮 Future Enhancements

- Real-time pitch shifting
- Tempo adjustment
- Lyrics synchronization
- Cloud storage integration
- Social sharing features
- Advanced EQ controls

---

Built with ❤️ using React Native and Expo
