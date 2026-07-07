import { AnalysisRepository } from "../repositories/AnalysisRepository";
import { WorkflowRepository } from "../repositories/WorkflowRepository";
import { Analysis } from "../../src/types";
import { LangGraphOrchestrator } from "../orchestration/LangGraphOrchestrator";
import { QueueWorker } from "../workers/QueueWorker";
import { NotificationService } from "./NotificationService";

export class AnalysisService {
  public static getAllAnalyses(): Analysis[] {
    return AnalysisRepository.getAll();
  }

  public static runAnalysis(
    title: string | undefined,
    text: string,
    workflowId: string,
    ip: string
  ): Analysis {
    if (!text || !workflowId) {
      LangGraphOrchestrator.writeAuditLog("Maya Reyes", "DISPATCH_SWARM", "validation_error", ip, "failure");
      throw new Error("Missing required fields: source text and workflowId are required.");
    }

    const workflow = WorkflowRepository.getById(workflowId);
    if (!workflow) {
      LangGraphOrchestrator.writeAuditLog("Maya Reyes", "DISPATCH_SWARM", `error_wf_${workflowId}`, ip, "failure");
      throw new Error(`Workflow with ID ${workflowId} not found.`);
    }

    const defaultTitle = title || `Analysis Run — ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
    const analysisId = `an-${Date.now()}`;

    const analysis: Analysis = {
      id: analysisId,
      title: defaultTitle,
      workflowId,
      workflowName: workflow.name,
      status: "running" as const,
      createdAt: new Date().toISOString(),
      riskRating: "Low" as const,
      currentStageIndex: 0,
      sourceText: text,
      stages: workflow.stages.map((stg: string, idx: number) => ({
        name: stg,
        status: (idx === 0 ? "active" : "pending") as any,
        agent: workflow.agents[idx],
        result: ""
      })),
      agentOutputs: {},
      reportId: ""
    };

    AnalysisRepository.insert(analysis);
    NotificationService.addNotification(`Swarm dispatched for ${defaultTitle}.`, "info");
    LangGraphOrchestrator.writeAuditLog("Maya Reyes", "DISPATCH_SWARM", analysisId, ip, "success");

    // Queue job to background workers
    QueueWorker.enqueueSwarm(analysisId, workflowId, text);

    return analysis;
  }
}
