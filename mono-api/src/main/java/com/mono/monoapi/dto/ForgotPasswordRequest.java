package com.mono.monoapi.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ForgotPasswordRequest(

    @NotBlank(message = "Email obrigatório.") 
    @Email(message = "Formato de email inválido.") 
    String email
) {

}
