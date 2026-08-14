package com.mono.monoapi.service;

import org.springframework.stereotype.Service;
import com.mono.monoapi.config.JwtUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class CookieService {
    private static final Logger logger = LoggerFactory.getLogger(CookieService.class);

    @Autowired
    private JwtUtil jwtUtil;

    public Cookie createJwtCookie(String email, String userId) {

        try {
            String token = jwtUtil.generateToken(email, userId);
            Cookie jwtCookie = new Cookie("jwt", token);
            jwtCookie.setHttpOnly(true);
            jwtCookie.setSecure(true);
            jwtCookie.setPath("/");
            jwtCookie.setMaxAge(60 * 60); // 1 hour
            jwtCookie.setAttribute("SameSite", "None");
            return jwtCookie;
        } catch (Exception e) {
            logger.error("Erro ao criar cookie JWT: {}", e.getMessage());
            throw e;
        }

    }

    public Cookie deleteJwtCookie() {

        try {
            Cookie jwtCookie = new Cookie("jwt", null);
            jwtCookie.setHttpOnly(true);
            jwtCookie.setSecure(true);
            jwtCookie.setPath("/");
            jwtCookie.setMaxAge(0); // Expire immediately
            jwtCookie.setAttribute("SameSite", "None");
            return jwtCookie;
        } catch (Exception e) {
            logger.error("Erro ao deletar cookie JWT: {}", e.getMessage());
            throw e;
        }

    }

    public Cookie getJwtCookieFromRequest(HttpServletRequest request) {
        try {
            Cookie[] cookies = request.getCookies();
            if (cookies != null) {
                for (Cookie cookie : cookies) {
                    if ("jwt".equals(cookie.getName())) {
                        return cookie;
                    }
                }
            }
            return null;
        } catch (Exception e) {
            logger.error("Erro ao obter cookie JWT da requisição: {}", e.getMessage());
            throw e;
        }
    }
}
