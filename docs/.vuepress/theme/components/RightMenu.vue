<template>
  <aside class="right-menu-wrapper" :style="menuStyle" v-if="headers.length">
    <div class="right-menu-inner">
      <div class="right-menu-title">目录</div>
      <nav class="right-menu-content">
        <div
          v-for="item in headers"
          :key="item.slug"
          :class="[
            'right-menu-item',
            'level' + item.level,
            { active: item.slug === activeHash }
          ]"
        >
          <a :href="'#' + item.slug">{{ item.title }}</a>
        </div>
      </nav>
    </div>
  </aside>
</template>

<script>
export default {
  name: 'RightMenu',

  data () {
    return {
      activeHash: '',
      ticking: false,
      menuTop: null,
      menuLeft: null,
      containerObserver: null
    }
  },

  computed: {
    headers () {
      return this.$page.headers || []
    },
    menuStyle () {
      const style = {}
      if (this.menuTop !== null) {
        style.top = `${this.menuTop}px`
      }
      if (this.menuLeft !== null) {
        style.left = `${this.menuLeft}px`
      }
      return style
    }
  },

  mounted () {
    document.body.classList.add('has-right-menu')
    this.$nextTick(this.updateMenu)
    this.initContainerObserver()
    window.addEventListener('scroll', this.requestUpdateActiveHash, { passive: true })
    window.addEventListener('resize', this.requestUpdateActiveHash)
    window.addEventListener('hashchange', this.updateActiveHashFromHash)
  },

  beforeDestroy () {
    document.body.classList.remove('has-right-menu')
    window.removeEventListener('scroll', this.requestUpdateActiveHash)
    window.removeEventListener('resize', this.requestUpdateActiveHash)
    window.removeEventListener('hashchange', this.updateActiveHashFromHash)
    this.disconnectContainerObserver()
  },

  watch: {
    '$route' () {
      this.$nextTick(this.updateMenu)
    },
    activeHash () {
      this.$nextTick(this.scrollActiveItemIntoView)
    }
  },

  methods: {
    getHeaderElements () {
      return this.headers
        .map(item => document.getElementById(item.slug))
        .filter(Boolean)
    },
    updateActiveHashFromHash () {
      this.activeHash = decodeURIComponent(window.location.hash.slice(1))
      window.setTimeout(this.updateMenu, 350)
    },
    requestUpdateActiveHash () {
      if (this.ticking) return
      this.ticking = true
      window.requestAnimationFrame(() => {
        this.updateMenu()
        this.ticking = false
      })
    },
    updateMenu () {
      this.updateMenuPosition()
      this.updateActiveHashByScroll()
    },
    updateMenuPosition () {
      const contentEl = document.querySelector('.theme-reco-content')
      if (!contentEl) return

      const navEl = document.querySelector('.navbar')
      const navBottom = navEl ? navEl.getBoundingClientRect().bottom : 0
      const stickyTop = navBottom + 16
      const contentRect = contentEl.getBoundingClientRect()
      const contentTop = contentRect.top + window.pageYOffset
      const viewportWidth = document.documentElement.clientWidth || window.innerWidth
      const menuWidth = 230
      const gap = 16

      const top = Math.max(stickyTop, contentTop - window.pageYOffset)
      const left = Math.min(contentRect.right + gap, viewportWidth - menuWidth - gap)

      this.menuTop = Math.round(top)
      this.menuLeft = Math.round(Math.max(gap, left))
    },
    updateActiveHashByScroll () {
      const headerElements = this.getHeaderElements()
      if (!headerElements.length) return

      const offset = 90
      let current = headerElements[0]
      for (let i = 0; i < headerElements.length; i++) {
        const rect = headerElements[i].getBoundingClientRect()
        if (rect.top <= offset) {
          current = headerElements[i]
        } else {
          break
        }
      }

      this.activeHash = decodeURIComponent(current.id)
    },
    scrollActiveItemIntoView () {
      const container = this.$el && this.$el.querySelector('.right-menu-content')
      if (!container) return
      const activeItem = container.querySelector('.right-menu-item.active')
      if (!activeItem) return

      const containerRect = container.getBoundingClientRect()
      const itemRect = activeItem.getBoundingClientRect()
      const padding = 8
      const itemTop = itemRect.top - containerRect.top + container.scrollTop
      const itemBottom = itemTop + itemRect.height
      const viewTop = container.scrollTop
      const viewBottom = viewTop + container.clientHeight

      let target = null
      if (itemTop < viewTop) {
        target = Math.max(0, itemTop - padding)
      } else if (itemBottom > viewBottom) {
        target = itemBottom - container.clientHeight + padding
      }
      if (target === null) return

      if (typeof container.scrollTo === 'function') {
        container.scrollTo({ top: target, behavior: 'smooth' })
      } else {
        container.scrollTop = target
      }
    },
    initContainerObserver () {
      const container = document.querySelector('.theme-container')
      if (!container || typeof MutationObserver === 'undefined') return

      this.containerObserver = new MutationObserver(() => {
        window.setTimeout(this.updateMenu, 220)
      })
      this.containerObserver.observe(container, {
        attributes: true,
        attributeFilter: ['class']
      })
    },
    disconnectContainerObserver () {
      if (!this.containerObserver) return
      this.containerObserver.disconnect()
      this.containerObserver = null
    }
  }
}
</script>

<style lang="stylus">
$rightMenuWidth = 230px

.right-menu-wrapper
  position fixed
  top ($navbarHeight + 1rem)
  right 1rem
  width $rightMenuWidth
  font-size 0.82rem
  z-index 8

.right-menu-inner
  max-height calc(100vh - 5.6rem)
  overflow hidden
  border-left 1px solid var(--border-color)
  background var(--background-color)

.right-menu-title
  padding 0 0 0.7rem 1rem
  color var(--text-color)
  font-size 0.95rem
  font-weight 600

.right-menu-content
  max-height calc(100vh - 8rem)
  overflow hidden
  padding 0.2rem 0
  &:hover
    overflow-y auto
  &::-webkit-scrollbar
    width 3px
  &::-webkit-scrollbar-thumb
    background-color rgba(127, 127, 127, 0.3)

.right-menu-item
  position relative
  padding 0.28rem 0.75rem 0.28rem 1rem
  overflow hidden
  white-space nowrap
  text-overflow ellipsis
  line-height 1.35
  &.level3
    padding-left 1.65rem
  &.level4
    padding-left 2.3rem
  &.level5
    padding-left 2.95rem
  &.level6
    padding-left 3.6rem
  &.active
    &:before
      content ''
      position absolute
      top 0.42rem
      left 0
      width 3px
      height 0.9rem
      border-radius 0 3px 3px 0
      background $accentColor
    a
      color $accentColor
      opacity 1
      font-weight 600
  a
    display inline-block
    width 100%
    overflow hidden
    color var(--text-color)
    opacity 0.72
    text-overflow ellipsis
    white-space nowrap
    &:hover
      color $accentColor
      opacity 1

@media (max-width: 1280px)
  .right-menu-wrapper
    display none

@media (min-width: 1281px)
  body.has-right-menu .theme-reco-content .table-of-contents
    display none

</style>
