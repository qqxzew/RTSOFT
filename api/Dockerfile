FROM eclipse-temurin:21-jdk-jammy

WORKDIR /app
COPY . .
RUN chmod +x ./gradlew
EXPOSE 8080

# Entrypoint
COPY docker-entrypoint-kt.sh /app/docker-entrypoint-kt.sh
RUN chmod +x /app/docker-entrypoint-kt.sh

ENTRYPOINT ["/app/docker-entrypoint-kt.sh"]
