package com.muhammetakduman.refresh_token_auth.repository;

import com.muhammetakduman.refresh_token_auth.entitiy.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User,Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

}
