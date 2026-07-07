import { dbPool } from "../config/database";
import { KnowledgeSource } from "../../src/types";

export class KnowledgeRepository {
  public static getAll(): KnowledgeSource[] {
    return dbPool.executeQuery<KnowledgeSource>(
      "SELECT * FROM knowledge ORDER BY added_at DESC",
      "SELECT",
      "knowledge"
    );
  }

  public static insert(ks: KnowledgeSource) {
    dbPool.executeInsert(
      `INSERT INTO knowledge (id, name, type, size, added_at, content) VALUES ('${ks.id}', '${ks.name}', '${ks.type}', '${ks.size}', '${ks.addedAt}', <content>)`,
      "knowledge",
      ks
    );
  }
}
