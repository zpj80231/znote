# znote 本地 Reco 主题说明

这个目录不是从零实现的新主题，也不是准备单独发布的通用 VuePress 主题。

`docs/.vuepress/theme` 是把 `vuepress-theme-reco@1.2.2` 的主题源码引入到仓库后，针对 znote 的内容结构、阅读习惯、评论系统和视觉偏好做的本地改造版本。上游主题能力仍然来自 Reco，包括博客首页、分类、标签、时间线、分页、暗色模式、评论接入等基础能力。

## 来源

- 上游主题：`vuepress-theme-reco@1.2.2`
- 本地源码目录：`docs/.vuepress/theme`
- 项目配置入口：`docs/.vuepress/config.js`
- 当前主题包信息：`docs/.vuepress/theme/package.json`

## 本地改造点

### 全局布局与主题容器

- 在 `components/Common.vue` 中接管主题外层容器，增加首屏加载页 `LoadingPage`，首页首次访问时显示站点标题、描述和 Loading 动画。
- 将评论渲染统一放到 `Common.vue` 中，而不是只绑定在文章页组件里，方便普通页面、加密页面和文章页面复用同一套评论显示逻辑。
- 保留 Valine 支持，同时新增 CWD 评论系统支持。只要 `themeConfig.cwdConfig` 配置了 `siteId` 和 `serverUrl`，页面就会渲染 `CwdComments`。
- 增加 `isComment` 控制项，时间线等页面可以显式关闭评论。
- 新增 `themeConfig.isSidebarOpen`，支持从站点配置控制 PC 端侧边栏默认展开状态。
- 移动端默认不展开侧边栏，避免进入页面后内容区域被导航遮挡。
- 新增 `themeConfig.disableSwipe`，允许禁用移动端左滑唤出侧边栏。
- 调整加密页面、页面级密码、加载状态的组合逻辑，避免未解锁内容或加载中的内容提前显示。

### 侧边栏与导航

- 在 `components/SidebarButton.vue` 中让侧边栏按钮也支持 PC 端显示，按钮固定在导航栏下方，便于宽屏阅读时随时收起或展开侧边栏。
- 在 `styles/mobile.styl` 中补充 PC 端侧边栏收起后的布局适配：隐藏侧边栏、隐藏遮罩、页面居中、评论区 padding 跟随调整。
- 在 `components/SidebarLinks.vue` 中改造侧边栏激活逻辑，修复带完整路径或 hash 的链接跳转后，侧边栏标题不能正确跟随当前文章标题的问题。
- 进入文章或 hash 路由后，自动点击并定位匹配的侧边栏链接，再滚动到对应锚点附近。
- 当激活的侧边栏条目超出可视区域时，自动滚动侧边栏，让当前条目保持在视口内。

### 文章页体验

- 在 `components/Page.vue` 中为文章标题、正文、编辑链接、上下篇导航和底部插槽增加 `ModuleTransition` 过渡。
- 文章标题下方增加分隔线，并保留 `PageInfo` 元信息展示。
- 上一篇、下一篇导航补充左右箭头，增强方向感。
- 新增 `components/RecentlyUpdateArticle.vue`，在文章页底部显示最近更新文章列表，默认展示 3 篇，并排除当前文章和置顶文章。
- 最近更新模块支持 `themeConfig.updateBar.moreArticle` 配置更多文章入口，默认跳转到 `/timeline/`。
- `themeConfig.updateBar.showToArticle === false` 时，可以关闭文章页底部最近更新模块。

### 评论与访问量

- `components/PageInfo.vue` 中的访问量显示改为跟随 `themeConfig.commentsSolution === 'valine'`，避免在不使用 Valine 时仍显示 Valine 访问统计。
- `components/Footer.vue` 中的全站访问量只在配置了 `valineConfig` 时显示。
- CWD 评论通过 `cwdConfig` 接入，和 Valine 一样遵守页面 frontmatter 的 `isShowComments: false`、首页禁用评论等规则。
- 评论区样式在有无侧边栏、PC 和移动端下分别调整 padding，避免评论内容与侧边栏或正文错位。

### 首页与博客首页

- `components/Home.vue` 和 `components/HomeBlog.vue` 保留 Reco 的首页、博客首页结构，同时改成使用本地 `ModuleTransition` 与本地过渡 mixin。
- 首页标题默认文案改为更贴合个人站点的「午后南杂」，并支持 `isShowTitleInHome: false` 隐藏首页标题。
- 博客首页使用本地背景图 `images/home-bg.jpg`，背景层增加 mask，保证文字可读性。
- 博客首页右侧信息栏保留个人信息、分类、标签、友链，并改造成 sticky 布局，滚动时保持可见。
- 友链弹窗在 `components/FriendLink.vue` 中重新处理位置，避免弹窗超出右侧视口。

### [时间线页面

- `layouts/TimeLines.vue` 的提示文案改为 `Yesterday Once More!`。
- 时间线页面关闭评论，避免时间线作为列表页出现评论区。
- 重构时间线条目样式：文章按年份分组，每篇文章使用圆角条目、hover 位移和月份色块。
- 根据文章日期月份生成 `month-1` 到 `month-12` 的 class，不同月份使用不同背景色和节点颜色。
- 调整深色模式下的月份配色，让暗色主题里时间]()线节点和条目仍有足够对比度。

### 404 页面与加载页

- 新增 `components/LoadingPage.vue`，展示站点标题、描述和逐字跳动的 Loading 文案。
- `layouts/404.vue` 保留腾讯公益 404 能力，同时把 `homePageUrl` 指向当前站点 `base`。
- 404 页面增加 5 秒后自动跳回站点首页的逻辑。
- 多次调整 404 的结构和样式，使它和本地主题容器保持一致。

### 深色模式与主题模式

- 新增本地 `styles/mode.styl`，统一 CSS 变量：背景色、文字色、边框色、代码色、遮罩色、阴影等。
- 在 `styles/theme.styl`、首页、友链、模式选择器等位置引入本地模式样式。
- 改造 `components/Mode/ModePicker.vue`，使用本地 `setMode.js`，修复主题模式选择器默认行为。
- 模式选择器优先读取 `localStorage.mode`：`dark`、`light` 手动激活，未设置时走自动模式。

### 正文排版与代码块

- 全局基础字号从 `15px` 调整为 `16px`，提升正文阅读舒适度。
- 调整标题尺寸、标题间距和 `h2` 下边框，让长文结构更清晰。
- 正文行高从 `2.2` 调整为 `1.7`，减少段落过度稀疏的问题。
- 改造正文链接样式：使用可换行的内嵌高亮背景，hover 时扩大高亮区域。
- 为超长链接增加 `overflow-wrap: anywhere`、`word-break: break-word`，避免长 URL 撑破正文宽度。
- 排除目录和卡片列表中的链接高亮，避免影响组件原有样式。
- 代码块字号调整为 `13.6px`，并配合 `codeExpand` 插件相关提交优化代码块显示。
- 滚动条样式改为更中性的灰色圆角滚动条。

### 页脚与站点身份

- `components/Footer.vue` 的主题署名从官方 `vuepress-theme-reco@version` 改为 `Powered by znote`。
- 页脚作者优先使用 `themeConfig.author`，没有配置时回退到站点标题。
- 版权年份改为从 `themeConfig.startYear` 到当前年份。

### 依赖与兼容性

- `package.json` 中 Valine 从 `1.3.6` 升级到 `1.5.0`。
- 保留 Reco 原有的 VuePress 插件组合，包括返回顶部、代码提取、loading-page、分页、评论、medium-zoom、nprogress 和 blog 插件。
- 本地主题仍以 VuePress 1.x 和 Reco 1.2.2 的源码结构为基础维护。

## 维护说明

后续如果继续升级上游 `vuepress-theme-reco`，不要直接覆盖整个 `docs/.vuepress/theme` 目录。建议先对比上游源码和本地目录，再按上面的改造点逐项合并：

```bash
diff -qr node_modules/vuepress-theme-reco docs/.vuepress/theme
git log --oneline -- docs/.vuepress/theme
```

这个 README 只记录本仓库对 Reco 主题源码的本地个性化改造，不替代 Reco 官方文档。主题用法和原始配置项仍可参考 [vuepress-theme-reco 官方文档](https://vuepress-theme-reco.recoluan.com)。
