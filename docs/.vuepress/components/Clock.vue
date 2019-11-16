<template>
	<div id='clock' class="wrap">
    <div class="clock">
      <div class="hour" ref='hh'></div>
      <div class="min" ref='mm'></div>
      <div class="sec" ref='ss'></div>
    </div>

  </div>
</template>

<script>
	export default {
	 	  data() {
	 	  	return {
	 	  		deg: 6
	 	  	}
	 	  },
	      methods: {},
	      watch: {},
	      mounted() {
	        setInterval(() => {
	          let day = new Date();
	          let hr = day.getHours() * 5 * this.deg;
	          let mn = day.getMinutes() * this.deg;
	          let sc = day.getSeconds() * this.deg;
	          this.$refs.hh.style.transform = `rotateZ(${hr+(mn/12)}deg)`;
	          this.$refs.mm.style.transform = `rotateZ(${mn}deg)`;
	          this.$refs.ss.style.transform = `rotateZ(${sc}deg)`;
	        }, 1000)
	      }
	}
</script>

<style lang="stylus" scoped>
	.wrap {
      width: 100%;
      height: 200px;
      min-height: 10vh;
      background: rgba(0, 0, 0, 0) none repeat scroll !important;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .clock {
      position: relative;
      width: 350px;
      height: 350px;
      background: #fff;
      border: 20px solid #fff;
      border-radius: 50%;
      box-shadow: inset 0 0 20px #666;
      background-image: url(img/clock.jpg);
      background-size: cover;
      display: flex;
      justify-content: center;
      align-items: center;
      /*缩小一倍*/
      transform: scale(0.5,0.5);
    }
    .clock::before {
      content: '';
      width: 15px;
      height: 15px;
      background: #fff;
      border-radius: 50%;
      z-index: 99;
    }
    .hour,
    .min,
    .sec {
      position: absolute;
      display: flex;
      justify-content: center;
    }
    .hour {
      width: 160px;
      height: 160px;
    }
    .min {
      width: 190px;
      height: 190px;
    }
    .sec {
      width: 220px;
      height: 220px;
    }
    .hour::before {
      content: '';
      width: 8px;
      height: 80px;
      background: #848484;
      border-radius: 6px 6px 0 0;
      z-index: 9;
    }
    .min::before {
      content: '';
      width: 4px;
      height: 90px;
      background: #eee;
      border-radius: 8px 8px 0 0;
      z-index: 10;
    }
    .sec::before {
      content: '';
      width: 2px;
      height: 130px;
      background: #f40;
      border-radius: 6px 6px 0 0;
      z-index: 11;
    }
</style>