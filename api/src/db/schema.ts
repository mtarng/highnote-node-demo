import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  accountHolderId: text("account_holder_id"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});
