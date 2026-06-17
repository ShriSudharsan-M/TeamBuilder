package com.teambuilder.demo.Service;

public interface TeamMemberService {

    public String sendRequest(Long teamId, Long userId);

    String acceptRequest(Long teamId, Long userId);

    String rejectRequest(Long teamId, Long userId);

    String cancelRequest(Long teamId, Long userId);

    String leaveTeam(Long teamId, Long userId);
}