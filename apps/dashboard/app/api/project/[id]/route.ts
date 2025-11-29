import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/authOption";
import { logEvent } from "../../../../lib/analytics/logs";
import db from "../../../../lib/db/db";
import { projectsTable } from "../../../../lib/db/schema";
import { eq } from "drizzle-orm";
import { createEmbeddings } from "../../../../lib/langchain/service";
import { createVectorStore } from "../../../../lib/db/vectorDB";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const projectId = id;
  const start = performance.now();

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = session.user.email!;

  const existing = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.id, projectId));

  if (existing.length === 0) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  await db.delete(projectsTable).where(eq(projectsTable.id, projectId));

  return NextResponse.json({ ok: true, projectId });
}

async function deleteChromaForProject(projectId: string) {
  const embeddings = createEmbeddings();
  const store = createVectorStore({ projectId }, embeddings);

  try {
    await store.ensureCollection();
    await store.index?.deleteCollection({ name: store.collectionName });
  } catch (err) {
    if (
      (err as Error).message?.includes("not found") ||
      (err as Error).message?.includes("does not exist")
    ) {
      return;
    }
    throw err;
  }
}
