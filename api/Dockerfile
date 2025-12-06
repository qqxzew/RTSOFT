# Instead of using gradlew
FROM gradle:9.2.1-jdk21

WORKDIR /app

# Copy only build config for caching
COPY gradle/wrapper/ gradle/wrapper/
COPY gradlew gradlew.bat settings.gradle* build.gradle* ./

# Optional version check
RUN gradle --version

# Copy full source
COPY . .

EXPOSE 8080
COPY docker-entrypoint-kt.sh /app/docker-entrypoint-kt.sh
RUN chmod +x /app/docker-entrypoint-kt.sh
ENTRYPOINT ["/app/docker-entrypoint-kt.sh"]
