const { path } = require('@vuepress/shared-utils')

module.exports = (options = {}, context) => {
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
    enhanceAppFiles: [
      path.resolve(__dirname, './bin/enhanceAppFile.js')
    ],
    globalUIComponents: 'musicPlayer'
  }
}
