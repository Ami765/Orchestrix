import React, { useState } from "react";
import { Report } from "../types/report";
import { 
  FileText, 
  Download, 
  Printer, 
  X, 
  Copy, 
  Check, 
  Sun, 
  Moon, 
  ShieldCheck, 
  AlertTriangle, 
  FileDown,
  Info,
  Layers,
  Sparkles
} from "lucide-react";
import { downloadReportAsFile } from "../utils/reportDownloader";

interface DocumentPreviewProps {
  report: Report;
  onClose: () => void;
}

export default function DocumentPreview({ report, onClose }: DocumentPreviewProps) {
  const [paperTheme, setPaperTheme] = useState<"light" | "dark">("light");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(report.text || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getRiskStyles = (risk: "Low" | "Moderate" | "High") => {
    switch (risk) {
      case "High":
        return {
          bg: "bg-rose-500/10 border-rose-500/20 text-rose-400",
          lightBg: "bg-rose-50 border-rose-200 text-rose-700",
          indicator: "bg-rose-500",
          icon: <AlertTriangle className="w-4 h-4" />
        };
      case "Moderate":
        return {
          bg: "bg-amber-500/10 border-amber-500/20 text-amber-400",
          lightBg: "bg-amber-50 border-amber-200 text-amber-700",
          indicator: "bg-amber-500",
          icon: <AlertTriangle className="w-4 h-4" />
        };
      default:
        return {
          bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
          lightBg: "bg-emerald-50 border-emerald-200 text-emerald-700",
          indicator: "bg-emerald-500",
          icon: <ShieldCheck className="w-4 h-4" />
        };
    }
  };

  const risk = getRiskStyles(report.riskRating);

  // Parse report.text into paragraphs, headers, list items for a high-fidelity preview
  const lines = (report.text || "").split("\n");
  const parsedBlocks = lines.map((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return { type: "space", content: "", key: index };
    
    // Check if it looks like a markdown header or a title
    if (trimmed.startsWith("###")) {
      return { type: "h3", content: trimmed.replace(/^###\s*/, ""), key: index };
    }
    if (trimmed.startsWith("##")) {
      return { type: "h2", content: trimmed.replace(/^##\s*/, ""), key: index };
    }
    if (trimmed.startsWith("#")) {
      return { type: "h1", content: trimmed.replace(/^#\s*/, ""), key: index };
    }
    
    // Check for bullet list items
    if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
      return { type: "bullet", content: trimmed.replace(/^[-*]\s*/, ""), key: index };
    }

    // Check if it's all uppercase and relatively short (implicit title)
    if (trimmed.length < 60 && trimmed === trimmed.toUpperCase() && !trimmed.match(/[0-9]:/)) {
      return { type: "section-title", content: trimmed, key: index };
    }

    return { type: "paragraph", content: trimmed, key: index };
  });

  return (
    <div className="fixed inset-0 bg-[#0A0D16]/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-50 animate-fade-in" id="full-document-preview-modal">
      <div className="bg-[#131826] border border-white/10 rounded-2xl w-full max-w-5xl h-[95vh] sm:h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* UPPER CONTROLS & HEADER */}
        <div className="border-b border-white/10 px-4 sm:px-6 py-4 flex items-center justify-between bg-[#181E31]/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold tracking-wider text-indigo-400 uppercase">DIGITAL DOCUMENT PREVIEW</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 font-mono font-bold uppercase tracking-wider animate-pulse">VERIFIED SEAL OK</span>
              </div>
              <h2 className="text-base sm:text-lg font-display font-bold text-white tracking-tight leading-tight">{report.company} Digest</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme selector */}
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1 shadow-sm mr-2">
              <button
                onClick={() => setPaperTheme("light")}
                className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
                  paperTheme === "light"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
                title="Switch to light paper theme"
              >
                <Sun className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[10px] font-mono">Paper Light</span>
              </button>
              <button
                onClick={() => setPaperTheme("dark")}
                className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
                  paperTheme === "dark"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
                title="Switch to dark slate theme"
              >
                <Moon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[10px] font-mono">Tech Dark</span>
              </button>
            </div>

            {/* Close button */}
            <button 
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-rose-500/40 text-gray-400 hover:text-rose-400 transition-all cursor-pointer shadow-sm"
              title="Close Document View"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* WORKSPACE & DOCUMENT PANELS */}
        <div className="flex-1 flex overflow-hidden min-h-0 bg-[#0A0D16]">
          
          {/* LEFT COLUMN: Metadata Overview & Actions (hidden on small mobile) */}
          <div className="w-72 border-r border-white/10 bg-[#131826]/60 p-5 overflow-y-auto hidden md:block space-y-6 select-none shrink-0">
            
            {/* Quick Actions */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">PREVIEW CONTROLS</h4>
              
              <button
                onClick={handleCopy}
                className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                  {copied ? "Copied Raw Body!" : "Copy Raw Document"}
                </span>
                <span className="text-[9px] font-mono text-gray-500">CTRL+C</span>
              </button>
            </div>

            {/* Document Signature Info */}
            <div className="space-y-3 pt-4 border-t border-white/5">
              <h4 className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">SWARM COMPLIANCE META</h4>
              <div className="space-y-2.5 bg-white/[0.02] border border-white/5 rounded-xl p-3">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">Document Hash</span>
                  <span className="text-xs font-mono font-medium text-indigo-300 break-all">{report.id}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">Compilation Date</span>
                  <span className="text-xs font-mono font-semibold text-gray-300">{report.date}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">Compliance Status</span>
                  <span className="text-xs font-mono font-semibold text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {report.status || "Verified Complete"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">Risk Level Outcome</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded border w-fit font-mono font-bold uppercase mt-1 ${
                    paperTheme === "light" ? risk.lightBg : risk.bg
                  }`}>
                    {report.riskRating} RISK
                  </span>
                </div>
              </div>
            </div>

            {/* Download and Share formats */}
            <div className="space-y-3 pt-4 border-t border-white/5">
              <h4 className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">DOWNLOAD & PRINT</h4>
              <div className="space-y-2">
                <button 
                  onClick={() => downloadReportAsFile(report, "pdf")}
                  className="w-full px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(99,102,241,0.2)]"
                  title="Export to Adobe PDF Document"
                >
                  <FileDown className="w-4 h-4" /> Save / Print PDF (.pdf)
                </button>
                
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => downloadReportAsFile(report, "txt")}
                    className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-mono font-bold text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    title="Export as plain text"
                  >
                    <Download className="w-3.5 h-3.5" /> TXT
                  </button>
                  <button 
                    onClick={() => downloadReportAsFile(report, "md")}
                    className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-mono font-bold text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    title="Export as markdown format"
                  >
                    <Download className="w-3.5 h-3.5" /> MD
                  </button>
                </div>
              </div>
            </div>

            {/* Certificate Badge */}
            <div className="pt-4 border-t border-white/5">
              <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/10 p-3 flex gap-2.5 items-start">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-[10.5px] leading-relaxed text-slate-400">
                  This analysis was fully compiled by the specialty agent compliance swarm using verified corporate governance ledgers.
                </div>
              </div>
            </div>

          </div>

          {/* MAIN DOCUMENT PAGE VIEWER */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-[#070A10]">
            <div 
              className={`w-full max-w-3xl min-h-[11in] rounded-xl border transition-colors duration-300 shadow-2xl p-6 sm:p-12 relative flex flex-col justify-between ${
                paperTheme === "light"
                  ? "bg-[#FCFCFC] border-slate-200 text-[#1E293B]"
                  : "bg-[#131826] border-white/10 text-[#E2E8F0]"
              }`}
              id="printed-document-canvas"
            >
              {/* WATERMARK STAMP OR BADGE */}
              <div className="absolute top-10 right-10 select-none">
                <div className={`text-[10px] font-mono font-bold border-2 rounded px-2.5 py-1 uppercase tracking-widest leading-none ${
                  paperTheme === "light"
                    ? "border-emerald-600/30 text-emerald-700/60 bg-emerald-50/20"
                    : "border-emerald-500/20 text-emerald-400/40 bg-emerald-950/15"
                }`}>
                  Orchestrix Verified
                </div>
              </div>

              {/* DOCUMENT LAYOUT CONTENT */}
              <div className="space-y-6">
                
                {/* Formal Header */}
                <div className={`pb-6 border-b-2 flex flex-col gap-1 ${
                  paperTheme === "light" ? "border-slate-300" : "border-white/10"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono font-bold tracking-widest uppercase ${
                      paperTheme === "light" ? "text-indigo-600" : "text-indigo-400"
                    }`}>
                      ORCHESTRIX SWARM INTEGRATION ENGINE
                    </span>
                    <span className={`text-[9px] font-mono ${
                      paperTheme === "light" ? "text-slate-400" : "text-slate-500"
                    }`}>
                      SECURE ID: #{report.id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight mt-1 leading-tight">
                    {report.company || "CORPORATE ENTITY ANALYSIS"}
                  </h1>
                  <p className={`text-xs font-mono font-bold uppercase tracking-wider ${
                    paperTheme === "light" ? "text-slate-500" : "text-slate-400"
                  }`}>
                    {report.title || "EXECUTIVE DUE DILIGENCE AUDIT REPORT"}
                  </p>
                </div>

                {/* Meta block for printing/reading */}
                <div className={`grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 border rounded-xl text-xs font-sans ${
                  paperTheme === "light" 
                    ? "bg-slate-50 border-slate-200 text-slate-700" 
                    : "bg-[#0A0D16]/50 border-white/5 text-slate-300"
                }`}>
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase font-mono font-bold text-slate-400">Date Compiled</div>
                    <div className="font-semibold">{report.date}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase font-mono font-bold text-slate-400">Compliance Status</div>
                    <div className="font-semibold text-emerald-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {report.status || "Completed"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase font-mono font-bold text-slate-400">Diligence Index</div>
                    <div className="font-semibold font-mono">SEQ-{report.id.slice(0, 5).toUpperCase()}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase font-mono font-bold text-slate-400">Risk Assessment</div>
                    <div className={`font-bold font-mono uppercase ${
                      report.riskRating === "High" 
                        ? "text-rose-500" 
                        : report.riskRating === "Moderate" 
                        ? "text-amber-500" 
                        : "text-emerald-500"
                    }`}>
                      {report.riskRating} RISK
                    </div>
                  </div>
                </div>

                {/* Beautiful dynamic parsed body blocks */}
                <div className="pt-2 space-y-4 text-sm font-sans leading-relaxed text-justify">
                  {parsedBlocks.map((block) => {
                    if (block.type === "space") {
                      return <div key={block.key} className="h-2" />;
                    }
                    if (block.type === "h1") {
                      return (
                        <h2 
                          key={block.key} 
                          className={`text-lg font-bold font-display mt-6 mb-2 border-b pb-1 flex items-center gap-2 ${
                            paperTheme === "light" ? "text-slate-900 border-slate-200" : "text-white border-white/5"
                          }`}
                        >
                          {block.content}
                        </h2>
                      );
                    }
                    if (block.type === "h2" || block.type === "section-title") {
                      return (
                        <h3 
                          key={block.key} 
                          className={`text-md font-extrabold tracking-tight mt-5 mb-1.5 uppercase ${
                            paperTheme === "light" ? "text-slate-800" : "text-white"
                          }`}
                        >
                          {block.content}
                        </h3>
                      );
                    }
                    if (block.type === "h3") {
                      return (
                        <h4 
                          key={block.key} 
                          className={`text-sm font-bold tracking-tight mt-4 mb-1 ${
                            paperTheme === "light" ? "text-slate-700" : "text-indigo-300"
                          }`}
                        >
                          {block.content}
                        </h4>
                      );
                    }
                    if (block.type === "bullet") {
                      return (
                        <div key={block.key} className="flex gap-2.5 items-start pl-2 mt-1 select-text">
                          <span className={`font-bold text-sm select-none ${
                            paperTheme === "light" ? "text-indigo-600" : "text-indigo-400"
                          }`}>
                            •
                          </span>
                          <span className="flex-1">{block.content}</span>
                        </div>
                      );
                    }
                    return (
                      <p 
                        key={block.key} 
                        className={`leading-relaxed tracking-normal select-text ${
                          paperTheme === "light" ? "text-slate-700" : "text-gray-300"
                        }`}
                      >
                        {block.content}
                      </p>
                    );
                  })}
                </div>

              </div>

              {/* Document footer */}
              <div className={`mt-12 pt-4 border-t-2 text-[10px] font-mono flex flex-col sm:flex-row justify-between items-center gap-2 select-none ${
                paperTheme === "light" ? "border-slate-200 text-slate-400" : "border-white/5 text-slate-500"
              }`}>
                <span>ORCHESTRIX EXECUTIVE COMPLIANCE REPORT</span>
                <span>SECURED SWARM NODES VERIFICATION OK</span>
                <span>PAGE 1 OF 1</span>
              </div>

            </div>
          </div>

        </div>

        {/* MOBILE CONTROL TRAY: Shown on mobile for download shortcuts */}
        <div className="md:hidden border-t border-white/10 p-3 bg-[#131826] shrink-0 flex items-center justify-between gap-2 bg-[#181E31]">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-white cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
            {copied ? "Copied" : "Copy Raw"}
          </button>
          
          <button 
            onClick={() => downloadReportAsFile(report, "pdf")}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs text-white font-semibold cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5" /> PDF
          </button>

          <button 
            onClick={() => downloadReportAsFile(report, "txt")}
            className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-mono text-white cursor-pointer"
          >
            TXT
          </button>

          <button 
            onClick={() => downloadReportAsFile(report, "md")}
            className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-mono text-white cursor-pointer"
          >
            MD
          </button>
        </div>

      </div>
    </div>
  );
}
