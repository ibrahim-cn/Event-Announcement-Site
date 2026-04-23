package com.eventannouncement.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestControllerAdvice
public class ValidationExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        List<String> messages = ex.getBindingResult().getFieldErrors().stream()
                .map(this::toMessage)
                .toList();

        String summary = String.join(" ", messages);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("message", summary);
        body.put("errors", messages);
        body.put("status", HttpStatus.BAD_REQUEST.value());

        return ResponseEntity.badRequest().body(body);
    }

    private String toMessage(FieldError fe) {
        String field = fe.getField();
        String code = fe.getCode();

        if (code != null && code.contains("NotBlank")) {
            return switch (field) {
                case "username" -> "Username is required.";
                case "email" -> "Email is required.";
                case "password" -> "Password is required.";
                default -> "This field is required.";
            };
        }
        if (code != null && code.contains("Email")) {
            return "Please enter a valid email address.";
        }
        if (code != null && code.contains("Size") && "password".equals(field)) {
            return "Password must be at least 6 characters.";
        }
        String def = fe.getDefaultMessage();
        if (def != null && !def.isBlank()) {
            return def;
        }
        return "Invalid value: " + field;
    }
}
