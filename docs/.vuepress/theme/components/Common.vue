<template>
  <div
    class="theme-container"
    :class="pageClasses"
    @touchstart="onTouchStart"
    @touchend="onTouchEnd">
    <div v-if="!absoluteEncryption">
      <transition name="fade">
        <LoadingPage v-show="firstLoad" class="loading-wrapper" />
      </transition>
      <transition name="fade">
        <Password v-show="!isHasKey" class="password-wrapper-out" key="out" />
      </transition>
      <div :class="{ 'hide': firstLoad || !isHasKey }">
        <Navbar
        v-if="shouldShowNavbar"
        @toggle-sidebar="toggleSidebar"/>

        <div
          class="sidebar-mask"
          @click="toggleSidebar(false)"></div>

        <Sidebar
          :items="sidebarItems"
          @toggle-sidebar="toggleSidebar">
          <div
            v-if="sidebarSlotTop && isShowSidebarSlotTop"
            class="html-module-slot sidebar-slot sidebar-slot-top"
            v-html="sidebarSlotTop"
            slot="top"
          />
          <slot
            name="sidebar-top"
            slot="top"/>
          <div
            v-if="sidebarSlotBottom && isShowSidebarSlotBottom"
            class="html-module-slot sidebar-slot sidebar-slot-bottom"
            v-html="sidebarSlotBottom"
            slot="bottom"
          />
          <slot
            name="sidebar-bottom"
            slot="bottom"/>
        </Sidebar>

        <Password v-show="!isHasPageKey" :isPage="true" class="password-wrapper-in" key="in"></Password>
        <div :class="{ 'hide': !isHasPageKey }">
          <slot></slot>
          <Comments v-if="shouldShowValine" :isShowComments="shouldShowValine"/>
          <CwdComments v-if="shouldShowCWD" :isShow="shouldShowCWD"/>
        </div>
      </div>
    </div>
    <div v-else>
      <transition name="fade">
        <LoadingPage v-if="firstLoad" />
        <Password v-else-if="!isHasKey" />
        <div v-else>
          <Navbar
          v-if="shouldShowNavbar"
          @toggle-sidebar="toggleSidebar"/>

          <div
            class="sidebar-mask"
            @click="toggleSidebar(false)"></div>

          <Sidebar
            :items="sidebarItems"
            @toggle-sidebar="toggleSidebar">
            <div
              v-if="sidebarSlotTop && isShowSidebarSlotTop"
              class="html-module-slot sidebar-slot sidebar-slot-top"
              v-html="sidebarSlotTop"
              slot="top"
            />
            <slot
              name="sidebar-top"
              slot="top"/>
            <div
              v-if="sidebarSlotBottom && isShowSidebarSlotBottom"
              class="html-module-slot sidebar-slot sidebar-slot-bottom"
              v-html="sidebarSlotBottom"
              slot="bottom"
            />
            <slot
              name="sidebar-bottom"
              slot="bottom"/>
          </Sidebar>

          <Password v-if="!isHasPageKey" :isPage="true"></Password>
          <div v-else>
            <slot></slot>
            <Comments v-if="shouldShowValine" :isShowComments="shouldShowValine"/>
            <CwdComments v-if="shouldShowCWD" :isShow="shouldShowCWD"/>
          </div>
        </div>
      </transition>
    </div>
    <div
      v-if="windowSlotLeftBottom"
      v-show="showWindowSlotLeftBottom"
      class="custom-html-window custom-html-window-lb"
    >
      <div class="custom-html-window-inner">
        <button class="custom-html-window-close" type="button" aria-label="关闭" @click="showWindowSlotLeftBottom = false">×</button>
        <div v-html="windowSlotLeftBottom" />
      </div>
    </div>
    <div
      v-if="windowSlotRightBottom"
      v-show="showWindowSlotRightBottom"
      class="custom-html-window custom-html-window-rb"
    >
      <div class="custom-html-window-inner">
        <button class="custom-html-window-close" type="button" aria-label="关闭" @click="showWindowSlotRightBottom = false">×</button>
        <div v-html="windowSlotRightBottom" />
      </div>
    </div>
  </div>
</template>

<script>
import md5 from 'md5'
import Navbar from '@theme/components/Navbar'
import Sidebar from '@theme/components/Sidebar'
import LoadingPage from '@theme/components/LoadingPage'
import { resolveSidebarItems } from '@theme/helpers/utils'
import Password from '@theme/components/Password'
import { setTimeout } from 'timers'

export default {
  components: { Sidebar, Navbar, LoadingPage, Password },

  props: {
    sidebar: {
      type: Boolean,
      default: true
    },
    isComment: {
      type: Boolean,
      default: true
    }
  },

  data () {
    return {
      isSidebarOpen: true,
      isHasKey: true,
      isHasPageKey: true,
      firstLoad: true,
      showWindowSlotLeftBottom: true,
      showWindowSlotRightBottom: true
    }
  },

  computed: {
    absoluteEncryption () {
      return this.$themeConfig.keyPage && this.$themeConfig.keyPage.absoluteEncryption === true
    },
    shouldShowValine () {
      const valineConfig = this.$themeConfig.valineConfig
      if (!valineConfig) return false
      const frontmatter = this.$page.frontmatter || {}
      const { isShowComments, home } = frontmatter
      return !(
        this.isComment == false ||
        isShowComments == false ||
        home == true
      )
    },
    shouldShowCWD () {
      const cwdConfig = this.$themeConfig.cwdConfig
      if (!cwdConfig || !cwdConfig.serverUrl || !cwdConfig.siteId) {
        return false
      }
      const frontmatter = this.$page.frontmatter || {}
      const { isShowComments, home } = frontmatter
      const result = !(
        this.isComment == false ||
        isShowComments == false ||
        home == true
      )
      return result
    },
    sidebarSlotTop () {
      return this.getHtmlModule('sidebarT')
    },
    sidebarSlotBottom () {
      return this.getHtmlModule('sidebarB')
    },
    windowSlotLeftBottom () {
      return this.getHtmlModule('windowLB')
    },
    windowSlotRightBottom () {
      return this.getHtmlModule('windowRB')
    },
    isShowSidebarSlotTop () {
      return this.getHtmlModuleShowStatus('sidebarTshowMode')
    },
    isShowSidebarSlotBottom () {
      return this.getHtmlModuleShowStatus('sidebarBshowMode')
    },
    shouldShowNavbar () {
      const { themeConfig } = this.$site
      const { frontmatter } = this.$page

      if (
        frontmatter.navbar === false ||
        themeConfig.navbar === false
      ) return false

      return (
        this.$title ||
        themeConfig.logo ||
        themeConfig.repo ||
        themeConfig.nav ||
        this.$themeLocaleConfig.nav
      )
    },

    shouldShowSidebar () {
      const { frontmatter } = this.$page
      return (
        this.sidebar !== false &&
        !frontmatter.home &&
        frontmatter.sidebar !== false &&
        this.sidebarItems.length
      )
    },

    sidebarItems () {
      return resolveSidebarItems(
        this.$page,
        this.$page.regularPath,
        this.$site,
        this.$localePath
      )
    },

    pageClasses () {
      const userPageClass = this.$frontmatter.pageClass
      return [
        {
          'no-navbar': !this.shouldShowNavbar,
          'sidebar-open': !this.isSidebarOpen,
          'no-sidebar': !this.shouldShowSidebar
        },
        userPageClass
      ]
    }
  },

  mounted () {
    if (this.$site && this.$site.themeConfig) {
      const { themeConfig } = this.$site
      if (this.isPc()) {
        this.isSidebarOpen = themeConfig.isSidebarOpen
      } else {
        this.isSidebarOpen = true
      }
    }

    this.$router.afterEach(() => {
      if (!this.isPc()) {
        this.isSidebarOpen = true
      }
      if (this.$frontmatter && this.$frontmatter.isSidebarOpen) {
        this.isSidebarOpen = this.$frontmatter.isSidebarOpen
      }
    });

    this.hasKey()
    this.hasPageKey()
    this.handleLoading()
  },

  methods: {
    getHtmlModule (module) {
      const { htmlModules } = this.$themeConfig
      return htmlModules ? htmlModules[module] : ''
    },
    getHtmlModuleShowStatus (prop) {
      const { htmlModules } = this.$themeConfig
      if (!htmlModules) return false
      if (htmlModules[prop] === 'article') {
        return this.isArticle()
      }
      if (htmlModules[prop] === 'custom') {
        return !this.isArticle()
      }
      return true
    },
    isArticle () {
      return this.$frontmatter.article !== false && this.$frontmatter.home !== true
    },
    isPc() {
      let flag = navigator.userAgent.match(/(phone|pod|iPhone|iPod|ios|Android|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)
      return !flag;
    },
    hasKey () {
      const keyPage = this.$themeConfig.keyPage
      if (!keyPage || !keyPage.keys || keyPage.keys.length === 0) {
        this.isHasKey = true
        return
      }

      let { keys } = keyPage
      keys = keys.map(item => md5(item))
      this.isHasKey = keys && keys.indexOf(sessionStorage.getItem('key')) > -1
    },
    hasPageKey () {
      let pageKeys = this.$frontmatter.keys
      if (!pageKeys || pageKeys.length === 0) {
        this.isHasPageKey = true
        return
      }

      pageKeys = pageKeys.map(item => md5(item))

      this.isHasPageKey = pageKeys.indexOf(sessionStorage.getItem(`pageKey${window.location.pathname}`)) > -1
    },
    toggleSidebar (to) {
      this.isSidebarOpen = typeof to === 'boolean' ? to : !this.isSidebarOpen
    },

    onTouchStart (e) {
      const themeConfig = this.$site && this.$site.themeConfig
      if (themeConfig && themeConfig.disableSwipe === true) return
      this.touchStart = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY
      }
    },

    onTouchEnd (e) {
      const themeConfig = this.$site && this.$site.themeConfig
      if (themeConfig && themeConfig.disableSwipe === true) return
      const dx = e.changedTouches[0].clientX - this.touchStart.x
      const dy = e.changedTouches[0].clientY - this.touchStart.y
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
        if (dx > 0 && this.touchStart.x <= 80) {
          this.toggleSidebar(true)
        } else {
          this.toggleSidebar(false)
        }
      }
    },

    handleLoading () {
      const time = this.$frontmatter.home && sessionStorage.getItem('firstLoad') == undefined ? 1000 : 0
      setTimeout(() => {
        this.firstLoad = false
        if (sessionStorage.getItem('firstLoad') == undefined) sessionStorage.setItem('firstLoad', false)
      }, time)
    }
  },

  watch: {
    $frontmatter (newVal, oldVal) {
      this.hasKey()
      this.hasPageKey()
    }
  }
}
</script>

<style lang="stylus" scoped>
.theme-container
  .loading-wrapper
    position absolute
    z-index 22
    top 0
    bottom 0
    left 0
    right 0
    margin auto
  .password-wrapper-out
    position absolute
    z-index 21
    top 0
    bottom 0
    left 0
    right 0
    margin auto
  .password-wrapper-in
    position absolute
    z-index 8
    top 0
    bottom 0
    left 0
    right 0
  .hide
    height 100vh
    overflow hidden
.theme-container.no-sidebar
  .comments-wrapper
    padding-left 2rem

.comments-wrapper
  padding 2rem 2rem 2rem 22rem
  max-width: $contentWidth;
  margin: 0 auto;
.sidebar-slot
  padding 0.75rem 1.5rem
  border-bottom 1px solid var(--border-color)
.sidebar-slot-bottom
  border-top 1px solid var(--border-color)
  border-bottom 0
.custom-html-window
  position fixed
  bottom 1.5rem
  z-index 20
  max-width 280px
  color var(--text-color)
.custom-html-window-lb
  left 1.5rem
.custom-html-window-rb
  right 1.5rem
.custom-html-window-inner
  position relative
  border 1px solid var(--border-color)
  border-radius 4px
  background var(--background-color)
  box-shadow 0 6px 18px rgba(0, 0, 0, .12)
  overflow hidden
.custom-html-window-close
  position absolute
  top 0.25rem
  right 0.35rem
  z-index 1
  border 0
  background transparent
  color var(--text-color)
  cursor pointer
  font-size 1rem
  line-height 1
@media (max-width: $MQNarrow)
  .theme-container.no-sidebar
    .comments-wrapper
      padding-left 2rem
  .comments-wrapper
    padding-left: 18.4rem;
@media (max-width: $MQMobile)
  .comments-wrapper
    padding-left: 2rem
  .custom-html-window
    display none
.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
