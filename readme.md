# znote

> 积丝成寸，积寸成尺；寸尺水已，遂成丈匹。

- 已全局适配`手机模式`和`暗黑模式（iOS）`请自行体验

- 国内访问：[https://zpj80231.gitee.io/znote/](https://zpj80231.gitee.io/znote/)

![](/docs/.vuepress/public/vuepress/znote.png)

## 运行项目

- 在项目文件夹下执行命令，加载依赖：`npm install`
- 在项目文件夹下执行命令，运行项目：`npm run docs:dev`
- 待启动成功后打开地址即可：` http://localhost:8080/znote/`

## 项目架构

- 采用vuepress构建，主题vuepress-theme-reco

```lua
##复制node_modules/vuepress-theme-reco 文件夹
##粘贴至.vuepress/ 下并更名为theme
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
│   └── README.md   // 博客首页
└── package.json //项目依赖
```