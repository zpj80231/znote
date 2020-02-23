const { path } = require('@vuepress/shared-utils')

module.exports = (options, context) => ({
  define () {
    return {}
  },
  name: 'vuepress-plugin-musicPlayer',
  enhanceAppFiles: [
    path.resolve(__dirname, './bin/enhanceAppFile.js')
  ],
  globalUIComponents: 'musicPlayer'
})