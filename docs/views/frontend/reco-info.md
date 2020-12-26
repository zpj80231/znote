---
title: "vuepress-theme-reco主题开发"
date: 2019-11-14 16:41:12
sidebar: true
sidebarDepth: 5
tags: 
- vuepress
categories:
- 前端
isShowComments: false
---

<Boxx/>

[[toc]]

## 序言

如果你开始或已经使用  [vuepress-theme-reco](https://github.com/vuepress-reco/vuepress-theme-reco) 搭建了属于自己的个人博客的时候，那么恭喜你，你已经成为我们的一员了。
那么我想以下一定是需要了解的：

- vuepress官网：[https://vuepress.vuejs.org/zh/](https://vuepress.vuejs.org/zh/)
- vuepress自定义开发主题：[https://vuepress.vuejs.org/zh/theme/writing-a-theme.html](https://vuepress.vuejs.org/zh/theme/writing-a-theme.html)
- vuepress-theme-reco官网：[https://vuepress-theme-reco.recoluan.com/](https://vuepress-theme-reco.recoluan.com/)

## 本地环境搭建

### 1. 去[ theme-example ]( https://vuepress-theme-reco.recoluan.com/views/other/theme-example.html )，找个合心意的博客 clone

- 我就以我的下载我的为例：`git clone https://github.com/zpj80231/znote.git`

### 2. 把项目下载之后，修改 package.json

```json
{
    "scripts": {
        "docs:dev": "vuepress dev docs",
        "docs:build": "vuepress build docs",
        "deploy": "bash deploy.sh"
    },
    "devDependencies": {
        "vuepress": "^1.2.0",
        "vuepress-theme-reco": "^1.1.2-alpha.2"        
    }
}
```

- 然后在此目录下打开命令窗口执行：`npm install`（提前安装好node.js环境）

### 3. 更换主题为本地

- 打开git，克隆：`git clone https://github.com/vuepress-reco/vuepress-theme-reco.git`

  把下载下来的文件夹更名为 theme，粘贴至 .vuepress下即可。

- 将主题文件放到本地开发环境

```lua
##复制node_modules/vuepress-theme-reco 文件夹
##粘贴至.vuepress/ 下并更名为theme
Dev
├─── docs
│   └── .vuepress   // 配置目录
│   │    ├── public // 静态资源
│   │    ├── theme // 主题
│   │    │   ├── components // 组件
│   │    │   ├── global-components // 全局组件
│   │    │   ├── layouts // 布局(包括首页在内)
│   │    │   ├── styles // 样式
│   │    │   ├── util // 工具
│   │    │   ├── index.js // 入口配置
│   │    │   ├── noopModule.js // 依赖注入
│   │    │   ├── package.json // 主题依赖
│   │    │   ├── README.md // 主题说明
│   │    └── config.js
│   ├── FAQ     // 求索模块
│   ├── Store   // 仓库模块
│   ├── Thought // 随笔模块
│   └── README.md   // 博客首页
└── package.json
```

- 运行预览

  执行命令：`vuepress dev docs`

  当看到控制台输出：` tip Apply theme located at ...` 并正常启动，则表示本地环境搭建成功。

  在浏览器地址输入：` http://localhost:8080 `即可看到界面：

  ![](/znote/vuepress/znote.png)

- 如果想直接使用 .html文件的话将 .html文件放在 .vuepress/public 目录下即可（需自己配置引用路径）。

## 可能遇到的问题

### 1. 插件解析失败问题

> **`有这几个解决办法，就是无法解析node_modules依赖关系`**

- 根目录下安装一下vuepress-theme-reco这个依赖
- 最直接的就是在主题目录执行一下npm install
- 或许你删除node_modules，重新安装一下依赖也有可能解决
- 如以上三步都不行的话，以这个命令`npm run docs:dev`启动项目，或者联系我