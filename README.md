# **Codrel AI: The Context Engine for AI Coding Agents**

![Codrel Banner](./assets/banner.png)

## AI coding agents are powerful, but they fail at one fundamental requirement:

## **They do not understand your tech stack.**

They lack awareness of your internal SDKs, architectures, infra, APIs, conventions, and domain logic.
As a result, agents guess, hallucinate, or perform blind, expensive searches — producing code that “looks right” but breaks in production.

Codrel eliminates this gap entirely.

---

# **1. Problem: AI Agents Have No System Context**

Today’s agents generate code without the deep, project-specific understanding that real engineers rely on.

This results in:

* Incorrect imports and signatures
* Misinterpreted architecture
* Generic or hallucinated APIs
* High token consumption
* Code that doesn’t compile or integrate
* Endless back-and-forth refinement

Example:
You’re building on Nosana inside Kiro.
Kiro has no idea how Nosana’s architecture works.
It searches the internet, burns tokens, and still produces broken code.

**The problem isn’t the model — it’s the absence of context.**
The critical knowledge is locked inside repos, docs, patterns, and the minds of your engineers.

---

# **2. Insight: Context Is the Missing Ingredient**

AI writes production-grade code *only* when it understands your system like your senior engineer does.

That includes:

* Documentation
* Folder structures
* Configuration
* API definitions
* Domain logic
* Architecture flows
* Internal libraries
* Deployment + infra details
* Conventions and patterns

None of this is visible to an AI agent by default.

That is the gap Codrel fills.

---

# **3. What Codrel Is (The Core Idea)**

Codrel is a **context engine** that ingests all your project knowledge, structures it into a RAG-ready format, and serves it to coding agents through MCP, APIs, and IDE extensions.

### In one sentence:

**Codrel gives your AI agent complete understanding of your real tech stack.**

When Codrel context is plugged into Kiro or VS Code, the agent immediately writes correct, architecture-aligned code — without hallucination or guesswork.

Codrel upgrades agents from “autocomplete with LLMs” to true stack-aware engineering assistants.

---

# **4. How Codrel Works (End-to-End Pipeline)**

A unified flow:

### **Your Data → Codrel CLI → Structured Context → Delivered to IDEs/Agents**

Codrel ingests:

* Repositories
* Directories
* Files
* Docs and URLs
* Sitemaps
* API specifications
* Custom patterns

Codrel outputs:

* `.codrel` knowledge state
* RAG-ready embeddings
* Structured metadata
* Indexed, searchable chunks
* API-ready context for agents

This becomes the backbone for agentic coding in Kiro, VS Code, or any MCP-compatible environment.

---

# **5. Architecture Overview**

![Codrel Architecture](./assets/flow.png)

Codrel consists of four major subsystems:

1. **Codrel CLI** — ingestion and context generation
2. **Codrel Dashboard (Next.js)** — visualization, management, and API
3. **Codrel MCP Server** — standardized interface that delivers context to AI agents
4. **Codrel IDE Extensions** — integration layer for Kiro and VS Code

Together, they form a complete context infrastructure for AI-driven software development.

---

# **6. Components (Technical Breakdown)**

## **6.1 Codrel CLI (packages/cli)**

Codrel’s ingestion and structuring engine.

It processes any knowledge source and generates a normalized `.codrel` knowledge base.

Example:

```
npx codrel ingest \
  --token=<token> \
  --repo <github-url> \
  --dir <folder> \
  --files <file1,file2> \
  --sitemap <yml> \
  --pattern <pattern>
```

Demo:

```bash
codrel ingest \
  --token=Fssdsioadsngoadn124bsdsg \
  --repo=https://github.com/vercel/next.js \
  --dir=apps/dashboard \
  --files=package.json,README.md \
  --sitemap=https://docs.nosana.io/sitemap.yml \
  --pattern="docs/**"
```

Generated output:

```
.codrel/projects/<id>/
  chunks.json
  meta.json
  state.json
```

This forms the authoritative knowledge layer for agents.

---

## **6.2 Codrel Dashboard (apps/web)**

A Next.js platform for:

* Visualizing ingested context
* Inspecting individual chunks
* Managing multiple projects
* Controlling ingestion workflows
* Serving context via API
* Observing usage and system state

![Codrel Dashboard](./assets/dashboard.png)
![Dashboard GIF Placeholder](./assets/dashboard2.gif)

---

## **6.3 Codrel MCP Server (apps/codrel-mcp)**

Acts as the standard interface layer between Codrel and AI agents.

Responsibilities:

* Retrieve the correct context at query time
* Provide structured chunks and metadata
* Enable retrieval, reasoning, and planning
* Ensure stack-aware coding

Supports:

* Kiro agents
* VS Code AI ecosystems
* Autonomous agent systems
* CLI-based AI developers

---

## **6.4 Codrel IDE Extensions (apps/codrel-ide-extension)**

Brings Codrel directly into developer workflows.

Functions:

* Authentication management
* Running the MCP server
* Injecting context into agent loops
* Writing workspace instructions:

  * Kiro → `.kiro/steering/codrel-tools.md`
  * VS Code → `.github/copilot-instructions.md`
* Managing added/removed Codrel collections
* Enabling context-driven autocompletion + generations

![IDE Extension](./assets/extension.png)

This ensures agents operate with the same understanding as your engineering team.

---

# **7. System Integration (How the Layers Work Together)**

| Layer      | Purpose                                    |
| ---------- | ------------------------------------------ |
| CLI        | Ingest + structure knowledge               |
| Dashboard  | Manage, inspect, and distribute context    |
| MCP Server | Deliver structured context to AI agents    |
| IDE Plugin | Inject context into Kiro/VS Code workflows |
| Agent      | Generate accurate, stack-aware code        |

Codrel becomes the foundational context layer for all AI-driven development.

---

# **8. Why Codrel Matters (Hackathon Focus)**

### Real Problem

AI agents fail because they lack system context.

### Strong Insight

Context determines whether the AI writes production-grade code or guesses blindly.

### Scalable Architecture

Codrel builds the full context pipeline: ingestion → structure → distribution.

### Depth of Engineering

CLI, RAG pipeline, dashboard, MCP server, IDE integrations — a complete stack.

### Broad Applicability

Works for teams of any size, across any tech stack, with any AI agent.

### Clear Business Value

* Eliminates hallucinations
* Improves code correctness
* Reduces debugging time
* Cuts token usage
* Speeds up onboarding
* Increases agent reliability

### Future-Proof

Codrel establishes the “context layer” for enterprise AI coding agents, similar to how Git became the version control layer.

---

# **9. Codrel in One Line**

**Codrel gives AI coding agents deep, structured, stack-level understanding — enabling them to produce accurate, architecture-aligned code from the first attempt.**
