export interface Report {
  id: string;
  title: string;
  company: string;
  analysisId: string;
  date: string;
  text: string;
  riskRating: "Low" | "Moderate" | "High";
  status: string;
}

export interface KnowledgeSource {
  id: string;
  name: string;
  type: string;
  size: string;
  addedAt: string;
  content: string;
}
