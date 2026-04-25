package com.muhammetakduman.refresh_token_auth.service;

import com.muhammetakduman.refresh_token_auth.entitiy.RefreshToken;
import com.muhammetakduman.refresh_token_auth.entitiy.User;
import com.muhammetakduman.refresh_token_auth.exception.TokenRefreshException;
import com.muhammetakduman.refresh_token_auth.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final TokenHashService tokenHashService;

    @Value("${jwt.refresh-token-expiration-minutes}")
    private long refreshTokenExpirationMinutes;

    // Kullanıcı için yeni refresh token oluştur, eskisini sil
    @Transactional
    public String createRefreshToken(User user) {
        // Kullanıcının eski tokenlarını temizle (tek cihaz politikası)
        refreshTokenRepository.deleteByUser(user);

        String rawToken = UUID.randomUUID().toString();
        String tokenHash = tokenHashService.hashToken(rawToken);

        RefreshToken refreshToken = RefreshToken.builder()
                .tokenHash(tokenHash)
                .user(user)
                .expiryDate(LocalDateTime.now().plusMinutes(refreshTokenExpirationMinutes))
                .revoked(false)
                .createdAt(LocalDateTime.now())
                .build();

        refreshTokenRepository.save(refreshToken);

        // Ham token (UUID) cookie'ye gidecek, DB'de hash'i tutulacak
        return rawToken;
    }

    // Cookie'den gelen ham token ile doğrulama yap, yeni access token için user döndür
    @Transactional
    public User verifyAndRotate(String rawToken) {
        String tokenHash = tokenHashService.hashToken(rawToken);

        RefreshToken refreshToken = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new TokenRefreshException("Refresh token not found or already used"));

        if (refreshToken.isRevoked()) {
            throw new TokenRefreshException("Refresh token has been revoked");
        }

        if (refreshToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            refreshTokenRepository.delete(refreshToken);
            throw new TokenRefreshException("Refresh token has expired, please login again");
        }

        // Rotation: eski token silinir, yeni token üretilir
        User user = refreshToken.getUser();
        refreshTokenRepository.delete(refreshToken);

        return user;
    }

    @Transactional
    public void revokeByRawToken(String rawToken) {
        String tokenHash = tokenHashService.hashToken(rawToken);
        refreshTokenRepository.deleteByTokenHash(tokenHash);
    }

    @Transactional
    public void revokeAllByUser(User user) {
        refreshTokenRepository.deleteByUser(user);
    }
}
