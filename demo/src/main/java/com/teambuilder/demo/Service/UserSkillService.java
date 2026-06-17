package com.teambuilder.demo.Service;

import java.util.List;

import com.teambuilder.demo.model.UserSkill;

public interface UserSkillService {

    UserSkill addSkill(String skillName);

    List<UserSkill> getMySkills();

    UserSkill updateSkill(Long skillId, String skillName);

    void deleteSkill(Long skillId);
}