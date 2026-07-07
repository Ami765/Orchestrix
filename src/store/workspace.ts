import { create } from "zustand";
import { DBState, DbQueryLog, AuditLog, OrchestratorLog, TelemetryStats } from "../types";
import { client } from "../api";
import { AnalysisService, WorkflowService, AgentService } from "../services";

interface WorkspaceState {
  db: DBState | null;
  queryLogs: DbQueryLog[];
  auditLogs: AuditLog[];
  orchestratorLogs: OrchestratorLog[];
  telemetry: TelemetryStats | null;
  isLoading: boolean;
  error: string | null;

  // Sync actions
  fetchDb: () => Promise<void>;
  fetchTraces: () => Promise<void>;
  setupSSE: () => () => void;

  // Mutator operations
  runAnalysis: (title: string, text: string, workflowId: string) => Promise<void>;
  createWorkflow: (workflow: { name: string; description?: string; agents: string[]; stages: string[] }) => Promise<void>;
  addKnowledge: (name: string, content: string) => Promise<void>;
  saveSettings: (profile: any, workspace: any, models?: any) => Promise<void>;
  clearNotifications: () => Promise<void>;
  resetDemoState: () => Promise<void>;
  resetDbEngine: () => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => {
  let eventSource: EventSource | null = null;

  return {
    db: null,
    queryLogs: [],
    auditLogs: [],
    orchestratorLogs: [],
    telemetry: null,
    isLoading: false,
    error: null,

    fetchDb: async () => {
      set({ isLoading: true });
      try {
        const db = await client.getDb();
        set({ db, isLoading: false, error: null });
      } catch (err: any) {
        set({ error: err.message, isLoading: false });
      }
    },

    fetchTraces: async () => {
      try {
        const [qLogs, aLogs, oLogs, tStats] = await Promise.all([
          client.getQueryLogs(),
          client.getAuditLogs(),
          client.getOrchestratorLogs(),
          client.getTelemetry(),
        ]);
        set({
          queryLogs: qLogs,
          auditLogs: aLogs,
          orchestratorLogs: oLogs,
          telemetry: tStats,
        });
      } catch (e) {
        console.error("Failed to retrieve system profiles:", e);
      }
    },

    setupSSE: () => {
      if (eventSource) {
        eventSource.close();
      }

      const es = new EventSource("/api/updates");
      eventSource = es;

      es.addEventListener("telemetry", (e) => {
        try {
          set({ telemetry: JSON.parse(e.data) });
        } catch (err) {
          console.error("SSE parse error (telemetry):", err);
        }
      });

      es.addEventListener("db_query", (e) => {
        try {
          const log = JSON.parse(e.data);
          set((state) => ({
            queryLogs: [log, ...state.queryLogs].slice(0, 100),
          }));
        } catch (err) {
          console.error("SSE parse error (db_query):", err);
        }
      });

      es.addEventListener("audit_log", (e) => {
        try {
          const log = JSON.parse(e.data);
          set((state) => ({
            auditLogs: [log, ...state.auditLogs].slice(0, 100),
          }));
        } catch (err) {
          console.error("SSE parse error (audit_log):", err);
        }
      });

      es.addEventListener("orchestrator_log", (e) => {
        try {
          const log = JSON.parse(e.data);
          set((state) => ({
            orchestratorLogs: [log, ...state.orchestratorLogs].slice(0, 200),
          }));
        } catch (err) {
          console.error("SSE parse error (orchestrator_log):", err);
        }
      });

      es.addEventListener("pipeline_update", () => {
        get().fetchDb();
      });

      return () => {
        es.close();
        eventSource = null;
      };
    },

    runAnalysis: async (title, text, workflowId) => {
      await AnalysisService.runAnalysis(title, text, workflowId);
      await get().fetchDb();
    },

    createWorkflow: async (wfData) => {
      await WorkflowService.createWorkflow(wfData.name, wfData.description || "", wfData.agents, wfData.stages);
      await get().fetchDb();
    },

    addKnowledge: async (name, content) => {
      await AgentService.addKnowledgeSource(name, content);
      await get().fetchDb();
    },

    saveSettings: async (profile, workspace, models) => {
      await AgentService.saveSettings(profile, workspace, models);
      await get().fetchDb();
    },

    clearNotifications: async () => {
      await AgentService.clearNotifications();
      await get().fetchDb();
    },

    resetDemoState: async () => {
      await AgentService.resetSystem();
      await get().fetchDb();
      await get().fetchTraces();
    },

    resetDbEngine: async () => {
      await AgentService.resetSystem();
      await get().fetchDb();
      await get().fetchTraces();
    },
  };
});
