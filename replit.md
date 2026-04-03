# AUTOCURATOR - AI Art Movement Analyzer

## Overview

AUTOCURATOR is an AI-powered web application that analyzes paintings to identify their art movement, historical context, visual characteristics, and comparisons with master artists. Users upload images of paintings, and the app uses OpenAI's vision models (GPT-5.1) to return a comprehensive JSON analysis including movement identification, artist comparisons, buyer interest profiles, and technique breakdowns. Results are stored in a PostgreSQL database and can be viewed as detailed reports with PDF export capability.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side router)
- **State Management**: TanStack React Query for all server state and data fetching
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming; dark mode by default with a professional aesthetic using Playfair Display (serif) for headings and Inter (sans-serif) for body text
- **Build Tool**: Vite with HMR, includes Replit-specific dev plugins (cartographer, dev-banner, error overlay)
- **Additional Libraries**: framer-motion for animations, lucide-react for icons, html2canvas + jsPDF for PDF report generation, react-dropzone for image upload

### Backend Architecture
- **Framework**: Express.js 5 with TypeScript, running on Node.js
- **API Pattern**: REST API with typed route definitions in `shared/routes.ts` using Zod schemas for input validation and response types
- **AI Integration**: OpenAI API accessed through Replit AI Integrations (environment variables `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL`); uses vision model for image analysis with structured JSON output
- **Authentication**: Replit Auth via OpenID Connect (passport + express-session with PostgreSQL session store via connect-pg-simple)
- **Build Process**: esbuild bundles the server to `dist/index.cjs`; Vite builds the client to `dist/public`

### Data Flow
1. User uploads an image via drag-and-drop on the React frontend
2. Image is converted to base64 and sent to `POST /api/analyze`
3. Server validates input with Zod, sends image to OpenAI vision API with a detailed art historian system prompt
4. OpenAI returns structured JSON matching `artAnalysisSchema`
5. Analysis is saved to PostgreSQL `analyses` table and returned to client
6. Client navigates to `/analyses/:id` to display the rich result with cards, progress bars, comparisons, and PDF export

### Code Organization
```
├── client/src/              # React frontend
│   ├── components/          # UI components (shadcn/ui + custom like ImageUpload, LayoutShell)
│   ├── pages/               # Route pages (analyze, analysis-result, dashboard, landing, not-found)
│   ├── hooks/               # Custom hooks (use-analysis, use-auth, use-toast, use-mobile)
│   └── lib/                 # Utilities (queryClient, utils, auth-utils)
├── server/                  # Express backend
│   ├── index.ts             # Server entry point, middleware setup
│   ├── routes.ts            # API route handlers
│   ├── storage.ts           # DatabaseStorage class implementing IStorage interface
│   ├── db.ts                # Drizzle ORM + pg Pool setup
│   ├── vite.ts              # Vite dev server middleware
│   ├── static.ts            # Production static file serving
│   └── replit_integrations/ # Pre-built integration modules (auth, chat, audio, image, batch)
├── shared/                  # Shared between client and server
│   ├── schema.ts            # Drizzle table definitions + Zod schemas (analyses, art analysis types)
│   ├── routes.ts            # Typed API route contracts with Zod validation
│   └── models/              # Additional models (auth users/sessions, chat conversations/messages)
├── script/build.ts          # Production build script
└── migrations/              # Drizzle-kit migration output
```

### Database Schema
Uses PostgreSQL with Drizzle ORM. Push schema with `npm run db:push`.

- **`analyses`**: `id` (serial PK), `userId` (varchar), `imageBase64` (text), `result` (jsonb - stores full ArtAnalysis object), `createdAt` (timestamp)
- **`users`**: `id` (varchar PK, UUID), `email`, `firstName`, `lastName`, `profileImageUrl`, `createdAt`, `updatedAt` — required for Replit Auth
- **`sessions`**: `sid` (varchar PK), `sess` (jsonb), `expire` (timestamp) — required for Replit Auth session storage
- **`conversations`**: `id` (serial PK), `title` (text), `createdAt` — for chat integration
- **`messages`**: `id` (serial PK), `conversationId` (FK to conversations), `role`, `content`, `createdAt` — for chat integration

### Key API Endpoints
- `POST /api/analyze` — Upload image for AI analysis, returns analysis result + saved ID
- `GET /api/analyses` — List all analyses for current user
- `GET /api/analyses/:id` — Get specific analysis by ID
- `DELETE /api/analyses/:id` — Delete an analysis
- `GET /api/auth/user` — Get authenticated user info
- Auth flows handled by Replit Auth at `/api/login`, `/api/logout`, `/api/callback`

## External Dependencies

- **PostgreSQL**: Primary database, required via `DATABASE_URL` environment variable. Used for all persistent data including sessions, users, and analyses.
- **OpenAI API** (via Replit AI Integrations): Powers the art analysis. Requires `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL` environment variables. Uses `gpt-5.1` model with vision capabilities and JSON response format.
- **Replit Auth (OpenID Connect)**: Authentication system. Requires `REPL_ID`, `ISSUER_URL`, and `SESSION_SECRET` environment variables. Uses passport with OpenID Client strategy.
- **Google Fonts**: Loads Playfair Display, Inter, DM Sans, Fira Code, Geist Mono, and Architects Daughter fonts externally.
- **Drizzle Kit**: Database schema management tool, run `npm run db:push` to sync schema to database.