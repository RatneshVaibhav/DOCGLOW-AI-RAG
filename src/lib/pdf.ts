import pdfParse from "pdf-parse";

export interface ExtractedText {
  text: string;
  pageCount: number;
}

export async function extractTextFromPDF(buffer: Buffer): Promise<ExtractedText> {
  const data = await pdfParse(buffer);
  return {
    text: data.text,
    pageCount: data.numpages,
  };
}

export function extractTextFromTXT(buffer: Buffer): ExtractedText {
  const text = buffer.toString("utf-8");
  // Approximate page count (3000 chars per page)
  const pageCount = Math.max(1, Math.ceil(text.length / 3000));
  return { text, pageCount };
}

export async function extractText(
  buffer: Buffer,
  fileType: string
): Promise<ExtractedText> {
  if (fileType === "application/pdf" || fileType.endsWith(".pdf")) {
    return extractTextFromPDF(buffer);
  }
  return extractTextFromTXT(buffer);
}
