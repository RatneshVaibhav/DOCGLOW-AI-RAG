import { pipeline } from "@xenova/transformers";

const getExtractor = (() => {
  let extractorPromise: Promise<any> | null = null;
  return () => {
    if (!extractorPromise) {
      extractorPromise = pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    }
    return extractorPromise;
  };
})();

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const extractor = await getExtractor();
  const allEmbeddings: number[][] = [];

  for (let text of texts) {
    const output = await extractor(text, { pooling: "mean", normalize: true });
    allEmbeddings.push(Array.from(output.data));
  }

  return allEmbeddings;
}

export async function generateSingleEmbedding(text: string): Promise<number[]> {
  const extractor = await getExtractor();
  const output = await extractor(text, { pooling: "mean", normalize: true });
  return Array.from(output.data);
}

// Xenova/all-MiniLM-L6-v2 produces 384-dimensional vectors
export const EMBEDDING_DIMENSION = 384;
