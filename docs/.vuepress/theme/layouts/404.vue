<template>
  <div class="not-found-page">
    <div id="tencent-404-container" v-if="noFoundPageByTencent"></div>

    <div class="theme-container" v-else>
      <div class="content">
        <h1>404</h1>
        <blockquote>{{ getMsg() }}</blockquote>
        <a href="javascript:void(0)" @click="goBack">返回上一页</a>
      </div>
    </div>

    <div class="not-found-countdown" role="status" aria-live="polite">
      <div class="not-found-countdown__body">
        <div class="not-found-countdown__message">
          <span class="not-found-countdown__time">{{ countdown }}</span>
          <span class="not-found-countdown__label">秒后自动返回上一页</span>
        </div>
        <button class="not-found-countdown__back" type="button" @click="goBack">立即返回</button>
      </div>
    </div>
  </div>
</template>

<script>
import setMode, { activateMode } from '@theme/components/Mode/setMode'

const msgs = [
  `There's nothing here.`,
  `How did we get here?`,
  `That's a Four-Oh-Four.`,
  `Looks like we've got some broken links.`
]

export default {
  data () {
    return {
      countdown: 10,
      countdownTimer: null
    }
  },
  computed: {
    noFoundPageByTencent () {
      return this.$themeConfig.noFoundPageByTencent !== false
    }
  },
  mounted () {
    this.applyMode()
    document.body.classList.add('is-not-found-page')

    if (this.noFoundPageByTencent) {
      const dom = document.createElement('script')
      dom.setAttribute('rendertarget', 'tencent-404-container')
      dom.setAttribute('src', 'https://volunteer.cdn-go.cn/404/latest/404.js')
      document.body.append(dom)
    }
    this.startCountdown()
  },
  beforeDestroy () {
    this.clearTimers()
    document.body.classList.remove('is-not-found-page')
  },
  methods: {
    getMsg () {
      return msgs[Math.floor(Math.random() * msgs.length)]
    },
    applyMode () {
      const mode = localStorage.getItem('mode')
      if (mode === 'dark' || mode === 'light') {
        activateMode(mode)
        return
      }
      setMode()
    },
    startCountdown () {
      this.countdownTimer = setInterval(() => {
        this.countdown -= 1
        if (this.countdown <= 0) {
          this.goBack(300)
        }
      }, 1000)
    },
    clearTimers () {
      if (this.countdownTimer) {
        clearInterval(this.countdownTimer)
        this.countdownTimer = null
      }
    },
    goBack (delay = 0) {
      this.clearTimers()
      setTimeout(() => {
        if (window.history.length > 1) {
          window.history.back()
          return
        }
        location.href = this.$site.base
      }, delay)
    }
  }
}
</script>

<style src="../styles/theme.styl" lang="stylus"></style>

<style lang="stylus">
body.is-not-found-page
  .global-ui
    display none !important
.not-found-page ~ .global-ui
  display none !important
.content
  margin 4rem auto 0
  max-width 800px
  padding 0 2rem
.not-found-countdown
  position fixed !important
  right 16px !important
  bottom 16px !important
  z-index 2147483647 !important
  box-sizing border-box
  min-width 220px
  max-width calc(100vw - 32px)
  padding 14px 16px 12px
  color var(--text-color)
  background var(--background-color)
  border 1px solid var(--border-color)
  border-radius 8px
  box-shadow var(--box-shadow-hover)
.not-found-countdown__body
  display flex
  align-items center
  justify-content space-between
  gap 14px
  font-size 14px
  line-height 1.4
.not-found-countdown__message
  display flex
  align-items baseline
  gap 6px
.not-found-countdown__time
  color #42b983
  font-size 28px
  font-weight 700
  line-height 1
.not-found-countdown__label
  white-space nowrap
.not-found-countdown__back
  flex 0 0 auto
  height 30px
  padding 0 12px
  color #ffffff
  background #42b983
  border 0
  border-radius 6px
  font-size 13px
  line-height 30px
  cursor pointer
  white-space nowrap
  transition background .2s ease
  &:hover
    background #369f6f
.mod_404
  .desc
    .desc_link
      display: inline-block
      // margin: 20px 0
      background: #424242!important
      color: #ffffff
      padding: 6px 20px!important
      text-decoration: none!important
      border-radius: 4px

@media screen and (max-width: 720px)
  .not-found-countdown
    left 12px !important
    right 12px !important
    bottom 12px !important
    transform none
    min-width 0
    max-width none
    padding 12px 14px 10px
  .not-found-countdown__body
    justify-content space-between
    gap 10px
  .not-found-countdown__time
    font-size 24px
  .not-found-countdown__back
    height 28px
    padding 0 10px
    font-size 12px
    line-height 28px
  .mod_404
    .desc
      margin: 50px 0
    .wrapper
      margin 0!important
      padding-top 20px
</style>
