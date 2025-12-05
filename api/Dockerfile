FROM eclipse-temurin:21-jdk-jammy

WORKDIR /app
COPY . .
RUN chmod +x ./gradlew
EXPOSE 8080
CMD ["./gradlew", "run"]
