import { request } from "./client";
import { Workflow } from "../types";

export const workflowApi = {
  createWorkflow: async (workflowData: {
    name: string;
    description?: string;
    agents: string[];
    stages: string[];
  }): Promise<Workflow> => {
    return request<Workflow>("/workflows", {
      method: "POST",
      body: JSON.stringify(workflowData),
    });
  },
};
