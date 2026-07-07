import React, { useState } from "react";
import { Plus } from "lucide-react";
import { useWorkspaceStore } from "../store";

export default function KnowledgeBase() {
  const db = useWorkspaceStore((state) => state.db);
  const addKnowledge = useWorkspaceStore((state) => state.addKnowledge);

  // Local Form state
  const [showAddSource, setShowAddSource] = useState(false);
  const [newSourceName, setNewSourceName] = useState("");
  const [newSourceContent, setNewSourceContent] = useState("");

  if (!db) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceName.trim() || !newSourceContent.trim()) return;

    try {
      await addKnowledge(newSourceName, newSourceContent);
      setNewSourceName("");
      setNewSourceContent("");
      setShowAddSource(false);
    } catch (err) {
      console.error("Failed to add knowledge:", err);
      alert("Error ingesting knowledge source.");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="knowledge_view">
      <div className="border-b border-white/5 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-white">Reference Knowledge Base</h1>
          <p className="text-xs text-gray-400 mt-1">Ground agent reasoning, policies, rate definitions, and compliance rules in uploaded records.</p>
        </div>
        <button 
          onClick={() => setShowAddSource(!showAddSource)}
          className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 text-[#0A0D16] text-xs font-display font-bold hover:brightness-105 active:scale-[0.98] transition-all flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#0A0D16] stroke-[2.5]" />
          Add Source
        </button>
      </div>

      {/* Source Form */}
      {showAddSource && (
        <form onSubmit={handleSubmit} className="bg-[#131826] border border-white/10 rounded-xl p-5 space-y-4 max-w-xl shadow-2xl">
          <h3 className="text-sm font-bold text-white font-display">Ingest New Knowledge Source</h3>
          
          <div className="space-y-1">
            <label className="text-xs text-gray-300 font-semibold">Source Record Name</label>
            <input 
              type="text" 
              required
              value={newSourceName}
              onChange={(e) => setNewSourceName(e.target.value)}
              placeholder="e.g., Northgate Policy Covenants v2.pdf"
              className="w-full bg-[#0A0D16] border border-white/10 rounded-lg p-2.5 text-xs text-white outline-none focus:border-indigo-500 transition-all font-sans"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-300 font-semibold">Source parameters / Rules content</label>
            <textarea 
              required
              value={newSourceContent}
              onChange={(e) => setNewSourceContent(e.target.value)}
              placeholder="Paste core constraints or regulatory standards here. This is directly referenced inside agent context files."
              className="w-full h-32 bg-[#0A0D16] border border-white/10 rounded-lg p-3 text-xs text-white outline-none focus:border-indigo-500 transition-all font-sans resize-y"
            />
          </div>

          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-semibold text-white select-none transition-all cursor-pointer">
              Ingest Source
            </button>
            <button type="button" onClick={() => setShowAddSource(false)} className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-gray-400 hover:text-white rounded-lg select-none transition-all cursor-pointer">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Sources List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {db.knowledge.map((ks) => (
          <div key={ks.id} className="bg-[#131826] border border-white/10 rounded-xl p-4 flex flex-col gap-2 hover:border-white/20 transition-colors shadow-lg">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full px-2 py-0.5 font-mono uppercase">
                {ks.type} Source
              </span>
              <span className="text-[10px] text-gray-500 font-mono">{ks.size}</span>
            </div>
            <div className="text-sm font-bold text-white tracking-tight leading-tight mt-1 truncate">{ks.name}</div>
            <div className="text-[11px] text-gray-400 font-mono font-sans">Ingested: {ks.addedAt}</div>
            
            <div className="text-xs text-gray-300 bg-white/5 border border-white/5 rounded-lg p-2 leading-relaxed mt-2 text-justify line-clamp-3 font-sans">
              {ks.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
