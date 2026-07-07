import { request } from "./client";

export const notificationApi = {
  clearNotifications: async () => {
    return request("/notifications/clear", {
      method: "POST",
    });
  },
};
