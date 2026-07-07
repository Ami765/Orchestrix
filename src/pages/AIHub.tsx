import React, { useState, useRef, useEffect } from "react";
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Upload, 
  Video, 
  Image as ImageIcon, 
  BrainCircuit, 
  Send, 
  RefreshCw, 
  Check, 
  AlertCircle, 
  Terminal,
  Activity,
  ChevronRight,
  Info
} from "lucide-react";
import { useThemeStore } from "../store";

interface Message {
  sender: "user" | "ai" | "system";
  text: string;
  time: string;
}

export default function AIHub() {
  const { isDarkMode } = useThemeStore();

  // Voice Session State
  const [isVoiceConnected, setIsVoiceConnected] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<"idle" | "connecting" | "listening" | "speaking" | "interrupted" | "error">("idle");
  const [voiceMode, setVoiceMode] = useState<"live" | "simulator" | "">("");
  const [voiceMessages, setVoiceMessages] = useState<Message[]>([
    { sender: "system", text: "Ready to initialize Voice Command Channel.", time: new Date().toLocaleTimeString() }
  ]);
  const [micVolume, setMicVolume] = useState(0);

  // Multimodal Intelligence State
  const [intelligenceProfile, setIntelligenceProfile] = useState<"lite" | "flash" | "pro">("flash");
  const [enableThinking, setEnableThinking] = useState(false);
  const [fileToAnalyze, setFileToAnalyze] = useState<{ name: string; data: string; mimeType: string; previewUrl: string } | null>(null);
  const [analysisPrompt, setAnalysisPrompt] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);

  // Refs for Web Audio API & WebSockets
  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxInputRef = useRef<AudioContext | null>(null);
  const audioCtxOutputRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorNodeRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const pcmBufferRef = useRef<Float32Array[]>([]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectVoice();
    };
  }, []);

  // Web Speech API for fallback Speech Synthesis (Simulator Mode)
  const speakTextFallback = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setVoiceStatus("speaking");
      utterance.onend = () => setVoiceStatus("listening");
      window.speechSynthesis.speak(utterance);
    }
  };

  // Convert Float32 input to 16-bit PCM ArrayBuffer
  const floatTo16BitPCM = (input: Float32Array): ArrayBuffer => {
    const buffer = new ArrayBuffer(input.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    return buffer;
  };

  // Convert ArrayBuffer to base64 string
  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  // Play raw 24kHz signed 16-bit PCM little-endian audio chunk
  const playAudioPCM = (base64PCM: string) => {
    try {
      if (!audioCtxOutputRef.current) {
        audioCtxOutputRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const audioCtx = audioCtxOutputRef.current;

      const binaryString = window.atob(base64PCM);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const int16Array = new Int16Array(bytes.buffer);
      const float32Array = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
      }

      const audioBuffer = audioCtx.createBuffer(1, float32Array.length, 24000);
      audioBuffer.copyToChannel(float32Array, 0);

      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);

      source.onstart = () => setVoiceStatus("speaking");
      source.onended = () => {
        // If nothing else is playing, go back to listening
        if (audioCtx.currentTime >= nextStartTimeRef.current - 0.05) {
          setVoiceStatus("listening");
        }
      };

      const currentTime = audioCtx.currentTime;
      if (nextStartTimeRef.current < currentTime) {
        nextStartTimeRef.current = currentTime;
      }

      source.start(nextStartTimeRef.current);
      nextStartTimeRef.current += audioBuffer.duration;
    } catch (e) {
      console.error("[AIHub] Error playing raw PCM chunk:", e);
    }
  };

  // Start real-time voice channel
  const connectVoice = async () => {
    setVoiceStatus("connecting");
    setVoiceMessages((prev) => [
      ...prev,
      { sender: "system", text: "Initializing audio stream capture...", time: new Date().toLocaleTimeString() }
    ]);

    try {
      // Connect WS to server on the same port
      const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${wsProtocol}//${window.location.host}/api/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = async () => {
        console.log("[AIHub] WebSocket pipeline open.");
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          
          if (payload.status === "connected") {
            setIsVoiceConnected(true);
            setVoiceStatus("listening");
            setVoiceMode(payload.mode);
            setVoiceMessages((prev) => [
              ...prev,
              { 
                sender: "system", 
                text: payload.mode === "live" 
                  ? "📡 Live Gemini Audio Stream Connected." 
                  : "🦾 High-Fidelity Voice Simulator Active.", 
                time: new Date().toLocaleTimeString() 
              }
            ]);
            if (payload.text) {
              setVoiceMessages((prev) => [...prev, { sender: "ai", text: payload.text, time: new Date().toLocaleTimeString() }]);
              speakTextFallback(payload.text);
            }
          }

          if (payload.audio) {
            setVoiceStatus("speaking");
            playAudioPCM(payload.audio);
          }

          if (payload.text) {
            setVoiceMessages((prev) => {
              // Append to last message if sender is AI, otherwise create new
              const last = prev[prev.length - 1];
              if (last && last.sender === "ai") {
                const updated = [...prev];
                updated[updated.length - 1] = { ...last, text: last.text + payload.text };
                return updated;
              }
              return [...prev, { sender: "ai", text: payload.text, time: new Date().toLocaleTimeString() }];
            });
          }

          if (payload.interrupted) {
            setVoiceStatus("interrupted");
            if (audioCtxOutputRef.current) {
              // Reset output scheduling time
              nextStartTimeRef.current = audioCtxOutputRef.current.currentTime;
            }
            if ("speechSynthesis" in window) {
              window.speechSynthesis.cancel();
            }
            setTimeout(() => setVoiceStatus("listening"), 800);
          }

          if (payload.error) {
            setVoiceStatus("error");
            setVoiceMessages((prev) => [...prev, { sender: "system", text: `⚠️ API Error: ${payload.error}`, time: new Date().toLocaleTimeString() }]);
          }

        } catch (e) {
          console.error("[AIHub] Error parsing WS message:", e);
        }
      };

      ws.onclose = () => {
        setIsVoiceConnected(false);
        setVoiceStatus("idle");
        setVoiceMode("");
        setVoiceMessages((prev) => [...prev, { sender: "system", text: "Voice session disconnected.", time: new Date().toLocaleTimeString() }]);
      };

      // Set up Audio Context and Capture Mic (16kHz standard for Gemini Live input)
      audioCtxInputRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const source = audioCtxInputRef.current.createMediaStreamSource(stream);
      // Processor block (4096 is standard)
      const processor = audioCtxInputRef.current.createScriptProcessor(4096, 1, 1);
      processorNodeRef.current = processor;

      source.connect(processor);
      processor.connect(audioCtxInputRef.current.destination);

      processor.onaudioprocess = (e) => {
        if (ws.readyState !== WebSocket.OPEN) return;

        const inputData = e.inputBuffer.getChannelData(0);
        
        // Compute volume level for real-time visual feedback
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sum / inputData.length);
        setMicVolume(Math.min(100, Math.round(rms * 400)));

        // Convert and send raw 16-bit PCM chunk via websocket
        const pcmBuffer = floatTo16BitPCM(inputData);
        const base64PCM = arrayBufferToBase64(pcmBuffer);
        
        ws.send(JSON.stringify({ audio: base64PCM }));
      };

    } catch (err: any) {
      console.error("[AIHub] Microphone or WebSocket initialization failed:", err);
      setVoiceStatus("error");
      setVoiceMessages((prev) => [
        ...prev,
        { sender: "system", text: `⚠️ Microphone connection failed: ${err.message || err}. Ensure you have given Mic permissions.`, time: new Date().toLocaleTimeString() }
      ]);
    }
  };

  // Disconnect voice channel
  const disconnectVoice = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    if (processorNodeRef.current) {
      processorNodeRef.current.disconnect();
      processorNodeRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioCtxInputRef.current) {
      audioCtxInputRef.current.close();
      audioCtxInputRef.current = null;
    }

    if (audioCtxOutputRef.current) {
      audioCtxOutputRef.current.close();
      audioCtxOutputRef.current = null;
    }

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setIsVoiceConnected(false);
    setVoiceStatus("idle");
    setVoiceMode("");
    setMicVolume(0);
  };

  // File Upload Handlers (Multimodal Hub)
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64Data = (reader.result as string).split(",")[1];
      setFileToAnalyze({
        name: file.name,
        data: base64Data,
        mimeType: file.type,
        previewUrl: URL.createObjectURL(file),
      });
    };
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    if (fileToAnalyze) {
      URL.revokeObjectURL(fileToAnalyze.previewUrl);
    }
    setFileToAnalyze(null);
  };

  // Analyze Content with Gemini
  const handleAnalyze = async () => {
    if (!analysisPrompt.trim()) {
      alert("Please enter an analysis instruction or prompt.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult("");

    try {
      const response = await fetch("/api/ai-hub/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: analysisPrompt,
          file: fileToAnalyze ? {
            data: fileToAnalyze.data,
            mimeType: fileToAnalyze.mimeType,
          } : null,
          modelType: enableThinking ? "pro" : intelligenceProfile,
          enableThinking: enableThinking,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setAnalysisResult(data.text);
      } else {
        setAnalysisResult(`⚠️ Error: ${data.error || "Failed to analyze material."}`);
      }
    } catch (e: any) {
      console.error("[AIHub] Analysis error:", e);
      setAnalysisResult(`⚠️ Connection Failed: ${e.message || e}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Apply a preset prompt
  const applyPreset = (preset: string) => {
    setAnalysisPrompt(preset);
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-5 border-slate-800/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-display font-extrabold text-white tracking-tight">AI Voice & Intelligence Hub</h1>
          </div>
          <p className="text-xs text-gray-400 font-mono mt-1">
            Real-time live voice pipelines and advanced multimodal intelligence nodes.
          </p>
        </div>
        
        {/* Status indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-900/40 border border-white/5 rounded-full px-3 py-1 text-xs font-mono">
            <span className={`w-2 h-2 rounded-full ${isVoiceConnected ? "bg-emerald-500 animate-pulse" : "bg-gray-500"}`} />
            Voice session: {isVoiceConnected ? "ACTIVE" : "OFFLINE"}
          </div>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ================== LEFT PANEL: VOICE CHANNEL (LIVE API) ================== */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className={`rounded-2xl border transition-all flex flex-col h-full ${
            isDarkMode 
              ? "bg-[#131826]/40 border-white/5 text-[#EDEFF7]" 
              : "bg-white border-slate-200 text-slate-800 shadow-sm"
          }`}>
            {/* Box Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold uppercase tracking-wider font-mono text-cyan-400">Live Voice Command Center</span>
              </div>
              {voiceMode && (
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/20">
                  {voiceMode.toUpperCase()}
                </span>
              )}
            </div>

            {/* Pulsating Visualizer Panel */}
            <div className="p-6 flex flex-col items-center justify-center border-b border-white/5 bg-[#0A0D16]/40 min-h-[180px] relative overflow-hidden">
              <div className="absolute top-2 left-2 flex items-center gap-1 text-[10px] text-gray-500 font-mono">
                <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
                PCM 16k IN / 24k OUT
              </div>

              {/* Pulsating Visualizer Ring */}
              <div className="relative flex items-center justify-center">
                {/* Glowing Background Rings */}
                <div 
                  className={`absolute rounded-full transition-all duration-150 border border-cyan-500/30 ${
                    isVoiceConnected ? "animate-ping" : "scale-100"
                  }`} 
                  style={{
                    width: isVoiceConnected ? `${80 + micVolume * 1.5}px` : "70px",
                    height: isVoiceConnected ? `${80 + micVolume * 1.5}px` : "70px",
                    opacity: isVoiceConnected ? 0.4 : 0
                  }}
                />
                <div 
                  className="absolute rounded-full transition-all duration-100 border-2 border-indigo-500/40"
                  style={{
                    width: isVoiceConnected ? `${90 + micVolume * 1.2}px` : "80px",
                    height: isVoiceConnected ? `${90 + micVolume * 1.2}px` : "80px",
                    opacity: isVoiceConnected ? 0.3 : 0
                  }}
                />

                {/* Mic Core Button */}
                <button
                  onClick={isVoiceConnected ? disconnectVoice : connectVoice}
                  className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg outline-none ${
                    isVoiceConnected 
                      ? "bg-gradient-to-r from-red-500 to-rose-600 border-red-400 shadow-rose-500/20 hover:scale-105" 
                      : "bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 border-indigo-400 shadow-indigo-500/20 hover:scale-105"
                  }`}
                >
                  {isVoiceConnected ? (
                    <MicOff className="w-8 h-8 text-white" />
                  ) : (
                    <Mic className="w-8 h-8 text-white" />
                  )}
                </button>
              </div>

              <div className="mt-5 text-center">
                <div className="text-sm font-bold font-display text-white">
                  {voiceStatus === "idle" && "Voice Channel Inactive"}
                  {voiceStatus === "connecting" && "Initializing Audio Socket..."}
                  {voiceStatus === "listening" && "Listening to Voice..."}
                  {voiceStatus === "speaking" && "Gemini is Speaking..."}
                  {voiceStatus === "interrupted" && "Interrupted (Resetting Pipeline)"}
                  {voiceStatus === "error" && "Error Initializing Stream"}
                </div>
                <p className="text-[10px] text-gray-400 font-mono mt-1">
                  {isVoiceConnected ? "Talk freely. Click to disconnect." : "Click to establish low-latency audio channel."}
                </p>
              </div>

              {/* Volume bar */}
              {isVoiceConnected && (
                <div className="w-full max-w-xs bg-slate-800/80 rounded-full h-1 mt-4 relative overflow-hidden">
                  <div 
                    className="bg-cyan-400 h-1 rounded-full transition-all duration-75"
                    style={{ width: `${micVolume}%` }}
                  />
                </div>
              )}
            </div>

            {/* Conversation Logs */}
            <div className="p-4 flex-1 flex flex-col h-[280px]">
              <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider mb-2">Live Session Transcription</span>
              
              <div className="flex-1 overflow-y-auto space-y-3 bg-[#0A0D16]/30 border border-white/5 rounded-xl p-3 pr-2 scrollbar-thin">
                {voiceMessages.map((msg, i) => (
                  <div 
                    key={i} 
                    className={`flex flex-col text-xs rounded-xl p-2 max-w-[85%] ${
                      msg.sender === "user"
                        ? "bg-indigo-600/10 text-indigo-300 ml-auto border border-indigo-500/10"
                        : msg.sender === "system"
                        ? "bg-slate-800/40 text-slate-400 text-center mx-auto border border-white/5 italic font-mono"
                        : "bg-cyan-500/10 text-cyan-300 mr-auto border border-cyan-500/10"
                    }`}
                  >
                    <div className="font-medium">{msg.text}</div>
                    <div className="text-[8px] text-gray-500 text-right mt-1 font-mono">{msg.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ================== RIGHT PANEL: ADVANCED MULTIMODAL HUB ================== */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className={`rounded-2xl border transition-all flex flex-col ${
            isDarkMode 
              ? "bg-[#131826]/40 border-white/5 text-[#EDEFF7]" 
              : "bg-white border-slate-200 text-slate-800 shadow-sm"
          }`}>
            {/* Box Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold uppercase tracking-wider font-mono text-indigo-400">Advanced Multimodal & Reasoning Hub</span>
              </div>
            </div>

            {/* Intelligence Config Controls */}
            <div className="p-4 border-b border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#0A0D16]/10">
              
              {/* Profile Selectors */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold text-gray-400">INTELLIGENCE PROFILE</label>
                <div className="flex rounded-lg bg-slate-900/60 p-0.5 border border-white/5 text-xs">
                  <button
                    disabled={enableThinking}
                    onClick={() => setIntelligenceProfile("lite")}
                    className={`flex-1 py-1 px-2 rounded-md font-mono transition-all cursor-pointer ${
                      intelligenceProfile === "lite" && !enableThinking
                        ? "bg-slate-800 text-white font-bold"
                        : "text-gray-400 hover:text-white disabled:opacity-50"
                    }`}
                    title="Speed-optimized routing"
                  >
                    Lite
                  </button>
                  <button
                    disabled={enableThinking}
                    onClick={() => setIntelligenceProfile("flash")}
                    className={`flex-1 py-1 px-2 rounded-md font-mono transition-all cursor-pointer ${
                      intelligenceProfile === "flash" && !enableThinking
                        ? "bg-slate-800 text-white font-bold"
                        : "text-gray-400 hover:text-white disabled:opacity-50"
                    }`}
                    title="General purpose balanced"
                  >
                    Flash
                  </button>
                  <button
                    disabled={enableThinking}
                    onClick={() => setIntelligenceProfile("pro")}
                    className={`flex-1 py-1 px-2 rounded-md font-mono transition-all cursor-pointer ${
                      intelligenceProfile === "pro" && !enableThinking
                        ? "bg-slate-800 text-white font-bold"
                        : "text-gray-400 hover:text-white disabled:opacity-50"
                    }`}
                    title="Complex high capability"
                  >
                    Pro
                  </button>
                </div>
              </div>

              {/* High Thinking Mode Toggle */}
              <div className="space-y-1.5 flex flex-col justify-end">
                <div className="flex items-center justify-between bg-slate-900/40 border border-white/5 p-2 rounded-xl h-[34px]">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
                    <span className="text-[10px] font-mono font-bold text-gray-300">HIGH THINKING MODE</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableThinking}
                    onChange={(e) => setEnableThinking(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500 cursor-pointer"
                  />
                </div>
              </div>

            </div>

            {/* Multimodal Upload & Prompt Area */}
            <div className="p-4 space-y-4">
              
              {/* File Drop area */}
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all cursor-pointer min-h-[120px] ${
                  isDragging 
                    ? "border-indigo-500 bg-indigo-500/10" 
                    : "border-slate-800 hover:border-slate-700 bg-slate-900/20"
                }`}
              >
                {!fileToAnalyze ? (
                  <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                    <Upload className="w-6 h-6 text-indigo-400 animate-bounce mb-2" />
                    <span className="text-xs font-semibold text-white">Drag & drop photo/video here or browse</span>
                    <span className="text-[9px] text-gray-500 font-mono mt-1">Supports PNG, JPEG, MP4 video</span>
                    <input 
                      type="file" 
                      onChange={handleFileChange} 
                      className="hidden" 
                      accept="image/*,video/*" 
                    />
                  </label>
                ) : (
                  <div className="flex flex-col items-center space-y-2 w-full">
                    <div className="flex items-center justify-between w-full bg-slate-800/40 p-2 rounded-lg border border-white/5 text-xs">
                      <div className="flex items-center gap-2">
                        {fileToAnalyze.mimeType.startsWith("video/") ? (
                          <Video className="w-4 h-4 text-violet-400 shrink-0" />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-cyan-400 shrink-0" />
                        )}
                        <span className="font-mono text-[11px] truncate max-w-xs">{fileToAnalyze.name}</span>
                      </div>
                      <button 
                        onClick={removeFile}
                        className="text-[10px] text-rose-400 hover:text-rose-300 font-mono cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>

                    {/* Preview box */}
                    {fileToAnalyze.mimeType.startsWith("image/") && (
                      <div className="max-h-[150px] overflow-hidden rounded-lg border border-white/5">
                        <img 
                          src={fileToAnalyze.previewUrl} 
                          alt="preview" 
                          className="max-w-full max-h-[150px] object-contain mx-auto" 
                        />
                      </div>
                    )}
                    {fileToAnalyze.mimeType.startsWith("video/") && (
                      <div className="max-h-[150px] overflow-hidden rounded-lg border border-white/5">
                        <video 
                          src={fileToAnalyze.previewUrl} 
                          controls 
                          className="max-w-full max-h-[150px] object-contain mx-auto" 
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Text Input area */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold text-gray-400">ANALYSIS DIRECTIVES & PROMPT</label>
                <textarea
                  value={analysisPrompt}
                  onChange={(e) => setAnalysisPrompt(e.target.value)}
                  placeholder="Ask Gemini to analyze the uploaded media or answer a complex question..."
                  rows={4}
                  className="w-full bg-[#0A0D16]/50 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-xs text-white outline-none placeholder:text-gray-600 font-sans"
                />
              </div>

              {/* Quick Presets */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-gray-500 uppercase">Analysis Presets:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button 
                    onClick={() => applyPreset("Analyze this financial covenant details and identify any leverage violations.")}
                    className="text-[10px] bg-slate-900 border border-white/5 hover:bg-slate-800 text-gray-300 rounded-full px-2.5 py-1 transition-all cursor-pointer"
                  >
                    🔍 Covenant Audit
                  </button>
                  <button 
                    onClick={() => applyPreset("Identify key events, visual data, or spoken words in this video clip.")}
                    className="text-[10px] bg-slate-900 border border-white/5 hover:bg-slate-800 text-gray-300 rounded-full px-2.5 py-1 transition-all cursor-pointer"
                  >
                    🎬 Video Timeline
                  </button>
                  <button 
                    onClick={() => applyPreset("Examine the uploaded report. Toggle thinking mode to explain operational risk.")}
                    className="text-[10px] bg-slate-900 border border-white/5 hover:bg-slate-800 text-gray-300 rounded-full px-2.5 py-1 transition-all cursor-pointer"
                  >
                    🧠 High-Thinking Synthesis
                  </button>
                </div>
              </div>

              {/* Submit trigger button */}
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className={`w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isAnalyzing 
                    ? "bg-slate-800 text-gray-400" 
                    : "bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20"
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                    Dispatching Cognitive Pipeline...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-indigo-300" />
                    Dispatch Cognitive Analysis Task
                  </>
                )}
              </button>

            </div>

            {/* Analysis Output Box */}
            <div className="p-4 border-t border-white/5 flex-1 flex flex-col min-h-[220px]">
              <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider mb-2">Cognitive Response & Synthesis</span>
              
              <div className="flex-1 bg-[#0A0D16]/40 border border-white/5 rounded-xl p-4 font-mono text-xs text-slate-300 min-h-[160px] whitespace-pre-wrap leading-relaxed max-h-[350px] overflow-y-auto pr-2">
                {analysisResult ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1 text-[10px] text-gray-500 font-mono pb-2 border-b border-white/5">
                      <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                      COGNITIVE VERDICT RECEIVED OK
                    </div>
                    <div>{analysisResult}</div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center py-8 text-gray-600">
                    <Info className="w-8 h-8 text-slate-800 mb-2" />
                    <span>No active synthesis results compiled.</span>
                    <span className="text-[10px] mt-1">Configure parameters above and click "Dispatch Cognitive Analysis Task".</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
