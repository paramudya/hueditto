from flask import Flask, request, jsonify
from flask_cors import CORS
from process import sqlint,sqlol

app = Flask(__name__)
CORS(app)

@app.route('/fix', methods=['POST'])
def process_text():
    try:
        # Get both query and error from request
        data = request.json
        query = data.get('query', '')  # The SQL query text
        error = data.get('error', '')  # The error message
        
        # Process both pieces of information
        fixed_q =  sqlol(query, error)
        linted_q = sqlint(fixed_q)  # Assuming sqlint is modified to handle both parameters

        return jsonify({
            'success': True,
            'result': linted_q
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)