const { path } = require('@vuepress/shared-utils')

/**
 * codeExpand 插件主入口文件
 * 
 * 功能：
 * - 为超出指定高度的代码块添加展开/收起功能
 * - 仅在代码块实际高度超过设定值时显示按钮
 * - 支持配置最大高度、按钮文本等参数
 * 
 * @param {Object} options - 插件配置选项
 * @param {string} options.selector - 代码块选择器，默认选择所有语言的代码块
 * @param {number} options.maxHeight - 代码块最大高度（像素），默认 500px
 * @param {string} options.expandText - 展开按钮文本，默认 "展开"
 * @param {string} options.collapseText - 收起按钮文本，默认 "收起"
 * @returns {Object} VuePress 插件配置对象
 */
module.exports = (options = {}) => {
  const {
    selector = 'div[class*="language-"] pre',
    maxHeight = 500,
    expandText = '展开',
    collapseText = '收起',
  } = options

  return {
    name: 'code-expand',
    
    /**
     * 将配置选项定义为全局常量，供客户端代码使用
     * 这些常量会通过 webpack 的 DefinePlugin 注入到客户端
     */
    define() {
      return {
        CODE_EXPAND_SELECTOR: selector,
        CODE_EXPAND_MAX_HEIGHT: maxHeight,
        CODE_EXPAND_TEXT: expandText,
        CODE_COLLAPSE_TEXT: collapseText,
      }
    },
    
    /**
     * 客户端根组件混入
     * 用于在页面更新后检测并处理代码块，添加展开/收起功能
     * 不能删除！这是 VuePress 插件在客户端处理 DOM 的标准方式
     */
    clientRootMixin: path.resolve(__dirname, './bin/clientRootMixin.js'),
  }
}
