import { dbPool } from "../config/database";
import { redis } from "../config/redis";
import { sseBroadcaster } from "../sse/Broadcaster";
import { AIService } from "../services/AIService";
import { AnalysisRepository } from "../repositories/AnalysisRepository";
import { AgentRepository } from "../repositories/AgentRepository";
import { NotificationService } from "../services/NotificationService";
import { OrchestratorLog, AuditLog } from "../../src/types";
import { SwarmState } from "../models/types";

export class LangGraphOrchestrator {
  private static orchestratorLogs: OrchestratorLog[] = [];
  private static auditLogs: AuditLog[] = [
    { id: "al-1", timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(), actor: "Maya Reyes", action: "DISPATCH_SWARM", resource: "an-1", ip: "192.168.1.104", status: "success" },
    { id: "al-2", timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), actor: "Maya Reyes", action: "CREATE_WORKFLOW", resource: "wf-3", ip: "192.168.1.104", status: "success" },
    { id: "al-3", timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), actor: "System Scheduler", action: "BACKGROUND_CRON_SYNC", resource: "covenants", ip: "127.0.0.1", status: "success" },
    { id: "al-4", timestamp: new Date(Date.now() - 1 * 3600 * 1000).toISOString(), actor: "Maya Reyes", action: "UPLOAD_KNOWLEDGE", resource: "ks-2", ip: "192.168.1.104", status: "success" }
  ];

  public static getOrchestratorLogs(): OrchestratorLog[] {
    return LangGraphOrchestrator.orchestratorLogs;
  }

  public static getAuditLogs(): AuditLog[] {
    return LangGraphOrchestrator.auditLogs;
  }

  public static writeAuditLog(actor: string, action: string, resource: string, ip: string, status: "success" | "failure") {
    const log: AuditLog = {
      id: `al-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor,
      action,
      resource,
      ip,
      status
    };
    LangGraphOrchestrator.auditLogs.unshift(log);
    if (LangGraphOrchestrator.auditLogs.length > 200) LangGraphOrchestrator.auditLogs.pop();
    sseBroadcaster.broadcast("audit_log", log);
  }

  public static writeOrchestratorLog(analysisId: string, nodeName: string, eventType: OrchestratorLog["eventType"], message: string, stateDelta?: any) {
    const log: OrchestratorLog = {
      id: `ol-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      analysisId,
      nodeName,
      eventType,
      message,
      stateDelta: stateDelta ? JSON.stringify(stateDelta) : undefined
    };
    LangGraphOrchestrator.orchestratorLogs.unshift(log);
    if (LangGraphOrchestrator.orchestratorLogs.length > 500) LangGraphOrchestrator.orchestratorLogs.pop();
    sseBroadcaster.broadcast("orchestrator_log", log);
  }

  public static clearLogs() {
    LangGraphOrchestrator.orchestratorLogs.length = 0;
    LangGraphOrchestrator.auditLogs.length = 0;
  }

  private static async executeAgentNode(nodeName: string, state: SwarmState): Promise<string> {
    LangGraphOrchestrator.writeOrchestratorLog(state.analysisId, nodeName, "agent_call", `Orchestrator invoking Agent node [${nodeName}]. Initializing semantic analysis.`);

    const agentObj = AgentRepository.getByName(nodeName);
    const role = agentObj ? agentObj.role : "Specialist Agent";

    // 1. Check Redis Cache
    const cacheKey = `agent_run:${nodeName}:${Buffer.from(state.sourceText).toString("base64").slice(0, 40)}`;
    const cachedResponse = redis.get(cacheKey);
    if (cachedResponse) {
      LangGraphOrchestrator.writeOrchestratorLog(state.analysisId, nodeName, "info", `[Redis Cache HIT] Reusing cached evaluation for ${nodeName}.`);
      return cachedResponse;
    }

    // 2. RAG retrieval context injection
    const ragContext = AIService.retrieveRAGContext(state.sourceText);
    let enhancedSourceText = state.sourceText;

    if (ragContext) {
      LangGraphOrchestrator.writeOrchestratorLog(state.analysisId, nodeName, "rag_retrieval",
        `RAG INTERLOCK: Found highly relevant knowledge file [${ragContext.sourceName}] (Cosine Sim Score: ${ragContext.score.toFixed(3)}). Merging reference guidelines.`
      );
      enhancedSourceText = `[KNOWLEDGE BASE REFERENCE - SOURCE: ${ragContext.sourceName} (SIMILARITY: ${ragContext.score.toFixed(3)})]\n${ragContext.content}\n\n[USER FILE ATTACHMENTS FOR WORKSPACE]\n${state.sourceText}`;
    } else {
      LangGraphOrchestrator.writeOrchestratorLog(state.analysisId, nodeName, "info", "RAG semantic evaluation completed. No active context matches exceeded threshold. Applying standard base system instructions.");
    }

    // 3. Execution (Gemini / High-Fidelity local simulator)
    const result = await AIService.callGeminiAgent(nodeName, role, state.accumulatedResults, enhancedSourceText);

    // 4. Update Redis Cache
    redis.set(cacheKey, result, 300); // cache for 5 minutes

    // 5. Audit Risk marks
    const lowerResult = result.toLowerCase();
    const flagsRisk = lowerResult.includes("high") || lowerResult.includes("breach") || lowerResult.includes("violation") || lowerResult.includes("risk") || lowerResult.includes("covenant");
    if (flagsRisk) {
      state.riskCount++;
      LangGraphOrchestrator.writeOrchestratorLog(state.analysisId, nodeName, "info", `Risk monitor flagged high variance parameters. Incrementing workflow riskCount: ${state.riskCount}`);
    }

    return result;
  }

  public static async run(analysisId: string, workflowId: string, sourceText: string) {
    LangGraphOrchestrator.writeOrchestratorLog(analysisId, "GraphEngine", "state_transition", "LangGraph Workflow State-Machine initialized. Registering runtime memory graph node structure.");

    const db = dbPool.db;
    const workflow = db.workflows.find((w) => w.id === workflowId);
    if (!workflow) {
      LangGraphOrchestrator.writeOrchestratorLog(analysisId, "GraphEngine", "error", `Fatal Error: Selected Workflow with id [${workflowId}] does not exist in schema. Aborting.`);
      return;
    }

    // Clone arrays for dynamic graph alterations
    const workflowAgents = [...workflow.agents];
    const workflowStages = [...workflow.stages];

    const state: SwarmState = {
      analysisId,
      workflowId,
      sourceText,
      accumulatedResults: "",
      activeNode: workflowAgents[0],
      riskCount: 0
    };

    try {
      let stepIndex = 0;

      while (stepIndex < workflowAgents.length) {
        const currentNode = workflowAgents[stepIndex];
        const currentStage = workflowStages[stepIndex];

        // Atomically update database status via database pools
        dbPool.executeTransaction(`Activate State Node [${currentNode}]`, () => {
          AnalysisRepository.update(analysisId, (a) => {
            a.currentStageIndex = stepIndex;
            if (a.stages[stepIndex]) {
              a.stages[stepIndex].status = "active";
            } else {
              a.stages.push({
                name: currentStage,
                status: "active",
                agent: currentNode,
                result: ""
              });
            }
          });

          AgentRepository.updateByName(currentNode, (ag) => {
            ag.status = "busy";
            const target = AnalysisRepository.getById(analysisId);
            ag.lastTask = target ? target.title : "Active Swarm";
          });
        });

        // Broadcast to stream
        sseBroadcaster.broadcast("pipeline_update", { analysisId, db: dbPool.db });

        // Execute node
        const nodeOutput = await LangGraphOrchestrator.executeAgentNode(currentNode, state);

        // Store result
        state.accumulatedResults += `\n[${currentNode} Findings]: ${nodeOutput}\n`;

        dbPool.executeTransaction(`Complete State Node [${currentNode}]`, () => {
          AnalysisRepository.update(analysisId, (a) => {
            if (a.stages[stepIndex]) {
              a.stages[stepIndex].status = "completed";
              a.stages[stepIndex].result = nodeOutput;
            }
            a.agentOutputs[currentNode] = nodeOutput;
          });

          AgentRepository.updateByName(currentNode, (ag) => {
            ag.status = "idle";
            ag.runtime = (parseFloat(ag.runtime || "0") + 0.5).toFixed(2);
          });
        });

        LangGraphOrchestrator.writeOrchestratorLog(analysisId, currentNode, "info", `Agent Node finished compilation. Local memory state synchronized successfully.`);
        sseBroadcaster.broadcast("pipeline_update", { analysisId, db: dbPool.db });

        // ==================== CONDITIONAL ROUTING & DYNAMIC LOOPBACK EDGES ====================
        let nextStepIndex = stepIndex + 1;

        // Conditional Edge A: Financial reviewer flags covenant breach -> route via Compliance Officer Check
        if (currentNode === "Financial Reviewer" && state.riskCount > 0) {
          LangGraphOrchestrator.writeOrchestratorLog(analysisId, "ConditionalRouter", "state_transition",
            `CONDITIONAL EDGE TRAVERSED: Financial evaluation flagged leverage exceptions (${state.riskCount} marks). Branching pipeline through Compliance Officer audit verification.`
          );

          const hasCompliance = workflowAgents.includes("Compliance Officer");
          if (!hasCompliance) {
            LangGraphOrchestrator.writeOrchestratorLog(analysisId, "GraphEngine", "info", `Compliance Officer checkpoint absent in design map. Dynamically appending checking node into active runtime graph.`);
            
            AnalysisRepository.update(analysisId, (a) => {
              const sumIdx = a.stages.findIndex((s) => s.agent === "Decision Summarizer");
              const complianceStage = {
                name: "Compliance Audit Check",
                status: "pending" as const,
                agent: "Compliance Officer",
                result: ""
              };
              if (sumIdx !== -1) {
                a.stages.splice(sumIdx, 0, complianceStage);
              } else {
                a.stages.push(complianceStage);
              }
            });

            workflowAgents.splice(nextStepIndex, 0, "Compliance Officer");
            workflowStages.splice(nextStepIndex, 0, "Compliance Audit Check");
          }
        }

        // Loopback Edge B: Contract validator flags lacking pricing escalations -> loop back to Risk Assessor
        if (currentNode === "Contract Validator" && state.riskCount > 0) {
          const containsAssessor = workflowAgents.slice(nextStepIndex).includes("Risk Assessor");
          if (!containsAssessor) {
            LangGraphOrchestrator.writeOrchestratorLog(analysisId, "ConditionalRouter", "state_transition",
              `LOOPBACK TRIGGERED: Volatile renewal escalation found. Loopback to Risk Assessor for detailed capital exposure calculations.`
            );

            AnalysisRepository.update(analysisId, (a) => {
              const sumIdx = a.stages.findIndex((s) => s.agent === "Decision Summarizer");
              const exposureStage = {
                name: "Secondary Exposure Audit",
                status: "pending" as const,
                agent: "Risk Assessor",
                result: ""
              };
              if (sumIdx !== -1) {
                a.stages.splice(sumIdx, 0, exposureStage);
              } else {
                a.stages.push(exposureStage);
              }
            });

            workflowAgents.splice(nextStepIndex, 0, "Risk Assessor");
            workflowStages.splice(nextStepIndex, 0, "Secondary Exposure Audit");
          }
        }

        stepIndex = nextStepIndex;
        // Small interval
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      // Final compiling
      LangGraphOrchestrator.writeOrchestratorLog(analysisId, "CompilerNode", "info", "All paths traversed. Initiating LangGraph synthesis summarizing compilations.");

      let riskRating: "Low" | "Moderate" | "High" = "Low";
      if (state.riskCount >= 2 || sourceText.toLowerCase().includes("fail") || sourceText.toLowerCase().includes("miss") || sourceText.toLowerCase().includes("breach") || sourceText.toLowerCase().includes("5.2x")) {
        riskRating = "High";
      } else if (state.riskCount === 1 || sourceText.toLowerCase().includes("warning") || sourceText.toLowerCase().includes("caution") || sourceText.toLowerCase().includes("moderate") || sourceText.toLowerCase().includes("Section 14")) {
        riskRating = "Moderate";
      }

      const reportText = await AIService.synthesizeReport(state.accumulatedResults, riskRating);
      const reportId = `rep-${Date.now()}`;
      const targetAnalysis = AnalysisRepository.getById(analysisId);
      const title = targetAnalysis ? targetAnalysis.title : "Analysis";

      const newReport = {
        id: reportId,
        title: `${title} Report`,
        company: title.split("—")[0].trim(),
        analysisId: analysisId,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        text: reportText,
        riskRating: riskRating,
        status: "Completed" as const
      };

      dbPool.executeTransaction("Synthesize Final Relational Report", () => {
        AnalysisRepository.insertReport(newReport);
        AnalysisRepository.update(analysisId, (a) => {
          a.status = "completed";
          a.riskRating = riskRating;
          a.reportId = reportId;
          a.currentStageIndex = a.stages.length;
        });
        NotificationService.addNotification(`Analysis completed successfully for ${title}.`, "success");
      });

      LangGraphOrchestrator.writeOrchestratorLog(analysisId, "GraphEngine", "state_transition", `Orchestration finished. Multi-agent outputs successfully compiled. Executive Report ID: ${reportId}`);
      sseBroadcaster.broadcast("pipeline_update", { analysisId, db: dbPool.db });

    } catch (err: any) {
      console.error("[LangGraph] Fatal error in state machine execution:", err);
      LangGraphOrchestrator.writeOrchestratorLog(analysisId, "GraphEngine", "error", `LangGraph run encountered critical exception: ${err.message || err}`);

      dbPool.executeTransaction("Rollback Failures & Mark Pipeline Failed", () => {
        AnalysisRepository.update(analysisId, (a) => {
          a.status = "failed";
          if (a.stages[a.currentStageIndex]) {
            a.stages[a.currentStageIndex].status = "failed";
          }
        });
        NotificationService.addNotification(`Workflow run failed for ${AnalysisRepository.getById(analysisId)?.title}.`, "error");
      });

      sseBroadcaster.broadcast("pipeline_update", { analysisId, db: dbPool.db });
    }
  }
}
