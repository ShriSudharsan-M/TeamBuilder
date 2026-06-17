package com.teambuilder.demo.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.teambuilder.demo.Dto.TeamResponseDTO;
import com.teambuilder.demo.Service.TeamService;
import com.teambuilder.demo.model.Team;

@RestController
@RequestMapping("/teams")
public class TeamController {

    private final TeamService teamService;

    public TeamController(TeamService teamService) {
        this.teamService = teamService;
    }

    // CREATE TEAM (JWT user becomes leader automatically)
    @PostMapping("/create")
    public ResponseEntity<Team> createTeam(
            @RequestParam String teamName,
            @RequestParam String description,
            @RequestParam int maxMembers) {

        // teamLeaderId is ignored in service (JWT handled)
        Team team = teamService.createTeam(
                teamName,
                description,
                0L,
                maxMembers
        );

        return ResponseEntity.ok(team);
    }

    @GetMapping("/matched")
    public ResponseEntity<List<TeamResponseDTO>> getMatchedTeams() {

        List<TeamResponseDTO> teams = teamService.getMatchedTeams()
                .stream()
                .map(team -> new TeamResponseDTO(
                        team.getId(),
                        team.getTeamName(),
                        team.getTeamLeaderId()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(teams);
    }

    // GET TEAM BY ID
    @GetMapping("/{id}")
    public ResponseEntity<Team> getTeamById(@PathVariable Long id) {

        Team team = teamService.getTeamById(id);

        if (team == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(team);
    }

    // GET ALL TEAMS
    @GetMapping
    public List<Team> getAllTeams() {
        return teamService.getAllTeams();
    }

    // UPDATE TEAM (ONLY LEADER)
    @PutMapping("/{teamId}")
    public ResponseEntity<Team> updateTeam(
            @PathVariable Long teamId,
            @RequestParam String teamName,
            @RequestParam String description,
            @RequestParam int maxMembers) {

        Team updatedTeam = teamService.updateTeam(
                teamName,
                description,
                teamId,
                maxMembers
        );

        return ResponseEntity.ok(updatedTeam);
    }

    // DELETE TEAM (ONLY LEADER)
    @DeleteMapping("/{teamId}")
    public ResponseEntity<String> deleteTeam(@PathVariable Long teamId) {

        teamService.deleteTeam(teamId);

        return ResponseEntity.ok("Team deleted successfully");
    }

    // ADD SKILL TO TEAM (ONLY LEADER)
    @PostMapping("/{teamId}/skills")
    public ResponseEntity<String> addSkillToTeam(
            @PathVariable Long teamId,
            @RequestParam String skillName,
            @RequestParam int requiredCount) {

        return ResponseEntity.ok(
                teamService.addSkillToTeam(teamId, skillName, requiredCount)
        );
    }

    // GET TEAM SKILLS
    @GetMapping("/{teamId}/skills")
    public ResponseEntity<List<String>> getTeamSkills(@PathVariable Long teamId) {

        return ResponseEntity.ok(
                teamService.getTeamSkills(teamId)
        );
    }

    // REMOVE SKILL
    @DeleteMapping("/{teamId}/skills/{skillId}")
    public ResponseEntity<String> removeSkillFromTeam(
            @PathVariable Long teamId,
            @PathVariable Long skillId) {

        return ResponseEntity.ok(
                teamService.removeSkillFromTeam(teamId, skillId)
        );
    }

    // GET VACANCY
    @GetMapping("/{teamId}/vacancy")
    public ResponseEntity<Integer> getVacancy(@PathVariable Long teamId) {

        return ResponseEntity.ok(
                teamService.getVacancy(teamId)
        );
    }
}