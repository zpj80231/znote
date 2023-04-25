<template>
  <div id="loader-wrapper">
    <h3 class="title" v-if="$site">{{$site.title}}</h3>
    <p class="description" v-if="$site">{{$site.description}}</p>
    <div class="loading">
      <span
        :style="{
          width: '20px',
          animationDuration:
            duration.indexOf('s') === -1 ? duration + 's' : duration,
          animationDelay: (parseInt(duration) / text.length) * index + 's',
        }"
        v-for="(char, index) in text"
        :key="index"
      >
        {{ char }}
      </span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    text: {
      type: String,
      default: "Loading...",
    },
    duration: {
      type: String,
      default: "2s",
    },
  },
};
</script>

<style lang="stylus" scoped>
#loader-wrapper
  height: 100%;
  width: 100%;
  background var(--background-color)
  .loading{
    width 200px
    margin 5rem auto
    display: flex;
    text-align center
    justify-content: space-between;
    background #23#0aafe6
  }
  .loading span{
    display: block;
    height: 100%;
    border-radius: 4px;
    animation: ease infinite move;
  }
  @keyframes move {
    0% {
      margin-top: -10px;
      border-bottom: 1px solid;
    }
    50% {
      margin-top: 10px;
      border-bottom: none;
    }
    100% {
      margin-top: -10px;
    }
  }
  .title
    margin 15% auto 1rem
    text-align center
    color $textColor
    color var(--text-color)
    font-size 40px
    box-sizing: border-box;
    padding: 0 10px;
    text-shadow 0 2px 10px rgba(0,0,0,0.2)
  .description
    margin auto
    text-align center
    color $textColor
    color var(--text-color)
    font-size 25px
    box-sizing: border-box;
    padding: 0 10px;
    text-shadow 0 2px 10px rgba(0,0,0,0.2);
</style>
