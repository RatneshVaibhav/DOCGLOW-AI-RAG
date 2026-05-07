import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { DocumentChunk } from "@/types/document";
import { v4 as uuidv4 } from "uuid";

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
  separators: ["\n\n", "\n", ". ", " ", ""],
});

export async function chunkText(
  text: string,
  fileName: string,
  documentId: string,
  totalPages: number
): Promise<DocumentChunk[]> {
  const docs = await splitter.createDocuments([text]);

  const chunks: DocumentChunk[] = docs.map((doc, index) => {
    // Estimate page number based on position in text
    const charPosition = text.indexOf(doc.pageContent.substring(0, 50));
    const estimatedPage =
      charPosition >= 0
        ? Math.min(Math.floor((charPosition / text.length) * totalPages) + 1, totalPages)
        : 1;

    return {
      id: uuidv4(),
      text: doc.pageContent,
      metadata: {
        fileName,
        chunkIndex: index,
        pageNumber: estimatedPage,
        uploadTimestamp: new Date().toISOString(),
        documentId,
      },
    };
  });

  return chunks;
}
