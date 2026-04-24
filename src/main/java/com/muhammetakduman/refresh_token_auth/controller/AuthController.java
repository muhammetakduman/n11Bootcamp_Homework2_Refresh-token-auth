package com.muhammetakduman.refresh_token_auth.controller;


import com.muhammetakduman.refresh_token_auth.dto.request.LoginRequest;
import com.muhammetakduman.refresh_token_auth.dto.request.RegisterRequest;
import com.muhammetakduman.refresh_token_auth.dto.response.AuthResponse;
import com.muhammetakduman.refresh_token_auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public void register(@RequestBody RegisterRequest request){
        authService.register(request);
    }

    @PostMapping
    public AuthResponse login(@RequestBody LoginRequest request){
        return authService.login(request);
    }
}
