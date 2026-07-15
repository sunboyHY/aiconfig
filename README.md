# OpenCode 全局配置仓库

本仓库托管 `sunboyHY` 的 OpenCode 全局配置，跨设备同步。

**包含三个组件：**
- `AGENTS.md` — 全局指令（注入所有 opencode 会话）
- `skills/` — 可安装的技能
- `agents/` — 自定义 primary agent

---

## 新设备配置（AI 执行顺序）

收到本仓库 URL 后，按以下步骤操作：

### 1. 检查 opencode 是否已安装

```bash
opencode --version
```

如果未安装，先安装 opencode。

### 2. 全局指令（AGENTS.md）

检查 `~/.config/opencode/opencode.json` 是否已有 `instructions` 字段指向本仓库的 AGENTS.md。

如果不存在，添加：

```json
{
  "$schema": "https://opencode.ai/config.json",
  "instructions": [
    "https://raw.githubusercontent.com/sunboyHY/aiconfig/main/AGENTS.md"
  ]
}
```

说明：AGENTS.md 通过 raw URL 注入，修改后 commit + push 即可全局生效，无需在各设备重复操作。

### 3. 安装技能（skills/）

确认 `npx skills` 可用，然后安装仓库中的所有技能：

```bash
npx skills add sunboyHY/aiconfig --skill grilling -g -y
npx skills add sunboyHY/aiconfig --skill mew-spec -g -y
npx skills add sunboyHY/aiconfig --skill project-resume-interview -g -y
```

查看已安装技能：

```bash
npx skills add sunboyHY/aiconfig --list
```

### 4. 安装代理（agents/）

将 `agents/` 目录下的文件复制到本地 opencode agents 目录：

| 平台 | 命令 |
|------|------|
| macOS / Linux | `cp agents/autonomous.md ~/.config/opencode/agents/` |
| Windows (PowerShell) | `Copy-Item -Path agents\autonomous.md -Destination ~\.config\opencode\agents\ -Force` |

如果 `~/.config/opencode/agents/` 目录不存在，先创建。

### 5. 安装对抗模式插件（plugin/adversarial/）

对抗模式是 opencode 的 multi-agent 编排能力，允许给定一个高层目标，AI 自动设计编排方案并执行。

**安装步骤：**

将 `plugin/adversarial/` 目录复制到本地 opencode 插件目录：

| 平台 | 命令 |
|------|------|
| macOS / Linux | `cp -r plugin/adversarial ~/.config/opencode/plugin/adversarial` |
| Windows (PowerShell) | `Copy-Item -Path plugin\adversarial -Destination ~\.config\opencode\plugin\adversarial -Recurse -Force` |

然后在 `~/.config/opencode/opencode.json` 中注册插件路径：

```json
{
  "plugin": [
    "~/.config/opencode/node_modules/superpowers",
    "~/.config/opencode/plugin/adversarial"
  ]
}
```

**使用方式：**

在 opencode TUI 中执行：
```bash
/adversarial "重构 auth 模块，性能提升 2 倍"
```

模型会自动设计多 agent 编排脚本，并行执行子任务，最终聚合结果。

---

## 仓库结构

```
aiconfig/
├── AGENTS.md              # 全局指令（规则、回复格式、行为约束）
├── agents/
│   └── autonomous.md      # autonomous agent（全自动任务调度）
├── plugin/
│   └── adversarial/
│       ├── index.js           # 插件入口（注册 workflow 工具）
│       ├── dsl-runtime.js     # JS DSL 沙箱解释器
│       └── session-manager.js # 子会话管理
├── skills/
│   ├── grilling/          # 需求澄清 skill（ stress-test 计划/决策）
│   ├── mew-spec/          # spec 驱动开发 skill
│   └── project-resume-interview/  # 项目分析 + 面试素材 skill
└── README.md
```

---

## 各组件说明

### AGENTS.md（全局指令）

注入方式：`opencode.json` 的 `instructions` 字段。

内容：全局行为规则（中文回复、子任务优先、回复结尾固定格式等）。

更新方式：修改本文件 → commit → push → 所有设备下次会话自动生效。

### skills/（技能）

通过 `npx skills add sunboyHY/aiconfig --skill <name> -g -y` 安装。

每个技能是一个独立的 SKILL.md，定义触发条件和执行流程。

当前技能：

| 技能 | 用途 |
|------|------|
| `grilling` | 对计划/决策/想法进行压力测试，追问细节直至双方理解一致 |
| `mew-spec` | Spec 驱动开发：需求澄清 → spec → plan → tasks → checklist |
| `project-resume-interview` | 分析真实项目，产出简历项目经历 + 面试问答素材 |

### agents/（自定义 Agent）

autonomous agent 是一个 primary agent，配置在 `~/.config/opencode/agents/` 目录下。

用途：全自动任务调度。读取 PLAN.md → 分解为细粒度任务 → 逐个派发给子 agent 执行 → 进度写入 AUTONOMOUS_LOG.md。

使用方式：

```bash
/autonomous <任务文件路径>
```

### plugin/（对抗模式插件）

adversarial 插件为 opencode 提供 multi-agent 编排能力（Workflow）。

**架构：**
- `index.js` — 插件入口，注册 `workflow` 工具
- `dsl-runtime.js` — JS DSL 沙箱，安全执行编排脚本
- `session-manager.js` — 子会话管理，通过 SDK 创建/追踪子 agent

**DSL 核心函数：**

| 函数 | 用途 |
|------|------|
| `agent(prompt, opts)` | 启动一个子 agent |
| `parallel([fn1, fn2])` | 并发执行多个子 agent |
| `pipeline(items, s1, s2)` | 流水线处理 |
| `phase(title)` / `log(msg)` | 进度展示 |

模型通过 `workflow` 工具调用 DSL 脚本，实现 fan-out / pipeline / 聚合等编排模式。

---

## 维护指南

### 添加新技能

1. 在 `skills/` 下创建目录，包含 `SKILL.md`
2. 添加可选的 `assets/`、`references/`、`scripts/`
3. Commit + push
4. 其他设备执行 `npx skills add` 安装

### 添加新 Agent

1. 在 `agents/` 下创建 `.md` 文件
2. 在 README 的「安装代理」表中添加对应平台的 copy 命令
3. Commit + push
4. 其他设备重新执行第 4 步

### 更新对抗模式插件

1. 在 `plugin/adversarial/` 下修改代码
2. Commit + push
3. 其他设备执行安装步骤（Step 5）更新本地副本

### 更新 AGENTS.md

直接编辑 `AGENTS.md`，commit + push 即可。其他设备无需操作，下次会话自动生效。

---

## 故障排查

| 问题 | 排查步骤 |
|------|---------|
| AGENTS.md 规则未生效 | 检查 opencode.json 中 `instructions` URL 是否正确 |
| 技能未加载 | 运行 `npx skills add sunboyHY/aiconfig --list` 确认已安装 |
| Agent 未识别 | 检查 `~/.config/opencode/agents/` 目录下是否有对应 .md 文件 |
| 权限不足 | 检查 opencode.json 的 `permission` 配置 |
