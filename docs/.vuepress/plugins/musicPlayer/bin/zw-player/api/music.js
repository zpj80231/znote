import axios from 'axios'
// const baseUrl = 'https://cloud-music-api-lyart.vercel.app/';
const baseUrl = 'https://api-music.imsyy.top/';

//获取歌词
export const getWords=(id)=>{
    return axios.get(baseUrl + `lyric?id=${id}`)
}
//获取歌曲详情
export const getMusicInfo=(id)=>{
    return axios.get(baseUrl + `song/detail?ids=${id}`)
}
//获取歌曲url
export const getMusicUrl=(id)=>{
    return axios.get(baseUrl + `song/url?id=${id}`)
}
//获取热门歌曲
export const getHotMusic=(id)=>{
    return axios.get(baseUrl + `playlist/detail?id=${id}`)
}
//获取歌单歌曲
export const getMyMusic=(id)=>{
    return axios.get(baseUrl + `playlist/detail?id=${id}`)
}
//获取搜索建议
export const getSearchSuggest=(key)=>{
    return axios.get(baseUrl + `search?keywords=${key}&limit=8`)
}
//获取歌曲热门评论
export const getHotTalk=(id)=>{
    return axios.get(baseUrl + `comment/music?id=${id}&limit=8`)
}
