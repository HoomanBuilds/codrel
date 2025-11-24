
import { integer, jsonb, pgEnum, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  image: varchar({ length: 255 }),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().$onUpdateFn(() => new Date()).notNull(),
});

export const tokensTable = pgTable("tokens", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer().notNull().references(() => usersTable.id, {
    onDelete: "cascade",
  }),
  token: varchar({ length: 255 }).notNull().unique(),
  createdAt: timestamp().defaultNow().notNull(),
});

export const clientType = pgEnum("client_type", ["cli", "web"]);
export const documentsTable = pgTable("documents", {
  id: varchar({ length: 255 }).primaryKey(),
  userId: integer().notNull().references(() => usersTable.id),
  client: clientType("client").notNull().default("cli"),
  sources: jsonb().notNull().default([]),
  filePath: varchar({ length: 255 }),
  chunkSize: integer().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
});