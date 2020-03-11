<template>
    
</template>

<script>
  export default {
    props: {
        count: {// 线条数量
            type: String,
            default: '99'
        },
        opacity: {// 线条透明度
            type: String,
            default: '0.7'
        },
        color: {// 线条颜色
            type: String,
            default: ''
        },
        zIndex: {// 画面层级
            type: String,
            default: ''
        },
        global: {// 是否全局引入
          type: Boolean,
          default: false
        }
    },
    data() {
      return {
        
      }
    },
    mounted() {
      this.showCanvas();
    },
    created() {
      
    },
    methods: {
      check() {
        let flag = navigator.userAgent.match(/(phone|pod|iPhone|iPad|iPod|ios|Android|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)
        return !flag;
      },
      showCanvas() {
        if(!this.check()){return}
        var element = document.createElement("script");
        element.setAttribute("count",this.count);
        element.setAttribute("color",this.color);
        element.setAttribute("name","canvas-nest-name");
        element.setAttribute("opacity",this.opacity);
        element.setAttribute("zIndex",this.zIndex);
        element.src = "https://cdn.bootcss.com/canvas-nest.js/2.0.4/canvas-nest.js";
        document.body.appendChild(element);
      }
    },
    beforeDestroy() {
      if(!this.global) {
        var canvas = document.getElementsByTagName("canvas");
        for(let i=0; i<canvas.length; i++) {
            canvas[i].style.display='none';
            canvas[i].remove();
        }
        var scripts = document.getElementsByTagName("script");
        for (var i = 0; i < scripts.length; i++) {
            if (scripts[i] && scripts[i].getAttribute("name")=="canvas-nest-name") {
                scripts[i].parentNode.removeChild(scripts[i]);
            }
        }
      }
    },
  }
</script>