import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Music, 
  Mic, 
  Volume2, 
  VolumeX,
  Download,
  Play,
  Pause
} from 'lucide-react-native';
import { TrackSeparationView } from '../../components/TrackSeparationView';
import { SeparationProgress } from '../../components/SeparationProgress';

interface SeparatedTrack {
  id: string;
  name: string;
  icon: any;
  volume: number;
  isMuted: boolean;
  color: string;
  isProcessing: boolean;
}

export default function SeparationScreen() {
  const [tracks, setTracks] = useState<SeparatedTrack[]>([
    {
      id: 'vocals',
      name: 'Vocals',
      icon: Mic,
      volume: 0.8,
      isMuted: false,
      color: '#EF4444',
      isProcessing: false,
    },
    {
      id: 'drums',
      name: 'Drums',
      icon: Music,
      volume: 0.7,
      isMuted: false,
      color: '#F59E0B',
      isProcessing: false,
    },
    {
      id: 'bass',
      name: 'Bass',
      icon: Music,
      volume: 0.6,
      isMuted: false,
      color: '#10B981',
      isProcessing: false,
    },
    {
      id: 'instruments',
      name: 'Instruments',
      icon: Music,
      volume: 0.9,
      isMuted: false,
      color: '#3B82F6',
      isProcessing: false,
    },
  ]);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [separationComplete, setSeparationComplete] = useState(false);

  const startSeparation = async () => {
    setIsProcessing(true);
    setProcessingProgress(0);
    
    // Simulate AI processing
    const progressInterval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsProcessing(false);
          setSeparationComplete(true);
          return 100;
        }
        return prev + 2;
      });
    }, 100);
    
    // Mark tracks as processing one by one
    tracks.forEach((track, index) => {
      setTimeout(() => {
        setTracks(prev => prev.map(t => 
          t.id === track.id ? { ...t, isProcessing: true } : t
        ));
        
        setTimeout(() => {
          setTracks(prev => prev.map(t => 
            t.id === track.id ? { ...t, isProcessing: false } : t
          ));
        }, 1000 + index * 500);
      }, index * 1000);
    });
  };

  const updateTrackVolume = (trackId: string, volume: number) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId ? { ...track, volume } : track
    ));
  };

  const toggleMute = (trackId: string) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId ? { ...track, isMuted: !track.isMuted } : track
    ));
  };

  const downloadTrack = (trackId: string) => {
    // Mock download functionality
    console.log(`Downloading ${trackId} track...`);
  };

  return (
    <LinearGradient
      colors={['#1F2937', '#111827', '#000000']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Mic size={32} color="#8B5CF6" />
        <Text style={styles.title}>Track Separation</Text>
      </View>

      {!separationComplete && (
        <View style={styles.setupContainer}>
          <Text style={styles.setupTitle}>AI Music Source Separation</Text>
          <Text style={styles.setupDescription}>
            Separate your music into individual tracks using advanced AI models
          </Text>
          
          {!isProcessing ? (
            <TouchableOpacity 
              style={styles.startButton} 
              onPress={startSeparation}
            >
              <Text style={styles.startButtonText}>Start Separation</Text>
            </TouchableOpacity>
          ) : (
            <SeparationProgress progress={processingProgress} />
          )}
        </View>
      )}

      {separationComplete && (
        <ScrollView style={styles.tracksContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Separated Tracks</Text>
          
          {tracks.map((track) => (
            <TrackSeparationView
              key={track.id}
              track={track}
              onVolumeChange={(volume) => updateTrackVolume(track.id, volume)}
              onToggleMute={() => toggleMute(track.id)}
              onDownload={() => downloadTrack(track.id)}
            />
          ))}

          <View style={styles.masterControls}>
            <TouchableOpacity style={styles.masterButton}>
              <Text style={styles.masterButtonText}>Solo All Vocals</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.masterButton}>
              <Text style={styles.masterButtonText}>Mute All Drums</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
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
    marginBottom: 40,
    lineHeight: 24,
  },
  startButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 25,
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
});