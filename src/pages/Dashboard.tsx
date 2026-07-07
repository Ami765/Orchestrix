import React from "react";
import { 
  Plus, 
  Users, 
  Clock, 
  Activity, 
  FileText, 
  BookOpen, 
  Sparkles, 
  Layers, 
  ChevronRight,
  FileUp,
  GitBranch
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useWorkspaceStore, useUIStore } from "../store";
import { useAgents, useReports, useAnalysis } from "../hooks";
import MetricCard from "../components/MetricCard";

export default function Dashboard() {
  const navigate = useNavigate();
  
  // Zustand State hooks
  const db = useWorkspaceStore((state) => state.db);
  const { setAnalysisTab } = useUIStore();
  const { agents, onlineCount } = useAgents();
  const { reports } = useReports();
  const { runningAnalysis } = useAnalysis();

  if (!db) return null;

  const busyAgentsCount = agents.filter(a => a.status === "busy").length;
  const readyAgentsCount = agents.length - busyAgentsCount;

  return (
    <div className="space-y-6 animate-fade-in" id="dashboard_view">
      
      {/* Hero Dashboard Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-2xl border border-white/10 overflow-hidden bg-gradient-to-br from-[#141A2B] via-[#171227] to-[#0F1A26] p-6 lg:p-8 shadow-2xl shadow-indigo-950/40"
      >
        <div className="absolute inset-0 bg-radial-mesh opacity-[0.1] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="text-xs font-mono tracking-widest text-cyan-400 uppercase">SWARM DEPLOYMENT PORTAL</div>
            <h1 className="text-2xl lg:text-3xl font-display font-extrabold text-white tracking-tight flex items-center gap-3">
              Mission Control Online
            </h1>
            <p className="text-sm text-gray-300 max-w-lg">
              Your multi-agent Orchestrix swarm is fully operational and synchronized.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
            <motion.button 
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setAnalysisTab("paste");
                navigate("/analysis");
              }}
              className="relative px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 text-[#0A0D16] font-display font-black text-sm shadow-[0_0_20px_rgba(123,108,250,0.5)] hover:shadow-[0_0_30px_rgba(123,108,250,0.7)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2.5 shrink-0 cursor-pointer animate-pulse-glow"
            >
              <Plus className="w-4 h-4 text-[#0A0D16] stroke-[2.5]" />
              Dispatch Swarm
            </motion.button>
            <span className="text-[10px] font-mono text-gray-400">average response cycle · 26s</span>
          </div>
        </div>

        {/* Operational Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/5">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-1 shadow-inner">
            <span className="text-[10px] text-gray-400 font-mono">⬢ SYSTEM STATE</span>
            <span className="text-sm font-bold text-cyan-400 font-display flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
              Fully Swarmed
            </span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-1 shadow-inner">
            <span className="text-[10px] text-gray-400 font-mono">SWARM READINESS</span>
            <span className="text-sm font-bold text-white font-display">{readyAgentsCount} Agents Ready</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-1 shadow-inner">
            <span className="text-[10px] text-gray-400 font-mono">PENDING RUNS</span>
            <span className="text-sm font-bold text-indigo-400 font-display">{runningAnalysis ? "1 Processing" : "0 Pending Jobs"}</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-1 shadow-inner">
            <span className="text-[10px] text-gray-400 font-mono">ACCURACY THRESHOLD</span>
            <span className="text-sm font-bold text-white font-display">96.4% Success</span>
          </div>
        </div>
      </motion.div>

      {/* Metric strip - animated stagger load */}
      <div>
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest font-mono mb-3">WORKSPACE METRIC STRIP</div>
        <motion.div 
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.05
              }
            }
          }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3"
        >
          <motion.div variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }}>
            <MetricCard 
              label="Active Agents" 
              value={busyAgentsCount} 
              icon={<Users className="w-4 h-4 text-cyan-400" />} 
              colorClass="text-cyan-400 bg-cyan-500/10"
              glowColor="rgba(47,217,232,0.15)"
            />
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }}>
            <MetricCard 
              label="Avg Decision" 
              value="26 sec" 
              icon={<Clock className="w-4 h-4 text-indigo-400" />} 
              colorClass="text-indigo-400 bg-indigo-500/10"
              glowColor="rgba(123,108,250,0.15)"
            />
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }}>
            <MetricCard 
              label="Tokens Run" 
              value="4.2M" 
              icon={<Activity className="w-4 h-4 text-emerald-400" />} 
              colorClass="text-emerald-400 bg-emerald-500/10"
              glowColor="rgba(16,185,129,0.15)"
            />
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }}>
            <MetricCard 
              label="Reports Total" 
              value={reports.length} 
              icon={<FileText className="w-4 h-4 text-violet-400" />} 
              colorClass="text-violet-400 bg-violet-500/10"
              glowColor="rgba(139,92,246,0.15)"
            />
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }}>
            <MetricCard 
              label="Data Sources" 
              value={db.knowledge.length} 
              icon={<BookOpen className="w-4 h-4 text-amber-400" />} 
              colorClass="text-amber-400 bg-amber-500/10"
              glowColor="rgba(245,158,11,0.15)"
            />
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }}>
            <MetricCard 
              label="Confidence" 
              value="96.2%" 
              icon={<Sparkles className="w-4 h-4 text-cyan-300" />} 
              colorClass="text-cyan-300 bg-cyan-400/10"
              glowColor="rgba(34,211,238,0.15)"
            />
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }}>
            <MetricCard 
              label="Efficiency" 
              value="91%" 
              icon={<Layers className="w-4 h-4 text-rose-400" />} 
              colorClass="text-rose-400 bg-rose-500/10"
              glowColor="rgba(244,63,94,0.15)"
            />
          </motion.div>
        </motion.div>
      </div>

      {/* AI Insight Callout Card */}
      <div className="rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-violet-500/5 to-cyan-500/5 p-4 flex gap-4 items-start shadow-md shadow-indigo-950/20">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(123,108,250,0.4)]">
          <Sparkles className="w-5 h-5 text-[#0A0D16]" />
        </div>
        <div>
          <div className="text-[11px] font-mono tracking-widest text-cyan-400 font-semibold uppercase">SWARM REAL-TIME OUTCOME INSIGHT</div>
          <p className="text-xs text-gray-100 leading-relaxed mt-1">
            Vendor renewal terms in <strong className="text-cyan-300">Northgate Holdings</strong> represent a <strong className="text-amber-300">87% financial parity</strong> with a credit guideline breach encountered during Q1 audit. Risk Assessor flagged Section 14 auto-renewal rate parameters for immediate review before final lock.
          </p>
        </div>
      </div>

      {/* Quick Action Navigation Strip */}
      <div>
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest font-mono mb-3">SWARM OPERATIONS BAR</div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <button 
            onClick={() => { setAnalysisTab("upload"); navigate("/analysis"); }}
            className="p-4 rounded-xl border border-white/5 bg-[#131826] text-left hover:border-indigo-500/30 hover:-translate-y-0.5 shadow-lg shadow-black/30 transition-all group shrink-0 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 group-hover:bg-indigo-500 group-hover:text-[#0A0D16] transition-all">
              <FileUp className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-white mt-3">Upload Source Documents</div>
            <div className="text-[10px] text-gray-400 mt-1">Process PDFs, CSVs, and Excel logs</div>
          </button>

          <button 
            onClick={() => navigate("/workflows")}
            className="p-4 rounded-xl border border-white/5 bg-[#131826] text-left hover:border-cyan-500/30 hover:-translate-y-0.5 shadow-lg shadow-black/30 transition-all group shrink-0 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 group-hover:bg-cyan-400 group-hover:text-[#0A0D16] transition-all">
              <GitBranch className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-white mt-3">Build Agent Workflows</div>
            <div className="text-[10px] text-gray-400 mt-1">Customize pipeline specialists</div>
          </button>

          <button 
            onClick={() => navigate("/agents")}
            className="p-4 rounded-xl border border-white/5 bg-[#131826] text-left hover:border-emerald-500/30 hover:-translate-y-0.5 shadow-lg shadow-black/30 transition-all group shrink-0 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 group-hover:bg-emerald-500 group-hover:text-[#0A0D16] transition-all">
              <Users className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-white mt-3">Review Specializations</div>
            <div className="text-[10px] text-gray-400 mt-1">Inspect online agent nodes</div>
          </button>

          <button 
            onClick={() => navigate("/reports")}
            className="p-4 rounded-xl border border-white/5 bg-[#131826] text-left hover:border-violet-500/30 hover:-translate-y-0.5 shadow-lg shadow-black/30 transition-all group shrink-0 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center shrink-0 group-hover:bg-violet-500 group-hover:text-[#0A0D16] transition-all">
              <FileText className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-white mt-3">Analyze Saved Reports</div>
            <div className="text-[10px] text-gray-400 mt-1">Export diligence logs and findings</div>
          </button>
        </div>
      </div>

      {/* Recent Runs and Live Status columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Recent analyses list */}
        <div className="bg-[#131826] border border-white/10 rounded-xl p-5 space-y-4 shadow-xl shadow-black/40">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Recent Diligence Analyses
            </h3>
            <button 
              onClick={() => navigate("/history")} 
              className="text-xs text-cyan-400 font-medium hover:underline flex items-center gap-1 cursor-pointer"
            >
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-white/5">
            {db.analyses.slice(0, 3).map((an) => (
              <div key={an.id} className="py-3 flex items-center justify-between group first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-xs text-gray-400 font-mono group-hover:bg-white/10 transition-all shrink-0">
                    📁
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white leading-tight">{an.title}</div>
                    <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                      {an.workflowName} · {new Date(an.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                    </div>
                  </div>
                </div>

                <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-semibold ${
                  an.riskRating === "High"
                    ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                    : an.riskRating === "Moderate"
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                }`}>
                  {an.riskRating} Risk
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Live Agent Status Summary */}
        <div className="bg-[#131826] border border-white/10 rounded-xl p-5 space-y-4 shadow-xl shadow-black/40">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
              <Activity className="w-4 h-4 text-violet-400" />
              Swarm Agent State
            </h3>
            <button 
              onClick={() => navigate("/agents")} 
              className="text-xs text-violet-400 font-medium hover:underline flex items-center gap-1 cursor-pointer"
            >
              Interactive pipeline <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-white/5">
            {agents.slice(0, 3).map((agent) => (
              <div key={agent.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-bold text-xs shrink-0 text-white`}>
                    {agent.code}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white leading-tight">{agent.name}</div>
                    <div className="text-[10px] text-gray-400 font-mono mt-0.5 truncate max-w-[150px]">
                      {agent.role}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] text-gray-400 font-mono">
                    {agent.status === "busy" ? "Busy" : "Ready"}
                  </span>
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    agent.status === "busy" 
                      ? "bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-ping" 
                      : "bg-emerald-500"
                  }`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
