import React from "react";
import { FileDown } from "lucide-react";
import { useWorkspaceStore, useUIStore } from "../store";
import ReportCard from "../components/ReportCard";

export default function Reports() {
  const db = useWorkspaceStore((state) => state.db);
  const { setSelectedReport } = useUIStore();

  if (!db) return null;

  return (
    <div className="space-y-6 animate-fade-in" id="reports_view">
      <div className="border-b border-white/5 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-white">Executive Diligence Reports</h1>
          <p className="text-xs text-gray-400 mt-1">Direct synthesis files compiling final multi-agent swarm analysis parameters.</p>
        </div>
        <button className="px-3.5 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 text-xs font-mono font-medium text-gray-300 hover:text-white flex items-center gap-1.5 cursor-pointer">
          <FileDown className="w-4 h-4" /> Export All (PDF)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {db.reports.map((report) => (
          <ReportCard 
            key={report.id} 
            report={report} 
            onSelect={(rep) => setSelectedReport(rep)} 
          />
        ))}
      </div>
    </div>
  );
}
