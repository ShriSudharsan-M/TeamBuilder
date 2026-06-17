package com.teambuilder.demo.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.teambuilder.demo.Dto.RegisterRequestDTO;
import com.teambuilder.demo.Dto.UserResponseDTO;
import com.teambuilder.demo.Service.UserService;
import com.teambuilder.demo.model.User;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponseDTO> registerUser(@RequestBody RegisterRequestDTO request){

        User registeredUser = service.registerUser(
                request.getUsername(),
                request.getPassword(),
                request.getEmail()
        );

        return ResponseEntity.ok(
                new UserResponseDTO(
                        registeredUser.getId(),
                        registeredUser.getUsername(),
                        registeredUser.getEmail()
                )
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable Long id) {

        User user = service.getUserById(id);

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(
                new UserResponseDTO(
                        user.getId(),
                        user.getUsername(),
                        user.getEmail()
                )
        );
    }

    @GetMapping("/")
    public List<UserResponseDTO> getAllUsers() {

        return service.getAllUsers()
                .stream()
                .map(user -> new UserResponseDTO(
                        user.getId(),
                        user.getUsername(),
                        user.getEmail()
                ))
                .collect(Collectors.toList());
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDTO> updateUser(
            @PathVariable Long id,
            @RequestBody User user) {

        User existingUser = service.getUserById(id);

        if (existingUser == null) {
            return ResponseEntity.notFound().build();
        }

        existingUser.setUsername(user.getUsername());
        existingUser.setEmail(user.getEmail());

        User updatedUser = service.updateUser(existingUser);

        return ResponseEntity.ok(
                new UserResponseDTO(
                        updatedUser.getId(),
                        updatedUser.getUsername(),
                        updatedUser.getEmail()
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {

        User user = service.getUserById(id);

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        service.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}