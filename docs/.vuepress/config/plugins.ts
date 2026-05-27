import yaml from 'js-yaml'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import { createRequire } from 'module'
import seoPlugin from '@mr-hope/vuepress-plugin-seo'
import api from './api'

const CARD_LIST = 'cardList'
const CARD_IMG_LIST = 'cardImgList'
const siteUrl = api.site.url
const siteBase = api.site.base
const siteBaseUrl = api.site.baseUrl
const requirePlugin = createRequire(
    import.meta.url.endsWith('/config/plugins.ts')
        ? import.meta.url
        : new URL('./config/plugins.ts', import.meta.url)
)

dayjs.extend(utc)

export default [
    ['container', {
        type: 'details',
        before: info => `<details class="custom-block details"><summary>${info}</summary>`,
        after: '</details>',
        defaultTitle: '详细信息'
    }],
    ['container', {
        type: 'right',
        defaultTitle: '',
    }],
    ['container', {
        type: 'theorem',
        before: info => `<div class="theorem"><p class="title">${info}</p>`,
        after: '</div>',
    }],
    // 卡片列表
    ['container', {
        type: CARD_LIST,
        render: (tokens, idx) => {
            // tokens 是整个md文件的虚拟dom结构数组
            // idx 是tokens中':::' 所在的索引，而且是当前指定type的':::'，分别有开始和结束两次的idx
            // if (tokens[idx].nesting === 1) { // 开头的 ':::' 标记
            // } else { // 结束的 ':::' 标记
            // }
            // 注意：修改这里面的代码后需要在md文件保存一下才会重新执行渲染
            return renderCardList(tokens, idx, CARD_LIST)
        }
    }],
    // 图文卡片列表
    ['container', {
        type: CARD_IMG_LIST,
        render: (tokens, idx) => {
            return renderCardList(tokens, idx, CARD_IMG_LIST)
        }
    }],
    // 关闭 Service Worker，避免旧版本缓存导致的 404 与页面卡死
    ['@vuepress/pwa', {
        serviceWorker: false,
        updatePopup: {
            message: "发现新内容可用",
            buttonText: "刷新"
        },
        // 保留生成配置，可根据需要后续再开启 SW
        generateSWConfig: {
            skipWaiting: true,
            clientsClaim: true,
            cleanupOutdatedCaches: true
        }
    }],
    ['sitemap', {
        hostname: siteBaseUrl,
        exclude: ['/404.html'],
        dateFormatter: time => {
            return new Date(time).toISOString()
        }
    }
    ],
    ['vuepress-plugin-canonical', {
        baseURL: siteBaseUrl.replace(/\/$/, ''),
        stripExtension: false
    }],
    [seoPlugin, {
        hostname: siteUrl,
        author: 'z',
        autoDescription: true,
        fallBackImage: `${siteBaseUrl}vuepress/znote.png`,
        isArticle: page => Boolean(page._filePath && !page.frontmatter.home)
    }],
    [requirePlugin('../plugins/robots'), {
        host: siteUrl,
        sitemap: `${siteBase}sitemap.xml`
    }],
    ['@vuepress/last-updated', {
        transformer: (timestamp, lang) => {
            return dayjs(timestamp).utcOffset(480).format('YYYY/MM/DD HH:mm:ss');
        }
    }],
    // ['vuepress-plugin-copyright',{
    //     minLength: 100,
    //     clipboardComponent: path.resolve(__dirname, '../components/Copyright.vue')
    // },],
    ['vuepress-plugin-boxx'],
    ['vuepress-plugin-mermaidjs'],
    ['vuepress-plugin-smooth-scroll'],
    // ['vuepress-plugin-fulltext-search'],
    // ['vuepress-plugin-code-copy', {align: "top", staticIcon: false}],

    requirePlugin('../plugins/detailsOpenFlag'),
    [requirePlugin('../plugins/musicPlayer'), {
        apiUrl: api.music.url,
        devProxyPrefix: api.music.devProxyPrefix
    }],
    requirePlugin('../plugins/notification'),
    requirePlugin('../plugins/enhancedSearch'),
    requirePlugin('../plugins/codeCopy'),
    requirePlugin('../plugins/cwd'),
    requirePlugin('../plugins/codeExpand'),

]

/**
 * 渲染md容器的卡片列表
 */
function renderCardList(tokens, idx, type) {
    const END_TYPE = `container_${type}_close`,
        _tokens$idx = tokens[idx],
        nesting = _tokens$idx.nesting,
        info = _tokens$idx.info;
    if (nesting === 1) { // 渲染开头的 ':::' 标记
        let yamlStr = '';

        for (let i = idx; i < tokens.length; i++) {
            let _tokens$i = tokens[i],
                type = _tokens$i.type,
                content = _tokens$i.content,
                _info = _tokens$i.info;
            if (type === END_TYPE) break; // 遇到结束的 ':::' 时
            if (!content) continue;
            if (type === 'fence' && _info === 'yaml') { // 是代码块类型，并且是yaml代码
                yamlStr = content
            }
        }

        if (yamlStr) { // 正确解析出yaml字符串后
            const dataObj = yaml.load(yamlStr) // 将yaml字符串解析成js对象
            let dataList = []

            if (dataObj) { // 正确解析出数据对象
                dataList = Array.isArray(dataObj) ? dataObj : dataObj.list
            }

            if (dataList && dataList.length) { // 有列表数据

                // 每行显示几个
                let row = Number(info.split(' ').pop())
                if (!row || row > 4 || row < 1) {
                    row = 3 // 默认 3
                }

                let listDOM = ''
                if (type === CARD_LIST) { // 普通卡片列表
                    listDOM = getCardListDOM(dataList, row)
                } else if (type === CARD_IMG_LIST) { // 卡片图片列表
                    listDOM = getCardImgListDOM(dataList, row)
                }

                return `<div class="${type}Container"><div class="card-list">${listDOM}</div>`
            }
        }
    } else { // 渲染':::' 结尾
        return '</div>'
    }
}

/**
 * 将数据解析成DOM结构 - 普通卡片列表
 */
function getCardListDOM(dataList, row) {
    let listDOM = ''
    dataList.forEach(item => {
        listDOM += `
      <${item.link ? 'a href="' + item.link + '" target="_blank"' : 'span'} class="card-item ${row ? 'row-' + row : ''}"
         style="${item.bgColor ? 'background-color:' + item.bgColor + ';' : ''}${item.textColor ? 'color:' + item.textColor + ';' : ''}"
      >
        ${item.avatar ? '<img src="' + item.avatar + '" referrerpolicy="no-referrer" class="no-zoom">' : ''}
        <div>
          <p class="name">${item.name}</p>
          <p class="desc">${item.desc}</p>
        </div>
      </${item.link ? 'a' : 'span'}>
    `
    })
    return listDOM
}

/**
 * 将数据解析成DOM结构 - 图文卡片列表
 */
function getCardImgListDOM(dataList, row) {
    let listDOM = ''
    dataList.forEach(item => {
        listDOM += `
      <div class="card-item ${row ? 'row-' + row : ''}" >
        <div class="box-img">
          ${item.link ? `<a href="${item.link}" target="_blank">` : ''}
            <img src="${item.img}" referrerpolicy="no-referrer" class="no-zoom">
          ${item.link ? `</a>` : ''}
        </div>
        <div class="box-info">
          ${item.link ? `<a href="${item.link}" target="_blank">` : ''}
            <p class="name">${item.name}</p>
            ${item.desc ? `<p class="desc">${item.desc}</p>` : ''}
          ${item.link ? `</a>` : ''}
        </div>
        
        ${item.avatar || item.author
            ? `<div class="box-footer">
              ${item.link ? `<a href="${item.link}" target="_blank">` : ''}
                ${item.avatar ? `<img src="${item.avatar}" referrerpolicy="no-referrer" class="no-zoom">` : ''}
                ${item.author ? `<span>${item.author}</span>` : ''}
              ${item.link ? `</a>` : ''}
            </div>`
            : ''
        }
      </div>
    `
    })
    return listDOM
}
