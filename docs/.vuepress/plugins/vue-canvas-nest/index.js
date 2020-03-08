const { path } = require('@vuepress/shared-utils')

module.exports = (options, context) => ({
  define () {
    const { detailsStyle } = options
    return {
      
    }
  },
  name: 'vuepress-plugin-vueCanvasNest',
  enhanceAppFiles: [
    path.resolve(__dirname, './bin/enhanceAppFile.js')
  ],
  globalUIComponents: 'vueCanvasNest'
})