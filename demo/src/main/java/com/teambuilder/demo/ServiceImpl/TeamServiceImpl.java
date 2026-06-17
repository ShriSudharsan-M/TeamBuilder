package com.teambuilder.demo.ServiceImpl;

import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.teambuilder.demo.Service.TeamService;
import com.teambuilder.demo.model.Team;
import com.teambuilder.demo.model.TeamRequiredSkill;
import org.springframework.security.core.Authentication;

import com.teambuilder.demo.model.User;
import com.teambuilder.demo.security.CustomUserDetails;
import com.teambuilder.demo.repository.UserRepository;
import com.teambuilder.demo.repository.TeamMemberRepository;
import com.teambuilder.demo.repository.TeamRepository;
import com.teambuilder.demo.repository.TeamRequiredSkillRepository;
import com.teambuilder.demo.security.CurrentUserUtil;

@Service
public class TeamServiceImpl implements TeamService {

    private final TeamRepository teamRepository;
    private final TeamRequiredSkillRepository teamRequiredSkillRepository;
    private final TeamMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final CurrentUserUtil currentUserUtil;

    public TeamServiceImpl(TeamRepository teamRepository,
                        TeamRequiredSkillRepository teamRequiredSkillRepository,
                        TeamMemberRepository memberRepository,
                        UserRepository userRepository,
                    CurrentUserUtil currentUserUtil) {

        this.teamRepository = teamRepository;
        this.teamRequiredSkillRepository = teamRequiredSkillRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
        this.currentUserUtil = currentUserUtil;

    }

    @Override
    public Team createTeam(String teamName, String description, long teamLeaderId, int maxMembers) {

        User currentUser = currentUserUtil.getCurrentUser();

        Team team = new Team();
        team.setTeamName(teamName);
        team.setDescription(description);
        team.setTeamLeaderId(currentUser.getId());
        team.setMaxMembers(maxMembers);

        return teamRepository.save(team);
    }

    @Override
    public Team getTeamById(Long id) {
        return teamRepository.findById(id).orElse(null);
    }

    @Override
    public List<Team> getAllTeams() {
        return teamRepository.findAll();
    }

    @Override
    public Team updateTeam(String teamName, String description, Long teamLeaderId, int maxMembers) {

        User currentUser = currentUserUtil.getCurrentUser();

        Team team = teamRepository.findById(teamLeaderId).orElse(null);

        if (team == null) {
            throw new RuntimeException("Team not found");
        }

        if (team.getTeamLeaderId() != currentUser.getId()) {
            throw new RuntimeException("Forbidden: Not team leader");
        }

        team.setTeamName(teamName);
        team.setDescription(description);
        team.setMaxMembers(maxMembers);

        return teamRepository.save(team);
    }

    @Override
    public void deleteTeam(Long id) {

        User currentUser = currentUserUtil.getCurrentUser();

        Team team = teamRepository.findById(id).orElse(null);

        if (team == null) {
            throw new RuntimeException("Team not found");
        }

        if (team.getTeamLeaderId() != currentUser.getId()) {
            throw new RuntimeException("Forbidden: Not team leader");
        }

        teamRepository.deleteById(id);
    }

    @Override
    public String addSkillToTeam(Long teamId, String skillName, int requiredCount) {

        User currentUser = currentUserUtil.getCurrentUser();

        Team team = teamRepository.findById(teamId).orElse(null);

        if (team == null) {
            return "Team not found";
        }

        if (team.getTeamLeaderId() != currentUser.getId()) {
            return "Forbidden: Not team leader";
        }

        TeamRequiredSkill skill = new TeamRequiredSkill(
                null,
                teamId,
                skillName,
                requiredCount
        );

        teamRequiredSkillRepository.save(skill);

        return "Skill added successfully";
    }

    @Override
    public List<String> getTeamSkills(Long teamId) {
        return teamRequiredSkillRepository.findByTeamId(teamId)
                .stream()
                .map(TeamRequiredSkill::getSkillName)
                .toList();
    }

    @Override
    public List<Team> getMatchedTeams() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        CustomUserDetails userDetails =
                (CustomUserDetails) authentication.getPrincipal();

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Long> matchedTeamIds =
                teamRequiredSkillRepository.findMatchedTeamIds(user.getId());

        return teamRepository.findAllById(matchedTeamIds);
    }

    @Override
    public String removeSkillFromTeam(Long teamId, Long skillId) {

        User currentUser = currentUserUtil.getCurrentUser();

        TeamRequiredSkill skill =
                teamRequiredSkillRepository.findById(skillId)
                        .orElse(null);

        if (skill == null) {
            return "Skill not found";
        }

        Team team = teamRepository.findById(teamId).orElse(null);

        if (team.getTeamLeaderId() != currentUser.getId()){
            return "Forbidden: Not team leader";
        }

        teamRequiredSkillRepository.delete(skill);

        return "Skill removed successfully";
    }

    @Override
    public int getVacancy(Long teamId) {

        Team team = teamRepository.findById(teamId).orElse(null);

        if (team == null) {
            throw new RuntimeException("Team not found");
        }

        int maxMembers = team.getMaxMembers();

        int currentMembers = memberRepository.countByTeamIdAndStatus(teamId, "ACCEPTED");

        return maxMembers - currentMembers;
    }
}