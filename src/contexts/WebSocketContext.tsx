import React, { createContext, useContext, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWorkspaceStore } from "../store";

interface WebSocketContextType {
  isConnected: boolean;
  activeSessionsCount: number;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const setupSSE = useWorkspaceStore((state) => state.setupSSE);
  const telemetry = useWorkspaceStore((state) => state.telemetry);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    console.log("[WebSocketProvider] Connecting SSE update socket stream...");
    const closeSSE = setupSSE();
    setIsConnected(true);

    // Invalidate react-query cache on SSE triggers
    const onUpdate = () => {
      console.log("[WebSocketProvider] Inbound real-time event. Invalidating query cache.");
      queryClient.invalidateQueries({ queryKey: ["workspaceDb"] });
    };

    // Add listner for custom invalidations if needed
    window.addEventListener("pipeline_update", onUpdate);

    return () => {
      console.log("[WebSocketProvider] Disconnecting SSE stream");
      closeSSE();
      setIsConnected(false);
      window.removeEventListener("pipeline_update", onUpdate);
    };
  }, [setupSSE, queryClient]);

  const activeSessionsCount = telemetry?.activeConnections || 1;

  return (
    <WebSocketContext.Provider value={{ isConnected, activeSessionsCount }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) throw new Error("useWebSocket must be used within WebSocketProvider");
  return context;
};
