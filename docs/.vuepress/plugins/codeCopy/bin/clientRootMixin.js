/* eslint-disable no-underscore-dangle */
import Vue from 'vue'
import CodeCopy from './CodeCopy.vue'

export default {
  updated() {
    // 等待dom加载完成之后执行
    setTimeout(() => {
      this.$copyUpdates()
    }, 0)
  },
  methods: {
    $copyUpdates() {
      // 获取所有的dom，之后在所有的代码块上插入vue的组件
      const selector = typeof CODE_COPY_SELECTOR !== 'undefined' ? CODE_COPY_SELECTOR : 'div[class*="language-"] pre'
      const copyText = typeof CODE_COPY_TEXT !== 'undefined' ? CODE_COPY_TEXT : '复制代码'
      const successText = typeof CODE_COPY_SUCCESS_TEXT !== 'undefined' ? CODE_COPY_SUCCESS_TEXT : '复制成功'
      const duration = typeof CODE_COPY_RESET_DURATION !== 'undefined' ? CODE_COPY_RESET_DURATION : 1000
      const change = typeof CODE_COPY_CHANGE !== 'undefined' ? CODE_COPY_CHANGE : null

      const dom = Array.from(document.querySelectorAll(selector))
      dom.forEach((e) => {
        const el = e
        // 判断一下，当前节点是不是已经插入了
        if (/v-copy/.test(el.className)) {
          return
        }
        // 创建copy组件
        const C = Vue.extend(CodeCopy)
        const copy = new C({
          propsData: {
            copyText: copyText,
            successText: successText,
            code: el.textContent,
            duration: duration,
            change: change,
            target: el,
          }
        })
        copy.$mount()
        el.className += ' v-copy'
        el.parentElement.appendChild(copy.$el)
      })
    },
  },
}

