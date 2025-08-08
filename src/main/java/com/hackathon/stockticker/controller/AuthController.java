package com.hackathon.stockticker.controller;

import com.hackathon.stockticker.dto.ApiResponse;
import com.hackathon.stockticker.dto.AuthRequest;
import com.hackathon.stockticker.dto.AuthResponse;
import com.hackathon.stockticker.model.User;
import com.hackathon.stockticker.security.JwtTokenUtil;
import com.hackathon.stockticker.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Authentication management APIs")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticate user and return JWT token")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody AuthRequest authRequest) {
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getPassword())
            );

            UserDetails userDetails = userService.loadUserByUsername(authRequest.getUsername());
            String token = jwtTokenUtil.generateToken(userDetails);

            AuthResponse authResponse = new AuthResponse(token, authRequest.getUsername());
            return ResponseEntity.ok(ApiResponse.success("Login successful", authResponse));

        } catch (BadCredentialsException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid credentials"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Authentication failed: " + e.getMessage()));
        }
    }

    @PostMapping("/register")
    @Operation(summary = "User registration", description = "Register a new user account")
    public ResponseEntity<ApiResponse<User>> register(@RequestBody AuthRequest authRequest) {
        try {
            if (userService.existsByUsername(authRequest.getUsername())) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Username already exists"));
            }

            User user = userService.createUser(authRequest.getUsername(), authRequest.getPassword());
            return ResponseEntity.ok(ApiResponse.success("User registered successfully", user));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Registration failed: " + e.getMessage()));
        }
    }
}
