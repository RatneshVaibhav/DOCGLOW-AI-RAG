import { DocumentChunk } from "@/types/document";
import { generateEmbeddings } from "./embeddings";
import { upsertChunks } from "./qdrant";

export async function storeChunksInVectorDB(
  chunks: DocumentChunk[]
): Promise<void> {
  const texts = chunks.map((c) => c.text);
  const embeddings = await generateEmbeddings(texts);
  await upsertChunks(chunks, embeddings);
}
