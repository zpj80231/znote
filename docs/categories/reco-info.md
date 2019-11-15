---
title: "vuepress-theme-reco"
date: 2019-11-14 16:41:12
tags: 
- vuepress
categories:
- vuepress
---

::: tip 德国

只有在人群中间，才能认识自己

 :::

[[toc]]

## 写给想参与 [vuepress-theme-reco](https://github.com/vuepress-reco/vuepress-theme-reco) 的我们

### 序言

如果你开始或已经使用vuepress-theme-reco搭建了属于自己的个人博客的时候，那么恭喜你，你已经成为我们的一员了。
那么我想以下一定是需要了解的：

- vuepress官网：[https://vuepress.vuejs.org/zh/](https://vuepress.vuejs.org/zh/)
- vuepress自定义开发主题：[https://vuepress.vuejs.org/zh/theme/writing-a-theme.html](https://vuepress.vuejs.org/zh/theme/writing-a-theme.html)
- vuepress-theme-reco官网：[https://vuepress-theme-reco.recoluan.com/](https://vuepress-theme-reco.recoluan.com/)

### 本地环境搭建

- 去，找个地址clone
- 修改package.json
- 更换主题为本地
- 运行预览

### 参与vuepress-theme-reco的开发

### 克隆代码到本地

`git clone https://github.com/vuepress-reco/vuepress-theme-reco.git`

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

- 运行

  `vuepress dev docs`

  当看到控制台输出：` tip Apply theme located at ...` 并正常启动，则表示本地环境搭建成功。

- 如果想直接使用 .html文件的话将 .html文件放在 .vuepress/public 目录下即可（需自己配置引用路径）。

### 可能遇到的问题

1. 插件解析失败问题

![](/reco-info-1.png)

​	有这几个解决办法，就是无法解析node_modules依赖关系

- 根目录下安装一下vuepress-theme-reco这个依赖

- 最直接的就是在主题目录执行一下npm install

- 或许你删除node_modules,重新安装一下依赖也有可能解决