import { Router, Request, Response } from "express";
import { AnalysisService } from "../../services/AnalysisService";
import { AnalysisRepository } from "../../repositories/AnalysisRepository";
import { dbPool } from "../../config/database";

const router = Router();

router.get("/db", (req: Request, res: Response) => {
  const db = dbPool.db;
  res.json(db);
});

router.post("/run-analysis", (req: Request, res: Response) => {
  const { title, text, workflowId } = req.body;
  const ip = req.ip || "127.0.0.1";
  try {
    const analysis = AnalysisService.runAnalysis(title, text, workflowId, ip);
    res.status(201).json(analysis);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/reports", (req: Request, res: Response) => {
  const reports = AnalysisRepository.getAllReports();
  res.json(reports);
});

export const AnalysisRouter = router;
