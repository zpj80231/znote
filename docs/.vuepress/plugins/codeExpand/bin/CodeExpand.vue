<template>
  <span>
    <span ref="btn" class="v-expand-code-btn" @click="toggleExpand">
      <span class="arrow" :class="{ expanded: isExpanded }"></span>
      {{buttonText}}
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
      default: '展开'
    },
    // 收起按钮文本
    collapseText: {
      type: String,
      default: '收起'
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
        } else {
          // 收起：恢复高度限制
          this.codeContainer.style.maxHeight = this.maxHeight + 'px'
          this.codeContainer.style.overflowY = 'hidden'
          
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
    
    /**
     * 检测当前是否为暗黑模式
     * 通过检查 CSS 变量 --background-color 的值来判断
     */
    isDarkMode() {
      const root = document.querySelector(':root')
      if (!root) return false
      const bgColor = getComputedStyle(root).getPropertyValue('--background-color').trim()
      // 暗黑模式下背景色为 #25272a 或类似的深色
      return bgColor && (bgColor === '#25272a' || bgColor === 'rgb(37, 39, 42)')
    },
    
    /**
     * 更新按钮样式以适配当前模式
     */
    updateButtonStyle() {
      if (this.$refs.btn) {
        if (this.isDarkMode()) {
          // 暗黑模式：使用更深的背景色
          this.$refs.btn.style.background = 'rgba(65, 75, 105)'
          this.$refs.btn.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.25)'
        } else {
          // 明亮模式：使用默认背景色
          this.$refs.btn.style.background = 'rgba(74, 85, 102, 0.7)'
          this.$refs.btn.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.15)'
        }
      }
    }
  },
  // 生命周期钩子 - 组件挂载后执行
  mounted() {
    // 获取代码块的容器元素（即 pre 元素的父元素）
    // 这样可以同时限制代码和行号的显示
    if (this.target && this.target.parentElement) {
      this.codeContainer = this.target.parentElement
      
      // 设置容器样式
      this.codeContainer.style.paddingBottom = '0em'
      this.codeContainer.style.maxHeight = this.maxHeight + 'px'
      this.codeContainer.style.overflowY = 'hidden'
      this.codeContainer.style.transition = 'max-height 0.3s ease'
      
      // 确保 pre 元素内部可以滚动
      this.target.style.overflowY = 'auto'
      this.target.style.overflowX = 'auto'
      this.target.style.maxHeight = '100%'
    }
    
    // 初始化按钮样式
    this.updateButtonStyle()
    
    // 监听模式切换
    // 主题通过修改 :root 的 CSS 变量来切换模式
    // 我们使用 MutationObserver 来监听样式变化
    const root = document.querySelector(':root')
    if (root) {
      this.observer = new MutationObserver(() => {
        this.updateButtonStyle()
      })
      this.observer.observe(root, {
        attributes: true,
        attributeFilter: ['style']
      })
    }
  },
  
  // 生命周期钩子 - 组件销毁前执行
  beforeDestroy() {
    // 清理 MutationObserver
    if (this.observer) {
      this.observer.disconnect()
    }
  }
};
</script>

<style scoped>
/* 展开/收起按钮样式 - 底部居中设计 */
.v-expand-code-btn {
  cursor: pointer;
  color: rgba(224, 224, 224, 0.8);
  transition: all 0.2s ease;
  position: absolute;
  z-index: 10;
  bottom: 0.5em;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.75rem;
  padding: 0.35rem 1.25rem;
  background: rgba(74, 85, 102, 0.7);
  border-radius: 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

/* 箭头样式 - 使用 CSS 绘制三角形 */
.v-expand-code-btn .arrow {
  display: inline-block;
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 6px solid rgba(224, 224, 224, 0.8);
  transition: transform 0.3s ease;
}

/* 展开状态下箭头旋转 180 度 */
.v-expand-code-btn .arrow.expanded {
  transform: rotate(180deg);
}

/* 按钮 hover 状态 - 背景加深，轻微上浮 */
.v-expand-code-btn:hover {
  background: rgba(74, 85, 102, 0.9);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
  transform: translateX(-50%) translateY(-1px);
  color: rgba(255, 255, 255, 0.95);
}

/* hover 时箭头颜色变亮 */
.v-expand-code-btn:hover .arrow {
  border-top: 6px solid rgba(255, 255, 255, 0.95);
}
</style>
