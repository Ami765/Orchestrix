import { dbPool } from "../config/database";
import { Agent } from "../../src/types";

export class AgentRepository {
  public static getAll(): Agent[] {
    return dbPool.executeQuery<Agent>(
      "SELECT * FROM agents",
      "SELECT",
      "agents"
    );
  }

  public static getByName(name: string): Agent | null {
    const results = dbPool.executeQuery<Agent>(
      `SELECT * FROM agents WHERE name = '${name}' LIMIT 1`,
      "SELECT",
      "agents",
      (a) => a.name === name
    );
    return results.length > 0 ? results[0] : null;
  }

  public static updateByName(name: string, updateFn: (item: Agent) => void): number {
    return dbPool.executeUpdate(
      `UPDATE agents SET ... WHERE name = '${name}'`,
      "agents",
      (a) => a.name === name,
      updateFn
    );
  }
}
