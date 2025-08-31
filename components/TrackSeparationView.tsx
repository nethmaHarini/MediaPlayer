import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Volume2, VolumeX, Download } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { VolumeSlider } from './VolumeSlider';

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
  onDownload,
}: TrackSeparationViewProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[
          `${track.color}20`,
          `${track.color}10`,
          'rgba(255, 255, 255, 0.05)',
        ]}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.trackInfo}>
            <View
              style={[styles.iconContainer, { backgroundColor: track.color }]}
            >
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

            <TouchableOpacity style={styles.actionButton} onPress={onDownload}>
              <Download size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.volumeContainer}>
          <VolumeSlider
            value={track.volume}
            onValueChange={onVolumeChange}
            trackName={track.name}
          />
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
