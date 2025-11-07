const { path } = require('@vuepress/shared-utils')

module.exports = (options = {}) => {
  const {
    selector = 'div[class*="language-"] pre',
    copyText = '复制代码',
    tip: { time = 1000, content = '复制成功' } = {},
    change,
  } = options

  return {
    name: 'code-copy',
    define() {
      return {
        CODE_COPY_SELECTOR: selector,
        CODE_COPY_TEXT: copyText,
        CODE_COPY_SUCCESS_TEXT: content,
        CODE_COPY_RESET_DURATION: time,
        CODE_COPY_CHANGE: change,
      }
    },
    clientRootMixin: path.resolve(__dirname, './bin/clientRootMixin.js'),
  }
}

