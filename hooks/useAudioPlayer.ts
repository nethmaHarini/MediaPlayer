import { useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { AudioUtils } from '../utils/AudioUtils';

interface UseAudioPlayerOptions {
  onStatusUpdate?: (status: any) => void;
  autoPlay?: boolean;
}

export function useAudioPlayer(options: UseAudioPlayerOptions = {}) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLooping, setIsLooping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const loadAudio = async (uri: string) => {
    try {
      setError(null);
      
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        {
          shouldPlay: options.autoPlay || false,
          isLooping,
          volume,
        }
      );

      newSound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isLoaded) {
          setIsLoaded(true);
          setIsPlaying(status.isPlaying || false);
          setPosition(status.positionMillis || 0);
          setDuration(status.durationMillis || 0);
          setVolume(status.volume || 1);
          setIsLooping(status.isLooping || false);
          
          options.onStatusUpdate?.(status);
        } else if (status.error) {
          setError(status.error);
        }
      });

      setSound(newSound);
      soundRef.current = newSound;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audio');
    }
  };

  const play = async () => {
    if (soundRef.current) {
      await soundRef.current.playAsync();
    }
  };

  const pause = async () => {
    if (soundRef.current) {
      await soundRef.current.pauseAsync();
    }
  };

  const stop = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
    }
  };

  const seek = async (positionMillis: number) => {
    if (soundRef.current) {
      await soundRef.current.setPositionAsync(positionMillis);
    }
  };

  const setVolumeLevel = async (level: number) => {
    if (soundRef.current) {
      await soundRef.current.setVolumeAsync(level);
    }
  };

  const toggleLoop = async () => {
    if (soundRef.current) {
      const newLooping = !isLooping;
      await soundRef.current.setIsLoopingAsync(newLooping);
    }
  };

  return {
    // State
    isLoaded,
    isPlaying,
    position,
    duration,
    volume,
    isLooping,
    error,
    
    // Actions
    loadAudio,
    play,
    pause,
    stop,
    seek,
    setVolume: setVolumeLevel,
    toggleLoop,
    
    // Utilities
    formatTime: AudioUtils.formatDuration,
  };
}