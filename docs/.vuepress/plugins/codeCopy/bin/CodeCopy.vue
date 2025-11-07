<template>
  <span>
    <span
      ref="btn"
      class="v-copy-code-btn"
      :class="{ 'is-copied': isCopied }"
      @click="copyClick"
    >{{buttonText}}</span>
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
      type: [Object],
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
  right: 70px;
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
  color: hsla(0, 0%, 54.9%, 0.8);
  transition: color 0.1s;
  position: absolute;
  z-index: 3;
  top: 0.8em;
  right: 15px;
  font-size: 0.75rem;
}

.v-copy-code-btn:hover {
  color: #8c8c8c;
}

.v-copy-code-btn.is-copied {
  color: rgba(79, 192, 141, 0.95);
}
</style>

