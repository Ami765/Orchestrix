import { useWorkspaceStore } from "../store";

export function useAnalysis() {
  const db = useWorkspaceStore((state) => state.db);
  const runAnalysisAction = useWorkspaceStore((state) => state.runAnalysis);
  const analyses = db?.analyses || [];

  const runningAnalysis = analyses.find((a) => a.status === "running") || null;
  const completedAnalyses = analyses.filter((a) => a.status === "completed");
  const failedAnalyses = analyses.filter((a) => a.status === "failed");

  return {
    analyses,
    runningAnalysis,
    completedAnalyses,
    failedAnalyses,
    runAnalysis: runAnalysisAction,
    analysisCount: analyses.length,
  };
}
