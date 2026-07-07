import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import {
  Dashboard,
  NewAnalysis,
  History,
  Reports,
  Agents,
  KnowledgeBase,
  Workflows,
  Settings,
  SystemMonitor,
  AIHub
} from "../pages";

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/analysis" element={<NewAnalysis />} />
        <Route path="/history" element={<History />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/agents" element={<Agents />} />
        <Route path="/knowledge" element={<KnowledgeBase />} />
        <Route path="/workflows" element={<Workflows />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/system-monitor" element={<SystemMonitor />} />
        <Route path="/ai-hub" element={<AIHub />} />
        {/* Fallback route redirection */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
