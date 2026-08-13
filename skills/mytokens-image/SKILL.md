---
name: mytokens-image
description: 通过 mytokens 中转站（api.mytokens.vip）用 gpt-image-2 模型生成图片。当用户想生成一张图、画一张、做海报/封面/插画/Logo/产品图/小红书配图，或说"生成图片/帮我画/文生图/图生图/实际出图/用 AI 生图"且没有指定其他生图工具时使用。也作为本地默认实际出图后端：当其他视觉、海报、照片风格化、照片抽象、zine poster、editorial artwork skill 只提供美术方向、提示词、构图规则或拼接脚本，但需要生成视觉素材、抽象面板、风格化面板、插画层或最终图片时，必须优先调用本 skill 完成真实 AI 生图，不要自动改成本地 SVG/HTML/Python/Pillow 绘制兜底。尤其适用于 photo-abstract-editorial、poetic-line-zine-poster、photo-relic-editorial、photo-revival、scene/scenes zine、gc-minimal-zine-poster 等视觉风格 skill 的实际出图阶段。用户请求生成图片即视为允许将必要的生成提示和必要输入图片发送到 mytokens 后端，除非用户明确说不要联网、不要第三方、只在本地处理，或明确指定另一个生图后端。本 skill 只调用 gpt-image-2（OpenAI 兼容 images/generations 或 images/edits 接口），默认输出竖版 1024x1536 PNG。触发词：生成图片、画一张、文生图、图生图、AI 生图、海报封面、配图、image generation、gpt-image-2、用 mytokens 生图、实际出图、生图后端、fallback image generation。
---

# mytokens-image

通过 mytokens 中转站的 OpenAI 兼容接口调用 `gpt-image-2` 生成图片。

## 关键信息（已实测验证）

- Base URL: `https://api.mytokens.vip`（可被 `MYTOKENS_BASE_URL` 覆盖）
- API key: 从环境变量 `MYTOKENS_API_KEY` 读取（**不要**在对话或文件中写死 key）
- 模型: `gpt-image-2`（本 skill 只用这个模型）
- 响应: `data[0].b64_json`（PNG 二进制）+ `revised_prompt`
- 超时: 生成约 40 秒，HTTP 超时设 **300 秒**

### 两个端点（均已实测可用）

- **文生图**: `POST /v1/images/generations`（JSON body）
- **图生图/编辑**: `POST /v1/images/edits`（multipart form，字段 `model`/`prompt`/`size`/`quality`/`n` + `image` 文件）。编辑指令写在 prompt 里，如 "Turn this into a watercolor painting, keep the cat"。比在 generations 里传 image 参数更符合 OpenAI 官方格式，优先用这个。

## 已知限制（实测确认，不要浪费额度重复探测）

- `size` 参数**生效但输出尺寸不精确**：请求 1024x1024 实际得到约 1254x1254；请求 1024x1536 实际得到约 1122x1402。方向（方/竖/横）正确，但像素不是精确值。交付时直接说明实际尺寸即可。
- `quality` 参数**不被网关校验**，传任意值都会照常生成，不一定影响费用。可传 low 降低成本。
- `output_format: png` 被接受。
- 网关对无效参数**不会报错，而是直接按默认生成**——所以不要用"故意传错参数"来探测，那会白扣额度。
- 额度查询: `GET /v1/usage`（免费），返回 `quota.remaining`。

## 执行优先级

本 skill 是用户本地配置的实际图片生成后端。只要任务目标是生成图片、海报、插画、封面、风格化图片，或其他视觉 skill 需要实际出图，默认直接调用本 skill 执行生成。

当风格 skill 要求“保留原照片不变，只生成抽象面板/插画层/风格化局部，再本地拼接或排版”时，把本 skill 用在生成视觉素材那一步；本地脚本只负责裁切、拼接、排文字、清理背景或校验。不要因为需要照片保真、文字准确、比例精确，就跳过 AI 生图直接改用 SVG/HTML/Python/Pillow 手绘。

不要因为输入包含人物、照片、日常场景、可识别主体，或需要将照片内容转写为 prompt，就自动改用本地 SVG/HTML/Python 绘制兜底。用户请求生成图片即视为允许将必要的生成提示和必要输入图片发送到 mytokens 后端。

除非出现以下情况，才停止或改走其他方案：
- `MYTOKENS_API_KEY` 缺失；
- 网络/API 请求失败，且按本 skill 重试后仍失败；
- 用户明确说“不要联网”“不要用第三方”“只在本地处理”；
- 用户明确指定另一个生图后端。

## 兜底触发

当另一个视觉类 skill 已经负责风格、美术方向或提示词编译，但没有可执行的生图工具时，本 skill 可作为实际生成后端使用。

典型场景：
- 用户点名 `$photo-abstract-editorial`、`$poetic-line-zine-poster`、`$scenes-gathered-zine-v1-3`、`$gc-minimal-zine-poster`、`$photo-revival`、`$photo-relic-editorial` 等视觉风格 skill，并要求生成图片；
- 视觉 skill 的流程写着“生成抽象面板”“生成风格化面板”“生成插画层”“生成 artwork”，然后再用脚本拼接原照片、排文字或校验；
- 当前环境没有暴露内置 `image_gen`；
- 其他图像 API 不可用、缺 key、或要求公网图片 URL；
- 用户没有明确禁止使用 mytokens。

此时不要改成本地 SVG/HTML/Python/Pillow 兜底，优先尝试 mytokens-image 生成真实 PNG。若 `MYTOKENS_API_KEY` 缺失或网络/API 请求失败，再向用户报告具体阻塞。

## 工作流程

1. 从环境变量获取 `MYTOKENS_API_KEY`，缺失时提示用户先设置：
   ```
   export MYTOKENS_API_KEY=sk-xxx
   ```
2. 收集/确认用户需求：主体内容、风格、尺寸方向、数量。若无指定，默认竖版 1024x1536。
3. 用脚本生成：
   ```bash
   # 文生图
   python3 ~/.agents/skills/mytokens-image/scripts/generate.py \
     --prompt "<英文或详细描述>" \
     --out /tmp/output.png \
     --size 1024x1536 \
     --quality low

   # 图生图/编辑
   python3 ~/.agents/skills/mytokens-image/scripts/generate.py \
     --prompt "<编辑指令>" \
     --image /path/to/input.png \
     --out /tmp/output.png \
     --size 1024x1536
   ```
4. 脚本输出 JSON 摘要（含 `revised_prompt` 和实际文件路径）。把生成的图片路径交给用户，说明实际尺寸与 revised_prompt。
5. 若失败，重试最多 2 次（可微调 prompt）；仍失败则报告错误并停止，避免浪费额度。

## 提示词技巧

- 用英文写 prompt 效果通常更好；脚本会自动拿到网关改写后的 `revised_prompt`。
- 明确描述构图、主体、背景、色彩、风格（如 "minimal geometric cat, flat vector, white background"）。

## 默认尺寸映射

| 用户需求 | size 参数 |
|---|---|
| 默认/小红书竖图 | `1024x1536` |
| 方图 | `1024x1024` |
| 横版/封面 | `1536x1024` |
