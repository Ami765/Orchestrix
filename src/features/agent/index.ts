/**
 * Feature Module: Swarm Agent Specialist
 * Manages training parameters, status monitoring, and specialist profiles.
 */

export const SPECIALIST_PROFILES = {
  "Document Parser": {
    baseTemperature: 0.1,
    cognitiveDepth: "high",
    memoryContextSize: "128k",
  },
  "Financial Reviewer": {
    baseTemperature: 0.2,
    cognitiveDepth: "extremely-high",
    memoryContextSize: "64k",
  },
  "Risk Assessor": {
    baseTemperature: 0.2,
    cognitiveDepth: "critical",
    memoryContextSize: "128k",
  },
  "Compliance Officer": {
    baseTemperature: 0.1,
    cognitiveDepth: "strict-rules",
    memoryContextSize: "256k",
  },
};
