# DataGov Querier 🏛️

> _Because sometimes finding government data feels like searching for buried treasure... minus the treasure map._

A Next.js-powered interface that lets you ask questions about federal, state, and local government data without needing a PhD in navigating data.gov. This is an interview project that connects to a backend agent which does the heavy lifting of actually finding and interpreting government datasets.

## What Does This Thing Do? 🤔

This is a sleek, real-time query interface that:

- **Asks questions** about government data (literally, just type and hit enter)
- **Streams live progress** via WebSocket so you can watch the backend agent think (because waiting in silence is boring)
- **Renders beautiful markdown results** with tables, code blocks, and all the GitHub-flavored goodness
- **Preserves your connection** across page refreshes (because losing your session is the worst)
- **Shows collapsible state logs** so you can see exactly what the agent is doing at each step

Think of it as a friendly librarian for government data, but one that actually knows where everything is.

## Tech Stack

Built with modern web tech that doesn't make you want to pull your hair out:

- **[Next.js 15](https://nextjs.org/)** with App Router (because file-based routing is chef's kiss)
- **[React 19](https://react.dev/)** with hooks all over the place
- **[TypeScript](https://www.typescriptlang.org/)** (for the type safety enthusiasts)
- **[Tailwind CSS](https://tailwindcss.com/)** + **[Tailwind Typography](https://tailwindcss.com/docs/typography-plugin)** (utility classes go brrr)
- **[shadcn/ui](https://ui.shadcn.com/)** components (pre-styled, accessible, gorgeous)
- **[Framer Motion](https://www.framer.com/motion/)** (for those smooth animations)
- **[WebSocket](https://github.com/pladaria/websocket-ts)** with auto-reconnect (because networks are unreliable)
- **[Lucide Icons](https://lucide.dev/)** (crisp, clean, perfect)
- **[react-markdown](https://github.com/remarkjs/react-markdown)** with GFM support (markdown rendering with tables and all)

## Project Structure

Here's where everything lives in `/src`:

```
src/
├── app/
│   ├── page.tsx           # Main search interface with all the React magic
│   ├── layout.tsx         # Root layout with Geist fonts
│   ├── globals.css        # Global Tailwind styles
│   └── favicon.ico        # That little icon you see in browser tabs
│
├── components/
│   ├── loading-console.tsx    # Real-time log viewer with accordion states
│   ├── settings-dialog.tsx    # Server URL configuration dialog
│   └── ui/                    # shadcn/ui components (button, input, dialog, accordion)
│       ├── accordion.tsx
│       ├── button.tsx
│       ├── dialog.tsx
│       └── input.tsx
│
└── lib/
    ├── api.ts              # REST API client for /research endpoint
    ├── websocket.ts        # WebSocket manager with auto-reconnect magic
    ├── ws-messages.ts      # Message parsing and formatting utilities
    └── utils.ts            # Tailwind class merge helper (cn function)
```

### Key Files Explained

#### **`app/page.tsx`** (src/app/page.tsx:1)

The main event. This is where the magic happens:

- Search input with real-time query handling
- WebSocket connection management with state preservation
- Message streaming and state section tracking
- Collapsible accordion logs for completed states
- Live progress display with animated loading console
- Beautiful markdown rendering of results with custom prose styling

#### **`lib/websocket.ts`** (src/lib/websocket.ts:1)

A robust WebSocket manager that:

- Auto-connects with exponential backoff (connection drops? no problem)
- Preserves connection ID in localStorage (survives page refreshes)
- Handles reconnection with the same session ID
- Converts HTTP(S) URLs to WS(S) automatically
- Provides a clean pub/sub interface for message handling

#### **`lib/ws-messages.ts`** (src/lib/ws-messages.ts:1)

The message protocol handler with:

- Type-safe message parsing (`STATE_TRANSITION`, `SUB_STATE_LOG`, `INFO`, `ERROR`, etc.)
- Message formatting for display (turns raw data into human-readable logs)
- Support for chain/tool lifecycle events
- Timestamp handling and log ID generation

#### **`components/loading-console.tsx`** (src/components/loading-console.tsx:1)

A fancy real-time log viewer featuring:

- Collapsible accordions for completed state sections
- Active state display with spinning loader
- Auto-scrolling logs (because manually scrolling is so 2010)
- Smooth animations with Framer Motion
- Monospace font for that authentic console vibe

#### **`components/settings-dialog.tsx`** (src/components/settings-dialog.tsx:1)

Simple settings modal for:

- Configuring the backend server URL
- Storing preferences in localStorage
- Imperative open/close controls via ref (for when there's no server URL set)

#### **`lib/api.ts`** (src/lib/api.ts:1)

Clean REST API client for the `/research` endpoint. Takes a query and connection ID, returns markdown results.

## How It Works

The flow is surprisingly straightforward:

1. **User enters a query** → "What's the unemployment rate in California?"
2. **Frontend checks settings** → Got a server URL? Connection ID? Good to go.
3. **POST to `/research`** → Sends query + connection ID to backend agent
4. **WebSocket streams progress** → Backend sends state transitions and logs in real-time
5. **UI updates live** → Loading console shows current state + logs, previous states collapse into accordions
6. **Agent finishes** → Final markdown result renders below the console
7. **User reads results** → Beautifully formatted tables, links, and explanations

The WebSocket connection persists across queries and page refreshes (thanks to localStorage magic), so you don't lose your session when you accidentally hit refresh.

## Getting Started

### Prerequisites

- Node.js (v20+)
- npm, yarn, pnpm, or bun (pick your poison)
- A backend agent server running somewhere (this is just the UI!)

### Installation

```bash
# Clone the repo
git clone <your-repo-url>
cd data-gov-ui

# Install dependencies
npm install

# Run the dev server (on port 3001 because 3000 is too mainstream)
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) and you're off to the races! 🏁

### Configuration

Click the settings icon (⚙️) in the top right to configure your backend server URL. For this interview project, the backend is self-hosted via ngrok, so you'll need the URL from whoever's running the agent.

## Development Scripts

```bash
npm run dev      # Start dev server with Turbopack (blazing fast)
npm run build    # Production build with Turbopack
npm run start    # Start production server
npm run lint     # Run ESLint checks
```
