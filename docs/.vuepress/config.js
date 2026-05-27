const path = require('path')
const nav = require('./config/nav')
const sidebar = require('./config/sidebar')
const plugins = require('./config/plugins')
const htmlModules = require('./config/htmlModules')
const {
    CWD_SERVER_URL,
    GOOGLE_ANALYTICS_SCRIPT_URL,
    MUSIC_API_URL,
    MUSIC_API_DEV_PROXY_PREFIX,
    WWADS_SCRIPT_URL
} = require('./config/api')

module.exports = {
    // 打包目录
    // dest: 'gb-pages',
    base: process.env.VUEPRESS_BASE || '/znote/',
    title: "zの自留地",
    description: '内在丰盈者，独行亦如众',
    head: [
        ['meta', {name: 'viewport', content: 'width=device-width,initial-scale=1,user-scalable=no'}],
        ['meta', {name: 'renderer', content: 'webkit'}],
        ['meta', {name: 'referrer', content: 'strict-origin-when-cross-origin'}],
        ['meta', {name: 'baidu-site-verification', content: 'codeva-FEUyXuB9mk'}],
        ['meta', {
            'data-draft-node': 'block',
            'data-draft-type': 'table',
            'data-size': 'normal',
            'data-row-style': 'normal'
        }],
        ['meta', {name: 'apple-mobile-web-app-capable', content: 'yes'}],
        ['meta', {name: 'mobile-web-app-capable', content: 'yes'}],
        ['meta', {name: 'apple-mobile-web-app-status-bar-style', content: 'black'}],
        ['meta', {name: 'msapplication-TileImage', content: '/img/site/msapplication-icon-144x144.png'}],
        ['meta', {name: 'msapplication-TileColor', content: '#000000'}],
        ['link', {rel: 'icon', href: '/logo.png'}],
        ['link', {rel: 'icon', type: 'image/png', sizes: '16x16', href: '/img/site/favicon-16x16.png'}],
        ['link', {rel: 'icon', type: 'image/png', sizes: '32x32', href: '/img/site/favicon-32x32.png'}],
        ['link', {rel: 'mask-icon', href: '/img/site/safari-pinned-tab.svg'}],
        ['link', {rel: 'manifest', href: '/manifest.json'}],
        ['link', {rel: 'apple-touch-icon', sizes: '57x57', href: '/img/site/apple-touch-icon-57x57.png'}],
        ['link', {rel: 'apple-touch-icon', sizes: '60x60', href: '/img/site/apple-touch-icon-60x60.png'}],
        ['link', {rel: 'apple-touch-icon', sizes: '72x72', href: '/img/site/apple-touch-icon-72x72.png'}],
        ['link', {rel: 'apple-touch-icon', sizes: '76x76', href: '/img/site/apple-touch-icon-76x76.png'}],
        ['link', {rel: 'apple-touch-icon', sizes: '120x120', href: '/img/site/apple-touch-icon-120x120.png'}],
        ['link', {rel: 'apple-touch-icon', sizes: '144x144', href: '/img/site/apple-touch-icon-144x144.png'}],
        ['link', {rel: 'apple-touch-icon', sizes: '152x152', href: '/img/site/apple-touch-icon-152x152.png'}],
        ['link', {rel: 'apple-touch-icon', sizes: '180x180', href: '/img/site/apple-touch-icon-180x180.png'}],
        // bump axios from 0.26.1 to 1.11.0
        ["script", {}, "window.global = window; window.process = window.process || { env: { NODE_ENV: 'production' } };"],
        ["script", {"defer": true, "language": "javascript", "type": "text/javascript", "src": "/js/cwd.js"}],
        ["script", {"defer": true, "language": "javascript", "type": "text/javascript", "src": "/js/MouseClickEffect.js"}],
        // Google Analytics (GA4)
        ["script", {async: true, src: GOOGLE_ANALYTICS_SCRIPT_URL}],
        ["script", {}, `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-NCYBBYN93V');
        `],
        // 注销历史 Service Worker，防止旧缓存拦截
        ["script", {}, `
          (function() {
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.getRegistrations && navigator.serviceWorker.getRegistrations().then(function(regs){
                regs.forEach(function(reg){ reg.unregister(); });
              });
            }
          })();
        `]
    ].concat(
        // 接入万维广告
        // 1. 把 WWAds 给你的广告 HTML 填到 htmlModules.js
        // 2. 部署时设置：WWADS_ENABLE=true, WWADS_VERIFY=你的校验值
        process.env.WWADS_VERIFY
            ? [['meta', {name: 'wwads-cn-verify', content: process.env.WWADS_VERIFY}]]
            : [],
        process.env.WWADS_ENABLE === 'true'
            ? [['script', {async: true, src: WWADS_SCRIPT_URL, type: 'text/javascript'}]]
            : []
    ),
    shouldPrefetch: false,
    // 主题配置
    // theme: '',
    themeConfig: {
        nav,
        htmlModules,
        // sidebar: 'auto', // 自动形成侧边导航
        sidebar,
        isSidebarOpen: false, // 默认侧边栏是否打开
        // 禁用移动端左滑唤出侧边栏
        disableSwipe: true,
        // logo: '/img/site/logo.png', // 导航栏头像
        authorAvatar: '/img/site/head.jpg', // 首页右侧头像
        // 搜索设置
        search: true,
        searchMaxSuggestions: 10,
        smoothScroll: true,
        // 右侧菜单目录开关
        rightMenuBar: true,
        // 右侧菜单目录深度，可选；不配置则显示 $page.headers 全部层级
        // rightMenuBarDepth: 3,
        // 侧边栏目录深度
        sidebarDepth: 0,
        blogConfig: {
            category: {
                location: 2, // 在导航栏菜单中所占的位置，默认2
                text: '分类' // 默认文案 “分类”
            },
            tag: {
                location: 3, // 在导航栏菜单中所占的位置，默认3
                text: '标签' // 默认文案 “标签”
            }
        },
        // 最后更新时间
        lastUpdated: '上次更新', // string | boolean
        // 作者
        author: 'z',
        // 备案号
        record: '京ICP备17067634号-1',
        // 项目开始时间
        startYear: '2019',
        //git地址
        repo: 'zpj80231/znote',
        // 如果你的文档不在仓库的根部
        docsDir: 'docs',
        // 可选，默认为 master
        // docsBranch: 'vuepress',
        editLinks: true,
        editLinkText: '编辑此页',
        // 评论
        // valineConfig: {
        //     appId: 'xbT4pPXCWQju5T7GXC5fUFlF-gzGzoHsz',
        //     appKey: 'bofA5chNQ60p37Ih9sMffSI0',
        //     placeholder: '填写邮箱可以收到回复哦!',
        //     notify: true, // 邮件提醒
        //     verify: true, // 验证码
        //     recordIP: true
        // },
        cwdConfig: {
            siteId: 'znote',
            serverUrl: CWD_SERVER_URL,
            customCssUrl: '/znote/css/cwd-custom.css'
        },
    },
    plugins,
    // dev 把音乐 API 反代，绕开第三方 CDN 缓存 CORS 头导致的跨域错误
    devServer: {
        proxy: {
            [MUSIC_API_DEV_PROXY_PREFIX]: {
                target: MUSIC_API_URL,
                changeOrigin: true,
                secure: true,
                pathRewrite: { [`^${MUSIC_API_DEV_PROXY_PREFIX}`]: '' }
            }
        }
    },
    markdown: {
        // 代码块高亮：```js {2,4-6}
        lineNumbers: true,
        // Markdown 文件的 headers (标题 & 小标题) 修改提取出的标题级别
        extractHeaders: ['h2', 'h3', 'h4'],
        // 配置 [[toc]] 显示的标题级别
        toc: {
            includeLevel: [2, 3, 4]
        },
        extendMarkdown: md => {
            md.use(require("markdown-it-disable-url-encode"));
        }
    },

}
