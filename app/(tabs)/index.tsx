import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Download,
  Music,
  FolderOpen,
} from 'lucide-react-native';
import { WaveformView } from '../../components/WaveformView';
import { VolumeSlider } from '../../components/VolumeSlider';
import { ChordDisplay } from '../../components/ChordDisplay';
import { useAudio } from '../../contexts/AudioContext';

const { width } = Dimensions.get('window');

interface PlaybackStatus {
  isLoaded: boolean;
  isPlaying: boolean;
  position: number;
  duration: number;
  volume: number;
  isLooping: boolean;
}

export default function PlayerScreen() {
  const {
    selectedFile,
    setSelectedFile,
    sound,
    setSound,
    currentSong,
    setCurrentSong,
    setAudioUri,
    stopAllSeparatedTracks,
  } = useAudio();

  const [status, setStatus] = useState<PlaybackStatus>({
    isLoaded: false,
    isPlaying: false,
    position: 0,
    duration: 0,
    volume: 1,
    isLooping: false,
  });

  // Stop separated tracks when focusing on home tab
  useFocusEffect(
    React.useCallback(() => {
      const stopSeparatedTracks = async () => {
        try {
          await stopAllSeparatedTracks();
        } catch (error) {
          console.error('Error stopping separated tracks:', error);
        }
      };

      stopSeparatedTracks();
    }, [stopAllSeparatedTracks])
  );

  useEffect(() => {
    // Initialize audio mode
    const initializeAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (error) {
        console.error('Error setting audio mode:', error);
      }
    };

    initializeAudio();

    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const loadAudio = async (uri: string) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        {
          shouldPlay: false,
          isLooping: status.isLooping,
          volume: status.volume,
        }
      );

      newSound.setOnPlaybackStatusUpdate((playbackStatus: any) => {
        if (playbackStatus.isLoaded) {
          setStatus({
            isLoaded: true,
            isPlaying: playbackStatus.isPlaying || false,
            position: playbackStatus.positionMillis || 0,
            duration: playbackStatus.durationMillis || 0,
            volume: playbackStatus.volume || 1,
            isLooping: playbackStatus.isLooping || false,
          });
        }
      });

      setSound(newSound);
      setCurrentSong(uri.split('/').pop()?.split('.')[0] || 'Unknown Song');
      setAudioUri(uri); // Store URI for separation tab
    } catch (error) {
      console.error('Error loading audio:', error);
      Alert.alert('Error', 'Failed to load audio file');
    }
  };

  const pickAudioFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFile(result);
        setCurrentSong(file.name);
        await loadAudio(file.uri);
      }
    } catch (error) {
      console.error('Error picking file:', error);
      Alert.alert('Error', 'Failed to pick audio file');
    }
  };

  const playPause = async () => {
    if (!sound) return;

    if (status.isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  };

  const stop = async () => {
    if (!sound) return;
    await sound.stopAsync();
  };

  const seek = async (position: number) => {
    if (!sound) return;
    await sound.setPositionAsync(position);
  };

  const setVolume = async (volume: number) => {
    if (!sound) return;
    await sound.setVolumeAsync(volume);
  };

  const toggleLoop = async () => {
    if (!sound) return;
    const newLooping = !status.isLooping;
    await sound.setIsLoopingAsync(newLooping);
  };

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#1F2937', '#111827', '#000000']}
        style={styles.container}
      >
        <View style={styles.header}>
          <Music size={32} color="#8B5CF6" />
          <Text style={styles.title}>Media Player</Text>
        </View>

        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.filePickerButton}
            onPress={pickAudioFile}
          >
            <FolderOpen size={20} color="#FFFFFF" />
            <Text style={styles.filePickerText}>Select Audio File</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.playerContainer}>
          <Text style={styles.songTitle}>{currentSong}</Text>

          <WaveformView
            duration={status.duration}
            position={status.position}
            onSeek={seek}
          />

          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(status.position)}</Text>
            <Text style={styles.timeText}>{formatTime(status.duration)}</Text>
          </View>

          <View style={styles.controlsContainer}>
            <TouchableOpacity
              style={styles.control}
              onPress={() => seek(Math.max(0, status.position - 10000))}
            >
              <SkipBack size={28} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.playButton} onPress={playPause}>
              {status.isPlaying ? (
                <Pause size={32} color="#FFFFFF" />
              ) : (
                <Play size={32} color="#FFFFFF" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.control}
              onPress={() =>
                seek(Math.min(status.duration, status.position + 10000))
              }
            >
              <SkipForward size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.additionalControls}>
            <TouchableOpacity
              style={[styles.control, status.isLooping && styles.activeControl]}
              onPress={toggleLoop}
            >
              <Repeat
                size={24}
                color={status.isLooping ? '#8B5CF6' : '#9CA3AF'}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.control} onPress={stop}>
              <Text style={styles.stopText}>Stop</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.control}>
              <Download size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <VolumeSlider value={status.volume} onValueChange={setVolume} />
        </View>

        <ChordDisplay
          position={status.position}
          duration={status.duration}
          isPlaying={status.isPlaying}
        />
      </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  inputContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  filePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  filePickerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  playerContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  songTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 30,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 30,
  },
  timeText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  control: {
    padding: 16,
    marginHorizontal: 8,
  },
  playButton: {
    backgroundColor: '#8B5CF6',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  additionalControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  activeControl: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 8,
  },
  stopText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
  },
});
