import crypto from "crypto";
import { Context } from "./core/context";
import { logger } from "./lib/logger";
import processRepo from "./pipelines/repo";
import { vectorIndexer } from "./core/indexer/vectorIndexer";
import { mergeAllTrees } from "./core/merge";
import { extractChunksFromTrees } from "./core/extractChunksFromTrees";
import processUrl from "./pipelines/url";
import processFiles from "./pipelines/file";
import processFolder from "./pipelines/folder";

export interface ProcessParams {
  repo?: string[];
  url?: string[];
  files?: string[];
  folder?: string[];
  token: string;
}

export async function orchestrate(params: ProcessParams): Promise<void> {
  if (!params.repo && !params.url && !params.files && !params.folder) {
    logger.error("missing source: repo | url | files | folder");
    return;
  }

  const id = `codrel-${crypto.randomUUID()}`;
  const ctx = new Context(id , params.token);
  await ctx.init();

  const tasks: Promise<void>[] = [];

  const t0 = Date.now();

  if (params.repo) {
    for (const r of params.repo) tasks.push(processRepo(r, ctx, params));
  }

  if (params.url) {
    for (const u of params.url) tasks.push(processUrl(u, ctx, params));
  }

  if (params.files) {
    for (const f of params.files) tasks.push(processFiles(f, ctx, params));
  }

  if (params.folder) {
    for (const d of params.folder) tasks.push(processFolder(d, ctx, params));
  }

  await Promise.all(tasks);

  logger.info("merging all trees");
  const merged = mergeAllTrees(ctx);

  logger.info("extracting chunks");
  const chunks = extractChunksFromTrees(merged);
  ctx.allChunks = chunks;

  logger.info("total chunks extracted:", chunks.length);
  await ctx.write("pre-index-chunks.json", chunks);
  logger.info("indexing vector DB");
  const result = await vectorIndexer.indexTree(chunks, ctx);

  ctx.vector_id = result.vector_id;

  const d = Date.now() - t0;
  ctx.indexSummary = {
    ...result.indexSummary,
    durationMs: d,
    chunkCount: chunks.length,
  };

  ctx.meta = {
    indexedAt: Date.now(),
    chunkCount: result.chunkCount,
    durationMs: d,
    vectorId: result.vector_id,
    sources: {
      repos: params.repo || [],
      folders: params.folder || [],
      urls: params.url || [],
      files: params.files || [],
    },
  };

  await ctx.write("index-summary.json", ctx.indexSummary);
  await ctx.write("meta.json", ctx.meta);
  await ctx.write("chunks.json", chunks);

  await ctx.saveState();
  await ctx.addToGlobalMapping();

  logger.sucess("orchestration completed");
  logger.info("completed");
  logger.info("chunks:", result.chunkCount);
  logger.info("duration:", `${d}ms`);
  logger.info("vector id:", result.vector_id);

}