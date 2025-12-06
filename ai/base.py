import os
import re
import tempfile
from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_file, Response, stream_with_context
from openai import OpenAI
import requests
from flask_cors import CORS
import json

load_dotenv()

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://localhost:8080"], supports_credentials=True)

_client = None
_schools_db = None
_conversation_history = {}

SYSTEM_PROMPT = """Chovej se jako český školní kariérní poradce, který pracuje s teenagery ve věku 14–20 let.
Mluv vždy česky a oslovuj mě přátelsky na „ty“.

Tvůj styl

piš lidsky, lehce, s kamarádským vibe

motivuj mě, dávej mi podporu a jednoduché rady, žádné složité odborné kecy

žádné moralizování, žádné dospělácké „musíš“, jen pomoc & pochopení

klidně trochu humoru, ale žádné ponižování

drž se tématu kariéra, studium, budoucnost, motivace, neodbočuj na nesouvisející věci

Tvoje role

Jsi:

expert na české střední školy a zaměření

hlavně na Plzeňský kraj (Pilsen Region)

umíš pracovat s info o školách (obory, zaměření, výhody, pro koho se škola hodí)

umíš přiblížit, co z daného oboru vede za kariéry

umíš pomoct teenovi najít, k čemu má předpoklady

Práce s daty

Pokud znám konkrétní střední školu → vysvětli mi, jaká je, co nabízí, pro koho je dobrá, jaké má obory a kam to vede

Pokud školu neznáš → udělej stručný „research“ (jakože projdi svou znalostní databázi)

Pokud ani tak nenajdeš → napiš „Tu školu jsem bohužel nenašel, ale můžu ti poradit podle oboru nebo města.“

Tvoje úkoly

Když se ptám:

„Na jakou školu mám jít?“ → zeptej se na moje zájmy, silné stránky, předměty, co mi jdou

„Co dělá tahle škola?“ → vysvětli obor, praxi, budoucí práci

„Jakou práci bych mohl dělat?“ → navrhni 3–6 směrů podle toho, co o sobě řeknu

„Nevím, co chci“ → dej mi motivující otázky a mini-testy

„Bojím se budoucnosti“ → uklidni, podpoř, dej praktické rady

Co nesmíš

neřeš romantiku, vztahy ani nevhodná témata

nepodporuj žádné nebezpečné chování

vždy drž fokus jen a jen na kariéře a studiu"""


def _get_openai_client():
    global _client
    if _client is None:
        key = os.getenv("OPENAI_API_KEY") or os.getenv("api_key")
        if key:
            _client = OpenAI(api_key=key)
    return _client


def _clean_text(text):
    if not text:
        return text
    text = re.sub(r'\*+', '', text)
    text = re.sub(r'_+', ' ', text)
    text = re.sub(r'^#+\s*', '', text, flags=re.MULTILINE)
    text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)
    text = re.sub(r'^\s*[-•]\s*', '', text, flags=re.MULTILINE)
    text = re.sub(r'^\s*\d+[\.\)]\s*', '', text, flags=re.MULTILINE)
    text = re.sub(r'`+', '', text)
    text = re.sub(r' +', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()


def _load_schools_db():
    global _schools_db
    if _schools_db is None:
        try:
            paths = ["SŠplzenDB_v2.json", "./SŠplzenDB_v2.json"]
            for path in paths:
                if os.path.exists(path):
                    with open(path, "r", encoding="utf-8") as f:
                        _schools_db = json.load(f)
                    print(f"Nacteno {len(_schools_db)} skol")
                    break
            if _schools_db is None:
                _schools_db = []
        except Exception as e:
            print(f"Chyba: {e}")
            _schools_db = []
    return _schools_db


def _get_schools_context():
    schools = _load_schools_db()
    if not schools:
        return ""

    context = "DATABAZE SKOL:\n\n"
    for school in schools:
        if school.get("id") == "nazev-skoly":
            continue
        context += f"{school.get('name', '')}, {school.get('city', '')}\n"
        contact = school.get("contact", {})
        if contact.get("web"):
            context += f"Web: {contact.get('web')}\n"
        programs = school.get("programs", [])
        if programs:
            obory = [p.get('name', '') for p in programs]
            context += f"Obory: {', '.join(obory)}\n"
        context += "\n"
    return context


def _get_or_create_history(session_id):
    if session_id not in _conversation_history:
        _conversation_history[session_id] = []
    return _conversation_history[session_id]


def _add_to_history(session_id, role, content):
    history = _get_or_create_history(session_id)
    history.append({"role": role, "content": content})
    if len(history) > 20:
        _conversation_history[session_id] = history[-20:]


@app.route('/__ai__', methods=['GET'])
def get_response():
    prompt = request.args.get('prompt')
    session_id = request.args.get('session', 'default')

    _add_to_history(session_id, "user", prompt)

    schools_context = _get_schools_context()
    history = _get_or_create_history(session_id)

    messages = [{"role": "system", "content": SYSTEM_PROMPT + "\n\n" + schools_context}]
    messages.extend(history)

    response = _get_openai_client().chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        max_tokens=500,
        temperature=0.7
    )

    output = response.choices[0].message.content
    output = _clean_text(output)
    _add_to_history(session_id, "assistant", output)

    return jsonify({'output': output})


@app.route('/__ai_stream__', methods=['GET'])
def get_response_stream():
    prompt = request.args.get('prompt')
    session_id = request.args.get('session', 'default')

    _add_to_history(session_id, "user", prompt)

    def generate():
        schools_context = _get_schools_context()
        history = _get_or_create_history(session_id)

        messages = [{"role": "system", "content": SYSTEM_PROMPT + "\n\n" + schools_context}]
        messages.extend(history)

        stream = _get_openai_client().chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            stream=True,
            max_tokens=500,
            temperature=0.7
        )

        full_text = ""
        for chunk in stream:
            if chunk.choices[0].delta.content:
                text = chunk.choices[0].delta.content
                full_text += text
                yield f"data: {json.dumps({'text': text, 'done': False})}\n\n"

        full_text = _clean_text(full_text)
        _add_to_history(session_id, "assistant", full_text)
        yield f"data: {json.dumps({'text': '', 'done': True, 'full': full_text})}\n\n"

    return Response(stream_with_context(generate()), mimetype='text/event-stream',
                    headers={'Cache-Control': 'no-cache', 'X-Accel-Buffering': 'no'})


@app.route('/reset', methods=['POST'])
def reset_conversation():
    session_id = request.args.get('session', 'default')
    if session_id in _conversation_history:
        del _conversation_history[session_id]
    return jsonify({'status': 'ok'})


@app.route('/tts', methods=['POST'])
def text_to_speech():
    data = request.get_json()
    text = data.get('text', '')

    if not text:
        return jsonify({'error': 'No text'}), 400

    try:
        response = _get_openai_client().audio.speech.create(
            model="tts-1",
            voice="nova",
            input=text,
            speed=1.0,
            response_format="mp3"
        )

        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as tmp:
            response.stream_to_file(tmp.name)
            tmp_path = tmp.name

        return send_file(tmp_path, mimetype='audio/mpeg')
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/stt', methods=['POST'])
def speech_to_text():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio'}), 400

    audio = request.files['audio']

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as tmp:
            audio.save(tmp)
            tmp_path = tmp.name

        with open(tmp_path, "rb") as f:
            transcript = _get_openai_client().audio.transcriptions.create(
                model="whisper-1",
                file=f,
                language="cs",
                response_format="text",
                temperature=0.0
            )

        os.unlink(tmp_path)
        result = transcript if isinstance(transcript, str) else transcript.text
        print(f"Rozpoznano: {result}")

        return jsonify({'text': result})
    except Exception as e:
        print(f"STT Error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/', methods=['GET'])
def home():
    return "Klara bezi!", 200


@app.route('/webhook', methods=['GET'])
def verify_webhook():
    mode = request.args.get('hub.mode')
    token = request.args.get('hub.verify_token')
    challenge = request.args.get('hub.challenge')
    verify = os.getenv("VERIFY_TOKEN", "my_secret_token_123")
    if mode == 'subscribe' and token == verify:
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
                        _add_to_history(sender_id, "user", user_message)
                        schools_context = _get_schools_context()
                        history = _get_or_create_history(sender_id)

                        messages = [{"role": "system", "content": SYSTEM_PROMPT + "\n\n" + schools_context}]
                        messages.extend(history)

                        response = _get_openai_client().chat.completions.create(
                            model="gpt-4o-mini",
                            messages=messages,
                            max_tokens=500
                        )

                        output = _clean_text(response.choices[0].message.content)
                        _add_to_history(sender_id, "assistant", output)

                        # Send to Messenger
                        token = os.getenv("PAGE_ACCESS_TOKEN")
                        if token:
                            url = f"https://graph.facebook.com/v18.0/me/messages?access_token={token}"
                            requests.post(url, json={
                                "recipient": {"id": sender_id},
                                "message": {"text": output[:2000]}
                            })
                    except Exception as e:
                        print(f"Error: {e}")

    return "OK", 200


if __name__ == '__main__':
    _load_schools_db()
    print("Klara startuje na portu 5000...")
    app.run(host='0.0.0.0', port=5000, debug=True, threaded=True)

