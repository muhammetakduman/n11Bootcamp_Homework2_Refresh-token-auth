package com.muhammetakduman.refresh_token_auth.controller;


import com.muhammetakduman.refresh_token_auth.dto.request.LoginRequest;
import com.muhammetakduman.refresh_token_auth.dto.request.RegisterRequest;
import com.muhammetakduman.refresh_token_auth.dto.response.AuthResponse;
import com.muhammetakduman.refresh_token_auth.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public void register(@RequestBody RegisterRequest request){
        authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request, HttpServletResponse response) {
        return authService.login(request, response);
    }

    @PostMapping("/refresh")
    public AuthResponse refresh(HttpServletRequest request, HttpServletResponse response) {
        String rawRefreshToken = extractRefreshTokenFromCookie(request);
        return authService.refresh(rawRefreshToken, response);
    }

    @PostMapping("/logout")
    public void logout(HttpServletRequest request, HttpServletResponse response) {
        String rawRefreshToken = extractRefreshTokenFromCookie(request);
        authService.logout(rawRefreshToken, response);
    }

    private String extractRefreshTokenFromCookie(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return null;
        }
        return Arrays.stream(request.getCookies())
                .filter(c -> "refreshToken".equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }
}
