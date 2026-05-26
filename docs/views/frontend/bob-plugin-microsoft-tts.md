---
title: Microsoft TTS Bob 插件：免 API Key 的语音合成方案
date: 2026-05-26
tags:
    - Bob
    - TTS
    - TypeScript
    - 开源项目
categories:
    - 前端 Front-end
isShowComments: true
---

<Boxx/>

Bob 很好用，懂得都懂，但是自带的离线语音合成读起来就很机械。

后来偶然间了解到了 edge-tts（Edge 浏览器的朗读功能），就想着能不能把它集成到 Bob 中，让 Bob 用户也能享受到大模型语音或者说带有情感的朗读。

其实之前随便写了写，一直自用的。后来在网上搜了搜相关插件很少或者说都不能用了，现在重新拿出来并调研了网上的几种逆向方案实现，做了个插件分享给大家和需要的朋友。

<!-- more -->

[[toc]]

## 这个插件解决什么问题

Bob 本身已经把划词、翻译、朗读这些工作流做得很顺手，缺的是一个带有丰富感情、流畅且自然的朗读（语音合成插件）。并且最好是免费，无需任何配置（薅微软的羊毛😂）。

所以，这个插件的目标很明确：

- 日常使用尽量免 API Key、免部署；
- 网络不稳定时可以切换不同 Provider；
- 长文本能自动分块，不需要手动拆句；
- 服务端 429、5xx 这类可恢复错误能自动重试；
- 保留语速、音调、音量、音质、情感风格等可调项。

项目地址：[https://github.com/zpj80231/bob-plugin-microsoft-tts](https://github.com/zpj80231/bob-plugin-microsoft-tts)

## Provider 设计

插件把语音合成后端抽象成 Provider，目前内置 4 种方案。

| Provider | 认证方式 | 协议 | 推荐场景 |
| --- | --- | --- | --- |
| `edge-tts` | `Sec-MS-GEC` 签名 | WebSocket | 日常朗读首选，免费、稳定、配置少 |
| `azure-cognitive` | Microsoft Translator 客户端签名 | HTTP REST | 功能最全，适合需要情感风格和完整 SSML 控制的场景 |
| `azure-trial` | 无需认证 | HTTP REST | Azure 官网体验接口，适合临时备用 |
| `openai-gateway` | 透传到自建网关 | HTTP REST | 网络直连微软不稳定时，通过自建 OpenAI 兼容网关绕过 |

我自己的默认推荐是 `edge-tts`。它模拟 Edge 浏览器「大声朗读」的调用方式，不需要用户准备 Key，也不需要额外部署服务。缺点是它不支持情感风格；如果想使用 `cheerful`、`sad`、`angry` 这类风格，就切到 `azure-cognitive`。

`openai-gateway` 是兜底接口。只要网关兼容 `/v1/audio/speech` 形式的请求，就可以把插件请求透传过去。比如某些网络下直连微软不稳定，就可以用 Cloudflare Worker 部署一层转发。

## 使用方式

安装流程保持 Bob 插件的常规方式：

1. 进入项目 [Releases](https://github.com/zpj80231/bob-plugin-microsoft-tts/releases) 页面，下载最新 `.bobplugin` 文件；
2. 双击安装到 Bob；
3. 打开 Bob 设置，进入「服务」->「语音合成」->「添加」；
4. 将「语音合成」切换为 Microsoft TTS 插件；
5. 根据网络情况选择 Provider，默认可以先用 `edge-tts`。

常用配置项如下：

| 配置 | 默认倾向 | 说明 |
| --- | --- | --- |
| 合成方案 | `edge-tts` | 日常优先，失败时再切换其他 Provider |
| 语音 | 各语种主流女声 | 支持简中、繁中、英语、日语、韩语 |
| 语速 | `+0%` | 如果觉得拖沓，可以调到 `+10%` 到 `+25%` |
| 音调 | `+0Hz` | 轻微调整即可，过高或过低都容易不自然 |
| 音量 | `+0%` | 通常保持默认 |
| 音质 | `24kHz / 48kbps` | 对体积和听感做平衡 |
| 情感风格 | `general` | 主要在 `azure-cognitive` 下生效 |

## 工作原理

插件入口在 `src/main.ts`，对 Bob 暴露两个核心函数：

- `supportLanguages()`：告诉 Bob 插件支持哪些语言；
- `tts(query, completion)`：接收 Bob 的朗读请求，合成音频后通过 `completion` 回调返回 Base64 音频。

整体链路可以概括为：

```text
Bob 选中文本
   │
   ▼
main.js（esbuild 单文件 bundle）
   │
   └──► service/synthesis-request    （读取 Bob 配置，生成统一请求）
          │
          └──► providers/index        （按 provider 分发）
                 ├── edge-tts          → WebSocket + Sec-MS-GEC 签名
                 ├── azure-cognitive   → core/azure-token 签名 → Azure TTS API
                 ├── azure-trial       → Azure 官网接口
                 └── openai-gateway    → OpenAI 兼容 /v1/audio/speech
   ▼
Bob 播放器 ◄──── MP3 / WAV 音频
```

`synthesis-request.ts` 负责把 Bob 的查询参数和用户配置转换成统一的 `SynthesisRequest`。

Provider 分发在 `src/providers/index.ts`。这里做了 3 件关键的事：

- 根据配置选择最终 Provider；
- 当 `openai-gateway` 没有填写合法 URL 时回退到 `azure-cognitive`；
- 对返回结果做音频字节校验，避免把错误 JSON 当成音频交给 Bob。

这个分层的好处是：Bob 入口、参数构建、Provider 调度、具体协议实现互相隔离。后续要加新的 TTS 后端，只需要补一个 Provider，并注册到路由中心。

## 长文本分块与重试

TTS 接口通常都有单次文本长度限制，长文本直接提交容易失败。项目里的 `src/core/text-split.ts` 会按中文句号、感叹号、问号和换行符拆分文本，默认每块不超过 1500 字符；如果单句本身超过上限，再强制按长度截断。

这种策略比粗暴按固定长度切更适合朗读，因为它尽量保留句子边界，减少语音拼接后的突兀感。

网络侧则通过 `src/util/retry.ts` 做指数退避重试，默认会对这些情况重试：

- HTTP 429 限流；
- HTTP 5xx 服务端错误；
- 请求超时；
- `ECONNRESET` 这类连接重置。

重试不是为了掩盖错误，而是把临时抖动和真正失败区分开。尤其是 Azure 官网体验接口这类容易触发频控的方案，有自动重试会明显减少偶发失败。

## SSML 与情感风格

`src/core/ssml.ts` 负责生成 Microsoft TTS 需要的 SSML。它会统一处理：

- 文本和属性的 XML 转义；
- 发音人；
- 语速、音调、音量；
- 情感风格 `style`；
- `<mstts:express-as>` 标签包装。

需要注意的是，情感风格不是所有发音人都支持。比如 `zh-CN-XiaoxiaoNeural`、`en-US-AriaNeural` 这类语音通常支持得更好；不支持时，服务端可能会忽略 style，回落到普通朗读。

所以实践上可以这样选：

- 只想稳定朗读：选 `edge-tts`；
- 想调情绪和表现力：选 `azure-cognitive`；
- 微软直连不稳定：选 `openai-gateway`，填自建网关地址。

## 构建与发布

项目使用 TypeScript 编写，通过 esbuild 打成 Bob 插件可用的单文件 bundle。常用命令如下：

```bash
pnpm install
pnpm run typecheck
pnpm run build
```

`pnpm run build` 会清理旧产物、生成 changelog，并输出插件发布文件。仓库里也配置了 `appcast.json`，用于支持 Bob 的自动更新检测。

## 常见问题

**Q：朗读偶尔报 429 错误？**

A：Azure 官网端点有频率限制。插件已内置自动重试（指数退避），但短时间内频繁触发仍可能失败。建议切换到 `edge-tts` 方案。

**Q：直连微软失败？**

A：可能是 `dev.microsofttranslator.com` 在你的网络受限。可以切换到 `edge-tts` 方案，或填一个自建网关 URL 绕过。

**Q：情感风格不生效？**

A：不是所有语音都支持 `<mstts:express-as>`。一般 `zh-CN-XiaoxiaoNeural`、`en-US-AriaNeural` 等语音支持；不支持时服务端会忽略 style 字段，回落到 general。另外，Edge TTS 方案不支持情感风格，仅 Azure 认知服务支持。

**Q：Azure 体验服务和 Azure 认知服务有什么区别？**

A：认知服务通过 Microsoft Translator 签名获取临时 Token，支持情感风格和长文本分块，更稳定；体验服务是 Azure 官网接口，无需签名但易触发限流。

**Q：Edge TTS 和 Azure 认知服务怎么选？**

A：Edge TTS 免费稳定，适合日常使用，但不支持情感风格；Azure 认知服务功能最全（情感风格、SSML 全部配置项），但依赖 Microsoft Translator 签名，偶尔可能因签名变更失效。

## 致谢

- [wangwangit/tts](https://github.com/wangwangit/tts)：Azure 认知服务签名协议的原始实现参考
- [rany2/edge-tts](https://github.com/rany2/edge-tts)：Edge Read Aloud 协议参考
  [rany2/edge-tts](https://github.com/rany2/edge-tts) ：Edge 朗读协议参考
- [bobtranslate.com](https://bobtranslate.com/)：Bob 插件平台
  [bobtranslate.com](https://bobtranslate.com/) ：Bob 插件平台
- [Linux.do](https://linux.do/)：Linux.do 社区
  [Linux.do](https://linux.do/) ：Linux.do 社区
