# Family Story Studio — Vintage Editorial Edition

Family Story Studio is a full-stack web application designed to help families preserve their precious memories. Users upload photographic artifacts, draft warm description fragments, and use state-of-the-art **Gemini AI** to weave these disjointed memories into a cohesive, beautifully typeset literary chronicle. This chronicled story can be downloaded instantly as a highly styled, print-ready PDF book and saved in your local directory for long-term archiving.

---

## 🎨 Design Concept: Editorial Aesthetic

The application is styled with a highly polished, museum-grade **Editorial Aesthetic**:
*   **Color Palette**: Warm cream and ivory canvases (`#FDFBF7`), soft stone sidebars (`#F9F7F2`), delicate gold-toned dividing lines (`#E5E1D8`), and high-contrast, deep ink typography (`#1A1816`).
*   **Typography**: Graceful **Playfair Display** serif fonts for titles, narrative content, and chapter headers, paired with **Plus Jakarta Sans** sans-serif for clean, responsive controls and input panels.
*   **Framing & Accents**: Flat-edged vintage frames, subtle linen borders, and classic printer ornaments (❖) reflecting traditional book arts.

---

## ✨ Key Features & Architectural Highlights

### 1. Multi-Modal Story Synthesis
The backend leverages the modern `@google/genai` SDK to process text descriptions and base64 photographic streams simultaneously. Gemini orchestrates the multi-image sequence, understands the physical details, notes the emotional warmth of descriptions, and outputs structured, chapter-by-chapter JSON containing titles, dedicated text paragraphs, and image indices.

### 2. Beautiful Typeset PDF Generator
Utilizing the `jspdf` library, the application converts the generated narrative into a gorgeous, multipage PDF book featuring:
*   An elegant, double-bordered **Front Cover** with golden accents, a custom dedication line, and the first photograph framed as an illustration cover.
*   Flowable, multi-page **Chapter Layouts** that map the corresponding photographic artifacts with captions directly into their narrative slots.
*   An **Epilogue** conclusion page decorated with a printer's mark.
*   Consistent running footers and automatic page numbers.

### 3. Progressive Client-Side Image Compression
An intelligent canvas compression engine (`src/utils/imageCompressor.ts`) resizes and optimizes user-submitted photographs on the fly before sending them to the backend server. This ensures lightning-fast network payloads, optimal memory usage, and flawless API execution under standard Cloud Run constraints.

### 4. Direct Archival Workspace Alignment
A dedicated instructions card guides the user to drag and drop the downloaded PDF from their default browser directory straight into their local project repository, ensuring family archives are securely aligned with application deployment scripts.

---

## 🛠️ Multi-Skill Architecture

The application is built on a scalable full-stack **Express + Vite** runtime. It uses the following capabilities:

*   **Vite Dev Server Proxy Routing**: All front-end assets are loaded dynamically via Vite middleware in development mode, while all API key secrets are securely handled on the backend node server (`server.ts`).
*   **TypeScript & Node type stripping**: The application is written entirely in strictly typed TypeScript. Production builds bundle the backend using `esbuild` for cold-start performance inside container hosts.
*   **`gemini-api` Integration Guideline**: Follows guidelines using a server-side client with safety guards to guarantee the developer environment doesn't expose secrets or trigger unhandled cross-origin errors in the interactive iFrame sandbox.

---

## 🖥️ User Interface Overview

*   **Artifact Studio (Left Column / Setup)**:
    *   **Chronicle Configuration Panel**: Set volume titles, change story genre styles (Heartfelt, Whimsical, Vintage Memoir, Bedtime), and define overall background context and theme backdrops.
    *   **Captured Memories Collector**: Add, edit, remove, and re-order memories using the ascending/descending arrow buttons to preserve chronological story paths. Supports instant file upload and drag-and-drop operations.
*   **Archival Guide & Live Album (Right Column / Info)**:
    *   Provides professional tip cards outlining storytelling techniques (Sensory details, chronology mapping, PDF exporting).
    *   Fades into an interactive **Storybook Skeleton** while the AI writes your book.
*   **Interactive Book Viewer (Active Story State)**:
    *   Hides layout configurations once compiled to reveal a full-screen, responsive, double-page layout mockup.
    *   Equipped with a main action header to instantly **Download the PDF**, edit historical snapshots, or boot up another story volume.
