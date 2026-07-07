import { create } from "zustand";
import { Report, Analysis } from "../types";

interface UIState {
  currentView: string;
  setCurrentView: (view: string) => void;
  rightCollapsed: boolean;
  setRightCollapsed: (collapsed: boolean) => void;
  toggleRightCollapsed: () => void;
  
  // Modal focus states
  selectedReport: Report | null;
  setSelectedReport: (report: Report | null) => void;
  selectedAnalysis: Analysis | null;
  setSelectedAnalysis: (analysis: Analysis | null) => void;

  // New Analysis configuration states
  selectedWorkflowId: string;
  setSelectedWorkflowId: (id: string) => void;
  analysisText: string;
  setAnalysisText: (text: string) => void;
  analysisTitle: string;
  setAnalysisTitle: (title: string) => void;
  analysisTab: "upload" | "paste";
  setAnalysisTab: (tab: "upload" | "paste") => void;
  uploadedFiles: Array<{ name: string; size: string }>;
  setUploadedFiles: (files: Array<{ name: string; size: string }>) => void;
  addUploadedFile: (file: { name: string; size: string }) => void;
  removeUploadedFile: (index: number) => void;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;

  // Settings tabs state
  settingsTab: "profile" | "workspace" | "models" | "verification";
  setSettingsTab: (tab: "profile" | "workspace" | "models" | "verification") => void;
  settingsForm: {
    profileName: string;
    profileEmail: string;
    profileRole: string;
    workspaceName: string;
    defaultWorkflow: string;
  };
  setSettingsForm: (form: Partial<UIState["settingsForm"]>) => void;
}

export const useUIStore = create<UIState>((set) => ({
  currentView: "dashboard",
  setCurrentView: (view) => set({ currentView: view }),
  rightCollapsed: false,
  setRightCollapsed: (collapsed) => set({ rightCollapsed: collapsed }),
  toggleRightCollapsed: () => set((state) => ({ rightCollapsed: !state.rightCollapsed })),

  selectedReport: null,
  setSelectedReport: (report) => set({ selectedReport: report }),
  selectedAnalysis: null,
  setSelectedAnalysis: (analysis) => set({ selectedAnalysis: analysis }),

  selectedWorkflowId: "wf-1",
  setSelectedWorkflowId: (id) => set({ selectedWorkflowId: id }),
  analysisText: "",
  setAnalysisText: (text) => set({ analysisText: text }),
  analysisTitle: "",
  setAnalysisTitle: (title) => set({ analysisTitle: title }),
  analysisTab: "paste",
  setAnalysisTab: (tab) => set({ analysisTab: tab }),
  uploadedFiles: [
    { name: "meridian_q2_statements.pdf", size: "1.2 MB" },
    { name: "vendor_contracts_clause.xlsx", size: "850 KB" }
  ],
  setUploadedFiles: (files) => set({ uploadedFiles: files }),
  addUploadedFile: (file) => set((state) => ({ uploadedFiles: [...state.uploadedFiles, file] })),
  removeUploadedFile: (index) => set((state) => ({
    uploadedFiles: state.uploadedFiles.filter((_, i) => i !== index)
  })),
  isDragging: false,
  setIsDragging: (dragging) => set({ isDragging: dragging }),

  settingsTab: "profile",
  setSettingsTab: (tab) => set({ settingsTab: tab }),
  settingsForm: {
    profileName: "Maya Reyes",
    profileEmail: "maya.reyes@orchestrix.io",
    profileRole: "Reviewer",
    workspaceName: "Meridian Advisory",
    defaultWorkflow: "Full diligence review"
  },
  setSettingsForm: (form) => set((state) => ({
    settingsForm: { ...state.settingsForm, ...form }
  })),
}));
