import { useWorkspaceStore } from "../store";

export function useReports() {
  const db = useWorkspaceStore((state) => state.db);
  const reports = db?.reports || [];

  const getReportById = (id: string) => reports.find((r) => r.id === id);
  
  const highRiskReports = reports.filter((r) => r.riskRating === "High");
  const moderateRiskReports = reports.filter((r) => r.riskRating === "Moderate");
  const lowRiskReports = reports.filter((r) => r.riskRating === "Low");

  return {
    reports,
    getReportById,
    highRiskReports,
    moderateRiskReports,
    lowRiskReports,
    reportCount: reports.length,
  };
}
