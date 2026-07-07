import React from "react";
import { Agent } from "../types";
import { Play, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";

interface AgentCardProps {
  key?: React.Key;
  agent: Agent;
  activeAnalysis?: {
    currentStageIndex: number;
    stages: { name: string; status: string; agent: string }[];
  } | null;
}

export default function AgentCard({ agent, activeAnalysis }: AgentCardProps) {
  const isBusy = agent.status === "busy";
  const isFailed = agent.status === "failed";
  
  // Find current active stage if this agent is working on it
  let currentProgress = 0;
  let progressText = "Idle";
  if (isBusy && activeAnalysis) {
    const totalStages = activeAnalysis.stages.length;
    const currentIdx = activeAnalysis.currentStageIndex;
    currentProgress = Math.round(((currentIdx + 0.5) / totalStages) * 100);
    progressText = `Analyzing · ${currentProgress}%`;
  } else if (agent.status === "completed") {
    currentProgress = 100;
    progressText = "Completed · 100%";
  }

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-white/10 bg-[#131826] p-4 flex flex-col gap-3 transition-all duration-300 hover:border-indigo-500/50 ${
        isBusy ? "border-cyan-500/40 shadow-[0_0_15px_rgba(47,217,232,0.15)]" : ""
      }`}
    >
      {/* Scanline effect for active agent */}
      {isBusy && (
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 animate-pulse" />
      )}

      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm text-[#0A0D16] shrink-0 bg-gradient-to-br ${
            agent.color ? agent.color : "from-indigo-400 to-violet-500"
          }`}
        >
          {agent.code}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold flex items-center gap-2 text-white truncate">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                isBusy
                  ? "bg-[#2FD9E8] shadow-[0_0_8px_#2FD9E8] animate-ping"
                  : isFailed
                  ? "bg-rose-500"
                  : agent.status === "completed"
                  ? "bg-emerald-500"
                  : "bg-gray-500"
              }`}
            />
            {agent.name}
          </div>
          <div className="text-xs text-gray-400 truncate">{agent.role}</div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs font-mono text-gray-300">
        <span>{isBusy ? "Status: Active" : `Status: ${agent.status.toUpperCase()}`}</span>
        <span>{progressText}</span>
      </div>

      {/* Progress track */}
      <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500`}
          style={{ width: `${isBusy ? currentProgress : agent.status === "completed" ? 100 : 0}%` }}
        />
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {isBusy ? (
          <>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-medium">
              🧠 Memory Synced
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 font-medium">
              ⚡ Executing
            </span>
          </>
        ) : isFailed ? (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 font-medium flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Action required
          </span>
        ) : (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400 font-medium">
            💤 Standing by
          </span>
        )}
      </div>

      <div className="flex justify-between items-center text-[11px] font-mono text-gray-500 border-t border-white/5 pt-2 mt-1">
        <span>Runtime {agent.runtime}</span>
        <span className="truncate max-w-[120px]">Task: {agent.lastTask || "None"}</span>
      </div>
    </div>
  );
}
