# CLAUDE.md - Content Engine

> Instructions for AI assistants working on this codebase

## Project Overview

Content Engine is an AI-powered short-form video creation platform. It transforms ideas into YouTube Shorts and Instagram Reels through a 5-screen workflow with human-in-the-loop control.

**Core Principle:** Every video is a **project**. A project completes when uploaded and reviewed on YouTube Shorts. Each video is composed of **scenes** (4-5 seconds each).

## V0 Focus

Clone the style of `training-data/v0/varun-maya-v0.mp4` - a Varun Mayya-style explainer. The system will:
1. Analyze reference video scene-by-scene (reverse engineer style)
2. Enable remaking with new content using same structure

## Architecture Summary

```
Next.js Frontend (Vercel) 
    ↓ webhooks
n8n Workflows (orchestration)
    ↓ API calls
External Tools (ElevenLabs, HeyGen, Veo3, Gemini, Remotion)
```

## Tech Stack

| Component | Technology | Notes |
|-----------|------------|-------|
| Frontend | Next.js 15 App Router + Tailwind | Use Remotion template |
| Video Preview | @remotion/player | Real-time preview in browser |
| Video Render | Remotion (local CLI) | NOT Lambda for V0 - easier setup |
| Orchestration | n8n webhooks | Triggers from frontend |
| LLM | Google Gemini (Vertex AI) | Script generation, analysis |
| TTS | ElevenLabs API | Voice synthesis |
| Avatar | HeyGen API | Talking head videos |
| Video Gen | Veo3 (Google) | B-roll generation |
| Storage | Vercel Blob | Files |
| State | JSON files | Per-project state in `/projects/` |
| Publish | Blotato | Multi-platform upload |

## Key Files to Understand

```
agent-strategy-forvarun-mayya.md  # Varun Mayya style rules (CRITICAL)
content-engine.md                  # Full system spec
AI Clone Automation (shared) (4).json  # Reference n8n workflow
.claude-skills/remotion/           # Remotion best practices
```

## Varun Mayya Style Rules (Non-Negotiable)

From `agent-strategy-forvarun-mayya.md`:

### Narrative
- Hook in 1 line: "Here's what just happened + why it matters"
- Proof-first: Every claim → visible proof
- One core thesis: No branching
- Short sentences. No filler. No "let's dive in"
- Pace: New info every 2-3 seconds

### Script Format
```typescript
interface Scene {
  scene_id: string;
  voiceover: string;
  on_screen: string;      // What's visually shown
  proof_asset_id: string; // Reference to proof material
  emphasis_words: string[]; // For kinetic typography
}
```

### Editing Rules
- Evidence transitions: claim → proof zoom → highlight → back
- Mini-lists only for "3 things / 2 reasons / 1 takeaway"
- PIP only when it adds credibility
- Captions = designed typography (not just subtitles)

## n8n Integration Pattern

### Frontend → n8n Communication

```typescript
// Trigger n8n workflow from Next.js
export async function POST(request: Request) {
  const body = await request.json();
  
  const response = await fetch(`${process.env.N8N_WEBHOOK_BASE_URL}/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      projectId: body.projectId,
      videoUrl: body.videoUrl,
      action: 'analyze'
    })
  });
  
  return Response.json(await response.json());
}
```

### n8n → Frontend Communication (Callback)

n8n workflow completes → calls webhook back to Next.js → updates project state

```typescript
// API route to receive n8n callbacks
// app/api/n8n/callback/route.ts
export async function POST(request: Request) {
  const { projectId, stage, result } = await request.json();
  
  // Update project state
  await updateProjectState(projectId, stage, result);
  
  return Response.json({ success: true });
}
```

## Remotion Integration

### Key Points for Next.js + Remotion

1. **Player for Preview** - Use `@remotion/player` in the browser
2. **CLI for Rendering** - Use `npx remotion render` locally (NOT Lambda for V0)
3. **Cannot bundle in Vercel** - Remotion bundler incompatible with Vercel

```tsx
// Preview in browser
import { Player } from '@remotion/player';
import { VideoComposition } from './remotion/VideoComposition';

export function VideoPreview({ scenes, fps = 30 }) {
  return (
    <Player
      component={VideoComposition}
      inputProps={{ scenes }}
      durationInFrames={scenes.length * fps * 5} // 5 sec per scene
      compositionWidth={1080}
      compositionHeight={1920}
      fps={fps}
      controls
    />
  );
}
```

### Render Flow (V0 - Local)

```bash
# From n8n workflow, trigger local render
npx remotion render VideoComposition out/video.mp4 --props='{"scenes": [...]}'
```

## Project State Schema

```typescript
// projects/{projectId}/state.json
interface ProjectState {
  id: string;
  status: 'draft' | 'intent' | 'proof' | 'script' | 'preview' | 'rendering' | 'published';
  createdAt: string;
  updatedAt: string;
  
  // Screen 1
  intent?: {
    rawIdea: string;
    intentStatement: string;
    tone: 'insightful' | 'contrarian' | 'calm';
    audience: 'builders' | 'general' | 'india-first';
    targetLength: 30 | 45 | 60;
    confirmed: boolean;
  };
  
  // Screen 2
  proofs?: {
    id: string;
    type: 'video' | 'screenshot' | 'tweet' | 'article';
    url: string;
    keyLine: string;
    credibilityScore: number;
    timestamp?: number;
  }[];
  
  // Screen 3
  script?: {
    scenes: Scene[];
    beatMap: {
      hook: [number, number];      // [startFrame, endFrame]
      context: [number, number];
      insight: [number, number];
      implication: [number, number];
      close: [number, number];
    };
    scores: {
      clarity: number;
      flow: number;
      confidence: number;
    };
  };
  
  // Screen 4
  preview?: {
    blueprintUrl: string;
    sceneApprovals: Record<string, boolean>;
    notes: Record<string, string>;
  };
  
  // Screen 5
  output?: {
    videoUrl: string;
    title: string;
    description: string;
    hashtags: string[];
    platformUrls: Record<string, string>;
    rating: number;
  };
}
```

## API Endpoints

```
POST /api/projects              # Create new project
GET  /api/projects/[id]         # Get project state
PUT  /api/projects/[id]         # Update project state

POST /api/n8n/trigger           # Trigger n8n workflow
POST /api/n8n/callback          # Receive n8n completion

POST /api/render/preview        # Trigger low-res preview
POST /api/render/final          # Trigger HD render

POST /api/upload                # Upload to Vercel Blob
```

## n8n Workflows to Build

1. **ingest-understand** - Analyze uploaded video
   - Whisper transcription
   - Scene detection
   - OCR on frames
   - Return: transcript, scenes, key moments

2. **script-writer** - Generate script from intent + proofs
   - Call Gemini with style rules
   - Return: scenes array, beat map

3. **voice-avatar** - Generate audio and avatar
   - ElevenLabs TTS
   - HeyGen avatar generation
   - Return: audio URL, avatar video URL

4. **render** - Trigger Remotion render
   - Build composition config
   - Execute local render
   - Return: video URL

5. **publish** - Upload to platforms
   - Generate metadata
   - Call Blotato
   - Return: platform URLs

## Environment Variables

```bash
# n8n
N8N_WEBHOOK_BASE_URL=https://your-n8n.com/webhook
N8N_CALLBACK_SECRET=secret-for-verification

# Google Cloud / Vertex AI
GOOGLE_CLOUD_PROJECT=your-project
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json

# APIs
ELEVENLABS_API_KEY=
HEY_GEN_API_KEY=
VEO3_API_KEY=

# Storage
BLOB_READ_WRITE_TOKEN=

# Publish
BLOTATO_API_KEY=
```

## Development Commands

```bash
npm run dev          # Next.js dev server
npm run remotion     # Open Remotion Studio
npm run render       # Render video (local)
npm run lint         # Linting
```

## Code Style

- All classes/functions/enums MUST have comments explaining WHY they exist
- Use TypeScript strict mode
- Prefer Server Components, use 'use client' only when needed
- Test user-facing behavior, not implementation details

## File Organization Rules

> Golden rule: If you see more than 4 files inside a folder 2 levels deep, those files should be in their own folders.

```
✅ Good
src/components/video/player/VideoPlayer.tsx
src/components/video/timeline/Timeline.tsx

❌ Bad  
src/components/VideoPlayer.tsx
src/components/Timeline.tsx
src/components/Scene.tsx
src/components/Caption.tsx
src/components/Proof.tsx  # Too many files at same level
```

## Skills Reference

**CRITICAL:** Before starting any task, pick relevant skills from `.claude-skills/`. During the task, use those skills to progress. After the task, update skills if needed.

### Primary Skills for This Project

| Skill | When to Use | Key Files |
|-------|-------------|-----------|
| **remotion** | Any video composition, captions, animations | `rules/display-captions.md`, `rules/sequencing.md`, `rules/text-animations.md` |
| **vercel-react-best-practices** | All React/Next.js code | `AGENTS.md`, `rules/async-*.md`, `rules/bundle-*.md` |
| **n8n-workflow-patterns** | Designing n8n workflows | `webhook_processing.md`, `ai_agent_workflow.md` |
| **n8n-mcp-tools-expert** | Using n8n MCP tools | `WORKFLOW_GUIDE.md`, `VALIDATION_GUIDE.md` |
| **social-content** | Video titles, descriptions, hashtags | Platform-specific templates |
| **web-design-guidelines** | UI/UX review | Fetch fresh from source URL |

### Skill: remotion (Video Creation)

**Location:** `.claude-skills/remotion/`

**Key rules for Content Engine:**
- `rules/display-captions.md` - TikTok-style captions with word highlighting
- `rules/sequencing.md` - Scene timing and delays
- `rules/text-animations.md` - Kinetic typography for emphasis words
- `rules/transitions.md` - Scene transitions
- `rules/audio.md` - Voiceover integration
- `rules/videos.md` - Embedding video clips (proofs)
- `rules/tailwind.md` - Using Tailwind in Remotion

**Usage pattern:**
```typescript
// Read relevant rules before implementing
// e.g., for captions: .claude-skills/remotion/rules/display-captions.md
```

### Skill: vercel-react-best-practices (Performance)

**Location:** `.claude-skills/vercel-react-best-practices/`

**Priority categories (HIGH to LOW):**
1. **CRITICAL** - `async-*` (eliminate waterfalls), `bundle-*` (reduce size)
2. **HIGH** - `server-*` (server performance)
3. **MEDIUM** - `rerender-*`, `rendering-*`
4. **LOW** - `js-*`, `advanced-*`

**Key rules for Content Engine:**
- `async-parallel.md` - Use `Promise.all()` for n8n webhook calls
- `async-suspense-boundaries.md` - Stream video preview loading
- `bundle-dynamic-imports.md` - Lazy load Remotion player
- `server-parallel-fetching.md` - Parallel data fetching for screens
- `rerender-memo.md` - Memoize expensive video components

### Skill: n8n-workflow-patterns (Workflow Design)

**Location:** `.claude-skills/n8n-workflow-patterns/`

**5 Core Patterns:**
1. **Webhook Processing** - Frontend → n8n triggers
2. **HTTP API Integration** - External API calls
3. **Database Operations** - State persistence (if needed)
4. **AI Agent Workflow** - Gemini script generation
5. **Scheduled Tasks** - Background rendering jobs

**Content Engine workflow patterns:**
```
ingest-understand: Webhook → Whisper → Scene Detect → Respond
script-writer:     Webhook → Gemini (AI Agent) → Respond
voice-avatar:      Webhook → ElevenLabs → HeyGen → Respond
render:            Webhook → Remotion CLI → Upload → Respond
publish:           Webhook → Blotato → Respond
```

### Skill: n8n-mcp-tools-expert (n8n MCP Usage)

**Location:** `.claude-skills/n8n-mcp-tools-expert/`

**Critical patterns:**
```javascript
// Node type formats differ!
// For search/validate: "nodes-base.webhook"
// For workflows:       "n8n-nodes-base.webhook"

// Common workflow:
search_nodes({query: "webhook"})
get_node({nodeType: "nodes-base.webhook"})
validate_node({nodeType: "...", config: {...}, profile: "runtime"})
```

**Key files:**
- `SEARCH_GUIDE.md` - Finding nodes
- `VALIDATION_GUIDE.md` - Validating configs
- `WORKFLOW_GUIDE.md` - Creating/editing workflows

### Skill: social-content (Publishing)

**Location:** `.claude-skills/social-content/`

**For Screen 5 (Publish):**
- Hook formulas for video titles
- Platform-specific caption templates
- Hashtag strategies
- Character limits per platform

**YouTube Shorts specifics:**
- Title: Under 100 chars, hook first
- Description: First 2 lines visible
- Hashtags: 3-5 relevant tags

### Skill: web-design-guidelines (UI Review)

**Location:** `.claude-skills/web-design-guidelines/`

**Usage:** Before finalizing UI, fetch guidelines and review:
```
https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md
```

### Supporting n8n Skills

| Skill | Use For |
|-------|---------|
| `n8n-expression-syntax` | Writing expressions in workflow fields |
| `n8n-code-javascript` | Custom JS in Code nodes |
| `n8n-node-configuration` | Operation-specific node setup |
| `n8n-validation-expert` | Fixing validation errors |

### Skill Application Workflow

```
1. BEFORE TASK
   - Identify relevant skills
   - Read SKILL.md for each
   - Read specific rule files needed

2. DURING TASK  
   - Reference rules when implementing
   - Follow patterns from skills
   - Validate against guidelines

3. AFTER TASK
   - Check if skills need updating
   - Document new patterns discovered
```

---

## Common Tasks

### Adding a new screen
1. Read `vercel-react-best-practices/SKILL.md`
2. Create folder: `src/app/project/[id]/new-screen/`
3. Add `page.tsx` with Server Component
4. Follow `async-*` rules for data fetching
5. Create corresponding n8n workflow
6. Update `ProjectState` type
7. Add API routes if needed

### Adding a new n8n workflow
1. Read `n8n-workflow-patterns/SKILL.md`
2. Identify pattern (webhook, AI agent, etc.)
3. Build in n8n UI first
4. Use `n8n-mcp-tools-expert` for validation
5. Export JSON to `n8n-workflows/`
6. Add webhook handler in `src/app/api/n8n/`
7. Document in this file

### Adding a Remotion composition
1. Read `remotion/SKILL.md`
2. Read relevant rule files (captions, sequencing, etc.)
3. Create in `src/remotion/compositions/`
4. Register in `src/remotion/Root.tsx`
5. Add preview component using `@remotion/player`
6. Follow Tailwind patterns from `rules/tailwind.md`

### Creating video captions (Varun Mayya style)
1. Read `remotion/rules/display-captions.md`
2. Read `remotion/rules/text-animations.md`
3. Implement TikTok-style word highlighting
4. Add emphasis animations for tagged words
5. Follow rhythm rules from style guide
