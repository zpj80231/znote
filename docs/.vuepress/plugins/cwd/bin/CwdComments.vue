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
      observer: null,
      emojiPickerVisible: false
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
      const checkLoaded = setInterval(() => {
        if (window.CWDComments) {
          clearInterval(checkLoaded)
          this.initCWD()
        }
      }, 100)
      setTimeout(() => clearInterval(checkLoaded), 10000)
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
        this.setupFormValidation(shadowRoot)
        this.injectEmojiPicker(shadowRoot)
      })
      shadowObserver.observe(shadowRoot, {
        childList: true,
        subtree: true
      })
      this.setupFormValidation(shadowRoot)
      this.injectEmojiPicker(shadowRoot)
    },
    injectEmojiPicker(shadowRoot) {
      const textarea = shadowRoot.querySelector('textarea')
      if (!textarea || textarea._hasEmojiPicker) return
      textarea._hasEmojiPicker = true
      
      const textareaWrapper = textarea.parentElement
      if (!textareaWrapper) return
      
      textareaWrapper.style.position = 'relative'
      
      const emojiBtn = document.createElement('button')
      emojiBtn.type = 'button'
      emojiBtn.className = 'cwd-emoji-btn'
      emojiBtn.innerHTML = '😊'
      emojiBtn.title = '选择表情'
      emojiBtn.style.cssText = `
        position: absolute;
        right: 1px;
        bottom: 10px;
        height: 32px;
        border: none;
        background: transparent;
        cursor: pointer;
        font-size: 18px;
        padding: 4px;
        border-radius: 4px;
        transition: background-color 0.2s;
        z-index: 10;
      `
      
      const emojiPicker = document.createElement('div')
      emojiPicker.className = 'cwd-emoji-picker'
      emojiPicker.style.cssText = `
        position: absolute;
        right: 10px;
        bottom: 50px;
        width: 280px;
        max-height: 200px;
        background: #fff;
        border: 1px solid #e4e7ed;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        padding: 8px;
        display: none;
        flex-wrap: wrap;
        gap: 4px;
        z-index: 100;
        overflow-y: auto;
      `
      
      const emojis = [
        '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
        '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
        '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫',
        '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬',
        '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢',
        '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '🥸',
        '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲',
        '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱',
        '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠',
        '🤬', '👍', '👎', '👏', '🙌', '🤝', '💪', '❤️', '💔', '💯',
        '🎉', '🎊', '🎁', '🏆', '⭐', '🌟', '✨', '💫', '🔥', '💡'
      ]
      
      emojis.forEach(emoji => {
        const emojiItem = document.createElement('span')
        emojiItem.textContent = emoji
        emojiItem.style.cssText = `
          font-size: 20px;
          padding: 4px;
          cursor: pointer;
          border-radius: 4px;
          transition: background-color 0.2s;
        `
        emojiItem.addEventListener('mouseenter', () => {
          emojiItem.style.backgroundColor = '#f0f0f0'
        })
        emojiItem.addEventListener('mouseleave', () => {
          emojiItem.style.backgroundColor = 'transparent'
        })
        emojiItem.addEventListener('click', (e) => {
          e.preventDefault()
          e.stopPropagation()
          const start = textarea.selectionStart
          const end = textarea.selectionEnd
          const text = textarea.value
          textarea.value = text.substring(0, start) + emoji + text.substring(end)
          textarea.selectionStart = textarea.selectionEnd = start + emoji.length
          textarea.focus()
          textarea.dispatchEvent(new Event('input', { bubbles: true }))
          emojiPicker.style.display = 'none'
          this.emojiPickerVisible = false
        })
        emojiPicker.appendChild(emojiItem)
      })
      
      emojiBtn.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        this.emojiPickerVisible = !this.emojiPickerVisible
        emojiPicker.style.display = this.emojiPickerVisible ? 'flex' : 'none'
      })
      
      document.addEventListener('click', (e) => {
        if (!emojiPicker.contains(e.target) && !emojiBtn.contains(e.target)) {
          emojiPicker.style.display = 'none'
          this.emojiPickerVisible = false
        }
      })
      
      textareaWrapper.appendChild(emojiBtn)
      textareaWrapper.appendChild(emojiPicker)
      
      this.injectEmojiStyles(shadowRoot)
    },
    injectEmojiStyles(shadowRoot) {
      let styleTag = shadowRoot.getElementById('cwd-emoji-style')
      if (!styleTag) {
        styleTag = document.createElement('style')
        styleTag.id = 'cwd-emoji-style'
        shadowRoot.appendChild(styleTag)
      }
      
      styleTag.textContent = `
        .cwd-emoji-btn {
          font-size: 18px !important;
          border: none !important;
          background: transparent !important;
          box-shadow: none !important;
          outline: none !important;
        }
        .cwd-emoji-btn:hover {
          background-color: transparent !important;
        }
        [data-theme="dark"] .cwd-emoji-btn {
          border: none !important;
          background: transparent !important;
        }
        [data-theme="dark"] .cwd-emoji-btn:hover {
          background-color: transparent !important;
        }
        .cwd-emoji-picker {
          background: #fff !important;
          border-color: #e4e7ed !important;
        }
        [data-theme="dark"] .cwd-emoji-picker {
          background: #2a2a2a !important;
          border-color: #4c4d4e !important;
        }
        .cwd-emoji-picker span:hover {
          background-color: #f0f0f0 !important;
        }
        [data-theme="dark"] .cwd-emoji-picker span:hover {
          background-color: #3a3a3a !important;
        }
      `
    },
    setupFormValidation(shadowRoot) {
      const submitBtn = shadowRoot.querySelector('.cwd-btn-primary, button[type="submit"], .submit-button')
      if (!submitBtn) return
      
      if (submitBtn._hasValidation) return
      submitBtn._hasValidation = true
      
      const validateInputs = () => {
        const inputs = shadowRoot.querySelectorAll('input[type="text"], input[type="email"], input[type="url"]')
        let hasError = false
        
        inputs.forEach((input) => {
          input.classList.remove('cwd-input-error')
          void input.offsetWidth
        })
        
        inputs.forEach((input, index) => {
          if (index === 0 && !input.value.trim()) {
            input.classList.add('cwd-input-error')
            hasError = true
          }
          if (index === 1 && !input.value.trim()) {
            input.classList.add('cwd-input-error')
            hasError = true
          }
        })
        
        return hasError
      }
      
      submitBtn.addEventListener('mouseenter', validateInputs)
      submitBtn.addEventListener('touchstart', validateInputs, { passive: true })
      submitBtn.addEventListener('click', (e) => {
        const hasError = validateInputs()
        if (hasError) {
          e.preventDefault()
          e.stopPropagation()
        }
      }, true)
      
      this.injectValidationStyles(shadowRoot)
    },
    injectValidationStyles(shadowRoot) {
      let styleTag = shadowRoot.getElementById('cwd-validation-style')
      if (!styleTag) {
        styleTag = document.createElement('style')
        styleTag.id = 'cwd-validation-style'
        shadowRoot.appendChild(styleTag)
      }
      
      styleTag.textContent = `
        @keyframes cwd-shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        .cwd-input-error {
          border-bottom-color: #f56c6c !important;
          background-color: #fef0f0 !important;
          animation: cwd-shake 0.5s ease-in-out;
        }
        .cwd-input-error::placeholder {
          color: #f56c6c !important;
        }
        [data-theme="dark"] .cwd-input-error {
          border-bottom-color: #f56c6c !important;
          background-color: rgba(245, 108, 108, 0.1) !important;
        }
      `
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
