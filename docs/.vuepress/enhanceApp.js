import './public/iconfont/iconfont.css'

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
}
