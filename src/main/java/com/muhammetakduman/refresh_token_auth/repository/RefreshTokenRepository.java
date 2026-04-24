package com.muhammetakduman.refresh_token_auth.repository;

import com.muhammetakduman.refresh_token_auth.entitiy.RefreshToken;
import com.muhammetakduman.refresh_token_auth.entitiy.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken,Long> {
    //refresh token kullanıcıdan alıp db katmanında karşılaştırmak için token hash'ini kullanacağım
    Optional<RefreshToken> findByTokenHash(String tokenHash);
    void deleteByUser(User user);
    void deleteByTokenHash(String tokenHash);
}
