package com.muhammetakduman.refresh_token_auth.entitiy;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "refresh_tokens")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Token'ın düz hali değil, SHA-256 hash hali tutulacak
    @Column(name = "token_hash", nullable = false, unique = true, length = 64)
    private String tokenHash;

    // sebebi farklı cihazlarda aynı token
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Refresh token 5 dakika geçerli olacak
    @Column(name = "expiry_date", nullable = false)
    private LocalDateTime expiryDate;

    // Logout veya güvenlik durumunda token geçersiz yapılabilir
    @Column(nullable = false)
    private boolean revoked;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

}
