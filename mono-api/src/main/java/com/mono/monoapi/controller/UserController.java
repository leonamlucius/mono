package com.mono.monoapi.controller;

import jakarta.servlet.http.Cookie;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import com.mono.monoapi.dto.UserInfoRequest;
import com.mono.monoapi.dto.UserInfoResponse;
import com.mono.monoapi.service.UserService;
import com.mono.monoapi.service.CookieService;
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

    @Autowired
    public CookieService cookieService;

    @GetMapping("/get-user-info")
    public ResponseEntity<UserInfoResponse> getUserInfo(
            HttpServletRequest request) {
        String token = cookieService.getJwtCookieFromRequest(request) != null
                ? cookieService.getJwtCookieFromRequest(request).getValue()
                : null;

        UserInfoResponse user = userService.getUserInfo(token);
        return ResponseEntity.ok(user);
    }

    @PatchMapping("/get-user-info")
    public ResponseEntity<UserInfoResponse> updateUserInfo(@Valid @RequestBody UserInfoRequest request,
            HttpServletRequest httpRequest) {

        String bearerToken = cookieService.getJwtCookieFromRequest(httpRequest) != null
                ? cookieService.getJwtCookieFromRequest(httpRequest).getValue()
                : null;

        UserInfoResponse user = userService.updateUserInfo(request, bearerToken);
        return ResponseEntity.ok(user);
    }

}
