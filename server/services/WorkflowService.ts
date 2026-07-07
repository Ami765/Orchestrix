import { WorkflowRepository } from "../repositories/WorkflowRepository";
import { Workflow } from "../../src/types";
import { LangGraphOrchestrator } from "../orchestration/LangGraphOrchestrator";

export class WorkflowService {
  public static getAllWorkflows(): Workflow[] {
    return WorkflowRepository.getAll();
  }

  public static createWorkflow(
    name: string,
    description: string | undefined,
    agents: string[],
    stages: string[],
    ip: string
  ): Workflow {
    if (!name || !agents || !stages || agents.length === 0) {
      LangGraphOrchestrator.writeAuditLog("Maya Reyes", "CREATE_WORKFLOW", "validation_error", ip, "failure");
      throw new Error("Invalid workflow properties: Name, agents, and stages are required.");
    }

    const workflow: Workflow = {
      id: `wf-${Date.now()}`,
      name,
      description: description || agents.join(" → "),
      agentCount: agents.length,
      agents,
      stages
    };

    WorkflowRepository.insert(workflow);
    LangGraphOrchestrator.writeAuditLog("Maya Reyes", "CREATE_WORKFLOW", workflow.id, ip, "success");
    return workflow;
  }
}
