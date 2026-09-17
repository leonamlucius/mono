package com.mono.monoapi.dto;

import java.util.List;

public record ChatGroupData(
        String date,
        List<ChatResponseDTO> messages) {
}
