import { Agent } from "./agent";
import { Workflow } from "./workflow";
import { Analysis } from "./analysis";
import { Report, KnowledgeSource } from "./report";

export interface Notification {
  id: string;
  text: string;
  time: string;
  type: "success" | "error" | "info" | "warning";
}

export interface Settings {
  profile: {
    name: string;
    email: string;
    role: string;
    emailVerified?: boolean;
  };
  workspace: {
    name: string;
    defaultWorkflow: string;
  };
  models: {
    primaryModel: string;
    temperature: number;
  };
}

export interface DBState {
  analyses: Analysis[];
  agents: Agent[];
  workflows: Workflow[];
  reports: Report[];
  knowledge: KnowledgeSource[];
  notifications: Notification[];
  settings: Settings;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  resource: string;
  ip: string;
  status: "success" | "failure";
}

export interface DbQueryLog {
  id: string;
  timestamp: string;
  query: string;
  latencyMs: number;
  type: "SELECT" | "INSERT" | "UPDATE" | "DELETE" | "TRANSACTION";
  indexUsed: boolean;
  rowsAffected: number;
}

export interface TelemetryStats {
  cpu: number;
  memory: number;
  activeConnections: number;
  queriesPerMin: number;
  averageLatencyMs: number;
  activeWorkers: number;
  uptimeSec: number;
}

export interface OrchestratorLog {
  id: string;
  timestamp: string;
  analysisId: string;
  nodeName: string;
  eventType: "state_transition" | "agent_call" | "rag_retrieval" | "error" | "info";
  message: string;
  stateDelta?: string;
}
