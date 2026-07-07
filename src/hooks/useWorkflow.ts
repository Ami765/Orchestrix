import { useWorkspaceStore } from "../store";

export function useWorkflow() {
  const db = useWorkspaceStore((state) => state.db);
  const createWorkflowAction = useWorkspaceStore((state) => state.createWorkflow);
  const workflows = db?.workflows || [];

  const getWorkflowById = (id: string) => workflows.find((w) => w.id === id);

  return {
    workflows,
    getWorkflowById,
    createWorkflow: createWorkflowAction,
    workflowCount: workflows.length,
  };
}
