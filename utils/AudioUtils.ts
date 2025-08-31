export class AudioUtils {
  static formatDuration(milliseconds: number): string {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  static generateWaveformData(duration: number, samples: number = 100): number[] {
    // Generate mock waveform data
    // In production, this would analyze the actual audio
    return Array.from({ length: samples }, (_, i) => {
      const progress = i / samples;
      const base = Math.sin(progress * Math.PI * 4) * 0.3 + 0.5;
      const noise = (Math.random() - 0.5) * 0.4;
      return Math.max(0.1, Math.min(1, base + noise));
    });
  }

  static calculateFrequencySpectrum(audioData: Float32Array): number[] {
    // Mock frequency analysis
    // In production, this would use FFT
    return Array.from({ length: 32 }, () => Math.random() * 0.8 + 0.2);
  }

  static detectTempo(audioBuffer: ArrayBuffer): number {
    // Mock tempo detection
    // In production, this would analyze beat patterns
    return Math.floor(Math.random() * 60) + 100; // 100-160 BPM
  }

  static extractYouTubeId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  }

  static async convertYouTubeToAudio(videoId: string): Promise<string> {
    // Mock YouTube to audio conversion
    // In production, this would use a backend service
    return `https://example.com/api/youtube-audio/${videoId}.mp3`;
  }
}