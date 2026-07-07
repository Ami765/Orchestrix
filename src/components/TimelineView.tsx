import { useState } from "react";
import { CheckCircle2, Circle, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Stage } from "../types";

interface TimelineViewProps {
  stages: Stage[];
  currentStageIndex: number;
}

export default function TimelineView({ stages, currentStageIndex }: TimelineViewProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(2); // Default expand current active or interesting one

  const toggleExpand = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <div className="relative pl-7 border-l border-white/10 flex flex-col gap-5 py-2">
      {stages.map((stage, idx) => {
        const isCompleted = stage.status === "completed" || idx < currentStageIndex;
        const isActive = stage.status === "active" || idx === currentStageIndex;
        const isFailed = stage.status === "failed";
        const isPending = !isCompleted && !isActive && !isFailed;
        const isExpanded = expandedIndex === idx;

        return (
          <div key={idx} className="relative flex flex-col gap-2">
            {/* Custom styled Node Icon on the left border line */}
            <div
              className={`absolute left-[-37px] top-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 shrink-0 z-10 ${
                isCompleted
                  ? "bg-[#0A0D16] border-emerald-500 text-emerald-400"
                  : isFailed
                  ? "bg-[#0A0D16] border-rose-500 text-rose-400"
                  : isActive
                  ? "bg-[#0A0D16] border-cyan-400 text-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.4)] animate-pulse"
                  : "bg-[#0A0D16] border-white/10 text-gray-400"
              }`}
            >
              {isCompleted ? "✓" : isFailed ? "!" : isActive ? "●" : idx + 1}
            </div>

            {/* Stage Card */}
            <div
              onClick={() => toggleExpand(idx)}
              className={`rounded-xl border p-3 cursor-pointer transition-all duration-300 ${
                isActive
                  ? "bg-[#171e30] border-cyan-500/30"
                  : isCompleted
                  ? "bg-[#131826]/60 border-white/5 hover:border-white/10"
                  : "bg-transparent border-white/5 opacity-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-[13px] font-semibold text-white">{stage.name}</div>
                <div className="flex items-center gap-1.5 font-mono text-[10px] text-gray-400">
                  <span>{isActive ? "RUNNING" : stage.status.toUpperCase()}</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-gray-500" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-500" />}
                </div>
              </div>

              {isExpanded && (
                <div className="text-[12px] text-gray-300 mt-2 border-t border-white/5 pt-2 leading-relaxed">
                  {stage.result ? (
                    stage.result
                  ) : isActive ? (
                    <span className="text-cyan-400 flex items-center gap-1.5 font-medium">
                      <Circle className="w-2.5 h-2.5 fill-cyan-400 text-cyan-400 animate-ping" />
                      {stage.agent} is actively examining documents and compiling results...
                    </span>
                  ) : (
                    <span className="text-gray-500">Awaiting preceding analysis stages to complete.</span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
