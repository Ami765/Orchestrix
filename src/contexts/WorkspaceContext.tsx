import React, { createContext, useContext, useState, useEffect } from "react";
import { useWorkspaceStore } from "../store";

interface WorkspaceContextType {
  workspaceName: string;
  defaultWorkflow: string;
  primaryModel: string;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const db = useWorkspaceStore((state) => state.db);
  const [workspaceName, setWorkspaceName] = useState("Meridian Advisory");
  const [defaultWorkflow, setDefaultWorkflow] = useState("Full diligence review");
  const [primaryModel, setPrimaryModel] = useState("Orchestrix Reasoning v3");

  useEffect(() => {
    if (db?.settings?.workspace) {
      setWorkspaceName(db.settings.workspace.name);
      setDefaultWorkflow(db.settings.workspace.defaultWorkflow);
    }
    if (db?.settings?.models) {
      setPrimaryModel(db.settings.models.primaryModel);
    }
  }, [db?.settings]);

  return (
    <WorkspaceContext.Provider value={{ workspaceName, defaultWorkflow, primaryModel }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return context;
};
