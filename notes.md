# DocGlow AI — RAG Project Notes (Viva Preparation)

> A complete, exam-ready explanation of the project: what it does, how it works,
> the technology behind every piece, the full data flow, the bugs that were
> fixed in production, and a large bank of likely viva questions with answers.

---

## 1. One-line Summary

**DocGlow AI is a NotebookLM-style RAG (Retrieval-Augmented Generation) web app: you upload a PDF/TXT document, it is parsed → chunked → embedded → stored in a vector database, and then you can chat with the document and get answers that are *grounded* in its content, with source citations.**

---

## 2. What is RAG and Why Use It?

**RAG = Retrieval-Augmented Generation.**

A normal LLM (like GPT-4o-mini) only knows what it was trained on. It cannot answer questions about *your* private document, and if forced to, it will **hallucinate** (make things up).

RAG solves this by combining two steps:

1. **Retrieval** — Given a user's question, find the most *relevant pieces* of the uploaded document.
2. **Generation** — Feed those relevant pieces to the LLM as context, and ask it to answer **only** from that context.

**Why it matters (viva points):**
- **No hallucination** — answers are grounded in real document text.
- **No retraining** — you don't fine-tune the model; you just supply context at query time. Cheap and fast.
- **Up-to-date / private knowledge** — works on documents the model has never seen.
- **Citations** — because you know which chunks were retrieved, you can show sources.

**Analogy:** RAG is an *open-book exam*. The LLM is a smart student; the retrieval step decides *which pages of the book to put in front of them* before they answer.

---

## 3. Technology Stack (and Why Each Was Chosen)

| Layer | Technology | Role |
|-------|-----------|------|
| Framework | **Next.js 14 (App Router)** | Full-stack React — frontend pages + backend API routes in one project |
| Language | **TypeScript** | Type safety across frontend and backend |
| Styling | **Tailwind CSS** + custom "glassmorphism" CSS | The cinematic UI |
| Animation | **Framer Motion** | Smooth transitions, panel slides, micro-interactions |
| 3D | **Three.js + React Three Fiber** | The animated hero particle scene |
| PDF parsing | **pdf-parse** | Extract raw text from PDF files |
| Chunking | **LangChain `RecursiveCharacterTextSplitter`** | Split long text into overlapping chunks |
| Embeddings | **OpenAI `text-embedding-3-small`** | Turn text into 1536-dimensional vectors |
| Vector DB | **Qdrant Cloud** | Store vectors and do similarity search |
| LLM | **OpenAI `gpt-4o-mini`** | Generate the grounded answer (streamed) |
| File upload UI | **react-dropzone** | Drag-and-drop zone |
| Markdown rendering | **react-markdown + remark-gfm** | Render the AI's formatted answers |

**Key idea:** Next.js lets the *same* project serve the React UI (`src/app/page.tsx`) **and** the backend endpoints (`src/app/api/.../route.ts`). The API routes run server-side, so secret keys (OpenAI, Qdrant) never reach the browser.

---

## 4. Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main UI: landing + dashboard (client component)
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Design system / animations
│   └── api/
│       ├── upload/route.ts   # POST: ingest a document (parse→chunk→embed→store)
│       └── chat/route.ts     # POST: answer a question (embed→search→generate→stream)
├── components/               # All React UI pieces
│   ├── upload-zone.tsx       # Drag & drop + animated processing steps
│   ├── chat-panel.tsx        # Chat input + streaming messages
│   ├── sources-panel.tsx     # Slide-out panel showing retrieved chunks
│   ├── source-card.tsx       # One retrieved chunk (score, page, text)
│   ├── message-bubble.tsx    # One chat message
│   ├── sidebar.tsx           # Document metadata
│   └── hero-3d.tsx           # Three.js particle scene
├── lib/                      # Core logic (the "brains")
│   ├── pdf.ts                # Text extraction from PDF/TXT
│   ├── chunking.ts           # Split text into chunks
│   ├── embeddings.ts         # OpenAI embedding calls
│   ├── qdrant.ts             # Vector DB: create collection, upsert, search
│   ├── vector.ts             # Orchestrates embed + store
│   ├── rag.ts                # The RAG query pipeline (retrieve + generate)
│   ├── prompts.ts            # System prompt + context builder
│   └── utils.ts              # Helpers (truncate, file size, classnames)
└── types/                    # TypeScript interfaces
    ├── document.ts           # DocumentChunk, UploadedDocument, UploadStatus
    └── chat.ts               # ChatMessage, RetrievedSource
```

**Two mental halves of the app:**
- **Ingestion pipeline** (when you upload): `upload/route.ts → pdf.ts → chunking.ts → vector.ts → embeddings.ts → qdrant.ts`
- **Query pipeline** (when you chat): `chat/route.ts → rag.ts → embeddings.ts → qdrant.ts → OpenAI → stream back`

---

## 5. The Ingestion Pipeline (Upload Flow) — Step by Step

**File: `src/app/api/upload/route.ts`**

When a file is uploaded, the backend does 3 real steps (the fancy "Uploading / Extracting / Chunking / Embedding / Storing" steps you see in the UI are **simulated animations** on the frontend in `page.tsx` — the actual work is one single API call).

### Step 0 — Validation
- Accept only **PDF** and **TXT** (`file.type` or extension check).
- Reject files over **20 MB**.
- Generate a unique `documentId` using `uuidv4()` — this is the **namespace** that keeps one document's chunks separate from another's.

### Step 1 — Text Extraction (`lib/pdf.ts`)
- For PDFs: `pdf-parse` reads the binary buffer and returns `{ text, numpages }`.
- For TXT: just decode the buffer as UTF-8.
- If no text comes out (e.g. a scanned/image-only PDF), return an error: *"Could not extract text… may contain only images."*

### Step 2 — Chunking (`lib/chunking.ts`)
- Why chunk? Embedding models and the LLM have **token limits**, and retrieval is more precise on small pieces. You don't embed a whole 50-page PDF as one vector — you'd lose all granularity.
- Uses LangChain's **`RecursiveCharacterTextSplitter`**:
  - `chunkSize: 1000` characters
  - `chunkOverlap: 200` characters
  - `separators: ["\n\n", "\n", ". ", " ", ""]`
- **Overlap** (200 chars) means consecutive chunks share some text. This prevents a sentence/idea from being split across a boundary and lost.
- **Recursive** means it tries to split on paragraph breaks first, then line breaks, then sentences, then words — preserving meaning as much as possible.
- Each chunk gets metadata: `fileName`, `chunkIndex`, an **estimated** `pageNumber`, `uploadTimestamp`, and the `documentId`.

### Step 3 — Embed + Store (`lib/vector.ts` → `embeddings.ts` + `qdrant.ts`)
- **Embedding** (`embeddings.ts`): each chunk's text is sent to OpenAI's `text-embedding-3-small`, which returns a **1536-dimensional vector** (an array of 1536 numbers). Done in **batches of 100** to stay within API limits.
- **Storing** (`qdrant.ts`):
  - `ensureCollection()` creates the Qdrant collection `docglow_documents` if it doesn't exist, configured with vector size **1536** and **Cosine** distance.
  - A **payload index** on `documentId` is created so filtering by document is fast.
  - `upsertChunks()` inserts each chunk as a **point**: `{ id, vector, payload }`, where the payload holds the text + metadata. Done in batches of 100.

**Result returned to the browser:** `documentId`, `fileName`, `totalChunks`, `pageCount`, a text preview, and `status: "ready"`.

---

## 6. The Query Pipeline (Chat Flow) — Step by Step

**Files: `src/app/api/chat/route.ts` → `src/lib/rag.ts`**

When you ask a question:

1. **Embed the question** (`generateSingleEmbedding`) — the query is turned into a 1536-d vector using the *same* embedding model. (Critical: query and documents **must** use the same model, or the vectors aren't comparable.)

2. **Similarity search** (`searchSimilar` in `qdrant.ts`):
   - Qdrant compares the query vector against all stored chunk vectors **for this `documentId` only** (filter on `documentId`).
   - Returns the **top 5** most similar chunks (`topK = 5`) ranked by **cosine similarity score** (0–1, higher = more similar).

3. **Build the context prompt** (`prompts.ts → buildContextPrompt`):
   - Formats the 5 chunks into a labeled block like
     `[Source 1 | Chunk #3 | Page 2]\n<chunk text>`.

4. **Generate the answer** (`rag.ts`):
   - Calls `gpt-4o-mini` with:
     - a **system prompt** that forbids outside knowledge and hallucination, and tells it to say *"I could not find this information…"* when the answer isn't in the context;
     - the user message = context + the actual question.
   - `temperature: 0.1` → low randomness → **maximum factual consistency** (we don't want creativity here).
   - `stream: true` → tokens come back incrementally.

5. **Stream back to the browser:**
   - The answer is sent as a streamed `ReadableStream` (text appears word-by-word).
   - The **sources** are sent in a custom HTTP header `X-Sources` (base64-encoded JSON) so the UI can show which chunks were used.

6. **Frontend** (`chat-panel.tsx`): reads the stream chunk-by-chunk and updates the message live; decodes `X-Sources` to populate the sources panel.

---

## 7. Key Concepts Explained Simply (for the examiner)

### Embeddings / Vectors
An **embedding** is a list of numbers (here 1536 of them) that represents the *meaning* of a piece of text. Texts with similar meaning have vectors that point in similar directions. "dog" and "puppy" land close together; "dog" and "spreadsheet" land far apart. This is what makes **semantic search** possible — we find chunks by *meaning*, not by exact keyword match.

### Cosine Similarity
A way to measure how similar two vectors are by the **angle** between them (not their length). Value ranges from **-1 to 1**; for these embeddings it's effectively **0 to 1**, where **1 = identical meaning**. The app shows this as a percentage on each source card.

### Vector Database (Qdrant)
A regular database finds rows by exact values. A **vector database** is optimized to answer *"which stored vectors are closest to this query vector?"* extremely fast, even over millions of vectors, using **Approximate Nearest Neighbor (ANN)** search. Qdrant Cloud is the managed hosting we use.

### Chunking + Overlap
Long documents are split into ~1000-char pieces with 200-char overlap so (a) each piece fits the model, (b) retrieval is precise, and (c) ideas aren't cut in half at boundaries.

### Namespace Isolation (`documentId`)
Every chunk stores the `documentId` it belongs to. At query time we **filter** by `documentId`, so a question about Document A never retrieves chunks from Document B. This is a security/correctness feature.

### Streaming
Instead of waiting for the whole answer, the server sends tokens as they're generated. The UI shows the answer typing out in real time — better UX and feels faster.

### Grounding / System Prompt
The system prompt is the *guardrail*. It explicitly tells the model: only use the provided context, never invent, and admit when the answer isn't there. This is what turns a general chatbot into a **trustworthy document assistant**.

---

## 8. Why These Specific Choices (Trade-off Questions)

- **Why `text-embedding-3-small` (not `-large`)?** Cheaper, faster, 1536-d is plenty for document Q&A. `-large` (3072-d) costs more for marginal gains here.
- **Why `gpt-4o-mini` (not GPT-4o)?** Cheap, fast, and more than capable for grounded summarization/Q&A. Cost-efficient for a demo/portfolio app.
- **Why `temperature: 0.1`?** We want deterministic, faithful answers, not creative writing.
- **Why `topK = 5`?** Enough context to answer well without flooding the prompt (which costs tokens and can dilute relevance).
- **Why Cosine distance?** Standard for normalized text embeddings; measures semantic direction, robust to vector magnitude.
- **Why Qdrant Cloud?** Managed, free tier, simple REST client, supports payload filtering (needed for `documentId` isolation).

---

## 9. Production Bugs Fixed (Excellent Viva Material — shows real debugging)

These are *real* issues that broke the live deployment and how they were diagnosed and fixed. Examiners love this because it shows understanding beyond "it works on my machine."

### Bug 1 — Every PDF upload failed in production (`pdf-parse` crash)
- **Symptom:** All PDFs failed; worked locally, broke on the deployed (Vercel serverless) link.
- **Cause:** `pdf-parse@1.1.1`'s `index.js` has a leftover **debug block** that runs
  `fs.readFileSync('./test/data/05-versions-space.pdf')` whenever `module.parent` is falsy.
  In a serverless bundle, `module.parent` is always `undefined`, so it tried to read a
  test file that doesn't exist → threw `ENOENT` the moment the module loaded.
- **Fix:** Import the implementation directly — `import pdfParse from "pdf-parse/lib/pdf-parse.js"` — which bypasses the debug block entirely.
- **Lesson:** Code that works locally can fail in serverless because the module system behaves differently (`module.parent`).

### Bug 2 — Fragile API client initialization
- **Cause:** The OpenAI client was created at the **top of the module** (`new OpenAI({apiKey})`). The SDK throws if the key is missing *at construction time*, which can break the build step.
- **Fix:** **Lazy initialization** — create the client inside a function on first use, so the key is only needed at request time.
- **Lesson:** Don't do side-effectful work (that needs secrets) at module load; defer it.

### Bug 3 — Dead Qdrant cluster
- **Symptom:** After PDF parsing was fixed, uploads failed with `404 Not Found` from Qdrant.
- **Cause:** **Free-tier Qdrant clusters get suspended/deleted after inactivity.** The `QDRANT_URL` pointed to a cluster that no longer existed — every path (`/`, `/healthz`, `/collections`) returned a generic Go `404 page not found`.
- **Fix (infra):** Recreate the cluster and update `QDRANT_URL` / `QDRANT_API_KEY` in Vercel. Also hardened the code to throw a *clear* error ("Could not reach Qdrant…") instead of a cryptic one.
- **Lesson:** Distinguish **code bugs** from **infrastructure/config issues**. The 404 being a *Go* error (not Qdrant's JSON) was the clue that no Qdrant was behind the URL.

### Bug 4 — Sources panel crashed the whole app
- **Symptom:** Clicking "5 sources" crashed the UI (blank screen).
- **Cause:** **Field-name mismatch** between backend and frontend. The vector store returns chunks with a `text` field, but the UI's `RetrievedSource` type / `SourceCard` expected `chunkText`. So `source.chunkText` was `undefined`, and `truncateText(undefined)` did `.length` on `undefined` → threw → React unmounted the whole tree.
- **Fix:** Map `text → chunkText` at the API boundary (in `chat/route.ts`), and harden `truncateText` to return `""` for falsy input so a missing field can never crash the app again.
- **Lesson:** Keep the **data contract** between backend and frontend consistent; add **defensive coding** at boundaries.

---

## 10. Data Flow Diagrams (verbal)

**Ingestion:**
```
User drops PDF
   ↓ (multipart/form-data POST)
/api/upload
   ↓ pdf-parse → raw text
   ↓ RecursiveCharacterTextSplitter → chunks (1000/200)
   ↓ OpenAI text-embedding-3-small → 1536-d vectors (batched 100)
   ↓ Qdrant upsert (points = vector + payload, filtered by documentId)
   ↓
returns { documentId, totalChunks, pageCount, ... }
```

**Query:**
```
User asks question
   ↓ (JSON POST: { query, documentId })
/api/chat → rag.ts
   ↓ embed query (same model)
   ↓ Qdrant search (filter documentId, topK=5, cosine) → top chunks
   ↓ buildContextPrompt → labeled context
   ↓ gpt-4o-mini (system prompt + context + question, temp 0.1, stream)
   ↓ stream tokens back  +  X-Sources header (base64 JSON of chunks)
   ↓
ChatPanel renders streaming answer + Sources panel
```

---

## 11. Likely Viva Questions & Answers

**Q: What is RAG?**
A: Retrieval-Augmented Generation — retrieve relevant document chunks for a query, then have an LLM answer using only those chunks. It grounds answers in real data and prevents hallucination without retraining.

**Q: Why not just paste the whole document into the prompt?**
A: Token limits and cost — large documents exceed the context window, and sending everything every time is expensive and dilutes relevance. RAG sends only the most relevant ~5 chunks.

**Q: What is an embedding?**
A: A numeric vector (here 1536 dimensions) representing the meaning of text, so semantically similar texts have nearby vectors.

**Q: How does the app find relevant chunks?**
A: It embeds the query, then does cosine-similarity nearest-neighbor search in Qdrant, filtered to the document's `documentId`, returning the top 5.

**Q: Why chunk overlap?**
A: So an idea/sentence split across a chunk boundary isn't lost — the overlap keeps continuity.

**Q: How do you prevent hallucination?**
A: A strict system prompt forces the model to answer only from the provided context and to say "I could not find this" otherwise; plus low temperature (0.1) for faithfulness.

**Q: What does `temperature` do?**
A: Controls randomness. Low (0.1) = focused, deterministic; high = creative/varied. We want faithful answers, so it's low.

**Q: Why a vector database instead of SQL?**
A: SQL matches exact values; a vector DB does fast approximate nearest-neighbor search over high-dimensional vectors — needed for semantic similarity.

**Q: How is one document kept separate from another?**
A: Each chunk stores a `documentId`; queries filter on it (namespace isolation), and there's a payload index on it for speed.

**Q: What does streaming give you?**
A: The answer appears token-by-token in real time, improving perceived speed and UX.

**Q: Where do API keys live and why is that safe?**
A: In environment variables, used only inside server-side API routes (`/api/...`). They never reach the browser.

**Q: What happens for a scanned (image-only) PDF?**
A: `pdf-parse` extracts no text, so the upload returns an error. (Handling it would require OCR — a possible future improvement.)

**Q: How is the page number for a chunk determined?**
A: It's **estimated** from the chunk's character position relative to total text length × page count (in `chunking.ts`). It's approximate, not exact, because `pdf-parse` returns text without precise per-chunk page boundaries.

**Q: What are the main limitations / future improvements?**
A: Approximate page numbers; no OCR for scanned PDFs; no multi-document chat; no persistence of chat history; free-tier vector DB can be suspended; could add re-ranking, hybrid (keyword+vector) search, and caching of embeddings.

**Q: What is `upsert`?**
A: Insert-or-update — add the point if new, update if the id already exists.

**Q: Why batch the embeddings/upserts in 100s?**
A: To respect API/DB request-size limits and to be efficient with network round-trips.

---

## 12. 30-Second Elevator Pitch (memorize this)

> "DocGlow AI is a RAG application. When you upload a document, I extract its text, split it into overlapping ~1000-character chunks, convert each chunk into a 1536-dimensional embedding using OpenAI, and store those vectors in Qdrant. When you ask a question, I embed the question, run a cosine-similarity search to pull the 5 most relevant chunks for that specific document, and pass them to GPT-4o-mini with a strict system prompt that forces it to answer only from those chunks. The answer is streamed back with citations to the exact source chunks — so it's accurate, grounded, and never hallucinates."

---

## 13. Quick Glossary

- **RAG** — Retrieval-Augmented Generation.
- **Embedding** — numeric vector capturing text meaning.
- **Vector DB** — database for fast similarity search over vectors (Qdrant).
- **Cosine similarity** — angle-based similarity metric (0–1).
- **Chunk** — a small slice of the document's text.
- **topK** — number of chunks retrieved per query (5 here).
- **Grounding** — restricting answers to provided context.
- **Streaming** — sending the answer incrementally.
- **Namespace isolation** — separating data by `documentId`.
- **Upsert** — insert or update.
- **Serverless** — backend runs as on-demand functions (Vercel), not a always-on server.
```
