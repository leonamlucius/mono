package com.mono.monoapi.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserInfoResponse {

    private String email;
    private String name;
    private LocalDateTime createdAt;

}
