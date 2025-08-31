import os
import tempfile
import uuid
import shutil
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
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

print("🎵 Simple Demo Backend initialized (no AI processing)")
print("📝 This backend simulates separation for testing purposes")

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'Simple Demo Backend (No AI)',
        'models': ['demo-mode'],
        'version': '1.0.0',
        'note': 'This is a demo backend for testing. No real AI separation.'
    })

@app.route('/separate', methods=['POST'])
def separate_audio():
    try:
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
        
        print(f"🎵 Demo processing: {file.filename}")
        print(f"📁 Session ID: {session_id}")
        
        # Save uploaded file (for demo purposes)
        filename = secure_filename(f"{session_id}_{file.filename}")
        input_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(input_path)
        
        # Check file size
        if os.path.getsize(input_path) > MAX_FILE_SIZE:
            os.remove(input_path)
            return jsonify({'error': 'File too large. Maximum size is 50MB'}), 400
        
        # Create output directory for this session
        session_output_dir = os.path.join(OUTPUT_FOLDER, session_id)
        os.makedirs(session_output_dir, exist_ok=True)
        
        print("🎭 Creating demo separated tracks...")
        
        # Create demo tracks (copies of original for testing)
        track_files = {
            'vocals': 'vocals.wav',
            'drums': 'drums.wav',
            'bass': 'bass.wav',
            'other': 'other.wav'
        }
        
        track_urls = {}
        for stem_name, filename in track_files.items():
            # Copy original file as demo track
            demo_track_path = os.path.join(session_output_dir, filename)
            shutil.copy2(input_path, demo_track_path)
            track_urls[stem_name] = f"/download/{session_id}/{filename}"
            print(f"✅ Created demo {stem_name} track: {filename}")
        
        # Clean up input file
        os.remove(input_path)
        
        print("🎉 Demo separation complete!")
        
        return jsonify({
            'success': True,
            'session_id': session_id,
            'message': 'Demo separation completed! (All tracks are copies for testing)',
            'tracks': track_urls,
            'vocals_url': track_urls['vocals'],
            'drums_url': track_urls['drums'],
            'bass_url': track_urls['bass'],
            'other_url': track_urls['other'],
            'instrumental_url': track_urls['other']  # For compatibility
        })
        
    except Exception as e:
        print(f"❌ Demo separation failed: {str(e)}")
        return jsonify({'error': f'Demo separation failed: {str(e)}'}), 500

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
    print("🚀 Starting Simple Demo Backend...")
    print("🎭 This backend creates demo tracks for testing (no real AI)")
    print("📡 Server will be available at: http://localhost:5000")
    print("🔗 Health check: http://localhost:5000/health")
    print("🎤 Demo separation endpoint: http://localhost:5000/separate")
    print("⚠️  Note: All tracks will be copies of the original (for testing)")
    
    app.run(
        host='0.0.0.0',  # Allow external connections
        port=5000,
        debug=True,
        threaded=True
    )
