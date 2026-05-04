package com.unigov.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.lang.NonNull;

@Configuration
public class MvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        // Avec Cloudinary, nous n'avons plus besoin d'exposer de dossier local.
    }
}
