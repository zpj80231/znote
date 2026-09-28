import './public/iconfont/iconfont.css'

/**
 * 修复「点击正文锚点 / 右侧目录不跳转」（Chrome ≥ 150 才出现）
 *
 * 根因（实测版本边界：≤149 正常，≥150 失效）：
 *   Chrome 150 起 window.scrollTo() / scrollBy() / scroll() 的返回值从 undefined 变成了 Promise
 *   （实测 147/148/149 → undefined；150/151/152/153/154 → [object Promise]）。
 *   而 vuepress-plugin-smooth-scroll 覆盖 scrollBehavior 的写法是 `return window.scrollTo({...})`，
 *   于是它的返回值就成了一个 Promise。vue-router 的 handleScroll 里恰好有这么一段：
 *       var i = behavior.call(router, to, from, isPop ? savedPosition : null)
 *       i && (typeof i.then === 'function'
 *              ? i.then(v => scrollToPosition(v, savedPosition))   // ← 把返回值当异步滚动结果
 *              : scrollToPosition(i, savedPosition))
 *   - Chrome ≤ 149：i 是 undefined（假值）→ 直接 return，浏览器自己的锚点跳转正常生效；
 *   - Chrome ≥ 150：i 是 Promise（有 .then）→ vue-router 等它 resolve 后**又滚了一次**
 *     window.scrollTo({ left: 0, top: savedPosition.y })（没有 behavior = 瞬间跳），
 *     把页面按回点击前的位置，并取消掉浏览器正在进行的锚点滚动
 *     → 表现为「hash 变了但页面不动 / 点了没反应」。
 *   该链条成立的前提：同文档片段导航（点 <a href="#x">）在 Chrome 上会触发 popstate，
 *   vue-router 因此按 history 前进/后退处理（isPop = true）并把 savedPosition 传进来。
 *
 * 方案：
 *   自己安装一份「hash 优先」的 scrollBehavior，并且**一律返回 false**（假值），
 *   这样 vue-router 既不会走 thenable 分支，也不会再二次滚动；滚动全部自己做。
 *   enhanceApp 的执行顺序是「站点 enhanceApp.js → 主题 → 插件」，直接赋值会被插件覆盖，
 *   所以必须等 router.onReady 之后再覆盖。
 *
 * 说明：不要改成 `return window.scrollTo(...)` 之类的写法 —— 在 Chrome ≥ 150 上它返回 Promise，
 *      会被 vue-router 当成异步 scrollBehavior 结果再滚一次。
 */
const installScrollBehavior = (Vue, router) => {
    router.options.scrollBehavior = (to, from, savedPosition) => {
        // 1. 有 hash：一律以锚点为准。自己做滚动并返回 false，避免 vue-router 二次滚动
        if (to.hash) {
            // @vuepress/plugin-active-header-links 同步右侧高亮时会临时置位，此时不要滚动
            if (Vue.$vuepress.$get('disableScrollBehavior')) return false

            const id = decodeURIComponent(to.hash).slice(1)
            const target = document.getElementById(id) || document.querySelector(`[name='${id}']`)
            if (target) {
                const docTop = document.documentElement.getBoundingClientRect().top
                // 导航栏是 fixed 的，留出它的高度 + 一点余量，避免标题贴在最顶端被挡住
                const navEl = document.querySelector('.navbar')
                const offset = (navEl ? navEl.getBoundingClientRect().height : 0) + 16
                window.scrollTo({
                    top: Math.max(0, target.getBoundingClientRect().top - docTop - offset),
                    behavior: 'smooth'
                })
                return false
            }
        }

        // 2. 前进/后退：恢复该历史记录保存的滚动位置
        if (savedPosition) {
            window.scrollTo({ top: savedPosition.y, behavior: 'smooth' })
            return false
        }

        // 3. 普通跳转：回到顶部
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return false
    }
}

export default ({
Vue,      // VuePress 应用中使用的 Vue 版本
options,  // 根 Vue 实例的选项
router,   // 应用的路由实例
siteData  // 站点元数据
}) => {
    // 解决中文分类、标签直接访问时的 404 问题
    const DECODE_PATH_PREFIXES = ['/tag/', '/categories/']
    const shouldDecodePath = (path) => {
        return DECODE_PATH_PREFIXES.some(prefix => path.startsWith(prefix))
    }
    router.beforeEach((to, from, next) => {
        const currentPath = to.path
        const decodedPath = decodeURIComponent(currentPath)
        if (shouldDecodePath(currentPath) && currentPath !== decodedPath) {
            next(decodedPath)
        } else {
            next()
        }
    })

    // 修正锚点跳转（原委见文件顶部说明）
    installScrollBehavior(Vue, router)
    router.onReady(() => installScrollBehavior(Vue, router))
}
