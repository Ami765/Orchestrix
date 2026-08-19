import { DBState, DbQueryLog, AuditLog, OrchestratorLog, TelemetryStats } from "../types";

export const DEFAULT_DB_STATE: DBState = {
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
    { 
      id: "rep-1", 
      title: "Meridian Capital Diligence Report", 
      company: "Meridian Capital", 
      analysisId: "an-1", 
      date: "Jul 5, 2026", 
      text: "Stable liquidity, consistent margins across all business lines. No material misstatements identified. Total leverage of 3.75x is securely service-covered by Q2 cash flows. Liquidity cushions are well within expected limits.\n\n### KEY FINDINGS\n- Revenue increase: +12% quarter-over-quarter growth.\n- Operating EBITDA margin: 24.5% steady cash conversion.\n- Leverage covenant compliance: 3.75x leverage vs 4.0x ceiling constraint.\n\n### RECOMMENDATION\nApproved for standard underwriting with quarterly covenant monitoring.", 
      riskRating: "Low", 
      status: "Completed" 
    },
    { 
      id: "rep-2", 
      title: "Northgate Holdings Risk Report", 
      company: "Northgate Holdings", 
      analysisId: "an-2", 
      date: "Jul 5, 2026", 
      text: "One vendor contract renews without a rate cap clause — flagged for renegotiation before September. Section 14 represents exposure to potential arbitrary service price increments without caps. Strongly advise negotiation.\n\n### CONTRACT ANOMALIES\n- Clause 14: Auto-renewal clause lacks standard CPI indexation limit.\n- Clause 8: 90-day notice requirement is acceptable.\n\n### RISK MITIGATION\nExecute contract amendment adding 5% annual price escalation ceiling before contract renewal.", 
      riskRating: "Moderate", 
      status: "Completed" 
    },
    { 
      id: "rep-4", 
      title: "Pinegate Logistics Restructure Report", 
      company: "Pinegate Logistics", 
      analysisId: "an-3", 
      date: "Jul 2, 2026", 
      text: "Debt restructuring plan shows covenant breaches across two facilities — legal review and waivers are heavily recommended. Operating margins are highly volatile.\n\n### CRITICAL EXPOSURE\n- Leverage ratio: 5.2x (violates threshold of 4.0x).\n- Operating cash flows: -35% reduction due to capital expenditures.\n- Default probability: Elevated over 12-month horizon.\n\n### ACTION PLAN\nImpose senior collateral controls, capex freeze, and mandate monthly steering committee oversight.", 
      riskRating: "High", 
      status: "Completed" 
    }
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
    }
  }
};

export const DEFAULT_QUERY_LOGS: DbQueryLog[] = [
  { id: "q-1", timestamp: new Date(Date.now() - 5000).toISOString(), query: "SELECT * FROM analyses WHERE status = 'completed' ORDER BY createdAt DESC", latencyMs: 0.145, type: "SELECT", indexUsed: true, rowsAffected: 3 },
  { id: "q-2", timestamp: new Date(Date.now() - 15000).toISOString(), query: "SELECT * FROM agents ORDER BY id ASC", latencyMs: 0.082, type: "SELECT", indexUsed: true, rowsAffected: 6 },
  { id: "q-3", timestamp: new Date(Date.now() - 30000).toISOString(), query: "SELECT * FROM workflows", latencyMs: 0.095, type: "SELECT", indexUsed: false, rowsAffected: 3 },
  { id: "q-4", timestamp: new Date(Date.now() - 45000).toISOString(), query: "UPDATE settings SET profile = $1", latencyMs: 0.231, type: "UPDATE", indexUsed: true, rowsAffected: 1 },
];

export const DEFAULT_AUDIT_LOGS: AuditLog[] = [
  { id: "al-1", timestamp: new Date(Date.now() - 120000).toISOString(), actor: "Maya Reyes", action: "DISPATCH_SWARM_ANALYSIS", resource: "an-1", ip: "192.168.1.42", status: "success" },
  { id: "al-2", timestamp: new Date(Date.now() - 360000).toISOString(), actor: "System Daemon", action: "SYNCHRONIZE_KNOWLEDGE_BASE", resource: "ks-1", ip: "127.0.0.1", status: "success" },
  { id: "al-3", timestamp: new Date(Date.now() - 900000).toISOString(), actor: "Maya Reyes", action: "UPDATE_WORKSPACE_SETTINGS", resource: "settings", ip: "192.168.1.42", status: "success" },
];

export const DEFAULT_ORCHESTRATOR_LOGS: OrchestratorLog[] = [
  { id: "ol-1", timestamp: new Date(Date.now() - 10000).toISOString(), analysisId: "an-1", nodeName: "Decision Summarizer", eventType: "info", message: "Successfully finalized executive diligence synthesis and sealed report rep-1." },
  { id: "ol-2", timestamp: new Date(Date.now() - 25000).toISOString(), analysisId: "an-1", nodeName: "Risk Assessor", eventType: "agent_call", message: "Evaluated 3 risk vectors. Score: 94/100 (Low Risk boundary)." },
  { id: "ol-3", timestamp: new Date(Date.now() - 40000).toISOString(), analysisId: "an-1", nodeName: "Financial Reviewer", eventType: "agent_call", message: "Extracted debt metrics: leverage 3.75x, DSCR 2.6x." },
  { id: "ol-4", timestamp: new Date(Date.now() - 55000).toISOString(), analysisId: "an-1", nodeName: "Document Parser", eventType: "state_transition", message: "Parsed financial document text (284 tokens)." },
];

export const DEFAULT_TELEMETRY: TelemetryStats = {
  cpu: 24.2,
  memory: 64.8,
  activeConnections: 1,
  queriesPerMin: 18,
  averageLatencyMs: 0.118,
  activeWorkers: 0,
  uptimeSec: 8420
};

const STORAGE_KEY = "orchestrix_db_v1";

export function loadLocalDb(): DBState {
  if (typeof window === "undefined") return DEFAULT_DB_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.analyses) && Array.isArray(parsed.agents)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Failed to load local DB from localStorage:", e);
  }
  return DEFAULT_DB_STATE;
}

export function saveLocalDb(state: DBState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Failed to save local DB to localStorage:", e);
  }
}
