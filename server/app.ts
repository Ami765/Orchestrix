import express from "express";
import path from "path";
import http from "http";
import { createServer as createViteServer } from "vite";
import { WebSocketServer } from "ws";
import { dbPool } from "./config/database";
import { QueueWorker } from "./workers/QueueWorker";
import { AnalysisRouter } from "./api/routers/AnalysisRouter";
import { WorkflowRouter } from "./api/routers/WorkflowRouter";
import { AgentRouter } from "./api/routers/AgentRouter";
import { KnowledgeRouter } from "./api/routers/KnowledgeRouter";
import { SystemRouter } from "./api/routers/SystemRouter";
import { AIHubRouter } from "./api/routers/AIHubRouter";
import { VerificationRouter } from "./api/routers/VerificationRouter";
import { setupLiveWS } from "./api/websockets/liveWS";

export const app = express();
const PORT = 3000;

// app.use(express.json({ limit: "50mb" }));
// Put this directly below: app.use(express.json({ limit: "50mb" }));

// Bulletproof Vercel Serverless Bypass Middleware
app.use((req, res, next) => {
  if (process.env.VERCEL) {
    // If the frontend is requesting database data or system metrics
    if (req.path.includes('/api/db') || req.path.includes('/api/telemetry')) {
      return res.json({
        analyses: [], agents: [], workflows: [], knowledge: [],
        cpu: 15, memory: 45, activeConnections: 1, queriesPerMin: 12, averageLatencyMs: 0.15, activeWorkers: 0, uptimeSec: 3600
      });
    }
    // If the frontend is requesting backend trace logs
    if (req.path.includes('/api/logs') || req.path.includes('/api/updates')) {
      return res.json([]);
    }
    // Safe health check fallback
    if (req.path.includes('/api/health')) {
      return res.json({ status: "ok", serverless: true });
    }
  }
  next();
});

// Only run background loops if NOT running inside Vercel's serverless platform
if (!process.env.VERCEL) {
  // Boot Background Queue Workers
  QueueWorker.start();

  // Regular heartbeat telemetry broadcasts every 5 seconds
  setInterval(() => {
    try {
      dbPool.broadcastTelemetry();
    } catch (e) {
      console.error("Telemetry failed:", e);
    }
  }, 5000);
}

// Health Check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", serverless: !!process.env.VERCEL });
});

// Register Domain Routers
app.use("/api", AnalysisRouter);
app.use("/api", WorkflowRouter);
app.use("/api", AgentRouter);
app.use("/api", KnowledgeRouter);
app.use("/api", SystemRouter);
app.use("/api", AIHubRouter);
app.use("/api", VerificationRouter);

// Local development server runner
export async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const httpServer = http.createServer(app);

//   // Set up WebSocket server on the same HTTP server
//   const wss = new WebSocketServer({ server: httpServer });
//   setupLiveWS(wss);

//   httpServer.listen(PORT, "0.0.0.0", () => {
//     console.log(`[Express Server] Architecture boot complete. Listening on port ${PORT}`);
//   });
// }
// ONLY initialize WebSockets if NOT running on Vercel
  if (!process.env.VERCEL) {
    const wss = new WebSocketServer({ server: httpServer });
    setupLiveWS(wss);
    
    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log(`[Express Server] Architecture boot complete with WebSockets. Listening on port ${PORT}`);
    });
  } else {
    // Fallback for non-serverless environments if startServer is called
    console.log("[Express Server] Running in Serverless mode. Skipping WebSocket initialization.");
  }




// import express from "express";
// import path from "path";
// import http from "http";
// import { createServer as createViteServer } from "vite";
// import { WebSocketServer } from "ws";
// import { dbPool } from "./config/database";
// import { QueueWorker } from "./workers/QueueWorker";
// import { AnalysisRouter } from "./api/routers/AnalysisRouter";
// import { WorkflowRouter } from "./api/routers/WorkflowRouter";
// import { AgentRouter } from "./api/routers/AgentRouter";
// import { KnowledgeRouter } from "./api/routers/KnowledgeRouter";
// import { SystemRouter } from "./api/routers/SystemRouter";
// import { AIHubRouter } from "./api/routers/AIHubRouter";
// import { VerificationRouter } from "./api/routers/VerificationRouter";
// import { setupLiveWS } from "./api/websockets/liveWS";

// export const app = express();
// const PORT = 3000;

// app.use(express.json({ limit: "50mb" }));

// // Boot Background Queue Workers
// QueueWorker.start();

// // Health Check endpoint
// app.get("/api/health", (req, res) => {
//   res.json({ status: "ok" });
// });

// // Register Domain Routers
// app.use("/api", AnalysisRouter);
// app.use("/api", WorkflowRouter);
// app.use("/api", AgentRouter);
// app.use("/api", KnowledgeRouter);
// app.use("/api", SystemRouter);
// app.use("/api", AIHubRouter);
// app.use("/api", VerificationRouter);

// // Regular heartbeat telemetry broadcasts every 5 seconds
// setInterval(() => {
//   dbPool.broadcastTelemetry();
// }, 5000);

// export async function startServer() {
//   if (process.env.NODE_ENV !== "production") {
//     const vite = await createViteServer({
//       server: { middlewareMode: true },
//       appType: "spa",
//     });
//     app.use(vite.middlewares);
//   } else {
//     const distPath = path.join(process.cwd(), "dist");
//     app.use(express.static(distPath));
//     app.get("*", (req, res) => {
//       res.sendFile(path.join(distPath, "index.html"));
//     });
//   }

//   const httpServer = http.createServer(app);

//   // Set up WebSocket server on the same HTTP server
//   const wss = new WebSocketServer({ server: httpServer });
//   setupLiveWS(wss);

//   httpServer.listen(PORT, "0.0.0.0", () => {
//     console.log(`[Express Server] Multi-tiered architecture boot complete with WebSockets. Listening on 0.0.0.0:${PORT}`);
//   });
}
