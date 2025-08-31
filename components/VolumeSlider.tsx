import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Volume2, VolumeX } from 'lucide-react-native';

interface VolumeSliderProps {
  value: number;
  onValueChange: (value: number) => void;
}

export function VolumeSlider({ value, onValueChange }: VolumeSliderProps) {
  const [isMuted, setIsMuted] = useState(false);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    onValueChange(isMuted ? value : 0);
  };

  const handleVolumeChange = (newValue: number) => {
    onValueChange(newValue);
    setIsMuted(newValue === 0);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleMute}>
        {isMuted || value === 0 ? (
          <VolumeX size={20} color="#EF4444" />
        ) : (
          <Volume2 size={20} color="#9CA3AF" />
        )}
      </TouchableOpacity>
      
      <View style={styles.sliderContainer}>
        <View style={styles.track} />
        <View style={[styles.progress, { width: `${value * 100}%` }]} />
        <TouchableOpacity 
          style={[styles.thumb, { left: `${value * 100}%` }]}
          onPress={() => {}}
        />
      </View>

      <View style={styles.volumeButtons}>
        <TouchableOpacity onPress={() => handleVolumeChange(Math.max(0, value - 0.1))}>
          <Volume2 size={16} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sliderContainer: {
    flex: 1,
    height: 20,
    justifyContent: 'center',
    marginHorizontal: 16,
    position: 'relative',
  },
  track: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
  },
  progress: {
    position: 'absolute',
    height: 4,
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    width: 16,
    height: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    top: -6,
    marginLeft: -8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  volumeButtons: {
    padding: 8,
  },
});