import { request } from "./client";

export const knowledgeApi = {
  addKnowledge: async (name: string, content: string) => {
    return request("/knowledge", {
      method: "POST",
      body: JSON.stringify({ name, content }),
    });
  },
};
