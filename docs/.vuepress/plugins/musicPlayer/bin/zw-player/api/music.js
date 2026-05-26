/* global MUSIC_API_URL, MUSIC_API_DEV_PROXY_PREFIX */
// MUSIC_API_URL / MUSIC_API_DEV_PROXY_PREFIX 由 musicPlayer 插件 define() 钩子在编译期注入
import axios from 'axios'

// dev 走 vuepress devServer 代理避免第三方 API 的 CORS 头被 CDN 缓存污染；prod 直连
const baseUrl = process.env.NODE_ENV === 'production'
    ? MUSIC_API_URL + '/'
    : MUSIC_API_DEV_PROXY_PREFIX + '/'

// 大陆公网 IP 池，每次请求随机挑一个作为 realIP，让网易云按这个 IP 判定地区放行
const cnIpPool = [
    '116.25.146.177',   // 深圳联通（enhanced 文档示例）
    '180.76.76.76',     // 百度 DNS
    '223.5.5.5',        // 阿里 DNS
    '114.114.114.114',  // 114 DNS
    '119.29.29.29'      // 腾讯 DNS
]
const pickRealIP = () => cnIpPool[Math.floor(Math.random() * cnIpPool.length)]

// 获取歌词
export const getWords = (id) =>
    axios.get(baseUrl + 'lyric', { params: { id, realIP: pickRealIP() } })

// 获取歌曲详情
export const getMusicInfo = (id) =>
    axios.get(baseUrl + 'song/detail', { params: { ids: id, realIP: pickRealIP() } })

// 获取歌曲 url
export const getMusicUrl = (id) =>
    axios.get(baseUrl + 'song/url', { params: { id, realIP: pickRealIP() } })

// 获取热门歌曲
export const getHotMusic = (id) =>
    axios.get(baseUrl + 'playlist/detail', { params: { id, realIP: pickRealIP() } })

// 获取歌单歌曲
export const getMyMusic = (id) =>
    axios.get(baseUrl + 'playlist/detail', { params: { id, realIP: pickRealIP() } })

// 获取搜索建议
export const getSearchSuggest = (key) =>
    axios.get(baseUrl + 'cloudsearch', { params: { keywords: key, limit: 8, realIP: pickRealIP() } })

// 获取歌曲热门评论
export const getHotTalk = (id) =>
    axios.get(baseUrl + 'comment/music', { params: { id, limit: 8, realIP: pickRealIP() } })
