import { startServer } from "./server/app";

startServer().catch((err) => {
  console.error("Critical: Failed to start multi-tier Express backend:", err);
  process.exit(1);
});
