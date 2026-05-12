import os
import base64
from io import BytesIO
from flask import Flask, render_template, request, jsonify
from huggingface_hub import InferenceClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Initialize Hugging Face Inference Client
hf_token = os.environ.get("HF_TOKEN")
if hf_token:
    print(f"HF_TOKEN loaded successfully (starts with: {hf_token[:8]}...)")
else:
    print("CRITICAL ERROR: HF_TOKEN not found! Ensure .env file is in the root directory.")

client = InferenceClient(api_key=hf_token)

@app.route('/')
def index():
    """Render the main application page."""
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate():
    """Handle image generation requests."""
    data = request.json
    prompt = data.get('prompt')
    
    if not prompt:
        return jsonify({'error': 'No prompt provided'}), 400

    try:
        # Generate image using Stable Diffusion XL
        # Returns a PIL.Image object
        image = client.text_to_image(
            prompt,
            model="stabilityai/stable-diffusion-xl-base-1.0"
        )
        
        # Convert PIL image to base64 string for transmission
        buffered = BytesIO()
        image.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode('utf-8')
        
        return jsonify({
            'image': img_str,
            'success': True
        })
    
    except Exception as e:
        print(f"Error during image generation: {str(e)}")
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

if __name__ == '__main__':
    # Ensure the static and templates directories exist (handled by Flask usually, 
    # but we'll be creating them)
    app.run(debug=True, port=5000)
