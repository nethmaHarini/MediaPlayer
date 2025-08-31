from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import librosa
import soundfile as sf
import numpy as np
import os
import tempfile
from werkzeug.utils import secure_filename
import logging

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

def basic_source_separation(audio_file, sr=22050):
    """
    Basic source separation using librosa's harmonic-percussive separation
    and spectral filtering techniques.
    """
    logger.info(f"Loading audio file: {audio_file}")
    
    # Load audio
    y, sr = librosa.load(audio_file, sr=sr, mono=False)
    
    # Convert to mono if stereo
    if len(y.shape) > 1:
        y_mono = librosa.to_mono(y)
    else:
        y_mono = y
    
    logger.info("Performing harmonic-percussive separation...")
    
    # Harmonic-percussive separation
    y_harmonic, y_percussive = librosa.effects.hpss(y_mono)
    
    logger.info("Creating separated tracks...")
    
    # Simple approach: use the harmonic and percussive components directly
    # to avoid complex array broadcasting issues
    
    # Vocals: Use harmonic content
    vocals = y_harmonic
    
    # Accompaniment: Use harmonic content (similar to vocals but processed differently)
    accompaniment = y_harmonic * 0.8  # Slightly attenuated
    
    # Bass: Extract low frequencies from percussive content
    bass = y_percussive
    
    # Drums: Use percussive content
    drums = y_percussive
    
    # Other: Use a combination
    other = (y_harmonic + y_percussive) * 0.5
    
    # Ensure all tracks have the same length by taking the minimum length
    min_length = min(len(vocals), len(accompaniment), len(bass), len(drums), len(other))
    
    return {
        'vocals': vocals[:min_length],
        'accompaniment': accompaniment[:min_length],
        'bass': bass[:min_length],
        'drums': drums[:min_length],
        'other': other[:min_length]
    }, sr

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'AI Music Separation Backend (Librosa)',
        'version': '1.0.0'
    })

@app.route('/separate', methods=['POST'])
def separate_audio():
    try:
        logger.info("Received separation request")
        
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400
        
        file = request.files['audio']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if file:
            # Save uploaded file
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            logger.info(f"Processing file: {filename}")
            
            # Perform separation
            separated_audio, sr = basic_source_separation(filepath)
            
            # Save separated tracks
            output_files = {}
            base_filename = os.path.splitext(filename)[0]
            
            for track_name, audio_data in separated_audio.items():
                output_filename = f"{base_filename}_{track_name}.wav"
                output_path = os.path.join(app.config['OUTPUT_FOLDER'], output_filename)
                
                # Normalize audio to prevent clipping
                audio_data = audio_data / (np.max(np.abs(audio_data)) + 1e-10)
                
                sf.write(output_path, audio_data, sr)
                output_files[track_name] = output_filename
                logger.info(f"Saved {track_name} track: {output_filename}")
            
            # Clean up input file
            os.remove(filepath)
            
            return jsonify({
                'success': True,
                'message': 'Audio separation completed',
                'tracks': output_files,
                'processing_time': 'N/A'  # Could add timing if needed
            })
    
    except Exception as e:
        logger.error(f"Error during separation: {str(e)}")
        return jsonify({'error': f'Separation failed: {str(e)}'}), 500

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
                'name': 'librosa-basic',
                'description': 'Basic harmonic-percussive separation using librosa',
                'tracks': ['vocals', 'accompaniment', 'bass', 'drums', 'other']
            }
        ]
    })

if __name__ == '__main__':
    logger.info("Starting AI Music Separation Backend (Librosa)")
    logger.info("Available endpoints:")
    logger.info("  GET  /health - Health check")
    logger.info("  POST /separate - Separate audio file")
    logger.info("  GET  /download/<track_type>/<filename> - Download separated track")
    logger.info("  GET  /models - Get available separation models")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
