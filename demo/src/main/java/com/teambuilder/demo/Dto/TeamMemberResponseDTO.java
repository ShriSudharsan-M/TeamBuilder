package com.teambuilder.demo.Dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TeamMemberResponseDTO {
    public Long id;
    public long teamId;
    public long userId;
    public String joinDate;
}
