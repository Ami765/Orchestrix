import { request } from "./client";

export const agentApi = {
  saveSettings: async (profile: any, workspace: any, models?: any) => {
    return request("/settings", {
      method: "POST",
      body: JSON.stringify({ profile, workspace, models }),
    });
  },
  resetDemoState: async () => {
    return request("/reset", {
      method: "POST",
    });
  },
};
