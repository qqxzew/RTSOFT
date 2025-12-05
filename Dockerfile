# Single container that runs BOTH:
# - Python Flask AI (base.py) on 127.0.0.1:5000 inside the container
# - Kotlin API via Gradle wrapper (default port assumed 8080)

FROM eclipse-temurin:21-jdk-jammy

# Install Python and basic tools
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       python3 python3-pip python3-venv bash curl unzip git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy project files
COPY . /app

# Make scripts executable
RUN chmod +x /app/api/gradlew \
    && chmod +x /app/docker-entrypoint.sh

# Install Python runtime deps for base.py
RUN python3 -m pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir flask python-dotenv openai

# Optionally warm up Gradle wrapper (uncomment to cache Gradle distribution)
# RUN cd /app/api && ./gradlew --no-daemon --version

# Ports: Kotlin API (8080 assumed), Flask (5000). Only 8080 needs to be published for external clients.
EXPOSE 8080 5000

# OpenAI key is provided via /app/.env (copied from build context) or --env-file at runtime.
# Do not set it here to avoid baking secrets into the image.
ENTRYPOINT ["/app/docker-entrypoint.sh"]
