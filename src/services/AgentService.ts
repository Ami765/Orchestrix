import { agentApi, knowledgeApi, notificationApi } from "../api";
import { KnowledgeSource } from "../types";

export class AgentService {
  /**
   * Save settings configuration.
   */
  public static async saveSettings(profile: any, workspace: any, models?: any): Promise<any> {
    return agentApi.saveSettings(profile, workspace, models);
  }

  /**
   * Ingest and index new RAG reference records.
   */
  public static async addKnowledgeSource(name: string, content: string): Promise<KnowledgeSource> {
    if (!name.trim() || !content.trim()) {
      throw new Error("Source name and content are required for RAG ingestion.");
    }
    return knowledgeApi.addKnowledge(name, content) as Promise<KnowledgeSource>;
  }

  /**
   * Clears active in-app alerts.
   */
  public static async clearNotifications(): Promise<any> {
    return notificationApi.clearNotifications();
  }

  /**
   * Triggers a safe full reset.
   */
  public static async resetSystem(): Promise<any> {
    return agentApi.resetDemoState();
  }
}
