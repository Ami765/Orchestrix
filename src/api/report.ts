import { request } from "./client";
import { Report } from "../types";

export const reportApi = {
  // Central endpoint triggers analysis results which then publishes reports
  // This module can be extended for direct report exports or audits
  getReports: async (): Promise<Report[]> => {
    // Reports are part of our overall DBState, but we can query them or support specific custom reports integrations
    const dbState = await request<{ reports: Report[] }>("/db");
    return dbState.reports;
  },
};
