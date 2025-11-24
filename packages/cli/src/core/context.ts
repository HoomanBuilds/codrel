import path from "path";
import fs from "fs/promises";
import os from "os";

const ROOT = path.join(os.homedir(), ".codrel");

export interface ContextState {
  projectLocalId: string;
  vector_id: string | null;
  commitHash: string | null;
  pipelineVersion: number;
  meta: Record<string, unknown>;
  warnings: string[];
  token?: string | null;

  indexSummary?: unknown;
  tokenLength?: number;
}

export class Context {
  readonly projectLocalId: string;
  readonly baseDir: string;
  token: string | null = null;

  vector_id: string | null = null;
  commitHash: string | null = null;
  indexSummary: unknown = null;
  meta: Record<string, unknown> = {};
  warnings: string[] = [];

  repoTrees: Record<string, unknown> = {};
  folderTrees: Record<string, unknown> = {};
  urlTrees: Record<string, unknown> = {};
  fileTrees: Record<string, unknown> = {};

  allChunks: unknown[] = [];
  pipelineVersion = 1;

  constructor(projectLocalId: string, token?: string) {
    this.projectLocalId = projectLocalId;
    this.token = token || null;
    this.baseDir = path.join(ROOT, "projects", projectLocalId);
  }

  async init(): Promise<void> {
    await fs.mkdir(this.baseDir, { recursive: true });
  }

  file(name: string): string {
    return path.join(this.baseDir, name);
  }

  async write(name: string, data: unknown): Promise<void> {
    await fs.writeFile(this.file(name), JSON.stringify(data, null, 2));
  }

  async read<T = unknown>(name: string): Promise<T> {
    return JSON.parse(await fs.readFile(this.file(name), "utf8")) as T;
  }

  addTree(
    source: string,
    type: "repo" | "folder" | "url" | "files",
    tree: unknown
  ): void {
    if (type === "repo") this.repoTrees[source] = tree;
    if (type === "folder") this.folderTrees[source] = tree;
    if (type === "url") this.urlTrees[source] = tree;
    if (type === "files") this.fileTrees[source] = tree;
  }

  async saveState(): Promise<void> {
    const state: ContextState = {
      projectLocalId: this.projectLocalId,
      vector_id: this.vector_id,
      commitHash: this.commitHash,
      pipelineVersion: this.pipelineVersion,
      meta: this.meta,
      warnings: this.warnings,
    };

    await this.write("state.json", state);
  }

  toJSON() {
    return {
      projectLocalId: this.projectLocalId,
      vector_id: this.vector_id,
      commitHash: this.commitHash,
      indexSummary: this.indexSummary,
      meta: this.meta,
      warnings: this.warnings,

      repoTrees: this.repoTrees,
      folderTrees: this.folderTrees,
      urlTrees: this.urlTrees,
      fileTrees: this.fileTrees,

      allChunks: this.allChunks,
      pipelineVersion: this.pipelineVersion,
    };
  }

  async addToGlobalMapping(): Promise<void> {
    const mappingPath = path.join(ROOT, "projects", "mapping.json");

    let map: Record<string, string> = {};
    try {
      const txt = await fs.readFile(mappingPath, "utf8");
      map = JSON.parse(txt);
    } catch (_) {
      map = {};
    }

    if (this.vector_id) {
      map[this.vector_id] = this.projectLocalId;
    }

    await fs.writeFile(mappingPath, JSON.stringify(map, null, 2));
  }
}

export default Context;
