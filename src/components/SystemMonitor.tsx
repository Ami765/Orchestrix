import React, { useState, useEffect } from "react";
import { 
  Database, 
  Terminal, 
  ShieldAlert, 
  Cpu, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Search, 
  Play, 
  Activity, 
  Network, 
  GitBranch, 
  BookOpen, 
  ArrowRight, 
  Clock, 
  Layers 
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line 
} from "recharts";
import { AuditLog, DbQueryLog, TelemetryStats, OrchestratorLog } from "../types";

interface SystemMonitorProps {
  queryLogs: DbQueryLog[];
  auditLogs: AuditLog[];
  orchestratorLogs: OrchestratorLog[];
  telemetry: TelemetryStats | null;
  onResetDb: () => Promise<void>;
}

export default function SystemMonitor({
  queryLogs,
  auditLogs,
  orchestratorLogs,
  telemetry,
  onResetDb
}: SystemMonitorProps) {
  const [activeTab, setActiveTab] = useState<"orchestrator" | "rag" | "database" | "audit" | "telemetry">("orchestrator");
  const [searchQuery, setSearchQuery] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [telemetryHistory, setTelemetryHistory] = useState<Array<any>>([]);

  // Store telemetry history points for charting
  useEffect(() => {
    if (telemetry) {
      setTelemetryHistory(prev => {
        const next = [...prev, {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          cpu: telemetry.cpu,
          memory: telemetry.memory,
          queries: telemetry.queriesPerMin
        }];
        // Keep last 15 points
        return next.slice(-15);
      });
    }
  }, [telemetry]);

  const handleReset = async () => {
    if (confirm("Are you sure you want to trigger a complete system factory reset? This will truncate and seed the relational database and clear logs.")) {
      setIsResetting(true);
      await onResetDb();
      setIsResetting(false);
    }
  };

  // Cosine similarity score calculator simulator to showcase vector math
  const getDemoCosineSim = (textA: string, textB: string) => {
    const clean = (t: string) => t.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter(Boolean);
    const wordsA = clean(textA);
    const wordsB = clean(textB);
    const unique = Array.from(new Set([...wordsA, ...wordsB]));
    
    let dot = 0;
    let magA = 0;
    let magB = 0;
    
    unique.forEach(w => {
      const countA = wordsA.filter(x => x === w).length;
      const countB = wordsB.filter(x => x === w).length;
      dot += countA * countB;
      magA += countA * countA;
      magB += countB * countB;
    });
    
    if (magA === 0 || magB === 0) return 0;
    return dot / (Math.sqrt(magA) * Math.sqrt(magB));
  };

  const sampleRAGMatch = "Financial statement Q2 leverage targets maximum covenants <4.0x threshold";
  const sampleKnowledgeBase = "Underwriting guidelines and reference standard: maximum allowed leverage ratio is 4.0x. Covenant breach thresholds apply.";
  const sampleSimScore = getDemoCosineSim(sampleRAGMatch, sampleKnowledgeBase);

  return (
    <div className="space-y-6" id="system_monitor_root">
      
      {/* Title Header Block */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="text-xs font-mono tracking-widest text-cyan-400 uppercase">ENTERPRISE CLOUD ARCHITECTURE</div>
          <h1 className="text-2xl font-display font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-cyan-400" />
            Core Engine Control Panel
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry, transaction query profiling, LangGraph Multi-Agent tracking, and security audit logging.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-800/40 border border-slate-800 px-3 py-1.5 rounded-lg select-none">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono text-emerald-400 font-semibold tracking-wider uppercase">SSE STREAM CONNECTED</span>
          </div>
          <button 
            onClick={handleReset}
            disabled={isResetting}
            className="px-3.5 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-mono font-medium transition-all flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin" : ""}`} />
            RESET FACTORY DEFAULTS
          </button>
        </div>
      </div>

      {/* Main Stats Banner Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="text-[10px] text-slate-400 font-mono tracking-wider uppercase flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            SERVER CPU LOAD
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-cyan-400">{telemetry ? `${telemetry.cpu}%` : "0.0%"}</div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">Container CPU Core</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="text-[10px] text-slate-400 font-mono tracking-wider uppercase flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-violet-400" />
            HEAP MEMORY
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-violet-400">{telemetry ? `${telemetry.memory} MB` : "0.0 MB"}</div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">V8 Engine Allocated</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="text-[10px] text-slate-400 font-mono tracking-wider uppercase flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-amber-400" />
            SQL QUERIES / MIN
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-amber-400">{telemetry ? telemetry.queriesPerMin : 0}</div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">DQL / DML operations</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="text-[10px] text-slate-400 font-mono tracking-wider uppercase flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            AVG TRANSACTION
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-emerald-400">{telemetry ? `${telemetry.averageLatencyMs.toFixed(3)}ms` : "0.000ms"}</div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">Relational query speeds</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between col-span-2 lg:col-span-1">
          <div className="text-[10px] text-slate-400 font-mono tracking-wider uppercase flex items-center gap-1.5">
            <Network className="w-3.5 h-3.5 text-rose-400" />
            SSE CLIENTS
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-rose-400">{telemetry ? telemetry.activeConnections : 1} Connected</div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">Active Event streams</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-800 flex overflow-x-auto whitespace-nowrap">
        <button 
          onClick={() => { setActiveTab("orchestrator"); setSearchQuery(""); }}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "orchestrator" 
              ? "border-cyan-400 text-cyan-400 bg-cyan-400/5 font-semibold" 
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <GitBranch className="w-4 h-4" />
          LangGraph Orchestration Graph
        </button>
        <button 
          onClick={() => { setActiveTab("rag"); setSearchQuery(""); }}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "rag" 
              ? "border-blue-400 text-blue-400 bg-blue-400/5 font-semibold" 
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Semantic RAG Inspector
        </button>
        <button 
          onClick={() => { setActiveTab("database"); setSearchQuery(""); }}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "database" 
              ? "border-amber-400 text-amber-400 bg-amber-400/5 font-semibold" 
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <Database className="w-4 h-4" />
          SQL Relational Profiler
        </button>
        <button 
          onClick={() => { setActiveTab("audit"); setSearchQuery(""); }}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "audit" 
              ? "border-red-400 text-red-400 bg-red-400/5 font-semibold" 
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <Terminal className="w-4 h-4" />
          Security Audit Trails
        </button>
        <button 
          onClick={() => { setActiveTab("telemetry"); setSearchQuery(""); }}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "telemetry" 
              ? "border-violet-400 text-violet-400 bg-violet-400/5 font-semibold" 
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <Activity className="w-4 h-4" />
          System Telemetry Charts
        </button>
      </div>

      {/* SEARCH OR FILTERS CONTAINER */}
      {activeTab !== "telemetry" && activeTab !== "rag" && (
        <div className="flex items-center gap-3 bg-slate-900/40 border border-slate-800 rounded-xl px-3.5 py-2.5">
          <Search className="w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder={`Filter ${activeTab} logs...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-white border-none outline-none w-full placeholder-slate-500"
          />
        </div>
      )}

      {/* TAB CONTENT: LANGGRAPH ORCHESTRATION */}
      {activeTab === "orchestrator" && (
        <div className="space-y-6">
          {/* LangGraph Pipeline Visualizer Block */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-xs font-mono tracking-widest text-cyan-400 mb-6 uppercase">ACTIVE STATE-MACHINE MULTI-AGENT GRAPH</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center relative select-none">
              
              {/* Node 1 */}
              <div className="flex flex-col items-center bg-slate-850 border border-indigo-500/20 rounded-xl p-4 text-center">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-400/40 flex items-center justify-center text-indigo-400 font-mono font-bold text-xs mb-2">
                  DP
                </div>
                <div className="text-xs font-semibold text-white">Document Parser</div>
                <div className="text-[9px] text-slate-500 font-mono mt-1">INPUT PORT</div>
              </div>

              {/* Arrow 1 */}
              <div className="hidden md:flex flex-col items-center text-slate-600">
                <ArrowRight className="w-5 h-5 text-indigo-500 animate-pulse" />
                <span className="text-[8px] font-mono mt-1">Relational State</span>
              </div>

              {/* Node 2 */}
              <div className="flex flex-col items-center bg-slate-850 border border-violet-500/20 rounded-xl p-4 text-center relative">
                <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-400/40 flex items-center justify-center text-violet-400 font-mono font-bold text-xs mb-2">
                  FR
                </div>
                <div className="text-xs font-semibold text-white">Financial Reviewer</div>
                <div className="text-[9px] text-amber-400 font-mono mt-1">CONDITIONAL COUPLING</div>
                
                {/* Dynamic routing overlay indicator */}
                <span className="absolute -top-1.5 -right-1.5 bg-cyan-400 text-[8px] font-mono font-bold text-slate-950 px-1.5 py-0.5 rounded-full shadow-lg">
                  ROUTER ACTIVE
                </span>
              </div>

              {/* Dynamic compliance bypass loop arrow */}
              <div className="hidden md:flex flex-col items-center text-cyan-400">
                <ArrowRight className="w-5 h-5 text-cyan-400" />
                <span className="text-[8px] font-mono mt-1 font-bold text-center">IF RISK &gt; 0<br/>REROUTE</span>
              </div>

              {/* Compliance Node inserted conditionally */}
              <div className="flex flex-col items-center bg-slate-850 border border-cyan-500/20 rounded-xl p-4 text-center relative">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-cyan-400 font-mono font-bold text-xs mb-2">
                  CO
                </div>
                <div className="text-xs font-semibold text-white">Compliance Officer</div>
                <div className="text-[9px] text-cyan-300 font-mono mt-1">DYNAMICALLY ENGAGED</div>
              </div>

            </div>

            {/* Sub graph loopback trace */}
            <div className="mt-8 border-t border-dashed border-slate-800 pt-5 flex items-center justify-between text-xs text-slate-400 font-mono">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                <span>Router State: checking risk indicators inside current document context ...</span>
              </div>
              <div className="text-[10px] text-slate-500">
                Graph Engine: LangGraph-Model v2
              </div>
            </div>
          </div>

          {/* Orchestrator Logs list */}
          <div className="bg-slate-900/45 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="border-b border-slate-800 px-5 py-4 flex justify-between items-center bg-slate-900/20">
              <h3 className="text-xs font-mono font-semibold text-white tracking-widest uppercase flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                LANGGRAPH AGENT STATE MACHINE TRACES ({orchestratorLogs.length})
              </h3>
              <span className="text-[10px] font-mono text-slate-500">dynamic workflow state buffer</span>
            </div>

            <div className="divide-y divide-slate-850 max-h-[450px] overflow-y-auto font-mono text-xs">
              {orchestratorLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  No active orchestration processes. Run an analysis pipeline to see logs in real-time.
                </div>
              ) : (
                orchestratorLogs
                  .filter(log => 
                    log.nodeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    log.eventType.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((log) => (
                    <div key={log.id} className="p-4 hover:bg-slate-850/30 transition-all flex items-start gap-4">
                      {/* Event Type Icon */}
                      <div className="shrink-0 mt-0.5">
                        {log.eventType === "state_transition" && (
                          <div className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded text-[9px] font-bold">
                            TRANSITION
                          </div>
                        )}
                        {log.eventType === "agent_call" && (
                          <div className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded text-[9px] font-bold">
                            AGENT CALL
                          </div>
                        )}
                        {log.eventType === "rag_retrieval" && (
                          <div className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-[9px] font-bold">
                            VECTOR RAG
                          </div>
                        )}
                        {log.eventType === "info" && (
                          <div className="bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded text-[9px] font-bold">
                            ENGINE INFO
                          </div>
                        )}
                        {log.eventType === "error" && (
                          <div className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded text-[9px] font-bold flex items-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            EXCEPTION
                          </div>
                        )}
                      </div>

                      {/* Content details */}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-xs">{log.nodeName}</span>
                          <span className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-slate-300 text-xs leading-relaxed">{log.message}</p>
                        
                        {log.stateDelta && (
                          <div className="bg-slate-950 rounded-md p-2 mt-2 border border-slate-900 text-[10px] text-cyan-400 overflow-x-auto max-w-full">
                            State Delta: {log.stateDelta}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SEMANTIC RAG INSPECTOR */}
      {activeTab === "rag" && (
        <div className="space-y-6">
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="text-xs font-mono tracking-widest text-cyan-400 uppercase">VECTOR VECTORIZATION & TERM SIMILARITY MATHEMATICS</h3>
              <p className="text-xs text-slate-400 mt-1">
                Our local RAG compiler performs a real mathematical term-frequency Cosine Similarity check against the Knowledge Base, injecting context directly.
              </p>
            </div>

            {/* Formula Block */}
            <div className="bg-slate-950 rounded-xl p-5 border border-slate-900 font-mono text-center flex flex-col items-center justify-center space-y-3">
              <span className="text-slate-500 text-[11px] uppercase">Cosine Term Similarity Formula</span>
              <div className="text-white text-sm md:text-base font-bold bg-slate-900/50 py-2.5 px-6 border border-slate-800 rounded-lg">
                Similarity = cos(θ) = ( A · B ) / ( ||A|| * ||B|| )
              </div>
              <p className="text-[10px] text-slate-500 max-w-lg mt-1">
                Computes the dot product of term frequencies in the submitted material (Vector A) and knowledge guidelines (Vector B), normalized by their Euclidean magnitudes.
              </p>
            </div>

            {/* Interactive Vector Mockup */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-850 rounded-xl p-4 border border-slate-800 space-y-3">
                <span className="text-[10px] font-mono font-semibold text-cyan-400 block uppercase">ANALYZED MATERIAL VECTORS (A)</span>
                <div className="space-y-2 text-[11px] font-mono text-slate-400">
                  <div className="flex justify-between border-b border-slate-800/40 pb-1.5">
                    <span>Target Word: <strong className="text-white">"leverage"</strong></span>
                    <span>Freq: 1</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/40 pb-1.5">
                    <span>Target Word: <strong className="text-white">"covenants"</strong></span>
                    <span>Freq: 2</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/40 pb-1.5">
                    <span>Target Word: <strong className="text-white">"threshold"</strong></span>
                    <span>Freq: 1</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-850 rounded-xl p-4 border border-slate-800 space-y-3">
                <span className="text-[10px] font-mono font-semibold text-violet-400 block uppercase">KNOWLEDGE DOCUMENT VECTORS (B)</span>
                <div className="space-y-2 text-[11px] font-mono text-slate-400">
                  <div className="flex justify-between border-b border-slate-800/40 pb-1.5">
                    <span>Target Word: <strong className="text-white">"leverage"</strong></span>
                    <span>Freq: 2</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/40 pb-1.5">
                    <span>Target Word: <strong className="text-white">"covenant"</strong></span>
                    <span>Freq: 1</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/40 pb-1.5">
                    <span>Target Word: <strong className="text-white">"thresholds"</strong></span>
                    <span>Freq: 1</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Simulation output */}
            <div className="bg-slate-950 border border-indigo-500/20 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-mono font-semibold text-white">PROTOTYPE RAG SIMILARITY RUNNER</div>
                <div className="text-[11px] text-slate-400 leading-relaxed font-mono">
                  Input query: <span className="text-cyan-400">"{sampleRAGMatch}"</span> matched against guideline documents.
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 px-5 py-3 rounded-lg text-center shrink-0">
                <div className="text-[10px] font-mono text-slate-500 uppercase">COSINE SCORE</div>
                <div className="text-xl font-mono font-extrabold text-cyan-400">{(sampleSimScore * 100).toFixed(1)}%</div>
                <div className="text-[8px] font-mono text-emerald-400 mt-0.5">MATCH ACCORD</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: DATABASE QUERY PROFILER */}
      {activeTab === "database" && (
        <div className="space-y-6">
          <div className="bg-slate-900/45 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="border-b border-slate-800 px-5 py-4 flex justify-between items-center bg-slate-900/20">
              <h3 className="text-xs font-mono font-semibold text-white tracking-widest uppercase flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-400" />
                DATABASE TRANSACTION QUERY TRACES ({queryLogs.length})
              </h3>
              <span className="text-[10px] font-mono text-slate-500">microsecond profiling latency telemetry</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 font-mono text-[10px] uppercase bg-slate-950/40">
                    <th className="p-4">TXN ID</th>
                    <th className="p-4">TIMESTAMP</th>
                    <th className="p-4">OP TYPE</th>
                    <th className="p-4">QUERY / STATEMENT</th>
                    <th className="p-4 text-center">INDEX SCAN</th>
                    <th className="p-4 text-center">LATENCY</th>
                    <th className="p-4 text-center">ROWS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 font-mono">
                  {queryLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
                        No transactions registered yet. Dispatch agent pipelines or mutate state to trigger transactions.
                      </td>
                    </tr>
                  ) : (
                    queryLogs
                      .filter(log => 
                        log.query.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        log.type.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((log) => (
                        <tr key={log.id} className="hover:bg-slate-850/20 transition-all">
                          <td className="p-4 text-slate-400">{log.id}</td>
                          <td className="p-4 text-[11px] text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.type === "SELECT" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                              log.type === "INSERT" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                              log.type === "UPDATE" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                              log.type === "DELETE" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                              "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                            }`}>
                              {log.type}
                            </span>
                          </td>
                          <td className="p-4 text-slate-300 max-w-md truncate font-semibold" title={log.query}>
                            {log.query}
                          </td>
                          <td className="p-4 text-center">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                              log.indexUsed 
                                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" 
                                : "bg-slate-800 text-slate-500"
                            }`}>
                              {log.indexUsed ? "INDEX INDEX" : "FULL SCAN"}
                            </span>
                          </td>
                          <td className={`p-4 text-center font-bold font-mono ${
                            log.latencyMs > 1.0 ? "text-amber-400" : "text-emerald-400"
                          }`}>
                            {log.latencyMs.toFixed(3)}ms
                          </td>
                          <td className="p-4 text-center text-slate-400 font-bold">{log.rowsAffected}</td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SECURITY AUDIT TRAILS */}
      {activeTab === "audit" && (
        <div className="space-y-6">
          <div className="bg-slate-900/45 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="border-b border-slate-800 px-5 py-4 flex justify-between items-center bg-slate-900/20">
              <h3 className="text-xs font-mono font-semibold text-white tracking-widest uppercase flex items-center gap-2">
                <Terminal className="w-4 h-4 text-red-400" />
                WORKSPACE SECURITY AUDIT LOG FILES ({auditLogs.length})
              </h3>
              <span className="text-[10px] font-mono text-slate-500">regulatory standards trace monitoring</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 font-mono text-[10px] uppercase bg-slate-950/40">
                    <th className="p-4">AUDIT LOG ID</th>
                    <th className="p-4">TIMESTAMP</th>
                    <th className="p-4">ACTOR / OPERATOR</th>
                    <th className="p-4">ACTION CODE</th>
                    <th className="p-4">RESOURCE DESCR</th>
                    <th className="p-4">CLIENT IP</th>
                    <th className="p-4 text-center">OUTCOME</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 font-mono">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
                        No audit files saved yet.
                      </td>
                    </tr>
                  ) : (
                    auditLogs
                      .filter(log => 
                        log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        log.resource.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((log) => (
                        <tr key={log.id} className="hover:bg-slate-850/20 transition-all">
                          <td className="p-4 text-slate-500">{log.id}</td>
                          <td className="p-4 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                          <td className="p-4 font-bold text-white">{log.actor}</td>
                          <td className="p-4">
                            <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px]">
                              {log.action}
                            </span>
                          </td>
                          <td className="p-4 text-slate-300 font-semibold">{log.resource}</td>
                          <td className="p-4 text-slate-500">{log.ip}</td>
                          <td className="p-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.status === "success" 
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                : "bg-red-500/10 text-red-400 border border-red-500/20"
                            }`}>
                              {log.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SYSTEM TELEMETRY CHARTS */}
      {activeTab === "telemetry" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* CPU Chart */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-mono tracking-widest text-cyan-400 uppercase">CPU PERFORMANCE SPEED (Hz)</span>
                <span className="text-[10px] font-mono text-slate-500">live-buffered updates</span>
              </div>
              <div className="h-[200px]">
                {telemetryHistory.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-500">
                    Recording telemetry signals...
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={telemetryHistory}>
                      <defs>
                        <linearGradient id="cpuGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" stroke="#475569" fontSize={8} />
                      <YAxis stroke="#475569" fontSize={8} domain={[0, 100]} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: '10px' }} />
                      <Area type="monotone" dataKey="cpu" stroke="#22d3ee" strokeWidth={2} fillOpacity={1} fill="url(#cpuGlow)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Memory Chart */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-mono tracking-widest text-violet-400 uppercase">V8 ENGINE MEMORY ALLOCATION (MB)</span>
                <span className="text-[10px] font-mono text-slate-500">garbage collection nodes</span>
              </div>
              <div className="h-[200px]">
                {telemetryHistory.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-500">
                    Recording telemetry signals...
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={telemetryHistory}>
                      <defs>
                        <linearGradient id="memGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#a78bfa" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" stroke="#475569" fontSize={8} />
                      <YAxis stroke="#475569" fontSize={8} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: '10px' }} />
                      <Area type="monotone" dataKey="memory" stroke="#a78bfa" strokeWidth={2} fillOpacity={1} fill="url(#memGlow)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
