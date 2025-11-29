# **Codrel AI**

![Codrel Banner](./assets/banner.png)

Codrel is a full-stack system for generating, structuring, and serving **RAG-ready context** to every tool a developer uses.
It ingests documents, URLs, repos, and directories through a CLI, produces structured context, and exposes it to IDEs and agents through MCP, APIs, and a web dashboard.

A single pipeline:
**Your data → Codrel ingestion → structured context → usable everywhere (including Kiro IDE).**

---

## **✨ Overview**


Codrel solves the core problem:
AI assistants don’t know your project — Codrel gives them context.

* ingest anything → CLI
* create `.codrel` knowledge state
* explore/manage → Web (Next.js)
* serve structured context → API
* plug into editors → MCP server
* **access instantly in Kiro IDE via Codrel extension**
* access in VS Code as well

Codrel makes every coding environment — **especially Kiro** — context-aware.

---

## **📂 Repository Structure**

```
apps/
  codrel-ide-extension/   → Kiro IDE + VS Code extension
  codrel-mcp/             → MCP Server (stdio)
  web/                    → Next.js dashboard + API routes

packages/
  cli/                    → Codrel CLI (RAG ingestion engine)
```

---

## **🧠 What Codrel Does**

Codrel takes scattered knowledge from your project and turns it into structured context usable by AI agents — including those running inside **Amazon Kiro’s agentic workflows**.

### The CLI ingests:

* documents
* URLs
* repositories
* directories
* files
* entire API sources

### Example CLI pattern

```
npx codrel ingest \
  --token=<token> \
  --repo <github-url> \
  --dir <folder> \
  --files <file1,file2,...> \
  --sitemap <yml> \
  --pattern <pattern or sitemap>
```

**Quick Answer — Example demo command**

```bash
codrel ingest \
  --token=Fssdsioadsngoadn124bsdsg \
  --repo=https://github.com/vercel/next.js \
  --dir=apps/dashboard \
  --files=package.json,README.md \
  --sitemap=https://docs.nosana.io/sitemap.yml \
  --pattern="docs/**"
```

**Done.**


This writes the `.codrel` knowledge state:

```
.codrel/projects/projectID (for --local)
  chunks.json
  meta.json
  state.json
```


This becomes the core context layer for Kiro, VS Code, MCP agents, and the web dashboard.

---

## **🖥 Architecture**

![Codrel Architecture](./assets/flow.png)

---

## **🧩 Component Breakdown**

### **1. Codrel CLI (packages/cli)**

Ingestion pipeline + RAG structuring engine → outputs the `.codrel` knowledge base.

### **2. Codrel Dashboard (apps/web)**

Next.js dashboard + API backend:

* visualize structured context
* manage collections
* serve context to MCP + Kiro
* end-user dashboard

![Codrel Dashboard](./assets/dashboard.png)

![Dashboard GIF Placeholder](./assets/dashboard2.gif)

### **3. Codrel MCP Server (apps/codrel-mcp)**

Standard MCP over stdio.
Acts as the bridge between Codrel Web API and AI agents running inside IDEs like **Kiro**.

### **4. Codrel IDE Extension (apps/codrel-ide-extension)**

Brings Codrel directly into **Kiro IDE** and VS Code:

* manages MCP server lifecycle

* stores Codrel auth token

* writes workspace instructions:

  * **Kiro → `.kiro/steering/codrel-tools.md`**
  * VS Code → `.github/copilot-instructions.md`

* exposes commands for adding Codrel collections + tools

* integrates Codrel context into Kiro’s agentic coding loop

![IDE Extension](./assets/extension.png)

### **5. Shared Packages**

* `shared/` → common logic/types/state
* `ui/` → dashboard UI components
* monorepo configs for TS + ESLint

---

## **🔗 How It All Works Together**

Codrel feeds every layer of your workflow with consistent structured context:

| Layer         | Purpose                                           |
| ------------- | ------------------------------------------------- |
| **CLI**       | Ingest & structure data                           |
| **Web**       | View/manage context + API                         |
| **MCP**       | Tooling bridge to editors                         |
| **Extension** | Provide workspace tools + Kiro/VSCode integration |

The result: **your Kiro IDE agents finally understand your project from the first prompt.**

---

## **🎯 In One Line**

Codrel turns your project’s real knowledge into structured, always-available context —
and delivers it directly into **Kiro IDE** and every AI-powered development workflow.