export interface Workflow {
  id: string;
  name: string;
  description: string;
  agentCount: number;
  agents: string[];
  stages: string[];
}

export interface Stage {
  name: string;
  status: "pending" | "active" | "completed" | "failed";
  agent: string;
  result: string;
}
