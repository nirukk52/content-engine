Short answer: **no — and it shouldn’t be.**

Long answer, cleanly broken down 👇

---

## The right mental model

**n8n = orchestration brain**
**Your services = execution muscle**

If everything becomes an n8n node, you’ll hit:

* slow renders
* fragile retries
* unreadable graphs
* painful debugging
* vendor lock-in inside workflows

---

## What *should* be n8n nodes

Use n8n only for **control-flow + coordination**.

### 1. Triggers & routing

* Video upload event
* User clicks “Generate”
* Manual approval / reject
* Retry / resume

These are *perfect* for n8n.

---

### 2. Stateless API calls

Things that are:

* fast
* idempotent
* externally owned

Examples:

* Whisper / Google Video Intelligence
* ElevenLabs TTS
* Heygen / D-ID request
* Runway generation request
* LLM calls (script, captions, copy)

These = **HTTP nodes or custom lightweight nodes**

---

### 3. Human-in-the-loop gates

* “Approve script”
* “Approve first 10 sec”
* “Approve final render”

n8n excels here because it can **pause, wait, resume**.

---

### 4. Workflow-level evals

* User rating
* Auto-score + human override
* Regression runs

Evals belong in n8n because they **decide what happens next**.

---

## What should **NOT** be n8n nodes

### ❌ Heavy compute

Never do these inside n8n:

* Remotion renders
* FFmpeg stitching
* Video transcoding
* Long-running avatar renders

Instead:

* n8n → calls **your render service**
* render service → emits webhook when done

n8n waits, not works.

---

### ❌ Core business logic

Avoid:

* timeline composition logic
* typography rules
* caption animation math
* PIP layout decisions

These belong in:

* a **Render API**
* a **Composition Engine**
* a **Design Rules service**

n8n only *invokes* them.

---

### ❌ Agent “thinking loops”

Do **not** implement agents as n8n spaghetti.

Agents should live as:

* long-lived services
* prompt + state machines
* versioned logic

n8n just says:

> “Run script-agent v3 with input X”

---

## The clean architecture (recommended)

### Layer 1 — Orchestrator (n8n)

* owns workflow state
* owns retries
* owns approvals
* owns eval decisions

Think: **Air Traffic Control**

---

### Layer 2 — Agent Services (APIs)

Each agent = a service:

* script-agent
* subtitle-agent
* style-agent
* render-agent
* patch-agent

They expose:

```
POST /run
GET /status
POST /feedback
```

Think: **specialist workers**

---

### Layer 3 — Render & Media Workers

* Remotion service
* FFmpeg service
* Avatar service

They are:

* async
* stateless
* scalable

Think: **factory machines**

---

## How MCP fits here

MCP is **not** n8n.

MCP is:

* a **tool interface**
* callable by Claude
* usable inside agents

Example:

* Claude → calls `render_short_video`
* That tool internally hits your render API
* n8n doesn’t even need to know

---

## Final rule of thumb

> **If it takes more than 5 seconds or more than 1 retry → it is NOT an n8n node.**

n8n decides *when*.
Your services decide *how*.

---

## If you want, next we can:

* design the exact agent API contracts
* design the Remotion render service boundary
* define eval schemas per workflow
* map this into a V1 MVP vs V2 scaling plan

---

**Q1**

**How should I version agents so old videos remain reproducible?**

**Q2**

**Where do eval results live — DB, n8n, or agent memory?**

**Q3**

**What’s the smallest MVP workflow I can ship in 2 weeks without over-engineering?**
