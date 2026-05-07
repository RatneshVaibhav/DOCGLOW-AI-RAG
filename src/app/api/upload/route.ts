import { NextRequest, NextResponse } from "next/server";
import { extractText } from "@/lib/pdf";
import { chunkText } from "@/lib/chunking";
import { storeChunksInVectorDB } from "@/lib/vector";
import { v4 as uuidv4 } from "uuid";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = [
      "application/pdf",
      "text/plain",
    ];
    const isValid =
      validTypes.includes(file.type) ||
      file.name.endsWith(".pdf") ||
      file.name.endsWith(".txt");
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF and TXT files are supported." },
        { status: 400 }
      );
    }

    // Validate file size (max 20MB)
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 20MB." },
        { status: 400 }
      );
    }

    const documentId = uuidv4();
    const buffer = Buffer.from(await file.arrayBuffer());

    // Step 1: Extract text
    const { text, pageCount } = await extractText(buffer, file.type || file.name);

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Could not extract text from file. The file may be empty or contain only images." },
        { status: 400 }
      );
    }

    // Step 2: Chunk text
    const chunks = await chunkText(text, file.name, documentId, pageCount);

    // Step 3: Embed and store in Qdrant
    await storeChunksInVectorDB(chunks);

    return NextResponse.json({
      documentId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      totalChunks: chunks.length,
      pageCount,
      textPreview: text.substring(0, 500),
      status: "ready",
    });
  } catch (error: unknown) {
    console.error("Upload error:", error);
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
