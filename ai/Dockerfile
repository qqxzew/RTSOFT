FROM python:3.11-slim

WORKDIR /app
COPY . .
RUN pip install --no-cache-dir flask python-dotenv openai
EXPOSE 5000
CMD ["python3", "base.py"]
