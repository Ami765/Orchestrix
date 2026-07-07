import React, { useState, useEffect } from "react";
import { useWorkspaceStore, useUIStore } from "../store";
import { VerificationService } from "../services";
import { 
  Mail, 
  ShieldCheck, 
  ShieldAlert, 
  Server, 
  Send, 
  Key, 
  Loader2, 
  Check, 
  AlertCircle, 
  FileCode2, 
  Info,
  RefreshCw
} from "lucide-react";

export default function Settings() {
  const db = useWorkspaceStore((state) => state.db);
  const saveSettings = useWorkspaceStore((state) => state.saveSettings);

  const {
    settingsTab,
    setSettingsTab,
    settingsForm,
    setSettingsForm,
  } = useUIStore();

  // Verification-specific state
  const [emailConfig, setEmailConfig] = useState<any>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationMessage, setVerificationMessage] = useState<any>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  // Setup fields
  const [provider, setProvider] = useState<"smtp" | "simulator">("simulator");
  const [smtpHost, setSmtpHost] = useState("smtp.mailtrap.io");
  const [smtpPort, setSmtpPort] = useState(2525);
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [fromEmail, setFromEmail] = useState("noreply@orchestrix.io");
  const [subjectTemplate, setSubjectTemplate] = useState("Verify your Orchestrix Account");
  const [bodyTemplate, setBodyTemplate] = useState(
    "Hello {{name}},\n\nYour Orchestrix verification code is: {{code}}\n\nThis code will expire in 15 minutes.\n\nBest regards,\nOrchestrix Team"
  );

  const loadVerificationConfig = async () => {
    try {
      setConfigLoading(true);
      const data = await VerificationService.getConfig();
      setEmailConfig(data);
      if (data.emailSetup) {
        setProvider(data.emailSetup.provider === "resend" ? "simulator" : data.emailSetup.provider);
        setSmtpHost(data.emailSetup.smtpHost || "smtp.mailtrap.io");
        setSmtpPort(data.emailSetup.smtpPort || 2525);
        setSmtpUser(data.emailSetup.smtpUser || "");
        setSmtpPass(data.emailSetup.smtpPass || "");
        setFromEmail(data.emailSetup.fromEmail || "noreply@orchestrix.io");
        setSubjectTemplate(data.emailSetup.subjectTemplate || "Verify your Orchestrix Account");
        setBodyTemplate(
          data.emailSetup.bodyTemplate || 
          "Hello {{name}},\n\nYour Orchestrix verification code is: {{code}}\n\nThis code will expire in 15 minutes."
        );
      }
    } catch (err: any) {
      console.error("Failed to retrieve verification config:", err);
    } finally {
      setConfigLoading(false);
    }
  };

  useEffect(() => {
    if (settingsTab === "verification") {
      loadVerificationConfig();
    }
  }, [settingsTab]);

  if (!db) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveSettings(
        {
          name: settingsForm.profileName,
          email: settingsForm.profileEmail,
          role: settingsForm.profileRole,
        },
        {
          name: settingsForm.workspaceName,
          defaultWorkflow: settingsForm.defaultWorkflow,
        }
      );
      alert("Settings updated successfully!");
    } catch (err) {
      console.error("Failed to save settings:", err);
      alert("Failed to save settings.");
    }
  };

  const handleSaveEmailConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await VerificationService.saveConfig({
        provider,
        smtpHost,
        smtpPort: Number(smtpPort),
        smtpUser,
        smtpPass,
        fromEmail,
        subjectTemplate,
        bodyTemplate
      });
      alert("Email verification configuration saved successfully!");
      await loadVerificationConfig();
    } catch (err: any) {
      alert("Failed to save email config: " + err.message);
    }
  };

  const handleSendVerificationCode = async () => {
    try {
      setIsSendingCode(true);
      setVerificationError(null);
      setVerificationMessage(null);
      const res = await VerificationService.sendVerification();
      if (res.success) {
        setVerificationMessage(res);
      } else {
        setVerificationError(res.error || "Failed to dispatch verification code.");
      }
    } catch (err: any) {
      setVerificationError(err.message || "Failed to execute mailing operation.");
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCodeSubmit = async () => {
    if (!verificationCode || verificationCode.trim().length !== 6) {
      setVerificationError("Please enter a valid 6-digit code.");
      return;
    }
    try {
      setIsVerifyingCode(true);
      setVerificationError(null);
      const res = await VerificationService.verifyCode(verificationCode);
      if (res.success) {
        alert(res.message);
        setVerificationCode("");
        setVerificationMessage(null);
        await loadVerificationConfig();
        // Sync database store
        const fetchDb = useWorkspaceStore.getState().fetchDb;
        if (fetchDb) await fetchDb();
      }
    } catch (err: any) {
      setVerificationError(err.message || "Verification code is incorrect or expired.");
    } finally {
      setIsVerifyingCode(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="settings_view">
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-xl font-display font-bold text-white">System Settings</h1>
        <p className="text-xs text-gray-400 mt-1">Manage profile properties, workspace defaults, connected models, and email verification gateways.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left sidebar tabs */}
        <div className="flex flex-col gap-1 border-r border-white/5 pr-4">
          <button 
            type="button"
            onClick={() => setSettingsTab("profile")}
            className={`text-left px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              settingsTab === "profile" ? "bg-indigo-600/10 border-l-2 border-indigo-500 text-indigo-400" : "text-gray-400 hover:text-white"
            }`}
          >
            Workspace Profile
          </button>
          <button 
            type="button"
            onClick={() => setSettingsTab("workspace")}
            className={`text-left px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              settingsTab === "workspace" ? "bg-indigo-600/10 border-l-2 border-indigo-500 text-indigo-400" : "text-gray-400 hover:text-white"
            }`}
          >
            Workspace Details
          </button>
          <button 
            type="button"
            onClick={() => setSettingsTab("models")}
            className={`text-left px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              settingsTab === "models" ? "bg-indigo-600/10 border-l-2 border-indigo-500 text-indigo-400" : "text-gray-400 hover:text-white"
            }`}
          >
            Primary AI Models
          </button>
          <button 
            type="button"
            onClick={() => setSettingsTab("verification")}
            className={`text-left px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              settingsTab === "verification" ? "bg-indigo-600/10 border-l-2 border-indigo-500 text-indigo-400" : "text-gray-400 hover:text-white"
            }`}
          >
            Email Verification
          </button>
        </div>

        {/* Right form container */}
        <div className="lg:col-span-3 bg-[#131826] border border-white/10 rounded-xl p-5 shadow-lg">
          {settingsTab !== "verification" && (
            <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
              {settingsTab === "profile" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-300 font-semibold block">Full Name</label>
                    <input 
                      type="text" 
                      value={settingsForm.profileName}
                      onChange={(e) => setSettingsForm({ profileName: e.target.value })}
                      className="w-full bg-[#0A0D16] border border-white/10 rounded-lg p-2.5 text-xs text-white outline-none focus:border-indigo-500 transition-all font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-gray-300 font-semibold block">Email address</label>
                    <input 
                      type="email" 
                      value={settingsForm.profileEmail}
                      onChange={(e) => setSettingsForm({ profileEmail: e.target.value })}
                      className="w-full bg-[#0A0D16] border border-white/10 rounded-lg p-2.5 text-xs text-white outline-none focus:border-indigo-500 transition-all font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-gray-300 font-semibold block">Account Role</label>
                    <select 
                      value={settingsForm.profileRole}
                      onChange={(e) => setSettingsForm({ profileRole: e.target.value })}
                      className="w-full bg-[#0A0D16] border border-white/10 rounded-lg p-2.5 text-xs text-white outline-none focus:border-indigo-500 transition-all font-sans"
                    >
                      <option value="Reviewer">Reviewer</option>
                      <option value="Admin">Admin</option>
                      <option value="Analyst">Analyst</option>
                    </select>
                  </div>
                </div>
              )}

              {settingsTab === "workspace" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-300 font-semibold block">Workspace Title</label>
                    <input 
                      type="text" 
                      value={settingsForm.workspaceName}
                      onChange={(e) => setSettingsForm({ workspaceName: e.target.value })}
                      className="w-full bg-[#0A0D16] border border-white/10 rounded-lg p-2.5 text-xs text-white outline-none focus:border-indigo-500 transition-all font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-gray-300 font-semibold block">Default Deployment Directive</label>
                    <select 
                      value={settingsForm.defaultWorkflow}
                      onChange={(e) => setSettingsForm({ defaultWorkflow: e.target.value })}
                      className="w-full bg-[#0A0D16] border border-white/10 rounded-lg p-2.5 text-xs text-white outline-none focus:border-indigo-500 transition-all font-sans"
                    >
                      <option value="Full diligence review">Full diligence review</option>
                      <option value="Vendor risk scan">Vendor risk scan</option>
                      <option value="Covenant compliance check">Covenant compliance check</option>
                    </select>
                  </div>
                </div>
              )}

              {settingsTab === "models" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-300 font-semibold block">Swarm Intelligence Model</label>
                    <select 
                      disabled
                      className="w-full bg-[#0A0D16] border border-white/10 rounded-lg p-2.5 text-xs text-gray-500 outline-none transition-all font-sans cursor-not-allowed"
                    >
                      <option>Gemini 3.5 Flash (Operational)</option>
                    </select>
                    <span className="text-[10px] text-indigo-400 font-mono block mt-1">Auto-calibrated for low latency and high reasoning consistency.</span>
                  </div>
                </div>
              )}

              <div className="pt-4">
                <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-semibold text-white select-none transition-all cursor-pointer">
                  Save Workspace Changes
                </button>
              </div>
            </form>
          )}

          {settingsTab === "verification" && (
            <div className="space-y-6 animate-fade-in">
              {configLoading ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                  <span className="text-xs font-mono text-gray-400">Loading SMTP Gateway Settings...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                  
                  {/* Left Column: Config Form */}
                  <div className="xl:col-span-7 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                      <Server className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-bold uppercase tracking-wider font-mono text-indigo-400">SMTP Gateway Configuration</span>
                    </div>

                    <form onSubmit={handleSaveEmailConfig} className="space-y-4">
                      
                      {/* Provider Toggle */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-mono font-bold text-gray-400">DELIVERY PROVIDER</label>
                        <div className="flex rounded-lg bg-slate-900/60 p-0.5 border border-white/5 text-xs max-w-xs">
                          <button
                            type="button"
                            onClick={() => setProvider("simulator")}
                            className={`flex-1 py-1 px-2.5 rounded-md font-mono transition-all cursor-pointer text-[11px] ${
                              provider === "simulator"
                                ? "bg-slate-800 text-white font-bold"
                                : "text-gray-400 hover:text-white"
                            }`}
                          >
                            Simulator (Default)
                          </button>
                          <button
                            type="button"
                            onClick={() => setProvider("smtp")}
                            className={`flex-1 py-1 px-2.5 rounded-md font-mono transition-all cursor-pointer text-[11px] ${
                              provider === "smtp"
                                ? "bg-slate-800 text-white font-bold"
                                : "text-gray-400 hover:text-white"
                            }`}
                          >
                            Real SMTP
                          </button>
                        </div>
                        <span className="text-[10px] text-gray-500 font-mono block">
                          {provider === "simulator" 
                            ? "Generates codes immediately inside sandbox for safe local auditing."
                            : "Sends raw transactional code links using active mail relay servers."}
                        </span>
                      </div>

                      {provider === "smtp" && (
                        <div className="grid grid-cols-3 gap-3 p-3 bg-slate-900/40 border border-white/5 rounded-xl animate-fade-in">
                          <div className="col-span-2 space-y-1">
                            <label className="text-[10px] font-mono font-bold text-gray-400">SMTP HOST</label>
                            <input 
                              type="text"
                              value={smtpHost}
                              onChange={(e) => setSmtpHost(e.target.value)}
                              placeholder="smtp.example.com"
                              className="w-full bg-[#0A0D16] border border-white/5 rounded-lg p-2 text-xs text-white outline-none font-mono"
                              required
                            />
                          </div>
                          <div className="col-span-1 space-y-1">
                            <label className="text-[10px] font-mono font-bold text-gray-400">PORT</label>
                            <input 
                              type="number"
                              value={smtpPort}
                              onChange={(e) => setSmtpPort(Number(e.target.value))}
                              placeholder="587"
                              className="w-full bg-[#0A0D16] border border-white/5 rounded-lg p-2 text-xs text-white outline-none font-mono"
                              required
                            />
                          </div>

                          <div className="col-span-3 h-[1px] bg-white/5 my-1" />

                          <div className="col-span-3 sm:col-span-1.5 space-y-1">
                            <label className="text-[10px] font-mono font-bold text-gray-400">SMTP USERNAME</label>
                            <input 
                              type="text"
                              value={smtpUser}
                              onChange={(e) => setSmtpUser(e.target.value)}
                              placeholder="user@example.com"
                              className="w-full bg-[#0A0D16] border border-white/5 rounded-lg p-2 text-xs text-white outline-none font-mono"
                            />
                          </div>
                          <div className="col-span-3 sm:col-span-1.5 space-y-1">
                            <label className="text-[10px] font-mono font-bold text-gray-400">SMTP PASSWORD</label>
                            <input 
                              type="password"
                              value={smtpPass}
                              onChange={(e) => setSmtpPass(e.target.value)}
                              placeholder="••••••••••••"
                              className="w-full bg-[#0A0D16] border border-white/5 rounded-lg p-2 text-xs text-white outline-none font-mono"
                            />
                          </div>
                        </div>
                      )}

                      {/* General Setup */}
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono font-bold text-gray-400">FROM ADDRESS</label>
                          <input 
                            type="email"
                            value={fromEmail}
                            onChange={(e) => setFromEmail(e.target.value)}
                            placeholder="noreply@orchestrix.io"
                            className="w-full bg-[#0A0D16] border border-white/10 rounded-lg p-2.5 text-xs text-white outline-none focus:border-indigo-500 font-mono"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono font-bold text-gray-400">SUBJECT TEMPLATE</label>
                          <input 
                            type="text"
                            value={subjectTemplate}
                            onChange={(e) => setSubjectTemplate(e.target.value)}
                            placeholder="Verify your Orchestrix Account"
                            className="w-full bg-[#0A0D16] border border-white/10 rounded-lg p-2.5 text-xs text-white outline-none focus:border-indigo-500 font-sans font-medium"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-mono font-bold text-gray-400">BODY HTML / PLAIN TEXT</label>
                            <span className="text-[9px] text-gray-500 font-mono">tokens: {"{{name}}"}, {"{{code}}"}</span>
                          </div>
                          <textarea 
                            value={bodyTemplate}
                            onChange={(e) => setBodyTemplate(e.target.value)}
                            rows={4}
                            className="w-full bg-[#0A0D16] border border-white/10 rounded-lg p-2.5 text-xs text-white outline-none focus:border-indigo-500 font-mono leading-relaxed"
                            required
                          />
                        </div>
                      </div>

                      <button 
                        type="submit" 
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold select-none transition-all cursor-pointer"
                      >
                        Save Configuration Settings
                      </button>
                    </form>
                  </div>

                  {/* Right Column: Execution Portal */}
                  <div className="xl:col-span-5 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                      <Mail className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-bold uppercase tracking-wider font-mono text-cyan-400">Verification Hub</span>
                    </div>

                    {/* Current Verification Status Widget */}
                    <div className={`p-4 rounded-xl border flex items-center justify-between ${
                      emailConfig?.emailVerified 
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    }`}>
                      <div className="flex items-center gap-3">
                        {emailConfig?.emailVerified ? (
                          <div className="p-2 rounded-lg bg-emerald-500/20">
                            <ShieldCheck className="w-5 h-5 text-emerald-400" />
                          </div>
                        ) : (
                          <div className="p-2 rounded-lg bg-amber-500/20">
                            <ShieldAlert className="w-5 h-5 text-amber-400" />
                          </div>
                        )}
                        <div>
                          <div className="text-xs font-bold font-mono">
                            {emailConfig?.emailVerified ? "ACCOUNT SECURE & VERIFIED" : "VERIFICATION PENDING"}
                          </div>
                          <div className="text-[10px] text-gray-400 font-sans mt-0.5">
                            {emailConfig?.email}
                          </div>
                        </div>
                      </div>

                      {emailConfig?.emailVerified && (
                        <span className="text-[9px] font-mono uppercase bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          Verified
                        </span>
                      )}
                    </div>

                    {/* Code dispatch trigger */}
                    <div className="bg-[#0A0D16]/50 border border-white/5 rounded-xl p-4 space-y-4 text-xs">
                      <div className="space-y-1">
                        <span className="font-bold text-white block">Dispatch Verification Token</span>
                        <p className="text-[10px] text-gray-400">
                          Clicking below generates a cryptographically random, 6-digit verification code.
                        </p>
                      </div>

                      <button
                        onClick={handleSendVerificationCode}
                        disabled={isSendingCode}
                        type="button"
                        className={`w-full py-2 rounded-lg font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                          isSendingCode 
                            ? "bg-slate-800 text-gray-500" 
                            : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/10"
                        }`}
                      >
                        {isSendingCode ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Mailing Code...
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            Dispatch Verification Code
                          </>
                        )}
                      </button>

                      {/* Simulator feedback block if code was triggered */}
                      {verificationMessage && (
                        <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 rounded-lg space-y-2 animate-fade-in font-mono text-[11px]">
                          <div className="flex items-center gap-1.5 text-[10px] text-indigo-400 font-bold uppercase">
                            <Info className="w-3.5 h-3.5 shrink-0" />
                            {verificationMessage.fallback ? "SMTP Mail Failure (Offline Sandbox)" : "Delivery Spooled OK"}
                          </div>
                          <p className="text-[10px] leading-snug">
                            {verificationMessage.message}
                          </p>
                          {verificationMessage.code && (
                            <div className="bg-indigo-950 border border-indigo-500/30 p-2 text-center rounded text-white font-bold text-base tracking-[0.25em]">
                              {verificationMessage.code}
                            </div>
                          )}
                          <span className="text-[9px] text-indigo-400 block leading-snug">
                            Note: This notification simulator renders so you can verify the secure OTP flow locally!
                          </span>
                        </div>
                      )}

                      {/* Error feedback */}
                      {verificationError && (
                        <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-400 rounded-lg flex items-start gap-2 animate-fade-in text-[10px]">
                          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                          <div className="leading-snug">
                            <span className="font-bold block uppercase mb-0.5">Mailing Error</span>
                            {verificationError}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Entry verification form */}
                    <div className="bg-[#0A0D16]/50 border border-white/5 rounded-xl p-4 space-y-3.5 text-xs">
                      <div className="space-y-1">
                        <span className="font-bold text-white block">Submit Code Credentials</span>
                        <p className="text-[10px] text-gray-400">
                          Enter the 6-digit confirmation key to instantly lock and verify this workspace profile.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Key className="w-3.5 h-3.5 text-gray-500" />
                          </div>
                          <input 
                            type="text"
                            maxLength={6}
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                            placeholder="000000"
                            className="w-full bg-[#0A0D16] border border-white/10 rounded-lg p-2 pl-9 text-center font-mono font-bold tracking-[0.5em] text-white text-base outline-none focus:border-cyan-500"
                          />
                        </div>

                        <button
                          onClick={handleVerifyCodeSubmit}
                          disabled={isVerifyingCode || !verificationCode}
                          type="button"
                          className={`w-full py-2 rounded-lg font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                            isVerifyingCode || !verificationCode
                              ? "bg-slate-800 text-gray-500 cursor-not-allowed" 
                              : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/10"
                          }`}
                        >
                          {isVerifyingCode ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Verifying Code...
                            </>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              Submit Verification Key
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                  </div>

                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
