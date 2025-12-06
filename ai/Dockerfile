FROM python:3.11-slim

WORKDIR /app

# Copy source
COPY . .

# Install dependencies
RUN pip install --no-cache-dir \
    flask \
    python-dotenv \
    openai \
    requests

# Expose Flask port
EXPOSE 5000

# Copy and use entrypoint script
COPY docker-entrypoint-py.sh /app/docker-entrypoint-py.sh
RUN chmod +x /app/docker-entrypoint-py.sh

ENTRYPOINT ["bash", "/app/docker-entrypoint-py.sh"]

