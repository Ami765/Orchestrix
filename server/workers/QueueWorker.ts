import { taskQueue } from "../config/redis";
import { LangGraphOrchestrator } from "../orchestration/LangGraphOrchestrator";

export class QueueWorker {
  private static isRunning = false;

  public static start() {
    if (QueueWorker.isRunning) return;
    QueueWorker.isRunning = true;

    console.log("[QueueWorker] Background worker daemon successfully booted. Subscribed to task queues.");

    taskQueue.on("dispatch_swarm", async (data: { analysisId: string; workflowId: string; text: string }) => {
      console.log(`[QueueWorker] Worker picked up analysis task: ${data.analysisId}`);
      try {
        await LangGraphOrchestrator.run(data.analysisId, data.workflowId, data.text);
      } catch (err) {
        console.error(`[QueueWorker] Exception in task ${data.analysisId}:`, err);
      }
    });
  }

  public static enqueueSwarm(analysisId: string, workflowId: string, text: string) {
    console.log(`[QueueWorker] Enqueueing dispatch_swarm task: ${analysisId}`);
    taskQueue.emit("dispatch_swarm", { analysisId, workflowId, text });
  }
}
