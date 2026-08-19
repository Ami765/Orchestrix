import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  X,
  Sparkles,
  Lock,
  Compass,
  Layout,
  Tv,
  CheckCircle,
  Code,
  Layers,
  ChevronRight,
  RefreshCw,
  Eye,
  Info
} from "lucide-react";
import { useWalkthroughStore, WALKTHROUGH_STEPS } from "../store/walkthroughStore";
import { useThemeStore } from "../store/theme";
import { useUIStore } from "../store/ui";
import { motion, AnimatePresence } from "motion/react";

export default function WalkthroughController() {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { setSettingsTab, setSettingsForm } = useUIStore();
  
  const {
    isActive,
    isPlaying,
    currentStepIndex,
    autoAdvance,
    timeLeft,
    showLoginOverlay,
    showAcquisitionOverlay,
    showSplashOverlay,
    simulatedChatText,
    isSimulatingTyping,
    
    stopWalkthrough,
    togglePlay,
    nextStep,
    prevStep,
    setStep,
    toggleAutoAdvance,
    tick,
    setLoginOverlay,
    setAcquisitionOverlay,
    setSplashOverlay,
    setSimulatedChatText,
    setSimulatingTyping,
  } = useWalkthroughStore();

  const currentStep = WALKTHROUGH_STEPS[currentStepIndex];

  // Timer loop for countdown
  useEffect(() => {
    if (!isActive || !isPlaying) return;
    const interval = setInterval(() => {
      tick(navigate);
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, isPlaying, tick, navigate]);

  // Handle step actions and simulated behaviors
  useEffect(() => {
    if (!isActive) return;

    // Reset temporary states
    setSimulatedChatText("");
    setSimulatingTyping(false);

    const action = currentStep.simulatedAction;
    
    // Login Simulation auto trigger
    if (action === "show_login_simulation") {
      setLoginOverlay(true);
    } else {
      setLoginOverlay(false);
    }

    // Splash Simulation auto trigger
    if (action === "splash") {
      setSplashOverlay(true);
    } else {
      setSplashOverlay(false);
    }

    // Acquisition Overlay auto trigger
    if (action === "show_acquisition_overlay") {
      setAcquisitionOverlay(true);
    } else {
      setAcquisitionOverlay(false);
    }

    // Chat Typing Simulation
    if (action === "type_chat_message") {
      setSimulatingTyping(true);
      const textToType = "Compare Meridian Advisory's Q2 compliance statements against latest SEC guidelines and draft an executive risk matrix.";
      let index = 0;
      const interval = setInterval(() => {
        if (index < textToType.length) {
          setSimulatedChatText(textToType.substring(0, index + 1));
          index++;
        } else {
          setSimulatingTyping(false);
          clearInterval(interval);
        }
      }, 50);
      return () => clearInterval(interval);
    }

    // Theme toggling demo sequence
    if (action === "toggle_dark_light") {
      const toggleInterval = setInterval(() => {
        toggleTheme();
      }, 4000);
      return () => {
        clearInterval(toggleInterval);
        // Ensure we revert back to Dark Mode for the standard SaaS aesthetic
        if (!isDarkMode) {
          toggleTheme();
        }
      };
    }
  }, [currentStepIndex, isActive, setLoginOverlay, setAcquisitionOverlay, setSplashOverlay, setSimulatedChatText, setSimulatingTyping, currentStep.simulatedAction]);

  if (!isActive) return null;

  // Percentage calculations for progress bar
  const currentStepMaxDuration = currentStep.duration;
  const progressPercent = ((currentStepMaxDuration - timeLeft) / currentStepMaxDuration) * 100;

  return (
    <>
      {/* ==================== CORE FLOATING OVERLAY & TELEPROMPTER CONTROLLER ==================== */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl bg-slate-900/95 border border-indigo-500/30 text-white rounded-2xl shadow-[0_0_50px_rgba(99,102,241,0.25)] z-50 backdrop-blur-md overflow-hidden font-sans">
        
        {/* Progress Line */}
        <div className="h-1 w-full bg-slate-800">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="p-4 md:p-5 flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Active Step Info */}
          <div className="flex items-start gap-3 w-full md:w-auto">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-600/30 to-violet-600/30 border border-indigo-500/20 text-cyan-400 shrink-0 mt-0.5">
              <Tv className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-cyan-400 font-mono tracking-wider uppercase">Scene {currentStepIndex + 1} of {WALKTHROUGH_STEPS.length}</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-indigo-950 border border-indigo-500/20 rounded font-mono text-indigo-300 font-bold">{currentStep.timing}</span>
              </div>
              <h3 className="text-sm font-bold text-white tracking-tight">{currentStep.title}</h3>
              <p className="text-[11px] text-gray-400 font-mono leading-tight mt-0.5">{currentStep.screenDesc}</p>
            </div>
          </div>

          {/* Interactive Narration Teleprompter / Subtitles */}
          <div className="flex-1 px-4 py-2.5 bg-slate-950/60 border border-white/5 rounded-xl text-center md:text-left min-h-[56px] flex items-center">
            <p className="text-xs leading-relaxed text-indigo-100 select-all font-sans italic">
              <span className="font-mono text-indigo-400 font-bold not-italic mr-1.5 uppercase tracking-wide">🎙️ Voiceover:</span>
              "{currentStep.voiceover}"
            </p>
          </div>

          {/* Controller Keys */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Auto Advance switch */}
            <button
              onClick={toggleAutoAdvance}
              className={`px-3 py-1.5 rounded-lg border text-[10px] font-mono font-bold uppercase cursor-pointer transition-all ${
                autoAdvance 
                  ? "bg-cyan-950 border-cyan-500/40 text-cyan-400" 
                  : "bg-slate-950 border-slate-800 text-slate-500"
              }`}
              title="Toggle automatic scene transitions"
            >
              {autoAdvance ? "Auto-Play On" : "Auto-Play Off"}
            </button>

            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-white/5">
              <button
                onClick={() => prevStep(navigate)}
                disabled={currentStepIndex === 0}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-all"
                title="Previous Scene"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={togglePlay}
                className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer transition-all shadow-md shadow-indigo-950"
                title={isPlaying ? "Pause Automation" : "Resume Automation"}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
              </button>

              <button
                onClick={() => nextStep(navigate)}
                disabled={currentStepIndex === WALKTHROUGH_STEPS.length - 1}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-all"
                title="Next Scene"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={stopWalkthrough}
              className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-500/40 hover:text-rose-400 cursor-pointer transition-all text-slate-400"
              title="Exit Walkthrough Mode"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Step dots */}
        <div className="px-5 pb-3 flex justify-between gap-1 overflow-x-auto select-none border-t border-slate-800/40 pt-2.5 bg-slate-950/20">
          {WALKTHROUGH_STEPS.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => setStep(idx, navigate)}
              className={`flex-1 text-[10px] py-1.5 px-2 rounded font-mono font-bold border transition-all text-center min-w-[70px] truncate cursor-pointer ${
                currentStepIndex === idx
                  ? "bg-gradient-to-r from-indigo-600 to-indigo-500 border-indigo-400 text-white shadow-md shadow-indigo-950"
                  : "bg-slate-950/40 border-slate-900 text-slate-500 hover:text-slate-300 hover:bg-slate-900"
              }`}
            >
              Step {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* ==================== 1. BRAND SPLaSH SCREEN OVERLAY ==================== */}
      <AnimatePresence>
        {showSplashOverlay && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0A0D16] z-50 flex flex-col items-center justify-center font-sans"
          >
            {/* Glowing background shapes */}
            <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full blur-[100px] bg-indigo-600/10 animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px] bg-cyan-500/10 animate-pulse" />
            
            <div className="relative text-center space-y-6 max-w-xl px-6">
              {/* Dynamic Logo */}
              <motion.div 
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 1.2, type: "spring" }}
                className="w-24 h-24 rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(123,108,250,0.55)]"
              >
                <span className="text-4xl font-extrabold text-white font-display">O</span>
              </motion.div>

              <div className="space-y-2">
                <motion.h1 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl font-extrabold text-white tracking-tight font-display"
                >
                  ORCHESTRIX
                </motion.h1>
                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-xs tracking-widest font-mono text-cyan-400 uppercase"
                >
                  Enterprise Swarm Intelligence Operating System
                </motion.p>
              </div>

              {/* Streaming loading details */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ delay: 0.8 }}
                className="p-4 bg-slate-900/60 border border-white/5 rounded-xl text-left font-mono text-[10px] text-slate-400 space-y-1.5 max-w-sm mx-auto shadow-inner"
              >
                <div className="flex gap-2">
                  <span className="text-cyan-400 font-bold">✔</span>
                  <span>Swarm kernel core initialized</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-cyan-400 font-bold">✔</span>
                  <span>Connecting file system persistent storage (db.json)</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-indigo-400 animate-pulse">●</span>
                  <span>Booting 8 expert cognitive agents online</span>
                </div>
              </motion.div>

              <div className="w-48 bg-slate-900 h-1.5 rounded-full mx-auto overflow-hidden border border-white/5">
                <div className="bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 h-full w-2/3 animate-pulse" />
              </div>

              <p className="text-[10px] text-gray-500 font-mono tracking-wide uppercase">Press Play to begin walkthrough sequence</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== 2. SECURE MFA LOGIN SIMULATION OVERLAY ==================== */}
      <AnimatePresence>
        {showLoginOverlay && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/90 z-40 flex items-center justify-center font-sans p-4"
          >
            <div className="bg-[#111625] border border-indigo-500/30 rounded-2xl w-full max-w-md p-6 md:p-8 shadow-2xl relative overflow-hidden">
              {/* Backglow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="text-center space-y-2 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center mx-auto text-white shadow-lg">
                  <Lock className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight font-display">Workspace Access Center</h2>
                <p className="text-xs text-gray-400">Provide credentials for secure tenant-isolated workspace routing</p>
              </div>

              <div className="space-y-4 font-sans text-left">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-cyan-400 uppercase mb-1">Tenant Organization</label>
                  <input 
                    type="text" 
                    value="Meridian Advisory" 
                    disabled 
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">Security Username</label>
                  <input 
                    type="text" 
                    value="reviewer@orchestrix.io" 
                    disabled 
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">Password Key</label>
                  <input 
                    type="password" 
                    value="••••••••••••••••" 
                    disabled 
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-slate-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button 
                    onClick={() => {
                      setLoginOverlay(false);
                      nextStep(navigate);
                    }}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-lg shadow-indigo-950/50 flex items-center justify-center gap-2 transition-all"
                  >
                    <CheckCircle className="w-4 h-4 text-cyan-300" />
                    Verify & Authenticate Client
                  </button>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-white/5 text-center font-mono text-[9px] text-slate-500">
                ORCHESTRIX SECURITY CONTAINER // COMPLIANT WITH SOC2 STANDARDS
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== 9. ACQUISITION OVERLAY CARD ==================== */}
      <AnimatePresence>
        {showAcquisitionOverlay && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#070911]/95 z-40 flex items-center justify-center font-sans p-4"
          >
            {/* Ambient Background Glows */}
            <div className="absolute top-10 right-10 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />

            <div className="bg-slate-900/60 border border-indigo-500/30 rounded-3xl w-full max-w-2xl p-8 md:p-12 shadow-[0_0_100px_rgba(99,102,241,0.2)] text-center relative overflow-hidden backdrop-blur-md">
              <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 font-mono font-bold text-[10px] tracking-widest uppercase px-5 py-1.5 rounded-bl-xl shadow-md">
                Available for Acquisition
              </div>

              <div className="space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-400 flex items-center justify-center mx-auto text-white text-2xl font-extrabold shadow-lg">
                  O
                </div>

                <div className="space-y-2">
                  <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight font-display">ORCHESTRIX</h1>
                  <h3 className="text-sm md:text-base font-semibold text-cyan-400 font-mono uppercase tracking-wider">Enterprise Swarm Intelligence Platform</h3>
                </div>

                <p className="text-xs md:text-sm text-gray-300 leading-relaxed max-w-lg mx-auto">
                  A production-ready SaaS application for managing multi-agent workflows, real-time telemetry pipelines, and customized business automation. Perfect for agencies, entrepreneurs, and startups looking to launch an enterprise-grade AI service.
                </p>

                {/* Developer Checklist Specs */}
                <div className="grid grid-cols-2 gap-3 max-w-md mx-auto text-left font-mono text-[10px] text-indigo-200 mt-6 pt-6 border-t border-white/5">
                  <div className="flex gap-2 items-center">
                    <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>React 19 + TypeScript</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Node.js / Express Server</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Gemini API Integrated</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Tailwind CSS v4 Styling</span>
                  </div>
                  <div className="flex gap-2 items-center col-span-2">
                    <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-amber-300 font-bold">SOC2 MFA Login & Reset States</span>
                  </div>
                </div>

                <div className="pt-6 flex flex-col sm:flex-row gap-3 justify-center">
                  <button 
                    onClick={() => {
                      setAcquisitionOverlay(false);
                      stopWalkthrough();
                    }}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Restart Main Application
                  </button>
                  <a 
                    href="mailto:moeedkhokhar458@gmail.com?subject=Orchestrix%20Acquisition%20Inquiry"
                    className="px-6 py-2.5 bg-slate-800 border border-white/10 hover:border-cyan-500/30 text-white hover:text-cyan-400 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Inquire Acquisition
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
