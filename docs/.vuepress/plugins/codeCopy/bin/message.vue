<template>
  <transition
    name="slide-fade"
    appear
  >
    <div
      class="v-notification__group"
      v-if="show"
    >
      <h2
        class="v-notification__title"
        v-if="title"
      >{{title}}</h2>
      <div class="v-notification__content">
        <p>{{content}}</p>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    title: String,
    content: String,
    time: {
      type: Number,
      default: 3000
    },
  },
  data() {
    return {
      show: true,
    }
  },
  created() {
    // 如果有限的就调用定时器，完成后删除节点        
    if (Number.isFinite(this.time)) {
      setTimeout(() => {
        this.show = false;
        // 延迟删除 DOM 节点，等待动画完成
        setTimeout(() => {
          if (this.$el && this.$el.parentNode) {
            this.$el.parentNode.removeChild(this.$el);
          }
        }, 300);
      }, this.time);
    }
  }
}
</script>

<style scoped>
.v-notification__group {
  width: 330px;
  padding: 14px 26px 14px;
  border-radius: 8px;
  box-sizing: border-box;
  border: 1px solid var(--border-color, #ebeef5);
  background-color: var(--background-color, #fff);
  color: var(--text-color, #303133);
  box-shadow: var(--box-shadow, 0 2px 12px 0 rgba(0, 0, 0, 0.1));
  margin-bottom: 1rem;
}

.v-notification__title {
  font-weight: 700;
  font-size: 16px;
  color: inherit;
  margin: 0;
  border: none;
}

.v-notification__content {
  font-size: 14px;
  line-height: 21px;
  margin: 6px 0 0;
  color: inherit;
  text-align: justify;
}

.v-notification__content p {
  margin: 0;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 0.3s, transform 0.3s, left 0.3s, right 0.3s, top 0.4s,
    bottom 0.3s;
}

.slide-fade-enter {
  transform: translateX(calc(100% + 1rem));
  opacity: 0;
}
.slide-fade-leave-to {
  opacity: 0;
}
</style>

<style>
.alert-list {
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 4rem;
  right: 1rem;
  overflow: hidden;
  z-index: 100;
}
</style>

