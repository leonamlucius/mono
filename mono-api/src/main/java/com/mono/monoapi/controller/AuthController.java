package com.mono.monoapi.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import jakarta.servlet.http.Cookie;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;

import com.mono.monoapi.config.JwtUtil;
import com.mono.monoapi.dto.ForgotPasswordRequest;
import com.mono.monoapi.dto.RegisterRequest;
import com.mono.monoapi.dto.ResetPasswordRequest;
import com.mono.monoapi.dto.UserRequest;
import com.mono.monoapi.dto.UserResponse;
import com.mono.monoapi.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    public UserService userService;

    @Autowired
    private JwtUtil jwtUtil;


    @PostMapping("/login")
    public ResponseEntity<UserResponse> login(@Valid @RequestBody UserRequest request, HttpServletResponse response) {
        UserResponse loginResponse = userService.login(request);

        Cookie jwtCookie = new Cookie("jwt",
                jwtUtil.generateToken(loginResponse.getEmail(), loginResponse.getId().toString()));

        jwtCookie.setHttpOnly(true);
        jwtCookie.setSecure(true);
        jwtCookie.setPath("/");
        jwtCookie.setMaxAge(60 * 60);
        jwtCookie.setAttribute("SameSite", "None");

        response.addCookie(jwtCookie);
        return ResponseEntity.ok(loginResponse);
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request,
            HttpServletResponse response) {
        UserResponse loginResponse = userService.register(request);

        Cookie jwtCookie = new Cookie("jwt",
                jwtUtil.generateToken(loginResponse.getEmail(), loginResponse.getId().toString()));

        jwtCookie.setHttpOnly(true);
        jwtCookie.setSecure(true);
        jwtCookie.setPath("/");
        jwtCookie.setMaxAge(60 * 60);
        jwtCookie.setAttribute("SameSite", "None");

        response.addCookie(jwtCookie);
        return ResponseEntity.ok(loginResponse);

    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletResponse response) {

        Cookie jwtCookie = new Cookie("jwt",
                null);
        jwtCookie.setHttpOnly(true);
        jwtCookie.setSecure(true);
        jwtCookie.setPath("/");
        jwtCookie.setMaxAge(0); // Expira imediatamente
        response.addCookie(jwtCookie);

        return ResponseEntity.ok("Logout realizado com sucesso");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        userService.forgotPassword(request.email());
        return ResponseEntity.ok("Password reset link sent to email: " + request.email());
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        String response = userService.resetPassword(request.token(), request.newPassword());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/token-test")
    public ResponseEntity<Boolean> tokenIsExpired(@RequestParam String token) {
        boolean isExpired = userService.tokenIsExpired(token);
        return ResponseEntity.ok(isExpired);
    }

    @GetMapping("/jwt-test")
    public ResponseEntity<Boolean> jwtTest(
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

        if (token == null) {
            return ResponseEntity.status(401).body(false);
        }

        boolean isValid = jwtUtil.isTokenValid(token);
        return ResponseEntity.ok(isValid);
    }

}