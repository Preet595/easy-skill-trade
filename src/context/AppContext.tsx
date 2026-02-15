import React, { createContext, useContext, useState, useCallback } from "react";

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

// --- Mock Data ---
const MOCK_SKILLS: Skill[] = [
  { id: "1", name: "JavaScript" },
  { id: "2", name: "Python" },
  { id: "3", name: "Guitar" },
  { id: "4", name: "Photography" },
  { id: "5", name: "Cooking" },
  { id: "6", name: "Spanish" },
  { id: "7", name: "Yoga" },
  { id: "8", name: "Drawing" },
  { id: "9", name: "React" },
  { id: "10", name: "Machine Learning" },
  { id: "11", name: "Video Editing" },
  { id: "12", name: "Public Speaking" },
];

const MOCK_USERS: User[] = [
  { id: "1", name: "Alex Rivera", email: "alex@example.com", avatar: "AR" },
  { id: "2", name: "Priya Sharma", email: "priya@example.com", avatar: "PS" },
  { id: "3", name: "Jordan Lee", email: "jordan@example.com", avatar: "JL" },
  { id: "4", name: "Sam Chen", email: "sam@example.com", avatar: "SC" },
  { id: "5", name: "Maria Garcia", email: "maria@example.com", avatar: "MG" },
];

const MOCK_USER_SKILLS: UserSkill[] = [
  // Alex offers JS, React; wants Guitar, Spanish
  { userId: "1", skillId: "1", type: "offer" },
  { userId: "1", skillId: "9", type: "offer" },
  { userId: "1", skillId: "3", type: "learn" },
  { userId: "1", skillId: "6", type: "learn" },
  // Priya offers Python, ML; wants Photography, Cooking
  { userId: "2", skillId: "2", type: "offer" },
  { userId: "2", skillId: "10", type: "offer" },
  { userId: "2", skillId: "4", type: "learn" },
  { userId: "2", skillId: "5", type: "learn" },
  // Jordan offers Guitar, Drawing; wants JavaScript, React
  { userId: "3", skillId: "3", type: "offer" },
  { userId: "3", skillId: "8", type: "offer" },
  { userId: "3", skillId: "1", type: "learn" },
  { userId: "3", skillId: "9", type: "learn" },
  // Sam offers Photography, Video Editing; wants Python
  { userId: "4", skillId: "4", type: "offer" },
  { userId: "4", skillId: "11", type: "offer" },
  { userId: "4", skillId: "2", type: "learn" },
  // Maria offers Cooking, Spanish, Yoga; wants Drawing
  { userId: "5", skillId: "5", type: "offer" },
  { userId: "5", skillId: "6", type: "offer" },
  { userId: "5", skillId: "7", type: "offer" },
  { userId: "5", skillId: "8", type: "learn" },
];

// --- Context ---
interface AppContextType {
  currentUser: User | null;
  users: User[];
  skills: Skill[];
  userSkills: UserSkill[];
  swapRequests: SwapRequest[];
  login: (email: string, password: string) => boolean;
  register: (name: string, email: string, password: string) => boolean;
  logout: () => void;
  addUserSkill: (skillId: string, type: "offer" | "learn") => void;
  removeUserSkill: (skillId: string, type: "offer" | "learn") => void;
  getMatches: () => Match[];
  sendSwapRequest: (receiverId: string, skillId: string) => void;
  updateSwapRequest: (requestId: string, status: "accepted" | "rejected") => void;
  getUserSkills: (userId: string) => { offers: Skill[]; learns: Skill[] };
  getSkillById: (id: string) => Skill | undefined;
  getUserById: (id: string) => User | undefined;
}

const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [skills] = useState<Skill[]>(MOCK_SKILLS);
  const [userSkills, setUserSkills] = useState<UserSkill[]>(MOCK_USER_SKILLS);
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([
    { id: "sr1", senderId: "3", receiverId: "1", skillId: "1", status: "pending", createdAt: "2026-02-14" },
  ]);

  // Login with any mock user by email (password ignored for demo)
  const login = useCallback((email: string, _password: string) => {
    const user = users.find((u) => u.email === email);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  }, [users]);

  // Register a new user
  const register = useCallback((name: string, email: string, _password: string) => {
    if (users.find((u) => u.email === email)) return false;
    const newUser: User = {
      id: String(Date.now()),
      name,
      email,
      avatar: name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2),
    };
    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    return true;
  }, [users]);

  const logout = useCallback(() => setCurrentUser(null), []);

  const addUserSkill = useCallback((skillId: string, type: "offer" | "learn") => {
    if (!currentUser) return;
    setUserSkills((prev) => {
      if (prev.find((us) => us.userId === currentUser.id && us.skillId === skillId && us.type === type)) return prev;
      return [...prev, { userId: currentUser.id, skillId, type }];
    });
  }, [currentUser]);

  const removeUserSkill = useCallback((skillId: string, type: "offer" | "learn") => {
    if (!currentUser) return;
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

  const sendSwapRequest = useCallback((receiverId: string, skillId: string) => {
    if (!currentUser) return;
    const exists = swapRequests.find(
      (r) => r.senderId === currentUser.id && r.receiverId === receiverId && r.skillId === skillId && r.status === "pending"
    );
    if (exists) return;
    setSwapRequests((prev) => [
      ...prev,
      { id: `sr${Date.now()}`, senderId: currentUser.id, receiverId, skillId, status: "pending", createdAt: new Date().toISOString().slice(0, 10) },
    ]);
  }, [currentUser, swapRequests]);

  const updateSwapRequest = useCallback((requestId: string, status: "accepted" | "rejected") => {
    setSwapRequests((prev) => prev.map((r) => (r.id === requestId ? { ...r, status } : r)));
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentUser, users, skills, userSkills, swapRequests,
        login, register, logout, addUserSkill, removeUserSkill,
        getMatches, sendSwapRequest, updateSwapRequest, getUserSkills,
        getSkillById, getUserById,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
