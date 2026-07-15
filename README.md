# OpenCode 全局配置

本仓库托管 OpenCode 的全局规则和技能，跨设备共享。

## 全局指令（AGENTS.md）

通过远程 URL 注入到所有 opencode 会话。

在 **每台设备的全局配置文件** `~/.config/opencode/opencode.json` 中添加 `instructions` 字段：

```json
{
  "$schema": "https://opencode.ai/config.json",
  "instructions": [
    "https://raw.githubusercontent.com/sunboyHY/aiconfig/main/AGENTS.md"
  ]
}
```

所有规则集中在 `AGENTS.md`，修改提交推送即可全局生效。

## 技能（Skills）

本仓库的技能可通过 [`npx skills`](https://github.com/vercel-labs/skills) 安装。

### 安装方式

```bash
# 查看可用技能
npx skills add sunboyHY/aiconfig --list

# 安装指定技能到全局（opencode 自动发现）
npx skills add sunboyHY/aiconfig --skill <skill-name> -g -y
```

### 添加新技能

在 `skills/` 下创建目录 + `SKILL.md`，结构如下：

```
skills/
  my-skill/
    SKILL.md          # 必需，含 YAML frontmatter (name, description)
    assets/           # 可选：模板、图标等
    references/       # 可选：参考文档
    scripts/          # 可选：可执行脚本
```

`SKILL.md` 示例：

```markdown
---
name: my-skill
description: "Use when the user asks about X — one sentence triggering condition."
---

# My Skill

Instructions for the agent to follow.
```

提交推送后，其他设备即可通过 `npx skills add` 安装。

## 代理（Agents）

本仓库的 `agents/` 目录存放自定义 primary agent 配置。

### 安装方式

将对应文件复制到 opencode 的 agents 目录：

```bash
# macOS / Linux
cp agents/autonomous.md ~/.config/opencode/agents/

# Windows PowerShell
Copy-Item -Path agents\autonomous.md -Destination ~\.config\opencode\agents\ -Force
```

## 优先级

- **AGENTS.md**：全局基线，通过 `instructions` URL 注入所有会话
- **skills/**：通过 `npx skills add -g` 安装到 `~/.agents/skills/`，opencode 自动发现
- **agents/**：复制到 `~/.config/opencode/agents/`，opencode 自动识别
- 项目根目录的 `AGENTS.md` 或 `.opencode/` 可作为项目级补充
