import os
import tempfile
import uuid
import shutil
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from spleeter.separator import Separator
import librosa
import soundfile as sf
import numpy as np
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)  # Enable CORS for React Native

# Configuration
UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'outputs'
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
ALLOWED_EXTENSIONS = {'mp3', 'wav', 'flac', 'm4a', 'aac'}

# Create directories
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# Initialize Spleeter separator
print("🎵 Initializing Spleeter AI models...")
separator_4stems = Separator('spleeter:4stems-model')  # vocals, drums, bass, other
print("✅ Spleeter models loaded successfully!")

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def cleanup_old_files():
    """Clean up files older than 1 hour"""
    import time
    current_time = time.time()
    
    for folder in [UPLOAD_FOLDER, OUTPUT_FOLDER]:
        for filename in os.listdir(folder):
            file_path = os.path.join(folder, filename)
            if os.path.isfile(file_path):
                if current_time - os.path.getmtime(file_path) > 3600:  # 1 hour
                    os.remove(file_path)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'AI Music Separation Backend',
        'models': ['spleeter:4stems-model'],
        'version': '1.0.0'
    })

@app.route('/separate', methods=['POST'])
def separate_audio():
    try:
        cleanup_old_files()
        
        # Check if file was uploaded
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not supported. Use MP3, WAV, FLAC, M4A, or AAC'}), 400
        
        # Generate unique session ID
        session_id = str(uuid.uuid4())
        
        # Save uploaded file
        filename = secure_filename(f"{session_id}_{file.filename}")
        input_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(input_path)
        
        # Check file size
        if os.path.getsize(input_path) > MAX_FILE_SIZE:
            os.remove(input_path)
            return jsonify({'error': 'File too large. Maximum size is 50MB'}), 400
        
        print(f"🎵 Processing audio file: {filename}")
        print(f"📁 Session ID: {session_id}")
        
        # Load audio file
        try:
            audio, sample_rate = librosa.load(input_path, sr=44100, mono=False)
            if audio.ndim == 1:
                audio = np.expand_dims(audio, axis=0)
            
            print(f"🔊 Audio loaded: {audio.shape} at {sample_rate}Hz")
        except Exception as e:
            os.remove(input_path)
            return jsonify({'error': f'Failed to load audio: {str(e)}'}), 400
        
        # Create output directory for this session
        session_output_dir = os.path.join(OUTPUT_FOLDER, session_id)
        os.makedirs(session_output_dir, exist_ok=True)
        
        # Perform AI separation using Spleeter
        print("🤖 Starting AI separation with Spleeter...")
        
        try:
            # Spleeter expects stereo audio
            if audio.shape[0] == 1:
                audio_stereo = np.vstack([audio, audio])  # Convert mono to stereo
            else:
                audio_stereo = audio[:2]  # Take first 2 channels if more than stereo
            
            # Transpose for Spleeter (time, channels)
            audio_for_spleeter = audio_stereo.T
            
            # Separate using Spleeter
            waveforms = separator_4stems.separate(audio_for_spleeter)
            
            print("🎉 AI separation completed successfully!")
            
            # Save separated tracks
            track_urls = {}
            track_files = {
                'vocals': 'vocals.wav',
                'drums': 'drums.wav', 
                'bass': 'bass.wav',
                'other': 'other.wav'
            }
            
            for stem_name, waveform in waveforms.items():
                output_file = os.path.join(session_output_dir, track_files[stem_name])
                
                # Ensure audio is in correct format for saving
                if waveform.ndim == 2 and waveform.shape[1] == 2:
                    # Stereo audio
                    sf.write(output_file, waveform, sample_rate, format='WAV')
                else:
                    # Mono audio - convert to stereo
                    if waveform.ndim == 1:
                        stereo_waveform = np.column_stack([waveform, waveform])
                    else:
                        stereo_waveform = np.column_stack([waveform[:, 0], waveform[:, 0]])
                    sf.write(output_file, stereo_waveform, sample_rate, format='WAV')
                
                track_urls[stem_name] = f"/download/{session_id}/{track_files[stem_name]}"
                print(f"✅ Saved {stem_name} track: {track_files[stem_name]}")
            
            # Clean up input file
            os.remove(input_path)
            
            return jsonify({
                'success': True,
                'session_id': session_id,
                'message': 'Audio separation completed successfully!',
                'tracks': track_urls,
                'vocals_url': track_urls['vocals'],
                'drums_url': track_urls['drums'],
                'bass_url': track_urls['bass'],
                'other_url': track_urls['other'],
                'instrumental_url': track_urls['other']  # For compatibility
            })
            
        except Exception as e:
            # Clean up on error
            if os.path.exists(session_output_dir):
                shutil.rmtree(session_output_dir)
            if os.path.exists(input_path):
                os.remove(input_path)
            print(f"❌ Spleeter separation failed: {str(e)}")
            return jsonify({'error': f'AI separation failed: {str(e)}'}), 500
        
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/download/<session_id>/<filename>', methods=['GET'])
def download_track(session_id, filename):
    try:
        file_path = os.path.join(OUTPUT_FOLDER, session_id, filename)
        
        if not os.path.exists(file_path):
            return jsonify({'error': 'File not found'}), 404
        
        return send_file(
            file_path,
            as_attachment=True,
            download_name=filename,
            mimetype='audio/wav'
        )
    except Exception as e:
        return jsonify({'error': f'Download failed: {str(e)}'}), 500

@app.route('/cleanup/<session_id>', methods=['DELETE'])
def cleanup_session(session_id):
    try:
        session_dir = os.path.join(OUTPUT_FOLDER, session_id)
        if os.path.exists(session_dir):
            shutil.rmtree(session_dir)
            return jsonify({'success': True, 'message': 'Session cleaned up'})
        else:
            return jsonify({'error': 'Session not found'}), 404
    except Exception as e:
        return jsonify({'error': f'Cleanup failed: {str(e)}'}), 500

if __name__ == '__main__':
    print("🚀 Starting AI Music Separation Backend...")
    print("🎵 Spleeter models ready for real AI separation!")
    print("📡 Server will be available at: http://localhost:5000")
    print("🔗 Health check: http://localhost:5000/health")
    print("🎤 Separation endpoint: http://localhost:5000/separate")
    
    app.run(
        host='0.0.0.0',  # Allow external connections
        port=5000,
        debug=True,
        threaded=True
    )
