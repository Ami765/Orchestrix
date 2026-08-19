import { create } from "zustand";

export interface WalkthroughStep {
  id: string;
  title: string;
  timing: string;
  voiceover: string;
  screenDesc: string;
  path: string;
  highlightSelector?: string;
  highlightText?: string;
  duration: number; // Duration in seconds for auto-advance
  simulatedAction?: string; // action to trigger on page enter
}

export const WALKTHROUGH_STEPS: WalkthroughStep[] = [
  {
    id: "opening",
    title: "1. Brand Identity & Opening",
    timing: "0:00–0:15",
    screenDesc: "Animated Splash Screen & Orchestrix Corporate Launch Logo",
    voiceover: "Welcome to Orchestrix — an AI-powered multi-agent automation platform designed to help businesses build, manage, and automate intelligent workflows through a modern and production-ready SaaS application.",
    path: "/demo-storyboard",
    duration: 15,
    simulatedAction: "splash"
  },
  {
    id: "login",
    title: "2. Secure SaaS Authentication",
    timing: "0:15–0:25",
    screenDesc: "Polished multi-factor login simulation with secure workspace routing",
    voiceover: "We start with a production-ready authentication screen, verifying identity and loading tenant-specific configurations seamlessly before routing to the main platform.",
    path: "/settings",
    duration: 10,
    simulatedAction: "show_login_simulation"
  },
  {
    id: "dashboard",
    title: "3. Mission Control & Real-time Telemetry",
    timing: "0:25–0:40",
    screenDesc: "Mission Control, agent health, active pipelines, and system activity feed",
    voiceover: "Orchestrix provides a clean and intuitive dashboard where users can access AI workspaces, manage projects, monitor automation activity, and control their entire AI ecosystem from a single interface.",
    path: "/",
    duration: 15,
    simulatedAction: "highlight_dashboard"
  },
  {
    id: "aichat",
    title: "4. AI Chat, Voice & Intelligence Hub",
    timing: "0:40–1:05",
    screenDesc: "Prompt inputs, dynamic text streams, voice generation panel, and workspace guidelines",
    voiceover: "The platform includes an integrated AI assistant powered by Google's latest language models. Users can interact naturally, generate content, analyze information, and automate daily business tasks through an intelligent conversational interface.",
    path: "/ai-hub",
    duration: 25,
    simulatedAction: "type_chat_message"
  },
  {
    id: "workflows",
    title: "5. Multi-Agent Workflows & Orchestration",
    timing: "1:05–1:40",
    screenDesc: "Node-based visual graphs, connecting specialists, defining decision thresholds",
    voiceover: "One of Orchestrix's core capabilities is multi-agent orchestration. Instead of relying on a single AI assistant, the platform allows multiple specialized agents to collaborate on complex workflows, enabling more accurate, scalable, and efficient task automation.",
    path: "/workflows",
    duration: 35,
    simulatedAction: "highlight_workflow"
  },
  {
    id: "workspace",
    title: "6. Departmental Workspaces",
    timing: "1:40–2:00",
    screenDesc: "Workspace profile customization, access control verification, model endpoints",
    voiceover: "Users can organize their work into dedicated workspaces, making it easy to separate clients, departments, or business operations while maintaining centralized management.",
    path: "/settings",
    duration: 20,
    simulatedAction: "highlight_workspace"
  },
  {
    id: "responsive",
    title: "7. Fluid Theme Engine & Responsiveness",
    timing: "2:00–2:20",
    screenDesc: "Responsive structural rails, real-time light/dark toggle simulations, layout scaling",
    voiceover: "Every part of the application has been designed with a modern user experience in mind, featuring responsive layouts, fast navigation, and a polished interface suitable for commercial SaaS deployment.",
    path: "/system-monitor",
    duration: 20,
    simulatedAction: "toggle_dark_light"
  },
  {
    id: "techstack",
    title: "8. Enterprise Production Stack",
    timing: "2:20–2:45",
    screenDesc: "System monitor, live performance graphs, CPU meters, DB structures, and traces",
    voiceover: "Orchestrix is built using modern technologies including React, TypeScript, Node.js, Express, Tailwind CSS, Google AI integration, and is fully deployable on platforms such as Vercel or custom Cloud Containers.",
    path: "/system-monitor",
    duration: 25,
    simulatedAction: "highlight_charts"
  },
  {
    id: "closing",
    title: "9. Commercialization & Acquisition",
    timing: "2:45–3:00",
    screenDesc: "Acquisition title card, deployment summary, contact & license details",
    voiceover: "Whether you're an entrepreneur looking to launch an AI business, a software agency expanding your product portfolio, or a startup seeking a production-ready foundation, Orchestrix provides a scalable platform ready for further development and commercialization. Thank you for watching.",
    path: "/",
    duration: 15,
    simulatedAction: "show_acquisition_overlay"
  }
];

interface WalkthroughStore {
  isActive: boolean;
  isPlaying: boolean;
  currentStepIndex: number;
  autoAdvance: boolean;
  timeLeft: number; // in seconds for current step
  showLoginOverlay: boolean;
  showAcquisitionOverlay: boolean;
  showSplashOverlay: boolean;
  highlightedElement: { selector: string; text: string } | null;
  simulatedChatText: string;
  isSimulatingTyping: boolean;

  // Actions
  startWalkthrough: () => void;
  stopWalkthrough: () => void;
  togglePlay: () => void;
  nextStep: (navigateFn: (path: string) => void) => void;
  prevStep: (navigateFn: (path: string) => void) => void;
  setStep: (index: number, navigateFn: (path: string) => void) => void;
  toggleAutoAdvance: () => void;
  setTimeLeft: (time: number) => void;
  tick: (navigateFn: (path: string) => void) => void;
  
  // Simulated Overlay actions
  setLoginOverlay: (show: boolean) => void;
  setAcquisitionOverlay: (show: boolean) => void;
  setSplashOverlay: (show: boolean) => void;
  setHighlightedElement: (highlight: { selector: string; text: string } | null) => void;
  setSimulatedChatText: (text: string) => void;
  setSimulatingTyping: (typing: boolean) => void;
}

export const useWalkthroughStore = create<WalkthroughStore>((set, get) => ({
  isActive: false,
  isPlaying: false,
  currentStepIndex: 0,
  autoAdvance: true,
  timeLeft: WALKTHROUGH_STEPS[0].duration,
  showLoginOverlay: false,
  showAcquisitionOverlay: false,
  showSplashOverlay: false,
  highlightedElement: null,
  simulatedChatText: "",
  isSimulatingTyping: false,

  startWalkthrough: () => {
    const currentStep = WALKTHROUGH_STEPS[0];
    set({
      isActive: true,
      isPlaying: true,
      currentStepIndex: 0,
      timeLeft: currentStep.duration,
      showLoginOverlay: false,
      showAcquisitionOverlay: false,
      showSplashOverlay: currentStep.simulatedAction === "splash",
      highlightedElement: null,
      simulatedChatText: "",
    });
  },

  stopWalkthrough: () => {
    set({
      isActive: false,
      isPlaying: false,
      showLoginOverlay: false,
      showAcquisitionOverlay: false,
      showSplashOverlay: false,
      highlightedElement: null,
    });
  },

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  setStep: (index, navigateFn) => {
    if (index < 0 || index >= WALKTHROUGH_STEPS.length) return;
    const step = WALKTHROUGH_STEPS[index];
    
    // Clear all overlays first
    set({
      currentStepIndex: index,
      timeLeft: step.duration,
      showLoginOverlay: step.simulatedAction === "show_login_simulation",
      showSplashOverlay: step.simulatedAction === "splash",
      showAcquisitionOverlay: step.simulatedAction === "show_acquisition_overlay",
      highlightedElement: null,
      simulatedChatText: "",
      isSimulatingTyping: false
    });

    // Handle auto routing
    navigateFn(step.path);
  },

  nextStep: (navigateFn) => {
    const { currentStepIndex, setStep } = get();
    if (currentStepIndex < WALKTHROUGH_STEPS.length - 1) {
      setStep(currentStepIndex + 1, navigateFn);
    } else {
      // Loop or stop
      get().stopWalkthrough();
    }
  },

  prevStep: (navigateFn) => {
    const { currentStepIndex, setStep } = get();
    if (currentStepIndex > 0) {
      setStep(currentStepIndex - 1, navigateFn);
    }
  },

  toggleAutoAdvance: () => set((state) => ({ autoAdvance: !state.autoAdvance })),
  setTimeLeft: (time) => set({ timeLeft: time }),

  tick: (navigateFn) => {
    const { isPlaying, timeLeft, autoAdvance, nextStep } = get();
    if (!isPlaying) return;

    if (timeLeft > 1) {
      set({ timeLeft: timeLeft - 1 });
    } else {
      if (autoAdvance) {
        nextStep(navigateFn);
      } else {
        set({ isPlaying: false }); // Pause at the end of step
      }
    }
  },

  setLoginOverlay: (show) => set({ showLoginOverlay: show }),
  setAcquisitionOverlay: (show) => set({ showAcquisitionOverlay: show }),
  setSplashOverlay: (show) => set({ showSplashOverlay: show }),
  setHighlightedElement: (highlight) => set({ highlightedElement: highlight }),
  setSimulatedChatText: (text) => set({ simulatedChatText: text }),
  setSimulatingTyping: (typing) => set({ isSimulatingTyping: typing }),
}));
