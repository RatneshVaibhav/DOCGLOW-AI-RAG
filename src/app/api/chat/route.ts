import { NextRequest } from "next/server";
import { ragQuery } from "@/lib/rag";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const { query, documentId } = await request.json();

    if (!query || !documentId) {
      return new Response(
        JSON.stringify({ error: "Query and documentId are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { stream, sources } = await ragQuery(query, documentId);

    // Encode sources as a header so they arrive before the stream
    const sourcesHeader = Buffer.from(JSON.stringify(sources)).toString("base64");

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "X-Sources": sourcesHeader,
        "Access-Control-Expose-Headers": "X-Sources",
      },
    });
  } catch (error: unknown) {
    console.error("Chat error:", error);
    const message = error instanceof Error ? error.message : "Chat failed";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
