import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

// --- Types ---
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface Skill {
  id: string;
  name: string;
}

export interface UserSkill {
  userId: string;
  skillId: string;
  type: "offer" | "learn";
}

export interface SwapRequest {
  id: string;
  senderId: string;
  receiverId: string;
  skillId: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

export interface Match {
  user: User;
  theyOffer: Skill[];
  theyWant: Skill[];
  matchingSkills: Skill[];
}

interface BootstrapPayload {
  users: User[];
  skills: Skill[];
  userSkills: UserSkill[];
  swapRequests: SwapRequest[];
}

// --- Context ---
interface AppContextType {
  currentUser: User | null;
  users: User[];
  skills: Skill[];
  userSkills: UserSkill[];
  swapRequests: SwapRequest[];
  isBootstrapping: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  createSkill: (name: string) => Promise<Skill | null>;
  addUserSkill: (skillId: string, type: "offer" | "learn") => Promise<void>;
  removeUserSkill: (skillId: string, type: "offer" | "learn") => Promise<void>;
  getMatches: () => Match[];
  sendSwapRequest: (receiverId: string, skillId: string) => Promise<void>;
  updateSwapRequest: (requestId: string, status: "accepted" | "rejected") => Promise<void>;
  getUserSkills: (userId: string) => { offers: Skill[]; learns: Skill[] };
  getSkillById: (id: string) => Skill | undefined;
  getUserById: (id: string) => User | undefined;
}

const apiRequest = async <T,>(path: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetch(`/api${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null);
    throw new Error(errorPayload?.message || `Request failed (${response.status})`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
};

const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);
  const [isBootstrapping, setIsBootstrapping] = useState<boolean>(true);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const data = await apiRequest<BootstrapPayload>("/bootstrap");
        setUsers(data.users);
        setSkills(data.skills);
        setUserSkills(data.userSkills);
        setSwapRequests(data.swapRequests);

        const savedUserId = localStorage.getItem("currentUserId");
        if (savedUserId) {
          const savedUser = data.users.find((user) => user.id === savedUserId) || null;
          setCurrentUser(savedUser);
        }
      } catch (error) {
        console.error("Failed to load initial data", error);
      } finally {
        setIsBootstrapping(false);
      }
    };

    hydrate();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const payload = await apiRequest<{ user: User }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      setCurrentUser(payload.user);
      localStorage.setItem("currentUserId", payload.user.id);
      return true;
    } catch {
      return false;
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      const payload = await apiRequest<{ user: User }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });

      setUsers((prev) => [...prev, payload.user]);
      setCurrentUser(payload.user);
      localStorage.setItem("currentUserId", payload.user.id);
      return true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("currentUserId");
    setCurrentUser(null);
  }, []);

  const createSkill = useCallback(async (name: string): Promise<Skill | null> => {
    const trimmed = name.trim();
    if (!trimmed) return null;

    try {
      const payload = await apiRequest<{ skill: Skill }>("/skills", {
        method: "POST",
        body: JSON.stringify({ name: trimmed }),
      });

      setSkills((prev) => {
        if (prev.some((s) => s.id === payload.skill.id)) return prev;
        return [...prev, payload.skill];
      });

      return payload.skill;
    } catch (error) {
      console.error("Failed to create skill", error);
      return null;
    }
  }, []);

  const addUserSkill = useCallback(async (skillId: string, type: "offer" | "learn") => {
    if (!currentUser) return;

    await apiRequest<void>("/user-skills", {
      method: "POST",
      body: JSON.stringify({ userId: currentUser.id, skillId, type }),
    });

    setUserSkills((prev) => {
      if (prev.find((us) => us.userId === currentUser.id && us.skillId === skillId && us.type === type)) return prev;
      return [...prev, { userId: currentUser.id, skillId, type }];
    });
  }, [currentUser]);

  const removeUserSkill = useCallback(async (skillId: string, type: "offer" | "learn") => {
    if (!currentUser) return;

    await apiRequest<void>(`/user-skills?userId=${currentUser.id}&skillId=${skillId}&type=${type}`, {
      method: "DELETE",
    });

    setUserSkills((prev) => prev.filter((us) => !(us.userId === currentUser.id && us.skillId === skillId && us.type === type)));
  }, [currentUser]);

  const getUserSkills = useCallback((userId: string) => {
    const userS = userSkills.filter((us) => us.userId === userId);
    return {
      offers: userS.filter((us) => us.type === "offer").map((us) => skills.find((s) => s.id === us.skillId)!).filter(Boolean),
      learns: userS.filter((us) => us.type === "learn").map((us) => skills.find((s) => s.id === us.skillId)!).filter(Boolean),
    };
  }, [userSkills, skills]);

  const getSkillById = useCallback((id: string) => skills.find((s) => s.id === id), [skills]);
  const getUserById = useCallback((id: string) => users.find((u) => u.id === id), [users]);

  // Rule-based matching: find users where their offers match my learns
  const getMatches = useCallback((): Match[] => {
    if (!currentUser) return [];
    const myLearns = userSkills.filter((us) => us.userId === currentUser.id && us.type === "learn").map((us) => us.skillId);
    const myOffers = userSkills.filter((us) => us.userId === currentUser.id && us.type === "offer").map((us) => us.skillId);

    return users
      .filter((u) => u.id !== currentUser.id)
      .map((user) => {
        const theirOffers = userSkills.filter((us) => us.userId === user.id && us.type === "offer").map((us) => us.skillId);
        const theirLearns = userSkills.filter((us) => us.userId === user.id && us.type === "learn").map((us) => us.skillId);
        // They offer something I want to learn
        const matchingSkillIds = theirOffers.filter((sid) => myLearns.includes(sid));
        // Bonus: they want something I offer (mutual match)
        const mutualMatch = theirLearns.some((sid) => myOffers.includes(sid));

        if (matchingSkillIds.length === 0) return null;

        return {
          user,
          theyOffer: theirOffers.map((id) => skills.find((s) => s.id === id)!).filter(Boolean),
          theyWant: theirLearns.map((id) => skills.find((s) => s.id === id)!).filter(Boolean),
          matchingSkills: matchingSkillIds.map((id) => skills.find((s) => s.id === id)!).filter(Boolean),
          isMutual: mutualMatch,
        };
      })
      .filter(Boolean) as Match[];
  }, [currentUser, userSkills, users, skills]);

  const sendSwapRequest = useCallback(async (receiverId: string, skillId: string) => {
    if (!currentUser) return;

    const payload = await apiRequest<{ swapRequest: SwapRequest }>("/swap-requests", {
      method: "POST",
      body: JSON.stringify({ senderId: currentUser.id, receiverId, skillId }),
    });

    setSwapRequests((prev) => {
      if (prev.some((item) => item.id === payload.swapRequest.id)) {
        return prev;
      }

      return [...prev, payload.swapRequest];
    });
  }, [currentUser]);

  const updateSwapRequest = useCallback(async (requestId: string, status: "accepted" | "rejected") => {
    const payload = await apiRequest<{ swapRequest: SwapRequest }>(`/swap-requests/${requestId}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });

    setSwapRequests((prev) => prev.map((request) => (request.id === payload.swapRequest.id ? payload.swapRequest : request)));
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentUser, users, skills, userSkills, swapRequests, isBootstrapping,
        login, register, logout, createSkill, addUserSkill, removeUserSkill,
        getMatches, sendSwapRequest, updateSwapRequest, getUserSkills,
        getSkillById, getUserById,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
