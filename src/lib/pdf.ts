// IMPORTANT: import the implementation directly, NOT the package root.
// pdf-parse@1.1.1's index.js has a debug block that runs
// `fs.readFileSync('./test/data/05-versions-space.pdf')` whenever
// `module.parent` is falsy. In a Next.js / serverless bundle that is always the
// case, so the package throws ENOENT at module-load time and every PDF upload
// fails in production. The lib entry point skips that debug block entirely.
import pdfParse from "pdf-parse/lib/pdf-parse.js";

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
