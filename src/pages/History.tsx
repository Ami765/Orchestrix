import React from "react";
import { useWorkspaceStore, useUIStore } from "../store";

export default function History() {
  const db = useWorkspaceStore((state) => state.db);
  const { setSelectedReport, setSelectedAnalysis } = useUIStore();

  if (!db) return null;

  return (
    <div className="space-y-6 animate-fade-in" id="history_view">
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-xl font-display font-bold text-white">Swarm Diligence History</h1>
        <p className="text-xs text-gray-400 mt-1">Audit logs of all executing and past Orchestrix multi-agent workspace pipelines.</p>
      </div>

      <div className="bg-[#131826] border border-white/10 rounded-xl overflow-hidden shadow-2xl shadow-black/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-gray-400 font-mono text-[10px] uppercase select-none">
                <th className="p-4">Diligence Analysis Name</th>
                <th className="p-4">Agent Workflow</th>
                <th className="p-4">Date Run</th>
                <th className="p-4">Outcome Risk</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {db.analyses.map((an) => (
                <tr key={an.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-bold text-white">{an.title}</td>
                  <td className="p-4 text-gray-300 font-mono text-[11px]">{an.workflowName}</td>
                  <td className="p-4 text-gray-400">
                    {new Date(an.createdAt).toLocaleDateString("en-US", { 
                      month: "short", 
                      day: "numeric", 
                      year: "numeric", 
                      hour: "2-digit", 
                      minute: "2-digit" 
                    })}
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-semibold ${
                      an.riskRating === "High"
                        ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                        : an.riskRating === "Moderate"
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                        : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    }`}>
                      {an.riskRating} Risk
                    </span>
                  </td>
                  <td className="p-4 font-mono">
                    <span className={`text-[10px] ${
                      an.status === "completed" 
                        ? "text-emerald-400" 
                        : an.status === "running" 
                        ? "text-cyan-400 animate-pulse font-bold" 
                        : "text-rose-500"
                    }`}>
                      {an.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {an.reportId ? (
                      <button
                        onClick={() => {
                          const rep = db.reports.find((r) => r.id === an.reportId);
                          if (rep) setSelectedReport(rep);
                        }}
                        className="text-cyan-400 hover:underline hover:text-cyan-300 font-semibold cursor-pointer bg-transparent border-none p-0"
                      >
                        Open Report
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedAnalysis(an);
                        }}
                        className="text-gray-400 hover:underline hover:text-white font-semibold cursor-pointer bg-transparent border-none p-0"
                      >
                        Inspect Stages
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
