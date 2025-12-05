import os

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from openai import OpenAI

# Load environment variables if .env is present
load_dotenv()

app = Flask(__name__)


def _get_openai_client():
    """Create OpenAI client lazily and safely.

    Prefer standard OPENAI_API_KEY if present, otherwise fall back to custom api_key.
    """
    key = os.getenv("OPENAI_API_KEY") or os.getenv("api_key")
    if not key:
        return None
    try:
        return OpenAI(api_key=key)
    except Exception:
        return None


@app.route('/__ai__', methods=['GET'])
def get_response():
    prompt = request.args.get('prompt', '')
    client = _get_openai_client()
    if client is None:
        return jsonify({
            'error': "Missing or invalid OpenAI 'api_key' in environment.",
            'hint': "Provide OPENAI_API_KEY or api_key via .env or container env."
        }), 500
    try:
        response = client.responses.create(
            model="gpt-4o",
            input=prompt
        )
        return jsonify({'output': response.output_text})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)