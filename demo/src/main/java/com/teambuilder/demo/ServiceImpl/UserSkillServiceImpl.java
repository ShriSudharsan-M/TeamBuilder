package com.teambuilder.demo.ServiceImpl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.teambuilder.demo.Service.UserSkillService;
import com.teambuilder.demo.model.User;
import com.teambuilder.demo.model.UserSkill;
import com.teambuilder.demo.repository.UserSkillRepository;
import com.teambuilder.demo.security.CurrentUserUtil;

@Service
public class UserSkillServiceImpl implements UserSkillService {

    private final UserSkillRepository userSkillRepository;
    private final CurrentUserUtil currentUserUtil;

    public UserSkillServiceImpl(UserSkillRepository userSkillRepository,
                                CurrentUserUtil currentUserUtil) {
        this.userSkillRepository = userSkillRepository;
        this.currentUserUtil = currentUserUtil;
    }

    @Override
    public UserSkill addSkill(String skillName) {

        User currentUser = currentUserUtil.getCurrentUser();

        UserSkill skill = new UserSkill();
        skill.setUserId(currentUser.getId());
        skill.setSkillName(skillName);

        return userSkillRepository.save(skill);
    }

    @Override
    
    public List<UserSkill> getMySkills() {

        User currentUser = currentUserUtil.getCurrentUser();

        return userSkillRepository.findByUserId(currentUser.getId());
    }

    @Override
    public UserSkill updateSkill(Long skillId, String skillName) {

        User currentUser = currentUserUtil.getCurrentUser();

        UserSkill skill = userSkillRepository.findById(skillId)
                .orElseThrow(() -> new RuntimeException("Skill not found"));

        if (!skill.getUserId().equals(currentUser.getId())) {
            throw new RuntimeException("Forbidden: Not your skill");
        }

        skill.setSkillName(skillName);

        return userSkillRepository.save(skill);
    }

    @Override
    public void deleteSkill(Long skillId) {

        User currentUser = currentUserUtil.getCurrentUser();

        UserSkill skill = userSkillRepository.findById(skillId)
                .orElseThrow(() -> new RuntimeException("Skill not found"));

        if (!skill.getUserId().equals(currentUser.getId())) {
            throw new RuntimeException("Forbidden: Not your skill");
        }

        userSkillRepository.delete(skill);
    }
}