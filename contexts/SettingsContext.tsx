import React, { createContext, useContext, useState } from 'react';

interface SettingsContextType {
  // AI Processing Settings
  autoSeparation: boolean;
  setAutoSeparation: (value: boolean) => void;
  highQuality: boolean;
  setHighQuality: (value: boolean) => void;
  selectedModel: string;
  setSelectedModel: (value: string) => void;

  // Export Settings
  autoSave: boolean;
  setAutoSave: (value: boolean) => void;
  saveLocation: string;
  setSaveLocation: (value: string) => void;
  audioFormat: string;
  setAudioFormat: (value: string) => void;

  // Chord Detection Settings
  realTimeChords: boolean;
  setRealTimeChords: (value: boolean) => void;
  chordConfidenceThreshold: number;
  setChordConfidenceThreshold: (value: number) => void;

  // Available Models
  availableModels: AIModel[];

  // Methods
  loadSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;
  resetSettings: () => Promise<void>;
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
  type: 'separation' | 'chord';
  quality: 'high' | 'medium' | 'low';
  speed: 'fast' | 'medium' | 'slow';
  isActive: boolean;
  isAvailable: boolean;
}

const defaultModels: AIModel[] = [
  {
    id: 'professional-ica',
    name: 'Professional ICA',
    description:
      'Advanced Independent Component Analysis with multi-scale spectral processing',
    type: 'separation',
    quality: 'high',
    speed: 'medium',
    isActive: true,
    isAvailable: true,
  },
  {
    id: 'demucs-v4',
    name: 'Demucs v4 (Hybrid)',
    description: 'State-of-the-art deep learning source separation',
    type: 'separation',
    quality: 'high',
    speed: 'slow',
    isActive: false,
    isAvailable: false,
  },
  {
    id: 'spleeter',
    name: 'Spleeter',
    description: 'Fast and reliable source separation by Deezer',
    type: 'separation',
    quality: 'medium',
    speed: 'fast',
    isActive: false,
    isAvailable: false,
  },
  {
    id: 'chord-ai',
    name: 'Advanced Chord AI',
    description: 'Real-time chord detection with harmonic analysis',
    type: 'chord',
    quality: 'high',
    speed: 'fast',
    isActive: true,
    isAvailable: true,
  },
];

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  // AI Processing Settings
  const [autoSeparation, setAutoSeparation] = useState(false);
  const [highQuality, setHighQuality] = useState(true);
  const [selectedModel, setSelectedModel] = useState('professional-ica');

  // Export Settings
  const [autoSave, setAutoSave] = useState(false);
  const [saveLocation, setSaveLocation] = useState('downloads');
  const [audioFormat, setAudioFormat] = useState('wav');

  // Chord Detection Settings
  const [realTimeChords, setRealTimeChords] = useState(true);
  const [chordConfidenceThreshold, setChordConfidenceThreshold] = useState(0.7);

  // Available Models
  const [availableModels, setAvailableModels] =
    useState<AIModel[]>(defaultModels);

  const loadSettings = async () => {
    // Settings are managed in memory for now
    // Can be extended to use AsyncStorage later
  };

  const saveSettings = async () => {
    // Settings are automatically saved to state
    // Can be extended to use AsyncStorage later
  };

  const resetSettings = async () => {
    setAutoSeparation(false);
    setHighQuality(true);
    setSelectedModel('professional-ica');
    setAutoSave(false);
    setSaveLocation('downloads');
    setAudioFormat('wav');
    setRealTimeChords(true);
    setChordConfidenceThreshold(0.7);
  };

  return (
    <SettingsContext.Provider
      value={{
        autoSeparation,
        setAutoSeparation,
        highQuality,
        setHighQuality,
        selectedModel,
        setSelectedModel,
        autoSave,
        setAutoSave,
        saveLocation,
        setSaveLocation,
        audioFormat,
        setAudioFormat,
        realTimeChords,
        setRealTimeChords,
        chordConfidenceThreshold,
        setChordConfidenceThreshold,
        availableModels,
        loadSettings,
        saveSettings,
        resetSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
