import { Stage } from "./workflow";

export interface Analysis {
  id: string;
  title: string;
  workflowId: string;
  workflowName: string;
  status: "running" | "completed" | "failed";
  createdAt: string;
  riskRating: "Low" | "Moderate" | "High";
  currentStageIndex: number;
  sourceText: string;
  stages: Stage[];
  agentOutputs: Record<string, string>;
  reportId: string;
}
