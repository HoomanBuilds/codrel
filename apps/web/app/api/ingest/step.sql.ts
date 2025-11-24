import db from "../../../lib/db/db";
import { documentsTable } from "../../../lib/db/schema";
import { AppError } from "./AppError";
import { IngestContext } from "./orchestrator";

export async function stepSQL(ctx: IngestContext) {
  try {
    await db.insert(documentsTable).values({
      id: ctx.projectId,
      userId: ctx.userId,
      client: ctx.client,
      sources: ctx.sources || [],
      filePath: "",
      chunkSize: ctx.totalTokens,
    });

  } catch (err) {
    console.error("SQL error:", err);
    throw new AppError("DB insert failed", 500);
  }
}
