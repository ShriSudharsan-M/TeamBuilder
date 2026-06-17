package com.teambuilder.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.teambuilder.demo.model.TeamMember;


@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {

    @Query("SELECT t FROM TeamMember t WHERE t.teamId = :teamId AND t.userId = :userId")
    TeamMember findByTeamIdAndUserId(Long teamId, Long userId);
    
    int countByTeamIdAndStatus(Long teamId, String status);
}
