import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Animated,
} from 'react-native';
import { Volume2, VolumeX, Volume1 } from 'lucide-react-native';

interface VolumeSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  trackName?: string;
}

export function VolumeSlider({
  value,
  onValueChange,
  trackName,
}: VolumeSliderProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(value);
  const sliderWidth = useRef(0);
  const animatedValue = useRef(new Animated.Value(value)).current;

  const toggleMute = () => {
    if (isMuted) {
      // Unmute: restore previous volume
      const restoreVolume = previousVolume > 0 ? previousVolume : 0.5;
      onValueChange(restoreVolume);
      setIsMuted(false);
      Animated.timing(animatedValue, {
        toValue: restoreVolume,
        duration: 200,
        useNativeDriver: false,
      }).start();
    } else {
      // Mute: save current volume and set to 0
      setPreviousVolume(value);
      onValueChange(0);
      setIsMuted(true);
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleVolumeChange = (newValue: number) => {
    const clampedValue = Math.max(0, Math.min(1, newValue));
    onValueChange(clampedValue);
    setIsMuted(clampedValue === 0);

    if (clampedValue > 0) {
      setPreviousVolume(clampedValue);
    }

    Animated.timing(animatedValue, {
      toValue: clampedValue,
      duration: 100,
      useNativeDriver: false,
    }).start();
  };

  const handleSliderPress = (event: any) => {
    const { locationX } = event.nativeEvent;
    const newValue = locationX / sliderWidth.current;
    handleVolumeChange(newValue);
  };

  const getVolumeIcon = () => {
    if (isMuted || value === 0) {
      return <VolumeX size={24} color="#EF4444" />;
    } else if (value < 0.5) {
      return <Volume1 size={24} color="#8B5CF6" />;
    } else {
      return <Volume2 size={24} color="#8B5CF6" />;
    }
  };

  const getVolumePercentage = () => {
    return Math.round(value * 100);
  };

  const quickVolumeSet = (targetVolume: number) => {
    handleVolumeChange(targetVolume);
  };

  return (
    <View style={styles.container}>
      {/* Track name label */}
      {trackName && (
        <View style={styles.trackNameContainer}>
          <Text style={styles.trackName}>{trackName}</Text>
        </View>
      )}

      <View style={styles.volumeControls}>
        {/* Mute/Unmute button */}
        <TouchableOpacity onPress={toggleMute} style={styles.muteButton}>
          {getVolumeIcon()}
        </TouchableOpacity>

        {/* Main slider container */}
        <View style={styles.sliderContainer}>
          <TouchableOpacity
            style={styles.sliderTrack}
            onPress={handleSliderPress}
            onLayout={(event) => {
              sliderWidth.current = event.nativeEvent.layout.width;
            }}
            activeOpacity={0.8}
          >
            {/* Background track */}
            <View style={styles.track} />

            {/* Progress track */}
            <Animated.View
              style={[
                styles.progress,
                {
                  width: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />

            {/* Slider thumb */}
            <Animated.View
              style={[
                styles.thumb,
                {
                  left: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                  transform: [{ scale: isDragging ? 1.2 : 1 }],
                },
              ]}
            />
          </TouchableOpacity>
        </View>

        {/* Volume percentage display */}
        <View style={styles.volumeDisplay}>
          <Text style={styles.volumeText}>{getVolumePercentage()}%</Text>
        </View>
      </View>

      {/* Quick volume presets */}
      <View style={styles.quickControls}>
        <TouchableOpacity
          style={[
            styles.quickButton,
            value === 0.25 && styles.quickButtonActive,
          ]}
          onPress={() => quickVolumeSet(0.25)}
        >
          <Text
            style={[
              styles.quickButtonText,
              value === 0.25 && styles.quickButtonTextActive,
            ]}
          >
            25%
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.quickButton,
            value === 0.5 && styles.quickButtonActive,
          ]}
          onPress={() => quickVolumeSet(0.5)}
        >
          <Text
            style={[
              styles.quickButtonText,
              value === 0.5 && styles.quickButtonTextActive,
            ]}
          >
            50%
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.quickButton,
            value === 0.75 && styles.quickButtonActive,
          ]}
          onPress={() => quickVolumeSet(0.75)}
        >
          <Text
            style={[
              styles.quickButtonText,
              value === 0.75 && styles.quickButtonTextActive,
            ]}
          >
            75%
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.quickButton,
            value === 1.0 && styles.quickButtonActive,
          ]}
          onPress={() => quickVolumeSet(1.0)}
        >
          <Text
            style={[
              styles.quickButtonText,
              value === 1.0 && styles.quickButtonTextActive,
            ]}
          >
            100%
          </Text>
        </TouchableOpacity>
      </View>

      {/* Fine adjustment buttons */}
      <View style={styles.fineControls}>
        <TouchableOpacity
          style={styles.fineButton}
          onPress={() => handleVolumeChange(value - 0.05)}
          disabled={value <= 0}
        >
          <Text
            style={[
              styles.fineButtonText,
              value <= 0 && styles.fineButtonDisabled,
            ]}
          >
            -5%
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.fineButton}
          onPress={() => handleVolumeChange(value + 0.05)}
          disabled={value >= 1}
        >
          <Text
            style={[
              styles.fineButtonText,
              value >= 1 && styles.fineButtonDisabled,
            ]}
          >
            +5%
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 12,
    marginVertical: 8,
  },
  trackNameContainer: {
    marginBottom: 12,
    alignItems: 'center',
  },
  trackName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  volumeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  muteButton: {
    padding: 8,
    marginRight: 12,
  },
  sliderContainer: {
    flex: 1,
    marginHorizontal: 8,
  },
  sliderTrack: {
    height: 40,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  track: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
  },
  progress: {
    position: 'absolute',
    height: 6,
    backgroundColor: '#8B5CF6',
    borderRadius: 3,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  thumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    top: -7,
    marginLeft: -10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  volumeDisplay: {
    minWidth: 45,
    alignItems: 'center',
    marginLeft: 12,
  },
  volumeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  quickControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  quickButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  quickButtonActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  quickButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  quickButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  fineControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  fineButton: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
  },
  fineButtonText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#8B5CF6',
  },
  fineButtonDisabled: {
    color: 'rgba(139, 92, 246, 0.4)',
  },
});
