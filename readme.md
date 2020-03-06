# znote

> 积丝成寸，积寸成尺；寸尺水已，遂成丈匹。



<p align="center">
   <a href="https://zpj80231.github.io/znote/" target="_blank"><img alt="Read the Docs" src="https://img.shields.io/badge/docs-GetStarted-red?style=flat-square&logo=read-the-docs"></a>
   <a href="https://github.com/zpj80231/znote" target="_blank"><img alt="GitHub" src="https://img.shields.io/badge/GitHub-znote-black?style=flat-square&logo=github"></a>
   <br/>
   <a href="https://github.com/vuejs/vuepress" target="_blank"><img alt="vuepress" src="https://img.shields.io/badge/vuepress-build-1aad19?style=flat-square&logo=vue.js"></a>
   <a href="https://github.com/vuepress-reco/vuepress-theme-reco" target="_blank"><img alt="vuepress" src="https://img.shields.io/badge/reco-theme-26a2ff?style=flat-square&logo=vue.js"></a>
   <br/>
   <a href="LICENSE"><img alt="LICENSE" src="https://img.shields.io/badge/License-MIT-orange?style=flat-square"></a>
   <a href="https://creativecommons.org/licenses/by-sa/4.0/"><img alt="CC4.0 BY-SA" src="https://img.shields.io/static/v1?label=CC4.0&message=BY-SA&color=yellow&style=flat-square"></a>
   <br/>
   <a href="https://twitter.com/zpj80231"><img alt="twitter" src="https://img.shields.io/twitter/url.svg?style=social&url=https://github.com/zpj80231/znote"></a>
</p>



- 本仓库代码使用 [MIT](https://github.com/SigureMo/notev/blob/master/LICENSE) 协议进行开源，但是全部文档内容使用 [CC 4.0 BY-SA](https://creativecommons.org/licenses/by-sa/4.0/) 协议进行发布
- 已全局适配`手机模式`和`暗黑模式（iOS自适应）`请自行体验
- 国内访问：[https://zpj80231.gitee.io/znote/](https://zpj80231.gitee.io/znote/) 速度加载会快一点

![](/docs/.vuepress/public/vuepress/znote.png)

## 项目运行

- 在项目文件夹下执行命令，加载依赖：`npm install`
- 在项目文件夹下执行命令，运行项目：`npm run docs:dev`
- 待启动成功后打开地址即可：[http://localhost:8080/znote/](http://localhost:8080/znote/)

## 项目架构

- 采用vuepress构建

```lua
##需要自己写主题样式的话，在.vuepress/ 下新建theme文件夹并按如下目录布局
Dev
├─── docs
│   └── .vuepress   // 配置目录
│   │    ├── public // 静态资源
│   │    ├── theme  // 主题
│   │    │   ├── components // 组件
│   │    │   ├── global-components // 全局组件
│   │    │   ├── layouts // 布局(包括首页在内)
│   │    │   ├── styles  // 样式
│   │    │   ├── util 	 // 工具
│   │    │   ├── index.js // 入口配置
│   │    │   ├── noopModule.js // 依赖注入
│   │    │   ├── package.json  // 主题依赖
│   │    │   ├── README.md     // 主题说明
│   │    └── config.js
│   ├── about   // 项目模块
│   ├── views   // 项目模块
│   └── README.md   // 首页
└── package.json //项目依赖
```

## 项目介绍

- 知识点复习和面试总结（不断完善中，欢迎加入！）
- 技术栈知识点笔记总结（知识小结）
- 个人牢骚发布点（生活随笔）
- 其它...