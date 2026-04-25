package com.muhammetakduman.refresh_token_auth.service;

import com.muhammetakduman.refresh_token_auth.config.CookieConfig;
import com.muhammetakduman.refresh_token_auth.dto.request.LoginRequest;
import com.muhammetakduman.refresh_token_auth.dto.request.RegisterRequest;
import com.muhammetakduman.refresh_token_auth.dto.response.AuthResponse;
import com.muhammetakduman.refresh_token_auth.entitiy.User;
import com.muhammetakduman.refresh_token_auth.repository.UserRepository;
import com.muhammetakduman.refresh_token_auth.security.JwtService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final CookieConfig cookieConfig;

    public void register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use");
        }
        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .localDateTime(LocalDateTime.now())
                .build();
        userRepository.save(user);
    }

    public AuthResponse login(LoginRequest request, HttpServletResponse response) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String accessToken = jwtService.genereteAccessToken(user.getEmail());

        // Refresh token üret ve HttpOnly cookie olarak set et
        String rawRefreshToken = refreshTokenService.createRefreshToken(user);
        response.addCookie(cookieConfig.createRefreshTokenCookie(rawRefreshToken));

        return AuthResponse.builder()
                .accessToken(accessToken)
                .tokenType("Bearer")
                .build();
    }

    public AuthResponse refresh(String rawRefreshToken, HttpServletResponse response) {
        // Token doğrula, rotation yap (eski silinir)
        User user = refreshTokenService.verifyAndRotate(rawRefreshToken);

        String newAccessToken = jwtService.genereteAccessToken(user.getEmail());

        // Yeni refresh token üret ve cookie'ye yaz
        String newRawRefreshToken = refreshTokenService.createRefreshToken(user);
        response.addCookie(cookieConfig.createRefreshTokenCookie(newRawRefreshToken));

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .tokenType("Bearer")
                .build();
    }

    public void logout(String rawRefreshToken, HttpServletResponse response) {
        if (rawRefreshToken != null) {
            refreshTokenService.revokeByRawToken(rawRefreshToken);
        }
        response.addCookie(cookieConfig.clearRefreshTokenCookie());
    }
}
