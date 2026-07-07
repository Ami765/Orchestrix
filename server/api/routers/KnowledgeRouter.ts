import { Router, Request, Response } from "express";
import { KnowledgeRepository } from "../../repositories/KnowledgeRepository";
import { LangGraphOrchestrator } from "../../orchestration/LangGraphOrchestrator";

const router = Router();

router.get("/knowledge", (req: Request, res: Response) => {
  const sources = KnowledgeRepository.getAll();
  res.json(sources);
});

router.post("/knowledge", (req: Request, res: Response) => {
  const { name, content } = req.body;
  const ip = req.ip || "127.0.0.1";

  if (!name || !content) {
    LangGraphOrchestrator.writeAuditLog("Maya Reyes", "UPLOAD_KNOWLEDGE", "error_validation", ip, "failure");
    return res.status(400).json({ error: "Missing source name or content" });
  }

  const newSource = {
    id: `ks-${Date.now()}`,
    name,
    type: name.split(".").pop() || "txt",
    size: `${(content.length / 1024).toFixed(1)} KB`,
    addedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    content
  };

  KnowledgeRepository.insert(newSource);
  LangGraphOrchestrator.writeAuditLog("Maya Reyes", "UPLOAD_KNOWLEDGE", newSource.id, ip, "success");
  res.status(201).json(newSource);
});

export const KnowledgeRouter = router;
