import { Router, Request, Response } from "express";
import { dbPool } from "../../config/database";
import { LangGraphOrchestrator } from "../../orchestration/LangGraphOrchestrator";
import { redis } from "../../config/redis";
import { sseBroadcaster } from "../../sse/Broadcaster";
import { NotificationService } from "../../services/NotificationService";

const router = Router();

// SSE stream
router.get("/updates", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  sseBroadcaster.addClient(res);

  // Immediate telemetry handshake
  res.write(`event: telemetry\ndata: ${JSON.stringify(dbPool.getTelemetryStats())}\n\n`);

  req.on("close", () => {
    sseBroadcaster.removeClient(res);
  });
});

// Logs queries
router.get("/logs/query", (req: Request, res: Response) => {
  res.json(dbPool.queryLogs);
});

// Logs audits
router.get("/logs/audit", (req: Request, res: Response) => {
  res.json(LangGraphOrchestrator.getAuditLogs());
});

// Logs orchestrator
router.get("/logs/orchestrator", (req: Request, res: Response) => {
  res.json(LangGraphOrchestrator.getOrchestratorLogs());
});

// Telemetry
router.get("/telemetry", (req: Request, res: Response) => {
  res.json(dbPool.getTelemetryStats());
});

// Notifications clearing
router.post("/notifications/clear", (req: Request, res: Response) => {
  const ip = req.ip || "127.0.0.1";
  NotificationService.clearAll();
  LangGraphOrchestrator.writeAuditLog("Maya Reyes", "CLEAR_NOTIFICATIONS", "notifications", ip, "success");
  res.json({ success: true });
});

// Factory Reset
router.post("/reset", (req: Request, res: Response) => {
  const ip = req.ip || "127.0.0.1";
  
  // Clear trace memory logs
  dbPool.queryLogs.length = 0;
  LangGraphOrchestrator.clearLogs();
  redis.clear();

  dbPool.seedDefaults();
  LangGraphOrchestrator.writeAuditLog("System", "RESET_DATABASE", "db.json", ip, "success");
  res.json({ success: true, db: dbPool.db });
});

export const SystemRouter = router;
