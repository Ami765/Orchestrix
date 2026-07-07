import { Router, Request, Response } from "express";
import { AgentRepository } from "../../repositories/AgentRepository";
import { LangGraphOrchestrator } from "../../orchestration/LangGraphOrchestrator";
import { dbPool } from "../../config/database";

const router = Router();

router.get("/agents", (req: Request, res: Response) => {
  const agents = AgentRepository.getAll();
  res.json(agents);
});

router.post("/settings", (req: Request, res: Response) => {
  const { profile, workspace, models } = req.body;
  const ip = req.ip || "127.0.0.1";

  dbPool.executeTransaction("Update Settings", () => {
    const currentSettings = dbPool.db.settings;
    if (profile) currentSettings.profile = { ...currentSettings.profile, ...profile };
    if (workspace) currentSettings.workspace = { ...currentSettings.workspace, ...workspace };
    if (models) currentSettings.models = { ...currentSettings.models, ...models };
  });

  LangGraphOrchestrator.writeAuditLog("Maya Reyes", "UPDATE_SETTINGS", "settings", ip, "success");
  res.json(dbPool.db.settings);
});

export const AgentRouter = router;
