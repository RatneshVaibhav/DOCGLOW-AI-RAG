import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DocGlow AI — Talk To Your Documents",
  description:
    "Upload PDFs and chat with them using grounded AI retrieval. Premium AI-powered document analysis with RAG technology.",
  keywords: [
    "AI",
    "RAG",
    "document analysis",
    "PDF chat",
    "NotebookLM",
    "AI assistant",
  ],
  openGraph: {
    title: "DocGlow AI — Talk To Your Documents",
    description: "Upload PDFs and chat with them using grounded AI retrieval.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="noise-bg min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
