#!/usr/bin/env node
import { program } from "commander";
import { orchestrate, ProcessParams } from "./orchestration";

type CreateArgs = {
  repo?: string;
  url?: string;
  files?: string;
  dir?: string;
  token?: string;
};

program
  .name("rag")
  .description("RAG CLI")
  .version("0.1.0");

program
  .command("create")
  .option("--repo <url>", "git repo (comma-separated for multiple)")
  .option("--url <urls>", "remote URLs (comma-separated)")
  .option("--files <pattern>", "glob pattern for files (comma-separated)")
  .option("--dir <path>", "local folder path (comma-separated)")
  .requiredOption("--token <t>", "auth token")
  .action(async (opts: CreateArgs) => {
    if (!opts.repo && !opts.url && !opts.files && !opts.dir) {
      console.error("error: at least one of --repo, --url, --files, --dir required");
      process.exit(1);
    }

    const params: ProcessParams = {
      repo: opts.repo ? opts.repo.split(",").map(s => s.trim()) : undefined,
      url: opts.url ? opts.url.split(",").map(s => s.trim()) : undefined,
      files: opts.files ? opts.files.split(",").map(s => s.trim()) : undefined,
      folder: opts.dir ? opts.dir.split(",").map(s => s.trim()) : undefined,
      token: opts.token!
    };

    await orchestrate(params);
  });

program.parse();
