package com.teambuilder.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.teambuilder.demo.Service.TeamMemberService;
import com.teambuilder.demo.security.CurrentUserUtil;

@RestController
@RequestMapping("/team-members")
public class TeamMemberController {

    private final TeamMemberService memberService;
    private final CurrentUserUtil currentUserUtil;

    public TeamMemberController(TeamMemberService memberService,
                                CurrentUserUtil currentUserUtil) {
        this.memberService = memberService;
        this.currentUserUtil = currentUserUtil;
    }

    // SEND REQUEST (JWT user)
    @PostMapping("/{teamId}/request")
    public ResponseEntity<String> sendRequest(@PathVariable Long teamId) {

        return ResponseEntity.ok(
                memberService.sendRequest(teamId, getCurrentUserId())
        );
    }

    // ACCEPT REQUEST (Leader only)
    @PutMapping("/{teamId}/accept/{userId}")
    public ResponseEntity<String> acceptRequest(
            @PathVariable Long teamId,
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                memberService.acceptRequest(teamId, userId)
        );
    }

    // REJECT REQUEST (Leader only)
    @PutMapping("/{teamId}/reject/{userId}")
    public ResponseEntity<String> rejectRequest(
            @PathVariable Long teamId,
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                memberService.rejectRequest(teamId, userId)
        );
    }

    // CANCEL REQUEST (JWT user only)
    @DeleteMapping("/{teamId}/cancel")
    public ResponseEntity<String> cancelRequest(@PathVariable Long teamId) {

        return ResponseEntity.ok(
                memberService.cancelRequest(teamId, getCurrentUserId())
        );
    }

    // LEAVE TEAM (JWT user only)
    @DeleteMapping("/{teamId}/leave")
    public ResponseEntity<String> leaveTeam(@PathVariable Long teamId) {

        return ResponseEntity.ok(
                memberService.leaveTeam(teamId, getCurrentUserId())
        );
    }

    private Long getCurrentUserId() {
        return currentUserUtil.getCurrentUser().getId();
    }
}
