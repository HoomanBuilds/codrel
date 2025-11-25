import crypto from "crypto";
import { eq, sql } from "drizzle-orm";
import { AppError } from "./AppError";
import { IngestContext } from "./orchestrator";
import db from "../../../lib/db/db";
import { projectsTable, usersTable } from "../../../lib/db/schema";

export async function stepSQL(ctx: IngestContext) {
  try {
    if (!ctx.projectId) {
      ctx.projectId = `codrel-${crypto.randomUUID()}`;
      ctx.isNewProject = true;

      await db.insert(projectsTable).values({
        id: ctx.projectId,
        email: String(ctx.userEmail),
        name: ctx.name ?? "Untitled Project",
        description: "",
        client: ctx.client,
        totalChunks: ctx.newChunkCount,
        totalTokens: ctx.totalTokens,
      });

      return;
    }

    const existing = await db.query.projectsTable.findFirst({
      where: (p, { eq }) => eq(p.id, ctx.projectId!),
    });

    if (existing && existing.email !== ctx.userEmail) {
      throw new AppError("Forbidden: You do not own this project", 403);
    }
    if (!existing) {
      ctx.projectId = `codrel-${crypto.randomUUID()}`;
      ctx.isNewProject = true;

      await db.insert(projectsTable).values({
        id: ctx.projectId,
        email: String(ctx.userEmail),
        name: ctx.name ?? "Untitled Project",
        description: "",
        client: ctx.client,
        totalChunks: ctx.newChunkCount,
        totalTokens: ctx.totalTokens,
      });

      return;
    }

    ctx.isNewProject = false;

    await db
      .update(projectsTable)
      .set({
        totalChunks: sql`${projectsTable.totalChunks} + ${ctx.newChunkCount}`,
        totalTokens: sql`${projectsTable.totalTokens} + ${ctx.totalTokens}`,
      })
      .where(eq(projectsTable.id, ctx.projectId));
  } catch (err) {
    console.error("SQL error:", err);
    throw new AppError("DB insert failed", 500);
  }
}

export async function updateUserUsage(
  email: string,
  projectInc: number,
  chunkInc: number
) {
  await db
    .update(usersTable)
    .set({
      totalProjects: sql`${usersTable.totalProjects} + ${projectInc}`,
      totalChunks: sql`${usersTable.totalChunks} + ${chunkInc}`,
    })
    .where(eq(usersTable.email, email));
}
