import { Analysis, Agent, Workflow, Report, KnowledgeSource, AuditLog, DbQueryLog, TelemetryStats, OrchestratorLog } from "../../src/types";

export interface DatabaseSchema {
  analyses: Analysis[];
  agents: Agent[];
  workflows: Workflow[];
  reports: Report[];
  knowledge: KnowledgeSource[];
  notifications: Array<{ id: string; text: string; time: string; type: string }>;
  settings: {
    profile: {
      name: string;
      email: string;
      role: string;
      emailVerified?: boolean;
      verificationCode?: string;
      verificationExpiresAt?: string;
    };
    workspace: {
      name: string;
      defaultWorkflow: string;
    };
    models: {
      primaryModel: string;
      temperature: number;
    };
    emailSetup?: {
      provider: "smtp" | "resend" | "simulator";
      smtpHost?: string;
      smtpPort?: number;
      smtpUser?: string;
      smtpPass?: string;
      fromEmail?: string;
      subjectTemplate?: string;
      bodyTemplate?: string;
    };
  };
}

export interface SwarmState {
  analysisId: string;
  workflowId: string;
  sourceText: string;
  accumulatedResults: string;
  activeNode: string;
  riskCount: number;
}
