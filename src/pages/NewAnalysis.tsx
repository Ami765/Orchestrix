import React from "react";
import { useNavigate } from "react-router-dom";
import { FileUp, Check, Sparkles, X } from "lucide-react";
import { useWorkspaceStore, useUIStore } from "../store";
import { useAnalysis } from "../hooks";

export default function NewAnalysis() {
  const navigate = useNavigate();

  // Store hooks
  const db = useWorkspaceStore((state) => state.db);
  const runAnalysis = useWorkspaceStore((state) => state.runAnalysis);
  
  const {
    analysisTitle,
    setAnalysisTitle,
    analysisTab,
    setAnalysisTab,
    analysisText,
    setAnalysisText,
    isDragging,
    setIsDragging,
    uploadedFiles,
    addUploadedFile,
    removeUploadedFile,
    selectedWorkflowId,
    setSelectedWorkflowId
  } = useUIStore();

  const { runningAnalysis } = useAnalysis();

  if (!db) return null;

  // Drag and Drop helpers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files).map((file: any) => ({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      }));
      filesArray.forEach(file => addUploadedFile(file));
    }
  };

  // Dispatch starting sequence
  const handleStartAnalysis = async () => {
    const defaultText = analysisTab === "paste" 
      ? analysisText 
      : `File contents of uploaded items: ${uploadedFiles.map(f => f.name).join(", ")}. Standard financial leverage of 3.8x, Q2 growth rate targets met. Steady revenue.`;

    if (!defaultText.trim()) {
      alert("Please provide some source text or upload files to analyze.");
      return;
    }

    try {
      await runAnalysis(analysisTitle, defaultText, selectedWorkflowId);
      
      // Reset state fields
      setAnalysisText("");
      setAnalysisTitle("");
      
      // Dynamic routing direct to swarm monitor
      navigate("/agents");
    } catch (err) {
      console.error("Error dispatching swarm:", err);
      alert("Error dispatching swarm analysis pipeline.");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="new_analysis_view">
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-xl font-display font-bold text-white">Swarm Diligence Portal</h1>
        <p className="text-xs text-gray-400 mt-1">Submit source files, select reference parameters, and deploy the specialty agent swarm.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: inputs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#131826] border border-white/10 rounded-xl p-5 space-y-4 shadow-xl shadow-black/30">
            
            {/* Name prompt */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-white uppercase tracking-wider font-mono">Diligence Analysis Name</label>
              <input 
                type="text" 
                value={analysisTitle}
                onChange={(e) => setAnalysisTitle(e.target.value)}
                placeholder="e.g., Northgate Acquisition — Loan Audit"
                className="w-full bg-[#0A0D16] border border-white/10 rounded-lg p-2.5 text-xs text-white outline-none focus:border-indigo-500 transition-all font-sans"
              />
            </div>

            {/* Tab selector */}
            <div className="flex gap-1.5 p-1 bg-white/5 border border-white/10 rounded-lg w-fit shadow-inner">
              <button 
                onClick={() => setAnalysisTab("paste")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                  analysisTab === "paste" ? "bg-indigo-600 text-white shadow-md" : "text-gray-400 hover:text-white"
                }`}
              >
                Paste raw text
              </button>
              <button 
                onClick={() => setAnalysisTab("upload")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                  analysisTab === "upload" ? "bg-indigo-600 text-white shadow-md" : "text-gray-400 hover:text-white"
                }`}
              >
                Upload target files
              </button>
            </div>

            {/* Tab contents: Paste Text */}
            {analysisTab === "paste" && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-white uppercase tracking-wider font-mono">Document Body text</label>
                <textarea 
                  value={analysisText}
                  onChange={(e) => setAnalysisText(e.target.value)}
                  placeholder="Paste contract parameters, covenants, credit sheets, or audit logs here..."
                  className="w-full h-44 bg-[#0A0D16] border border-white/10 rounded-lg p-3 text-xs text-white outline-none focus:border-indigo-500 transition-all font-sans resize-y shadow-inner"
                />
              </div>
            )}

            {/* Tab contents: Upload Target Files */}
            {analysisTab === "upload" && (
              <div className="space-y-3">
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                    isDragging 
                      ? "border-cyan-400 bg-cyan-400/5" 
                      : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                  }`}
                >
                  <FileUp className="w-10 h-10 text-cyan-400 animate-pulse mb-2" />
                  <h4 className="text-sm font-semibold text-white">Drag and drop documents here</h4>
                  <p className="text-[11px] text-gray-400 mt-1 max-w-xs">Supports target PDF, DOCX, XLSX sheets, or CSV logs up to 50MB</p>
                  <label className="mt-4 px-3 py-1.5 bg-[#131826] hover:bg-white/5 border border-white/10 rounded-lg text-xs font-semibold text-white select-none cursor-pointer transition-all">
                    Browse local files
                    <input type="file" multiple className="hidden" onChange={(e) => {
                      if (e.target.files) {
                        const filesArray = Array.from(e.target.files).map((file: any) => ({
                          name: file.name,
                          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                        }));
                        filesArray.forEach(file => addUploadedFile(file));
                      }
                    }} />
                  </label>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="flex gap-2 flex-wrap pt-2">
                    {uploadedFiles.map((f, i) => (
                      <span key={i} className="text-xs bg-white/5 border border-white/10 rounded-lg pl-3 pr-2 py-1 flex items-center gap-2 text-gray-300 shadow-md">
                        📄 {f.name} <span className="text-[10px] text-gray-500 font-mono">({f.size})</span>
                        <button onClick={() => removeUploadedFile(i)} className="p-0.5 hover:bg-white/10 hover:text-white rounded text-gray-500 shrink-0 transition-all cursor-pointer">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Step Tracker Progression */}
          {runningAnalysis && (
            <div className="bg-[#131826] border border-white/10 rounded-xl p-5 space-y-4 shadow-xl shadow-black/30">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="text-xs font-bold text-white uppercase tracking-wider font-mono">LIVE DISPATCH TRACKING</div>
                <span className="text-xs font-mono text-cyan-400 animate-pulse">DEPLOYING SHIELD DIRECTIVE...</span>
              </div>

              <div className="flex items-center justify-between gap-2 py-4">
                {runningAnalysis.stages.map((stg, idx) => {
                  const isCompleted = idx < runningAnalysis.currentStageIndex;
                  const isActive = idx === runningAnalysis.currentStageIndex;

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 relative">
                      {/* Horizontal connector lines */}
                      {idx < runningAnalysis.stages.length - 1 && (
                        <div className={`absolute top-4 left-1/2 w-full h-[2px] z-0 ${
                          idx < runningAnalysis.currentStageIndex ? "bg-emerald-500" : "bg-white/10"
                        }`} />
                      )}

                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-mono font-bold text-xs z-10 ${
                        isCompleted
                          ? "bg-emerald-500 border-emerald-500 text-[#0A0D16]"
                          : isActive
                          ? "bg-[#131826] border-cyan-400 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.4)] animate-pulse"
                          : "bg-[#131826] border-white/10 text-gray-500"
                      }`}>
                        {isCompleted ? "✓" : idx + 1}
                      </div>
                      <span className={`text-[10px] font-semibold text-center select-none truncate max-w-[80px] ${
                        isActive ? "text-cyan-400 font-bold" : isCompleted ? "text-emerald-400" : "text-gray-500"
                      }`}>
                        {stg.name}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-center text-gray-400">
                Swarm specialists are conducting operations. Track running status in the{" "}
                <button 
                  onClick={() => navigate("/agents")} 
                  className="text-cyan-400 underline cursor-pointer font-bold bg-transparent border-none p-0 inline hover:text-cyan-300"
                >
                  Swarm Specialists
                </button>{" "}
                view.
              </p>
            </div>
          )}
        </div>

        {/* Right 1 col: selecting parameters */}
        <div className="space-y-4">
          <div className="bg-[#131826] border border-white/10 rounded-xl p-5 space-y-4 shadow-xl shadow-black/30">
            <div className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-white/5 pb-2">Swarm Parameters</div>
            
            {/* Workflow selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-300">Agent Swarm Directive</label>
              <div className="flex flex-col gap-2">
                {db.workflows.map((wf) => (
                  <button 
                    type="button"
                    key={wf.id}
                    onClick={() => setSelectedWorkflowId(wf.id)}
                    className={`p-3 border rounded-xl cursor-pointer text-left transition-all ${
                      selectedWorkflowId === wf.id 
                        ? "border-indigo-500 bg-indigo-500/10 shadow-[0_0_12px_rgba(123,108,250,0.15)]" 
                        : "border-white/10 hover:border-white/20 bg-white/[0.02]"
                    }`}
                  >
                    <div className="text-xs font-bold text-white flex items-center justify-between">
                      {wf.name}
                      {selectedWorkflowId === wf.id && <Check className="w-3.5 h-3.5 text-indigo-400 stroke-[3]" />}
                    </div>
                    <div className="text-[10px] text-gray-400 leading-normal mt-1">{wf.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Primary deploy button */}
            <button
              onClick={handleStartAnalysis}
              disabled={!!runningAnalysis}
              className={`w-full py-3 rounded-xl font-display font-bold text-sm tracking-wide text-[#0A0D16] shadow-[0_10px_20px_-5px_rgba(123,108,250,0.45)] hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer ${
                runningAnalysis 
                  ? "bg-gray-700 text-gray-500 shadow-none cursor-not-allowed opacity-50" 
                  : "bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500"
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#0A0D16] stroke-[2.5]" />
              Deploy Agent Swarm
            </button>

            {runningAnalysis && (
              <p className="text-[10px] text-center text-amber-400 font-mono animate-pulse">
                ⚠️ A swarm is currently running. Please wait for completion before deploying a new swarm.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
