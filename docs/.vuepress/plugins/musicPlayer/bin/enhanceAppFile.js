import Player from './zw-player/Player.vue'
import MobilePlayer from './zw-player/MobilePlayer.vue'

export default ({ Vue }) => {
  function _isMobile() {
    let flag = navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)
    return flag
  }
  if (_isMobile()) {
    Vue.component('musicPlayer', MobilePlayer)
  }else {
    Vue.component('musicPlayer', Player)
  }
}
