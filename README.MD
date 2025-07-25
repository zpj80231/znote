<img src="https://cdn.jsdelivr.net/gh/shiyindaxiaojie/images/readme/icon.png" align="right" />

# znote

- 积丝成寸，积寸成尺；寸尺水已，遂成丈匹

<br/>
<p align="center">
   <a href="https://zpj80231.github.io/znote/views/specification/guide.html" target="_blank"><img alt="Read the Docs" src="https://img.shields.io/badge/Docs-GetStarted-red?style=flat-square&logo=buffer"></a>
   <a href="https://github.com/zpj80231/znote" target="_blank"><img alt="GitHub" src="https://img.shields.io/badge/GitHub-znote-d05577?style=flat-square&logo=github"></a>
   <br/>
   <a href="https://github.com/vuejs/vuepress" target="_blank"><img alt="VuePress" src="https://img.shields.io/badge/VuePress-build-05a564?style=flat-square&logo=vue.js"></a>
   <a href="https://github.com/vuepress-reco/vuepress-theme-reco" target="_blank"><img alt="Reco" src="https://img.shields.io/badge/Reco-theme-137cbd?style=flat-square&logo=vue.js"></a>
   <br/>
   <a href="https://creativecommons.org/licenses/by-sa/4.0/"><img alt="CC4.0 BY-SA" src="https://img.shields.io/static/v1?label=CC%20%204.0&message=BY-SA&color=yellow&style=flat-square"></a>
   <a href="LICENSE"><img alt="LICENSE" src="https://img.shields.io/badge/License-MIT-orange?style=flat-square"></a>
   <br/>
   <a href="https://zpj80231.gitee.io/znote/"><img alt="znote site" src="https://img.shields.io/badge/znote-pages-a06bc1?style=flat-square&logo=zulip"></a>
</p>

- 已全局适配 `手机模式` 和 `暗黑模式（自适应）` 请自行体验

- 推荐访问：[https://zpj80231.github.io/znote/](https://zpj80231.github.io/znote/)<br/>
  国内访问：[https://zpj80231.gitee.io/znote/](https://zpj80231.gitee.io/znote/) （自Gitee实名认证后已不再同步更新，现在访问还是之前的旧版本）

- 音乐播放器插件：目前已自动适配网络，在网络可达的情况下会加载音乐播放器插件并播放音乐，网络不可达的时候不会加载

  > 音乐播放器插件目前在外网环境下可以正常使用（使用的网易云API）<br/>
  > 验证播放器是否可用：能打开这个网站即会自动加载正常使用 --> [点击测试](https://neteasecloudmusicapi-zpj80231.vercel.app/search?keywords=%E6%B5%B7%E9%98%94%E5%A4%A9%E7%A9%BA)<br/>
  > 因为依赖项目 [NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi) 使用 [Vercel](https://vercel.com/) 免费部署<br/>
  > 而 Vercel 目前对国内网络不开放，所以要么自行搭建 NeteaseCloudMusicApi，要么使用魔法

- 本仓库代码使用 [MIT](https://github.com/SigureMo/notev/blob/master/LICENSE) 协议进行开源，但是全部文档内容使用 [CC 4.0 BY-SA](https://creativecommons.org/licenses/by-sa/4.0/) 协议进行发布

![](/docs/.vuepress/public/vuepress/znote.png)

## 项目介绍

- **工作经验**：汇总生产级别的问题排查与解决思路，积累实战经验。
- **知识小结**：梳理各类技术栈核心要点与学习笔记，便于查阅和复习。
- **生活随笔**：记录生活点滴与个人感悟，分享成长与思考。
- **其他**：收录未分类内容及合作交流信息，欢迎入队共同进步🫡。

## 项目运行

- 克隆项目，在项目文件夹下执行命令，加载依赖：`npm install`

- 在项目文件夹下执行命令运行项目：`npm run dev`
  
- 待启动成功后打开地址即可：[http://localhost:8080/znote/](http://localhost:8080/znote/)

## 项目架构

- 采用 vuepress 和 主题 reco 二次构建

```lua
## 需要自己写主题样式的话，在.vuepress/ 下新建theme文件夹并按如下目录布局
Dev
├─── docs
│   └── .vuepress   // 配置目录
│   │    ├── public // 静态资源
│   │    ├── theme  // 主题
│   │    │   ├── components    // 组件
│   │    │   ├── global-components // 全局组件
│   │    │   ├── layouts       // 布局(包括首页在内)
│   │    │   ├── styles        // 样式
│   │    │   ├── util 	       // 工具
│   │    │   ├── index.js      // 入口配置
│   │    │   ├── noopModule.js // 依赖注入
│   │    │   ├── package.json  // 主题依赖
│   │    │   ├── README.md     // 主题说明
│   │    └── config.js         // 配置文件
│   ├── about       // 项目模块
│   ├── other       // 项目模块
│   ├── views       // 项目模块
│   └── README.md   // 首页
└── package.json    // 项目依赖
```

## 如何使用

对准备发布的文章（Markdown 格式），放置在项目 `docs/views/` 目录下，并在 Markdown 文件头部添加以下元素，项目发布后会自动识别文章标题、标签、分类、是否开启评论、是否加密、是否置顶、是否发布等一系列状态。

下面是关键字说明及参考示例：

### 关键字说明

| 序号 | 关键字          | 注释                                        |
| ---- | --------------- | ------------------------------------------- |
| 1    | title           | 文章标题                                    |
| 2    | date            | 日期，如：2020-02-02                        |
| 3    | tags            | 标签                                        |
| 4    | categories      | 分类                                        |
| 5    | keys            | 文章加密密码                                |
| 6    | sticky          | 文章置顶 1, 2, 3, ...                       |
| 7    | isShowComments  | 是否开启评论                                |
| 8    | publish         | 文章是否发布                                |
| 9    | `<Boxx/>`       | 只需引入这个标签即可，随机展示名人名言      |
| 10   | `[[toc]]`       | 生成目录及链接                              |
| 11   | `<!-- more -->` | 在`<!-- more -->`之前的内容会展示为文章摘要 |

### 参考示例

```yaml
---
title: 文章标题
date: 2020-02-02
tags:
 - 标签
categories:
 - 分类
keys:
 - '123456'
sticky: 1 
isShowComments: false
publish: true
---

<Boxx/>

[[toc]]

- 这里可以写`摘要`等其它

<!-- more -->

## 正式开始你的 markdown

- To be or not to be, ...
```

