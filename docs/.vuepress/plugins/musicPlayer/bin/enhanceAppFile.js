import Player from './zw-player/Player.vue'

// 客户端增强入口：把播放器注册成可由 globalUIComponents 渲染的全局组件。
export default ({ Vue }) => {
  Vue.component('musicPlayer', Player)
}
