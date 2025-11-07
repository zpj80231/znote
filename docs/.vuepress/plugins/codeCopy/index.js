const { path } = require('@vuepress/shared-utils')

module.exports = (options = {}) => {
  const {
    selector = 'div[class*="language-"] pre',
    copyText = '复制代码',
    tip: { time = 1000, content = '复制成功', title = 'Tips' } = {},
    change,
    visibleTip = true,
  } = options

  return {
    name: 'code-copy',
    define() {
      return {
        CODE_COPY_SELECTOR: selector,
        CODE_COPY_TEXT: copyText,
        CODE_COPY_TIME: time,
        CODE_COPY_CONTENT: content,
        CODE_COPY_TITLE: title,
        CODE_COPY_CHANGE: change,
        CODE_COPY_VISIBLE_TIP: visibleTip,
      }
    },
    clientRootMixin: path.resolve(__dirname, './bin/clientRootMixin.js'),
    enhanceAppFiles: [path.resolve(__dirname, './bin/enhanceAppFile.js')],
  }
}

