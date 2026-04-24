package com.muhammetakduman.refresh_token_auth.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;


//Entitiyleri direkt controller katmananı açmadan önce dto nesnelerine sarıyorum.
@Data
public class RegisterRequest {
    @NotBlank(message = "Full name cannot be empty")
    private String fullName;
    @Email(message = "Invalid email format")
    @NotBlank(message = "Email cannot be empty")
    private String email;
    @NotBlank(message = "Password cannot be empty")
    private String password;
}
