---
title: BreePhone：macOS 上的原生 SIP 软电话
date: 2026-09-28
tags:
  - BreePhone
  - SIP
  - macOS
  - VoIP
categories:
  - 源码 Source-code
isShowComments: true
---

<Boxx/>

[[toc]]

BreePhone 是我自己写的 macOS 软电话，界面用 SwiftUI 从零做，语音和信令跑在 baresip 和 libre 上，两个库都静态链进包里。双击就能用，不依赖 Electron，也不用另外装运行时。

官网：[https://phone.bree.de5.net/](https://phone.bree.de5.net/)

<!-- more -->

![BreePhone 主界面](https://phone.bree.de5.net/assets/hero.png)

## 为什么要自己写一个

起因很普通：我只是想找个能日常用的桌面话机。找了几圈，能用顺手的没找到。

Linphone 是我先试的。功能确实全，除打电话之外还有视频、聊天、会议。但用起来就是不顺手，设置或 UI 一卡一卡的。

Telephone 更接近我要的。原生 Cocoa，界面干净，PJSIP 打底，我用了挺长一段时间。它的问题在另一个方向：能配的地方太少。我想要的那几样偏偏都没有：账号级的 STUN、TURN、ICE 配置，换网之后自己重新注册，出故障时能直接看的诊断结果。它走 App Store 分发，完整通话记录还划在订阅里。

那阵子公司装了零信任客户端，它往回环接口上注了一条 `/32` 地址，再叠上 VPN 和 NAT，通话就变成「接得通，但是没声音」。两边都听不到对方，信号却显示正常。这种问题最难受的不是修，是不知道从哪下手：抓包、翻日志，一通电话能查一下午。

所以动手写的时候，我给它的定位很明确：常驻菜单栏，随手能拨，出了问题自己能查，最好连抓包都不用。

## 界面

主界面就三个页面：拨号盘、联系人、通话记录。电话一进来，整个窗口切成通话界面，不用另开窗口也不用找。

窗口不大，账号状态、通话控制和诊断信息都挤在能一眼扫到的位置。顶栏常驻一颗网络胶囊，显示当前网络类型和信号强弱；点开是往返时延、波动、丢包、出口网卡这些数字。

不打电话的时候，整个应用缩进菜单栏，注册状态和通话时长还在那儿。窗口可以设成始终置顶，贴着屏幕边也不碍事。

<div style="display:flex;gap:16px;flex-wrap:wrap;justify-content:center;margin:20px 0">
  <img src="https://phone.bree.de5.net/assets/dialpad.png" alt="拨号盘" style="width:200px;max-width:100%;border-radius:15px" />
  <img src="https://phone.bree.de5.net/assets/settings-accounts.png" alt="账号设置" style="width:200px;max-width:100%;border-radius:15px" />
  <img src="https://phone.bree.de5.net/assets/settings-audio.png" alt="音频设置" style="width:200px;max-width:100%;border-radius:15px" />
</div>

## 能做什么

账号可以同时挂好几个，拖着排序，挨个启用停用。密码和 TURN 凭据存进 macOS 钥匙串，不落数据库，也不进日志。传输方式、注册间隔、STUN、TURN、ICE 都按账号单独配，UDP、TCP、TLS 都支持。

通话控制里有两个方向，我自己一开始也老混。「静音」关的是麦克风，对方听不到你；「关扬声器」关的是播放，对方照样听得到你，只是你听不到对方。剩下还有保持和恢复、DTMF 键盘，以及来电等待。等待的那一路点一下就能切过去，接听之前它会先把当前这路挂起，免得两路抢同一套音频设备。

音频编码按协商顺序排：opus、G722、PCMU、PCMA、L16。在账号设置里能勾选，也能调顺序。输入输出设备可以指定，通话中换了立刻生效。

换网络这块我花的心思最多。换 Wi-Fi、插网线、开关 VPN 之后，应用会重新探测对外地址再注册一遍，不用重启；万一这一轮没注册上，它还会按递增的间隔自己重试几轮。通话进行中就先不动，把重注册推到通话结束再做。

BreePhone 注册了 `bree://`，浏览器、脚本或者别的 App 都能把它叫起来拨号：

```
bree://call/1002
bree:1002
bree://hangup
```

菜单栏那个图标本身也是个菜单，点开能看各账号当前状态，也能直接退出。

账号、联系人、通话记录和设置能打包成一个文件，换台机器导进去接着用。导入前先给一份摘要，让你选整体覆盖还是合并，确认了才动数据。

## 排障

这部分是我当初最想解决的。

设置里有个「重新检查网络」，点一次把四件事挨个查完，结论直接写出来：本机 SIP 端口有没有正常监听、服务器域名解析到哪个公网地址、拨号和语音从哪张网卡出去、STUN 拿到的对外地址有没有被改端口。看完大概就能分出是网络的问题，还是配置的问题。

<div style="display:flex;gap:16px;flex-wrap:wrap;justify-content:center;margin:20px 0">
  <img src="https://phone.bree.de5.net/assets/settings-network.png" alt="网络自检" style="width:200px;max-width:100%;border-radius:15px" />
  <img src="https://phone.bree.de5.net/assets/call-detail.png" alt="SIP 信令时序" style="width:200px;max-width:100%;border-radius:15px" />
  <img src="https://phone.bree.de5.net/assets/in-call.png" alt="通话界面" style="width:200px;max-width:100%;border-radius:15px" />
</div>

每通电话还会留一份信令记录，在通话记录详情里按时间把整条流程摊开：谁先发的 INVITE、中间经过哪几跳、最后是谁挂的。服务器把 ACK 吃掉这一类问题，看这个比抓包快得多。

通话界面上还有实时的 RTP 电平波纹，两个方向分开显示。麦克风没声音、对方没出声、对方的语音流压根没发过来，这三件事在波纹上分得出来。

## 怎么装

目前只发 DMG，三步：从 [官网](https://phone.bree.de5.net/) 下载，拖进「应用程序」，右键选「打开」。

最后一步不能省。应用走 ad-hoc 签名，没做 Apple 公证，第一次打开会被 Gatekeeper 拦下来。右键打开一次，之后就正常了。

## 几点说明

SIP 监听端口不是 5060，这是有意的。固定用 5060 的时候，媒体地址容易被中间设备改写，反而更容易没声音，所以每次启动随机取一个高位端口。

只支持 Apple Silicon，macOS 13 起步。Intel 版得把底层依赖整套重编一遍，暂时没计划。

视频通话和会议相关的模块都没编进去，编解码里也没有 G.729、GSM、Speex 这些。这里要提醒一句：它们不是界面上少了一个勾，而是底层根本没编，加一行选项不会生效，得先有对应的库再重建。

不会静默更新。在没有签名和公证链路的前提下，让程序自动替换自己的可执行文件，风险比收益大，所以只做提示，下载和安装交给你自己。

账号和通话数据在 `~/Library/Application Support/BreePhone/` 下的 SQLite 和日志文件里，密码在系统钥匙串。日志只写本地文件，不写系统统一日志，因为里面会有通话号码、服务器地址和 SIP 报文。
