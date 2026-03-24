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
  props: {
    expandText: {
      type: String,
      default: '展开'
    },
    collapseText: {
      type: String,
      default: '收起'
    },
    maxHeight: {
      type: Number,
      default: 500
    },
    target: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      isExpanded: false,
      codeContainer: null
    }
  },
  computed: {
    buttonText() {
      return this.isExpanded ? this.collapseText : this.expandText
    }
  },
  methods: {
    toggleExpand() {
      this.isExpanded = !this.isExpanded
      if (this.codeContainer) {
        if (this.isExpanded) {
          this.codeContainer.style.maxHeight = 'none'
          this.codeContainer.style.overflowY = 'visible'
        } else {
          this.codeContainer.style.maxHeight = this.maxHeight + 'px'
          this.codeContainer.style.overflowY = 'hidden'
        }
      }
    }
  },
  mounted() {
    // 获取代码块的容器元素（即 pre 元素的父元素）
    // 这样可以同时限制代码和行号的显示
    if (this.target && this.target.parentElement) {
      this.codeContainer = this.target.parentElement
      
      // 给容器添加底部内边距，确保按钮有空间显示
      const originalPaddingBottom = this.codeContainer.style.paddingBottom
      this.codeContainer.style.paddingBottom = '0.1em'
      
      // 设置初始样式
      this.codeContainer.style.maxHeight = this.maxHeight + 'px'
      this.codeContainer.style.overflowY = 'hidden'
      this.codeContainer.style.transition = 'max-height 0.3s ease'
      
      // 确保 pre 元素可以滚动
      this.target.style.overflowY = 'auto'
      this.target.style.overflowX = 'auto'
      this.target.style.maxHeight = '100%'
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

/* 箭头样式 */
.v-expand-code-btn .arrow {
  display: inline-block;
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 6px solid rgba(224, 224, 224, 0.8);
  transition: transform 0.3s ease;
}

.v-expand-code-btn .arrow.expanded {
  transform: rotate(180deg);
}

/* 按钮 hover 状态 */
.v-expand-code-btn:hover {
  background: rgba(74, 85, 102, 0.9);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
  transform: translateX(-50%) translateY(-1px);
  color: rgba(255, 255, 255, 0.95);
}

.v-expand-code-btn:hover .arrow {
  border-top: 6px solid rgba(255, 255, 255, 0.95);
}
</style>
