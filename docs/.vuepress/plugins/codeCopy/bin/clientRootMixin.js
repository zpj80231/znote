/* eslint-disable no-underscore-dangle */
import Vue from 'vue'
import CodeCopy from './copy.vue'

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
      const copyText = typeof CODE_COPY_TEXT !== 'undefined' ? CODE_COPY_TEXT : 'Copy code'
      const visibleTip = typeof CODE_COPY_VISIBLE_TIP !== 'undefined' ? CODE_COPY_VISIBLE_TIP : true
      const time = typeof CODE_COPY_TIME !== 'undefined' ? CODE_COPY_TIME : 3000
      const content = typeof CODE_COPY_CONTENT !== 'undefined' ? CODE_COPY_CONTENT : 'copy success'
      const title = typeof CODE_COPY_TITLE !== 'undefined' ? CODE_COPY_TITLE : 'Tips'
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
            code: el.textContent,
            visibleTip: visibleTip,
            time: time,
            content: content,
            title: title,
            change: change
          }
        })
        copy.$mount()
        el.className += ' v-copy'
        el.parentElement.appendChild(copy.$el)
      })
    },
  },
}

