<template>
<div>
  <Common :sidebar="false" :isComment="false">
    <ul class="timeline-wrapper">
      <ModuleTransition >
        <li v-show="recoShowModule" class="desc">Yesterday Once More!</li>
      </ModuleTransition>
      <ModuleTransition
        :delay="String(0.08 * (index + 1))"
        v-for="(item, index) in $recoPostsForTimeline"
        :key="index">
        <li v-show="recoShowModule">
          <h3 class="year">{{item.year}}</h3>
          <ul class="year-wrapper">
            <li v-for="(subItem, subIndex) in item.data" :key="subIndex" :class="['month-' + getMonth(subItem.frontmatter.date)]">
              <span :class="['date', 'month-' + getMonth(subItem.frontmatter.date)]">{{subItem.frontmatter.date | dateFormat}}</span>
              <span class="title" @click="go(subItem.path)">{{subItem.title}}</span>
            </li>
          </ul>
        </li>
      </ModuleTransition>
    </ul>
  </Common>
</div>

</template>

<script>
import Common from '@theme/components/Common'
import ModuleTransition from '@theme/components/ModuleTransition'
import moduleTransitonMixin from '@theme/mixins/moduleTransiton'

export default {
  mixins: [moduleTransitonMixin],
  name: 'TimeLine',
  components: { Common, ModuleTransition },
  filters: {
    dateFormat (date, type) {
      function renderTime (date) {
        const dateee = new Date(date).toJSON()
        return new Date(+new Date(dateee) + 8 * 3600 * 1000).toISOString().replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '').replace(/-/g, '/')
      }
      date = renderTime(date)
      const dateObj = new Date(date)
      const mon = dateObj.getMonth() + 1
      const day = dateObj.getDate()
      return `${mon}-${day}`
    }
  },
  methods: {
    go (url) {
      this.$router.push({ path: url })
    },
    getMonth (date) {
      const dateee = new Date(date).toJSON()
      const dateObj = new Date(+new Date(dateee) + 8 * 3600 * 1000)
      return dateObj.getMonth() + 1
    }
  }
}
</script>

<style src="../styles/theme.styl" lang="stylus"></style>

<style lang="stylus" scoped>
@require '../styles/wrapper.styl'

$monthColor1 = #d96c75 // 一月 - 玫瑰红
$monthColor2 = #d98542 // 二月 - 暖橙
$monthColor3 = #d0a63a // 三月 - 金黄
$monthColor4 = #a6b842 // 四月 - 青柠
$monthColor5 = #6fb65a // 五月 - 草绿
$monthColor6 = #43b37b // 六月 - 翡翠绿
$monthColor7 = #38aaa5 // 七月 - 湖青
$monthColor8 = #3f9bc7 // 八月 - 天蓝
$monthColor9 = #5d86d6 // 九月 - 靛蓝
$monthColor10 = #8273d1 // 十月 - 紫罗兰
$monthColor11 = #ad6fc1 // 十一月 - 淡紫
$monthColor12 = #cf6da0 // 十二月 - 莓粉

@media (prefers-color-scheme: dark)
  $monthColor1 = #b84f59 // 一月 - 深玫瑰红
  $monthColor2 = #b66a32 // 二月 - 深暖橙
  $monthColor3 = #aa862d // 三月 - 深金黄
  $monthColor4 = #849436 // 四月 - 深青柠
  $monthColor5 = #5f923f // 五月 - 深草绿
  $monthColor6 = #379063 // 六月 - 深翡翠绿
  $monthColor7 = #2f8f8b // 七月 - 深湖青
  $monthColor8 = #337fa3 // 八月 - 深天蓝
  $monthColor9 = #4f6fb5 // 九月 - 深靛蓝
  $monthColor10 = #685fb1 // 十月 - 深紫罗兰
  $monthColor11 = #8c59a0 // 十一月 - 深淡紫
  $monthColor12 = #aa5683 // 十二月 - 深莓粉

.timeline-wrapper
  box-sizing border-box
  max-width: $contentWidth;
  margin: 8rem auto 4rem;
  position relative
  list-style none
  &::after {
    content: " ";
    position: absolute;
    top: 14px;
    left: 0;
    z-index: -1;
    margin-left: -2px;
    width: 4px;
    height: 100%;
    background: skyblue;
  }
  .desc, .year {
    position: relative;
    color var(--text-color);
    font-size 16px
    &:before {
      content: " ";
      position: absolute;
      z-index 2;
      left: -20px;
      top: 50%;
      margin-left: -4px;
      margin-top: -4px;
      width: 8px;
      height: 8px;
      background: cadetblue;
      border: 1px solid var(--border-color);
      border-radius: 50%;
    }
  }
  .year {
    margin: 80px 0px 20px;
    color var(--text-color);
    font-weight: 700;
    font-size 27px
  }
  .year-wrapper {
    padding-left 0!important
    li {
        display flex
        padding 10px 20px 10px
        list-style none
        border-bottom: 2px solid #999da06b;
        position relative
        border-radius 5rem
        transition all .5s ease
        margin-bottom 5px
        padding-left 20px
        padding-right 20px
        
        // 为每个月份的整个条目区域添加与日期圆点相匹配的背景色
        &.month-1 { background: rgba($monthColor1, 0.18); }
        &.month-2 { background: rgba($monthColor2, 0.18); }
        &.month-3 { background: rgba($monthColor3, 0.18); }
        &.month-4 { background: rgba($monthColor4, 0.18); }
        &.month-5 { background: rgba($monthColor5, 0.18); }
        &.month-6 { background: rgba($monthColor6, 0.18); }
        &.month-7 { background: rgba($monthColor7, 0.18); }
        &.month-8 { background: rgba($monthColor8, 0.18); }
        &.month-9 { background: rgba($monthColor9, 0.18); }
        &.month-10 { background: rgba($monthColor10, 0.18); }
        &.month-11 { background: rgba($monthColor11, 0.18); }
        &.month-12 { background: rgba($monthColor12, 0.18); }
        
        &:hover {
          // 悬停时增加背景色透明度和位移效果
          transform: translate(50px, 0)
          &.month-1 { background: rgba($monthColor1, 0.3); }
          &.month-2 { background: rgba($monthColor2, 0.3); }
          &.month-3 { background: rgba($monthColor3, 0.3); }
          &.month-4 { background: rgba($monthColor4, 0.3); }
          &.month-5 { background: rgba($monthColor5, 0.3); }
          &.month-6 { background: rgba($monthColor6, 0.3); }
          &.month-7 { background: rgba($monthColor7, 0.3); }
          &.month-8 { background: rgba($monthColor8, 0.3); }
          &.month-9 { background: rgba($monthColor9, 0.3); }
          &.month-10 { background: rgba($monthColor10, 0.3); }
          &.month-11 { background: rgba($monthColor11, 0.3); }
          &.month-12 { background: rgba($monthColor12, 0.3); }
          
          .date {
            color $accentColor
            &::before {
              background $accentColor
            }
          }
          .title {
            color $accentColor
          }
        }
        .date {
          width 43px
          line-height 30px
          color var(--text-color)
          font-size 13px
          &::before {
            content: " ";
            position: absolute;
            left: -19px;
            top: 22px;
            width: 6px;
            height: 6px;
            margin-left: -4px;
            background: var(--background-color);
            border-radius: 50%;
            border: 1px solid;
            z-index 2
          }
          &.month-1::before { border-color: $monthColor1; background: $monthColor1; }
          &.month-2::before { border-color: $monthColor2; background: $monthColor2; }
          &.month-3::before { border-color: $monthColor3; background: $monthColor3; }
          &.month-4::before { border-color: $monthColor4; background: $monthColor4; }
          &.month-5::before { border-color: $monthColor5; background: $monthColor5; }
          &.month-6::before { border-color: $monthColor6; background: $monthColor6; }
          &.month-7::before { border-color: $monthColor7; background: $monthColor7; }
          &.month-8::before { border-color: $monthColor8; background: $monthColor8; }
          &.month-9::before { border-color: $monthColor9; background: $monthColor9; }
          &.month-10::before { border-color: $monthColor10; background: $monthColor10; }
          &.month-11::before { border-color: $monthColor11; background: $monthColor11; }
          &.month-12::before { border-color: $monthColor12; background: $monthColor12; }
        }
        .title {
          line-height 30px
          color var(--text-color)
          font-size 16px
          cursor pointer
          padding: 0 10px
        }
    }
  }
@media (max-width: $MQMobile)
  .timeline-wrapper
    margin: 0 1.2rem;
</style>
