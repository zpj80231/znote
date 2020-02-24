const { path } = require('@vuepress/shared-utils')

module.exports = (options, context) => ({
  define () {
    const { detailsStyle } = options
    return {
      DETAILS_STYLE: detailsStyle || {
        right: '1rem',
        bottom: '9rem',
        width: '2.5rem',
        height: '2.5rem',
        'border-radius': '.25rem',
        'line-height': '2.5rem',
        //backgroundColor: 'rgba(231, 234, 241,.5)',
        'font-size': '14px',
        'font-weight': '500'
      }
    }
  },
  name: 'vuepress-plugin-DetailsOpenFlag',
  enhanceAppFiles: [
    path.resolve(__dirname, './bin/enhanceAppFile.js')
  ],
  globalUIComponents: 'DetailsOpenFlag'
})