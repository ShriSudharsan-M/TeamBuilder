package com.teambuilder.demo.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.teambuilder.demo.Service.UserSkillService;
import com.teambuilder.demo.model.UserSkill;

@RestController
@RequestMapping("/skills")
public class UserSkillController {

    private final UserSkillService userSkillService;

    public UserSkillController(UserSkillService userSkillService) {
        this.userSkillService = userSkillService;
    }

    // Add skill (JWT user)
    @PostMapping
    public ResponseEntity<UserSkill> addSkill(@RequestParam String skillName) {
        return ResponseEntity.ok(userSkillService.addSkill(skillName));
    }

    // Get my skills
    @GetMapping
    public ResponseEntity<List<UserSkill>> getMySkills() {
        return ResponseEntity.ok(userSkillService.getMySkills());
    }

    // Update skill
    @PutMapping("/{id}")
    public ResponseEntity<UserSkill> updateSkill(
            @PathVariable Long id,
            @RequestParam String skillName) {

        return ResponseEntity.ok(userSkillService.updateSkill(id, skillName));
    }

    // Delete skill
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSkill(@PathVariable Long id) {
        userSkillService.deleteSkill(id);
        return ResponseEntity.noContent().build();
    }
}