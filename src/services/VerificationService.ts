import { verificationApi, EmailVerificationConfig } from "../api";

export class VerificationService {
  /**
   * Retrieves the current email setup config and profile verification status
   */
  public static async getConfig(): Promise<EmailVerificationConfig> {
    return verificationApi.getConfig();
  }

  /**
   * Saves updated email setup config (provider, host, template)
   */
  public static async saveConfig(config: Partial<EmailVerificationConfig["emailSetup"]>): Promise<any> {
    return verificationApi.saveConfig(config);
  }

  /**
   * Generates and triggers dispatch of a new verification code
   */
  public static async sendVerification(): Promise<{
    success: boolean;
    mode: "smtp" | "simulator";
    code?: string;
    fallback?: boolean;
    error?: string;
    message: string;
  }> {
    return verificationApi.sendVerification();
  }

  /**
   * Submits a 6-digit verification code to confirm user email address ownership
   */
  public static async verifyCode(code: string): Promise<{ success: boolean; message: string }> {
    if (!code || code.trim().length !== 6) {
      throw new Error("Verification code must be exactly 6 characters.");
    }
    return verificationApi.verifyCode(code.trim());
  }
}
