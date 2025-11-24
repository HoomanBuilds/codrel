/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from "@langchain/google-genai";
import { createVectorStore } from "../db/vectorDB";
import { IngestContext } from "../../app/api/ingest/orchestrator";
import { Askcontext } from "../../app/api/ask/route";

export function createllm(
  model: string = "gemini-2.0-flash",
  temperature: number = 0,
  maxOutputTokens: number = 256,
  kind: "gemini" | "chatgpt" = "gemini"
): ChatGoogleGenerativeAI {
  switch (kind) {
    case "gemini":
      return new ChatGoogleGenerativeAI({
        model,
        temperature,
        maxOutputTokens,
      });
    // case "chatgpt" : return new ChatOpenAI({ model, temperature, maxOutputTokens });
    default:
      return new ChatGoogleGenerativeAI({
        model,
        temperature,
        maxOutputTokens,
      });
  }
}

export const geminiModel = createllm("gemini-2.0-flash", 0, 256, "gemini");

export async function storeToRAG() {}

export async function getRagContext(
  query: string,
  ctx: Askcontext,
  options: { topk : number , filter?: Record<string, any> } = { topk: 20 }
) {
  const geminiEmbeddings = createEmbeddings();
  const vectorStore = createVectorStore(ctx , geminiEmbeddings , "chroma");
  let similaritySearchResults: Array<any> = [];
  try {
    similaritySearchResults = await vectorStore.similaritySearch( query , options.topk);
  } catch (error) {
    throw new Error(`Error while fetching data from vector db ${error}`);
  }
  return similaritySearchResults;
}

export const createEmbeddings = () => {
  return new GoogleGenerativeAIEmbeddings({
    model: "text-embedding-004"
  });
};
