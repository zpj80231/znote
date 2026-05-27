---
home: true
heroImage: ''
faceImage: '/img/site/head.png'
heroImageStyle: {
  max-width: '500px',
  height: '280px',
  display: block,
  margin: '3% auto',
  box-shadow: '8px 8px 20px #022',
  borderRadius: '10px',
}
isShowTitleInHome: true
actionText: '开启进阶之路'
actionLink: /views/
features:
- title: 
  details: 把所有的不快给昨天
- title: 
  details: 把所有的努力给今天
- title: 
  details: 把所有的希望给明天
footer: MIT Licensed | Copyright © 2018-present Evan You
---

::: tip 人的一生能有几天

问一问，人的一生能有几天 <br/>
算一算，人的一生不过三天 <br/>

跑过去的是昨天 <br/>
奔过来的是明天 <br/>
正在走的是今天 <br/>

不要忘记昨天 <br/>
认真计划明天 <br/>
好好把握今天 <br/>

但愿到了明天 <br/>
今天已成昨天 <br/>
而你依然在我身边 <br/>

啊。<br/>
春梦无痕，秋夜缠绵 <br/>
如歌岁月，似水流年 <br/>

但愿到了明天 <br/>
今天已成昨天 <br/>
而我依然在你心间  

:::

<script>
export default {
  data() {
    return {}
  },
  mounted() {
    this.setRandomHeroImage();
  },
  methods: {
    setRandomHeroImage() {
      const images = [
        '/znote/img/site/index-read.webp',
        '/znote/img/site/index-snoopy-1.webp',
        '/znote/img/site/index-snoopy-2.webp',
        '/znote/img/site/index-snoopy-3.webp',
        '/znote/img/site/index-snoopy-4.webp',
        '/znote/img/site/index-snoopy-5.webp',
        '/znote/img/site/index-snoopy-6.webp',
        '/znote/img/site/index-snoopy-7.webp',
        '/znote/img/site/index-snoopy-8.webp'
      ]
      const selectedImage = images[Math.floor(Math.random() * images.length)]

      // 找到 hero 容器
      const heroContainer = document.querySelector('.home .hero')
      if (!heroContainer) return

      // 查找已有的 <img>
      let heroImageElement = heroContainer.querySelector('img')

      // 如果 frontmatter heroImage 为空时页面不会渲染 <img>，此处动态创建
      if (!heroImageElement) {
        heroImageElement = document.createElement('img')
        heroImageElement.className = 'heroImage'
        heroContainer.insertBefore(heroImageElement, heroContainer.firstChild)
      }

      // 应用 frontmatter 的样式到动态图片
      const styleObj = (this.$page && this.$page.frontmatter && this.$page.frontmatter.heroImageStyle) || {}
      Object.keys(styleObj || {}).forEach(key => {
        const value = styleObj[key]
        try {
          if (key in heroImageElement.style) {
            heroImageElement.style[key] = value
          } else {
            heroImageElement.style.setProperty(key, value)
          }
        } catch (e) {}
      })

      heroImageElement.src = selectedImage
      heroImageElement.alt = 'hero'
    }
  }
}
</script>

<style lang="stylus">
.home .content__default:not(.custom) {
  max-width: 100% !important;
  margin: 0  !important;
  padding: 0 !important;
}
.home .hero h1 {
    display: none;
}
.home .hero img {
   transform: scale(0.8,0.8) !important;
   transition: all 1s!important;
}
.home .hero img:hover {
   transform: scale(0.9,0.9) !important;
   transition:all 2s !important;
}
.home .features {
    text-align: center;
}
.home .feature p {
    color: #476582 !important;
}
.home .hero .description {
    color: #476582 !important;
}
@media screen and (max-width: 540px) and (min-width: 481px){
  .home .hero img {
    max-width: 380px !important;
  }
}

@media screen and (max-width: 480px) and (min-width: 0px){
  .home .hero img {    
    max-width: 100% !important;
  }
  .home .feature {
    width: 100%;
    text-align: center;
    color: rgb(71, 101, 130) !important;
    padding: 5px !important;
    margin: -12px;
    margin-left: 0px;
  }
}
</style>
