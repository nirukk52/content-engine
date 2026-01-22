# Content Engine

> AI-powered short-form video creation platform with human-in-the-loop control

Transform ideas into polished YouTube Shorts and Instagram Reels through a 5-screen workflow. Built for creators who want AI assistance without losing creative control.

## Vision

Every video is a **project**. A project completes when the video is uploaded and reviewed on YouTube Shorts. Each video is composed of **scenes** (4-5 seconds each), making the creation process modular and reviewable.

## V0 Goal

Clone the style of `training-data/v0/varun-maya-v0.mp4` - a Varun Mayya-style explainer video. The system will:
1. Analyze the reference video scene-by-scene
2. Extract the narrative structure and proof points
3. Enable remaking with new content using the same style

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     NEXT.JS FRONTEND                            │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌───────┐ │
│  │ Screen 1│  │ Screen 2│  │ Screen 3│  │ Screen 4│  │Screen5│ │
│  │  Idea   │→ │  Proof  │→ │ Script  │→ │ Preview │→ │Publish│ │
│  │ Intent  │  │ Builder │  │ Beats   │  │ Assembly│  │ Ship  │ │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘  └───┬───┘ │
│       │            │            │            │           │      │
│       └────────────┴────────────┴────────────┴───────────┘      │
│                              │                                   │
│                    Webhook Triggers                              │
└──────────────────────────────┼──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      N8N ORCHESTRATION                          │
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │  Ingest &    │    │   Script     │    │   Voice &    │       │
│  │  Understand  │ →  │   Writer     │ →  │   Avatar     │       │
│  │  Workflow    │    │   Workflow   │    │   Workflow   │       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│         │                   │                   │                │
│         ▼                   ▼                   ▼                │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │   Whisper    │    │   Gemini     │    │  ElevenLabs  │       │
│  │   OCR        │    │   (Vertex)   │    │   HeyGen     │       │
│  │   Scene Det  │    │              │    │   Veo3       │       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │   Render     │    │   Publish    │    │   Feedback   │       │
│  │   Workflow   │ →  │   Workflow   │ →  │   Loop       │       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│         │                   │                                    │
│         ▼                   ▼                                    │
│  ┌──────────────┐    ┌──────────────┐                           │
│  │   Remotion   │    │   Blotato    │                           │
│  │   (Local)    │    │   Upload     │                           │
│  └──────────────┘    └──────────────┘                           │
└─────────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 15 (App Router) + Tailwind | Interactive UI with Remotion preview |
| Video | Remotion + @remotion/player | Scene composition, captions, styling |
| Orchestration | n8n (self-hosted) | Workflow automation, API chaining |
| LLM | Google Gemini (Vertex AI) | Script generation, scene analysis |
| TTS | ElevenLabs | Voice synthesis |
| Avatar | HeyGen | Talking head generation |
| Video Gen | Veo3 | B-roll and visual generation |
| Storage | Vercel Blob | Video/audio file storage |
| State | JSON files | Project state per video |
| Publish | Blotato | Multi-platform upload |
| Deploy | Vercel | Frontend hosting |

## 5-Screen Workflow

### Screen 1: Idea → Intent Lock
- Input: Raw idea or reference video
- Toggles: Tone, Audience, Length (30s/45s/60s)
- Output: One-line intent statement
- Eval: Human confirms intent

### Screen 2: Evidence & Proof Builder
- Upload: Video clips, screenshots, tweets, articles
- Auto-fetch: Related proofs from reference
- Output: Ordered proof stack with timestamps
- Eval: Credibility rating (1-5), remove weak proofs

### Screen 3: Script + Beat Map
- Left panel: Editable script
- Right panel: Beat timeline (Hook → Context → Insight → Implication → Close)
- Controls: "Make tighter", "More emotional", "More neutral"
- Output: Final narration + scene breakdown
- Eval: Clarity, Flow, Confidence scores

### Screen 4: Visual Assembly Preview
- Low-res preview with avatar, PIP proofs, captions
- Per-scene controls: font, emphasis words, zoom/pan
- Output: Locked visual blueprint
- Eval: Scene-level approve/reject

### Screen 5: Final Render & Publish
- HD render trigger
- Auto-generated: Title, description, hashtags
- Export: YouTube Shorts, Instagram Reels
- Eval: Final rating, "Ship / Iterate"

## Project Structure

```
content-engine/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Landing + chat interface
│   │   ├── project/[id]/       # Project screens
│   │   │   ├── intent/         # Screen 1
│   │   │   ├── proof/          # Screen 2
│   │   │   ├── script/         # Screen 3
│   │   │   ├── preview/        # Screen 4
│   │   │   └── publish/        # Screen 5
│   │   └── api/
│   │       ├── projects/       # CRUD for projects
│   │       ├── n8n/            # Webhook handlers
│   │       └── render/         # Remotion triggers
│   ├── components/
│   │   ├── chat/               # Chat interface
│   │   ├── video/              # Remotion compositions
│   │   └── ui/                 # Shared components
│   ├── lib/
│   │   ├── agents/             # Agent definitions
│   │   ├── n8n/                # n8n webhook utilities
│   │   └── storage/            # Blob + JSON state
│   └── remotion/
│       ├── compositions/       # Video templates
│       └── components/         # Remotion components
├── n8n-workflows/              # Exported n8n workflows
│   ├── ingest-understand.json
│   ├── script-writer.json
│   ├── voice-avatar.json
│   ├── render.json
│   └── publish.json
├── training-data/
│   └── v0/
│       └── varun-maya-v0.mp4   # Reference video
├── projects/                   # Project state (JSON)
├── .env.example
├── README.md
└── CLAUDE.md
```

## Environment Variables

```bash
# .env.example

# n8n Webhooks
N8N_WEBHOOK_BASE_URL=https://your-n8n-instance.com/webhook

# Google Cloud / Vertex AI
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json

# ElevenLabs
ELEVENLABS_API_KEY=your-key

# HeyGen
HEY_GEN_API_KEY=your-key

# Veo3 (Google)
VEO3_API_KEY=your-key

# Vercel Blob
BLOB_READ_WRITE_TOKEN=your-token

# Blotato (publish)
BLOTATO_API_KEY=your-key
```

## Getting Started

```bash
# 1. Clone and install
git clone <repo>
cd content-engine
npm install

# 2. Copy env and configure
cp .env.example .env
# Fill in your API keys

# 3. Run development server
npm run dev

# 4. Open Remotion Studio (for video development)
npx remotion studio

# 5. Import n8n workflows
# Import files from n8n-workflows/ into your n8n instance
```

## n8n Workflow Integration

The frontend triggers n8n workflows via webhooks:

| Workflow | Trigger | Input | Output |
|----------|---------|-------|--------|
| `ingest-understand` | Video upload | MP4 file URL | Transcript, scenes, OCR |
| `script-writer` | Intent confirmed | Intent + proofs | Script + beat map |
| `voice-avatar` | Script approved | Script text | Audio URL, Avatar video URL |
| `render` | Preview approved | Scene config | Rendered MP4 URL |
| `publish` | Ship clicked | Final video + metadata | Platform URLs |

## Varun Mayya Style Rules

From `agent-strategy-forvarun-mayya.md`:

### Narrative (Non-negotiable)
- Hook in 1 line: "Here's what just happened + why it matters"
- Proof-first: Every claim maps to visible proof
- One core thesis: No branching
- Short sentences. No filler. No "let's dive in"
- Pace: New info every 2-3 seconds

### Script Format
- Scene-based: `scene_id`, `voiceover`, `on_screen`, `proof_asset_id`
- Each scene = one intent (explain OR show proof OR summarize)
- Emphasis words tagged for kinetic typography

### Editing Rules
- Evidence transitions: claim → proof zoom → highlight → back
- Mini-lists only for "3 things / 2 reasons / 1 takeaway"
- PIP only when it adds credibility
- Captions = designed typography (rhythm + emphasis)

## Development Commands

```bash
npm run dev          # Next.js dev server
npm run build        # Production build
npm run remotion     # Open Remotion Studio
npm run render       # Render video locally
npm run lint         # Run linter
```

## Next Steps (V0 Implementation)

### Phase 1: Foundation
1. Initialize Next.js project from Remotion template
2. Set up project structure and routing
3. Create basic chat interface with video attachment
4. Implement project state management (JSON)

### Phase 2: n8n Integration
1. Set up n8n webhooks for frontend triggers
2. Build `ingest-understand` workflow
3. Implement callback handlers

### Phase 3: Screen Implementation
1. Screen 1: Idea → Intent (with Gemini)
2. Screen 2: Proof Builder (file uploads + auto-fetch)
3. Screen 3: Script + Beat Map (Gemini + editing UI)
4. Screen 4: Preview (Remotion Player)
5. Screen 5: Render + Publish

### Phase 4: Polish
1. Error handling and retry logic
2. User feedback loop
3. Style refinements

## Related Documentation

- [CLAUDE.md](./CLAUDE.md) - AI assistant instructions
- [content-engine.md](./content-engine.md) - Full system specification
- [agent-strategy-forvarun-mayya.md](./agent-strategy-forvarun-mayya.md) - Style rules

## License

Private - All rights reserved
