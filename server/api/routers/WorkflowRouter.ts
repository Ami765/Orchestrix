import { Router, Request, Response } from "express";
import { WorkflowService } from "../../services/WorkflowService";

const router = Router();

router.get("/workflows", (req: Request, res: Response) => {
  const workflows = WorkflowService.getAllWorkflows();
  res.json(workflows);
});

router.post("/workflows", (req: Request, res: Response) => {
  const { name, description, agents, stages } = req.body;
  const ip = req.ip || "127.0.0.1";
  try {
    const workflow = WorkflowService.createWorkflow(name, description, agents, stages, ip);
    res.status(201).json(workflow);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export const WorkflowRouter = router;
