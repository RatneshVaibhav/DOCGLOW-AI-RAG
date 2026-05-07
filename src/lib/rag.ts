import OpenAI from "openai";
import { generateSingleEmbedding } from "./embeddings";
import { searchSimilar, SearchResult } from "./qdrant";
import { SYSTEM_PROMPT, buildContextPrompt } from "./prompts";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface RAGResponse {
  stream: ReadableStream;
  sources: SearchResult[];
}

export async function ragQuery(
  query: string,
  documentId: string
): Promise<RAGResponse> {
  // 1. Generate embedding for query
  const queryEmbedding = await generateSingleEmbedding(query);

  // 2. Search for similar chunks
  const sources = await searchSimilar(queryEmbedding, documentId, 5);

  // 3. Build context
  const contextPrompt = buildContextPrompt(
    sources.map((s) => ({
      text: s.text,
      chunkIndex: s.chunkIndex,
      pageNumber: s.pageNumber,
    }))
  );

  // 4. Call OpenAI with streaming
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    stream: true,
    temperature: 0.1,
    max_tokens: 2048,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `${contextPrompt}\n\nUser Question: ${query}` },
    ],
  });

  // 5. Convert to ReadableStream
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      for await (const chunk of response) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          controller.enqueue(encoder.encode(content));
        }
      }
      controller.close();
    },
  });

  return { stream, sources };
}
