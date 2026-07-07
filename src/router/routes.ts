export interface RouteConfig {
  path: string;
  label: string;
  icon?: string;
}

export const ROUTES: RouteConfig[] = [
  { path: "/", label: "Dashboard" },
  { path: "/analysis", label: "New Analysis" },
  { path: "/history", label: "History" },
  { path: "/reports", label: "Reports" },
  { path: "/agents", label: "Swarm Agents" },
  { path: "/knowledge", label: "Knowledge Base" },
  { path: "/workflows", label: "Swarm Workflows" },
  { path: "/settings", label: "Settings" },
  { path: "/system-monitor", label: "System Monitor" },
];
