# DocGlow AI

> A premium NotebookLM-style RAG application — upload documents, chat with them using grounded AI answers.

![DocGlow AI](https://img.shields.io/badge/DocGlow-AI-00d4ff?style=for-the-badge&logo=sparkles&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwindcss)

---

## ✨ Features

- **Upload Documents** — Drag & drop PDF or TXT files with beautiful upload animations
- **Full RAG Pipeline** — Parse → Chunk → Embed → Store → Retrieve → Generate
- **Streaming Chat** — Real-time streaming responses with markdown rendering
- **Source Citations** — See exactly which chunks the AI used to answer
- **3D Visuals** — Interactive Three.js particle galaxy with mouse tracking
- **Premium UI** — Glassmorphism, animated gradients, glow effects
- **Dark Mode** — Futuristic dark theme throughout

---

## 🏗️ Architecture

```
User uploads document
        │
        ▼
  ┌─────────────┐
  │  PDF/TXT    │  Text extraction (pdf-parse)
  │  Parser     │
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │  Chunker    │  RecursiveCharacterTextSplitter
  │  1000/200   │  (chunkSize/overlap)
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │  Embeddings │  text-embedding-3-small (1536d)
  │  OpenAI     │
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │  Qdrant     │  Vector storage with metadata
  │  Cloud      │
  └─────────────┘

User asks question
        │
        ▼
  ┌─────────────┐
  │  Embed      │  Query → embedding
  │  Query      │
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │  Retrieve   │  Similarity search (top 5)
  │  Chunks     │
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │  GPT-4.1    │  Grounded generation
  │  Mini       │  with streaming
  └─────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Grok API key (from xAI)
- Qdrant Cloud account (free tier works)

### 1. Clone & Install

```bash
git clone https://github.com/your-repo/docglow-ai-rag.git
cd docglow-ai-rag
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
XAI_API_KEY=xai-...
QDRANT_URL=https://your-cluster.qdrant.io:6333
QDRANT_API_KEY=your-qdrant-api-key
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main page (landing + dashboard)
│   ├── layout.tsx            # Root layout with metadata
│   ├── globals.css           # Design system & animations
│   └── api/
│       ├── upload/route.ts   # File upload + RAG ingestion
│       └── chat/route.ts     # Streaming chat endpoint
├── components/
│   ├── hero.tsx              # Landing hero section
│   ├── hero-3d.tsx           # Three.js particle scene
│   ├── upload-zone.tsx       # Drag & drop upload
│   ├── chat-panel.tsx        # Chat interface
│   ├── message-bubble.tsx    # Chat message component
│   ├── source-card.tsx       # Collapsible source card
│   ├── sources-panel.tsx     # Right drawer for sources
│   ├── sidebar.tsx           # Left sidebar (doc info)
│   ├── loading-state.tsx     # Processing indicators
│   ├── animated-background.tsx # Ambient glow blobs
│   └── glowing-button.tsx    # Reusable button
├── lib/
│   ├── rag.ts                # RAG orchestration
│   ├── pdf.ts                # Text extraction
│   ├── chunking.ts           # Text splitting
│   ├── embeddings.ts         # OpenAI embeddings
│   ├── qdrant.ts             # Vector DB client
│   ├── vector.ts             # Storage helper
│   ├── prompts.ts            # System prompt
│   └── utils.ts              # Utility functions
└── types/
    ├── chat.ts               # Chat types
    └── document.ts           # Document types
```

---

## 🧠 RAG Strategy

### Chunking

- **Splitter**: `RecursiveCharacterTextSplitter`
- **Chunk Size**: 1000 characters
- **Overlap**: 200 characters
- **Separators**: `\n\n`, `\n`, `. `, ` `, ``

### Embeddings

- **Model**: `all-MiniLM-L6-v2` (Local via Transformers.js)
- **Dimensions**: 384
- **Mode**: Local processing (Free)

### Retrieval

- **Method**: Cosine similarity search
- **Top K**: 5 chunks
- **Filtering**: By `documentId` for namespace isolation

### Generation

- **Model**: `grok-beta`
- **Temperature**: 0.1 (factual)
- **Streaming**: Yes
- **Grounding**: Strict — only answers from context

---

## 🌐 Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Set environment variables in Vercel dashboard:

- `OPENAI_API_KEY`
- `QDRANT_URL`
- `QDRANT_API_KEY`

---

## 🔮 Future Improvements

- [ ] Multi-document support
- [ ] Conversation memory / history
- [ ] Document comparison mode
- [ ] OCR for scanned PDFs
- [ ] User authentication
- [ ] Usage analytics
- [ ] DOCX/PPTX support
- [ ] Export chat as PDF
- [ ] Reranking with Cohere
- [ ] Hybrid search (keyword + semantic)

---

## 📄 License

MIT

---

Built with ❤️ using Next.js, OpenAI, Qdrant, and Three.js
