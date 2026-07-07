import { FileText, Brain, ShieldAlert, CheckSquare, Settings } from "lucide-react";
import { Stage } from "../types";

interface PipelineVisualizerProps {
  stages: Stage[];
  currentStageIndex: number;
}

export default function PipelineVisualizer({ stages, currentStageIndex }: PipelineVisualizerProps) {
  // If no stages, display a default standard template pipeline
  const renderStages = stages && stages.length > 0 ? stages : [
    { name: "Document Parsing", agent: "Document Parser", status: "completed", result: "" },
    { name: "Financial Review", agent: "Financial Reviewer", status: "completed", result: "" },
    { name: "Risk Assessment", agent: "Risk Assessor", status: "completed", result: "" },
    { name: "Executive Summary", agent: "Decision Summarizer", status: "active", result: "" }
  ];

  const getIcon = (agent: string, status: string) => {
    const isCompleted = status === "completed";
    const isActive = status === "active";
    
    let colorClass = "text-indigo-400";
    if (isCompleted) colorClass = "text-emerald-400";
    else if (isActive) colorClass = "text-cyan-400";

    const style = "w-5 h-5 " + colorClass;

    if (agent.includes("Parser")) return <FileText className={style} />;
    if (agent.includes("Reviewer") || agent.includes("Financial")) return <Brain className={style} />;
    if (agent.includes("Assessor") || agent.includes("Risk")) return <ShieldAlert className={style} />;
    return <CheckSquare className={style} />;
  };

  return (
    <div className="flex flex-col items-center gap-0 w-full max-w-md mx-auto py-3 relative">
      {renderStages.map((stage, idx) => {
        const isCompleted = stage.status === "completed" || idx < currentStageIndex;
        const isActive = stage.status === "active" || idx === currentStageIndex;
        const isPending = !isCompleted && !isActive;

        return (
          <div key={idx} className="flex flex-col items-center w-full">
            {/* Connector Line before this node (if not first) */}
            {idx > 0 && (
              <div className={`w-[2px] h-7 relative overflow-hidden ${isCompleted ? "bg-emerald-500" : isActive ? "bg-cyan-500" : "bg-white/10"}`}>
                {(isActive || isCompleted) && (
                  <div 
                    className="absolute left-[-2px] w-[6px] h-[6px] rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-bounce"
                    style={{ animationDuration: "2s", animationDelay: `${idx * 0.3}s` }}
                  />
                )}
              </div>
            )}

            {/* Node block */}
            <div
              className={`flex items-center gap-4 w-full p-3 rounded-xl border bg-[#131826] transition-all duration-300 ${
                isActive
                  ? "border-cyan-500/40 shadow-[0_0_15px_rgba(47,217,232,0.12)] bg-[#171e30]"
                  : isCompleted
                  ? "border-emerald-500/30"
                  : "border-white/5 opacity-50"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                  isCompleted
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : isActive
                    ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]"
                    : "bg-white/5 border-white/10 text-gray-400"
                }`}
              >
                {getIcon(stage.agent, stage.status)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-white truncate flex items-center gap-2">
                  {stage.name}
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  )}
                </div>
                <div className="text-[11px] text-gray-400 font-mono truncate">
                  {stage.agent} · {stage.status.toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
