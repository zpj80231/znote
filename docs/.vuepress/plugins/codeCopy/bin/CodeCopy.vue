<template>
  <span>
    <span
      ref="btn"
      class="v-copy-code-btn"
      :class="{ 'is-copied': isCopied }"
      role="button"
      tabindex="0"
      :aria-label="buttonText"
      :title="buttonText"
      @click="copyClick"
      @keydown.enter.prevent="copyClick"
      @keydown.space.prevent="copyClick"
    >
      <span
        class="v-copy-code-icon"
        :class="isCopied ? 'v-copy-code-icon-check' : 'v-copy-code-icon-copy'"
        aria-hidden="true"
      >
        <span v-if="!isCopied" class="v-copy-code-fold"></span>
      </span>
    </span>
  </span>
</template>

<script>
import clipboard from "./clipboard";

const HIGHLIGHT_CLASS = 'v-code-copy-highlight'

export default {
  props: {
    copyText: {
      type: String,
      default: '复制代码'
    },
    successText: {
      type: String,
      default: '复制成功'
    },
    code: {
      type: String,
      default: ''
    },
    duration: {
      type: Number,
      default: 1000
    },
    change: {
      type: Function,
      default: null
    },
    target: {
      type: null,
      default: null
    }
  },
  data() {
    return {
      isCopied: false,
      timer: null
    }
  },
  computed: {
    buttonText() {
      return this.isCopied ? this.successText : this.copyText
    }
  },
  methods: {
    copyClick() {
      if (this.isCopied) {
        return
      }

      const call = (e) => {
        if (typeof this.change === "function") {
          this.change.call(this, e, this.$el)
        }
      }

      clipboard(this.code)
        .then((e) => {
          this.applyHighlight()
          this.startResetTimer()
          call(e)
        })
        .catch((err) => {
          this.removeHighlight()
          call(err)
        })
    },
    startResetTimer() {
      this.clearTimer()
      this.isCopied = true
      const delay = Math.max(0, Number(this.duration) || 0)
      this.timer = setTimeout(() => {
        this.resetState()
      }, delay)
    },
    resetState() {
      this.clearTimer()
      this.removeHighlight()
      this.isCopied = false
    },
    clearTimer() {
      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = null
      }
    },
    applyHighlight() {
      if (this.target && this.target.classList) {
        this.target.classList.add(HIGHLIGHT_CLASS)
      }
    },
    removeHighlight() {
      if (this.target && this.target.classList) {
        this.target.classList.remove(HIGHLIGHT_CLASS)
      }
    }
  },
  beforeDestroy() {
    this.clearTimer()
    this.removeHighlight()
  }
};
</script>

<style>
div[class][class*="language-"]::before {
  right: 2.2rem;
}

div[class][class*="language-"] pre {
  transition: box-shadow 0.5s ease, background-color 0.5s ease;
}

.v-code-copy-highlight {
  position: relative;
  background-color: rgba(79, 192, 141, 0.5);
  box-shadow: 0 0 0 4px rgba(79, 192, 141, 0.75);
  border-radius: 6px;
  transition: box-shadow 0.5s ease, background-color 0.5s ease;
}

@media (prefers-color-scheme: dark) {
  .v-code-copy-highlight {
    background-color: rgba(79, 192, 141, 0.2);
    box-shadow: 0 0 0 2px rgba(79, 192, 141, 0.45);
  }
}
</style>

<style scoped>
.v-copy-code-btn {
  cursor: pointer;
  position: absolute;
  z-index: 3;
  top: 0.8em;
  right: 1em;
  width: 1rem;
  height: 1rem;
  border: 1px solid transparent;
  border-radius: 4px;
  background: transparent;
  color: var(--code-lang-color);
  opacity: 0.95;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  line-height: 1;
  transition: color 0.16s ease, opacity 0.16s ease, background 0.16s ease, border-color 0.16s ease, transform 0.16s ease;
  user-select: none;
}

.v-copy-code-btn:hover,
.v-copy-code-btn:focus-visible {
  opacity: 1;
  color: var(--code-block-color);
  background: var(--code-line-highlight);
  border-color: var(--code-divider-color);
  outline: none;
}

.v-copy-code-btn.is-copied {
  color: rgba(79, 192, 141, 0.95);
  border-color: rgba(79, 192, 141, 0.34);
  background: rgba(79, 192, 141, 0.08);
  opacity: 1;
}

.v-copy-code-icon {
  position: relative;
  display: inline-block;
  width: 0.78rem;
  height: 0.82rem;
}

.v-copy-code-icon-copy::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0.08rem;
  width: 0.58rem;
  height: 0.72rem;
  border: 1.35px solid currentColor;
  border-radius: 2px;
  box-sizing: border-box;
}

.v-copy-code-fold {
  position: absolute;
  top: 0;
  right: 0.11rem;
  width: 0.22rem;
  height: 0.22rem;
  border-left: 1.35px solid currentColor;
  border-bottom: 1.35px solid currentColor;
  background: var(--code-block-bg);
  box-sizing: border-box;
  transform: translate(0.02rem, -0.01rem) rotate(0deg);
}

.v-copy-code-icon-copy::before {
  content: '';
  position: absolute;
  left: 0.22rem;
  top: 0.25rem;
  width: 0.32rem;
  height: 0.08rem;
  border-top: 1.2px solid currentColor;
  border-bottom: 1.2px solid currentColor;
  opacity: 0.56;
}

.v-copy-code-icon-check::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 0.34rem;
  height: 0.58rem;
  border-right: 1.85px solid currentColor;
  border-bottom: 1.85px solid currentColor;
  transform: translate(-50%, -50%) rotate(45deg);
  box-sizing: border-box;
}
</style>
