const { path } = require('@vuepress/shared-utils')

module.exports = (options) => ({
  alias: {
    '@SearchBox':
      path.resolve(__dirname, 'EnhancedSearchBox.vue')
  },

  define: {
    SEARCH_MAX_SUGGESTIONS: options.searchMaxSuggestions || 5,
    SEARCH_PATHS: options.test || null,
    SEARCH_HOTKEYS: options.searchHotkeys || ['s', '/'],
    SEARCH_THIRDPARTY: options.thirdparty || [
        {
            title: '在 <span style="color: #4F80E4; width: 52px;">Baidu</span> 中搜索 ',
            frontUrl: 'https://www.baidu.com/s?wd=',
        },
        {
            title: '在 <span style="color: red; width: 52px;">Google</span> 中搜索 ',
            frontUrl: 'https://www.google.com/search?q=',
        }
    ]
  }
})