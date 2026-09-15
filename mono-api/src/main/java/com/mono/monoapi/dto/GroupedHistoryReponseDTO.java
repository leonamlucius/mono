package com.mono.monoapi.dto;

import java.util.List;

public record GroupedHistoryReponseDTO(
        List<ChatGroupData> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean isLast) {

}
