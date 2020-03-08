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
  //border: '1px dashed #000',
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


<!-- <script src="https://cdn.bootcss.com/canvas-nest.js/2.0.4/canvas-nest.js"></script> -->
<script>
  !
  function() {
      function n(n, e, t) {
          return n.getAttribute(e) || t
      }
      function e(n) {
          return document.getElementsByTagName(n)
      }
      function t() {
          var t = e("script"),
          o = t.length,
          i = t[o - 1];
          return {
              l: o,
              z: n(i, "zIndex", -1),
              o: n(i, "opacity", .7),   //透明度
              c: n(i, "color", "255, 102, 153"),   //颜色
              n: n(i, "count", 29)
          }
      }
      function o() {
          a = m.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
          c = m.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
      }
      function i() {
          r.clearRect(0, 0, a, c);
          var n, e, t, o, m, l;
          s.forEach(function(i, x) {
              for (i.x += i.xa, i.y += i.ya, i.xa *= i.x > a || i.x < 0 ? -1 : 1, i.ya *= i.y > c || i.y < 0 ? -1 : 1, r.fillRect(i.x - .5, i.y - .5, 1, 1), e = x + 1; e < u.length; e++) n = u[e],
              null !== n.x && null !== n.y && (o = i.x - n.x, m = i.y - n.y, l = o * o + m * m, l < n.max && (n === y && l >= n.max / 2 && (i.x -= .03 * o, i.y -= .03 * m), t = (n.max - l) / n.max, r.beginPath(), r.lineWidth = t / 2, r.strokeStyle = "rgba(" + d.c + "," + (t + .2) + ")", r.moveTo(i.x, i.y), r.lineTo(n.x, n.y), r.stroke()))
          }),
          x(i)
      }
      function check() {
        let flag = navigator.userAgent.match(/(phone|pod|iPhone|iPod|ios|Android|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)
        return !flag;
      }
      function showCa() {
        var check_flag = check();
        if(!check_flag) {
            return;
        }
      }
      window.onload = showCa;
      var a, c, u, m = document.createElement("canvas"),
      d = t(),
      l = "c_n" + d.l,
      r = m.getContext("2d"),
      x = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
      function(n) {
          window.setTimeout(n, 1e3 / 45)
      },
      w = Math.random,
      y = {
          x: null,
          y: null,
          max: 2e4
      };
      m.id = l,
      m.style.cssText = "position:fixed;top:0;left:0;z-index:" + d.z + ";opacity:" + d.o,
      e("body")[0].appendChild(m),
      o(),
      window.onresize = o,
      window.onmousemove = function(n) {
          n = n || window.event,
          y.x = n.clientX,
          y.y = n.clientY
      },
      window.onmouseout = function() {
          y.x = null,
          y.y = null
      };
      for (var s = [], f = 0; d.n > f; f++) {
          var h = w() * a,
          g = w() * c,
          v = 2 * w() - 1,
          p = 2 * w() - 1;
          s.push({
              x: h,
              y: g,
              xa: v,
              ya: p,
              max: 6e3
          })
      }
      u = s.concat([y]),
      setTimeout(function() {
          i()
      },
      100)
  } ();
</script>


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
.clock {
    background: rgba(0, 0, 0, 0) none repeat scroll !important;
    background-image: url() !important;
}

@media screen and (max-width: 700px){
  .wrap {
    top:-107%;
    transform: scale(0.68,0.58);
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

