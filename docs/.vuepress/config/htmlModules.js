// const pageTop = `
// <div class="znote-ad znote-ad-page-top">
//   <a href="https://github.com/zpj80231/znote" target="_blank" rel="noopener noreferrer">
//     <span class="znote-ad-title">广告位招租</span>
//     <span class="znote-ad-desc">欢迎投放广告，联系站长获取详情</span>
//   </a>
// </div> `

const pageTop = `
<div class="pin-adv">
  <a href="https://easysearch.cn" target="_blank" rel="noopener noreferrer">
    <img class="no-zoom" style="border-radius:3px;" src="/znote/donate/easySearch-banner-2.png" alt="EasySearch">
  </a>
</div> `

const sidebarTop = `
<div class="pin-adv pin-adv-sidebar">
  <a href="https://easysearch.cn" target="_blank" rel="noopener noreferrer">
    <img class="no-zoom" height="60" width="224" src="/znote/donate/easySearch-banner-1.webp" alt="EasySearch">
  </a>
</div> `

module.exports = {
  // 放在页面文章顶部，如 pageTop
  pageT: '',
  // 未配置 默认所有页面显示, article: 仅文章显示, custom: 仅自定义页显示
  pageTshowMode: 'article',
  sidebarT: '',
  // 未配置 默认所有页面显示, article: 仅文章显示, custom: 仅自定义页显示
  sidebarTshowMode: 'article',
  sidebarB: '',
  pageB: '',
  windowLB: '',
  windowRB: ''
}
