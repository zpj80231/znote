<template>
  <span>
    <span
      ref="btn"
      class="v-copy-code-btn"
      @click="copyClick"
    >{{copyText}}</span>
  </span>
</template>

<script>
import clipboard from "./clipboard";

export default {
  props: {
    copyText: String,
    code: String,
    visibleTip: {
      type: Boolean,
      default: true
    },
    time: {
      type: Number,
      default: 3000
    },
    content: {
      type: String,
      default: 'copy success'
    },
    title: {
      type: String,
      default: 'Tips'
    },
    change: {
      type: Function,
      default: null
    }
  },
  methods: {
    copyClick() {
      const call = (e) => {
        if (typeof this.change === "function") {
          this.change.call(this, e, this.$el);
        }
      };
      
      clipboard(this.code)
        .then((e) => {
          if (this.visibleTip) {
            this.$message({
              time: this.time,
              content: this.content,
              title: this.title
            });
          }
          call(e);
        })
        .catch((err) => {
          call(err);
        });
    }
  }
};
</script>

<style>
div[class][class*="language-"]::before {
  right: 70px;
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
</style>

