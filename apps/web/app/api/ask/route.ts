import { NextResponse } from "next/server";
import { AppError } from "../ingest/AppError";

import { getRagContext } from "../../../lib/langchain/service";
import { stepAuth } from "../ingest/step.auth";
import { randomUUID } from "crypto";
import { ApiError } from "next/dist/server/api-utils";

export interface Askcontext {
  userId: number | null;
  projectId: string | null;

  client ?: "agent" | "web" | "cli";
}

export async function POST(req: Request) {
  const ctx: Askcontext = {
    userId: null,
    projectId: null,
    client: "agent",
  };

  try {
    const { query, k = 20, filter , projectId } = await req.json();
    ctx.projectId = projectId;

    if(!ctx.projectId) throw new ApiError(400 , "Missing projectId")
    if (!query) throw new AppError("Missing query", 400);

    await stepAuth(req, ctx);
    const results = await getRagContext(query , ctx , { topk : k, filter });

    return NextResponse.json({
      userId: ctx.userId,
      results: results.map(r => ({
        metadata: r.metadata
      }))
    });
  } catch (err) {
    const status = err instanceof AppError ? err.status : 500;
    return NextResponse.json({ error: (err as Error).message }, { status });
  }
}