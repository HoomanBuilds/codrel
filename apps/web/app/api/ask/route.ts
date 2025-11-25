import { NextResponse } from "next/server";
import { AppError } from "../ingest/AppError";
import { getRagContext } from "../../../lib/langchain/service";
import { stepAuth } from "../ingest/step.auth";
import { ApiError } from "next/dist/server/api-utils";
import { logEvent } from "../../../lib/analytics/logs";
export interface Askcontext {
  userEmail: string | null;
  projectId: string | null;
  userId?: string | null;
  client?: "agent" | "web" | "cli";
}

export async function POST(req: Request) {
  const ctx: Askcontext = {
    userEmail: null,
    projectId: null,
    client: "agent",
  };

  const start = performance.now();

  try {
    const { query, k = 20, filter, projectId } = await req.json();
    ctx.projectId = projectId;

    if (k <= 0 || k > 100) throw new ApiError(400, "k must be between 1 and 100");
    if (!ctx.projectId) throw new ApiError(400, "Missing projectId");
    if (!query) throw new AppError("Missing query", 400);

    await stepAuth(req, ctx);

    const raw = await getRagContext(query, ctx, { topk: k, filter });
    const latency = Math.round(performance.now() - start);

    const scores = raw.map(([ , score]) => score);
    const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
    const min = scores.length ? Math.min(...scores) : null;
    const max = scores.length ? Math.max(...scores) : null;

    void logEvent({
      event: "ask",
      userEmail: ctx.userEmail!,
      projectId: ctx.projectId!,
      success: true,
      metadata: {
        latency_ms: latency,
        query_length: query.length,
        k,
        retrievals: raw.length,
        filter_used: !!filter,
        vector_avg_score: avg,
        vector_min_score: min,
        vector_max_score: max,
        client: ctx.client,
      },
    });

    return NextResponse.json({
      success: true,
      retrievals: raw.length,
      results: raw.map(([doc, score]) => ({
        vectorScore: score,
        id: doc.id,
        metadata: doc.metadata,
        pageContent: doc.pageContent,
      })),
    });

  } catch (err) {
    const latency = Math.round(performance.now() - start);

    void logEvent({
      event: "ask",
      userEmail: ctx.userEmail ?? "unknown",
      projectId: ctx.projectId,
      success: false,
      error: (err as Error).message,
      metadata: {
        latency_ms: latency,
        client: ctx.client,
      },
    });

    const status = err instanceof AppError ? err.status : 500;
    return NextResponse.json({ error: (err as Error).message }, { status });
  }
}
