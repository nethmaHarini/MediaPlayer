import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';

interface SeparatedTrack {
  id: string;
  name: string;
  sound: Audio.Sound | null;
  volume: number;
  isMuted: boolean;
}

interface AudioContextData {
  // Audio file data
  selectedFile: DocumentPicker.DocumentPickerResult | null;
  setSelectedFile: (file: DocumentPicker.DocumentPickerResult | null) => void;

  // Audio sound object
  sound: Audio.Sound | null;
  setSound: (sound: Audio.Sound | null) => void;

  // Current song info
  currentSong: string;
  setCurrentSong: (song: string) => void;

  // Audio URI for separation
  audioUri: string | null;
  setAudioUri: (uri: string | null) => void;

  // Separated tracks
  separatedTracks: SeparatedTrack[];
  setSeparatedTracks: (tracks: SeparatedTrack[]) => void;
  stopAllSeparatedTracks: () => Promise<void>;
}

const AudioContext = createContext<AudioContextData | undefined>(undefined);

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

interface AudioProviderProps {
  children: ReactNode;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const [selectedFile, setSelectedFile] =
    useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [currentSong, setCurrentSong] = useState('No song selected');
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [separatedTracks, setSeparatedTracks] = useState<SeparatedTrack[]>([]);

  const stopAllSeparatedTracks = async () => {
    for (const track of separatedTracks) {
      if (track.sound) {
        try {
          await track.sound.pauseAsync();
        } catch (error) {
          console.error(`Error stopping track ${track.name}:`, error);
        }
      }
    }
  };

  const value: AudioContextData = {
    selectedFile,
    setSelectedFile,
    sound,
    setSound,
    currentSong,
    setCurrentSong,
    audioUri,
    setAudioUri,
    separatedTracks,
    setSeparatedTracks,
    stopAllSeparatedTracks,
  };

  return (
    <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
  );
};
