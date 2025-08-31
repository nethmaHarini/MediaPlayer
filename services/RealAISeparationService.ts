import * as FileSystem from 'expo-file-system';

export interface SeparationProgress {
  stage: 'uploading' | 'processing' | 'downloading' | 'complete';
  progress: number;
  message: string;
}

export interface SeparatedTracks {
  vocals: string;
  instrumental: string; // maps to accompaniment from backend
  drums: string;
  bass: string;
  other: string;
}

class RealAISeparationService {
  private static instance: RealAISeparationService;
  private readonly BACKEND_URL = 'http://localhost:5000'; // Local backend for development

  public static getInstance(): RealAISeparationService {
    if (!RealAISeparationService.instance) {
      RealAISeparationService.instance = new RealAISeparationService();
    }
    return RealAISeparationService.instance;
  }

  private constructor() {
    console.log('🎵 Real AI Separation Service initialized (Librosa Backend)');
    console.log(`📡 Backend URL: ${this.BACKEND_URL}`);
  }

  async separateAudio(
    audioUri: string,
    onProgress?: (progress: SeparationProgress) => void
  ): Promise<SeparatedTracks> {
    try {
      console.log('🚀 Starting real AI separation...');

      // Check if backend is available
      await this.checkBackendHealth();

      onProgress?.({
        stage: 'uploading',
        progress: 10,
        message: 'Uploading audio to AI backend...',
      });

      // Prepare file for upload
      const formData = new FormData();

      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(audioUri);
      if (!fileInfo.exists) {
        throw new Error('Audio file not found');
      }

      // Create file object for upload
      const audioFile = {
        uri: audioUri,
        type: 'audio/mp3',
        name: 'audio.mp3',
      } as any;

      formData.append('file', audioFile); // backend expects 'file' field

      onProgress?.({
        stage: 'uploading',
        progress: 30,
        message: 'Sending to AI for processing...',
      });

      // Upload and separate
      console.log('📤 Uploading to backend for AI separation...');
      const response = await fetch(`${this.BACKEND_URL}/separate`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Backend error: ${response.status}`);
      }

      const result = await response.json();
      console.log('🎉 AI separation completed!', result);

      onProgress?.({
        stage: 'downloading',
        progress: 70,
        message: 'Downloading separated tracks...',
      });

      // Download all separated tracks
      const tracks = await this.downloadSeparatedTracks(result, onProgress);

      onProgress?.({
        stage: 'complete',
        progress: 100,
        message: 'Real AI separation complete!',
      });

      return tracks;
    } catch (error) {
      console.error('❌ Real AI separation failed:', error);
      throw error;
    }
  }

  private async checkBackendHealth(): Promise<void> {
    try {
      console.log('🔍 Checking backend health...');
      const response = await fetch(`${this.BACKEND_URL}/health`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Backend health check failed: ${response.status}`);
      }

      const health = await response.json();
      console.log('✅ Backend is healthy:', health);
    } catch (error) {
      console.error('❌ Backend health check failed:', error);
      throw new Error(
        `Cannot connect to AI backend at ${this.BACKEND_URL}. ` +
          'Make sure the Python Librosa backend is running. ' +
          'Run "python backend/app-librosa.py" to start it.'
      );
    }
  }

  private async downloadSeparatedTracks(
    result: any,
    onProgress?: (progress: SeparationProgress) => void
  ): Promise<SeparatedTracks> {
    const documentDirectory = FileSystem.documentDirectory;
    const tracksDirectory = `${documentDirectory}real_ai_tracks/`;

    await FileSystem.makeDirectoryAsync(tracksDirectory, {
      intermediates: true,
    });

    // The backend returns direct URLs for each track
    const trackMappings = {
      vocals: result.vocals_url,
      drums: result.drums_url,
      bass: result.bass_url,
      other: result.other_url,
      instrumental: result.other_url, // Use 'other' as instrumental
    };

    const downloadedTracks: any = {};

    let trackIndex = 0;
    for (const [trackName, trackUrl] of Object.entries(trackMappings)) {
      if (!trackUrl) {
        throw new Error(`Missing ${trackName} track URL from backend`);
      }

      const progress =
        70 + (trackIndex / Object.keys(trackMappings).length) * 25;
      onProgress?.({
        stage: 'downloading',
        progress,
        message: `Downloading ${trackName} track...`,
      });

      // Create full URL for download
      const fullUrl = `${this.BACKEND_URL}${trackUrl}`;

      console.log(`📥 Downloading ${trackName}: ${fullUrl}`);

      const downloadResult = await FileSystem.downloadAsync(
        fullUrl,
        `${tracksDirectory}${trackName}.wav`
      );

      if (downloadResult.status !== 200) {
        throw new Error(`Failed to download ${trackName} track`);
      }

      downloadedTracks[trackName] = downloadResult.uri;
      console.log(`✅ Downloaded ${trackName}: ${downloadResult.uri}`);

      trackIndex++;
    }

    return downloadedTracks as SeparatedTracks;
  }

  async downloadTrack(trackName: string, trackUri: string): Promise<string> {
    try {
      const downloadsDirectory = `${FileSystem.documentDirectory}downloads/`;
      await FileSystem.makeDirectoryAsync(downloadsDirectory, {
        intermediates: true,
      });

      const fileName = `${trackName}_real_ai_${Date.now()}.wav`;
      const downloadUri = `${downloadsDirectory}${fileName}`;

      await FileSystem.copyAsync({
        from: trackUri,
        to: downloadUri,
      });

      return downloadUri;
    } catch (error) {
      console.error('Download failed:', error);
      throw new Error('Failed to download track');
    }
  }

  async cleanupTempFiles(): Promise<void> {
    try {
      const tempDirectory = `${FileSystem.documentDirectory}real_ai_tracks/`;
      const directoryInfo = await FileSystem.getInfoAsync(tempDirectory);

      if (directoryInfo.exists) {
        await FileSystem.deleteAsync(tempDirectory);
        console.log('🧹 Cleaned up temporary AI tracks');
      }
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  }
}

export const realAISeparationService = RealAISeparationService.getInstance();
