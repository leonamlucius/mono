package com.mono.monoapi.controller;

import jakarta.servlet.http.Cookie;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import com.mono.monoapi.dto.UserInfoRequest;
import com.mono.monoapi.dto.UserInfoResponse;
import com.mono.monoapi.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    public UserService userService;

    @GetMapping("/get-user-info")
    public ResponseEntity<UserInfoResponse> getUserInfo(
            HttpServletRequest request) {
        String token = null;
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("jwt".equals(cookie.getName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        }
        UserInfoResponse user = userService.getUserInfo(token);
        return ResponseEntity.ok(user);
    }

    @PatchMapping("/get-user-info")
    public ResponseEntity<UserInfoResponse> updateUserInfo(@Valid @RequestBody UserInfoRequest request,
            HttpServletRequest httpRequest) {

        String bearerToken = null;
        Cookie[] cookies = httpRequest.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("jwt".equals(cookie.getName())) {
                    bearerToken = cookie.getValue();
                    break;
                }
            }
        }

        UserInfoResponse user = userService.updateUserInfo(request, bearerToken);
        return ResponseEntity.ok(user);
    }

}
