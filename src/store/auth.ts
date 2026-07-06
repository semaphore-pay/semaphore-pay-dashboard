import { create } from "zustand";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: string;
  phoneNumber?: string | null;
  username?: string | null;
  businessType: string;
  profileSetupComplete: boolean;
  createdAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

interface AuthState {
  user: SessionUser | null;
  session: Session | null;
  isPending: boolean;

  setAuth: (user: SessionUser, session: Session) => void;
  clearAuth: () => void;
  setPending: (pending: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isPending: true,

  setAuth: (user, session) => set({ user, session, isPending: false }),
  clearAuth: () => set({ user: null, session: null, isPending: false }),
  setPending: (pending) => set({ isPending: pending }),
}));
