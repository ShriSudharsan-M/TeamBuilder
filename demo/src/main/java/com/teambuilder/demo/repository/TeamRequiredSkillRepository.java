package com.teambuilder.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.teambuilder.demo.model.TeamRequiredSkill;

@Repository
public interface TeamRequiredSkillRepository extends JpaRepository<TeamRequiredSkill, Long> {

    List<TeamRequiredSkill> findByTeamId(Long teamId);

    @Query("""
            SELECT DISTINCT trs.teamId
            FROM TeamRequiredSkill trs
            WHERE trs.skillName IN (
                SELECT us.skillName
                FROM UserSkill us
                WHERE us.userId = :userId
            )
            """)
    List<Long> findMatchedTeamIds(Long userId);
}