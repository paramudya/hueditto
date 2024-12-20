from flask import Flask, request, jsonify
from flask_cors import CORS
import 
app = Flask(__name__)
CORS(app)

@app.route('/process', methods=['POST'])
def process_text():
    try:
        text = request.json['text']
        # Your text processing logic here
        processed_text = text.upper()  # Upper as baseline process
        
        return jsonify({
            'success': True,
            'result': processed_text
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)