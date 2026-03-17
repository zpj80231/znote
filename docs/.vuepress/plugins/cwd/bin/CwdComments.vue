<template>
  <div class="cwd-comments-wrapper" v-show="isShow">
    <ClientOnly>
      <div id="cwd-comments-container" ref="cwdContainer"></div>
    </ClientOnly>
  </div>
</template>

<script>
export default {
  name: 'CwdComments',
  props: {
    isShow: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      cwdInstance: null,
      isLoaded: false,
      observer: null,
      scriptLoaded: false
    }
  },
  computed: {
    cwdOptions() {
      const config = this.$themeConfig.cwdConfig || {}
      return {
        serverUrl: config.serverUrl || '',
        appId: config.appId || '',
        darkMode: config.darkMode || 'auto',
        lang: config.lang || 'zh-CN',
        theme: config.theme || 'default',
        emoji: config.emoji !== false,
        avatar: config.avatar || 'robohash',
        pageSize: config.pageSize || 10,
        placeholder: config.placeholder || '欢迎评论...',
        highlight: config.highlight !== false,
        math: config.math === true,
        uploadImage: config.uploadImage === true
      }
    }
  },
  mounted() {
    this.loadCWDScript()
  },
  beforeDestroy() {
    if (this.observer) {
      this.observer.disconnect()
    }
    this.destroyCWD()
  },
  watch: {
    '$route'(to, from) {
      if (to.path !== from.path) {
        this.$nextTick(() => {
          setTimeout(() => {
            this.refreshComments()
          }, 300)
        })
      }
    }
  },
  methods: {
    loadCWDScript() {
      if (window.CWDComments) {
        this.scriptLoaded = true
        this.initCWD()
        return
      }
      if (document.querySelector('script[src*="cwd-widget"]')) {
        const checkLoaded = setInterval(() => {
          if (window.CWDComments) {
            clearInterval(checkLoaded)
            this.scriptLoaded = true
            this.initCWD()
          }
        }, 100)
        setTimeout(() => clearInterval(checkLoaded), 10000)
        return
      }
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/cwd-widget@latest/dist/cwd.js'
      script.async = true
      script.onload = () => {
        this.scriptLoaded = true
        this.initCWD()
      }
      script.onerror = (e) => {
        console.error('Failed to load CWD comments script:', e)
      }
      document.head.appendChild(script)
    },
    initCWD() {
      if (!window.CWDComments) {
        console.warn('CWD Comments: CWDComments not loaded')
        return
      }
      if (!this.$refs.cwdContainer) {
        this.$nextTick(() => {
          this.initCWD()
        })
        return
      }
      const options = this.cwdOptions
      if (!options.serverUrl || !options.appId) {
        console.warn('CWD Comments: serverUrl and appId are required')
        return
      }
      this.destroyCWD()
      this.$refs.cwdContainer.innerHTML = ''
      
      const cwdConfig = {
        el: this.$refs.cwdContainer,
        apiBaseUrl: options.serverUrl,
        postSlug: this.getPostSlug(),
        siteId: options.appId,
        lang: options.lang,
        theme: this.getDarkMode(),
        pageSize: options.pageSize
      }
      
      try {
        this.cwdInstance = new window.CWDComments(cwdConfig)
        if (this.cwdInstance && typeof this.cwdInstance.mount === 'function') {
          this.cwdInstance.mount()
        }
        this.isLoaded = true
        this.setupThemeObserver()
      } catch (e) {
        console.error('CWD Comments init error:', e)
      }
    },
    destroyCWD() {
      if (this.cwdInstance) {
        if (typeof this.cwdInstance.destroy === 'function') {
          this.cwdInstance.destroy()
        } else if (typeof this.cwdInstance.unmount === 'function') {
          this.cwdInstance.unmount()
        }
      }
      this.cwdInstance = null
    },
    getPostSlug() {
      return window.location.pathname
    },
    getDarkMode() {
      const config = this.cwdOptions
      if (config.darkMode === 'dark') return 'dark'
      if (config.darkMode === 'light') return 'light'
      return this.detectDarkMode() ? 'dark' : 'light'
    },
    detectDarkMode() {
      const rootElement = document.documentElement
      const bgColor = rootElement.style.getPropertyValue('--background-color')
      if (bgColor) {
        return bgColor.includes('25272a') || bgColor.includes('0, 0, 0')
      }
      const computedBg = window.getComputedStyle(document.body).backgroundColor
      if (computedBg) {
        const rgb = computedBg.match(/\d+/g)
        if (rgb && rgb.length >= 3) {
          const brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000
          return brightness < 128
        }
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    },
    setupThemeObserver() {
      if (this.observer) {
        this.observer.disconnect()
      }
      const config = this.cwdOptions
      if (config.darkMode !== 'auto') return
      this.observer = new MutationObserver(() => {
        this.updateTheme()
      })
      this.observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['style']
      })
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addListener(() => {
        this.updateTheme()
      })
    },
    updateTheme() {
      if (this.cwdInstance && typeof this.cwdInstance.updateConfig === 'function') {
        const newTheme = this.detectDarkMode() ? 'dark' : 'light'
        this.cwdInstance.updateConfig({ theme: newTheme })
      }
    },
    refreshComments() {
      if (this.cwdInstance && typeof this.cwdInstance.updateConfig === 'function') {
        this.cwdInstance.updateConfig({ postSlug: this.getPostSlug() })
      } else {
        this.initCWD()
      }
    }
  }
}
</script>

<style lang="stylus">
.cwd-comments-wrapper
  margin-top 2rem
  padding 0 2.5rem
  max-width $contentWidth
  margin-left auto
  margin-right auto

@media (max-width: $MQMobile)
  .cwd-comments-wrapper
    padding 0 1rem

#cwd-comments-container
  min-height 100px
</style>
