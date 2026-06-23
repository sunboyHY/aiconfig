---
name: project-resume-interview
description: Analyze a real software project and produce resume-ready highlights plus interview talking points. Use when the user asks to turn a project/codebase into 简历项目经历, 面试素材, 项目亮点, 八股/背诵稿, or requests market-oriented Agent/full-stack/front-end project packaging without inventing unsupported technical claims.
---

# Project Resume Interview

## Overview

Use this skill to convert an existing project into two practical career outputs:

- A concise resume version suitable for project experience bullets.
- A detailed interview version using “business problem + implementation + result”.

The core rule is evidence first: inspect actual source, docs, scripts, package metadata, routes, stores, services, components, and mocks before writing. Never invent technologies, optimizations, metrics, or ownership.

## Workflow

1. Inspect project context before drafting.
2. Identify real project positioning, stack, modules, and user-facing value.
3. Extract high-frequency interview topics from actual implementation.
4. Draft two separate files, not one combined file.
5. Mark any generated metric as an estimate and avoid unsupported precision.
6. Verify output paths and briefly summarize what changed.

## Evidence Collection

Check these areas when available:

- `package.json`, README, `AGENTS.md`, project docs.
- Routing and permission files.
- Stores/session lifecycle.
- API/request wrappers and generated API modules.
- Agent/AI chat modules, WebSocket/SSE transports, mocks, replay scripts.
- Core business pages and reusable components.
- Build, lint, mock, commit, and automation scripts.

Prefer codegraph/explore/search tools for source discovery. Use subagents for independent research domains such as AI/Agent, frontend architecture, backend/API integration, visualization, and engineering setup.

## Output Files

When the user gives an output directory, create a project-name subfolder and write:

- `01-简历精简版.md`
- `02-面试专项详情版.md`

If no output directory is provided, ask one short question for the destination.

## Resume Version Rules

Use 5-8 bullets by default. Each bullet should be 1-2 lines and suitable for resume layout.

Prioritize the wording based on target role:

- For Agent full-stack roles biased toward frontend, use roughly 5:3:2 weighting: Agent/AI capability 50%, frontend engineering and interaction 30%, backend/API collaboration 20%.
- For pure frontend roles, emphasize architecture, componentization, performance, visualization, UX, and engineering.
- For backend/full-stack roles, increase API protocol, auth, data modeling, task orchestration, and deployment/debugging weight.

Write in market-facing but defensible language:

- Prefer “封装/设计/打通/构建/抽象/支撑/统一/优化/沉淀”.
- Prefer business value plus technical implementation in the same bullet.
- Avoid saying “主导” unless evidence or user context supports it; use “参与/负责/设计/封装” when uncertain.
- Do not overclaim model training, backend services, distributed systems, observability, or performance data unless present.

## Interview Version Rules

Use this fixed structure for each topic:

```markdown
## N. Topic Name

**① 原有问题：**  
Describe the real business pain, complexity, bug risk, or engineering issue.

**② 实现方案：**  
Explain the concrete implementation with file/module names and technical choices.

**③ 落地成果：**  
State the actual benefit. Mark estimates explicitly when no measured data exists.
```

Recommended topic categories:

- Agent streaming protocol and UI integration.
- Agent context/session management.
- Agent result to business UI/data visualization.
- Complex frontend state and async cancellation.
- Visualization/map/chart/canvas rendering if present.
- Dynamic routing and permission.
- CRUD/resource abstraction and data normalization.
- Request/API wrapper and auth handling.
- Store/session lifecycle and cleanup.
- Theme/layout/component system.
- Engineering, mock, replay, lint, build, and debugging workflow.

## Metrics Policy

If the repository does not contain measured metrics, say so in the document.

Allowed estimated wording:

- “估算：同类页面重复代码减少约 50%-70%。”
- “估算：流式协议处理重复代码减少约 60%。”
- “主要提升调试可复现性和交互可观察性。”

Avoid unsupported wording:

- “首屏提升 xx%” without data.
- “FPS 提升 xx%” without sampling.
- “包体减少 xx%” without build comparison.
- “QPS/并发/服务稳定性提升” unless backend evidence exists.

## Final Checks

Before final response:

- Confirm two separate files exist.
- Confirm the resume file is concise and market-oriented.
- Confirm the interview file uses the required three-part structure.
- Confirm all estimated metrics are labeled.
- Mention if no build/test was run because only documents were changed.
