import { createVectorStore } from "../../../lib/db/vectorDB";
import { createEmbeddings } from "../../../lib/langchain/service";
import type { IngestContext } from "./orchestrator";

function sanitizeMetadata(meta: Record<string, unknown>) {
  const out: Record<string, string | number | boolean | null> = {};

  for (const [key, value] of Object.entries(meta)) {
    if (Array.isArray(value)) {
      out[key] = value.join(",");
    } else if (typeof value === "object" && value !== null) {
      out[key] = JSON.stringify(value);
    } else if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      value === null
    ) {
      out[key] = value;
    } else {
      out[key] = String(value);
    }
  }
  return out;
}

export async function stepVector(ctx: IngestContext) {
  const store = createVectorStore(ctx, createEmbeddings(), "chroma");

  const contents = ctx.chunks.map(c => String(c.text));

  const metadataList = ctx.chunks.map(c =>
    sanitizeMetadata({
      relativePath: c.relativePath,
      extension: c.extension,
      language: c.language,
      startLine: c.startLine,
      endLine: c.endLine,
      treePath: c.treePath,
      tokenLength: c.tokenLength,
      source: c.source,
      sourceType: c.sourceType,
      docId: ctx.projectId,
      userId: ctx.userId,
    })
  );

  const ids = ctx.chunks.map(c => c.id || crypto.randomUUID());

  const vectors = await store.embeddings.embedDocuments(contents);

  const docs = metadataList.map(m => ({
    pageContent: "",
    metadata: m
  }));

  await store.addVectors(vectors, docs, { ids });
}
