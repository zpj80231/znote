<template>
  <div class="cwd-comments-wrapper" v-show="isShow">
      <div id="cwd-comments-container" ref="cwdContainer"></div>
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
      observer: null
    }
  },
  computed: {
    cwdOptions() {
      const config = this.$themeConfig.cwdConfig || {}
      return {
        serverUrl: config.serverUrl || '',
        siteId: config.siteId || '',
        pageSize: config.pageSize || 10,
        customCssUrl: config.customCssUrl || '',
        placeholder: config.placeholder || '填写邮箱可以收到回复哦！',
        lang: config.lang || 'zh-CN'
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
        this.initCWD()
        return
      }
      if (document.querySelector('script[src*="cwd-widget"]')) {
        const checkLoaded = setInterval(() => {
          if (window.CWDComments) {
            clearInterval(checkLoaded)
            this.initCWD()
          }
        }, 100)
        setTimeout(() => clearInterval(checkLoaded), 10000)
        return
      }
      const script = document.createElement('script')
      // script.src = 'https://unpkg.com/cwd-widget@latest/dist/cwd.js'
      // script.src = '/znote/public/js/cwd.js'
      script.async = true
      script.onload = () => {
        this.initCWD()
      }
      script.onerror = (e) => {
        console.error('Failed to load CWD comments script:', e)
      }
      document.head.appendChild(script)
    },
    initCWD() {
      if (!window.CWDComments) {
        return
      }
      if (!this.$refs.cwdContainer) {
        this.$nextTick(() => {
          this.initCWD()
        })
        return
      }
      const options = this.cwdOptions
      if (!options.serverUrl || !options.siteId) {
        console.warn('CWD Comments: serverUrl and siteId are required')
        return
      }
      this.destroyCWD()
      this.$refs.cwdContainer.innerHTML = ''
      
      const cwdConfig = {
        el: this.$refs.cwdContainer,
        apiBaseUrl: options.serverUrl,
        postSlug: window.location.pathname,
        siteId: options.siteId,
        theme: this.getDarkMode(),
        pageSize: options.pageSize,
        lang: options.lang
      }
      
      if (options.customCssUrl) {
        cwdConfig.customCssUrl = options.customCssUrl
      }
      
      try {
        this.cwdInstance = new window.CWDComments(cwdConfig)
        if (this.cwdInstance && typeof this.cwdInstance.mount === 'function') {
          this.cwdInstance.mount()
        }
        this.setupThemeObserver()
        this.waitAndUpdateInputs()
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
    getDarkMode() {
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
      const container = this.$refs.cwdContainer
      if (container && container.shadowRoot) {
        this.addThemeClassToShadowRoot(container.shadowRoot)
      }
    },
    refreshComments() {
      if (this.cwdInstance && typeof this.cwdInstance.updateConfig === 'function') {
        this.cwdInstance.updateConfig({ postSlug: window.location.pathname })
      } else {
        this.initCWD()
      }
    },
    waitAndUpdateInputs() {
      let attempts = 0
      const maxAttempts = 50
      const checkInterval = setInterval(() => {
        attempts++
        const container = this.$refs.cwdContainer
        if (container && container.shadowRoot) {
          clearInterval(checkInterval)
          this.updateInputsPlaceholder(container.shadowRoot)
          this.addThemeClassToShadowRoot(container.shadowRoot)
          this.observeShadowRoot(container.shadowRoot)
        }
        if (attempts >= maxAttempts) {
          clearInterval(checkInterval)
        }
      }, 100)
    },
    updateInputsPlaceholder(shadowRoot) {
      const inputs = shadowRoot.querySelectorAll('input[type="text"], input[type="email"], input[type="url"]')
      inputs.forEach((input, index) => {
        const label = input.closest('div')?.querySelector('label') || 
                     input.parentElement?.querySelector('label')
        let placeholderText = ''
        
        if (label) {
          placeholderText = label.textContent.trim()
        } else if (input.name) {
          const nameMap = {
            'nickname': '昵称',
            'name': '昵称',
            'email': '邮箱',
            'mail': '邮箱',
            'website': '网址(http://)',
            'url': '网址(http://)'
          }
          placeholderText = nameMap[input.name.toLowerCase()] || ''
        } else if (index === 0) {
          placeholderText = '昵称'
        } else if (index === 1) {
          placeholderText = '邮箱'
        } else if (index === 2) {
          placeholderText = '网址(http://)'
        }
        
        if (placeholderText && !input.placeholder) {
          input.placeholder = placeholderText
        }
      })
      
      const textarea = shadowRoot.querySelector('textarea')
      if (textarea && !textarea.placeholder) {
        textarea.placeholder = this.cwdOptions.placeholder
      }
    },
    addThemeClassToShadowRoot(shadowRoot) {
      const theme = this.getDarkMode()
      const widget = shadowRoot.querySelector('.cwd-widget') || shadowRoot.firstChild
      if (widget) {
        widget.classList.remove('theme-light', 'theme-dark')
        widget.classList.add(`theme-${theme}`)
      }
    },
    observeShadowRoot(shadowRoot) {
      const shadowObserver = new MutationObserver(() => {
        this.updateInputsPlaceholder(shadowRoot)
        this.addThemeClassToShadowRoot(shadowRoot)
      })
      shadowObserver.observe(shadowRoot, {
        childList: true,
        subtree: true
      })
    }
  }
}
</script>

<style lang="stylus">
.cwd-comments-wrapper
  max-width $contentWidth
  margin-left auto
  margin-right auto

@media (max-width: $MQMobile)
  .cwd-comments-wrapper
    padding 0 1rem

#cwd-comments-container
  min-height 100px
</style>
