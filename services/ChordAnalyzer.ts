export interface Chord {
  time: number;
  name: string;
  quality:
    | 'major'
    | 'minor'
    | 'diminished'
    | 'augmented'
    | 'sus2'
    | 'sus4'
    | '7th'
    | 'maj7'
    | 'min7';
  confidence: number;
  notes: string[];
  duration: number;
}

export interface ChordProgression {
  chords: Chord[];
  key: string;
  scale: 'major' | 'minor';
  tempo: number;
  timeSignature: string;
  confidence: number;
}

export interface RealTimeChordData {
  currentChord: Chord | null;
  upcomingChords: Chord[];
  progression: string[];
}

class ChordAnalyzer {
  private apiEndpoint = 'https://your-chord-ai-backend.com/api'; // Replace with your backend
  private isAnalyzing = false;

  async analyzeChords(audioUri: string): Promise<ChordProgression> {
    try {
      this.isAnalyzing = true;

      // In a real implementation, you would send the audio to your AI service
      // For now, we'll generate mock chord data based on common progressions

      const mockProgression = this.generateMockProgression();

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      this.isAnalyzing = false;
      return mockProgression;
    } catch (error) {
      this.isAnalyzing = false;
      console.error('Chord analysis failed:', error);
      throw new Error('Failed to analyze chords');
    }
  }

  async analyzeRealTime(
    audioBuffer: ArrayBuffer,
    position: number
  ): Promise<RealTimeChordData> {
    // This would integrate with a real-time chord detection AI
    // For now, return mock data based on position

    const mockChords = this.getMockChordsAtPosition(position);

    return {
      currentChord: mockChords.current,
      upcomingChords: mockChords.upcoming,
      progression: mockChords.progressionNames,
    };
  }

  private generateMockProgression(): ChordProgression {
    const commonProgressions = [
      // I-vi-IV-V progression in C major
      [
        { name: 'C', quality: 'major' as const, notes: ['C', 'E', 'G'] },
        { name: 'Am', quality: 'minor' as const, notes: ['A', 'C', 'E'] },
        { name: 'F', quality: 'major' as const, notes: ['F', 'A', 'C'] },
        { name: 'G', quality: 'major' as const, notes: ['G', 'B', 'D'] },
      ],
      // vi-IV-I-V progression
      [
        { name: 'Am', quality: 'minor' as const, notes: ['A', 'C', 'E'] },
        { name: 'F', quality: 'major' as const, notes: ['F', 'A', 'C'] },
        { name: 'C', quality: 'major' as const, notes: ['C', 'E', 'G'] },
        { name: 'G', quality: 'major' as const, notes: ['G', 'B', 'D'] },
      ],
      // ii-V-I progression
      [
        { name: 'Dm', quality: 'minor' as const, notes: ['D', 'F', 'A'] },
        { name: 'G7', quality: '7th' as const, notes: ['G', 'B', 'D', 'F'] },
        { name: 'C', quality: 'major' as const, notes: ['C', 'E', 'G'] },
      ],
    ];

    const selectedProgression = commonProgressions[0]; // Use first progression for consistency
    const chords: Chord[] = [];

    // Create a full song structure
    let currentTime = 0;
    const chordDuration = 4000; // 4 seconds per chord

    // Repeat the progression multiple times
    for (let repeat = 0; repeat < 3; repeat++) {
      for (let i = 0; i < selectedProgression.length; i++) {
        const chordTemplate = selectedProgression[i];
        chords.push({
          time: currentTime,
          name: chordTemplate.name,
          quality: chordTemplate.quality,
          confidence: 0.85 + Math.random() * 0.15, // Random confidence between 0.85-1.0
          notes: chordTemplate.notes,
          duration: chordDuration,
        });
        currentTime += chordDuration;
      }
    }

    return {
      chords,
      key: 'C Major',
      scale: 'major',
      tempo: 120,
      timeSignature: '4/4',
      confidence: 0.92,
    };
  }

  private getMockChordsAtPosition(position: number): {
    current: Chord | null;
    upcoming: Chord[];
    progressionNames: string[];
  } {
    const mockChords = this.generateMockProgression().chords;

    // Find current chord
    const currentIndex = mockChords.findIndex((chord, index) => {
      const nextChord = mockChords[index + 1];
      return (
        position >= chord.time && (!nextChord || position < nextChord.time)
      );
    });

    const current = currentIndex >= 0 ? mockChords[currentIndex] : null;
    const upcoming = mockChords.slice(currentIndex + 1, currentIndex + 4);
    const progressionNames = mockChords.map((chord) => chord.name);

    return {
      current,
      upcoming,
      progressionNames,
    };
  }

  detectKeySignature(chords: Chord[]): { key: string; confidence: number } {
    // Simple key detection based on chord frequency
    const chordCounts = new Map<string, number>();

    chords.forEach((chord) => {
      const root = chord.name.charAt(0);
      chordCounts.set(root, (chordCounts.get(root) || 0) + 1);
    });

    // Find most frequent root note
    let mostFrequent = '';
    let maxCount = 0;
    for (const [root, count] of chordCounts.entries()) {
      if (count > maxCount) {
        maxCount = count;
        mostFrequent = root;
      }
    }

    // Determine if major or minor based on chord qualities
    const majorChords = chords.filter((c) => c.quality === 'major').length;
    const minorChords = chords.filter((c) => c.quality === 'minor').length;
    const scale = majorChords >= minorChords ? 'Major' : 'Minor';

    return {
      key: `${mostFrequent} ${scale}`,
      confidence: Math.min(0.95, 0.6 + maxCount / chords.length),
    };
  }

  analyzeTempo(chords: Chord[]): number {
    if (chords.length < 2) return 120; // Default BPM

    // Calculate average time between chords
    const intervals: number[] = [];
    for (let i = 1; i < chords.length; i++) {
      intervals.push(chords[i].time - chords[i - 1].time);
    }

    const averageInterval =
      intervals.reduce((a, b) => a + b, 0) / intervals.length;

    // Convert interval to BPM (assuming each chord is one beat)
    const bpm = 60000 / averageInterval; // 60000 ms = 1 minute

    // Round to nearest common BPM
    const commonBPMs = [
      60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180,
    ];
    const closest = commonBPMs.reduce((prev, curr) =>
      Math.abs(curr - bpm) < Math.abs(prev - bpm) ? curr : prev
    );

    return closest;
  }

  getChordSuggestions(currentChord: Chord): Chord[] {
    // Common chord progressions and suggestions
    const progressionMap: Record<string, string[]> = {
      C: ['Am', 'F', 'G', 'Dm'],
      Am: ['F', 'C', 'G', 'Dm'],
      F: ['C', 'G', 'Am', 'Dm'],
      G: ['C', 'Am', 'F', 'Em'],
      Dm: ['G', 'C', 'Am', 'F'],
      Em: ['Am', 'C', 'D', 'G'],
    };

    const suggestions = progressionMap[currentChord.name] || [
      'C',
      'Am',
      'F',
      'G',
    ];

    return suggestions.map((name) => ({
      time: currentChord.time + currentChord.duration,
      name,
      quality: name.includes('m') ? ('minor' as const) : ('major' as const),
      confidence: 0.8,
      notes: this.getChordNotes(name),
      duration: 4000,
    }));
  }

  private getChordNotes(chordName: string): string[] {
    const chordMap: Record<string, string[]> = {
      C: ['C', 'E', 'G'],
      Am: ['A', 'C', 'E'],
      F: ['F', 'A', 'C'],
      G: ['G', 'B', 'D'],
      Dm: ['D', 'F', 'A'],
      Em: ['E', 'G', 'B'],
      G7: ['G', 'B', 'D', 'F'],
    };

    return chordMap[chordName] || ['C', 'E', 'G'];
  }

  get isCurrentlyAnalyzing(): boolean {
    return this.isAnalyzing;
  }

  // Legacy methods for backward compatibility
  static async analyzeChords(audioBuffer: ArrayBuffer) {
    const analyzer = new ChordAnalyzer();
    const progression = await analyzer.analyzeChords('');
    return progression.chords.map((chord) => ({
      time: chord.time,
      chord: chord.name,
      quality: chord.quality,
      confidence: chord.confidence,
    }));
  }

  static detectKey(chords: any[]): string {
    const analyzer = new ChordAnalyzer();
    const chordObjects = chords.map((c) => ({
      time: c.time,
      name: c.chord,
      quality: c.quality,
      confidence: c.confidence,
      notes: analyzer.getChordNotes(c.chord),
      duration: 4000,
    }));

    return analyzer.detectKeySignature(chordObjects).key;
  }

  static getChordSuggestions(currentChord: string, key: string): string[] {
    const analyzer = new ChordAnalyzer();
    const chord = {
      time: 0,
      name: currentChord,
      quality: 'major' as const,
      confidence: 1,
      notes: analyzer.getChordNotes(currentChord),
      duration: 4000,
    };

    return analyzer.getChordSuggestions(chord).map((c) => c.name);
  }
}

export const chordAnalyzer = new ChordAnalyzer();
