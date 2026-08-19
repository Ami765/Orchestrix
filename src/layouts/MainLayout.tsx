import React, { useEffect, useState, useRef } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Activity,
  Plus,
  History as HistoryIcon,
  FileText,
  Users,
  BookOpen,
  GitBranch,
  Settings as SettingsIcon,
  Bell,
  Search,
  Moon,
  Sun,
  Layers,
  X,
  Sparkles,
  Download,
  CheckCircle,
  FileDown
} from "lucide-react";
import { useWorkspaceStore, useUIStore, useThemeStore } from "../store";
import { downloadReportAsFile } from "../utils/reportDownloader";
import DocumentPreview from "../components/DocumentPreview";

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Zustand State hooks
  const { isDarkMode, toggleTheme } = useThemeStore();
  const {
    rightCollapsed,
    toggleRightCollapsed,
    settingsForm,
    selectedReport,
    setSelectedReport,
    selectedAnalysis,
    setSelectedAnalysis,
  } = useUIStore();

  const {
    db,
    telemetry,
    fetchDb,
    fetchTraces,
    setupSSE,
    clearNotifications,
    resetDemoState,
  } = useWorkspaceStore();

  const [justCompletedReport, setJustCompletedReport] = useState<any | null>(null);
  const prevRunningIdRef = useRef<string | null>(null);

  // Monitor when an active analysis completes
  useEffect(() => {
    if (!db) return;
    
    // Find active running analysis
    const activeRun = db.analyses.find(a => a.status === "running");
    
    if (activeRun) {
      // Store current running analysis ID
      prevRunningIdRef.current = activeRun.id;
    } else if (prevRunningIdRef.current) {
      // We had a running analysis, but now there is no active run. It must have finished!
      const finishedId = prevRunningIdRef.current;
      prevRunningIdRef.current = null; // reset ref
      
      const finishedAnalysis = db.analyses.find(a => a.id === finishedId);
      if (finishedAnalysis && finishedAnalysis.status === "completed") {
        // Retrieve the completed report
        const matchingReport = db.reports.find(r => r.analysisId === finishedId);
        if (matchingReport) {
          // Trigger the beautiful completion dialog!
          setJustCompletedReport(matchingReport);
        }
      }
    }
  }, [db]);

  // Initialize and synchronize global states on mount
  useEffect(() => {
    fetchDb();
    fetchTraces();
    const cleanupSSE = setupSSE();
    return () => {
      cleanupSSE();
    };
  }, [fetchDb, fetchTraces, setupSSE]);

  if (!db) {
    return (
      <div className="min-h-screen bg-[#0A0D16] flex items-center justify-center font-display text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 shadow-lg animate-spin">
            <div className="w-8 h-8 rounded-lg bg-[#0A0D16] flex items-center justify-center">
              <span className="text-sm font-bold text-cyan-400">O</span>
            </div>
          </div>
          <div className="text-sm font-mono text-cyan-400 animate-pulse tracking-widest">ORCHESTRIX OPERATING SYSTEM LOAD...</div>
        </div>
      </div>
    );
  }

  // Find if there is an active running analysis
  const runningAnalysis = db.analyses.find(a => a.status === "running") || null;
  const activeAgent = db.agents.find(a => a.status === "busy") || null;

  // Active path matcher
  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    return location.pathname === path;
  };

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-300 font-sans ${isDarkMode ? "bg-[#0A0D16] text-[#EDEFF7]" : "bg-slate-50 text-slate-900"}`}>
      
      {/* Background glowing mesh meshes */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-220px] left-[-160px] w-[640px] h-[640px] rounded-full blur-[140px] bg-indigo-600/10 animate-pulse animate-duration-10000" />
        <div className="absolute bottom-[-260px] right-[-180px] w-[640px] h-[640px] rounded-full blur-[140px] bg-cyan-500/10 animate-pulse animate-duration-8000" />
        <div className="absolute inset-0 bg-radial-mesh opacity-[0.05]" 
             style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)", backgroundSize: "26px 26px" }} />
      </div>

      <div className={`relative z-10 flex flex-col h-screen overflow-hidden ${isDarkMode ? "" : "light-theme"}`}>
        
        {/* ==================== TOP NAVIGATION ==================== */}
        <header className={`h-16 flex items-center justify-between px-6 border-b shrink-0 z-20 transition-all ${
          isDarkMode 
            ? "bg-[#0A0D16]/90 border-white/5 text-white backdrop-blur-md" 
            : "bg-white border-slate-200 text-slate-800 shadow-sm"
        }`}>
          <div className="flex items-center gap-5">
            <Link to="/" className="flex items-center gap-2.5 select-none cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 flex items-center justify-center font-display font-extrabold text-white text-[15px] shadow-[0_0_18px_rgba(123,108,250,0.45)]">
                O
              </div>
              <span className={`font-display font-bold text-lg tracking-tight transition-colors ${isDarkMode ? "text-white" : "text-slate-900"}`}>Orchestrix</span>
            </Link>
            
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono transition-all ${
              isDarkMode 
                ? "bg-white/5 border border-white/10 text-gray-300" 
                : "bg-emerald-50 border border-emerald-200 text-emerald-800"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isDarkMode ? "bg-cyan-400" : "bg-emerald-500"} ${runningAnalysis ? "animate-ping" : "animate-pulse"}`} />
              {runningAnalysis ? "Swarm actively running" : "Swarm standby"}
            </div>
          </div>

          <div className={`flex-1 max-w-md mx-8 hidden md:flex items-center gap-2 border rounded-lg px-3 py-2 text-xs transition-all ${
            isDarkMode 
              ? "bg-white/5 border-white/10 text-gray-400" 
              : "bg-slate-50 border-slate-200 text-slate-500"
          }`}>
            <Search className="w-4 h-4 shrink-0" />
            <input 
              type="text" 
              placeholder="Search reports, analyses, agents, or guidelines..." 
              className={`bg-transparent border-none outline-none w-full placeholder:text-gray-500 ${isDarkMode ? "text-white animate-none" : "text-slate-800 animate-none"}`}
            />
          </div>

          <div className="flex items-center gap-4">
            {/* Theme switcher */}
            <div className={`border rounded-full p-0.5 flex gap-1 ${isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-100 border-slate-200"}`}>
              <button 
                onClick={toggleTheme} 
                className={`p-1.5 rounded-full transition-all ${isDarkMode ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                title="Dark Theme"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={toggleTheme} 
                className={`p-1.5 rounded-full transition-all ${!isDarkMode ? "bg-white text-slate-800 shadow-sm" : "text-gray-400 hover:text-white"}`}
                title="Light Theme"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Notification alert */}
            <button 
              onClick={toggleRightCollapsed}
              className={`relative p-2 rounded-lg border cursor-pointer transition-all shrink-0 ${
                isDarkMode 
                  ? "bg-white/5 border-white/10 hover:border-white/20 text-gray-400 hover:text-white" 
                  : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-950"
              }`}
            >
              <Bell className="w-4 h-4" />
              {db.notifications.length > 0 && (
                <span className={`absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 animate-pulse border ${isDarkMode ? "border-[#0A0D16]" : "border-white"}`} />
              )}
            </button>

            {/* User profile */}
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 flex items-center justify-center font-display font-bold text-white text-xs shadow-md">
                  {settingsForm.profileName.split(" ").map(n => n[0]).join("")}
                </div>
                {db?.settings?.profile?.emailVerified && (
                  <span className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 border-2 border-[#0A0D16] rounded-full w-3.5 h-3.5 flex items-center justify-center shadow-lg" title="Email Verified Account">
                    <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
              </div>
              <div className="hidden lg:block text-left select-none">
                <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                  {settingsForm.profileName}
                  {db?.settings?.profile?.emailVerified && (
                    <span className="text-[9px] bg-emerald-950 text-emerald-400 px-1 py-0.2 rounded font-mono font-bold uppercase scale-90 border border-emerald-500/20">
                      Verified
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-gray-400 font-mono leading-none">{settingsForm.profileRole}</div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          
          {/* ==================== LEFT COLLAPSIBLE NAVIGATION PORTAL ==================== */}
          <aside className={`w-64 border-r h-full flex flex-col justify-between p-4 shrink-0 transition-all z-20 ${
            isDarkMode 
              ? "bg-[#0A0D16]/95 border-white/5 text-slate-300" 
              : "bg-white border-slate-200 text-slate-700 shadow-sm"
          }`}>
            <nav className="space-y-1.5 flex-1 overflow-y-auto">
              <div className="text-[10px] px-4 font-semibold text-slate-500 font-mono tracking-widest uppercase mb-1">MAIN CHANNELS</div>
              
              <Link 
                to="/"
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/")
                    ? "bg-slate-800 text-white font-bold"
                    : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                <Layers className={`w-4 h-4 ${isActive("/") ? "text-cyan-400" : "text-slate-400"}`} />
                Mission Control
              </Link>

              <Link 
                to="/analysis"
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/analysis")
                    ? "bg-slate-800 text-white font-bold"
                    : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                <Plus className={`w-4 h-4 ${isActive("/analysis") ? "text-violet-400" : "text-slate-400"}`} />
                Dispatch Swarm
              </Link>

              <Link 
                to="/history"
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/history")
                    ? "bg-slate-800 text-white font-bold"
                    : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                <HistoryIcon className={`w-4 h-4 ${isActive("/history") ? "text-cyan-400" : "text-slate-400"}`} />
                Swarm History
              </Link>

              <Link 
                to="/reports"
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/reports")
                    ? "bg-slate-800 text-white font-bold"
                    : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                <FileText className={`w-4 h-4 ${isActive("/reports") ? "text-violet-400" : "text-slate-400"}`} />
                Executive Reports
              </Link>

              <Link 
                to="/ai-hub"
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/ai-hub")
                    ? "bg-slate-800 text-white font-bold"
                    : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                <Sparkles className={`w-4 h-4 ${isActive("/ai-hub") ? "text-cyan-400" : "text-slate-400"}`} />
                AI Voice & Intel
              </Link>

              <div className="h-[1px] bg-slate-800/50 my-2" />
              <div className="text-[10px] px-4 font-semibold text-slate-500 font-mono tracking-widest uppercase">SWARM DESIGNER</div>

              <Link 
                to="/agents"
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/agents")
                    ? "bg-slate-800 text-white font-bold"
                    : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                <Users className={`w-4 h-4 ${isActive("/agents") ? "text-cyan-400" : "text-slate-400"}`} />
                Specialists
              </Link>

              <Link 
                to="/knowledge"
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/knowledge")
                    ? "bg-slate-800 text-white font-bold"
                    : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                <BookOpen className={`w-4 h-4 ${isActive("/knowledge") ? "text-violet-400" : "text-slate-400"}`} />
                Knowledge Base
              </Link>

              <Link 
                to="/workflows"
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/workflows")
                    ? "bg-slate-800 text-white font-bold"
                    : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                <GitBranch className={`w-4 h-4 ${isActive("/workflows") ? "text-blue-400" : "text-slate-400"}`} />
                Workflows
              </Link>

              <div className="h-[1px] bg-slate-800/50 my-2" />
              <div className="text-[10px] px-4 font-semibold text-slate-500 font-mono tracking-widest uppercase">PRODUCTION STACK</div>

              <Link 
                to="/system-monitor"
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/system-monitor")
                    ? "bg-slate-800 text-white font-bold"
                    : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                <Activity className={`w-4 h-4 ${isActive("/system-monitor") ? "text-cyan-400" : "text-slate-400"}`} />
                System Monitor
              </Link>

              <div className="h-[1px] bg-slate-800/50 my-2" />
              <div className="text-[10px] px-4 font-semibold text-slate-500 font-mono tracking-widest uppercase">CONFIGURATION</div>

              <Link 
                to="/settings"
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/settings")
                    ? "bg-slate-800 text-white font-bold"
                    : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                <SettingsIcon className={`w-4 h-4 ${isActive("/settings") ? "text-blue-400" : "text-slate-400"}`} />
                Configuration
              </Link>
            </nav>

            <div className="flex flex-col gap-3 pt-4 border-t border-slate-800/40">
              <div className="bg-emerald-950/20 rounded-xl p-3 text-xs border border-emerald-500/10 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">SYSTEM OPERATIONAL</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  All compliance & diligence pipelines active. Verified nodes fully synchronized.
                </p>
              </div>

              <div className="text-[11px] font-mono text-slate-400 px-3 flex items-center gap-2 select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {db.agents.filter(a => a.status === "idle").length} agents online
              </div>
            </div>
          </aside>

          {/* ============ MAIN INNER WORKSPACE ============ */}
          <main className="flex-1 h-full overflow-y-auto px-6 py-6 pb-24 relative z-10">
            <Outlet />
          </main>

          {/* ============ COLLAPSIBLE RIGHT ACTIVITY / NOTIFICATIONS LOG ============ */}
          <aside className={`bg-[#0D111C]/95 border-l border-white/5 backdrop-blur-md transition-all duration-300 select-none shrink-0 flex flex-col justify-between ${
            rightCollapsed ? "w-0 overflow-hidden border-l-0 px-0" : "w-64 p-4 shadow-2xl shadow-black/80"
          }`}>
            <div className="space-y-6 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="text-xs font-bold text-white font-display">Activity Monitor</span>
                <button 
                  onClick={clearNotifications}
                  className="text-[10px] text-gray-500 hover:text-white font-mono cursor-pointer"
                >
                  Clear Logs
                </button>
              </div>

              {/* Dynamic Live Status / Typing Indicator */}
              {activeAgent && runningAnalysis && (
                <div className="bg-indigo-950/20 border border-indigo-500/30 rounded-xl p-3 space-y-2 animate-pulse">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">LIVE PROCESSING</span>
                  </div>
                  <div className="text-xs font-bold text-white">{activeAgent.name}</div>
                  <div className="text-[10px] font-mono text-gray-400 animate-pulse">
                    Thinking... Analyzing metrics and guidelines...
                  </div>
                </div>
              )}

              {/* Notification card loop */}
              <div className="space-y-4 font-sans">
                {db.notifications.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 text-xs font-mono">No new logs active.</div>
                ) : (
                  db.notifications.map((notif) => (
                    <div key={notif.id} className="text-xs flex gap-2.5 border-b border-white/5 pb-2.5">
                      <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                        notif.type === "success"
                          ? "bg-emerald-500"
                          : notif.type === "error"
                          ? "bg-rose-500"
                          : "bg-cyan-400"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium leading-relaxed break-words" dangerouslySetInnerHTML={{ __html: notif.text }} />
                        <div className="text-[10px] text-gray-500 font-mono mt-0.5">{notif.time}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="border-t border-white/5 pt-4 shrink-0">
              <div className="text-[10px] text-gray-500 font-mono">SYSTEM CONTAINER: PORT 3000</div>
              <div className="text-[10px] text-gray-500 font-mono mt-0.5">DB STATE: persistent (db.json)</div>
            </div>
          </aside>

        </div>

      </div>

      {/* ==================== DETAIL MODAL: READ EXECUTIVE REPORT ==================== */}
      {selectedReport && (
        <DocumentPreview 
          report={selectedReport} 
          onClose={() => setSelectedReport(null)} 
        />
      )}

      {/* ==================== DETAIL MODAL: INSPECT STAGES ==================== */}
      {selectedAnalysis && (
        <div className="fixed inset-0 bg-[#0A0D16]/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#131826] border border-white/10 rounded-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto shadow-2xl p-6 relative">
            <button 
              onClick={() => setSelectedAnalysis(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white transition-all cursor-pointer shadow-sm"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-display font-bold text-white tracking-tight">{selectedAnalysis.title}</h2>
                <div className="text-xs text-gray-400 font-mono mt-0.5">Workflow: {selectedAnalysis.workflowName}</div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Stage Audit Traces</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2 divide-y divide-white/5">
                  {selectedAnalysis.stages.map((stg, i) => (
                    <div key={i} className="pt-2.5 first:pt-0">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white">{stg.name}</span>
                        <span className="text-[10px] font-mono text-cyan-400">({stg.agent})</span>
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed mt-1 font-mono">{stg.result || "Awaiting execution sequence."}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-white/5">
                <button 
                  onClick={() => setSelectedAnalysis(null)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white rounded-lg select-none transition-all cursor-pointer"
                >
                  Close Inspect Logs
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== EVENT MODAL: AGENT SWARM PIPELINE COMPLETED ==================== */}
      {justCompletedReport && (
        <div className="fixed inset-0 bg-[#0A0D16]/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#131826] border-2 border-emerald-500/30 rounded-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto shadow-[0_0_50px_rgba(16,185,129,0.15)] p-6 relative">
            
            <button 
              onClick={() => setJustCompletedReport(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white transition-all cursor-pointer shadow-sm"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-emerald-400 font-mono tracking-wider uppercase">SWARM PIPELINE COMPLETE</h3>
                  <p className="text-xs text-gray-400">Multi-agent compliance & diligence synthesis finished successfully.</p>
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-display font-bold text-white tracking-tight">{justCompletedReport.company}</h2>
                    <div className="text-xs text-indigo-400 font-mono font-medium">{justCompletedReport.title}</div>
                  </div>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-semibold ${
                    justCompletedReport.riskRating === "High"
                      ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                      : justCompletedReport.riskRating === "Moderate"
                      ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                      : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  }`}>
                    {justCompletedReport.riskRating} Risk Outcome
                  </span>
                </div>
                
                <div className="bg-[#0A0D16]/80 border border-white/5 rounded-lg p-3 max-h-48 overflow-y-auto">
                  <p className="text-xs text-gray-300 leading-relaxed font-sans">{justCompletedReport.text}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">DIRECT DOWNLOAD & VIEW CHANNELS</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button 
                    onClick={() => downloadReportAsFile(justCompletedReport, "txt")}
                    className="px-3 py-2.5 bg-white/5 hover:bg-indigo-600/20 border border-white/10 rounded-xl text-xs font-mono font-bold text-white transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-400" />
                    Plain Text (.txt)
                  </button>
                  <button 
                    onClick={() => downloadReportAsFile(justCompletedReport, "md")}
                    className="px-3 py-2.5 bg-white/5 hover:bg-violet-600/20 border border-white/10 rounded-xl text-xs font-mono font-bold text-white transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5 text-violet-400" />
                    Markdown (.md)
                  </button>
                  <button 
                    onClick={() => downloadReportAsFile(justCompletedReport, "pdf")}
                    className="px-3 py-2.5 bg-white/5 hover:bg-cyan-600/20 border border-white/10 rounded-xl text-xs font-mono font-bold text-white transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                  >
                    <FileDown className="w-3.5 h-3.5 text-cyan-400" />
                    Print PDF (.pdf)
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 justify-end pt-3 border-t border-white/5">
                <button 
                  onClick={() => {
                    setSelectedReport(justCompletedReport);
                    setJustCompletedReport(null);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-lg select-none transition-all cursor-pointer shadow-[0_4px_12px_rgba(99,102,241,0.3)] flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-4 h-4" /> Open Document Preview
                </button>
                <button 
                  onClick={() => {
                    setJustCompletedReport(null);
                    navigate("/reports");
                  }}
                  className="px-4 py-2 bg-[#131826] hover:bg-white/5 border border-white/10 text-xs font-semibold text-white rounded-lg select-none transition-all cursor-pointer"
                >
                  Go to Diligence Hub
                </button>
                <button 
                  onClick={() => setJustCompletedReport(null)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white rounded-lg select-none transition-all cursor-pointer shadow-[0_4px_12px_rgba(16,185,129,0.3)]"
                >
                  Dismiss
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
