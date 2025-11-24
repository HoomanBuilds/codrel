import { Embeddings } from "@langchain/core/embeddings";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { IngestContext } from "../../app/api/ingest/orchestrator";
import { Askcontext } from "../../app/api/ask/route";

type VectorStoreKind = "chroma";

export function createVectorStore(
  ctx : Askcontext | IngestContext,
  embeddings: Embeddings,
  kind: VectorStoreKind = "chroma"
) {
  try {
    switch (kind) {
      case "chroma": {
        const vectorStore = new Chroma(embeddings, {
          collectionName: ctx.projectId!,
          chromaCloudAPIKey: process.env.CHROMA_API_KEY,
          clientParams: {
            host: "api.trychroma.com",
            port: 8000,
            ssl: true,
            tenant: process.env.CHROMA_TENANT,
            database: process.env.CHROMA_DATABASE,
          },
        });
        return vectorStore;
      }

      default:
        throw new Error(`Unsupported vector store kind: ${kind}`);
    }
  } catch (error) {
    throw new Error(`Error while creating Upstash vector store: ${error}`);
  }
}
