<template>
  <span>
    <span ref="btn" class="v-expand-code-btn" @click="toggleExpand">
      <span class="arrow" :class="{ expanded: isExpanded }"></span>
      <span class="label">{{buttonText}}</span>
    </span>
  </span>
</template>

<script>
export default {
  // 组件属性定义
  props: {
    // 展开按钮文本
    expandText: {
      type: String,
      default: '展开更多'
    },
    // 收起按钮文本
    collapseText: {
      type: String,
      default: '收起代码'
    },
    // 代码块最大高度（像素）
    maxHeight: {
      type: Number,
      default: 500
    },
    // 目标代码块元素（pre 元素）
    target: {
      type: null,
      default: null
    }
  },
  // 组件数据
  data() {
    return {
      isExpanded: false,      // 当前是否展开状态
      codeContainer: null,    // 代码块容器元素（pre 的父元素）
      lineNumbersWrapper: null, // 行号容器元素
      highlightLines: null,   // 高亮行容器元素
      containerTop: 0         // 代码块容器距离页面顶部的位置
    }
  },
  // 计算属性
  computed: {
    // 根据展开/收起状态返回对应的按钮文本
    buttonText() {
      return this.isExpanded ? this.collapseText : this.expandText
    }
  },
  // 方法
  methods: {
    /**
     * 切换展开/收起状态
     */
    toggleExpand() {
      // 如果当前是展开状态，即将收起，先记录代码块位置
      if (this.isExpanded) {
        // 获取代码块容器相对于视口的位置
        const rect = this.codeContainer.getBoundingClientRect()
        // 计算代码块在页面中的绝对位置
        this.containerTop = window.scrollY + rect.top
      }
      
      // 切换状态
      this.isExpanded = !this.isExpanded
      
      // 更新代码块容器样式
      if (this.codeContainer) {
        if (this.isExpanded) {
          // 展开：移除高度限制
          this.codeContainer.style.maxHeight = 'none'
          this.codeContainer.style.overflowY = 'visible'
          this.target.style.maxHeight = 'none'
          this.target.style.paddingBottom = '0.7rem'
          this.updateRelatedLayers(false)
        } else {
          // 收起：恢复高度限制
          this.codeContainer.style.maxHeight = 'none'
          this.codeContainer.style.overflowY = 'visible'
          this.target.style.maxHeight = this.maxHeight + 'px'
          this.target.style.paddingBottom = ''
          this.updateRelatedLayers(true)
          
          // 等待 DOM 更新后滚动到代码块位置
          this.$nextTick(() => {
            window.scrollTo({
              top: this.containerTop - 100, // 减去 100px 让代码块显示在视口上方一点
              behavior: 'auto'
            })
          })
        }
      }
    },

    updateRelatedLayers(collapsed) {
      const maxHeight = collapsed ? this.maxHeight + 'px' : 'none'
      const overflow = collapsed ? 'hidden' : 'visible'
      ;[this.lineNumbersWrapper, this.highlightLines].forEach((el) => {
        if (!el) return
        el.style.maxHeight = maxHeight
        el.style.overflow = overflow
      })
    }
  },
  // 生命周期钩子 - 组件挂载后执行
  mounted() {
    // 获取代码块的容器元素（即 pre 元素的父元素）
    // 这样可以同时限制代码和行号的显示
    if (this.target && this.target.parentElement) {
      this.codeContainer = this.target.parentElement
      this.lineNumbersWrapper = this.codeContainer.querySelector('.line-numbers-wrapper')
      this.highlightLines = this.codeContainer.querySelector('.highlight-lines')
      
      // 设置容器样式
      this.codeContainer.style.paddingBottom = '0em'
      this.codeContainer.style.maxHeight = 'none'
      this.codeContainer.style.overflowY = 'visible'
      
      // 确保 pre 元素内部可以滚动
      this.target.style.overflowY = 'auto'
      this.target.style.overflowX = 'auto'
      this.target.style.maxHeight = this.maxHeight + 'px'
      this.target.style.transition = 'max-height 0.3s ease'
      this.updateRelatedLayers(true)
    }
  }
};
</script>

<style scoped>
.v-expand-code-btn {
  cursor: pointer;
  color: var(--code-block-color) !important;
  transition: color 0.2s ease, background 0.2s ease;
  position: absolute;
  z-index: 10;
  right: 0;
  bottom: 0;
  left: 0;
  font-size: 0.82rem;
  font-weight: 500;
  line-height: 1rem;
  height: 2.4rem;
  padding: 0;
  background: linear-gradient(to bottom, transparent 0%, var(--code-block-bg) 22%);
  -webkit-mask-image: radial-gradient(ellipse 88% 100% at 50% 100%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0) 100%);
  mask-image: radial-gradient(ellipse 88% 100% at 50% 100%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0) 100%);
  border: 0;
  border-radius: 0;
  box-shadow: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.32rem;
  opacity: 0.95;
  user-select: none;
  white-space: nowrap;
}

.v-expand-code-btn .arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  flex: 0 0 auto;
  border-radius: 50%;
  background: var(--code-line-highlight);
  transition: background 0.2s ease, transform 0.25s ease;
}

.v-expand-code-btn .arrow:after {
  content: '';
  width: 0.32rem;
  height: 0.32rem;
  border-right: 1.5px solid currentColor;
  border-bottom: 1.5px solid currentColor;
  transform: rotate(45deg);
  margin-top: -0.08rem;
  transition: transform 0.25s ease;
}

.v-expand-code-btn .arrow.expanded {
  transform: rotate(180deg);
}

.v-expand-code-btn .label {
  color: inherit;
  opacity: 0.82;
  transition: opacity 0.2s ease;
}

.v-expand-code-btn:hover {
  background: linear-gradient(to bottom, transparent 0%, var(--code-block-bg) 14%);
  -webkit-mask-image: radial-gradient(ellipse 92% 100% at 50% 100%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0) 100%);
  mask-image: radial-gradient(ellipse 92% 100% at 50% 100%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0) 100%);
  opacity: 1;
}

.v-expand-code-btn:hover .arrow {
  background: var(--code-line-highlight-border);
}

.v-expand-code-btn:hover .label {
  opacity: 1;
}
</style>
