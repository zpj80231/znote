const path = require('path')
const nav = require('./config/nav/')
const sidebar = require('./config/sidebar/')
const plugins = require('./config/plugins/')

module.exports = {
  // dest: 'gb-pages',//打包目录
  base: '/znote/',
  title: "zの自留地",
  description: '内在丰盈者，独行亦如众',
  head: [
    ['meta', { name: 'viewport', content: 'width=device-width,initial-scale=1,user-scalable=no'}],
    ['meta', { name: 'renderer', content: 'webkit'}],
    ['meta', { name: 'referrer', content: 'never'}],
    ['meta', { 'data-draft-node': 'block', 'data-draft-type': 'table', 'data-size': 'normal', 'data-row-style': 'normal'}],

    ['link', { rel: 'icon', href: '/logo.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes:'16x16', href: '/vuepress/favicon-16x16.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes:'32x32', href: '/vuepress/favicon-32x32.png' }],
    ['link', { rel: 'mask-icon', href: '/vuepress/safari-pinned-tab.svg' }],
    ['link', { rel: 'manifest', href: '/manifest.json' }],
    ['link', { rel: 'apple-touch-icon', sizes: '57x57', href: '/vuepress/apple-touch-icon-57x57.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '60x60', href: '/vuepress/apple-touch-icon-60x60.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '72x72', href: '/vuepress/apple-touch-icon-72x72.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '76x76', href: '/vuepress/apple-touch-icon-76x76.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '120x120', href: '/vuepress/apple-touch-icon-120x120.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '144x144', href: '/vuepress/apple-touch-icon-144x144.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '152x152', href: '/vuepress/apple-touch-icon-152x152.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/vuepress/apple-touch-icon-180x180.png' }],

    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }],
    ['meta',{ name: 'msapplication-TileImage', content: '/vuepress/msapplication-icon-144x144.png'}],
    ['meta', { name: 'msapplication-TileColor', content: '#000000' }],

    ["script", { "language": "javascript", "type": "text/javascript", "src": "https://cdn.bootcss.com/jquery/3.6.0/jquery.min.js"}],
    ["script", { "language": "javascript", "type": "text/javascript", "src": "/js/MouseClickEffect.js"}]
  ],

  //主题配置
  // theme: '',
  themeConfig: {
    nav,
    // sidebar: 'auto', // 自动形成侧边导航
    sidebar,
    isSidebarOpen: false, // 默认侧边栏是否打开
    // logo: '/vuepress/logo.png', // 导航栏头像
    authorAvatar: '/vuepress/head-fish.jpg', // 首页右侧头像
    // 搜索设置
    search: true,
    searchMaxSuggestions: 10,
    smoothScroll: true,
    sidebarDepth: 2,
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
    lastUpdated: true,
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
    //docsBranch: 'vuepress',
    editLinks: true,
    editLinkText: '在 GitHub 上编辑此页！',
    //评论
    valineConfig: {
      appId: 'xbT4pPXCWQju5T7GXC5fUFlF-gzGzoHsz',
      appKey: 'bofA5chNQ60p37Ih9sMffSI0',
      placeholder: '填写邮箱可以收到回复哦!',
      notify: true, // 邮件提醒
      verify: true, // 验证码
      recordIP: true
    },
  },
  plugins,
  markdown: {
    lineNumbers: true,
    // Markdown 文件的 headers (标题 & 小标题) 修改提取出的标题级别
    extractHeaders: ['h2', 'h3', 'h4'],
    extendMarkdown: md => {
      md.use(require("markdown-it-disable-url-encode"));
    }
  },

}
