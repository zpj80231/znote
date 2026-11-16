/* global MUSIC_API_URL, MUSIC_API_DEV_PROXY_PREFIX */
// MUSIC_API_URL / MUSIC_API_DEV_PROXY_PREFIX 由 musicPlayer 插件 define() 钩子在编译期注入
import axios from 'axios'

// dev 走 vuepress devServer 代理避免第三方 API 的 CORS 头被 CDN 缓存污染；prod 直连
const baseUrl = process.env.NODE_ENV === 'production'
    ? MUSIC_API_URL + '/'
    : MUSIC_API_DEV_PROXY_PREFIX + '/'

// 公网 IP 池，每次请求随机挑一个作为 realIP，让网易云按这个 IP 判定地区放行。
// 全是各地公共 DNS / 运营商地址；池子大一点，单个 IP 的请求频率就低，不容易被风控。
const cnIpPool = [
    '116.25.146.177',   // 深圳联通
    '180.76.76.76',     // 百度 DNS
    '223.5.5.5',        // 阿里 DNS
    '223.6.6.6',        // 阿里 DNS 备用
    '114.114.114.114',  // 114 DNS
    '114.114.115.115',  // 114 DNS 备用
    '182.254.116.116',  // 腾讯 DNS
    '1.2.4.8',          // CNNIC DNS
    '202.96.128.86',    // 广东电信 DNS
    '61.139.2.69',      // 四川电信 DNS
    '218.85.157.99',    // 福建电信 DNS
    '211.136.192.6'     // 中国移动
]
// 每次请求随机挑选一个 realIP，减少固定 IP 触发地区或风控问题的概率。
// exclude 是重试时用的：刚失败过的 IP 先排掉，有的 IP 已经被风控，再抽到它纯属白跑一趟。
const pickRealIP = (exclude = []) => {
    const rest = cnIpPool.filter(ip => exclude.indexOf(ip) === -1)
    const pool = rest.length ? rest : cnIpPool
    return pool[Math.floor(Math.random() * pool.length)]
}

// 获取歌词
export const getWords = (id) =>
    axios.get(baseUrl + 'lyric', { params: { id, realIP: pickRealIP() } })

// 获取歌曲详情，用于把搜索结果补全成播放器列表项需要的歌曲结构。
export const getMusicInfo = (id) =>
    axios.get(baseUrl + 'song/detail', { params: { ids: id, realIP: pickRealIP() } })

// 获取歌曲 url；后续播放器会把 http 转成 https 避免混合内容问题。
// 有些 realIP 会被风控返回空音源，所以换 IP 重试。
// 只对"空地址"重试：那种响应很快（不到 1s），换 IP 试几次很便宜；
// 请求超时说明链路本身慢，再试一遍照样慢，不如直接抛出去让播放器跳下一首。
// timeout 给 2.5s：实测正常响应 1~2s（取地址要过一层网易云），压到 1.5s 会误判一半请求。
// 预算：3 次空地址约 3s，得小于 Player.vue 的 MUSIC_URL_LOAD_TIMEOUT_MS(5s)。
export const getMusicUrl = (id, retries = 2, triedIPs = []) => {
    const ip = pickRealIP(triedIPs)
    return axios
        .get(baseUrl + 'song/url', { params: { id, realIP: ip }, timeout: 2500 })
        .then((res) => {
            const first = res.data && res.data.data && res.data.data[0]
            if (first && first.url) return res
            if (retries <= 0) return res
            return getMusicUrl(id, retries - 1, triedIPs.concat(ip))
        })
}

// 获取榜单歌曲列表。
export const getHotMusic = (id) =>
    axios.get(baseUrl + 'playlist/detail', { params: { id, realIP: pickRealIP() } })

// 获取默认歌单歌曲列表。
export const getMyMusic = (id) =>
    axios.get(baseUrl + 'playlist/detail', { params: { id, realIP: pickRealIP() } })

// 获取搜索建议，限制 8 条避免搜索弹层过长。
export const getSearchSuggest = (key) =>
    axios.get(baseUrl + 'cloudsearch', { params: { keywords: key, limit: 8, realIP: pickRealIP() } })

// 获取歌曲热门评论，播放器侧会截取前几条展示。
export const getHotTalk = (id) =>
    axios.get(baseUrl + 'comment/music', { params: { id, limit: 8, realIP: pickRealIP() } })
