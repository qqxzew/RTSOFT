import os
import json
from dotenv import load_dotenv
from flask import Flask, jsonify, request, Response, stream_with_context, send_from_directory
from openai import OpenAI
import requests
from flask_cors import CORS

load_dotenv()
app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://localhost:8080"], supports_credentials=True)

_client = None
_schools_db = None
_conversation_history = {}

# Интегрированный промпт из promt.txt
SYSTEM_PROMPT = """Jsi Klára, přátelská školní kariérní poradkyně pro teenagery ve věku 14-20 let.
Pracuješ hlavně s informacemi o středních školách v Plzeňském kraji.

TVŮJ STYL:
- Mluv česky, přirozeně a přátelsky
- Oslovuj na "ty" jako starší kamarádka
- Piš lidsky, lehce, s kamarádským vibe
- Motivuj, dávej podporu a jednoduché rady
- Žádné moralizování, žádné "musíš", jen pomoc a pochopení
- Klidně trochu humoru, ale žádné ponižování
- Drž se tématu: kariéra, studium, budoucnost, motivace

DŮLEŽITÉ - FORMÁTOVÁNÍ:
- NIKDY nepouživej hvězdičky (*), mřížky (#), podtržítka (_)
- NIKDY nepouživej markdown formátování
- NIKDY nepouživej odrážky ani číslované seznamy
- Piš pouze čistý text bez jakéhokoliv formátování
- Odpovídej přirozeně v odstavcích

ZKRATKY ŠKOL (rozpoznej tyto zkratky):
- INFIS, infis = Střední škola informatiky a finančních služeb, Plzeň
- SPŠE, spše = Střední průmyslová škola elektrotechnická, Plzeň
- GPOA, gpoa = Gymnázium a Střední odborná škola, Plasy
- SPŠ, spš = Střední průmyslová škola (různé v kraji)
- SOŠP = Střední odborná škola podnikatelská, Plzeň
- VOŠ = Vyšší odborná škola
- Masaryčka = Masarykovo gymnázium, Plzeň
- Mikulášské = Gymnázium Luďka Pika (u sv. Mikuláše)
- Lerchova = SPŠ strojnická na Lerchově ulici

TVOJE ROLE:
- Expert na české střední školy a jejich zaměření
- Specialistka na Plzeňský kraj
- Umíš pracovat s info o školách (obory, zaměření, výhody, pro koho se hodí)
- Umíš přiblížit, jaké kariéry vedou z daného oboru
- Umíš pomoct teenovi najít, k čemu má předpoklady

PRÁCE S DATY:
- Pokud znáš konkrétní školu, vysvětli jaká je, co nabízí, pro koho je dobrá
- Pokud školu neznáš, zeptej se uživatele na upřesnění
- U každého oboru máš data o přijímačkách: počet přihlášek a počet přijatých
- Když se někdo ptá na šance dostat se na školu, použij tato data a spočítej úspěšnost v procentech
- Například: "Na tento obor se hlásilo 70 lidí a přijali 30, takže šance je asi 43 procent"

TVOJE ÚKOLY:
- "Na jakou školu mám jít?" → zeptej se na zájmy, silné stránky, předměty co jdou
- "Co dělá tahle škola?" → vysvětli obor, praxi, budoucí práci
- "Jakou práci bych mohl dělat?" → navrhni 3-6 směrů podle toho, co o sobě řekne
- "Nevím, co chci" → dej motivující otázky a mini-testy
- "Bojím se budoucnosti" → uklidni, podpoř, dej praktické rady

CO NESMÍŠ:
- Neřeš romantiku, vztahy ani nevhodná témata
- Nepodporuj žádné nebezpečné chování
- Vždy drž fokus jen na kariéře a studiu"""


def _get_openai_client():
    global _client
    if _client is None:
        key = os.getenv("OPENAI_API_KEY") or os.getenv("api_key")
        if key:
            _client = OpenAI(api_key=key)
    return _client


def _load_schools_db():
    global _schools_db
    if _schools_db is None:
        try:
            paths = [
                "SSplzenDB_v2.json",
                "./SSplzenDB_v2.json",
                "SŠplzenDB_v2.json",
                "./SŠplzenDB_v2.json"
            ]
            for path in paths:
                if os.path.exists(path):
                    with open(path, "r", encoding="utf-8") as f:
                        _schools_db = json.load(f)
                    print(f"Načteno {len(_schools_db)} škol z {path}")
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

    context = "DATABÁZE ŠKOL V PLZEŇSKÉM KRAJI:\n\n"
    for school in schools:
        if school.get("id") == "nazev-skoly":
            continue

        context += f"ŠKOLA: {school.get('name', '')}, {school.get('city', '')}\n"

        contact = school.get("contact", {})
        if contact.get("web"):
            context += f"Web: {contact.get('web')}\n"

        # Obory s daty o přijímačkách
        programs = school.get("programs", [])
        if programs:
            for prog in programs:
                context += f"  Obor: {prog.get('name', '')} ({prog.get('code', '')}), {prog.get('type', '')}\n"

                # Přijímačky - počet přihlášek a přijatých
                applications = prog.get("applications")
                admitted = prog.get("admitted")
                if applications and admitted:
                    context += f"    Přihlášek: {applications}, Přijato: {admitted}\n"

                # Kam vede
                jobs = prog.get("leads_to_jobs", [])
                if jobs:
                    context += f"    Uplatnění: {', '.join(jobs[:4])}\n"

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


# ============================================
# REALTIME API CONFIG
# ============================================
@app.route('/api/config', methods=['GET'])
def get_config():
    """Vrací API klíč a system prompt pro Realtime API"""
    api_key = os.getenv("OPENAI_API_KEY") or os.getenv("api_key")
    schools_context = _get_schools_context()

    system_prompt = f"""{SYSTEM_PROMPT}

{schools_context}"""

    return jsonify({
        'api_key': api_key,
        'system_prompt': system_prompt,
        'voice': 'shimmer'
    })

@app.route("/")
def health():
    return "OK", 200



# ============================================
# TEXT CHAT ENDPOINTS
# ============================================
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
        temperature=0.7
    )

    output = response.choices[0].message.content
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
            temperature=0.7
        )

        full_text = ""
        for chunk in stream:
            if chunk.choices[0].delta.content:
                text = chunk.choices[0].delta.content
                full_text += text
                yield f"data: {json.dumps({'text': text, 'done': False})}\n\n"

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


@app.route('/', methods=['GET'])
def home():
    return send_from_directory('.', 'chat3d.html')


@app.route('/<path:filename>')
def serve_file(filename):
    return send_from_directory('.', filename)


# ============================================
# WEBHOOK
# ============================================
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
                            messages=messages
                        )

                        output = response.choices[0].message.content
                        _add_to_history(sender_id, "assistant", output)

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
    print("=" * 50)
    print("  KLÁRA - Školní poradkyně")
    print("  s OpenAI Realtime API")
    print("=" * 50)
    print("  Otevři: http://localhost:5000")
    print("  Text chat funguje normálně")
    print("  3D režim používá Realtime API")
    print("=" * 50)
    app.run(host='0.0.0.0', port=5000, debug=True)

