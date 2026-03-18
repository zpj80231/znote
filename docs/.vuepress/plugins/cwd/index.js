const { path } = require('@vuepress/shared-utils')

module.exports = (options = {}, context) => {
  return {
    name: 'vuepress-plugin-cwd',
    define() {
      const themeConfig = context.themeConfig || {}
      const cwdConfig = themeConfig.cwdConfig || {}
      const defaultOptions = {
        serverUrl: '',
        siteId: 'default',
        darkMode: 'auto',
        lang: 'zh-CN',
        theme: 'default',
        emoji: true,
        avatar: 'robohash',
        pageSize: 10,
        placeholder: '填写邮箱可以收到回复哦！',
        highlight: true,
        math: false,
        uploadImage: false,
        customCssUrl: '',
      }
      const mergedOptions = { ...defaultOptions, ...cwdConfig, ...options }
      return {
        CWD_OPTIONS: mergedOptions
      }
    },
    enhanceAppFiles: [
      path.resolve(__dirname, './bin/enhanceAppFile.js')
    ]
  }
}
