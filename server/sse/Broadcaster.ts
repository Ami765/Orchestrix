import { Response } from "express";
import { DbQueryLog, AuditLog, OrchestratorLog, TelemetryStats } from "../../src/types";

class SSEBroadcaster {
  private clients: Set<Response> = new Set();

  public addClient(res: Response) {
    this.clients.add(res);
  }

  public removeClient(res: Response) {
    this.clients.delete(res);
  }

  public broadcast(eventType: string, payload: any) {
    const message = `event: ${eventType}\ndata: ${JSON.stringify(payload)}\n\n`;
    this.clients.forEach((res) => {
      try {
        res.write(message);
      } catch (e) {
        console.error("SSE Broadcaster: Failed to write to client, removing client from stream", e);
        this.clients.delete(res);
      }
    });
  }

  public get activeCount(): number {
    return this.clients.size;
  }
}

export const sseBroadcaster = new SSEBroadcaster();
