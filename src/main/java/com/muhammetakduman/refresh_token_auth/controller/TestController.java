package com.muhammetakduman.refresh_token_auth.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @GetMapping("/protected")
    public Map<String, String> protectedEndpoint(@AuthenticationPrincipal UserDetails userDetails) {
        return Map.of(
                "message", "Bu korumalı bir endpoint!",
                "email", userDetails.getUsername()
        );
    }
}
