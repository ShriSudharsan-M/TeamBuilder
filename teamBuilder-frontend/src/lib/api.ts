import axios, { AxiosError } from "axios";
import { getToken, useAuthStore } from "./auth-store";

const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ?? "";

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export const http = axios.create({
  baseURL: BASE_URL,
  headers: { Accept: "application/json" },
});

http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; error?: string } | string>) => {
    const status = error.response?.status ?? 0;
    const data = error.response?.data;
    const message =
      typeof data === "string"
        ? data
        : data?.message || data?.error || error.message || "Request failed";

    if (status === 401) {
      useAuthStore.getState().logout();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth")) {
        window.location.href = "/auth/login";
      }
    }

    throw new ApiError(status, message, data);
  },
);

// ---------------- Backend DTOs ----------------
interface BackendUser {
  id: number;
  username: string;
  email: string;
}

interface BackendSkill {
  id: number;
  userId: number;
  skillName: string;
}

interface BackendTeam {
  id: number;
  teamName: string;
  description: string;
  maxMembers: number;
  teamLeaderId: number;
}

interface BackendMatchedTeam {
  id: number;
  name: string;
  teamLeaderId: number;
}

// ---------------- Frontend types ----------------
export interface Skill {
  id: string | number;
  name: string;
  userId?: string | number;
  requiredCount?: number;
  removable?: boolean;
}

export interface UserProfile {
  id: string | number;
  name: string;
  username: string;
  email: string;
  skills?: Skill[];
}

export interface TeamMember {
  userId: string | number;
  name?: string;
  status?: "pending" | "accepted" | "rejected";
}

export interface Team {
  id: string | number;
  name: string;
  mission?: string;
  description?: string;
  leaderId: string | number;
  leaderName?: string;
  maxMembers?: number;
  vacancies?: number;
  requiredSkills?: Skill[];
  members?: TeamMember[];
}

const normalizeUser = (user: BackendUser): UserProfile => ({
  id: user.id,
  name: user.username,
  username: user.username,
  email: user.email,
});

const normalizeSkill = (skill: BackendSkill): Skill => ({
  id: skill.id,
  userId: skill.userId,
  name: skill.skillName,
});

const normalizeTeam = (
  team: BackendTeam | BackendMatchedTeam,
  extras: Partial<Team> = {},
): Team => {
  const isFullTeam = "teamName" in team;
  return {
    id: team.id,
    name: isFullTeam ? team.teamName : team.name,
    mission: isFullTeam ? team.description : undefined,
    description: isFullTeam ? team.description : undefined,
    leaderId: team.teamLeaderId,
    maxMembers: isFullTeam ? team.maxMembers : undefined,
    ...extras,
  };
};

const joinUrl = (path: string) => `${BASE_URL}${path}`;

function toApiError(error: unknown, fallback: string) {
  if (error instanceof ApiError) return error;
  if (axios.isAxiosError<{ message?: string; error?: string } | string>(error)) {
    const data = error.response?.data;
    const message =
      typeof data === "string"
        ? data
        : data?.message || data?.error || error.message || fallback;
    return new ApiError(error.response?.status ?? 0, message, data);
  }
  return new ApiError(0, fallback, error);
}

async function fetchCurrentUserByEmail(email: string, token: string) {
  const { data } = await axios.get<BackendUser[]>(joinUrl("/users/"), {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
  });
  const user = data.find((candidate) => candidate.email === email);
  if (!user) throw new ApiError(404, "Logged-in user was not found");
  return normalizeUser(user);
}

async function withTeamDetails(team: BackendTeam | BackendMatchedTeam): Promise<Team> {
  const normalized = normalizeTeam(team);
  const [skillsResult, vacancyResult] = await Promise.allSettled([
    api.teams.skills(normalized.id),
    api.teams.vacancy(normalized.id),
  ]);

  return {
    ...normalized,
    requiredSkills:
      skillsResult.status === "fulfilled" ? skillsResult.value : normalized.requiredSkills,
    vacancies: vacancyResult.status === "fulfilled" ? vacancyResult.value : normalized.vacancies,
  };
}

// ---------------- Endpoints ----------------
export const api = {
  auth: {
    login: async (body: { email: string; password: string }) => {
      try {
        const { data } = await axios.post<{ token: string }>(joinUrl("/auth/login"), body, {
          headers: { Accept: "application/json", "Content-Type": "application/json" },
        });
        const user = await fetchCurrentUserByEmail(body.email, data.token);
        return { token: data.token, user };
      } catch (error) {
        throw toApiError(error, "Login failed");
      }
    },
    register: async (body: { name: string; email: string; password: string }) => {
      try {
        await axios.post<BackendUser>(
          joinUrl("/users/register"),
          { username: body.name, email: body.email, password: body.password },
          { headers: { Accept: "application/json", "Content-Type": "application/json" } },
        );
        return api.auth.login({ email: body.email, password: body.password });
      } catch (error) {
        throw toApiError(error, "Registration failed");
      }
    },
  },
  users: {
    list: async () => {
      const { data } = await http.get<BackendUser[]>("/users/");
      return data.map(normalizeUser);
    },
    me: async (id: string | number) => {
      const { data } = await http.get<BackendUser>(`/users/${id}`);
      return normalizeUser(data);
    },
    update: async (id: string | number, body: Partial<UserProfile>) => {
      const { data } = await http.put<BackendUser>(`/users/${id}`, {
        username: body.name ?? body.username,
        email: body.email,
      });
      return normalizeUser(data);
    },
    remove: async (id: string | number) => {
      await http.delete(`/users/${id}`);
    },
  },
  skills: {
    list: async () => {
      const { data } = await http.get<BackendSkill[]>("/skills");
      return data.map(normalizeSkill);
    },
    add: async (name: string) => {
      const { data } = await http.post<BackendSkill>("/skills", null, {
        params: { skillName: name },
      });
      return normalizeSkill(data);
    },
    update: async (id: string | number, name: string) => {
      const { data } = await http.put<BackendSkill>(`/skills/${id}`, null, {
        params: { skillName: name },
      });
      return normalizeSkill(data);
    },
    remove: async (id: string | number) => {
      await http.delete(`/skills/${id}`);
    },
  },
  teams: {
    list: async () => {
      const { data } = await http.get<BackendTeam[]>("/teams");
      return Promise.all(data.map(withTeamDetails));
    },
    matched: async () => {
      const { data } = await http.get<BackendMatchedTeam[]>("/teams/matched");
      return Promise.all(data.map(withTeamDetails));
    },
    get: async (id: string | number) => {
      const { data } = await http.get<BackendTeam>(`/teams/${id}`);
      return withTeamDetails(data);
    },
    create: async (body: {
      name: string;
      mission?: string;
      vacancies?: number;
      requiredSkills?: string[];
    }) => {
      const { data } = await http.post<BackendTeam>("/teams/create", null, {
        params: {
          teamName: body.name,
          description: body.mission ?? "",
          maxMembers: body.vacancies ?? 1,
        },
      });

      const team = normalizeTeam(data);
      await Promise.all(
        (body.requiredSkills ?? []).map((skillName) =>
          api.teams.addSkill(team.id, skillName, 1),
        ),
      );

      return api.teams.get(team.id);
    },
    update: async (id: string | number, body: Partial<Team>) => {
      const { data } = await http.put<BackendTeam>(`/teams/${id}`, null, {
        params: {
          teamName: body.name,
          description: body.mission ?? body.description ?? "",
          maxMembers: body.maxMembers ?? body.vacancies ?? 1,
        },
      });
      return withTeamDetails(data);
    },
    remove: async (id: string | number) => {
      const { data } = await http.delete<string>(`/teams/${id}`);
      return data;
    },
    skills: async (teamId: string | number) => {
      const { data } = await http.get<string[]>(`/teams/${teamId}/skills`);
      return data.map((name) => ({ id: name, name, removable: false }));
    },
    addSkill: async (teamId: string | number, skillName: string, requiredCount = 1) => {
      const { data } = await http.post<string>(`/teams/${teamId}/skills`, null, {
        params: { skillName, requiredCount },
      });
      return data;
    },
    removeSkill: async (teamId: string | number, skillId: string | number) => {
      const { data } = await http.delete<string>(`/teams/${teamId}/skills/${skillId}`);
      return data;
    },
    vacancy: async (teamId: string | number) => {
      const { data } = await http.get<number>(`/teams/${teamId}/vacancy`);
      return data;
    },
  },
  members: {
    request: async (teamId: string | number) => {
      const { data } = await http.post<string>(`/team-members/${teamId}/request`);
      return data;
    },
    accept: async (teamId: string | number, userId: string | number) => {
      const { data } = await http.put<string>(`/team-members/${teamId}/accept/${userId}`);
      return data;
    },
    reject: async (teamId: string | number, userId: string | number) => {
      const { data } = await http.put<string>(`/team-members/${teamId}/reject/${userId}`);
      return data;
    },
    cancel: async (teamId: string | number) => {
      const { data } = await http.delete<string>(`/team-members/${teamId}/cancel`);
      return data;
    },
    leave: async (teamId: string | number) => {
      const { data } = await http.delete<string>(`/team-members/${teamId}/leave`);
      return data;
    },
  },
};
