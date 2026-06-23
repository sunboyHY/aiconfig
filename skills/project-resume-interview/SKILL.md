---
name: project-resume-interview
description: Analyze a real software project and produce resume-ready highlights plus interview talking points. Use when the user asks to turn a project/codebase into 简历项目经历, 面试素材, 项目亮点, 八股/背诵稿, or requests market-oriented Agent/full-stack/front-end project packaging without inventing unsupported technical claims.
---

# Project Resume Interview

## Overview

Use this skill to convert an existing project into two matched career outputs:

- **`01-简历精简版.md`** — 可直接复制到简历。含一句话项目简介 + 严格 1 行的 bullet。
- **`02-面试专项详情版.md`** — 面试问答素材。每条对应简历版的一条 bullet，按「背景→方案→成果」展开。

两个文件的关系：简历版 bullet 是面试版 sections 的摘要目录，面试版是简历版的深度展开。

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

- `01-简历精简版.md` — 可直接复制到简历，每条 bullet 严格 1 行，含项目简介行
- `02-面试专项详情版.md` — 面试问答素材，按「背景→方案→成果」结构展开

两个文件严格对应：简历版的每一条 bullet 对应详情版的一个 section。

If no output directory is provided, ask one short question for the destination.

## Resume Version Rules（可直接写入简历）

### 整体结构

```
# {项目名称}

**一句话简介：** {清晰说明项目面向谁、解决什么问题。不超过 30 字}
**技术栈：** {关键技术栈，用 + 连接}

### 项目经验（{角色方向}）

{角色方向说明一行，如：偏向 Agent 全栈 / 后端 / 前端}

1. {bullet}
2. {bullet}
...
```

### Bullet 规则

- **严格 1 行**（30-50 汉字），禁止跨行。
- **动词开头**，直接说做了什么。优先「封装/打通/构建/抽象/统一/优化/设计/实现」等单双字动词，杜绝「设计并实现了」。
- **一个 bullet 只陈述一件事**，一个主谓结构到底。不要用「同时/此外/支持」挂载多个功能。
- **方案名词 + 效果**：不说实现细节（如"基于工厂模式抽象 XXX 接口"），只说「工厂模式统一 N 家上游 API」。
- **每句可独立回答「做了什么 + 怎么做的 + 效果如何」**。

对比示例：

> ✅ 封装多供应商 AI 图片服务，工厂模式统一 4 家上游 API，新供应商接入成本降低约 60%。
>
> ❌ 设计并实现了多供应商 AI 图片生成服务：基于工厂模式抽象 ImageProvider 接口，统一封装 mytokens 和 qiuqiutoken 两家上游 API，支持同步/异步双模式切换；生成结果通过 GitHubStorageService 自动上传至 GitHub 仓库并经由 jsDelivr CDN 分发，同时用 sharp 生成 160×160 缩略图，估算同类供应商接入成本降低约 60%。

### 措辞风格

- **不留写作痕迹**：每条 bullet 都是可独立复制到简历的条目，不是讲解、不是介绍、不是说明文。
- 技术名词保留但不解释（NestJS、BullMQ、JWT 等直接写）。
- 避免「实现了/支持了/确保了」——这些在简历上是无效填充。
- 根据 target role 调整 bullet 侧重方向（Agent 能力 / 前端工程 / 后端 API 的配比继承原有规则）。

### 与详情版的对应关系

- 每条简历 bullet 对应详情版的一个 section。
- 详情版的「简历对应行：」字段会原文引用 bullet 内容。

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
- Confirm the resume file follows the new rules: 项目简介行 + 严格 1 行 bullet + 精简措辞。
- Confirm the resume file's bullets are NOT讲解/介绍/说明 style.
- Confirm the interview file uses the required three-part structure.
- Confirm all estimated metrics are labeled.
- Mention if no build/test was run because only documents were changed.
