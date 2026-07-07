import React from "react";
import { 
  AreaChart, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Area, 
  ResponsiveContainer 
} from "recharts";
import { useWorkspaceStore } from "../store";
import { ACTIVITY_DATA } from "../constants/activity";

export default function Workflows() {
  const db = useWorkspaceStore((state) => state.db);

  if (!db) return null;

  return (
    <div className="space-y-6 animate-fade-in" id="workflows_view">
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-xl font-display font-bold text-white">Swarm Agent Directives</h1>
        <p className="text-xs text-gray-400 mt-1">Design, audit, or assign reusable execution pipelines mapped to dedicated specialists.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {db.workflows.map((wf) => (
          <div key={wf.id} className="bg-[#131826] border border-white/10 rounded-xl p-4 flex flex-col gap-3 justify-between shadow-lg">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white tracking-tight">{wf.name}</h3>
                <span className="text-[10px] bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full font-mono">
                  {wf.agentCount} Agents
                </span>
              </div>
              <p className="text-xs text-gray-300 leading-normal pt-1">{wf.description}</p>
            </div>

            <div className="border-t border-white/5 pt-3 flex flex-wrap gap-1.5">
              {wf.agents.map((agName, i) => (
                <span key={i} className="text-[10px] bg-white/5 px-2 py-0.5 rounded border border-white/10 text-gray-400 font-mono">
                  {agName}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Workflow Analytics Line Chart */}
      <div className="bg-[#131826] border border-white/10 rounded-xl p-5 space-y-4 shadow-xl shadow-black/40">
        <div className="border-b border-white/5 pb-3">
          <h3 className="text-sm font-bold text-white font-display">Weekly Pipeline Activity Index</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Analyses processed by Orchestrix workflows over previous days.</p>
        </div>

        <div className="h-56 w-full pt-4 font-mono text-[10px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={ACTIVITY_DATA}>
              <defs>
                <linearGradient id="colorAnalyses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7B6CFA" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#7B6CFA" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#5C6479" />
              <YAxis stroke="#5C6479" />
              <Tooltip 
                contentStyle={{ backgroundColor: "#131826", borderColor: "rgba(255,255,255,0.08)", borderRadius: "8px" }}
                itemStyle={{ color: "#2FD9E8" }}
                labelStyle={{ color: "#FFF" }}
              />
              <Area type="monotone" dataKey="analyses" stroke="#7B6CFA" strokeWidth={2} fillOpacity={1} fill="url(#colorAnalyses)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
