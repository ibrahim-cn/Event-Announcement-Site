package com.eventannouncement.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/h2-console/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/appusers", "/api/appusers/*").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/appusers").denyAll()
                        .requestMatchers(HttpMethod.PUT, "/api/appusers").denyAll()
                        .requestMatchers(HttpMethod.DELETE, "/api/appusers/*").denyAll()
                        .requestMatchers(HttpMethod.POST, "/api/events").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/uploads/image").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/events/*/registrations").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/events/*/registrations").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/events/*/registrations/*").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/events/registrations/me").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/events/*/registrations").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/account/me").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/account/me").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/account/me/profile-image").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/events/*").authenticated()
                        .requestMatchers("/api/**").permitAll()
                        .anyRequest().permitAll()
                )
                .headers(h -> h.frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin))
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
