package com.teambuilder.demo.ServiceImpl;

import org.springframework.stereotype.Service;

import com.teambuilder.demo.Service.TeamMemberService;
import com.teambuilder.demo.model.Team;
import com.teambuilder.demo.model.TeamMember;
import com.teambuilder.demo.model.User;
import com.teambuilder.demo.repository.TeamMemberRepository;
import com.teambuilder.demo.repository.TeamRepository;
import com.teambuilder.demo.security.CurrentUserUtil;

@Service
public class TeamMemberServiceImpl implements TeamMemberService {

    private final TeamMemberRepository memberRepository;
    private final TeamRepository teamRepository;
    private final CurrentUserUtil currentUserUtil;

    public TeamMemberServiceImpl(TeamMemberRepository memberRepository,
                                 TeamRepository teamRepository,
                                 CurrentUserUtil currentUserUtil) {
        this.memberRepository = memberRepository;
        this.teamRepository = teamRepository;
        this.currentUserUtil = currentUserUtil;
    }

    @Override
    public String sendRequest(Long teamId, Long userId) {

        User currentUser = currentUserUtil.getCurrentUser();

        if (!currentUser.getId().equals(userId)) {
            return "Forbidden: You cannot send request for another user";
        }

        Team team = teamRepository.findById(teamId).orElse(null);

        if (team == null) {
            return "Team not found";
        }

        long acceptedMembers =
                memberRepository.countByTeamIdAndStatus(teamId, "ACCEPTED");

        if (acceptedMembers >= team.getMaxMembers()) {
            return "Team is already full";
        }

        TeamMember existingMember =
                memberRepository.findByTeamIdAndUserId(teamId, currentUser.getId());

        if (existingMember != null) {
            return "Request already exists";
        }

        TeamMember teamMember = new TeamMember();
        teamMember.setTeamId(teamId);
        teamMember.setUserId(currentUser.getId());
        teamMember.setStatus("PENDING");

        memberRepository.save(teamMember);

        return "Request sent successfully";
    }

    @Override
    public String acceptRequest(Long teamId, Long userId) {

        User currentUser = currentUserUtil.getCurrentUser();

        Team team = teamRepository.findById(teamId).orElse(null);

        if (team == null) {
            return "Team not found";
        }

        if (team.getTeamLeaderId() != currentUser.getId()) {
            return "Forbidden: Only team leader can accept requests";
        }

        TeamMember teamMember =
                memberRepository.findByTeamIdAndUserId(teamId, userId);

        if (teamMember == null) {
            return "Request not found";
        }

        long acceptedMembers =
                memberRepository.countByTeamIdAndStatus(teamId, "ACCEPTED");

        if (acceptedMembers >= team.getMaxMembers()) {
            return "Cannot accept request. Team is full";
        }

        teamMember.setStatus("ACCEPTED");
        memberRepository.save(teamMember);

        return "Request accepted successfully";
    }

    @Override
    public String rejectRequest(Long teamId, Long userId) {

        User currentUser = currentUserUtil.getCurrentUser();

        Team team = teamRepository.findById(teamId).orElse(null);

        if (team == null) {
            return "Team not found";
        }

        if (team.getTeamLeaderId() != currentUser.getId()) {
            return "Forbidden: Only team leader can reject requests";
        }

        TeamMember teamMember =
                memberRepository.findByTeamIdAndUserId(teamId, userId);

        if (teamMember == null) {
            return "Request not found";
        }

        teamMember.setStatus("REJECTED");
        memberRepository.save(teamMember);

        return "Request rejected successfully";
    }

    @Override
    public String cancelRequest(Long teamId, Long userId) {

        User currentUser = currentUserUtil.getCurrentUser();

        if (!currentUser.getId().equals(userId)) {
            return "Forbidden: You cannot cancel another user's request";
        }

        TeamMember teamMember =
                memberRepository.findByTeamIdAndUserId(teamId, userId);

        if (teamMember == null) {
            return "Request not found";
        }

        memberRepository.delete(teamMember);

        return "Request cancelled successfully";
    }

    @Override
    public String leaveTeam(Long teamId, Long userId) {

        User currentUser = currentUserUtil.getCurrentUser();

        if (!currentUser.getId().equals(userId)) {
            return "Forbidden: You cannot remove another user from team";
        }

        TeamMember teamMember =
                memberRepository.findByTeamIdAndUserId(teamId, userId);

        if (teamMember == null) {
            return "Membership not found";
        }

        memberRepository.delete(teamMember);

        return "Left team successfully";
    }
}