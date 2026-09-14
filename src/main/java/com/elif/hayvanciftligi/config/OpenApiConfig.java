package com.elif.hayvanciftligi.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.context.annotation.Configuration;

/** Swagger/OpenAPI dokümantasyon bilgilerini yapılandırır. */
@Configuration
@OpenAPIDefinition(info = @Info(
        title = "Hayvan Çiftliği API",
        version = "1.0.0",
        description = "Keçi, koyun ve tavukların yönetildiği REST API"))
public class OpenApiConfig {
}
