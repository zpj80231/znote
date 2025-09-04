<template>
    <transition name="fade">
        <div v-if="visible" class="notification-wrapper" :style="wrapperStyle">
            <img :src="$withBase('/img/other/person_lital.gif')"
                 style="pointer-events: none;border: 1px solid #DDDDDD;width: 100%;"
                 :class="{'active': isActive}"/>
            <i :class="['btn-close1', {'active': isActive}]" @click="closeNote">
                <svg t="1573745677073" class="icon" viewBox="0 0 1024 1024" version="1.1"
                     xmlns="http://www.w3.org/2000/svg" p-id="4448" width="22" height="22">
                    <path d="M512 34.133333a486.4 486.4 0 1 0 486.4 486.4A486.4 486.4 0 0 0 512 34.133333z m209.4848 632.8064l-55.6032 55.466667-151.517867-151.125333-151.517866 151.1168-55.6032-55.466667 151.517866-151.108267L307.242667 364.714667l55.6032-55.466667 151.517866 151.125333 151.517867-151.1168 55.6032 55.466667-151.517867 151.099733z m0 0"
                          p-id="4449"></path>
                </svg>
            </i>
        </div>
    </transition>
</template>

<script>
    export default {
        name: 'Notification',
        data() {
            return {
                visible: false,
                isActive: false,
                closeBtn: false,
                wrapperStyle: {
                    bottom: '20px',
                    zoom: 1
                },
                animationTimer: null,
                nextPosition: null
            }
        },
        mounted() {
            if(!this.isPc()) { return }
            // 延迟启动动画，确保页面加载完成
            setTimeout(() => {
                this.startAnimation()
            }, 1000)
        },
        beforeDestroy() {
            this.clearTimers()
        },
        methods: {
            clearTimers() {
                if (this.animationTimer) {
                    clearInterval(this.animationTimer)
                    this.animationTimer = null
                }
            },
            closeNote() {
                this.visible = false
                this.closeBtn = true
                this.clearTimers()
                setTimeout(() => {
                    this.closeBtn = false
                    this.startAnimation()
                }, 30 * 60 * 1000)
            },
            isPc() {
                return !navigator.userAgent.match(/(phone|pod|iPhone|iPod|ios|Android|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)
            },
            updateVisibility() {
                this.visible = !this.closeBtn
            },
            generateNewPosition() {
                return  {
                    bottom: `${Math.random() * 50 + 30}%`,
                    zoom: Math.random() * 0.5 + 0.25
                }
            },
            startAnimation() {
                // 先显示元素
                this.updateVisibility()

                // 初始化位置
                this.wrapperStyle = this.generateNewPosition()

                // 生成下一个位置
                this.nextPosition = this.generateNewPosition()

                // 透明度动画切换
                this.animationTimer = setInterval(() => {
                    if (this.isActive) {
                        // 当前是显示状态，准备隐藏
                        this.isActive = false
                    } else {
                        // 当前是隐藏状态，准备显示并更新位置
                        this.wrapperStyle = this.nextPosition
                        this.isActive = true
                        // 生成下一个位置，为下次显示做准备
                        this.nextPosition = this.generateNewPosition()
                    }
                }, 10000)
            }
        }
    }
</script>

<style lang="stylus" scoped>
    .notification-wrapper
        position fixed
        right 5rem
        width 120px
        box-sizing border-box
        background var(--background-color)
        border-radius .25rem
        opacity 0.9
        transition: all 0.5s ease-in-out

        .btn-close1
            position absolute
            display inline-block
            width 22px
            height 22px
            right 10px
            top 0
            cursor pointer
            background-color #0aafe6
            transition: opacity 0.5s ease-in-out

            svg
                fill #fff

    .fade-enter-active, .fade-leave-active {
        transition: opacity 0.5s;
    }

    .fade-enter, .fade-leave-to {
        opacity: 0;
    }

    .notification-wrapper img,
    .notification-wrapper .btn-close1 {
        opacity: 0;
        transition: opacity 5s ease-in-out;

        &.active {
            opacity: 0.9;
        }
    }
</style>
