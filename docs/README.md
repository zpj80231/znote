---
home: true
heroImage: '/vuepress/topic.png'
faceImage: '/vuepress/head.png'
heroImageStyle: {
  maxWidth: '800px',
  width: '100%',
  height: '15%',,
  display: block,
  margin: '24% auto -18% auto',
  border: '1px dashed #000',
  box-shadow: '8px 8px 20px #022',
  borderRadius: '1rem',
  background: 'rgba(0, 0, 0, 0.8) none repeat scroll !important',
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
.home .content__default:not(.custom) {
  max-width: 100% !important;
  margin: 0  !important;
  padding: 0 !important;
}
.home .hero h1 {
    display: none;
}
.home img {
   transform: scale(0.8,0.8) !important;
}
.home .feature p {
    color: #476582 !important;
}
.home .hero .description {
    color: #476582 !important;
}
.wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 200px;
    min-height: 10vh;
    background: transparent none repeat scroll!important;
    position: fixed;
    top: -120%;
    left: -1%;
}


@media screen and (max-width: 960px){
  .wrap {
    top:-107%;
    transform: scale(0.68,0.58);
  }
  .clock {
    background: rgba(0, 0, 0, 0) none repeat scroll !important;
    background-image: url() !important;
  }
  .home img {    
    margin: 24% auto -6% auto !important;
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

<script type="text/javascript">
  // mounted: {
  //   var hero = document.getElementByclassName("hero");

  // },
  // methods: {
  //   $('#sky').on('mousemove', function(e) {
  // //公式
  //     var offsetX = e.clientX / window.innerWidth - 0.5,
  //         offsetY = e.clientY / window.innerHeight - 0.5;
  //   var _left = -40 * offsetX;    //如果想动的幅度更大，可以调整 -40 的值
  //   var _top = -40 * offsetY;     //如果想动的幅度更大，可以调整 -40 的值
  //   //应用公式
  //   $('#sky img').css('left',60+_left*0.3).css('top',_top*0.3);  //将您的left值和top值先+此数值，*的小数越大，动的越大，否则越小
  //   $('#sky span').css('left',60+_left*3).css('top',180+_top*3); //将您的left值和top值先+此数值，*的小数越大，动的越大，否则越小
  //   $('#sky p').css('left',50+_left*1.5).css('top',230+_top*1.5); //将您的left值和top值先+此数值，*的小数越大，动的越大，否则越小
  // });
  // }
</script>