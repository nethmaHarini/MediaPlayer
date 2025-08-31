import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface WaveformViewProps {
  duration: number;
  position: number;
  onSeek: (position: number) => void;
}

const { width } = Dimensions.get('window');

export function WaveformView({ duration, position, onSeek }: WaveformViewProps) {
  const [waveformData] = useState(() => {
    // Generate mock waveform data
    return Array.from({ length: 100 }, () => Math.random() * 0.8 + 0.2);
  });

  const progress = duration > 0 ? position / duration : 0;

  const handlePress = (event: any) => {
    const { locationX } = event.nativeEvent;
    const containerWidth = width - 40; // Account for padding
    const seekPosition = (locationX / containerWidth) * duration;
    onSeek(seekPosition);
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.waveform}>
        {waveformData.map((amplitude, index) => {
          const barProgress = index / waveformData.length;
          const isPlayed = barProgress <= progress;
          
          return (
            <View
              key={index}
              style={[
                styles.waveformBar,
                {
                  height: amplitude * 60,
                  backgroundColor: isPlayed ? '#8B5CF6' : 'rgba(255, 255, 255, 0.3)',
                },
              ]}
            />
          );
        })}
      </View>
      
      <View style={[styles.progressIndicator, { left: progress * (width - 40) }]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 80,
    marginVertical: 20,
    position: 'relative',
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
    paddingHorizontal: 2,
  },
  waveformBar: {
    width: 2,
    borderRadius: 1,
    marginHorizontal: 0.5,
  },
  progressIndicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
});