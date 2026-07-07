import React, { createContext, useContext, useState, useEffect } from "react";
import { useWorkspaceStore } from "../store";

interface AuthContextType {
  user: { name: string; email: string; role: string } | null;
  isAuthenticated: boolean;
  login: (email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const db = useWorkspaceStore((state) => state.db);
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);

  useEffect(() => {
    if (db?.settings?.profile) {
      setUser(db.settings.profile);
    }
  }, [db?.settings?.profile]);

  const login = async (email: string) => {
    // Simulated auth
    if (db?.settings?.profile) {
      setUser({ ...db.settings.profile, email });
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
