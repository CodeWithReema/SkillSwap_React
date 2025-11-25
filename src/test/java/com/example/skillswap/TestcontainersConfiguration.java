package com.example.skillswap;

import jakarta.annotation.PreDestroy;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;

@TestConfiguration(proxyBeanMethods = false)
class TestcontainersConfiguration {

	private PostgreSQLContainer<?> postgresContainer;
	private GenericContainer<?> redisContainer;

	@Bean
	@ServiceConnection
	PostgreSQLContainer<?> postgresContainer() {
		this.postgresContainer = new PostgreSQLContainer<>(DockerImageName.parse("postgres:latest"));
		return this.postgresContainer;
	}

	@Bean
	@ServiceConnection(name = "redis")
	GenericContainer<?> redisContainer() {
		GenericContainer<?> container = new GenericContainer<>(DockerImageName.parse("redis:latest"));
		container.withExposedPorts(6379);
		this.redisContainer = container;
		return container;
	}

	@PreDestroy
	void cleanup() {
		if (postgresContainer != null && postgresContainer.isRunning()) {
			postgresContainer.close();
		}
		if (redisContainer != null && redisContainer.isRunning()) {
			redisContainer.close();
		}
	}

}
