import { request } from "./client";

export interface EmailVerificationConfig {
  email: string;
  name: string;
  emailVerified: boolean;
  emailSetup: {
    provider: "smtp" | "resend" | "simulator";
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPass?: string;
    fromEmail?: string;
    subjectTemplate?: string;
    bodyTemplate?: string;
  };
}

export const verificationApi = {
  getConfig: async () => {
    return request<EmailVerificationConfig>("/auth/email-verification/config");
  },
  saveConfig: async (config: Partial<EmailVerificationConfig["emailSetup"]>) => {
    return request<{ success: boolean; message: string }>("/auth/email-verification/config", {
      method: "POST",
      body: JSON.stringify(config),
    });
  },
  sendVerification: async () => {
    return request<{
      success: boolean;
      mode: "smtp" | "simulator";
      code?: string;
      fallback?: boolean;
      error?: string;
      message: string;
    }>("/auth/email-verification/send", {
      method: "POST",
    });
  },
  verifyCode: async (code: string) => {
    return request<{ success: boolean; message: string }>("/auth/email-verification/verify", {
      method: "POST",
      body: JSON.stringify({ code }),
    });
  },
};
