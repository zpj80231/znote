import Vue from 'vue'
import CodeExpand from './CodeExpand.vue'

/**
 * 客户端根组件混入
 * 
 * 作用：
 * - 在 VuePress 页面组件更新后，自动检测页面中的代码块
 * - 为高度超出设定值的代码块添加展开/收起功能
 * 
 * 注意：此文件不能删除！
 * 这是 VuePress 插件在客户端处理 DOM 操作的标准方式，
 * 与 codeCopy 等插件的实现原理一致
 */
export default {
  /**
   * 组件更新钩子
   * 当页面内容更新（包括路由切换）后触发
   */
  updated() {
    // 使用 setTimeout 确保 DOM 完全渲染后再执行
    setTimeout(() => {
      this.$expandUpdates()
    }, 200)
  },
  
  methods: {
    /**
     * 检测并处理代码块的方法
     * 遍历所有代码块，为需要的代码块添加展开/收起功能
     */
    $expandUpdates() {
      // 获取配置参数，使用 define 注入的全局常量，若无则使用默认值
      const selector = typeof CODE_EXPAND_SELECTOR !== 'undefined' ? CODE_EXPAND_SELECTOR : 'div[class*="language-"] pre'
      const maxHeight = typeof CODE_EXPAND_MAX_HEIGHT !== 'undefined' ? CODE_EXPAND_MAX_HEIGHT : 500
      const expandText = typeof CODE_EXPAND_TEXT !== 'undefined' ? CODE_EXPAND_TEXT : '展开'
      const collapseText = typeof CODE_COLLAPSE_TEXT !== 'undefined' ? CODE_COLLAPSE_TEXT : '收起'

      // 获取所有匹配的代码块元素
      const dom = Array.from(document.querySelectorAll(selector))
      
      // 遍历每个代码块
      dom.forEach((e) => {
        const el = e
        
        // 检查是否已经处理过该代码块（避免重复处理）
        if (/v-expand/.test(el.className)) {
          return
        }
        
        // 只有当代码块实际高度超过设定的最大高度时，才添加展开/收起功能
        if (el.offsetHeight <= maxHeight) {
          return
        }
        
        // 创建 CodeExpand 组件实例
        const C = Vue.extend(CodeExpand)
        const expand = new C({
          propsData: {
            expandText: expandText,
            collapseText: collapseText,
            maxHeight: maxHeight,
            target: el, // 将代码块元素作为 target 传给组件
          }
        })
        
        // 挂载组件
        expand.$mount()
        
        // 标记该代码块已处理
        el.className += ' v-expand'
        
        // 获取代码块容器（即 pre 元素的父元素）
        const container = el.parentElement
        
        // 确保容器使用相对定位，以便绝对定位的按钮能正确显示
        container.style.position = 'relative'
        
        // 给容器添加一个类名，方便样式处理
        container.className += ' v-expand-container'
        
        // 将组件的 DOM 元素添加到代码块容器中
        container.appendChild(expand.$el)
      })
    },
  },
}
