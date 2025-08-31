import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Volume2, VolumeX, Download } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Track {
  id: string;
  name: string;
  icon: any;
  volume: number;
  isMuted: boolean;
  color: string;
  isProcessing: boolean;
}

interface TrackSeparationViewProps {
  track: Track;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  onDownload: () => void;
}

export function TrackSeparationView({ 
  track, 
  onVolumeChange, 
  onToggleMute, 
  onDownload 
}: TrackSeparationViewProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[
          `${track.color}20`,
          `${track.color}10`,
          'rgba(255, 255, 255, 0.05)'
        ]}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.trackInfo}>
            <View style={[styles.iconContainer, { backgroundColor: track.color }]}>
              <track.icon size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.trackName}>{track.name}</Text>
          </View>
          
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={onToggleMute}
            >
              {track.isMuted ? (
                <VolumeX size={20} color="#EF4444" />
              ) : (
                <Volume2 size={20} color="#9CA3AF" />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={onDownload}
            >
              <Download size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.volumeContainer}>
          <Text style={styles.volumeLabel}>Volume</Text>
          <View style={styles.sliderContainer}>
            <View style={styles.sliderTrack}>
              <View 
                style={[
                  styles.sliderFill, 
                  { 
                    width: `${track.volume * 100}%`,
                    backgroundColor: track.color 
                  }
                ]} 
              />
            </View>
            <Text style={styles.volumeValue}>
              {Math.round(track.volume * 100)}%
            </Text>
          </View>
        </View>

        {track.isProcessing && (
          <View style={styles.processingContainer}>
            <LinearGradient
              colors={['#8B5CF6', '#3B82F6']}
              style={styles.processingBar}
            />
            <Text style={styles.processingText}>Processing...</Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradient: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  trackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  trackName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  volumeContainer: {
    marginTop: 8,
  },
  volumeLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sliderTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    marginRight: 12,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    borderRadius: 3,
  },
  volumeValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    minWidth: 40,
  },
  processingContainer: {
    marginTop: 12,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  processingBar: {
    height: '100%',
    width: '60%',
  },
  processingText: {
    fontSize: 12,
    color: '#8B5CF6',
    marginTop: 8,
    textAlign: 'center',
  },
});