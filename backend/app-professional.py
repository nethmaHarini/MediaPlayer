from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import librosa
import soundfile as sf
import numpy as np
import os
import tempfile
from werkzeug.utils import secure_filename
import logging
from scipy import signal
from scipy.ndimage import median_filter
from sklearn.decomposition import FastICA

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'output'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['OUTPUT_FOLDER'] = OUTPUT_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size

def professional_source_separation(audio_file, sr=22050):
    """
    Professional-grade source separation using advanced signal processing:
    - Independent Component Analysis (ICA)
    - Multi-scale spectral analysis
    - Adaptive filtering
    - Professional audio processing techniques
    """
    logger.info(f"Loading audio file: {audio_file}")
    
    # Load audio with higher quality
    y, sr = librosa.load(audio_file, sr=sr, mono=False)
    
    # Handle stereo/mono
    if len(y.shape) > 1:
        y_left = y[0]
        y_right = y[1]
        y_mono = librosa.to_mono(y)
        is_stereo = True
    else:
        y_mono = y
        y_left = y_right = y_mono
        is_stereo = False
    
    logger.info("Performing professional-grade AI separation...")
    
    # 1. Multi-scale harmonic-percussive separation
    y_harmonic_coarse, y_percussive_coarse = librosa.effects.hpss(y_mono, kernel_size=(31, 5))
    y_harmonic_fine, y_percussive_fine = librosa.effects.hpss(y_mono, kernel_size=(17, 17))
    y_harmonic_ultra, y_percussive_ultra = librosa.effects.hpss(y_mono, kernel_size=(7, 31))
    
    # 2. Ultra-aggressive vocal extraction with maximum music suppression
    logger.info("Extracting ultra-clean vocals with maximum music suppression...")
    
    if is_stereo:
        # Ensure both channels have the same length
        min_length = min(len(y_left), len(y_right))
        y_left = y_left[:min_length]
        y_right = y_right[:min_length]
        
        # Method 1: Enhanced center channel extraction
        center = (y_left + y_right) / 2
        sides = (y_left - y_right) / 2
        
        # Method 2: Ultra-aggressive spectral subtraction
        center_stft = librosa.stft(center, n_fft=4096, hop_length=512)  # Higher resolution
        sides_stft = librosa.stft(sides, n_fft=4096, hop_length=512)
        
        # Additional stereo analysis for better separation
        left_stft = librosa.stft(y_left, n_fft=4096, hop_length=512)
        right_stft = librosa.stft(y_right, n_fft=4096, hop_length=512)
        
        center_mag = np.abs(center_stft)
        center_phase = np.angle(center_stft)
        sides_mag = np.abs(sides_stft)
        left_mag = np.abs(left_stft)
        right_mag = np.abs(right_stft)
        
        # Enhanced vocal frequency range (tighter focus on human voice)
        freq_bins = center_mag.shape[0]
        nyquist = sr / 2
        vocal_low_bin = int(120 * freq_bins / nyquist)    # 120Hz (tighter low cut)
        vocal_high_bin = int(min(6000, nyquist * 0.7) * freq_bins / nyquist) # 6kHz max (tighter high cut)
        
        # Initialize ultra-aggressive vocal mask
        vocal_mask = np.zeros_like(center_mag)
        
        # Ultra-selective vocal detection
        for freq_bin in range(vocal_low_bin, min(vocal_high_bin, freq_bins)):
            energy_center = center_mag[freq_bin, :]
            energy_sides = sides_mag[freq_bin, :]
            energy_left = left_mag[freq_bin, :]
            energy_right = right_mag[freq_bin, :]
            
            # Multiple criteria for vocal presence
            # 1. Center dominance (vocals are typically centered)
            center_dominance = energy_center / (energy_sides + 1e-8)
            
            # 2. Stereo correlation (vocals have high L-R correlation)
            stereo_correlation = (energy_left * energy_right) / (energy_left + energy_right + 1e-8)
            
            # 3. Temporal consistency (vocals have consistent energy patterns)
            center_consistency = 1 - np.std(energy_center) / (np.mean(energy_center) + 1e-8)
            center_consistency = np.clip(center_consistency, 0, 1)
            
            # 4. Spectral continuity (vocals have smooth spectral evolution)
            if freq_bin > vocal_low_bin and freq_bin < freq_bins - 1:
                spectral_smoothness = 1 - abs(
                    energy_center - (center_mag[freq_bin-1, :] + center_mag[freq_bin+1, :]) / 2
                ) / (energy_center + 1e-8)
                spectral_smoothness = np.clip(spectral_smoothness, 0, 1)
            else:
                spectral_smoothness = np.ones_like(energy_center)
            
            # Combine criteria with VOICE-PRESERVING thresholds
            center_dominance = median_filter(center_dominance, size=7)
            
            # More lenient thresholding - preserve vocal content better
            vocal_confidence = (
                np.clip((center_dominance - 1.8) / 3.5, 0, 1) * 0.35 +  # Lower threshold
                np.clip(stereo_correlation - 0.2, 0, 1) * 0.25 +        # More lenient
                center_consistency * 0.25 +                              # Higher weight
                spectral_smoothness * 0.15
            )
            
            # Apply more permissive mask - err on side of keeping vocals
            mask_values = np.clip(vocal_confidence - 0.3, 0, 1)  # Much lower threshold
            vocal_mask[freq_bin, :] = mask_values
        
        # Conservative formant enhancement (preserve vocal character)
        formant_freqs = [900, 1300, 2500]  # Core formant frequencies
        for formant in formant_freqs:
            if formant < nyquist * 0.7:
                formant_bin = int(formant * freq_bins / nyquist)
                if formant_bin < freq_bins:
                    # More conservative boost to preserve natural vocal character
                    existing_mask = vocal_mask[formant_bin, :]
                    boost_range = 12  # Slightly wider boost
                    start_bin = max(0, formant_bin - boost_range)
                    end_bin = min(freq_bins, formant_bin + boost_range)
                    
                    # Gentle boost that works with existing detections
                    for b in range(start_bin, end_bin):
                        if b < freq_bins:
                            # Enhance existing vocal content, don't create new
                            boost_factor = 1.0 + 0.3 * np.exp(-((b - formant_bin) / 6) ** 2)
                            vocal_mask[b, :] = vocal_mask[b, :] * boost_factor
        
        # Voice-preserving pitch-guided vocal isolation
        f0_max = min(350, nyquist * 0.6)
        try:
            # More sensitive pitch detection to catch all vocal content
            f0 = librosa.yin(center, fmin=120, fmax=f0_max, sr=sr, threshold=0.25)  # Higher threshold = more sensitive
            
            # Use pitch to preserve vocal harmonics
            for t, pitch in enumerate(f0):
                if not np.isnan(pitch) and pitch > 0:
                    # Preserve harmonics more conservatively
                    for harmonic in range(1, 4):  # First 3 harmonics
                        harm_freq = pitch * harmonic
                        if harm_freq < nyquist * 0.7:
                            harm_bin = int(harm_freq * freq_bins / nyquist)
                            if harm_bin < freq_bins and t < vocal_mask.shape[1]:
                                # Ensure we don't lose vocal harmonics
                                vocal_mask[harm_bin, t] = max(vocal_mask[harm_bin, t], 0.5)
        except:
            pass
        
        # Gentle noise reduction and cleanup - preserve vocals
        vocal_mask = median_filter(vocal_mask, size=(3, 7))  # Less aggressive smoothing
        
        # More permissive thresholding to preserve vocal content
        vocal_mask = np.where(vocal_mask > 0.25, vocal_mask, vocal_mask * 0.3)  # Keep more content
        
        # Less aggressive morphological operations
        from scipy.ndimage import binary_opening, binary_closing
        binary_mask = vocal_mask > 0.2  # Lower threshold
        binary_mask = binary_opening(binary_mask, structure=np.ones((2, 3)))  # Smaller kernel
        binary_mask = binary_closing(binary_mask, structure=np.ones((2, 4)))   # Smaller kernel
        
        # Apply binary mask with softer edges - preserve vocal nuances
        vocal_mask = np.where(binary_mask, vocal_mask, vocal_mask * 0.2)  # Keep more content
        vocal_mask = np.clip(vocal_mask, 0, 1)
        
        # Reconstruct vocals with ultra-clean separation
        vocals_stft = center_stft * vocal_mask
        vocals = librosa.istft(vocals_stft, hop_length=512)
        
        # Method 3: Ultra-selective ICA with advanced vocal source identification
        try:
            # Prepare stereo data with preprocessing
            stereo_data = np.array([y_left, y_right])
            
            # Apply light preprocessing to improve ICA
            for i in range(2):
                # High-pass filter to remove low-frequency noise
                sos_hp = signal.butter(4, 100, btype='high', fs=sr, output='sos')
                stereo_data[i] = signal.sosfilt(sos_hp, stereo_data[i])
            
            # Enhanced ICA with multiple trials for best result
            best_vocal_source = None
            best_vocal_score = -1
            
            for trial in range(3):  # Try multiple ICA runs
                ica = FastICA(
                    n_components=2, 
                    random_state=42 + trial,
                    max_iter=2000,
                    tol=1e-4,
                    fun='logcosh',  # Better for audio
                    alpha=1.0
                )
                sources = ica.fit_transform(stereo_data.T).T
                
                # Comprehensive vocal source evaluation
                for idx, source in enumerate(sources):
                    # Spectral analysis
                    source_stft = librosa.stft(source, n_fft=2048)
                    source_mag = np.abs(source_stft)
                    
                    # 1. Vocal frequency range energy (key indicator)
                    vocal_energy = np.mean(source_mag[vocal_low_bin:vocal_high_bin, :])
                    
                    # 2. Spectral centroid in vocal range (vocal brightness)
                    vocal_centroid = np.mean(librosa.feature.spectral_centroid(
                        S=source_mag[vocal_low_bin:vocal_high_bin, :], sr=sr
                    ))
                    
                    # 3. Temporal stability (vocals are more consistent)
                    rms_energy = librosa.feature.rms(y=source)[0]
                    temporal_stability = 1 - (np.std(rms_energy) / (np.mean(rms_energy) + 1e-8))
                    
                    # 4. Pitch consistency (vocals have more consistent pitch)
                    try:
                        f0_source = librosa.yin(source, fmin=120, fmax=f0_max, sr=sr, threshold=0.2)
                        valid_f0 = f0_source[~np.isnan(f0_source)]
                        if len(valid_f0) > 0:
                            pitch_consistency = 1 - (np.std(valid_f0) / (np.mean(valid_f0) + 1e-8))
                        else:
                            pitch_consistency = 0
                    except:
                        pitch_consistency = 0
                    
                    # 5. Formant presence (check for vocal formants)
                    formant_score = 0
                    for formant in [900, 1300, 2500]:
                        if formant < nyquist * 0.7:
                            formant_bin = int(formant * source_mag.shape[0] / (sr/2))
                            if formant_bin < source_mag.shape[0]:
                                formant_energy = np.mean(source_mag[formant_bin-2:formant_bin+3, :])
                                surrounding_energy = np.mean(source_mag[max(0, formant_bin-10):formant_bin-5, :])
                                if surrounding_energy > 0:
                                    formant_score += formant_energy / surrounding_energy
                    
                    # Composite vocal score with strict weighting
                    vocal_score = (
                        vocal_energy * 0.35 +
                        (vocal_centroid / 3000) * 0.20 +  # Normalize centroid
                        temporal_stability * 0.20 +
                        pitch_consistency * 0.15 +
                        min(formant_score / 3, 1.0) * 0.10
                    )
                    
                    if vocal_score > best_vocal_score:
                        best_vocal_score = vocal_score
                        best_vocal_source = source.copy()
            
            # Use the best vocal source if it's significantly better than spectral method
            if best_vocal_source is not None and best_vocal_score > 0.3:
                # Blend ICA result with spectral subtraction result (less blending for purer vocals)
                if len(best_vocal_source) == len(vocals):
                    vocals = vocals * 0.6 + best_vocal_source * 0.4  # Favor spectral method slightly
                logger.info(f"Enhanced vocals using ICA (score: {best_vocal_score:.3f})")
            else:
                logger.info("ICA enhancement skipped - spectral method preferred")
            
        except Exception as e:
            logger.warning(f"ICA enhancement failed: {e}, using spectral method only")
        
        # Ensure vocals has the same length as mono version
        target_length = len(y_mono)
        if len(vocals) != target_length:
            if len(vocals) < target_length:
                vocals = np.pad(vocals, (0, target_length - len(vocals)), mode='constant')
            else:
                vocals = vocals[:target_length]
        
        # Balanced vocal preservation with music suppression
        logger.info("Applying balanced vocal preservation with selective music suppression...")
        
        # Method 4A: Gentle spectral subtraction - preserve vocal content
        vocals_stft_working = librosa.stft(vocals, n_fft=4096, hop_length=512)
        vocals_mag = np.abs(vocals_stft_working)
        vocals_phase = np.angle(vocals_stft_working)
        
        # Create reference instrumental estimate from original mix
        instrumental_stft = librosa.stft(y_mono, n_fft=4096, hop_length=512)
        instrumental_mag = np.abs(instrumental_stft)
        
        # Identify and suppress instrumental frequencies
        freq_bins = vocals_mag.shape[0]
        
        # Gentle spectral subtraction - preserve all vocal content
        for freq_bin in range(freq_bins):
            freq_hz = freq_bin * nyquist / freq_bins
            
            # Define vocal-priority regions (wider to preserve more vocals)
            if 120 <= freq_hz <= 6000:  # Extended vocal range
                # Within vocal range - preserve vocals, gentle music suppression
                vocal_energy = vocals_mag[freq_bin, :]
                instrumental_energy = instrumental_mag[freq_bin, :]
                
                # Conservative subtraction - favor vocal preservation
                subtraction_factor = np.minimum(
                    0.4,  # Max 40% subtraction in vocal range
                    instrumental_energy / (vocal_energy + instrumental_energy + 1e-8)
                )
                
                # Only subtract if instrumental is significantly dominant
                strong_instrumental = instrumental_energy > vocal_energy * 2
                vocals_mag[freq_bin, :] *= (1 - subtraction_factor * 0.3 * strong_instrumental)
                
            elif freq_hz < 120:  # Below vocal range - moderate removal
                # Moderate low-frequency suppression (preserve vocal fundamentals)
                vocals_mag[freq_bin, :] *= 0.3
                
            elif freq_hz > 6000:  # Above core vocal range
                # Gentle high-frequency suppression (preserve vocal harmonics and air)
                vocals_mag[freq_bin, :] *= 0.6
        
        # Method 4B: Gentle noise gating - preserve quiet vocal parts
        # Calculate dynamic noise floor per frequency band
        noise_floor = np.percentile(vocals_mag, 25, axis=1, keepdims=True)  # Higher percentile
        signal_threshold = noise_floor * 3.0  # Lower threshold to preserve quiet vocals
        
        # Create permissive gate
        gate_mask = vocals_mag > signal_threshold
        
        # Gentle temporal consistency check
        for freq_bin in range(freq_bins):
            energy_profile = vocals_mag[freq_bin, :]
            
            # Only suppress very obvious spikes (preserve vocal dynamics)
            median_energy = median_filter(energy_profile, size=5)  # Smaller window
            spike_threshold = median_energy * 4.0  # Higher threshold
            
            # More conservative spike suppression
            spike_mask = energy_profile < spike_threshold
            gate_mask[freq_bin, :] = gate_mask[freq_bin, :] & spike_mask
        
        # Less aggressive morphological operations
        from scipy.ndimage import binary_erosion, binary_dilation
        
        # Minimal erosion/dilation to preserve vocal details
        gate_mask = binary_erosion(gate_mask, structure=np.ones((2, 3)))
        gate_mask = binary_dilation(gate_mask, structure=np.ones((2, 5)))
        
        # Apply gentle gating
        gate_mask = median_filter(gate_mask.astype(float), size=(3, 5))
        
        # Method 4C: Minimal spectral whitening to preserve vocal character
        # Calculate spectral envelope
        spectral_envelope = median_filter(vocals_mag, size=(1, 11), mode='reflect')  # Smaller window
        
        # Very gentle flattening to preserve vocal formants
        flattening_factor = 0.1  # Much gentler flattening
        whitened_mag = vocals_mag * (
            (spectral_envelope + 1e-8) ** (-flattening_factor)
        )
        
        # Combine all processing with vocal preservation priority
        final_vocals_mag = whitened_mag * gate_mask
        
        # Method 4D: Gentle vocal formant enhancement (preserve natural character)
        formant_freqs = [800, 1200, 2400]  # Primary formants
        for formant in formant_freqs:
            if formant < nyquist * 0.7:
                formant_bin = int(formant * freq_bins / nyquist)
                if formant_bin < freq_bins:
                    # Gentle formant boost to maintain vocal character
                    boost_range = 6  # Smaller range
                    start_bin = max(0, formant_bin - boost_range)
                    end_bin = min(freq_bins, formant_bin + boost_range)
                    
                    for b in range(start_bin, end_bin):
                        if gate_mask[b, :].mean() > 0.1:  # Lower threshold
                            final_vocals_mag[b, :] *= 1.1  # Gentler boost
        
        # Reconstruct voice-preserved vocals
        final_vocals_stft = final_vocals_mag * np.exp(1j * vocals_phase)
        vocals = librosa.istft(final_vocals_stft, hop_length=512)
        
        # Gentle final noise reduction pass
        vocals = signal.wiener(vocals, 3)  # Less aggressive noise reduction
        
    else:
        # Mono vocal extraction - use harmonic-percussive separation
        logger.info("Mono audio detected - using harmonic extraction for vocals")
        vocals = y_harmonic_fine
    
    # 3. Professional instrumental separation
    logger.info("Separating instruments with professional techniques...")
    
    # Multi-resolution STFT analysis
    stft_512 = librosa.stft(y_mono, n_fft=512, hop_length=128)
    stft_1024 = librosa.stft(y_mono, n_fft=1024, hop_length=256)
    stft_2048 = librosa.stft(y_mono, n_fft=2048, hop_length=512)
    stft_4096 = librosa.stft(y_mono, n_fft=4096, hop_length=1024)
    
    # Bass extraction using multiple techniques
    S = np.abs(stft_2048)
    freq_bins = S.shape[0]
    
    # Bass: Comprehensive low-frequency extraction
    bass_cutoff_bins = int(300 * freq_bins / (sr/2))  # 300Hz cutoff
    bass_mask = np.zeros_like(S)
    bass_mask[:bass_cutoff_bins, :] = 1.0
    
    # Apply bass mask to percussive content
    bass_stft = librosa.stft(y_percussive_coarse) * bass_mask
    bass = librosa.istft(bass_stft)
    
    # Apply low-pass filtering
    sos_bass = signal.butter(6, 300, btype='low', fs=sr, output='sos')
    bass = signal.sosfilt(sos_bass, bass)
    
    # Drums: Advanced percussive isolation
    drums_stft = librosa.stft(y_percussive_ultra)
    
    # High-pass filter for drums (remove sub-bass)
    drums_bins_start = int(60 * freq_bins / (sr/2))
    drums_mask = np.zeros_like(S)
    drums_mask[drums_bins_start:, :] = 1.0
    
    drums_stft = drums_stft * drums_mask
    drums = librosa.istft(drums_stft)
    
    # Apply dynamic range processing
    drums = np.tanh(drums * 2) / 2  # Soft compression
    
    # 4. Accompaniment: Advanced harmonic instrument separation
    logger.info("Creating high-quality accompaniment...")
    
    # Start with harmonic content
    accompaniment = y_harmonic_coarse.copy()
    
    # Subtract vocal estimate from harmonic content
    if is_stereo:
        # Use sophisticated spectral subtraction
        acc_stft = librosa.stft(accompaniment)
        vocal_stft = librosa.stft(vocals)
        
        # Adaptive subtraction based on frequency content
        vocal_magnitude = np.abs(vocal_stft)
        acc_magnitude = np.abs(acc_stft)
        
        # Create inverse vocal mask
        subtraction_mask = 1 - (vocal_magnitude / (acc_magnitude + vocal_magnitude + 1e-10)) * 0.6
        subtraction_mask = np.clip(subtraction_mask, 0.2, 1.0)  # Prevent over-subtraction
        
        accompaniment_stft = acc_stft * subtraction_mask
        accompaniment = librosa.istft(accompaniment_stft)
    
    # 5. Other: Residual and ambient content
    logger.info("Creating other/ambient track...")
    
    # Ensure all tracks have the same length before calculating residual
    target_length = len(y_mono)
    
    # Trim or pad all tracks to target length
    def ensure_length(audio, target_len):
        if len(audio) < target_len:
            return np.pad(audio, (0, target_len - len(audio)), mode='constant')
        else:
            return audio[:target_len]
    
    vocals_aligned = ensure_length(vocals, target_length)
    accompaniment_aligned = ensure_length(accompaniment, target_length)
    bass_aligned = ensure_length(bass, target_length)
    drums_aligned = ensure_length(drums, target_length)
    
    # Calculate residual
    reconstructed = vocals_aligned + accompaniment_aligned + bass_aligned + drums_aligned
    other = y_mono - reconstructed
    
    # Apply noise reduction
    other = signal.wiener(other, 7)
    
    # Ensure harmonic content matches other track length
    harmonic_for_other = ensure_length(y_harmonic_ultra, len(other))
    
    # Add some harmonic content for richness
    other = other * 0.8 + harmonic_for_other * 0.2
    
    # 6. Professional post-processing
    logger.info("Applying professional post-processing...")
    
    def apply_professional_eq(audio, sr, track_type):
        """Apply professional EQ curves for each track type"""
        if track_type == 'vocals':
            # Ultra-aggressive Vocal EQ: Maximum isolation and presence
            nyquist = sr / 2
            
            # 1. Aggressive high-pass filter to remove all low-frequency music bleed
            hp_freq = min(150, nyquist * 0.9)  # Higher cutoff to remove bass/drums
            sos1 = signal.butter(6, hp_freq, btype='high', fs=sr, output='sos')  # Steeper filter
            audio = signal.sosfilt(sos1, audio)
            
            # 2. Ultra-aggressive de-ess and harsh frequency removal
            if nyquist > 6000:
                # Remove harsh frequencies that are often instrumental
                harsh_low = min(4000, nyquist * 0.6)
                harsh_high = min(6000, nyquist * 0.8)
                sos_harsh = signal.butter(4, [harsh_low, harsh_high], btype='band', fs=sr, output='sos')
                harsh_content = signal.sosfilt(sos_harsh, audio)
                audio = audio - harsh_content * 0.6  # Remove 60% of harsh content
            
            if nyquist > 8000:
                # De-ess filter (reduce sibilants and cymbal bleed)
                deess_low = min(6000, nyquist * 0.7)
                deess_high = min(8000, nyquist * 0.85)
                sos_deess = signal.butter(3, [deess_low, deess_high], btype='band', fs=sr, output='sos')
                sibilants = signal.sosfilt(sos_deess, audio)
                audio = audio - sibilants * 0.5  # Aggressive sibilant reduction
            
            # 3. Ultra-focused vocal presence boost (very narrow bands)
            # Primary vocal clarity: 1.2-2.5kHz (speech intelligibility)
            pres_low_start = min(1200, nyquist * 0.35)
            pres_low_end = min(2500, nyquist * 0.55)
            if pres_low_end > pres_low_start:
                sos2 = signal.butter(3, [pres_low_start, pres_low_end], btype='band', fs=sr, output='sos')
                presence_low = signal.sosfilt(sos2, audio)
                audio = audio + presence_low * 0.4  # Strong boost
            
            # Secondary presence: 2.5-4kHz (vocal brightness)
            if nyquist > 4000:
                pres_high_start = min(2500, nyquist * 0.5)
                pres_high_end = min(4000, nyquist * 0.7)
                if pres_high_end > pres_high_start:
                    sos3 = signal.butter(2, [pres_high_start, pres_high_end], btype='band', fs=sr, output='sos')
                    presence_high = signal.sosfilt(sos3, audio)
                    audio = audio + presence_high * 0.3
            
            # 4. Conservative warmth (avoid muddy instruments)
            warmth_start = min(300, nyquist * 0.15)  # Higher than before
            warmth_end = min(600, nyquist * 0.3)     # Narrower range
            if warmth_end > warmth_start:
                sos4 = signal.butter(1, [warmth_start, warmth_end], btype='band', fs=sr, output='sos')
                warmth = signal.sosfilt(sos4, audio)
                audio = audio + warmth * 0.15  # Moderate boost to avoid muddiness
            
            # 5. Minimal air (to avoid cymbal bleed)
            if nyquist > 10000:
                air_start = min(9000, nyquist * 0.75)   # Higher start frequency
                air_end = min(12000, nyquist * 0.9)
                if air_end > air_start:
                    sos5 = signal.butter(1, [air_start, air_end], btype='band', fs=sr, output='sos')
                    air = signal.sosfilt(sos5, audio)
                    audio = audio + air * 0.05  # Very conservative air
            
            # 6. Conservative notch filters for only the most problematic frequencies
            # Remove only major guitar/piano fundamentals that clearly interfere
            problem_freqs = [220, 440, 880]  # Just the most common problematic frequencies
            for freq in problem_freqs:
                if freq < nyquist * 0.8 and freq > 200:  # Narrower range
                    Q = 20  # Lower Q for gentler notching
                    try:
                        sos_notch = signal.iirnotch(freq, Q, fs=sr, output='sos')
                        audio = signal.sosfilt(sos_notch, audio)
                    except:
                        pass
            
            # 7. Gentle low-mid adjustment (preserve vocal body)
            low_mid_start = min(250, nyquist * 0.1)  # Higher start to preserve vocal body
            low_mid_end = min(350, nyquist * 0.2)    # Narrower range
            if low_mid_end > low_mid_start:
                sos_low_mid = signal.butter(1, [low_mid_start, low_mid_end], btype='band', fs=sr, output='sos')
                low_mid_content = signal.sosfilt(sos_low_mid, audio)
                audio = audio - low_mid_content * 0.15  # Much gentler cut
            
            # 8. Gentle final high-pass to remove only very low frequencies
            hp_final = min(100, nyquist * 0.8)  # Lower frequency to preserve vocal fundamentals
            sos_final = signal.butter(2, hp_final, btype='high', fs=sr, output='sos')  # Gentler slope
            audio = signal.sosfilt(sos_final, audio)
            
        elif track_type == 'bass':
            # Professional Bass EQ: Deep, tight, and punchy (sample rate adaptive)
            nyquist = sr / 2
            
            # 1. Remove sub-sonic rumble
            hp_freq = min(25, nyquist * 0.05)
            sos1 = signal.butter(4, hp_freq, btype='high', fs=sr, output='sos')
            audio = signal.sosfilt(sos1, audio)
            
            # 2. Bass fundamental boost (40-120Hz)
            bass_low = min(40, nyquist * 0.1)
            bass_high = min(120, nyquist * 0.3)
            if bass_high > bass_low:
                sos2 = signal.butter(2, [bass_low, bass_high], btype='band', fs=sr, output='sos')
                bass_fund = signal.sosfilt(sos2, audio)
                audio = audio + bass_fund * 0.3
            
            # 3. Bass presence (120-300Hz)
            if nyquist > 300:
                pres_low = min(120, nyquist * 0.2)
                pres_high = min(300, nyquist * 0.4)
                sos3 = signal.butter(2, [pres_low, pres_high], btype='band', fs=sr, output='sos')
                bass_pres = signal.sosfilt(sos3, audio)
                audio = audio + bass_pres * 0.2
            
            # 4. Low-pass to remove high frequency bleed
            lp_freq = min(400, nyquist * 0.6)
            sos4 = signal.butter(6, lp_freq, btype='low', fs=sr, output='sos')
            audio = signal.sosfilt(sos4, audio)
            
        elif track_type == 'drums':
            # Professional Drum EQ: Punch, attack, and clarity (sample rate adaptive)
            nyquist = sr / 2
            
            # 1. Clean up sub-bass
            hp_freq = min(50, nyquist * 0.1)
            sos1 = signal.butter(4, hp_freq, btype='high', fs=sr, output='sos')
            audio = signal.sosfilt(sos1, audio)
            
            # 2. Kick drum punch (60-120Hz)
            kick_low = min(60, nyquist * 0.15)
            kick_high = min(120, nyquist * 0.25)
            if kick_high > kick_low:
                sos2 = signal.butter(2, [kick_low, kick_high], btype='band', fs=sr, output='sos')
                kick_punch = signal.sosfilt(sos2, audio)
                audio = audio + kick_punch * 0.25
            
            # 3. Snare body (150-400Hz)
            if nyquist > 400:
                snare_low = min(150, nyquist * 0.3)
                snare_high = min(400, nyquist * 0.5)
                sos3 = signal.butter(2, [snare_low, snare_high], btype='band', fs=sr, output='sos')
                snare_body = signal.sosfilt(sos3, audio)
                audio = audio + snare_body * 0.15
            
            # 4. Snare crack (2-6kHz)
            if nyquist > 6000:
                crack_low = min(2000, nyquist * 0.4)
                crack_high = min(6000, nyquist * 0.7)
                sos4 = signal.butter(2, [crack_low, crack_high], btype='band', fs=sr, output='sos')
                snare_crack = signal.sosfilt(sos4, audio)
                audio = audio + snare_crack * 0.2
            
            # 5. Cymbals and hi-hats (8kHz+)
            if nyquist > 8000:
                cymbal_freq = min(8000, nyquist * 0.8)
                sos5 = signal.butter(2, cymbal_freq, btype='high', fs=sr, output='sos')
                cymbals = signal.sosfilt(sos5, audio)
                audio = audio + cymbals * 0.1
            
        elif track_type == 'accompaniment':
            # Professional Accompaniment EQ: Balanced, warm, and clear (sample rate adaptive)
            nyquist = sr / 2
            
            # 1. Clean low end
            hp_freq = min(60, nyquist * 0.1)
            sos1 = signal.butter(2, hp_freq, btype='high', fs=sr, output='sos')
            audio = signal.sosfilt(sos1, audio)
            
            # 2. Warmth enhancement (200-600Hz)
            if nyquist > 600:
                warm_low = min(200, nyquist * 0.2)
                warm_high = min(600, nyquist * 0.4)
                sos2 = signal.butter(2, [warm_low, warm_high], btype='band', fs=sr, output='sos')
                warmth = signal.sosfilt(sos2, audio)
                audio = audio + warmth * 0.15
            
            # 3. Instrument clarity (1-4kHz)
            if nyquist > 4000:
                clarity_low = min(1000, nyquist * 0.3)
                clarity_high = min(4000, nyquist * 0.6)
                sos3 = signal.butter(2, [clarity_low, clarity_high], btype='band', fs=sr, output='sos')
                clarity = signal.sosfilt(sos3, audio)
                audio = audio + clarity * 0.12
            
            # 4. Sparkle (6-10kHz)
            if nyquist > 10000:
                sparkle_low = min(6000, nyquist * 0.6)
                sparkle_high = min(10000, nyquist * 0.8)
                sos4 = signal.butter(1, [sparkle_low, sparkle_high], btype='band', fs=sr, output='sos')
                sparkle = signal.sosfilt(sos4, audio)
                audio = audio + sparkle * 0.08
                
        elif track_type == 'other':
            # Professional Other/Ambient EQ: Atmospheric and spacious
            nyquist = sr / 2
            
            # 1. Gentle high-pass
            hp_freq = min(40, nyquist * 0.08)
            sos1 = signal.butter(2, hp_freq, btype='high', fs=sr, output='sos')
            audio = signal.sosfilt(sos1, audio)
            
            # 2. Ambient enhancement (500Hz-2kHz)
            if nyquist > 2000:
                amb_low = min(500, nyquist * 0.3)
                amb_high = min(2000, nyquist * 0.5)
                sos2 = signal.butter(1, [amb_low, amb_high], btype='band', fs=sr, output='sos')
                ambient = signal.sosfilt(sos2, audio)
                audio = audio + ambient * 0.1
            
            # 3. High-frequency detail (4kHz+)
            if nyquist > 4000:
                detail_freq = min(4000, nyquist * 0.7)
                sos3 = signal.butter(1, detail_freq, btype='high', fs=sr, output='sos')
                detail = signal.sosfilt(sos3, audio)
                audio = audio + detail * 0.06
            
        return audio
    
    def apply_dynamics(audio, track_type):
        """Apply gentle dynamics processing"""
        if track_type in ['vocals', 'drums']:
            # Gentle compression
            threshold = 0.7
            ratio = 3.0
            makeup = 1.1
            
            abs_audio = np.abs(audio)
            compressed = np.where(
                abs_audio > threshold,
                threshold + (abs_audio - threshold) / ratio,
                abs_audio
            )
            audio = np.sign(audio) * compressed * makeup
            
        return audio
    
    # Apply processing to all tracks using aligned versions
    vocals_aligned = apply_professional_eq(vocals_aligned, sr, 'vocals')
    vocals_aligned = apply_dynamics(vocals_aligned, 'vocals')
    
    bass_aligned = apply_professional_eq(bass_aligned, sr, 'bass')
    bass_aligned = apply_dynamics(bass_aligned, 'bass')
    
    drums_aligned = apply_professional_eq(drums_aligned, sr, 'drums')
    drums_aligned = apply_dynamics(drums_aligned, 'drums')
    
    accompaniment_aligned = apply_professional_eq(accompaniment_aligned, sr, 'accompaniment')
    
    other = apply_professional_eq(other, sr, 'other')
    
    # Final normalization with proper headroom
    def normalize_professional(audio, target_lufs=-18):
        """Professional normalization with proper headroom"""
        rms = np.sqrt(np.mean(audio**2))
        if rms > 0:
            # Target RMS for -18 LUFS (approximately)
            target_rms = 0.1
            gain = target_rms / rms
            audio = audio * gain
            
        # Peak limiting to prevent clipping
        peak = np.max(np.abs(audio))
        if peak > 0.95:
            audio = audio * (0.95 / peak)
            
        return audio
    
    tracks = {
        'vocals': normalize_professional(vocals_aligned),
        'accompaniment': normalize_professional(accompaniment_aligned), 
        'bass': normalize_professional(bass_aligned),
        'drums': normalize_professional(drums_aligned),
        'other': normalize_professional(other)
    }
    
    logger.info("Professional AI separation completed!")
    return tracks, sr

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'Voice-Preserving Vocal Isolation Backend',
        'technology': 'Balanced ICA + Gentle Spectral Analysis + Voice-First Processing',
        'version': '4.1.0',
        'vocal_isolation': 'Complete vocal preservation with selective music removal'
    })

@app.route('/separate', methods=['POST'])
def separate_audio():
    try:
        logger.info("Received professional AI separation request")
        logger.info(f"Request files: {list(request.files.keys())}")
        logger.info(f"Request form: {list(request.form.keys())}")
        
        if 'audio' not in request.files:
            logger.warning("No 'audio' field in request.files")
            return jsonify({'error': 'No audio file provided'}), 400
        
        file = request.files['audio']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if file:
            # Save uploaded file
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            logger.info(f"Processing file with professional AI: {filename}")
            
            # Perform professional separation
            separated_audio, sr = professional_source_separation(filepath)
            
            # Save separated tracks
            output_files = {}
            base_filename = os.path.splitext(filename)[0]
            
            for track_name, audio_data in separated_audio.items():
                output_filename = f"{base_filename}_{track_name}.wav"
                output_path = os.path.join(app.config['OUTPUT_FOLDER'], output_filename)
                
                sf.write(output_path, audio_data, sr)
                output_files[track_name] = output_filename
                logger.info(f"Saved professional {track_name} track: {output_filename}")
            
            # Clean up input file
            os.remove(filepath)
            
            return jsonify({
                'success': True,
                'message': 'Voice-preserving vocal isolation completed',
                'tracks': output_files,
                'processing_info': {
                    'technology': 'Balanced ICA + Gentle Spectral Analysis + Voice-First Processing',
                    'quality': 'Complete vocal preservation with selective music removal',
                    'tracks': 5,
                    'vocal_enhancement': 'Voice-preserving isolation with balanced music suppression'
                }
            })
    
    except Exception as e:
        logger.error(f"Error during professional separation: {str(e)}")
        return jsonify({'error': f'Professional separation failed: {str(e)}'}), 500

@app.route('/download/<track_type>/<filename>', methods=['GET'])
def download_track(track_type, filename):
    try:
        filepath = os.path.join(app.config['OUTPUT_FOLDER'], filename)
        if os.path.exists(filepath):
            return send_file(filepath, as_attachment=True)
        else:
            return jsonify({'error': 'File not found'}), 404
    except Exception as e:
        logger.error(f"Error downloading file: {str(e)}")
        return jsonify({'error': f'Download failed: {str(e)}'}), 500

@app.route('/models', methods=['GET'])
def get_available_models():
    return jsonify({
        'models': [
            {
                'name': 'ultra-clean-vocal-isolation',
                'description': 'Ultra-clean vocal isolation with maximum music suppression',
                'tracks': ['vocals', 'accompaniment', 'bass', 'drums', 'other'],
                'technology': [
                    'Multi-trial Independent Component Analysis (ICA)',
                    'Ultra-aggressive spectral subtraction',
                    'Advanced vocal confidence scoring',
                    'Multi-stage music suppression',
                    'Frequency-specific noise gating',
                    'Morphological signal processing',
                    'Professional vocal-optimized EQ'
                ],
                'quality': 'Maximum vocal purity with minimal instrumental bleed',
                'specialization': 'Optimized for ultra-clean vocal extraction'
            }
        ]
    })

if __name__ == '__main__':
    logger.info("Starting Ultra-Clean Vocal Isolation Backend v4.0")
    logger.info("Enhanced Technologies:")
    logger.info("  - Multi-trial Independent Component Analysis (ICA)")
    logger.info("  - Ultra-aggressive spectral subtraction")
    logger.info("  - Advanced vocal confidence scoring")
    logger.info("  - Multi-stage music suppression")
    logger.info("  - Frequency-specific noise gating")
    logger.info("  - Morphological signal processing")
    logger.info("  - Professional vocal-optimized EQ")
    logger.info("Specialization: Maximum vocal purity with minimal music bleed")
    logger.info("Available endpoints:")
    logger.info("  GET  /health - Health check")
    logger.info("  POST /separate - Ultra-clean vocal isolation")
    logger.info("  GET  /download/<track_type>/<filename> - Download separated track")
    logger.info("  GET  /models - Get available AI models")
    
    app.run(host='0.0.0.0', port=5000, debug=False)
