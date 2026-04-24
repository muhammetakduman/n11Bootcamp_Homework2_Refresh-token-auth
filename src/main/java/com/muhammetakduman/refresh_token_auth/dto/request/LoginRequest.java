package com.muhammetakduman.refresh_token_auth.dto.request;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @Email(message = "Invalid email format")
    @NotBlank(message = "Email cannot be empty")
    private String Email;

    @NotBlank(message = "Password cannot be empty")
    private String Password;
}
