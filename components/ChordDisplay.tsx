import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ChordDisplayProps {
  position: number;
  duration: number;
  isPlaying: boolean;
}

interface Chord {
  time: number;
  name: string;
  quality: string;
}

export function ChordDisplay({ position, duration, isPlaying }: ChordDisplayProps) {
  const [chords] = useState<Chord[]>([
    { time: 0, name: 'C', quality: 'major' },
    { time: 4000, name: 'Am', quality: 'minor' },
    { time: 8000, name: 'F', quality: 'major' },
    { time: 12000, name: 'G', quality: 'major' },
    { time: 16000, name: 'C', quality: 'major' },
    { time: 20000, name: 'Am', quality: 'minor' },
    { time: 24000, name: 'Dm', quality: 'minor' },
    { time: 28000, name: 'G', quality: 'major' },
    { time: 32000, name: 'Em', quality: 'minor' },
    { time: 36000, name: 'F', quality: 'major' },
    { time: 40000, name: 'C', quality: 'major' },
    { time: 44000, name: 'G', quality: 'major' },
  ]);

  const [currentChordIndex, setCurrentChordIndex] = useState(0);

  useEffect(() => {
    if (isPlaying) {
      const currentIndex = chords.findIndex((chord, index) => {
        const nextChord = chords[index + 1];
        return position >= chord.time && (!nextChord || position < nextChord.time);
      });
      
      if (currentIndex !== -1) {
        setCurrentChordIndex(currentIndex);
      }
    }
  }, [position, isPlaying, chords]);

  const getChordColor = (quality: string) => {
    switch (quality) {
      case 'major': return '#10B981';
      case 'minor': return '#3B82F6';
      case 'diminished': return '#EF4444';
      case 'augmented': return '#F59E0B';
      default: return '#9CA3AF';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chord Progression</Text>
      
      <View style={styles.currentChord}>
        <LinearGradient
          colors={[
            getChordColor(chords[currentChordIndex]?.quality || 'major'),
            'rgba(139, 92, 246, 0.3)'
          ]}
          style={styles.currentChordBackground}
        >
          <Text style={styles.currentChordText}>
            {chords[currentChordIndex]?.name || 'C'}
          </Text>
          <Text style={styles.currentChordQuality}>
            {chords[currentChordIndex]?.quality || 'major'}
          </Text>
        </LinearGradient>
      </View>

      <ScrollView 
        horizontal 
        style={styles.chordTimeline}
        showsHorizontalScrollIndicator={false}
      >
        {chords.map((chord, index) => {
          const isActive = index === currentChordIndex;
          const isPast = position > chord.time;
          
          return (
            <View 
              key={index} 
              style={[
                styles.chordItem,
                isActive && styles.activeChordItem,
                isPast && !isActive && styles.pastChordItem,
              ]}
            >
              <Text style={[
                styles.chordName,
                isActive && styles.activeChordName,
                isPast && !isActive && styles.pastChordName,
              ]}>
                {chord.name}
              </Text>
              <Text style={[
                styles.chordTime,
                isActive && styles.activeChordTime,
              ]}>
                {Math.floor(chord.time / 1000)}s
              </Text>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(position / duration) * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    margin: 20,
    borderRadius: 16,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  currentChord: {
    alignItems: 'center',
    marginBottom: 24,
  },
  currentChordBackground: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  currentChordText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  currentChordQuality: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'capitalize',
  },
  chordTimeline: {
    marginBottom: 16,
  },
  chordItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 60,
  },
  activeChordItem: {
    backgroundColor: '#8B5CF6',
    transform: [{ scale: 1.1 }],
  },
  pastChordItem: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
  },
  chordName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  activeChordName: {
    color: '#FFFFFF',
  },
  pastChordName: {
    color: '#FFFFFF',
  },
  chordTime: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  activeChordTime: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
  },
});