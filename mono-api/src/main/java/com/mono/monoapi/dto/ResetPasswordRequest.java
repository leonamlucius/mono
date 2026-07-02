package com.mono.monoapi.dto;

import jakarta.validation.constraints.NotBlank;

public record ResetPasswordRequest(
    @NotBlank(message = "Token obrigatório.") 
    String token,

    @NotBlank(message = "Nova senha obrigatória.") 
    String newPassword
) {
    
}