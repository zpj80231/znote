module.exports = [
    ['container', {
        type: 'details',
        before: info => `<details class="custom-block details"><summary>${info}</summary>`,
        after: '</details>',
        defaultTitle: '详细信息'
    }],
    ['container', {
        type: 'right',
        defaultTitle: '',
    }, ],
    ['container', {
        type: 'theorem',
        before: info => `<div class="theorem"><p class="title">${info}</p>`,
        after: '</div>',
    }, ],

    ['@vuepress/pwa', {
        serviceWorker: true,
        updatePopup: {
            message: "发现新内容可用",
            buttonText: "刷新"
        }
    }],

    ['@vuepress/google-analytics',
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

    'flowchart',
    "vuepress-plugin-boxx",
    ['vuepress-plugin-smooth-scroll'],
    require('../../plugins/detailsOpenFlag/index'),
    require('../../plugins/musicPlayer/index'),

    [require('../../plugins/enhanced-search'), { // 可以添加第三方搜索链接的搜索框（原官方搜索框的参数仍可用）
        thirdparty: [ // 可选，默认 []
            {
                title: '在 <span style="color: blue; ">Baidu</span> 中搜索 ',
                frontUrl: 'https://www.baidu.com/s?wd=',
            },
            {
                title: '在 <span style="color: red; ">Google</span> 中搜索 ',
                frontUrl: 'https://www.google.com/search?q=',
            }
        ]
    }],

    ["vuepress-plugin-nuggets-style-copy", {
        copyText: "复制代码",
        tip: {
            content: "复制成功!"
        }
    }],

    ['@vuepress/last-updated', { // "上次更新"时间格式
        transformer: (timestamp, lang) => {
            const moment = require('moment') // https://momentjs.com/
            return moment(timestamp).utcOffset(480).format('YYYY-MM-DD HH:mm:ss');
        }
    }]

]