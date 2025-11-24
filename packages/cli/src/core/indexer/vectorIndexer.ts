import { logger } from "@/src/lib/logger.js";
import { apiClient } from "../../lib/apiClient.js";
import { ContextState } from "../context.js";

const USE_MOCK = false;

export const vectorIndexer = {
  async indexTree(chunks: any, ctx: ContextState) {
    const t0 = Date.now();

    try {
      let res;

      if (USE_MOCK) {
        res = {
          ok: true,
          indexed: chunks.length,
          durationMs: 50,
          vector_id: "mock_index_12345",
        };
      } else {
        const totalTokens = chunks.reduce((n : number , c : { tokenLength: number }) => n + (c.tokenLength || 0), 0);
        const sources : string[] = [...new Set(chunks.map((c : { source: string }) => c.source).filter(Boolean) as string[])];

        ctx.tokenLength = totalTokens;
        res = await apiClient.request("/ingest", {
          token: ctx.token!,
          chunks,
          totalTokens,
          sources
        });
      }

      ctx.indexSummary = res;
      const d = Date.now() - t0;

      return {
        ok: true,
        chunkCount: chunks.length,
        indexing_duration: d,
        indexSummary: res,
        vector_id: res.id || null,
      };
    } catch (err: any) {
      logger.error("\n[ERROR] Vector indexing failed:" , err.message || err);
      process.exit(1);
    }
  },
};
