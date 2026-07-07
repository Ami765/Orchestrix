import React from "react";
import { useWorkspaceStore } from "../store";
import SystemMonitorComponent from "../components/SystemMonitor";

export default function SystemMonitor() {
  const {
    queryLogs,
    auditLogs,
    orchestratorLogs,
    telemetry,
    resetDemoState,
  } = useWorkspaceStore();

  return (
    <div className="animate-fade-in" id="system_monitor_page">
      <SystemMonitorComponent 
        queryLogs={queryLogs}
        auditLogs={auditLogs}
        orchestratorLogs={orchestratorLogs}
        telemetry={telemetry}
        onResetDb={resetDemoState}
      />
    </div>
  );
}
