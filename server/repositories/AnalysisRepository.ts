import { dbPool } from "../config/database";
import { Analysis, Report } from "../../src/types";

export class AnalysisRepository {
  public static getAll(): Analysis[] {
    return dbPool.executeQuery<Analysis>(
      "SELECT * FROM analyses ORDER BY created_at DESC",
      "SELECT",
      "analyses"
    );
  }

  public static getById(id: string): Analysis | null {
    const results = dbPool.executeQuery<Analysis>(
      `SELECT * FROM analyses WHERE id = '${id}' LIMIT 1`,
      "SELECT",
      "analyses",
      (a) => a.id === id
    );
    return results.length > 0 ? results[0] : null;
  }

  public static insert(analysis: Analysis) {
    dbPool.executeInsert(
      `INSERT INTO analyses (id, title, workflow_id, workflow_name, status, created_at, risk_rating, current_stage_index, source_text) VALUES ('${analysis.id}', '${analysis.title}', '${analysis.workflowId}', '${analysis.workflowName}', '${analysis.status}', '${analysis.createdAt}', '${analysis.riskRating}', ${analysis.currentStageIndex}, <source_text>)`,
      "analyses",
      analysis
    );
  }

  public static update(id: string, updateFn: (item: Analysis) => void): number {
    return dbPool.executeUpdate(
      `UPDATE analyses SET ... WHERE id = '${id}'`,
      "analyses",
      (a) => a.id === id,
      updateFn
    );
  }

  public static delete(id: string): number {
    return dbPool.executeDelete(
      `DELETE FROM analyses WHERE id = '${id}'`,
      "analyses",
      (a) => a.id === id
    );
  }

  // Reports
  public static getAllReports(): Report[] {
    return dbPool.executeQuery<Report>(
      "SELECT * FROM reports ORDER BY date DESC",
      "SELECT",
      "reports"
    );
  }

  public static insertReport(report: Report) {
    dbPool.executeInsert(
      `INSERT INTO reports (id, title, company, analysis_id, date, text, risk_rating, status) VALUES ('${report.id}', '${report.title}', '${report.company}', '${report.analysisId}', '${report.date}', <text>, '${report.riskRating}', '${report.status}')`,
      "reports",
      report
    );
  }
}
