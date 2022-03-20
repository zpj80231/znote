<template>
  <div id="loader-wrapper">
    <h3 class="title" v-if="$site">{{$site.title}}</h3>
    <p class="description" v-if="$site">{{$site.description}}</p>
    <div class="loading">
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </div>
  </div>
</template>

<script>

</script>

<style lang="stylus" scoped>
#loader-wrapper
  height: 100%;
  width: 100%;
  background #fff
  background var(--background-color)
  .loading{
    margin 5rem auto
    text-align center
    padding 0 10px
  }
  .loading span{
    display: inline-block;
    width: 8px;
    height: 100%;
    border-radius: 4px;
    background: lightgreen;
    -webkit-animation: load 1s ease infinite;
    animation: load 1s ease infinite;
  }
  @-webkit-keyframes load{
    0%,100%{
      height: 40px;
      background: lightgreen;
    }
    50%{
      height: 70px;
      margin: -15px 0;
      background: lightblue;
    }
  }
  .loading span:nth-child(2){
    -webkit-animation-delay:0.2s;
    animation-delay:0.2s;
  }
  .loading span:nth-child(3){
    -webkit-animation-delay:0.4s;
    animation-delay:0.4s;
  }
  .loading span:nth-child(4){
    -webkit-animation-delay:0.6s;
    animation-delay:0.6s;
  }
  .loading span:nth-child(5){
    -webkit-animation-delay:0.8s;
    animation-delay:0.8s;
  }
  .title
    margin 12rem auto 1rem
    text-align center
    color $textColor
    color var(--text-color)
    font-size 30px
    box-sizing: border-box;
    padding: 0 10px;
    text-shadow 0 2px 10px rgba(0,0,0,0.2)
  .description
    margin auto
    text-align center
    color $textColor
    color var(--text-color)
    font-size 22px
    box-sizing: border-box;
    padding: 0 10px;
    text-shadow 0 2px 10px rgba(0,0,0,0.2);
</style>
