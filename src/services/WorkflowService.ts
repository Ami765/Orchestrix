import { workflowApi } from "../api";
import { Workflow } from "../types";

export class WorkflowService {
  /**
   * Validates and submits a custom swarm workflow template.
   */
  public static async createWorkflow(name: string, description: string, agents: string[], stages: string[]): Promise<Workflow> {
    if (!name.trim()) {
      throw new Error("Workflow pipeline name is required.");
    }
    if (agents.length === 0 || stages.length === 0) {
      throw new Error("Workflow must include at least one agent specialist and stage checker.");
    }
    if (agents.length !== stages.length) {
      throw new Error("Misaligned pipeline stages: agent count must match stage checks.");
    }

    return workflowApi.createWorkflow({
      name,
      description: description || agents.join(" → "),
      agents,
      stages,
    });
  }
}
