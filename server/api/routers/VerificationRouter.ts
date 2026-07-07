import { Router, Request, Response } from "express";
import { dbPool } from "../../config/database";
import { LangGraphOrchestrator } from "../../orchestration/LangGraphOrchestrator";
import nodemailer from "nodemailer";

const router = Router();

// Retrieve current email verification status and settings config
router.get("/auth/email-verification/config", (req: Request, res: Response) => {
  const settings = dbPool.db.settings;
  res.json({
    email: settings.profile.email,
    name: settings.profile.name,
    emailVerified: !!settings.profile.emailVerified,
    emailSetup: settings.emailSetup || {
      provider: "simulator",
      smtpHost: "smtp.mailtrap.io",
      smtpPort: 2525,
      smtpUser: "",
      smtpPass: "",
      fromEmail: "noreply@orchestrix.io",
      subjectTemplate: "Verify your Orchestrix Account",
      bodyTemplate: "Hello {{name}},\n\nYour Orchestrix verification code is: {{code}}\n\nThis code will expire in 15 minutes.\n\nBest regards,\nOrchestrix Team"
    }
  });
});

// Update email verification setup configuration
router.post("/auth/email-verification/config", (req: Request, res: Response) => {
  const { provider, smtpHost, smtpPort, smtpUser, smtpPass, fromEmail, subjectTemplate, bodyTemplate } = req.body;
  const ip = req.ip || "127.0.0.1";

  try {
    dbPool.executeTransaction("UPDATE_EMAIL_VERIFICATION_CONFIG", () => {
      dbPool.db.settings.emailSetup = {
        provider: provider || "simulator",
        smtpHost: smtpHost || "",
        smtpPort: Number(smtpPort) || 587,
        smtpUser: smtpUser || "",
        smtpPass: smtpPass || "",
        fromEmail: fromEmail || "noreply@orchestrix.io",
        subjectTemplate: subjectTemplate || "Verify your Orchestrix Account",
        bodyTemplate: bodyTemplate || "Hello {{name}},\n\nYour Orchestrix verification code is: {{code}}\n\nThis code will expire in 15 minutes."
      };
      dbPool.save();
    });

    LangGraphOrchestrator.writeAuditLog(
      dbPool.db.settings.profile.name,
      "CONFIGURE_EMAIL_VERIFICATION",
      "settings.emailSetup",
      ip,
      "success"
    );

    res.json({ success: true, message: "Email configuration saved successfully." });
  } catch (error: any) {
    console.error("[VerificationRouter] Config save failed:", error);
    res.status(500).json({ error: `Failed to save configuration: ${error.message || error}` });
  }
});

// Send verification email (Real or Simulator fallback)
router.post("/auth/email-verification/send", async (req: Request, res: Response) => {
  const settings = dbPool.db.settings;
  const profile = settings.profile;
  const emailSetup = settings.emailSetup || {
    provider: "simulator",
    smtpHost: "smtp.mailtrap.io",
    smtpPort: 2525,
    smtpUser: "",
    smtpPass: "",
    fromEmail: "noreply@orchestrix.io",
    subjectTemplate: "Verify your Orchestrix Account",
    bodyTemplate: "Hello {{name}},\n\nYour Orchestrix verification code is: {{code}}\n\nThis code will expire in 15 minutes."
  };

  const ip = req.ip || "127.0.0.1";

  // Generate a random 6-digit verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 min expiry

  // Update profile with verification details
  dbPool.db.settings.profile.verificationCode = code;
  dbPool.db.settings.profile.verificationExpiresAt = expiresAt;
  dbPool.save();

  // Render subject and body templates
  const subject = (emailSetup.subjectTemplate || "Verify your Orchestrix Account")
    .replace(/\{\{name\}\}/g, profile.name)
    .replace(/\{\{code\}\}/g, code);
    
  const body = (emailSetup.bodyTemplate || "Your verification code is: {{code}}")
    .replace(/\{\{name\}\}/g, profile.name)
    .replace(/\{\{code\}\}/g, code);

  // Write a simulated database query log for traceability
  dbPool.executeQuery(
    `INSERT INTO email_spool (recipient, subject, status) VALUES ('${profile.email}', '${subject}', 'PENDING')`,
    "INSERT",
    "analyses"
  );

  if (emailSetup.provider === "smtp" && emailSetup.smtpHost && emailSetup.smtpUser && emailSetup.smtpPass) {
    try {
      console.log(`[VerificationRouter] Attemping real SMTP dispatch via ${emailSetup.smtpHost}:${emailSetup.smtpPort}`);
      
      const transporter = nodemailer.createTransport({
        host: emailSetup.smtpHost,
        port: Number(emailSetup.smtpPort || 587),
        secure: Number(emailSetup.smtpPort) === 465,
        auth: {
          user: emailSetup.smtpUser,
          pass: emailSetup.smtpPass
        }
      });

      await transporter.sendMail({
        from: `"${profile.name} via Orchestrix" <${emailSetup.fromEmail || "noreply@orchestrix.io"}>`,
        to: profile.email,
        subject: subject,
        text: body,
        html: body.replace(/\n/g, "<br/>")
      });

      // Update email logs
      dbPool.executeQuery(
        `UPDATE email_spool SET status = 'SENT', delivered_at = NOW() WHERE recipient = '${profile.email}'`,
        "UPDATE",
        "analyses"
      );

      LangGraphOrchestrator.writeAuditLog(
        "System Mailer",
        "SEND_VERIFICATION_EMAIL",
        `SMTP:${profile.email}`,
        ip,
        "success"
      );

      return res.json({
        success: true,
        mode: "smtp",
        message: `Verification code dispatched to ${profile.email} via SMTP.`
      });

    } catch (err: any) {
      console.error("[VerificationRouter] SMTP delivery failed, falling back to simulator mode:", err);
      
      dbPool.executeQuery(
        `UPDATE email_spool SET status = 'FAILED', error = '${err.message || err}' WHERE recipient = '${profile.email}'`,
        "UPDATE",
        "analyses"
      );

      LangGraphOrchestrator.writeAuditLog(
        "System Mailer",
        "SMTP_VERIFICATION_FAILURE",
        `SMTP_ERR:${profile.email}`,
        ip,
        "failure"
      );

      // Graceful fallback to simulator so developer experience remains outstanding
      return res.json({
        success: true,
        mode: "simulator",
        fallback: true,
        error: `SMTP server communication failed (${err.message}). High-fidelity email simulator triggered as fallback.`,
        code: code,
        message: `Verification code generated in offline simulator mode: ${code}`
      });
    }
  } else {
    // High-fidelity Simulator Mode
    console.log(`[VerificationRouter] Running in simulator mode. Code: ${code}`);
    await new Promise((resolve) => setTimeout(resolve, 800));

    dbPool.executeQuery(
      `UPDATE email_spool SET status = 'SIMULATED', delivered_at = NOW() WHERE recipient = '${profile.email}'`,
      "UPDATE",
      "analyses"
    );

    LangGraphOrchestrator.writeAuditLog(
      "Simulator Mailer",
      "SIMULATE_VERIFICATION_EMAIL",
      `SIM:${profile.email}`,
      ip,
      "success"
    );

    return res.json({
      success: true,
      mode: "simulator",
      code: code,
      message: `Offline Simulator: Email sent to ${profile.email}. Use code ${code} to verify.`
    });
  }
});

// Verify Submitted Verification Code
router.post("/auth/email-verification/verify", (req: Request, res: Response) => {
  const { code } = req.body;
  const profile = dbPool.db.settings.profile;
  const ip = req.ip || "127.0.0.1";

  if (!code) {
    return res.status(400).json({ error: "Verification code is required." });
  }

  dbPool.executeQuery(
    `SELECT verification_code, expires_at FROM active_verifications WHERE email = '${profile.email}'`,
    "SELECT",
    "analyses"
  );

  if (!profile.verificationCode || profile.verificationCode !== code) {
    LangGraphOrchestrator.writeAuditLog(
      profile.name,
      "EMAIL_VERIFY_ATTEMPT",
      "INCORRECT_CODE",
      ip,
      "failure"
    );

    return res.status(400).json({ error: "Invalid verification code. Please check and try again." });
  }

  // Check Expiry
  if (profile.verificationExpiresAt && new Date() > new Date(profile.verificationExpiresAt)) {
    LangGraphOrchestrator.writeAuditLog(
      profile.name,
      "EMAIL_VERIFY_ATTEMPT",
      "CODE_EXPIRED",
      ip,
      "failure"
    );

    return res.status(400).json({ error: "Verification code has expired. Please request a new one." });
  }

  // Verification Success
  try {
    dbPool.executeTransaction("VERIFY_PROFILE_EMAIL", () => {
      dbPool.db.settings.profile.emailVerified = true;
      delete dbPool.db.settings.profile.verificationCode;
      delete dbPool.db.settings.profile.verificationExpiresAt;
      dbPool.save();
    });

    dbPool.executeQuery(
      `UPDATE auth_users SET email_verified = true, verified_at = NOW() WHERE email = '${profile.email}'`,
      "UPDATE",
      "analyses"
    );

    LangGraphOrchestrator.writeAuditLog(
      profile.name,
      "EMAIL_VERIFIED_SUCCESS",
      `SUCCESS:${profile.email}`,
      ip,
      "success"
    );

    res.json({
      success: true,
      message: "Congratulations! Your email address has been successfully verified."
    });
  } catch (err: any) {
    console.error("[VerificationRouter] Verification finalization failed:", err);
    res.status(500).json({ error: `Internal database error: ${err.message || err}` });
  }
});

export const VerificationRouter = router;
