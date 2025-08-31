export interface AudioTrack {
  id: string;
  name: string;
  url: string;
  duration: number;
  artist?: string;
  album?: string;
  artwork?: string;
}

export interface SeparatedTracks {
  vocals: string;
  drums: string;
  bass: string;
  instruments: string;
  original: string;
}

export interface PlaybackState {
  isLoaded: boolean;
  isPlaying: boolean;
  position: number;
  duration: number;
  volume: number;
  isLooping: boolean;
  currentTrack?: AudioTrack;
}

export interface ChordProgression {
  time: number;
  chord: string;
  quality: 'major' | 'minor' | 'diminished' | 'augmented' | 'dominant7';
  confidence: number;
  root: string;
  bass?: string;
}

export interface AudioAnalysis {
  tempo: number;
  key: string;
  timeSignature: [number, number];
  chords: ChordProgression[];
  loudness: number;
  energy: number;
}

export interface SeparationOptions {
  model: 'demucs' | 'spleeter' | 'hybrid';
  quality: 'fast' | 'high' | 'ultra';
  stems: ('vocals' | 'drums' | 'bass' | 'instruments')[];
}