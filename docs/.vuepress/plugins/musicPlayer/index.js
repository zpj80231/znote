const { path } = require('@vuepress/shared-utils')
// global.navigator = {
//     userAgent: 'node.js'
// };
module.exports = (options, context) => ({
  define () {
  	// const { icon, detailsStyle, visibilityHeight } = options
    return {
      // ICON: icon || 'reco-up',
      // DETAILS_STYLE: detailsStyle || {
      //   right: '1rem',
      //   bottom: '9rem',
      //   width: '2.5rem',
      //   height: '2.5rem',
      //   'border-radius': '.25rem',
      //   'line-height': '2.5rem',
      //   //backgroundColor: 'rgba(231, 234, 241,.5)',
      //   'font-size': '14px',
      //   'font-weight': '500'
      // },
      // VISIBILITY_HEIGHT: visibilityHeight || 400
    }
  },
  name: 'vuepress-plugin-musicPlayer',
  enhanceAppFiles: [
    path.resolve(__dirname, './bin/enhanceAppFile.js')
  ],
  globalUIComponents: 'musicPlayer'
})