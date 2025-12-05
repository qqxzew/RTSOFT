import os

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from openai import OpenAI
import requests

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
    
def _get_page_access_token():
    """Get Facebook Page Access Token from environment variables."""
    return os.getenv("PAGE_ACCESS_TOKEN")

def _get_verify_token():
    """Get Facebook Verify Token from environment variables."""
    return os.getenv("VERIFY_TOKEN", "my_secret_token_123")  # секретный токен для верификации

# Ваш существующий маршрут
@app.route('/__ai__', methods=['GET'])
def get_response():
    prompt = request.args.get('prompt')
    response = _get_openai_client().responses.create(
        model="gpt-4o",
        input=prompt
    )
    return jsonify({'output': response.output_text})


# Проверка что сервер работает
@app.route('/', methods=['GET'])
def home():
    return "Bot is running!", 200


# Верификация вебхука (GET) - Facebook проверяет ваш URL
@app.route('/webhook', methods=['GET'])
def verify_webhook():
    mode = request.args.get('hub.mode')
    token = request.args.get('hub.verify_token')
    challenge = request.args.get('hub.challenge')
    
    print(f"Verification: mode={mode}, token={token}")
    
    if mode == 'subscribe' and token == _get_verify_token:
        print("Webhook verified!")
        return challenge, 200
    else:
        print("Verification failed!")
        return "Forbidden", 403


# Приём сообщений (POST) - Facebook отправляет сюда сообщения
@app.route('/webhook', methods=['POST'])
def receive_message():
    data = request.get_json()
    print(f"Received: {data}")
    
    if data.get('object') == 'page':
        for entry in data.get('entry', []):
            for event in entry.get('messaging', []):
                sender_id = event['sender']['id']
                
                if 'message' in event and 'text' in event['message']:
                    user_message = event['message']['text']
                    print(f"User {sender_id}: {user_message}")
                    
                    try:
                        # Получаем ответ от GPT
                        response = _get_openai_client().responses.create(
                            model="gpt-4o",
                            input=user_message
                        )
                        bot_reply = response.output_text
                        print(f"Bot: {bot_reply}")
                        
                        # Отправляем ответ
                        send_message(sender_id, bot_reply)
                        
                    except Exception as e:
                        print(f"Error: {e}")
                        send_message(sender_id, "Произошла ошибка. Попробуйте позже.")
    
    return "OK", 200


def send_message(recipient_id, message_text):
    url = f"https://graph.facebook.com/v18.0/me/messages?access_token={_get_page_access_token()}"
    
    # Facebook ограничивает длину до 2000 символов
    if len(message_text) > 2000:
        message_text = message_text[:1997] + "..."
    
    payload = {
        "recipient": {"id": recipient_id},
        "message": {"text": message_text}
    }
    
    response = requests.post(url, json=payload)
    print(f"Send result: {response.json()}")
    return response.json()


if __name__ == "__main__":
    print("Starting server...")
    print(f"VERIFY_TOKEN: {_get_verify_token()}")
    print(f"PAGE_ACCESS_TOKEN set: {bool(_get_page_access_token())}")
    app.run(host='0.0.0.0', port=5000, debug=True)