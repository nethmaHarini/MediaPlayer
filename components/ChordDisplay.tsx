import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Music, BarChart3 } from 'lucide-react-native';

interface ChordDisplayProps {
  position: number;
  duration: number;
  isPlaying: boolean;
}

interface Chord {
  time: number;
  name: string;
  quality: string;
  confidence: number;
  notes: string[];
}

interface ChordAnalysis {
  key: string;
  scale: string;
  tempo: number;
  timeSignature: string;
}

export function ChordDisplay({
  position,
  duration,
  isPlaying,
}: ChordDisplayProps) {
  const [chords] = useState<Chord[]>([
    {
      time: 0,
      name: 'C',
      quality: 'major',
      confidence: 0.95,
      notes: ['C', 'E', 'G'],
    },
    {
      time: 4000,
      name: 'Am',
      quality: 'minor',
      confidence: 0.89,
      notes: ['A', 'C', 'E'],
    },
    {
      time: 8000,
      name: 'F',
      quality: 'major',
      confidence: 0.92,
      notes: ['F', 'A', 'C'],
    },
    {
      time: 12000,
      name: 'G',
      quality: 'major',
      confidence: 0.96,
      notes: ['G', 'B', 'D'],
    },
    {
      time: 16000,
      name: 'C',
      quality: 'major',
      confidence: 0.94,
      notes: ['C', 'E', 'G'],
    },
    {
      time: 20000,
      name: 'Am',
      quality: 'minor',
      confidence: 0.87,
      notes: ['A', 'C', 'E'],
    },
    {
      time: 24000,
      name: 'Dm',
      quality: 'minor',
      confidence: 0.9,
      notes: ['D', 'F', 'A'],
    },
    {
      time: 28000,
      name: 'G',
      quality: 'major',
      confidence: 0.93,
      notes: ['G', 'B', 'D'],
    },
    {
      time: 32000,
      name: 'Em',
      quality: 'minor',
      confidence: 0.88,
      notes: ['E', 'G', 'B'],
    },
    {
      time: 36000,
      name: 'F',
      quality: 'major',
      confidence: 0.91,
      notes: ['F', 'A', 'C'],
    },
    {
      time: 40000,
      name: 'C',
      quality: 'major',
      confidence: 0.97,
      notes: ['C', 'E', 'G'],
    },
    {
      time: 44000,
      name: 'G',
      quality: 'major',
      confidence: 0.95,
      notes: ['G', 'B', 'D'],
    },
  ]);

  const [analysis] = useState<ChordAnalysis>({
    key: 'C Major',
    scale: 'Major',
    tempo: 120,
    timeSignature: '4/4',
  });

  const [currentChordIndex, setCurrentChordIndex] = useState(0);
  const [showAnalysis, setShowAnalysis] = useState(false);

  useEffect(() => {
    if (isPlaying) {
      const currentIndex = chords.findIndex((chord, index) => {
        const nextChord = chords[index + 1];
        return (
          position >= chord.time && (!nextChord || position < nextChord.time)
        );
      });

      if (currentIndex !== -1) {
        setCurrentChordIndex(currentIndex);
      }
    }
  }, [position, isPlaying, chords]);

  const getChordColor = (quality: string, confidence: number) => {
    const alpha = Math.max(0.6, confidence);
    switch (quality) {
      case 'major':
        return `rgba(16, 185, 129, ${alpha})`;
      case 'minor':
        return `rgba(59, 130, 246, ${alpha})`;
      case 'diminished':
        return `rgba(239, 68, 68, ${alpha})`;
      case 'augmented':
        return `rgba(245, 158, 11, ${alpha})`;
      case 'sus2':
      case 'sus4':
        return `rgba(168, 85, 247, ${alpha})`;
      case '7th':
        return `rgba(236, 72, 153, ${alpha})`;
      default:
        return `rgba(156, 163, 175, ${alpha})`;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const currentChord = chords[currentChordIndex];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setShowAnalysis(!showAnalysis)}
        >
          <Music size={20} color="#8B5CF6" />
          <Text style={styles.headerTitle}>Chord Analysis</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setShowAnalysis(!showAnalysis)}
        >
          <BarChart3 size={16} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {showAnalysis && (
        <View style={styles.analysisContainer}>
          <View style={styles.analysisGrid}>
            <View style={styles.analysisItem}>
              <Text style={styles.analysisLabel}>Key</Text>
              <Text style={styles.analysisValue}>{analysis.key}</Text>
            </View>
            <View style={styles.analysisItem}>
              <Text style={styles.analysisLabel}>Tempo</Text>
              <Text style={styles.analysisValue}>{analysis.tempo} BPM</Text>
            </View>
            <View style={styles.analysisItem}>
              <Text style={styles.analysisLabel}>Time</Text>
              <Text style={styles.analysisValue}>{analysis.timeSignature}</Text>
            </View>
            <View style={styles.analysisItem}>
              <Text style={styles.analysisLabel}>Scale</Text>
              <Text style={styles.analysisValue}>{analysis.scale}</Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.currentChord}>
        <LinearGradient
          colors={[
            getChordColor(
              currentChord?.quality || 'major',
              currentChord?.confidence || 1
            ),
            'rgba(139, 92, 246, 0.3)',
          ]}
          style={styles.currentChordBackground}
        >
          <Text style={styles.currentChordText}>
            {currentChord?.name || 'C'}
          </Text>
          <Text style={styles.currentChordQuality}>
            {currentChord?.quality || 'major'}
          </Text>

          {currentChord && (
            <View style={styles.notesContainer}>
              {currentChord.notes.map((note, index) => (
                <View key={index} style={styles.noteChip}>
                  <Text style={styles.noteText}>{note}</Text>
                </View>
              ))}
            </View>
          )}

          {currentChord && (
            <View style={styles.confidenceContainer}>
              <Text style={styles.confidenceLabel}>Confidence</Text>
              <View style={styles.confidenceBar}>
                <View
                  style={[
                    styles.confidenceFill,
                    { width: `${currentChord.confidence * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.confidenceText}>
                {Math.round(currentChord.confidence * 100)}%
              </Text>
            </View>
          )}
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
            <TouchableOpacity
              key={index}
              style={[
                styles.chordItem,
                isActive && styles.activeChordItem,
                isPast && !isActive && styles.pastChordItem,
              ]}
            >
              <Text
                style={[
                  styles.chordName,
                  isActive && styles.activeChordName,
                  isPast && !isActive && styles.pastChordName,
                ]}
              >
                {chord.name}
              </Text>
              <Text
                style={[styles.chordTime, isActive && styles.activeChordTime]}
              >
                {formatTime(chord.time)}
              </Text>
              <View style={styles.confidenceDot}>
                <View
                  style={[
                    styles.confidenceDotFill,
                    {
                      backgroundColor: getChordColor(
                        chord.quality,
                        chord.confidence
                      ),
                      transform: [{ scale: chord.confidence }],
                    },
                  ]}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${(position / duration) * 100}%` },
          ]}
        />
        {chords.map((chord, index) => (
          <View
            key={index}
            style={[
              styles.chordMarker,
              { left: `${(chord.time / duration) * 100}%` },
            ]}
          />
        ))}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  toggleButton: {
    padding: 8,
  },
  analysisContainer: {
    marginBottom: 20,
  },
  analysisGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  analysisItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
  },
  analysisLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  analysisValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
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
    minWidth: 200,
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
    marginBottom: 12,
  },
  notesContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  noteChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  noteText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  confidenceContainer: {
    width: '100%',
    alignItems: 'center',
  },
  confidenceLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 6,
  },
  confidenceBar: {
    width: 120,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: 4,
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  confidenceText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
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
    minWidth: 70,
    position: 'relative',
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
    fontSize: 10,
    color: '#6B7280',
    marginTop: 4,
  },
  activeChordTime: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  confidenceDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
  },
  confidenceDotFill: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
  },
  chordMarker: {
    position: 'absolute',
    top: -2,
    width: 2,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 1,
  },
});
