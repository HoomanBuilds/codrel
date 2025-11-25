import type { FullChunk, RetrievedChunk, ScoringWeights } from "../types.js";
import { DEFAULT_WEIGHTS } from "../utils/constants.js";
import {
  type ScoredChunk,
  scoreAll,
} from "./scoring-core.js";

export interface PreprocessOptions {
  retrievedChunks: RetrievedChunk[];
  fullChunks: Map<string, FullChunk>;
  query: string;
  topK?: number | null;
  tokenMax?: number | null;
  weights?: ScoringWeights;
}

export function filterTopK(scored: ScoredChunk[], k: number): ScoredChunk[] {
  return scored
    .slice()
    .sort((a, b) => b._finalScore - a._finalScore)
    .slice(0, k);
}

export function filterByToken(
  scored: ScoredChunk[],
  tokenMax: number
): ScoredChunk[] {
  let acc = 0;
  const out: ScoredChunk[] = [];

  for (const c of scored.sort((a, b) => b._finalScore - a._finalScore)) {
    const t = c.tokenLength || 0;
    if (acc + t > tokenMax) break;
    out.push(c);
    acc += t;
  }

  return out;
}

export function ProcessRetrieved(options: PreprocessOptions) {
  const {
    retrievedChunks,
    fullChunks,
    query,
    weights = DEFAULT_WEIGHTS,
    tokenMax = null,
    topK = 5,
  } = options;

  let scored = scoreAll(retrievedChunks, query, weights);

  if (topK != null) scored = filterTopK(scored, topK);
  if (tokenMax != null) scored = filterByToken(scored, tokenMax);

  return scored.map((s) => {
    const full = fullChunks.get(s.id);
    return full ? { ...full, ...s } : s;
  });
}
