/**
 * Feature Module: Workflow
 * Encapsulates components, validations, and custom node configurations
 * for building agent workflow pipelines.
 */

export const AVAILABLE_PIPELINE_NODES = [
  { id: "Document Parser", code: "DP", label: "Document Parser", desc: "Extracts covenants and financial parameters." },
  { id: "Financial Reviewer", code: "FR", label: "Financial Reviewer", desc: "Evaluates leverage ratios and balance sheet sheets." },
  { id: "Risk Assessor", code: "RA", label: "Risk Assessor", desc: "Flags credit violations and calculates exposures." },
  { id: "Compliance Officer", code: "CO", label: "Compliance Officer", desc: "Checks regulatory mandates and covenant waivers." },
  { id: "Contract Validator", code: "CV", label: "Contract Validator", desc: "Audits contract termination and renewal windows." },
  { id: "Decision Summarizer", code: "DS", label: "Decision Summarizer", desc: "Synthesizes agent logs into final reports." }
];
