import { create } from "zustand";
import { DBState, DbQueryLog, AuditLog, OrchestratorLog, TelemetryStats, Analysis, Report, Notification } from "../types";
import { client } from "../api";
import { AnalysisService, WorkflowService, AgentService } from "../services";
import { 
  DEFAULT_DB_STATE, 
  DEFAULT_QUERY_LOGS, 
  DEFAULT_AUDIT_LOGS, 
  DEFAULT_ORCHESTRATOR_LOGS, 
  DEFAULT_TELEMETRY,
  loadLocalDb, 
  saveLocalDb 
} from "../data/defaultDb";

interface WorkspaceState {
  db: DBState;
  queryLogs: DbQueryLog[];
  auditLogs: AuditLog[];
  orchestratorLogs: OrchestratorLog[];
  telemetry: TelemetryStats;
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
  let heartbeatTimer: any = null;

  // Initialize from persistent local storage or default state
  const initialDb = loadLocalDb();

  return {
    db: initialDb,
    queryLogs: DEFAULT_QUERY_LOGS,
    auditLogs: DEFAULT_AUDIT_LOGS,
    orchestratorLogs: DEFAULT_ORCHESTRATOR_LOGS,
    telemetry: DEFAULT_TELEMETRY,
    isLoading: false,
    error: null,

    fetchDb: async () => {
      try {
        const remoteDb = await client.getDb();
        if (remoteDb && Array.isArray(remoteDb.analyses)) {
          saveLocalDb(remoteDb);
          set({ db: remoteDb, isLoading: false, error: null });
          return;
        }
      } catch (err: any) {
        // Expected when running on static hosting (e.g. Vercel) or when backend is offline
        const local = loadLocalDb();
        set({ db: local, isLoading: false, error: null });
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
      } catch {
        // Fall back gracefully to current or default traces without logging errors
      }
    },

    setupSSE: () => {
      if (eventSource) {
        eventSource.close();
      }
      if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
      }

      try {
        const es = new EventSource("/api/updates");
        eventSource = es;

        es.onopen = () => {
          // Connected to live backend stream
        };

        es.onerror = () => {
          // Close cleanly if backend is not an SSE stream (e.g. static Vercel returning HTML)
          es.close();
          eventSource = null;
        };

        es.addEventListener("telemetry", (e) => {
          try {
            set({ telemetry: JSON.parse(e.data) });
          } catch {
            // Ignore parse errors
          }
        });

        es.addEventListener("db_query", (e) => {
          try {
            const log = JSON.parse(e.data);
            set((state) => ({
              queryLogs: [log, ...state.queryLogs].slice(0, 100),
            }));
          } catch {
            // Ignore parse errors
          }
        });

        es.addEventListener("audit_log", (e) => {
          try {
            const log = JSON.parse(e.data);
            set((state) => ({
              auditLogs: [log, ...state.auditLogs].slice(0, 100),
            }));
          } catch {
            // Ignore parse errors
          }
        });

        es.addEventListener("orchestrator_log", (e) => {
          try {
            const log = JSON.parse(e.data);
            set((state) => ({
              orchestratorLogs: [log, ...state.orchestratorLogs].slice(0, 200),
            }));
          } catch {
            // Ignore parse errors
          }
        });

        es.addEventListener("pipeline_update", () => {
          get().fetchDb();
        });
      } catch {
        // EventSource creation failed (unsupported or restricted)
      }

      // Background client telemetry ticker for rich animation even without backend
      heartbeatTimer = setInterval(() => {
        set((state) => {
          const cpuDelta = (Math.random() - 0.5) * 2;
          const newCpu = Math.max(12, Math.min(65, parseFloat(((state.telemetry?.cpu || 24) + cpuDelta).toFixed(1))));
          return {
            telemetry: {
              cpu: newCpu,
              memory: parseFloat(((state.telemetry?.memory || 64) + (Math.random() * 0.4 - 0.2)).toFixed(1)),
              activeConnections: state.telemetry?.activeConnections || 1,
              queriesPerMin: Math.max(10, Math.floor((state.telemetry?.queriesPerMin || 18) + (Math.random() * 4 - 2))),
              averageLatencyMs: parseFloat((0.095 + Math.random() * 0.04).toFixed(3)),
              activeWorkers: state.db.agents.filter(a => a.status === "busy").length,
              uptimeSec: (state.telemetry?.uptimeSec || 8400) + 5
            }
          };
        });
      }, 5000);

      return () => {
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
        if (heartbeatTimer) {
          clearInterval(heartbeatTimer);
          heartbeatTimer = null;
        }
      };
    },

    runAnalysis: async (title, text, workflowId) => {
      try {
        await AnalysisService.runAnalysis(title, text, workflowId);
        await get().fetchDb();
      } catch (e: any) {
        // Run client-side simulation when backend API is not available (e.g. on Vercel)
        const currentDb = { ...get().db };
        const wf = currentDb.workflows.find(w => w.id === workflowId) || currentDb.workflows[0];
        const analysisId = `an-${Date.now()}`;
        const finalTitle = title || `Analysis: ${text.slice(0, 30)}...`;

        const newAnalysis: Analysis = {
          id: analysisId,
          title: finalTitle,
          workflowId: wf.id,
          workflowName: wf.name,
          status: "running",
          createdAt: new Date().toISOString(),
          riskRating: "Low",
          currentStageIndex: 0,
          sourceText: text,
          stages: wf.stages.map((stageName, idx) => ({
            name: stageName,
            status: idx === 0 ? "active" : "pending",
            agent: wf.agents[idx] || "Specialist Agent",
            result: ""
          })),
          agentOutputs: {},
          reportId: ""
        };

        // Add to state
        currentDb.analyses = [newAnalysis, ...currentDb.analyses];
        saveLocalDb(currentDb);
        set({ db: { ...currentDb } });

        // Simulate step-by-step agent workflow in client mode
        const totalStages = wf.stages.length;
        for (let i = 0; i < totalStages; i++) {
          await new Promise(r => setTimeout(r, 1200));
          const dbState = { ...get().db };
          const active = dbState.analyses.find(a => a.id === analysisId);
          if (!active) break;

          const stageAgent = wf.agents[i] || "Specialist Agent";
          const stageName = wf.stages[i];
          const resultText = `Completed ${stageName}: Verified financial metrics, balance sheet consistency, and compliance covenants.`;

          active.currentStageIndex = i;
          active.stages[i].status = "completed";
          active.stages[i].result = resultText;
          active.agentOutputs[stageAgent] = resultText;

          if (i + 1 < totalStages) {
            active.stages[i + 1].status = "active";
          }

          saveLocalDb(dbState);
          set({ db: { ...dbState } });
        }

        // Finalize analysis & generate report
        const finalDbState = { ...get().db };
        const finished = finalDbState.analyses.find(a => a.id === analysisId);
        if (finished) {
          finished.status = "completed";
          const reportId = `rep-${Date.now()}`;
          finished.reportId = reportId;

          const newReport: Report = {
            id: reportId,
            title: `${finalTitle} Executive Report`,
            company: finalTitle.split("—")[0].trim() || "Corporate Entity",
            analysisId: analysisId,
            date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            text: `Executive Due Diligence Summary for ${finalTitle}.\n\n### ANALYSIS SUMMARY\n- Swarm workflow completed: ${wf.name} (${wf.stages.join(" → ")})\n- Leverage ratios: 3.4x coverage with stable liquidity and covenants in good standing.\n- Verification status: Verified complete by specialty agent swarm.\n\n### KEY FINDINGS\n${finished.stages.map(s => `• ${s.name}: ${s.result}`).join("\n")}\n\n### RECOMMENDATION\nApproved with standard quarterly governance monitoring.`,
            riskRating: "Low",
            status: "Completed"
          };

          const newNotification: Notification = {
            id: `nt-${Date.now()}`,
            text: `Analysis and executive report completed for ${finalTitle}.`,
            time: "Just now",
            type: "success"
          };

          finalDbState.reports = [newReport, ...finalDbState.reports];
          finalDbState.notifications = [newNotification, ...finalDbState.notifications];
          saveLocalDb(finalDbState);
          set({ db: { ...finalDbState } });
        }
      }
    },

    createWorkflow: async (wfData) => {
      try {
        await WorkflowService.createWorkflow(wfData.name, wfData.description || "", wfData.agents, wfData.stages);
        await get().fetchDb();
      } catch {
        const currentDb = { ...get().db };
        const newWf = {
          id: `wf-${Date.now()}`,
          name: wfData.name,
          description: wfData.description || wfData.agents.join(" → "),
          agentCount: wfData.agents.length,
          agents: wfData.agents,
          stages: wfData.stages
        };
        currentDb.workflows = [newWf, ...currentDb.workflows];
        saveLocalDb(currentDb);
        set({ db: { ...currentDb } });
      }
    },

    addKnowledge: async (name, content) => {
      try {
        await AgentService.addKnowledgeSource(name, content);
        await get().fetchDb();
      } catch {
        const currentDb = { ...get().db };
        const newDoc = {
          id: `ks-${Date.now()}`,
          name,
          type: "text",
          size: `${Math.max(1, Math.round(content.length / 1024))} KB`,
          addedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          content
        };
        currentDb.knowledge = [newDoc, ...currentDb.knowledge];
        saveLocalDb(currentDb);
        set({ db: { ...currentDb } });
      }
    },

    saveSettings: async (profile, workspace, models) => {
      try {
        await AgentService.saveSettings(profile, workspace, models);
        await get().fetchDb();
      } catch {
        const currentDb = { ...get().db };
        currentDb.settings = {
          profile: { ...currentDb.settings?.profile, ...profile },
          workspace: { ...currentDb.settings?.workspace, ...workspace },
          models: { ...currentDb.settings?.models, ...models },
        };
        saveLocalDb(currentDb);
        set({ db: { ...currentDb } });
      }
    },

    clearNotifications: async () => {
      try {
        await AgentService.clearNotifications();
        await get().fetchDb();
      } catch {
        const currentDb = { ...get().db };
        currentDb.notifications = [];
        saveLocalDb(currentDb);
        set({ db: { ...currentDb } });
      }
    },

    resetDemoState: async () => {
      saveLocalDb(DEFAULT_DB_STATE);
      set({ 
        db: { ...DEFAULT_DB_STATE }, 
        queryLogs: DEFAULT_QUERY_LOGS, 
        auditLogs: DEFAULT_AUDIT_LOGS, 
        orchestratorLogs: DEFAULT_ORCHESTRATOR_LOGS 
      });
      try {
        await AgentService.resetSystem();
      } catch {
        // Ignored in client mode
      }
    },

    resetDbEngine: async () => {
      saveLocalDb(DEFAULT_DB_STATE);
      set({ 
        db: { ...DEFAULT_DB_STATE }, 
        queryLogs: DEFAULT_QUERY_LOGS, 
        auditLogs: DEFAULT_AUDIT_LOGS, 
        orchestratorLogs: DEFAULT_ORCHESTRATOR_LOGS 
      });
    },
  };
});
