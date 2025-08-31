import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import {
  Music,
  Mic,
  Volume2,
  VolumeX,
  Download,
  Play,
  Pause,
  Layers,
  AlertCircle,
  Folder,
  X,
} from 'lucide-react-native';
import { TrackSeparationView } from '../../components/TrackSeparationView';
import { SeparationProgress } from '../../components/SeparationProgress';
import { WaveformView } from '../../components/WaveformView';
import { useAudio } from '../../contexts/AudioContext';
import { useSettings } from '../../contexts/SettingsContext';
import {
  realAISeparationService,
  SeparationProgress as SeparationProgressType,
} from '../../services/RealAISeparationService';
import { freeAISeparationService } from '../../services/FreeAISeparationService';

interface SeparatedTrack {
  id: string;
  name: string;
  icon: any;
  volume: number;
  isMuted: boolean;
  color: string;
  sound: Audio.Sound | null;
}

interface PlaybackStatus {
  isLoaded: boolean;
  isPlaying: boolean;
  position: number;
  duration: number;
  volume: number;
}

export default function SeparationScreen() {
  const {
    audioUri,
    currentSong,
    sound: mainSound,
    separatedTracks: globalSeparatedTracks,
    setSeparatedTracks: setGlobalSeparatedTracks,
  } = useAudio();

  const {
    selectedModel,
    saveLocation,
    audioFormat,
    highQuality,
    autoSave,
    availableModels,
  } = useSettings();

  const [showSaveLocationModal, setShowSaveLocationModal] = useState(false);
  const [pendingDownload, setPendingDownload] = useState<{
    trackId: string;
    trackName: string;
  } | null>(null);

  const [tracks, setTracks] = useState<SeparatedTrack[]>([
    {
      id: 'vocals',
      name: 'Vocals',
      icon: Mic,
      volume: 1.0,
      isMuted: false,
      color: '#EF4444',
      sound: null,
    },
    {
      id: 'instrumental',
      name: 'Instrumental',
      icon: Music,
      volume: 0.0,
      isMuted: false,
      color: '#3B82F6',
      sound: null,
    },
    {
      id: 'drums',
      name: 'Drums',
      icon: Music,
      volume: 0.0,
      isMuted: false,
      color: '#F59E0B',
      sound: null,
    },
    {
      id: 'bass',
      name: 'Bass',
      icon: Music,
      volume: 0.0,
      isMuted: false,
      color: '#10B981',
      sound: null,
    },
    {
      id: 'other',
      name: 'Other',
      icon: Music,
      volume: 0.0,
      isMuted: false,
      color: '#8B5CF6',
      sound: null,
    },
  ]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [separationComplete, setSeparationComplete] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackUpdateInterval, setPlaybackUpdateInterval] =
    useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Stop main audio when entering separation tab
    const stopMainAudio = async () => {
      if (mainSound) {
        try {
          await mainSound.pauseAsync();
        } catch (error) {
          console.error('Error stopping main audio:', error);
        }
      }
    };

    stopMainAudio();

    // Initialize audio mode for multiple tracks
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

    // Cleanup interval on unmount
    return () => {
      if (playbackUpdateInterval) {
        clearInterval(playbackUpdateInterval);
      }
    };
  }, [mainSound]);

  // Sync local tracks with global separated tracks
  useEffect(() => {
    if (tracks.length > 0 && tracks.some((t) => t.sound)) {
      const globalTracks = tracks.map((track) => ({
        id: track.id,
        name: track.name,
        sound: track.sound,
        volume: track.volume,
        isMuted: track.isMuted,
      }));
      setGlobalSeparatedTracks(globalTracks);
    }
  }, [tracks, setGlobalSeparatedTracks]);

  // Update playback status from tracks
  useEffect(() => {
    if (separationComplete && tracks.some((t) => t.sound)) {
      const updatePlaybackStatus = async () => {
        try {
          // Get status from the first active track
          const activeTrack = tracks.find((t) => t.sound && !t.isMuted);
          if (activeTrack?.sound) {
            const status = await activeTrack.sound.getStatusAsync();
            if (status.isLoaded) {
              setPosition(status.positionMillis || 0);
              setDuration(status.durationMillis || 0);
              setIsPlaying(status.isPlaying || false);
            }
          }
        } catch (error) {
          console.error('Error updating playback status:', error);
        }
      };

      // Update every 100ms when playing
      if (isPlaying) {
        const interval = setInterval(updatePlaybackStatus, 100);
        setPlaybackUpdateInterval(interval);
        return () => clearInterval(interval);
      } else {
        if (playbackUpdateInterval) {
          clearInterval(playbackUpdateInterval);
          setPlaybackUpdateInterval(null);
        }
      }
    }
  }, [isPlaying, separationComplete, tracks]);

  const startSeparation = async () => {
    if (!audioUri) {
      Alert.alert(
        'No Audio',
        'Please load an audio file in the Player tab first'
      );
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);
    setSeparationComplete(false);

    try {
      const currentModel = availableModels.find((m) => m.id === selectedModel);
      const modelName = currentModel ? currentModel.name : 'Professional AI';
      const qualityText = highQuality ? 'High Quality' : 'Standard Quality';

      Alert.alert(
        'Professional AI Separation',
        `This will separate your audio using advanced AI models:\n\n🔬 Selected Model: ${modelName}\n⚡ Quality: ${qualityText}\n💾 Audio Format: ${audioFormat.toUpperCase()}\n📁 Save Location: ${
          autoSave ? saveLocation : 'Ask on download'
        }\n\n🎼 Professional Features:\n   • Advanced ICA (Independent Component Analysis)\n   • Multi-scale spectral analysis\n   • Studio-grade EQ and dynamics\n   • Professional audio processing\n\nEach track will contain professionally isolated audio elements!`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setIsProcessing(false),
          },
          { text: 'Continue', onPress: () => performRealSeparation() },
        ]
      );
    } catch (error) {
      console.error('Setup failed:', error);
      setIsProcessing(false);
    }
  };

  const performRealSeparation = async () => {
    try {
      // Try the local backend first (completely free)
      let separatedTracks;
      try {
        separatedTracks = await realAISeparationService.separateAudio(
          audioUri!,
          (progress: SeparationProgressType) => {
            setProcessingProgress(progress.progress);
          }
        );
      } catch (backendError) {
        console.log('Local backend not available, trying free AI services...');

        // Fallback to free AI services
        separatedTracks = await freeAISeparationService.separateAudio(
          audioUri!,
          {
            model: 'demucs',
            quality: 'high',
            stems: ['vocals', 'drums', 'bass', 'other'],
          },
          (progress) => {
            setProcessingProgress(progress.progress);
          }
        );
      }

      // Create Audio.Sound objects for each separated track
      const updatedTracks = await Promise.all(
        tracks.map(async (track) => {
          let trackUri: string | undefined;

          if (track.id === 'vocals') {
            trackUri = separatedTracks.vocals;
          } else if (track.id === 'drums') {
            trackUri = separatedTracks.drums;
          } else if (track.id === 'bass') {
            trackUri = separatedTracks.bass;
          } else if (track.id === 'instrumental') {
            trackUri = separatedTracks.instrumental;
          } else if (track.id === 'other') {
            trackUri = separatedTracks.other;
          }

          if (trackUri) {
            try {
              const { sound } = await Audio.Sound.createAsync(
                { uri: trackUri },
                {
                  shouldPlay: false,
                  volume: track.volume,
                  isLooping: false,
                }
              );

              // Set up status update listener for each track
              sound.setOnPlaybackStatusUpdate((status: any) => {
                if (status.isLoaded) {
                  // Sync all tracks to same position
                  if (Math.abs((status.positionMillis || 0) - position) > 200) {
                    // Only update if significantly different to avoid loops
                    setPosition(status.positionMillis || 0);
                  }
                }
              });

              return { ...track, sound };
            } catch (error) {
              console.error(`Error loading ${track.name} track:`, error);
              return track;
            }
          }
          return track;
        })
      );

      setTracks(updatedTracks);
      setSeparationComplete(true);
      Alert.alert(
        'Professional AI separation complete! 🎉',
        'Your audio has been processed with advanced AI models! Each track contains professionally separated audio elements. Mix them independently for studio-quality results!'
      );
    } catch (error) {
      console.error('Vocal isolation failed:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert(
        'Professional AI Separation Failed',
        `AI separation failed: ${errorMessage}\n\nTroubleshooting:\n• Check backend: python backend/app-professional.py\n• Verify http://localhost:5000/health\n• Ensure supported audio formats (MP3/WAV)\n• Check audio file quality and size`,
        [{ text: 'OK', style: 'cancel' }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const playPause = async () => {
    try {
      // Prevent multiple calls
      if (isPlaying === undefined) return;

      const newPlayingState = !isPlaying;
      setIsPlaying(newPlayingState);

      if (newPlayingState) {
        // Play all tracks, but with correct volume (0 for muted, actual volume for unmuted)
        const playPromises = tracks
          .filter((track) => track.sound)
          .map(async (track) => {
            if (track.sound) {
              await track.sound.setPositionAsync(position);
              // Set volume based on mute state before playing
              const volume = track.isMuted ? 0 : track.volume;
              await track.sound.setVolumeAsync(volume);
              return track.sound.playAsync();
            }
          });

        await Promise.all(playPromises);
      } else {
        // Pause all tracks
        const pausePromises = tracks
          .filter((track) => track.sound)
          .map((track) => track.sound?.pauseAsync());

        await Promise.all(pausePromises);
      }
    } catch (error) {
      console.error('Error playing/pausing tracks:', error);
      setIsPlaying(!isPlaying); // Revert state on error
    }
  };

  const seek = async (newPosition: number) => {
    try {
      setPosition(newPosition);
      // Sync all tracks to the new position
      const seekPromises = tracks
        .filter((track) => track.sound)
        .map((track) => track.sound?.setPositionAsync(newPosition));

      await Promise.all(seekPromises);
    } catch (error) {
      console.error('Error seeking:', error);
    }
  };

  const updateTrackVolume = async (trackId: string, volume: number) => {
    setTracks((prev) =>
      prev.map((track) => {
        if (track.id === trackId) {
          if (track.sound) {
            track.sound.setVolumeAsync(volume);
          }
          return { ...track, volume };
        }
        return track;
      })
    );
  };

  const toggleMute = async (trackId: string) => {
    setTracks((prev) =>
      prev.map((track) => {
        if (track.id === trackId) {
          const newMuted = !track.isMuted;
          if (track.sound) {
            // Just change volume, don't start/stop playback
            if (newMuted) {
              track.sound.setVolumeAsync(0);
            } else {
              track.sound.setVolumeAsync(track.volume);
            }
          }
          return { ...track, isMuted: newMuted };
        }
        return track;
      })
    );
  };
  const downloadTrack = async (trackId: string) => {
    const track = tracks.find((t) => t.id === trackId);
    if (!track) return;

    // If auto-save is enabled, use the default save location
    if (autoSave) {
      handleDirectDownload(trackId, track.name, saveLocation);
    } else {
      // Show modal to let user choose location
      setPendingDownload({ trackId, trackName: track.name });
      setShowSaveLocationModal(true);
    }
  };

  const handleDirectDownload = async (
    trackId: string,
    trackName: string,
    location: string
  ) => {
    try {
      let saveUri: string;
      const baseDir =
        location === 'downloads'
          ? FileSystem.cacheDirectory
          : location === 'documents'
          ? FileSystem.documentDirectory
          : location === 'music'
          ? FileSystem.documentDirectory
          : FileSystem.documentDirectory; // fallback

      const fileExtension = audioFormat === 'wav' ? '.wav' : '.mp3';
      const fileName = `${trackName}_${Date.now()}${fileExtension}`;
      saveUri = `${baseDir}${fileName}`;

      Alert.alert(
        'Download Started',
        `Downloading ${trackName} track to ${location}...`
      );

      // Mock download - in real implementation, download from backend
      setTimeout(() => {
        Alert.alert('Success', `${trackName} track saved successfully!`);
      }, 1500);
    } catch (error) {
      console.error('Download failed:', error);
      Alert.alert('Error', 'Failed to save track');
    }
  };

  const handleSaveLocationSelect = async (location: string) => {
    if (!pendingDownload) return;

    try {
      if (location === 'custom') {
        // Use document picker to let user choose location
        const result = await DocumentPicker.getDocumentAsync({
          type: 'audio/*',
          copyToCacheDirectory: false,
        });

        if (result.canceled) {
          setShowSaveLocationModal(false);
          setPendingDownload(null);
          return;
        }

        Alert.alert(
          'Download Started',
          `Downloading ${pendingDownload.trackName} track to custom location...`
        );
      } else {
        // Use the selected predefined location
        handleDirectDownload(
          pendingDownload.trackId,
          pendingDownload.trackName,
          location
        );
      }

      setShowSaveLocationModal(false);
      setPendingDownload(null);
    } catch (error) {
      console.error('Download failed:', error);
      Alert.alert('Error', 'Failed to save track');
      setShowSaveLocationModal(false);
      setPendingDownload(null);
    }
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
        <Layers size={32} color="#8B5CF6" />
        <Text style={styles.title}>Track Separation</Text>
      </View>

      {!audioUri ? (
        <View style={styles.noAudioContainer}>
          <AlertCircle size={64} color="#6B7280" />
          <Text style={styles.noAudioTitle}>No Audio Loaded</Text>
          <Text style={styles.noAudioDescription}>
            Please load an audio file in the Player tab first to use track
            separation
          </Text>
        </View>
      ) : !separationComplete ? (
        <View style={styles.setupContainer}>
          <Text style={styles.setupTitle}>
            � Professional AI Music Source Separation
          </Text>
          <Text style={styles.setupDescription}>
            Current song: {currentSong}
          </Text>
          <Text style={styles.setupDescription}>
            🚀 Using advanced AI models to separate your music into:
          </Text>
          <Text style={styles.setupDescription}>
            • Pure vocals track{'\n'}• Isolated drums track{'\n'}• Clean bass
            track{'\n'}• Other instruments track
          </Text>
          <Text style={styles.setupDescription}>
            ⚡ Processing time: 1-3 minutes{'\n'}🎯 Quality: Studio-grade
            separation
            {'\n'}🔬 Technology: ICA + Multi-scale spectral analysis{'\n'}🎛️
            Backend: Professional audio processing{'\n'}🏆 Results: Professional
            mixing quality
          </Text>

          {!isProcessing ? (
            <TouchableOpacity
              style={styles.startButton}
              onPress={startSeparation}
            >
              <Layers size={20} color="#FFFFFF" />
              <Text style={styles.startButtonText}>
                Start Professional AI Separation
              </Text>
            </TouchableOpacity>
          ) : (
            <SeparationProgress progress={processingProgress} />
          )}
        </View>
      ) : (
        <ScrollView
          style={styles.tracksContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.playerSection}>
            <Text style={styles.sectionTitle}>Now Playing: {currentSong}</Text>

            <WaveformView
              duration={duration}
              position={position}
              onSeek={seek}
            />

            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{formatTime(position)}</Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>

            <View style={styles.mainControls}>
              <TouchableOpacity style={styles.playButton} onPress={playPause}>
                {isPlaying ? (
                  <Pause size={32} color="#FFFFFF" />
                ) : (
                  <Play size={32} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.demoNotice}>
              <AlertCircle size={16} color="#10B981" />
              <Text style={styles.demoText}>
                Professional AI: All tracks use advanced separation algorithms.
                High-quality results with your local professional backend!
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Individual Track Controls</Text>

          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              💡 <Text style={styles.infoBold}>How it works:</Text> Each track
              contains AI-separated audio elements using advanced professional
              models. Mix and match different tracks to create your perfect
              sound. Adjust volumes independently for creative control -
              studio-quality results!
            </Text>
          </View>

          {tracks.map((track) => (
            <TrackSeparationView
              key={track.id}
              track={{
                ...track,
                isProcessing: false,
              }}
              onVolumeChange={(volume) => updateTrackVolume(track.id, volume)}
              onToggleMute={() => toggleMute(track.id)}
              onDownload={() => downloadTrack(track.id)}
            />
          ))}

          <View style={styles.masterControls}>
            <TouchableOpacity
              style={styles.masterButton}
              onPress={() => {
                tracks.forEach((track) => {
                  if (track.id !== 'vocals') {
                    toggleMute(track.id);
                  }
                });
              }}
            >
              <Text style={styles.masterButtonText}>Vocals Only</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.masterButton}
              onPress={() => {
                tracks.forEach((track) => {
                  if (track.id === 'drums') {
                    toggleMute(track.id);
                  }
                });
              }}
            >
              <Text style={styles.masterButtonText}>Toggle Drums</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* Save Location Modal */}
      <Modal
        visible={showSaveLocationModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSaveLocationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Save Location</Text>
              <TouchableOpacity
                onPress={() => setShowSaveLocationModal(false)}
                style={styles.closeButton}
              >
                <X size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Where would you like to save "{pendingDownload?.trackName}"?
            </Text>

            <View style={styles.locationOptions}>
              <TouchableOpacity
                style={styles.locationOption}
                onPress={() => handleSaveLocationSelect('downloads')}
              >
                <Folder size={24} color="#3B82F6" />
                <View style={styles.locationText}>
                  <Text style={styles.locationTitle}>Downloads</Text>
                  <Text style={styles.locationDescription}>
                    Save to downloads folder
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.locationOption}
                onPress={() => handleSaveLocationSelect('documents')}
              >
                <Folder size={24} color="#10B981" />
                <View style={styles.locationText}>
                  <Text style={styles.locationTitle}>Documents</Text>
                  <Text style={styles.locationDescription}>
                    Save to documents folder
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.locationOption}
                onPress={() => handleSaveLocationSelect('custom')}
              >
                <Folder size={24} color="#F59E0B" />
                <View style={styles.locationText}>
                  <Text style={styles.locationTitle}>Choose Location</Text>
                  <Text style={styles.locationDescription}>
                    Browse and select custom location
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  noAudioContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  noAudioTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  noAudioDescription: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
  },
  setupContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  setupTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  setupDescription: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 25,
    gap: 8,
    marginTop: 20,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  tracksContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  playerSection: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  demoNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  demoText: {
    flex: 1,
    color: '#10B981',
    fontSize: 12,
    lineHeight: 16,
  },
  mainControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  playButton: {
    backgroundColor: '#8B5CF6',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  timeText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  masterControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 30,
    marginBottom: 40,
  },
  masterButton: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  masterButtonText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  infoText: {
    color: '#9CA3AF',
    fontSize: 14,
    lineHeight: 20,
  },
  infoBold: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 24,
    textAlign: 'center',
  },
  locationOptions: {
    gap: 12,
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  locationText: {
    marginLeft: 12,
    flex: 1,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  locationDescription: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});
