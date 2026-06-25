package com.mono.monoapi.dto;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "Nome obrigatório.")
    private String name;

    @Email(message = "Email inválido.")
    @NotBlank(message = "Email obrigatório.")
    private String email;

    @NotBlank(message = "Senha obrigatória.")
    @Size(min = 8, message = "Senha deve ter no mínimo 8 caracteres.")
    private String password;
}
