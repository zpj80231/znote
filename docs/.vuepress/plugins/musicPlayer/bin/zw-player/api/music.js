import axios from 'axios'
//获取歌词
export const getWords=(id)=>{
    return axios.get(`https://api.imjad.cn/cloudmusic/?type=lyric&id=${id}`);
}
//获取歌曲详情
export const getMusicInfo=(id)=>{
    return axios.get(`https://api.imjad.cn/cloudmusic/?type=detail&id=${id}`);
}
//获取歌曲url
export const getMusicUrl=(id)=>{
    return axios.get(`https://api.imjad.cn/cloudmusic/?id=${id}`);
}
//获取热门歌曲
export const getHotMusic=(id)=>{
    return axios.get(`https://api.imjad.cn/cloudmusic/?type=playlist&id=${id}`)
}
//获取歌单歌曲
export const getMyMusic=(id)=>{
    return axios.get(`https://api.imjad.cn/cloudmusic/?type=playlist&id=${id}`)
}
//获取搜索建议
export const getSearchSuggest=(key)=>{
    return axios.get(`http://music.eleuu.com/search?keywords=${key}&limit=8`)
}
//获取歌曲热门评论
export const getHotTalk=(id)=>{
    return axios.get(`https://api.imjad.cn/cloudmusic/?type=comments&id=${id}`)
}
