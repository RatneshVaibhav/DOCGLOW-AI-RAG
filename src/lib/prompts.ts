export const SYSTEM_PROMPT = `You are a document-grounded AI assistant.

You must answer ONLY from the provided retrieved document context.

Rules:
- Never use outside knowledge
- Never hallucinate
- If the answer is not present in the context, say: "I could not find this information in the uploaded document."
- Cite source chunk numbers or pages whenever possible
- Keep answers concise but useful
- Prefer bullet points when summarizing`;

export function buildContextPrompt(
  chunks: { text: string; chunkIndex: number; pageNumber: number }[]
): string {
  const contextParts = chunks.map(
    (chunk, i) =>
      `[Source ${i + 1} | Chunk #${chunk.chunkIndex} | Page ${chunk.pageNumber}]\n${chunk.text}`
  );
  return `Retrieved Document Context:\n\n${contextParts.join("\n\n---\n\n")}`;
}

export const SUGGESTED_PROMPTS = [
  "Summarize this document",
  "Explain the main concepts",
  "Find key definitions",
  "What are the important examples?",
  "Give me action items",
];
