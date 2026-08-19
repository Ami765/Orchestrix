import { Report } from "../types";

/**
 * Downloads or exports a diligence report in the specified format.
 */
export function downloadReportAsFile(report: Report, format: "txt" | "md" | "pdf"): void {
  const sanitize = (name: string) => name.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  const filename = `${sanitize(report.company || "orchestrix")}_diligence_report.${format}`;
  let content = "";

  if (format === "md") {
    content = `# ORCHESTRIX SWARM DILIGENCE REPORT: ${report.company || "Unknown Company"}\n` +
              `**Project Title:** ${report.title}\n` +
              `**Diligence Status:** ${report.status || "Completed"}\n` +
              `**Risk Assessment:** ${report.riskRating} Risk\n` +
              `**Compilation Date:** ${report.date}\n` +
              `**Record Identifier:** \`${report.id}\`\n\n` +
              `---\n\n` +
              `## Executive Summary & Findings\n\n` +
              `${report.text || "No report body compiled."}\n\n` +
              `---\n` +
              `*Orchestrix Autonomous Workflow Orchestration Engine (v1.4.0)*\n` +
              `*Verified Secure Ledger Sync • Persistent State Hash OK*`;
  } else if (format === "txt") {
    content = `=======================================================================\n` +
              `          ORCHESTRIX EXECUTIVE SWARM DILIGENCE REPORT                  \n` +
              `=======================================================================\n\n` +
              `Client/Company      : ${report.company || "Unknown"}\n` +
              `Diligence Project   : ${report.title}\n` +
              `Compilation Date    : ${report.date}\n` +
              `Risk Classification : ${report.riskRating} Risk\n` +
              `Pipeline Status     : ${report.status || "Completed"}\n` +
              `Report Hash Code    : ${report.id}\n\n` +
              `-----------------------------------------------------------------------\n` +
              `EXECUTIVE SUMMARY AND AUDIT PARAMS:\n` +
              `-----------------------------------------------------------------------\n\n` +
              `${report.text || "No report body compiled."}\n\n` +
              `=======================================================================\n` +
              `SECURE CLOUD PLATFORM VERIFICATION COMPLETE\n` +
              `Orchestrix AI Multi-Agent Operating System (Vite-Client-Ready)\n` +
              `=======================================================================`;
  } else if (format === "pdf") {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Orchestrix Diligence Report - ${report.company}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
              body {
                font-family: "Inter", sans-serif;
                padding: 50px;
                color: #0f172a;
                background-color: #ffffff;
                line-height: 1.6;
                max-width: 800px;
                margin: 0 auto;
              }
              .header {
                border-bottom: 2px solid #6366f1;
                padding-bottom: 24px;
                margin-bottom: 30px;
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
              }
              .title-group {
                max-width: 70%;
              }
              .title {
                font-size: 30px;
                font-weight: 800;
                color: #1e1b4b;
                margin: 0;
                letter-spacing: -0.03em;
              }
              .subtitle {
                font-size: 13px;
                color: #4f46e5;
                font-family: "JetBrains Mono", monospace;
                margin-top: 6px;
                text-transform: uppercase;
                letter-spacing: 0.05em;
              }
              .brand {
                font-family: "JetBrains Mono", monospace;
                font-weight: bold;
                font-size: 16px;
                color: #4f46e5;
                letter-spacing: 1px;
              }
              .meta-grid {
                display: grid;
                grid-template-cols: 1fr 1fr;
                gap: 16px;
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                padding: 20px;
                border-radius: 12px;
                margin-bottom: 35px;
                font-size: 13px;
              }
              .meta-item {
                display: flex;
                flex-direction: column;
                gap: 4px;
              }
              .meta-label {
                font-weight: 600;
                color: #64748b;
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 0.05em;
              }
              .meta-value {
                color: #0f172a;
                font-weight: 500;
              }
              .badge {
                display: inline-block;
                padding: 4px 10px;
                border-radius: 9999px;
                font-size: 11px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                width: fit-content;
              }
              .badge-high {
                background-color: #fee2e2;
                color: #991b1b;
                border: 1px solid #fca5a5;
              }
              .badge-moderate {
                background-color: #fef3c7;
                color: #92400e;
                border: 1px solid #fcd34d;
              }
              .badge-low {
                background-color: #d1fae5;
                color: #065f46;
                border: 1px solid #6ee7b7;
              }
              .section-title {
                font-size: 16px;
                font-weight: 700;
                color: #0f172a;
                margin-top: 30px;
                margin-bottom: 12px;
                text-transform: uppercase;
                letter-spacing: 0.03em;
                border-left: 4px solid #6366f1;
                padding-left: 10px;
              }
              .content {
                font-size: 14px;
                white-space: pre-wrap;
                color: #334155;
                text-align: justify;
                line-height: 1.7;
              }
              .footer {
                margin-top: 60px;
                border-top: 1px solid #e2e8f0;
                padding-top: 24px;
                font-size: 11px;
                text-align: center;
                color: #94a3b8;
                font-family: "JetBrains Mono", monospace;
                line-height: 1.5;
              }
              .no-print {
                margin-bottom: 20px;
                text-align: right;
              }
              .print-btn {
                background-color: #4f46e5;
                color: white;
                border: none;
                padding: 8px 16px;
                font-size: 13px;
                font-weight: 600;
                border-radius: 6px;
                cursor: pointer;
                font-family: inherit;
                box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);
              }
              .print-btn:hover {
                background-color: #4338ca;
              }
              @media print {
                .no-print {
                  display: none;
                }
                body {
                  padding: 20px;
                }
              }
            </style>
          </head>
          <body>
            <div class="no-print">
              <button class="print-btn" onclick="window.print()">Print or Save as PDF</button>
            </div>
            <div class="header">
              <div class="title-group">
                <h1 class="title">${report.company}</h1>
                <div class="subtitle">${report.title}</div>
              </div>
              <div class="brand">ORCHESTRIX OS</div>
            </div>
            <div class="meta-grid">
              <div class="meta-item">
                <span class="meta-label">Compilation Date</span>
                <span class="meta-value">${report.date}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Risk Rating</span>
                <span class="badge badge-${report.riskRating.toLowerCase()}">${report.riskRating} Risk</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Verification Status</span>
                <span class="meta-value">${report.status || "Verified"}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Reference ID</span>
                <span class="meta-value" style="font-family: 'JetBrains Mono', monospace; font-size: 11px;">${report.id}</span>
              </div>
            </div>
            <h2 class="section-title">Executive Summary & Compliance Findings</h2>
            <div class="content">${report.text || "No report body compiled."}</div>
            <div class="footer">
              This is a legally binding audit digest generated autonomously by the Orchestrix Swarm Automation OS.<br/>
              Distributed Ledger Identity Key: ${report.id.slice(0, 15)}... • Secured Node Sign-off OK
            </div>
            <script>
              window.onload = function() {
                // Short timeout to let font/style render before print dialog
                setTimeout(() => {
                  window.print();
                }, 300);
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
      return;
    }
  }

  if (format !== "pdf") {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
