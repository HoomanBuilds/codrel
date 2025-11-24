import { eq } from "drizzle-orm";
import db from "../../../lib/db/db";
import { documentsTable } from "../../../lib/db/schema";
import { IngestContext } from "./orchestrator";

export async function sqlCleanup(ctx: IngestContext) {
  if (!ctx.id) return;

  try {
    await db.delete(documentsTable).where(eq(documentsTable.id, ctx.id));
  } catch { return null }
}
