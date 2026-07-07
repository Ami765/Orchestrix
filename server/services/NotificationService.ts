import { dbPool } from "../config/database";

export class NotificationService {
  public static addNotification(text: string, type: "success" | "info" | "warning" | "error" = "info") {
    dbPool.executeTransaction("Insert Notification", () => {
      const db = dbPool.db;
      db.notifications.unshift({
        id: `nt-${Date.now()}`,
        text,
        time: "Just now",
        type,
      });
      if (db.notifications.length > 50) {
        db.notifications.pop();
      }
    });
  }

  public static clearAll(): { success: boolean } {
    dbPool.executeTransaction("Clear Notifications", () => {
      dbPool.db.notifications = [];
    });
    return { success: true };
  }
}
