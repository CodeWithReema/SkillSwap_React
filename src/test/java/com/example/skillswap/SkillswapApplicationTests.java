package com.example.skillswap;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test") // Use lightweight H2 profile; see src/test/resources/application-test.properties
class SkillswapApplicationTests {

	@Test
	void contextLoads() {
	}

}
