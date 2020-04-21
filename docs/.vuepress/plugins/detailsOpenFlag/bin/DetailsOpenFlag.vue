<template>
	<div>

	<div @click="updateOpen()" v-show="showButtonFlag" class="DetailsOpenFlag"
		:style="detailsStyle">
	 {{text}} 

	</div>

	</div>
</template>


<script>
  export default {
      data() {
        return {
          showButtonFlag: false,
          openFlag: false,
          text: "展开",
          visible: false,
          interval: null,
          isMoving: false,
          /* eslint-disable no-undef */
          detailsStyle: DETAILS_STYLE,
          visibilityHeight: VISIBILITY_HEIGHT
        }
      },
        methods: {
          updateOpen() {
            this.openFlag = !this.openFlag;
            var objs = document.getElementsByTagName('details');
            if(this.openFlag) {
              for(var i=0;i<objs.length;i++){
                objs[i].setAttribute('open','');
              }
              this.text = "合起";
            }else {
              for(var i=0;i<objs.length;i++){
                objs[i].removeAttribute('open');
              }
              this.text = "展开";
            }
          },
          showButton() {
            // this.$route.path 
          	var objs = document.getElementsByTagName('details');
          	//当details的数量至少3时才显示展开按钮
            if(objs!=null && objs.length>2) {
          		this.showButtonFlag = true;
          	}else {
          		this.showButtonFlag = false;
          	}
          },
          handleScroll () {
            this.visible = window.pageYOffset > this.visibilityHeight
          }
        },
        watch: {
          $route(to,from){
            if(to.path == from.path) {
              this.showButton()
            }else if(to.path == '/' || to.path == '/about/') {
              this.showButtonFlag = false;
            }else {
              this.openFlag = false;
              this.text = "展开";
              this.showButton()
            }
          }        
        },
        created () {
          
        },
        mounted () {
        
        },
        beforeDestroy () {
          
        },
  }
</script>

<style lang="stylus" scoped>
	.DetailsOpenFlag
	  background-color: var(--background-color)
	  box-shadow: 0 1px 6px 0 rgba(0, 0, 0, 0.2)
	  box-shadow: var(--box-shadow)
	  position: fixed;
	  display: inline-block;
	  text-align: center;
	  cursor: pointer;
	  &::hover
	    background: #d5dbe7;
	  .icon
	    position absolute
	    top 0
	    bottom 0
	    left 0
	    right 0
	    margin auto
	    width 26px
	    height 26px
	    fill $accentColor
	.fade-enter-active,
	.fade-leave-active {
	  transition: all .5s;
	}
	.fade-enter,
	.fade-leave-to {
	  opacity: 0
	  transform translateY(120px)
	}
</style>

