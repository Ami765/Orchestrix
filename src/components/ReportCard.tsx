import React from "react";
import { Report } from "../types";
import { AlertTriangle, ShieldCheck, HelpCircle, FileDown } from "lucide-react";

interface ReportCardProps {
  key?: React.Key;
  report: Report;
  onSelect: (report: Report) => void;
}

export default function ReportCard({ report, onSelect }: ReportCardProps) {
  const getRiskStyles = (risk: "Low" | "Moderate" | "High") => {
    switch (risk) {
      case "High":
        return {
          barColor: "bg-rose-500",
          badgeColor: "bg-rose-500/10 border-rose-500/20 text-rose-400",
          icon: <AlertTriangle className="w-3.5 h-3.5" />
        };
      case "Moderate":
        return {
          barColor: "bg-amber-500",
          badgeColor: "bg-amber-500/10 border-amber-500/20 text-amber-400",
          icon: <AlertTriangle className="w-3.5 h-3.5" />
        };
      default:
        return {
          barColor: "bg-emerald-500",
          badgeColor: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
          icon: <ShieldCheck className="w-3.5 h-3.5" />
        };
    }
  };

  const { barColor, badgeColor, icon } = getRiskStyles(report.riskRating);

  return (
    <div
      onClick={() => onSelect(report)}
      className="bg-[#131826] border border-white/10 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:border-indigo-500/30 hover:-translate-y-0.5 flex flex-col justify-between"
    >
      <div className={`h-[3px] w-full ${barColor}`} />

      <div className="p-4 flex-1">
        <div className="text-xs text-gray-400 font-mono mb-1">{report.date}</div>
        <div className="text-base font-bold text-white tracking-tight">{report.company}</div>
        <div className="text-[11px] text-indigo-400 font-mono mt-0.5">{report.title}</div>
        
        <p className="text-xs text-gray-300 line-clamp-3 mt-3 bg-white/5 border border-white/10 rounded-lg p-2 leading-relaxed">
          {report.text || "No report body generated."}
        </p>
      </div>

      <div className="px-4 pb-4 pt-2 border-t border-white/5 flex items-center justify-between">
        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold flex items-center gap-1 ${badgeColor}`}>
          {icon}
          {report.riskRating} Risk
        </span>
        <span className="text-[10px] text-gray-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full font-mono">
          {report.status}
        </span>
      </div>
    </div>
  );
}
