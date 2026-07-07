import { request } from "./client";
import { Analysis } from "../types";

export const analysisApi = {
  runAnalysis: async (title: string, text: string, workflowId: string): Promise<Analysis> => {
    return request<Analysis>("/run-analysis", {
      method: "POST",
      body: JSON.stringify({ title: title || undefined, text, workflowId }),
    });
  },
};
