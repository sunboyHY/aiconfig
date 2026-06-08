# OpenCode 全局配置

本仓库托管 OpenCode 的全局规则（AGENTS.md），通过远程 URL 注入到所有 opencode 会话中。

## 配置方式

在 **每台设备的全局配置文件** `~/.config/opencode/opencode.json` 中添加 `instructions` 字段：

```json
{
  "$schema": "https://opencode.ai/config.json",
  "instructions": [
    "https://raw.githubusercontent.com/sunboyHY/aiconfig/main/AGENTS.md"
  ]
}
```

配置完成后，新开的 opencode 会话会自动从该 URL 拉取规则并执行。

## 规则管理

所有规则集中在 `AGENTS.md`，修改后提交推送即可全局生效：

```bash
git add AGENTS.md
git commit -m "更新全局规则"
git push
```

## 优先级

- 本仓库的**远程规则**作为全局基线（所有项目通用）
- 项目根目录的 `AGENTS.md` 作为项目级补充（项目专属）
- 两者会合并注入到 LLM 上下文

## AI 代理说明

当收到"配置全局 opencode 规则"或类似指令时：

1. 检查目标设备是否存在 `~/.config/opencode/opencode.json`
2. 若无则创建，若有则确保包含上述 `instructions` 配置
3. `~/.config/opencode/AGENTS.md` 可保留作为本地补充，与远程规则合并生效
4. 通知用户需要新开 opencode 会话才能生效
