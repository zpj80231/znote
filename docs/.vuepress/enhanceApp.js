import './public/iconfont/iconfont.css'

export default ({
  Vue,      // the version of Vue being used in the VuePress app
  options,  // the options for the root Vue instance
  router,   // the router instance for the app
  siteData  // site metadata
}) => {
  // 全局处理 URL 解码，仅针对标签页面解决中文标签直接访问 404 问题
  router.beforeEach((to, from, next) => {
    const currentPath = to.path
    const decodedPath = decodeURIComponent(currentPath)
    
    // 只对标签页面进行 URL 解码处理，避免影响正常文档页面
    if (currentPath.startsWith('/tag/') && currentPath !== decodedPath) {
      next(decodedPath)
    } else {
      next()
    }
  })
}
