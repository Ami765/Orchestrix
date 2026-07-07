import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "../api";
import { AnalysisService, WorkflowService, AgentService } from "../services";

export function useWorkspaceDbQuery() {
  return useQuery({
    queryKey: ["workspaceDb"],
    queryFn: () => client.getDb(),
    refetchInterval: 10000, // Polling fallback in case SSE drops
  });
}

export function useQueryLogsQuery() {
  return useQuery({
    queryKey: ["queryLogs"],
    queryFn: () => client.getQueryLogs(),
    refetchInterval: 3000,
  });
}

export function useAuditLogsQuery() {
  return useQuery({
    queryKey: ["auditLogs"],
    queryFn: () => client.getAuditLogs(),
    refetchInterval: 5000,
  });
}

export function useOrchestratorLogsQuery() {
  return useQuery({
    queryKey: ["orchestratorLogs"],
    queryFn: () => client.getOrchestratorLogs(),
    refetchInterval: 3000,
  });
}

export function useTelemetryQuery() {
  return useQuery({
    queryKey: ["telemetry"],
    queryFn: () => client.getTelemetry(),
    refetchInterval: 5000,
  });
}

// Mutations
export function useRunAnalysisMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: { title: string; text: string; workflowId: string }) =>
      AnalysisService.runAnalysis(variables.title, variables.text, variables.workflowId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaceDb"] });
    },
  });
}

export function useCreateWorkflowMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: { name: string; description: string; agents: string[]; stages: string[] }) =>
      WorkflowService.createWorkflow(variables.name, variables.description, variables.agents, variables.stages),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaceDb"] });
    },
  });
}

export function useAddKnowledgeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: { name: string; content: string }) =>
      AgentService.addKnowledgeSource(variables.name, variables.content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaceDb"] });
    },
  });
}

export function useSaveSettingsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: { profile: any; workspace: any; models?: any }) =>
      AgentService.saveSettings(variables.profile, variables.workspace, variables.models),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaceDb"] });
    },
  });
}
