import { stepAuth } from "./step.auth";
import { stepParse } from "./step.parse";
import { stepSQL } from "./step.sql";
import { stepVector } from "./step.vector";
import { sqlCleanup } from "./compensate.sql";

export interface CodrelChunk {
  id?: string;
  chunkIdx?: number;

  filePath?: string;
  relativePath?: string;

  extension?: string;
  language?: string;

  startLine?: number;
  endLine?: number;

  treePath?: string[];

  text: string;
  tokenLength?: number;

  source?: string;
  sourceType?: string;
}


export interface IngestContext {
  projectId: string;
  userId: number;
  chunks: CodrelChunk[];
  client: "cli" | "web";
  totalTokens: number;
  sources?: string[];
}

export async function ingest(req: Request) {
  const ctx: IngestContext = {
    projectId: `codrel-${crypto.randomUUID()}`,
    userId: 0,
    chunks: [] as CodrelChunk[],
    client: "cli",
    totalTokens: 0,
  };

  try {
    await stepAuth(req, ctx);
    await stepParse(req, ctx);
    await stepSQL(ctx);
    await stepVector(ctx);

    return { ok: true, id: ctx.projectId, stored: ctx.chunks.length };
  } catch (err) {
    await sqlCleanup(ctx);
    throw err;
  }
}
