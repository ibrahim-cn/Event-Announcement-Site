package com.eventannouncement.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
public class RootController {

    @GetMapping("/api-info")
    public Map<String, Object> apiInfo() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("service", "Event Announcement API");
        body.put("hint", "Web UI: http://localhost:8081/ (index.html). JSON endpoints below.");
        body.put("paths", List.of(
                "GET /api/events",
                "GET /api/categories",
                "POST /api/auth/register",
                "POST /api/auth/login",
                "/h2-console"
        ));
        return body;
    }
}
