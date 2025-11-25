# ============================
#  SkillSwap Spring Boot Dockerfile
# ============================

# Use Eclipse Temurin (Adoptium) OpenJDK 21 for runtime
FROM eclipse-temurin:21-jdk-jammy AS build

# Set working directory
WORKDIR /app

# Copy Maven wrapper and pom.xml first (for dependency caching)
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Download dependencies (this helps Docker cache dependencies)
RUN ./mvnw dependency:go-offline

# Copy the rest of the project files
COPY src src

# Build the jar file (skip tests to speed up build)
RUN ./mvnw clean package -DskipTests

# ----------------------------
# Runtime stage
# ----------------------------
FROM eclipse-temurin:21-jre-jammy

# Working directory inside the container
WORKDIR /app

# Copy the generated jar from the build stage
COPY --from=build /app/target/skillswap-0.0.1-SNAPSHOT.jar app.jar

# Expose application port
EXPOSE 8080

# Set environment variables (can also be overridden in docker-compose.yml)
ENV SPRING_PROFILES_ACTIVE=docker

# Command to run the app
ENTRYPOINT ["java", "-jar", "app.jar"]
