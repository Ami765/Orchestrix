import React from "react";
import { Layers, Briefcase } from "lucide-react";
import { useWorkspaceStore } from "../store";
import { useAnalysis } from "../hooks";
import AgentCard from "../components/AgentCard";
import PipelineVisualizer from "../components/PipelineVisualizer";
import TimelineView from "../components/TimelineView";

export default function Agents() {
  const db = useWorkspaceStore((state) => state.db);
  const { runningAnalysis } = useAnalysis();

  if (!db) return null;

  return (
    <div className="space-y-6 animate-fade-in" id="agents_view">
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-xl font-display font-bold text-white">Orchestrix Swarm Specialists</h1>
        <p className="text-xs text-gray-400 mt-1">Configure, inspect, or trace active tasks executing across individual AI node specialists.</p>
      </div>

      {/* Swarm Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {db.agents.map((agent) => (
          <AgentCard 
            key={agent.id} 
            agent={agent} 
            activeAnalysis={runningAnalysis}
          />
        ))}
      </div>

      {/* Dual screen live pipelines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Left: Swarm Flow Visual Pipeline */}
        <div className="bg-[#131826] border border-white/10 rounded-xl p-5 space-y-4 shadow-xl shadow-black/40">
          <div className="border-b border-white/5 pb-2">
            <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Swarm Flow Tracker
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {runningAnalysis ? `Tracking: ${runningAnalysis.title}` : "System idle. Observing template baseline."}
            </p>
          </div>

          <PipelineVisualizer 
            stages={runningAnalysis ? runningAnalysis.stages : []} 
            currentStageIndex={runningAnalysis ? runningAnalysis.currentStageIndex : 0}
          />
        </div>

        {/* Right: Stage timeline log */}
        <div className="bg-[#131826] border border-white/10 rounded-xl p-5 space-y-4 shadow-xl shadow-black/40">
          <div className="border-b border-white/5 pb-2">
            <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-violet-400" />
              Collaboration Audit Timeline
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Inspect precise logs parsed at each individual agent handshake loop.
            </p>
          </div>

          <TimelineView 
            stages={runningAnalysis ? runningAnalysis.stages : (db.analyses[0] ? db.analyses[0].stages : [])} 
            currentStageIndex={runningAnalysis ? runningAnalysis.currentStageIndex : (db.analyses[0] ? db.analyses[0].currentStageIndex : 4)}
          />
        </div>
      </div>
    </div>
  );
}
