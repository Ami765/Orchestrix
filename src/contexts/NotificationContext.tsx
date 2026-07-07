import React, { createContext, useContext, useState, useEffect } from "react";
import { useWorkspaceStore } from "../store";

interface NotificationContextType {
  notifications: Array<{ id: string; text: string; time: string; type: string }>;
  unreadCount: number;
  clearAll: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const db = useWorkspaceStore((state) => state.db);
  const clearNotifications = useWorkspaceStore((state) => state.clearNotifications);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (db?.notifications) {
      setNotifications(db.notifications);
    }
  }, [db?.notifications]);

  const clearAll = async () => {
    try {
      await clearNotifications();
    } catch (e) {
      console.error("Failed to clear notifications:", e);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount: notifications.length,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used within NotificationProvider");
  return context;
};
