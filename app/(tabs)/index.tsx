import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Platform,
} from 'react-native';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2,
  Repeat,
  Download,
  Music
} from 'lucide-react-native';
import { WaveformView } from '../../components/WaveformView';
import { VolumeSlider } from '../../components/VolumeSlider';
import { ChordDisplay } from '../../components/ChordDisplay';

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
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [status, setStatus] = useState<PlaybackStatus>({
    isLoaded: false,
    isPlaying: false,
    position: 0,
    duration: 0,
    volume: 1,
    isLooping: false,
  });
  const [songUrl, setSongUrl] = useState('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
  const [currentSong, setCurrentSong] = useState('SoundHelix Demo Song');

  useEffect(() => {
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
    } catch (error) {
      console.error('Error loading audio:', error);
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
    <LinearGradient
      colors={['#1F2937', '#111827', '#000000']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Music size={32} color="#8B5CF6" />
        <Text style={styles.title}>Media Player</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={songUrl}
          onChangeText={setSongUrl}
          placeholder="Enter song URL..."
          placeholderTextColor="#9CA3AF"
        />
        <TouchableOpacity
          style={styles.loadButton}
          onPress={() => loadAudio(songUrl)}
        >
          <Text style={styles.loadButtonText}>Load</Text>
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
          <TouchableOpacity style={styles.control} onPress={() => seek(Math.max(0, status.position - 10000))}>
            <SkipBack size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.playButton} onPress={playPause}>
            {status.isPlaying ? (
              <Pause size={32} color="#FFFFFF" />
            ) : (
              <Play size={32} color="#FFFFFF" />
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.control} onPress={() => seek(Math.min(status.duration, status.position + 10000))}>
            <SkipForward size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.additionalControls}>
          <TouchableOpacity 
            style={[styles.control, status.isLooping && styles.activeControl]} 
            onPress={toggleLoop}
          >
            <Repeat size={24} color={status.isLooping ? "#8B5CF6" : "#9CA3AF"} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.control} onPress={stop}>
            <Text style={styles.stopText}>Stop</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.control}>
            <Download size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <VolumeSlider
          value={status.volume}
          onValueChange={setVolume}
        />
      </View>

      <ChordDisplay 
        position={status.position}
        duration={status.duration}
        isPlaying={status.isPlaying}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
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
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  input: {
    flex: 1,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: 16,
    marginRight: 12,
  },
  loadButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    borderRadius: 12,
    justifyContent: 'center',
  },
  loadButtonText: {
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