import axios from 'axios'
//获取歌词
export const getWords=(id)=>{
    return axios.get(`https://blogme.top:3000/lyric?id=${id}`);
}
//获取歌曲详情
export const getMusicInfo=(id)=>{
    return axios.get(`https://blogme.top:3000/song/detail?ids=${id}`);
}
//获取歌曲url
export const getMusicUrl=(id)=>{
    return axios.get(`https://blogme.top:3000/song/url?id=${id}`);   
}
//获取热门歌曲
export const getHotMusic=(id)=>{
    return axios.get(`https://blogme.top:3000/top/list?idx=${id}`);
}
//获取歌单歌曲
export const getMyMusic=(id)=>{
    return axios.get(`https://blogme.top:3000/playlist/detail?id=${id}`);
}
//获取搜索建议
export const getSearchSuggest=(key)=>{
    return axios.get(`https://blogme.top:3000/search/suggest?keywords=${key}`)
}
//获取歌曲热门评论
export const getHotTalk=(id)=>{
    return axios.get(`https://blogme.top:3000/comment/music?id=${id}&limit=3`)
}