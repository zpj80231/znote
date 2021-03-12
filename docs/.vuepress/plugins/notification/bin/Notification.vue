<template>
    <transition name="fade">
        <div v-if="visible" class="notification-wrapper">
            <img :src="$withBase('/img/other/person_lital.gif')" style="pointer-events: none;border: 1px solid #DDDDDD;width: 100%;"
                :class="active ? 'active' : 'noActive'"/>
            <i :class="['btn-close1',active ? 'active' : 'noActive']" @click="closeNote">
                <svg t="1573745677073" class="icon" viewBox="0 0 1024 1024" version="1.1"
                     xmlns="http://www.w3.org/2000/svg" p-id="4448" width="22" height="22">
                    <path d="M512 34.133333a486.4 486.4 0 1 0 486.4 486.4A486.4 486.4 0 0 0 512 34.133333z m209.4848 632.8064l-55.6032 55.466667-151.517867-151.125333-151.517866 151.1168-55.6032-55.466667 151.517866-151.108267L307.242667 364.714667l55.6032-55.466667 151.517866 151.125333 151.517867-151.1168 55.6032 55.466667-151.517867 151.099733z m0 0"
                          p-id="4449"></path>
                </svg>
            </i>

            <h4 class="notification-title" style="display: none">
                <i class="iconfont reco-tongzhi"></i>
                <span> 🎉🎉🎉</span>
                <i class="btn-close" @click="closeNote">
                    <svg t="1573745677073" class="icon" viewBox="0 0 1024 1024" version="1.1"
                         xmlns="http://www.w3.org/2000/svg" p-id="4448" width="22" height="22">
                        <path d="M512 34.133333a486.4 486.4 0 1 0 486.4 486.4A486.4 486.4 0 0 0 512 34.133333z m209.4848 632.8064l-55.6032 55.466667-151.517867-151.125333-151.517866 151.1168-55.6032-55.466667 151.517866-151.108267L307.242667 364.714667l55.6032-55.466667 151.517866 151.125333 151.517867-151.1168 55.6032 55.466667-151.517867 151.099733z m0 0"
                              p-id="4449"></path>
                    </svg>
                </i>
            </h4>
            <div class="notification-content" style="display: none">
                <img :src="$withBase('/img/other/person_lital.gif')" style="border: 1px solid #DDDDDD;width: 100%;"
                     class="medium-zoom-image"/>
            </div>
        </div>
    </transition>
</template>

<script>
    export default {
        name: 'BackToTop',
        data() {
            return {
                visible: false,
                active: true,
                closeBtn: false
            }
        },
        mounted() {
            if(!this.check()) { return }
            this.setStepImg()
            this.setRandomShow()
        },
        methods: {
            //点击关闭按钮后，整体通知区域5min内不再显示
            closeNote() {
                this.visible = false
                this.closeBtn = true
                setTimeout(() => {
                    this.closeBtn = false
                }, (5*60*1000))
            },
            check() {
                let flag = navigator.userAgent.match(/(phone|pod|iPhone|iPod|ios|Android|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)
                return !flag;
            },
            getVisible() {
                return  this.visible = !this.closeBtn
            },
            /* 控制通知区域内容顺序性若隐若现
             * 设置图片不定位置展示，位置每更换一次展示效果都是若隐->若现(顺序性)
             */
            setStepImg() {
                var stepNum = 1
                setInterval(() => {
                    stepNum++
                    if(stepNum%2==0) {
                        var nw = document.getElementsByClassName("notification-wrapper")[0]
                        if (nw == null || nw == undefined || nw.style == undefined) return;
                        nw.style.bottom = (Math.random() * 73) + "%";
                        nw.style.zoom = Math.random();
                    }
                    this.visible = this.getVisible()
                    this.active = !this.active
                    this.noActive = !this.noActive
                }, (10*1000))
            },
            /* 控制整体通知区域随机显示
             * 并且随机初始显示都是从若隐->若现 (防止图片正在显示中直接随机换位置导致动画效果不好看)
             */
            setRandomShow() {
                var randomNum = 1
                setInterval(() => {
                    if(randomNum >= 1) {
                        this.closeBtn = false
                    }else {
                        this.closeBtn = true
                    }
                    randomNum = Math.floor(Math.random() * 3)
                }, (40*1000))
            }
        }
    }
</script>

<style lang="stylus" scoped>
    .notification-wrapper
        position fixed
        bottom 20px
        right 5rem
        //z-index 19
        width 120px
        box-sizing border-box
        background #fff
        //border 1px solid #3eaf7c
        border-radius .25rem
        background var(--background-color)
        //box-shadow var(--box-shadow)
        opacity 0.9

        .btn-close1
            position absolute
            display inline-block
            width 22px
            height 22px
            right 10px
            top 0
            //bottom 0
            margin auto
            cursor pointer
            background-color #0aafe6

            svg
                fill #fff

        .notification-title
            position relative
            box-sizing border-box
            padding 10px
            margin 0
            background #3eaf7c
            color #fff

            i
                color #fff

            .btn-close
                position absolute
                display inline-block
                width 22px
                height 22px
                right 10px
                top 0
                bottom 0
                margin auto
                cursor pointer

                svg
                    fill #fff

        .notification-content
            box-sizing border-box
            padding 10px

            img
                width 100%

    .fade-enter-active, .fade-leave-active {
        transition: opacity .5s;
    }

    .fade-enter, .fade-leave-to {
        opacity: 0;
    }

    .noActive {
        opacity: 0;
        transition: opacity 10s linear;
    }

    .active {
        opacity: 0.9;
        transition: opacity 10s linear;
    }
</style>
