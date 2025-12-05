FROM eclipse-temurin:21-jdk-jammy

WORKDIR /app

# Copy only wrapper files + build config first
COPY gradle/wrapper gradlew gradlew.bat settings.gradle* build.gradle* ./

RUN chmod +x ./gradlew \
    # Force Gradle download now (this caches distribution) \
    && ./gradlew --no-daemon --version

# Then copy rest of source
COPY . .

EXPOSE 8080

CMD ["./gradlew", "run"]
