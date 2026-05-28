const { path } = require('@vuepress/shared-utils')

// 插件入口：负责校验配置、注入前端常量并注册全局播放器组件。
module.exports = (options = {}, context) => {
  // apiUrl 用于生产环境直连音乐 API，devProxyPrefix 用于开发环境走本地代理。
  if (!options.apiUrl || !options.devProxyPrefix) {
    throw new Error('[musicPlayer] 必须从 plugins 配置传入 apiUrl 与 devProxyPrefix')
  }
  return {
    name: 'vuepress-plugin-musicPlayer',
    // 通过 webpack DefinePlugin 把配置注入到前端，前端可直接以标识符 MUSIC_API_URL / MUSIC_API_DEV_PROXY_PREFIX 引用
    define () {
      return {
        MUSIC_API_URL: options.apiUrl,
        MUSIC_API_DEV_PROXY_PREFIX: options.devProxyPrefix
      }
    },
    // enhanceAppFile 在客户端把播放器注册成全局组件。
    enhanceAppFiles: [
      path.resolve(__dirname, './bin/enhanceAppFile.js')
    ],
    // 把该组件挂到全局 UI 层
    globalUIComponents: 'musicPlayer'
  }
}
