import { dbPool } from "../config/database";
import { Workflow } from "../../src/types";

export class WorkflowRepository {
  public static getAll(): Workflow[] {
    return dbPool.executeQuery<Workflow>(
      "SELECT * FROM workflows ORDER BY name ASC",
      "SELECT",
      "workflows"
    );
  }

  public static getById(id: string): Workflow | null {
    const results = dbPool.executeQuery<Workflow>(
      `SELECT * FROM workflows WHERE id = '${id}' LIMIT 1`,
      "SELECT",
      "workflows",
      (w) => w.id === id
    );
    return results.length > 0 ? results[0] : null;
  }

  public static insert(workflow: Workflow) {
    dbPool.executeInsert(
      `INSERT INTO workflows (id, name, description, agent_count, agents, stages) VALUES ('${workflow.id}', '${workflow.name}', '${workflow.description}', ${workflow.agentCount}, <agents>, <stages>)`,
      "workflows",
      workflow
    );
  }
}
