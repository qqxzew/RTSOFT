import os

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from openai import OpenAI

load_dotenv()

api_key = os.getenv("api_key")

client = OpenAI(api_key=api_key)

app = Flask(__name__)

@app.route('/__ai__', methods=['GET'])
def get_response():
    prompt = request.args.get('prompt')
    response = client.responses.create(
        model="gpt-4o",
        input=prompt
    )
    return jsonify({'output': response.output_text})

if __name__ == "__main__":
    app.run()