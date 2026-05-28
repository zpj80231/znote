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
// 每次请求随机挑选一个 realIP，减少固定 IP 触发地区或风控问题的概率。
const pickRealIP = () => cnIpPool[Math.floor(Math.random() * cnIpPool.length)]

// 获取歌词
export const getWords = (id) =>
    axios.get(baseUrl + 'lyric', { params: { id, realIP: pickRealIP() } })

// 获取歌曲详情，用于把搜索结果补全成播放器列表项需要的歌曲结构。
export const getMusicInfo = (id) =>
    axios.get(baseUrl + 'song/detail', { params: { ids: id, realIP: pickRealIP() } })

// 获取歌曲 url；后续播放器会把 http 转成 https 避免混合内容问题。
export const getMusicUrl = (id) =>
    axios.get(baseUrl + 'song/url', { params: { id, realIP: pickRealIP() } })

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
