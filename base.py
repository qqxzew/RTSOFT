from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("api_key")

client = OpenAI(api_key=api_key)

while True:
    user_input = input("You: ")
    response = client.responses.create(
        model="gpt-4o",
        input=user_input
    )
    print("Assistent:", response.output_text) 