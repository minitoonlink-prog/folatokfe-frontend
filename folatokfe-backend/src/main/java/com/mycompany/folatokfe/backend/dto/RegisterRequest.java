package com.mycompany.folatokfe.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank @Size(max = 150)
    private String nombre;
    @NotBlank @Email @Size(max = 180)
    private String email;
    @NotBlank @Size(min = 6)
    private String password;
}
