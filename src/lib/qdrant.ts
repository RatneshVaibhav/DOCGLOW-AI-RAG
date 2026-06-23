import { QdrantClient } from "@qdrant/js-client-rest";
import { EMBEDDING_DIMENSION } from "./embeddings";
import { DocumentChunk } from "@/types/document";

function getClient(): QdrantClient {
  const url = process.env.QDRANT_URL;
  const apiKey = process.env.QDRANT_API_KEY;
  if (!url || !apiKey) {
    throw new Error(
      "QDRANT_URL and QDRANT_API_KEY must be set in your environment variables."
    );
  }
  return new QdrantClient({
    url,
    apiKey,
    // The server-version probe adds a failing round-trip and noisy logs on
    // managed clusters; skip it.
    checkCompatibility: false,
  });
}

const COLLECTION_NAME = "docglow_documents";

export async function ensureCollection(): Promise<void> {
  const client = getClient();
  let collections;
  try {
    collections = await client.getCollections();
  } catch (err) {
    // A 404 / connection failure here almost always means QDRANT_URL points at
    // a cluster that no longer exists (e.g. a free-tier cluster that was
    // suspended for inactivity). Surface something actionable.
    const detail = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Could not reach Qdrant at ${process.env.QDRANT_URL}. ` +
        `Verify the cluster is running and QDRANT_URL / QDRANT_API_KEY are correct. (${detail})`
    );
  }
  const exists = collections.collections.some(
    (c) => c.name === COLLECTION_NAME
  );

  if (!exists) {
    await client.createCollection(COLLECTION_NAME, {
      vectors: {
        size: EMBEDDING_DIMENSION,
        distance: "Cosine",
      },
      optimizers_config: {
        default_segment_number: 2,
      },
      replication_factor: 1,
    });

    // Create payload index for filtering by documentId
    await client.createPayloadIndex(COLLECTION_NAME, {
      field_name: "documentId",
      field_schema: "keyword",
    });
  }
}

export async function upsertChunks(
  chunks: DocumentChunk[],
  embeddings: number[][]
): Promise<void> {
  const client = getClient();
  await ensureCollection();

  const points = chunks.map((chunk, i) => ({
    id: chunk.id,
    vector: embeddings[i],
    payload: {
      text: chunk.text,
      fileName: chunk.metadata.fileName,
      chunkIndex: chunk.metadata.chunkIndex,
      pageNumber: chunk.metadata.pageNumber,
      uploadTimestamp: chunk.metadata.uploadTimestamp,
      documentId: chunk.metadata.documentId,
    },
  }));

  // Upsert in batches of 100
  const batchSize = 100;
  for (let i = 0; i < points.length; i += batchSize) {
    const batch = points.slice(i, i + batchSize);
    await client.upsert(COLLECTION_NAME, {
      wait: true,
      points: batch,
    });
  }
}

export interface SearchResult {
  text: string;
  score: number;
  pageNumber: number;
  chunkIndex: number;
  fileName: string;
}

export async function searchSimilar(
  queryEmbedding: number[],
  documentId: string,
  topK: number = 5
): Promise<SearchResult[]> {
  const client = getClient();

  const results = await client.search(COLLECTION_NAME, {
    vector: queryEmbedding,
    limit: topK,
    filter: {
      must: [
        {
          key: "documentId",
          match: { value: documentId },
        },
      ],
    },
    with_payload: true,
  });

  return results.map((r) => ({
    text: (r.payload?.text as string) || "",
    score: r.score,
    pageNumber: (r.payload?.pageNumber as number) || 1,
    chunkIndex: (r.payload?.chunkIndex as number) || 0,
    fileName: (r.payload?.fileName as string) || "",
  }));
}
