import { useWorkspaceStore } from "../store";

export function useAgents() {
  const db = useWorkspaceStore((state) => state.db);
  const agents = db?.agents || [];

  const idleAgents = agents.filter((a) => a.status === "idle");
  const busyAgents = agents.filter((a) => a.status === "busy");

  return {
    agents,
    idleAgents,
    busyAgents,
    agentCount: agents.length,
    onlineCount: idleAgents.length + busyAgents.length,
  };
}
