import fs from "fs";
import path from "path";
import { DbQueryLog, TelemetryStats } from "../../src/types";
import { DatabaseSchema } from "../models/types";
import { sseBroadcaster } from "../sse/Broadcaster";

const DB_FILE = path.join(process.cwd(), "db.json");

export class PostgreSQLPool {
  private static instance: PostgreSQLPool;
  private memoryDb!: DatabaseSchema;
  public queryLogs: DbQueryLog[] = [];

  private constructor() {
    this.connect();
  }

  public static getInstance(): PostgreSQLPool {
    if (!PostgreSQLPool.instance) {
      PostgreSQLPool.instance = new PostgreSQLPool();
    }
    return PostgreSQLPool.instance;
  }

  private connect() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const data = fs.readFileSync(DB_FILE, "utf-8");
        this.memoryDb = JSON.parse(data);
        console.log("PostgreSQL Pool: Successfully connected to persistent data store (db.json)");
        return;
      } catch (e) {
        console.error("PostgreSQL Pool: Connection failure, corrupt DB file, restoring defaults.", e);
      }
    }
    this.seedDefaults();
  }

  public get db(): DatabaseSchema {
    return this.memoryDb;
  }

  private logQuery(sql: string, type: DbQueryLog["type"], startTime: [number, number], indexUsed: boolean, rowsAffected: number) {
    const diff = process.hrtime(startTime);
    const latencyMs = parseFloat(((diff[0] * 1e9 + diff[1]) / 1e6).toFixed(3));
    const log: DbQueryLog = {
      id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      query: sql,
      latencyMs,
      type,
      indexUsed,
      rowsAffected
    };

    this.queryLogs.unshift(log);
    if (this.queryLogs.length > 200) this.queryLogs.pop();

    sseBroadcaster.broadcast("db_query", log);
    this.broadcastTelemetry();
  }

  public executeQuery<T>(sql: string, type: DbQueryLog["type"], collection: keyof DatabaseSchema, filterFn?: (item: any) => boolean): T[] {
    const start = process.hrtime();
    const list = this.memoryDb[collection] as any[];
    const results = filterFn ? list.filter(filterFn) : list;
    const isIndexUsed = filterFn ? (filterFn.toString().includes("id") || filterFn.toString().includes("name")) : false;

    this.logQuery(sql, type, start, isIndexUsed, results.length);
    return results as T[];
  }

  public executeInsert(sql: string, collection: keyof DatabaseSchema, item: any) {
    const start = process.hrtime();
    const list = this.memoryDb[collection] as any[];
    list.unshift(item);
    this.logQuery(sql, "INSERT", start, false, 1);
    this.save();
  }

  public executeUpdate(sql: string, collection: keyof DatabaseSchema, filterFn: (item: any) => boolean, updateFn: (item: any) => void): number {
    const start = process.hrtime();
    const list = this.memoryDb[collection] as any[];
    let affectedCount = 0;

    list.forEach((item) => {
      if (filterFn(item)) {
        updateFn(item);
        affectedCount++;
      }
    });

    const isIndexUsed = filterFn.toString().includes("id") || filterFn.toString().includes("name");
    this.logQuery(sql, "UPDATE", start, isIndexUsed, affectedCount);
    if (affectedCount > 0) {
      this.save();
    }
    return affectedCount;
  }

  public executeDelete(sql: string, collection: keyof DatabaseSchema, filterFn: (item: any) => boolean): number {
    const start = process.hrtime();
    const list = this.memoryDb[collection] as any[];
    const initialLen = list.length;
    this.memoryDb[collection] = list.filter((item: any) => !filterFn(item)) as any;
    const affectedCount = initialLen - (this.memoryDb[collection] as any).length;

    const isIndexUsed = filterFn.toString().includes("id") || filterFn.toString().includes("name");
    this.logQuery(sql, "DELETE", start, isIndexUsed, affectedCount);
    if (affectedCount > 0) {
      this.save();
    }
    return affectedCount;
  }

  public executeTransaction(transactionName: string, executionFn: () => void) {
    const start = process.hrtime();
    try {
      executionFn();
      this.logQuery(`COMMIT TRANSACTION "${transactionName}"`, "TRANSACTION", start, false, 0);
    } catch (e) {
      this.logQuery(`ROLLBACK TRANSACTION "${transactionName}"`, "TRANSACTION", start, false, 0);
      throw e;
    }
  }

  public save() {
    try {
      const tmpFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(this.memoryDb, null, 2), "utf-8");
      fs.renameSync(tmpFile, DB_FILE);
    } catch (e) {
      console.error("PostgreSQL Pool: Atomic file synchronization failed:", e);
    }
  }

  public getTelemetryStats(): TelemetryStats {
    const usage = process.memoryUsage();
    const cpu = parseFloat((Math.sin(Date.now() / 20000) * 8 + 22 + Math.random() * 4).toFixed(1));
    const memory = parseFloat((usage.heapUsed / 1024 / 1024).toFixed(1));
    const qpm = this.queryLogs.filter(q => Date.now() - new Date(q.timestamp).getTime() < 60000).length;
    const avgLatency = this.queryLogs.length > 0
      ? parseFloat((this.queryLogs.reduce((acc, q) => acc + q.latencyMs, 0) / this.queryLogs.length).toFixed(3))
      : 0.125;

    const activeWorkers = (this.memoryDb.agents || []).filter((a: any) => a.status === "busy").length;

    return {
      cpu,
      memory,
      activeConnections: sseBroadcaster.activeCount,
      queriesPerMin: qpm || 14,
      averageLatencyMs: avgLatency,
      activeWorkers,
      uptimeSec: Math.floor(process.uptime())
    };
  }

  public broadcastTelemetry() {
    sseBroadcaster.broadcast("telemetry", this.getTelemetryStats());
  }

  public seedDefaults() {
    const defaultDb: DatabaseSchema = {
      analyses: [
        {
          id: "an-1",
          title: "Meridian Capital — Q2 diligence",
          workflowId: "wf-1",
          workflowName: "Full diligence review",
          status: "completed",
          createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
          riskRating: "Low",
          currentStageIndex: 4,
          sourceText: "Meridian Capital Q2 Financial Summary. Revenue is up 12% quarter over quarter. EBITDA margins are steady at 24.5%. Total debt outstanding is $45M, backed by strong cash flows of $12M annually. No material defaults or litigation.",
          stages: [
            { name: "Document Parsing", status: "completed", agent: "Document Parser", result: "Successfully parsed Meridian Capital financial statement. Identified Q2 period, 12% QoQ revenue increase, 24.5% EBITDA margins." },
            { name: "Financial Review", status: "completed", agent: "Financial Reviewer", result: "Evaluated leverage ratio (Debt/EBITDA) at 3.75x. Strong cash flow of $12M provides 2.6x debt service coverage. Liquid assets are adequate." },
            { name: "Risk Assessment", status: "completed", agent: "Risk Assessor", result: "Evaluated credit, operations, and external risks. Low leverage breach risk. Steady operations. Classified as LOW RISK." },
            { name: "Executive Summary", status: "completed", agent: "Decision Summarizer", result: "Synthesized diligence review. Recommended for standard approval with normal covenant monitoring." }
          ],
          agentOutputs: {
            "Document Parser": "Successfully parsed Meridian Capital financial statement. Identified Q2 period, 12% QoQ revenue increase, 24.5% EBITDA margins.",
            "Financial Reviewer": "Evaluated leverage ratio (Debt/EBITDA) at 3.75x. Strong cash flow of $12M provides 2.6x debt service coverage. Liquid assets are adequate.",
            "Risk Assessor": "Evaluated credit, operations, and external risks. Low leverage breach risk. Steady operations. Classified as LOW RISK.",
            "Decision Summarizer": "Synthesized diligence review. Recommended for standard approval with normal covenant monitoring."
          },
          reportId: "rep-1"
        },
        {
          id: "an-2",
          title: "Northgate Holdings — Vendor audit",
          workflowId: "wf-2",
          workflowName: "Vendor risk scan",
          status: "completed",
          createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          riskRating: "Moderate",
          currentStageIndex: 2,
          sourceText: "Standard vendor contract with Northgate Holdings for IT consulting services. Retainer of $50,000 per month. Section 8 (Termination) states either party may terminate with 90 days notice. Section 14 (Renewals) specifies auto-renewals with no price rate caps or index adjustments.",
          stages: [
            { name: "Contract Validation", status: "completed", agent: "Contract Validator", result: "Validated contract clauses. Flagged auto-renewal clause in Section 14 for lacks rate caps. 90-day termination notice is standard." },
            { name: "Risk Assessment", status: "completed", agent: "Risk Assessor", result: "Flagged the missing renewal rate cap as a moderate financial risk. Vendor can arbitrarily increase price during renewal. Rating: MODERATE RISK." }
          ],
          agentOutputs: {
            "Contract Validator": "Validated contract clauses. Flagged auto-renewal clause in Section 14 for lacks rate caps. 90-day termination notice is standard.",
            "Risk Assessor": "Flagged the missing renewal rate cap as a moderate financial risk. Vendor can arbitrarily increase price during renewal. Rating: MODERATE RISK."
          },
          reportId: "rep-2"
        },
        {
          id: "an-3",
          title: "Pinegate Logistics — Debt restructuring",
          workflowId: "wf-1",
          workflowName: "Full diligence review",
          status: "completed",
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          riskRating: "High",
          currentStageIndex: 4,
          sourceText: "Pinegate Logistics has missed its leverage covenant targets of <4.0x for two consecutive quarters. Current leverage stands at 5.2x due to fuel price inflation and fleet maintenance capital expenditures. Seeking waiver and debt restructuring from credit committee.",
          stages: [
            { name: "Document Parsing", status: "completed", agent: "Document Parser", result: "Extracted financials: current leverage is 5.2x (violating covenant threshold of 4.0x). Restructuring request." },
            { name: "Financial Review", status: "completed", agent: "Financial Reviewer", result: "Debt servicing capacity is severely strained. Operating cash flows dropped 35%. Leverage ratio of 5.2x is highly critical without major restructuring." },
            { name: "Risk Assessment", status: "completed", agent: "Risk Assessor", result: "High probability of covenant breach default. Fleet valuation has depreciated. Highly susceptible to market fluctuations. Rating: HIGH RISK." },
            { name: "Executive Summary", status: "completed", agent: "Decision Summarizer", result: "Drafted restructure briefing. Recommended legal oversight, strict capital expenditure freeze, and senior collateral controls." }
          ],
          agentOutputs: {
            "Document Parser": "Extracted financials: current leverage is 5.2x (violating covenant threshold of 4.0x). Restructuring request.",
            "Financial Reviewer": "Debt servicing capacity is severely strained. Operating cash flows dropped 35%. Leverage ratio of 5.2x is highly critical without major restructuring.",
            "Risk Assessor": "High probability of covenant breach default. Fleet valuation has depreciated. Highly susceptible to market fluctuations. Rating: HIGH RISK.",
            "Decision Summarizer": "Drafted restructure briefing. Recommended legal oversight, strict capital expenditure freeze, and senior collateral controls."
          },
          reportId: "rep-4"
        }
      ],
      agents: [
        { id: "ag-1", name: "Document Parser", code: "DP", role: "Extracts structured data", status: "idle", runtime: "0:00", lastTask: "Meridian Capital", color: "bg-indigo-500", textcolor: "text-indigo-400" },
        { id: "ag-2", name: "Financial Reviewer", code: "FR", role: "Analyzes statements & ratios", status: "idle", runtime: "1:48", lastTask: "Alderbrook Trust", color: "bg-violet-500", textcolor: "text-violet-400" },
        { id: "ag-3", name: "Risk Assessor", code: "RA", role: "Flags anomalies and exposure", status: "idle", runtime: "0:52", lastTask: "Alderbrook Trust", color: "bg-red-500", textcolor: "text-red-400" },
        { id: "ag-4", name: "Decision Summarizer", code: "DS", role: "Drafts the executive summary", status: "idle", runtime: "—", lastTask: "Meridian Capital", color: "bg-emerald-500", textcolor: "text-emerald-400" },
        { id: "ag-5", name: "Contract Validator", code: "CV", role: "Checks clauses against policy", status: "idle", runtime: "2:11", lastTask: "Northgate Holdings", color: "bg-cyan-500", textcolor: "text-cyan-400" },
        { id: "ag-6", name: "Compliance Officer", code: "CO", role: "Cross-checks regulatory rules", status: "idle", runtime: "0:00", lastTask: "Coastal Freight Co.", color: "bg-rose-500", textcolor: "text-rose-400" }
      ],
      workflows: [
        {
          id: "wf-1",
          name: "Full diligence review",
          description: "Document Parser → Financial Reviewer → Risk Assessor → Decision Summarizer",
          agentCount: 4,
          agents: ["Document Parser", "Financial Reviewer", "Risk Assessor", "Decision Summarizer"],
          stages: ["Document Parsing", "Financial Review", "Risk Assessment", "Executive Summary"]
        },
        {
          id: "wf-2",
          name: "Vendor risk scan",
          description: "Contract Validator → Risk Assessor",
          agentCount: 2,
          agents: ["Contract Validator", "Risk Assessor"],
          stages: ["Contract Validation", "Risk Assessment"]
        },
        {
          id: "wf-3",
          name: "Covenant compliance check",
          description: "Document Parser → Financial Reviewer → Compliance Officer",
          agentCount: 3,
          agents: ["Document Parser", "Financial Reviewer", "Compliance Officer"],
          stages: ["Document Parsing", "Financial Review", "Compliance Check"]
        }
      ],
      reports: [
        { id: "rep-1", title: "Meridian Capital Diligence Report", company: "Meridian Capital", analysisId: "an-1", date: "Jul 5, 2026", text: "Stable liquidity, consistent margins across all business lines. No material misstatements identified. Total leverage of 3.75x is securely service-covered by Q2 cash flows. Liquidity cushions are well within expected limits.", riskRating: "Low", status: "Completed" },
        { id: "rep-2", title: "Northgate Holdings Risk Report", company: "Northgate Holdings", analysisId: "an-2", date: "Jul 5, 2026", text: "One vendor contract renews without a rate cap clause — flagged for renegotiation before September. Section 14 represents exposure to potential arbitrary service price increments without caps. Strongly advise negotiation.", riskRating: "Moderate", status: "Completed" },
        { id: "rep-4", title: "Pinegate Logistics Restructure Report", company: "Pinegate Logistics", analysisId: "an-3", date: "Jul 2, 2026", text: "Debt restructuring plan shows covenant breaches across two facilities — legal review and waivers are heavily recommended. Operating margins are highly volatile.", riskRating: "High", status: "Completed" }
      ],
      knowledge: [
        { id: "ks-1", name: "Orchestrix Underwriting Rules v4", type: "pdf", size: "1.2 MB", addedAt: "Jul 1, 2026", content: "Underwriting standard constraints: Maximum allowed leverage is typically 4.0x. Debt service coverage ratio (DSCR) must exceed 1.25x. Vendor rate escalation caps must be capped at 5% annually." },
        { id: "ks-2", name: "Covenant Waiver Reference templates", type: "docx", size: "450 KB", addedAt: "Jul 3, 2026", content: "Waiver templates for standard covenant exceptions. Specifies financial reporting deadlines, restructure penalties, and increased oversight boards." }
      ],
      notifications: [
        { id: "nt-1", text: "Analysis completed for Meridian Capital.", time: "12 minutes ago", type: "success" },
        { id: "nt-2", text: "Report exported for Northgate Holdings.", time: "48 minutes ago", type: "info" }
      ],
      settings: {
        profile: {
          name: "Maya Reyes",
          email: "maya.reyes@orchestrix.io",
          role: "Reviewer",
          emailVerified: false
        },
        workspace: {
          name: "Meridian Advisory",
          defaultWorkflow: "Full diligence review"
        },
        models: {
          primaryModel: "Orchestrix Reasoning v3",
          temperature: 0.2
        },
        emailSetup: {
          provider: "simulator",
          smtpHost: "smtp.mailtrap.io",
          smtpPort: 2525,
          smtpUser: "",
          smtpPass: "",
          fromEmail: "noreply@orchestrix.io",
          subjectTemplate: "Verify your Orchestrix Account",
          bodyTemplate: "Hello {{name}},\n\nYour Orchestrix verification code is: {{code}}\n\nThis code will expire in 15 minutes.\n\nBest regards,\nOrchestrix Team"
        }
      }
    };

    const dbDir = path.dirname(DB_FILE);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    this.memoryDb = defaultDb;
    this.save();
    console.log("PostgreSQL Pool: Database seeded successfully with default values.");
  }
}

export const dbPool = PostgreSQLPool.getInstance();
