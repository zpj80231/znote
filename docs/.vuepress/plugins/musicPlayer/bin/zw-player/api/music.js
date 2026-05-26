import axios from 'axios'

// dev 时走 vuepress devServer 反向代理（避开第三方 API 因缓存 CORS 头导致的跨域错误），
// prod 时直接请求第三方域名
const baseUrl = 'https://music.bree.de5.net/'

// 获取歌词
export const getWords = (id) =>
    axios.get(baseUrl + 'lyric', { params: { id } })

// 获取歌曲详情
export const getMusicInfo = (id) =>
    axios.get(baseUrl + 'song/detail', { params: { ids: id } })

// 获取歌曲 url
export const getMusicUrl = (id) =>
    axios.get(baseUrl + 'song/url', { params: { id } })

// 获取热门歌曲
export const getHotMusic = (id) =>
    axios.get(baseUrl + 'playlist/detail', { params: { id } })

// 获取歌单歌曲
export const getMyMusic = (id) =>
    axios.get(baseUrl + 'playlist/detail', { params: { id } })

// 获取搜索建议
export const getSearchSuggest = (key) =>
    axios.get(baseUrl + 'search', { params: { keywords: key, limit: 8 } })

// 获取歌曲热门评论
export const getHotTalk = (id) =>
    axios.get(baseUrl + 'comment/music', { params: { id, limit: 8 } })
