export interface Agent {
  id: string;
  name: string;
  code: string;
  role: string;
  status: "idle" | "busy" | "failed" | "completed";
  runtime: string;
  lastTask: string;
  color: string;
  textcolor: string;
}
