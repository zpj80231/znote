---
home: true
heroImage: /vuepress/topic.png
heroImageStyle: {
  maxWidth: '800px',
  width: '100%',
  height: '15%',,
  display: block,
  margin: '24% auto -26% auto',
  border: '1px dashed #000',
  box-shadow: '8px 8px 20px #022',
  borderRadius: '1rem',
  background: 'rgba(0, 0, 0, 0.8) none repeat scroll !important',
  transform: scale(0.8,0.8),
}
isShowTitleInHome: true
actionText: 开启进阶之路
actionLink: /categories/
features:
- title: 
  details: 把所有的不快给昨天
- title: 
  details: 把所有的努力给今天
- title: 
  details: 把所有的希望给明天
footer: MIT Licensed | Copyright © 2018-present Evan You
---

<!-- <h3 class='home_h3'>&nbsp;</h3> -->

<Clock/>

::: tip 昨天今天明天

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

春梦无痕，秋夜缠绵 <br/>
如歌岁月，似水流年 <br/>

但愿到了明天 <br/>
今天已成昨天 <br/>
而我依然在你心间  

:::



<style>
.wrap {
    width: 100%;
    height: 200px;
    min-height: 10vh;
    display: flex;
    position:fixed;
    top:-120%;
    left: -1%;
    justify-content: center;
    align-items: center;
}


@media screen and (max-width: 960px){
  .wrap {
    top:-114%;
    transform: scale(0.68,0.58);
  }
  .clock {
    background: rgba(0, 0, 0, 0) none repeat scroll !important;
    background-image: url() !important;
  }
  .home img {    
    margin: 24% auto -24% auto !important;
  }
  .home .feature {
    width: 100%;
    text-align:center;
    padding: 0;
  }
}

</style>