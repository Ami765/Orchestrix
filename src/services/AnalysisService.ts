import { analysisApi, reportApi } from "../api";
import { Analysis, Report } from "../types";

export class AnalysisService {
  /**
   * Dispatches a multi-agent swarm run.
   */
  public static async runAnalysis(title: string, text: string, workflowId: string): Promise<Analysis> {
    if (!text.trim()) {
      throw new Error("Analysis document text cannot be empty.");
    }
    if (!workflowId) {
      throw new Error("A valid workflow pipeline must be selected.");
    }
    return analysisApi.runAnalysis(title, text, workflowId);
  }

  /**
   * Retrieves generated diligence reports.
   */
  public static async getReports(): Promise<Report[]> {
    return reportApi.getReports();
  }
}
