const path = require('path')
const nav = require('./config/nav/')
const sidebar = require('./config/sidebar/')

module.exports = {
  // dest: 'gb-pages',
  base: '/znote/',
    title: "znote",
    description: '荷尽已无擎雨盖，菊残犹有傲霜枝。',
  head: [
    ['link', { rel: 'icon', href: 'https://infinitypro-img.infinitynewtab.com/custom-icon/8001de1jd3n68lbfnxxt564xvb0vl5.png?imageMogr2/thumbnail/240x/format/webp/blur/1x0/quality/100|imageslim' }],
    ['meta', { name: 'viewport', content: 'width=device-width,initial-scale=1,user-scalable=no' }],
   ],

    theme: 'reco',
    themeConfig: {
        nav: nav,
        // logo: '/vuepress/head.png',//导航栏头像
        authorAvatar: '/vuepress/head.png',//首页右侧头像
        // 搜索设置
        search: true,
        searchMaxSuggestions: 10,
        // sidebar: 'auto',// 自动形成侧边导航
        sidebar: sidebar,
        sidebarDepth: 2,
        blogConfig: {
            category: {
                location: 2,     // 在导航栏菜单中所占的位置，默认2
                text: '分类' // 默认文案 “分类”
            },
            tag: {
                location: 3,     // 在导航栏菜单中所占的位置，默认3
                text: '标签'      // 默认文案 “标签”
            }
        },
        // 最后更新时间
        lastUpdated: true,
        lastUpdated: '最后更新时间', // string | boolean
        // 作者
        author: 'zhangpengjun',
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
       		placeholder: '填写邮箱可以收到回复提醒哦！',
    		notify: true,
    		recordIP: true
       	},
    },

  markdown: {
    lineNumbers: true
  },

  plugins: [
   [
      'vuepress-plugin-container',
      {
        type: 'details',
        before: info => `<details class="custom-block details"><summary>${info}</summary>`,
        after: '</details>',
        defaultTitle: '详细信息'
      },
    ],
    [
      '@vuepress/pwa', 
      {
        serviceWorker: true,
        updatePopup: {
          message: "发现新内容可用",
          buttonText: "刷新"
        }
      }
    ],
    [
      '@vuepress/google-analytics',
      {
        ga: 'UA-149716079-1'
      }
    ],
    // [
    //   '@vuepress/plugin-register-components',
    //   {
    //     components: [
    //       {
    //         name: 'reco-home-page-one',
    //         path: path.resolve(__dirname, './components/HomePageOne.vue')
    //       }
    //     ],
    //     componentsDir: path.resolve(__dirname, './demo')
    //   }
    // ],
    '@vuepress-reco/extract-code',
    'flowchart',
    "vuepress-plugin-boxx",
    // require('./plugins/notification/index'),
    require('./plugins/detailsOpenFlag/index'),
    require('./plugins/musicPlayer/index'),
    // [
    //   '@vuepress-reco/vuepress-plugin-bgm-player',
      
    //     // 网络文件示例
    //     {
    //       name: '강남역 4번 출구',
    //       artist: 'Plastic / Fallin` Dild',
    //       url: 'https://assets.smallsunnyfox.com/music/2.mp3',
    //       cover: 'https://assets.smallsunnyfox.com/music/2.jpg'
    //     }
      
    // ]


  ]
}  