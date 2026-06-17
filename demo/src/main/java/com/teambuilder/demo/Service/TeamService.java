package com.teambuilder.demo.Service;

import java.util.List;

import com.teambuilder.demo.model.Team;

public interface TeamService {

    Team createTeam(String teamName,
                    String description,
                    long teamLeaderId,
                    int maxMembers);

    Team getTeamById(Long id);

    List<Team> getAllTeams();

    Team updateTeam(String teamName,
                    String description,
                    Long teamLeaderId,
                    int maxMembers);

    void deleteTeam(Long id);

    String addSkillToTeam(Long teamId,
                          String skillName,
                          int requiredCount);

    List<String> getTeamSkills(Long teamId);

    String removeSkillFromTeam(Long teamId,
                               Long skillId);

    int getVacancy(Long teamId);

    List<Team> getMatchedTeams();
}