<template>
<div id="clock02">
    <span class="date02">{{ date }}</span>
    <span class="time02">{{ time }}</span>
</div>
</template>

<script>
export default {

    data() {
        return {
            time: '',
            date: '',
            week : ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
        }
    },
    mounted() {
        let time = setInterval(() => {
	        this.updateTime()
        }, 1000)
    },
    methods: {
        updateTime() {
            var cd = new Date();
            this.time = this.zeroPadding(cd.getHours(), 2) + ':' + this.zeroPadding(cd.getMinutes(), 2) + ':' + this.zeroPadding(cd.getSeconds(), 2);
            this.date = this.zeroPadding(cd.getFullYear(), 4) + '-' + this.zeroPadding(cd.getMonth()+1, 2) + '-' + this.zeroPadding(cd.getDate(), 2) + ' ' + this.week[cd.getDay()];
        },
        zeroPadding(num, digit) {
            var zero = '';
            for(var i = 0; i < digit; i++) {
                zero += '0';
            }
            return (zero + num).slice(-digit);
        }
    }
}

</script>

<style lang="css" scoped>

#clock02 {
  font-family: 'Share Tech Mono', monospace;
  text-align: center;
  position: relative;
  left: 30%;
  margin-bottom: -30px;
  margin-top: 30px;
  transform: translate(-30%, -30%);
  color: #daf6ff;
  text-shadow: 0 0 2px #0aafe6, 0 0 2px rgba(10, 175, 230, 0);
}
#clock02 .time02 {
  letter-spacing: 0.05em;
  font-size: 50px;
  padding: 5px 0;
}
#clock02 .date02 {
  letter-spacing: 0.1em;
  font-size: 24px;
}
#clock02 .text {
  letter-spacing: 0.1em;
  font-size: 12px;
  padding: 20px 0 0;
}

</style>