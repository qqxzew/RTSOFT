import os
import tempfile
from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_file, Response, stream_with_context
from openai import OpenAI
import requests
from flask_cors import CORS
import json

load_dotenv()

app = Flask(__name__)
CORS(app)


def _get_openai_client():
    key = os.getenv("OPENAI_API_KEY") or os.getenv("api_key")
    if not key:
        return None
    return OpenAI(api_key=key)

def _get_page_access_token():
    return os.getenv("PAGE_ACCESS_TOKEN")

def _get_verify_token():
    return os.getenv("VERIFY_TOKEN", "my_secret_token_123")


# AI со стримингом (текст появляется постепенно)
@app.route('/__ai_stream__', methods=['GET'])
def get_response_stream():
    prompt = request.args.get('prompt')

    def generate():
        client = _get_openai_client()
        stream = client.chat.completions.create(
            model="gpt-4o-mini",  # Быстрее чем gpt-4o
            messages=[{"role": "user", "content": prompt}],
            stream=True
        )

        full_text = ""
        for chunk in stream:
            if chunk.choices[0].delta.content:
                text = chunk.choices[0].delta.content
                full_text += text
                yield f"data: {json.dumps({'text': text, 'done': False})}\n\n"

        yield f"data: {json.dumps({'text': '', 'done': True, 'full': full_text})}\n\n"

    return Response(
        stream_with_context(generate()),
        mimetype='text/event-stream',
        headers={'Cache-Control': 'no-cache', 'X-Accel-Buffering': 'no'}
    )


# AI без стриминга (для совместимости)
@app.route('/__ai__', methods=['GET'])
def get_response():
    prompt = request.args.get('prompt')
    response = _get_openai_client().responses.create(
        model="gpt-4o-mini",
        input=prompt
    )
    return jsonify({'output': response.output_text})


# TTS - OpenAI голос (оптимизирован для скорости)
@app.route('/tts', methods=['POST'])
def text_to_speech():
    data = request.get_json()
    text = data.get('text', '')

    if not text:
        return jsonify({'error': 'No text provided'}), 400

    try:
        response = _get_openai_client().audio.speech.create(
            model="tts-1",  # tts-1 быстрее чем tts-1-hd
            voice="nova",
            input=text,
            speed=1.15  # Чуть быстрее для меньших пауз
        )

        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as tmp:
            response.stream_to_file(tmp.name)
            tmp_path = tmp.name

        return send_file(tmp_path, mimetype='audio/mpeg', as_attachment=False)

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/', methods=['GET'])
def home():
    return "Bot is running!", 200


@app.route('/webhook', methods=['GET'])
def verify_webhook():
    mode = request.args.get('hub.mode')
    token = request.args.get('hub.verify_token')
    challenge = request.args.get('hub.challenge')

    if mode == 'subscribe' and token == _get_verify_token:
        return challenge, 200
    return "Forbidden", 403


@app.route('/webhook', methods=['POST'])
def receive_message():
    data = request.get_json()

    if data.get('object') == 'page':
        for entry in data.get('entry', []):
            for event in entry.get('messaging', []):
                sender_id = event['sender']['id']

                if 'message' in event and 'text' in event['message']:
                    user_message = event['message']['text']

                    try:
                        response = _get_openai_client().responses.create(
                            model="gpt-4o-mini",
                            input=user_message
                        )
                        send_message(sender_id, response.output_text)
                    except:
                        send_message(sender_id, "Chyba. Zkus to znovu.")

    return "OK", 200


def send_message(recipient_id, message_text):
    url = f"https://graph.facebook.com/v18.0/me/messages?access_token={_get_page_access_token()}"
    if len(message_text) > 2000:
        message_text = message_text[:1997] + "..."
    payload = {"recipient": {"id": recipient_id}, "message": {"text": message_text}}
    return requests.post(url, json=payload).json()


@app.route('/stt', methods=['POST'])
def speech_to_text():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file'}), 400

    audio = request.files['audio']

    try:
        suffix = os.path.splitext(audio.filename or "audio.webm")[1] or ".webm"

        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            audio.save(tmp)
            tmp_path = tmp.name

        with open(tmp_path, "rb") as f:
            transcript = _get_openai_client().audio.transcriptions.create(
                model="whisper-1",
                file=f,
                language="cs",
                prompt="Čeština. Přepis běžné konverzace.",  # Помогает Whisper лучше понимать
                temperature=0.0  # Меньше галлюцинаций
            )

        os.unlink(tmp_path)
        return jsonify({'text': transcript.text})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    print("Starting server...")
    print(f"VERIFY_TOKEN: {_get_verify_token()}")
    print(f"PAGE_ACCESS_TOKEN set: {bool(_get_page_access_token())}")
    app.run(host='0.0.0.0', port=5000, debug=True)