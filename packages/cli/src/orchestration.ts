import crypto from "crypto";
import fs from "fs";
import path from "path";
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
  chunkSize?: number;
  name?: string;
  projectId?: string;
  local?: boolean;
}

export async function orchestrate(params: ProcessParams): Promise<void> {
  if (!params.repo && !params.url && !params.files && !params.folder) {
    logger.error("missing source: repo | url | files | folder");
    return;
  }

  let id: string;
  if (params.local) {
    if (params.projectId) {
      const localId = await Context.getLocalId(params.projectId);
      if (!localId) {
        logger.error(
          `no local project found for projectId ${params.projectId}`
        );
        return;
      }
      id = localId;
    } else {
      id = `codrel-local-${crypto.randomUUID()}`;
    }
  } else {
    id = `codrel-cloud-${crypto.randomUUID()}`;
  }

  const ctx = new Context(id, params.token);
  await ctx.init();
  if (params.local) ctx.local = true;
  ctx.name = params.name ?? "Untitled Project";
  ctx.remoteProjectId = params.projectId || null;

  const tasks: Promise<void>[] = [];
  const t0 = Date.now();

  if (params.repo)
    for (const r of params.repo) tasks.push(processRepo(r, ctx, params));
  if (params.url)
    for (const u of params.url) tasks.push(processUrl(u, ctx, params));
  if (params.files)
    for (const f of params.files) tasks.push(processFiles(f, ctx, params));
  if (params.folder)
    for (const d of params.folder) tasks.push(processFolder(d, ctx, params));

  await Promise.all(tasks);

  const merged = mergeAllTrees(ctx);
  const chunks = extractChunksFromTrees(merged);
  ctx.allChunks = chunks;

  const result = await vectorIndexer.indexTree(chunks, ctx);
  ctx.remoteProjectId = result.remoteProjectId;

  const duration = Date.now() - t0;
  ctx.indexSummary = {
    ...result.indexSummary,
    durationMs: duration,
    chunkCount: chunks.length,
  };

  ctx.meta = {
    indexedAt: Date.now(),
    chunkCount: result.chunkCount,
    durationMs: duration,
    remoteProjectId: result.remoteProjectId,
    sources: {
      repos: params.repo || [],
      folders: params.folder || [],
      urls: params.url || [],
      files: params.files || [],
    },
  };

  if (params.local) {
    await ctx.write("index-summary.json", ctx.indexSummary);
    await ctx.write("meta.json", ctx.meta);
    await writeChunksWithAppendLogic(ctx, chunks, params.projectId);
    await ctx.write("logs.txt", ctx.logs.join("\n"));
    await ctx.saveState();
    await ctx.addToGlobalMapping();
  }

  logger.sucess("orchestration completed");
  logger.info("chunks:", result.chunkCount);
  logger.info("duration:", `${duration}ms`);
  logger.info("projectId:", result.remoteProjectId);
}

async function writeChunksWithAppendLogic(
  ctx: Context,
  chunks: any[],
  serverId?: string
) {
  if (!serverId) {
    await ctx.write("chunks.json", chunks);
    return;
  }

  const localId = await Context.getLocalId(serverId);
  if (!localId) {
    await ctx.write("chunks.json", chunks);
    return;
  }

  const chunksPath = path.join(
    process.cwd(),
    "codre",
    "projects",
    localId,
    "chunks.json"
  );

  if (!fs.existsSync(chunksPath)) {
    await ctx.write("chunks.json", chunks);
    return;
  }

  const existing = JSON.parse(fs.readFileSync(chunksPath, "utf8"));
  const combined = [...existing, ...chunks];
  fs.writeFileSync(chunksPath, JSON.stringify(combined, null, 2));

  logger.info(`appended ${chunks.length} chunks to existing project`);
}
