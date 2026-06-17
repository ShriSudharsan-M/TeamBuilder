package com.teambuilder.demo.Service;

import java.util.List;
import com.teambuilder.demo.model.User;

public interface UserService {
    public User registerUser(String username, String password, String email);
    public User getUserById(Long id);
    public List<User> getAllUsers();
    public User updateUser(User user);
    public void deleteUser(Long id);
    // public List<TeamResponseDTO> matchedTeams(Long userId);
}
