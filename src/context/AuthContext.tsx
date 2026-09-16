import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { User } from "@/types";
import { mockApi } from "@/services/mockApi";
import { logoutApi } from "@/api/auth.api";
import { toast } from "react-toastify";

interface AuthContextValue {
  user: User | null;
  isVerified: boolean;
  status: "idle" | "loading" | "authenticated" | "unauthenticated";
  login: (email: string, password: string) => Promise<void>;
  signup: (
    displayName: string,
    email: string,
    password: string
  ) => Promise<void>;
  verifyEmail: (code: string) => Promise<void>;
  resendCode: () => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "bsraha_auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "loading" | "authenticated" | "unauthenticated"
  >("idle");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setUser(parsed.user);
        setIsVerified(parsed.isVerified);
        setStatus("authenticated");
        return;
      }
    } catch {
      // ignore
    }
    setStatus("unauthenticated");
  }, []);

  const persist = useCallback((u: User | null, verified: boolean) => {
    if (u) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ user: u, isVerified: verified })
      );
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      setStatus("loading");
      const { user: u, verified } = await mockApi.login(email, password);
      setUser(u);
      setIsVerified(verified);
      setStatus("authenticated");
      persist(u, verified);
    },
    [persist]
  );

  const signup = useCallback(
    async (displayName: string, email: string, password: string) => {
      setStatus("loading");
      const { user: u, verified } = await mockApi.signup(
        displayName,
        email,
        password
      );
      setUser(u);
      setIsVerified(verified);
      setStatus("authenticated");
      persist(u, verified);
    },
    [persist]
  );

  const verifyEmail = useCallback(
    async (code: string) => {
      await mockApi.verifyEmail(code);
      setIsVerified(true);
      persist(user, true);
    },
    [user, persist]
  );

  const resendCode = useCallback(async () => {
    await mockApi.resendCode();
  }, []);

  const logout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      // Even if backend fails (e.g. token already expired), clear local session anyway
      console.error("Logout API error:", error);
    } finally {
      // Clear local storage tokens & user state
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
      toast.success("Logged out successfully");
    }
  };

  const updateUser = useCallback(
    (updates: Partial<User>) => {
      setUser((prev) => {
        if (!prev) return prev;
        const next = { ...prev, ...updates };
        persist(next, isVerified);
        return next;
      });
    },
    [isVerified, persist]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isVerified,
        status,
        login,
        signup,
        verifyEmail,
        resendCode,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
