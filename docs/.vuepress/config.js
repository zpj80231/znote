module.exports = {
  title: "znote",
  description: '荷尽已无擎雨盖，菊残犹有傲霜枝。',
  dest: 'gb-pages',
  port: '8080',
  base: '/znote/',
  head: [
    ['link', { rel: 'icon', href: 'https://infinitypro-img.infinitynewtab.com/custom-icon/8001de1jd3n68lbfnxxt564xvb0vl5.png?imageMogr2/thumbnail/240x/format/webp/blur/1x0/quality/100|imageslim' }],
    ['meta', { name: 'viewport', content: 'width=device-width,initial-scale=1,user-scalable=no' }]
  ],
  // 插件
  plugins: [
    ["vuepress-plugin-boxx"],
  ],
  theme: 'reco',
  themeConfig: {
    nav: require("./nav.js"),
    //logo: '/head.png',
    // 搜索设置
    search: true,
    searchMaxSuggestions: 10,
    // sidebar: 'auto',// 自动形成侧边导航
     sidebar: require("./sidebar.js"),
     sidebarDepth: 2,
    // 最后更新时间
    lastUpdated: true,
    lastUpdated: '最后更新时间', // string | boolean
    // 作者
    author: 'zhangpengjun',
    serviceWorker: {
        updatePopup: {
            message: "有新的内容",
            buttonText: '更新'
        }
    },
    //git地址
    repo: 'zpj80231/znote',
    // 如果你的文档不在仓库的根部
    docsDir: 'docs',
    // 可选，默认为 master
    //docsBranch: 'vuepress',
    editLinks: true,
    editLinkText: '在 GitHub 上编辑此页！',
    //评论
    /*valineConfig: {
      appId: '...',// your appId
      appKey: '...', // your appKey
      placeholder: 'ヾﾉ≧∀≦)o来啊，快活啊!',//评论框占位提示符
    },*/
  },
  markdown: {
    lineNumbers: true
  } 
}  