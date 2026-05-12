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
  transition: color 0.16s ease, opacity 0.16s ease, background 0.16s ease;
  position: absolute;
  z-index: 10;
  right: 0;
  bottom: 0;
  left: 0;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1;
  height: 2rem;
  padding: 0;
  background: linear-gradient(to bottom, var(--code-block-bg) 0, var(--code-line-highlight) 42%, var(--code-line-highlight-border) 200%);
  border: 0;
  border-radius: 0 0 6px 6px;
  box-shadow: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.34rem;
  opacity: 0.96;
  user-select: none;
  white-space: nowrap;
}

.v-expand-code-btn:after {
  content: '';
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 0.05rem;
  background: linear-gradient(90deg, var(--code-line-highlight) 0, var(--code-line-highlight-border) 18%, var(--code-line-highlight) 50%, var(--code-line-highlight-border) 82%, var(--code-line-highlight) 100%);
  opacity: 0.95;
  pointer-events: none;
}

.v-expand-code-btn .arrow {
  display: inline-block;
  width: 0.38rem;
  height: 0.38rem;
  position: relative;
  z-index: 1;
  flex: 0 0 auto;
}

.v-expand-code-btn .arrow:after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0.34rem;
  height: 0.34rem;
  border-right: 1px solid currentColor;
  border-bottom: 1px solid currentColor;
  transform: translate(-50%, -60%) rotate(45deg);
  transition: transform 0.2s ease;
}

.v-expand-code-btn .arrow.expanded:after {
  transform: translate(-50%, -40%) rotate(225deg);
}

.v-expand-code-btn .label {
  position: relative;
  z-index: 1;
  color: inherit;
}

.v-expand-code-btn:hover {
  background: linear-gradient(to bottom, var(--code-block-bg) 0, var(--code-line-highlight) 28%, var(--code-line-highlight-border) 100%);
  opacity: 1;
}

.v-expand-code-btn:hover:after {
  background: linear-gradient(90deg, var(--code-line-highlight) 0, var(--code-line-highlight) 14%, var(--code-line-highlight-border) 50%, var(--code-line-highlight) 86%, var(--code-line-highlight) 100%);
  opacity: 1;
}
</style>
