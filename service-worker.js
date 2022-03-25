/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [
  {
    "url": "404.html",
    "revision": "8168e5dea547ca80aa55d7e9297a0801"
  },
  {
    "url": "about/index.html",
    "revision": "0546bbd099ebceb041fa56ed552f9ff5"
  },
  {
    "url": "assets/css/0.styles.921b0d1e.css",
    "revision": "7bb0952b33d03d08060803ff78b8f5e6"
  },
  {
    "url": "assets/img/home-bg.7b267d7c.jpg",
    "revision": "7b267d7ce30257a197aeeb29f365065b"
  },
  {
    "url": "assets/img/iconfont.40e49907.svg",
    "revision": "40e499073350c37f960f190956a744d2"
  },
  {
    "url": "assets/img/loading.c38bb4c9.svg",
    "revision": "c38bb4c91362836bff4e41485000be83"
  },
  {
    "url": "assets/img/pan.07613e22.png",
    "revision": "07613e229a93d4e819835f6c46a5bbc9"
  },
  {
    "url": "assets/img/search.83621669.svg",
    "revision": "83621669651b9a3d4bf64d1a670ad856"
  },
  {
    "url": "assets/js/1.f5891f31.js",
    "revision": "356090eaae66962efc45d015feee8ac8"
  },
  {
    "url": "assets/js/10.0eaa572b.js",
    "revision": "399ab29c70a1d99ba696ff9437ec5b91"
  },
  {
    "url": "assets/js/100.6a81b0f9.js",
    "revision": "2ca7960a111ed80dcf052d1c014bc094"
  },
  {
    "url": "assets/js/101.0b7ee36f.js",
    "revision": "9eab23ec2733dd0ec724228df7d5fee7"
  },
  {
    "url": "assets/js/11.0b8f09cc.js",
    "revision": "731569cb53e53065bae172ddb8ca8e65"
  },
  {
    "url": "assets/js/12.08bd73e5.js",
    "revision": "b0e2db46766289cb3623896dc27d1b52"
  },
  {
    "url": "assets/js/13.73d7e403.js",
    "revision": "1f6206ab1c3c852b0d08cba52ecd414f"
  },
  {
    "url": "assets/js/14.49f817b2.js",
    "revision": "60fdb3bbc70f81df5c950c7d13fb7b04"
  },
  {
    "url": "assets/js/15.9d00ad3f.js",
    "revision": "56385ac1468dfd37f215bd8bf43d100e"
  },
  {
    "url": "assets/js/16.ee1fb3f2.js",
    "revision": "c898d1979ddac1b7396b2647e847c5ad"
  },
  {
    "url": "assets/js/17.d110351b.js",
    "revision": "4c190edbc92f1730a85aeabd6510a7c4"
  },
  {
    "url": "assets/js/18.5bdf1352.js",
    "revision": "edf7d8d2794f92a53dc6cc21777067d9"
  },
  {
    "url": "assets/js/19.d4c93031.js",
    "revision": "27f385b9bf4b97d009deaf72a61272ad"
  },
  {
    "url": "assets/js/2.70e95b90.js",
    "revision": "d8c6e3bc4ce3fc28b4a6c0c9eb17466d"
  },
  {
    "url": "assets/js/20.5a45ca7e.js",
    "revision": "9a21458d669dad12d5a1968a299acdd7"
  },
  {
    "url": "assets/js/21.65f15f5e.js",
    "revision": "1f12b1c324d69ef2f540fa58764c7b90"
  },
  {
    "url": "assets/js/22.59cccf29.js",
    "revision": "63adec35fd57feb11fcf037d3ba33b54"
  },
  {
    "url": "assets/js/23.45705f81.js",
    "revision": "57d5e41cfe5f461c4bc662f7df3e1c85"
  },
  {
    "url": "assets/js/24.852afe60.js",
    "revision": "5ac5636a53f5c516553a87191ea59d70"
  },
  {
    "url": "assets/js/25.05ebd395.js",
    "revision": "42068890b9212d7a3f7531b1e4fb8c66"
  },
  {
    "url": "assets/js/26.c515e722.js",
    "revision": "da3260af2146a61c858c519a0610cc39"
  },
  {
    "url": "assets/js/27.2b06f66e.js",
    "revision": "60720302dbadfe5f70d9c3cb31e7f46e"
  },
  {
    "url": "assets/js/28.879b617b.js",
    "revision": "fa5eb7238bb617fe58276da016a8f68d"
  },
  {
    "url": "assets/js/29.aa28ffd9.js",
    "revision": "49d3e1068803baab4ebd400ccb17fc41"
  },
  {
    "url": "assets/js/30.f5305084.js",
    "revision": "deb52c51294409b90d785e287ce61960"
  },
  {
    "url": "assets/js/31.a2d18358.js",
    "revision": "e170e382ca08e2f10e17b661f2b81766"
  },
  {
    "url": "assets/js/32.eb9fdbfb.js",
    "revision": "743a603084527354ecc8b1bf2614d952"
  },
  {
    "url": "assets/js/33.3be83e6e.js",
    "revision": "5f70f0e23f0c9fb7a7d25866c2cf86a5"
  },
  {
    "url": "assets/js/34.f5ed7112.js",
    "revision": "b6e3ac5fa89a052f70358e164c2299c5"
  },
  {
    "url": "assets/js/35.6829633b.js",
    "revision": "3c4856b2407300c8f999e8b9ccd4564b"
  },
  {
    "url": "assets/js/36.02c4d2a0.js",
    "revision": "94820b2af9e1a1d0d770af7792bfd341"
  },
  {
    "url": "assets/js/37.6ebcd140.js",
    "revision": "48fa6caaa7598ccae0e6b74ac37c4eee"
  },
  {
    "url": "assets/js/38.3b772ab7.js",
    "revision": "65d74db619423dc11831bce0adab5ddd"
  },
  {
    "url": "assets/js/39.5126a68d.js",
    "revision": "3418d18b07390e289c98927c27e5cd3c"
  },
  {
    "url": "assets/js/40.855c2fad.js",
    "revision": "74c4e94d9e6f67b4513be7bb6dfef037"
  },
  {
    "url": "assets/js/41.641047f3.js",
    "revision": "9f3fab55e4eaf37fd293d3630806dcf6"
  },
  {
    "url": "assets/js/42.cba3fdc5.js",
    "revision": "b3bfc45864a12641525bc75023ce285b"
  },
  {
    "url": "assets/js/43.14e714b6.js",
    "revision": "b7ce41fb4bded93e0c4f7649e703e3a1"
  },
  {
    "url": "assets/js/44.f7b22f87.js",
    "revision": "51d78caa4fac8a9fa768f73187fac7fd"
  },
  {
    "url": "assets/js/45.8d77abc1.js",
    "revision": "c70544b2c144deee1987227d57f48bb2"
  },
  {
    "url": "assets/js/46.1fb03efa.js",
    "revision": "1113ccae933ae2652e5bc33f405f3c50"
  },
  {
    "url": "assets/js/47.87bddb18.js",
    "revision": "b708fda4c26f830e771af98fcff40e88"
  },
  {
    "url": "assets/js/48.28032701.js",
    "revision": "38b48ea2d516877fcf974244b7219fc9"
  },
  {
    "url": "assets/js/49.c8a2666b.js",
    "revision": "40942c85f53eafc68e8eeefc3219931b"
  },
  {
    "url": "assets/js/5.08ee23c6.js",
    "revision": "4ea948421562ce3614c6456b6a618ee4"
  },
  {
    "url": "assets/js/50.8bc32ccd.js",
    "revision": "791f094758c7c822cf2a7c5904551ff8"
  },
  {
    "url": "assets/js/51.eb5d39b2.js",
    "revision": "4a6513fc565b7a7349d486413174ca2f"
  },
  {
    "url": "assets/js/52.913aba44.js",
    "revision": "37d6ceda784572cded90501f9690d184"
  },
  {
    "url": "assets/js/53.45957257.js",
    "revision": "cedfb83149d909b90f8a61fc70f7ff6d"
  },
  {
    "url": "assets/js/54.ffa6dafe.js",
    "revision": "a6efd5c6b3b43eb53a16e6509037eb84"
  },
  {
    "url": "assets/js/55.cb7f0685.js",
    "revision": "a3623191c75d4e943dda44cc2a403e93"
  },
  {
    "url": "assets/js/56.4ebecdda.js",
    "revision": "d9fad7489f5f52b7e5ad9bc575deb27f"
  },
  {
    "url": "assets/js/57.91594eff.js",
    "revision": "85c5d7ac7b02bd04c51d574b1ce07313"
  },
  {
    "url": "assets/js/58.e8b2db94.js",
    "revision": "ee9fc9519aa572a9ae3e36c50193abf5"
  },
  {
    "url": "assets/js/59.fda19820.js",
    "revision": "bd5c6eab9d26967c54dc3eb7a71f8ea9"
  },
  {
    "url": "assets/js/6.aa9e5c4b.js",
    "revision": "8e2ca43a60cbfddb383b2760299ee322"
  },
  {
    "url": "assets/js/60.bc7f98bd.js",
    "revision": "3aea1d4e8229a4cd6b1a887269be54e8"
  },
  {
    "url": "assets/js/61.0a209004.js",
    "revision": "cec1d7e9c4ae4928c5fb5f77a57ef61c"
  },
  {
    "url": "assets/js/62.d2f3fb17.js",
    "revision": "708ff2bbc807180f41e540d6641ea941"
  },
  {
    "url": "assets/js/63.4a238aa7.js",
    "revision": "ecc9c4a1b03523f33bc4f75fc1c1c791"
  },
  {
    "url": "assets/js/64.68830aad.js",
    "revision": "f5d7a88b83502beaa75f212dc58002e2"
  },
  {
    "url": "assets/js/65.bf5c1beb.js",
    "revision": "1b085849bac55f8448b31276c9366118"
  },
  {
    "url": "assets/js/66.5fbfdf3f.js",
    "revision": "41bdb39ee9999f1c2b36a5c3641fdbb7"
  },
  {
    "url": "assets/js/67.60461293.js",
    "revision": "ac2395f095674e0762c85f2476f3c6d6"
  },
  {
    "url": "assets/js/68.735b8726.js",
    "revision": "02dfc32c385d7dbb90ceca6d0b90cd2e"
  },
  {
    "url": "assets/js/69.7dfa5624.js",
    "revision": "0137d2837601313f789984d78ff08955"
  },
  {
    "url": "assets/js/7.5d408877.js",
    "revision": "0aa05b9338e932d1eaa3073d53f000a5"
  },
  {
    "url": "assets/js/70.b39c7f59.js",
    "revision": "1239324c492d19df45d9138e9b3f3058"
  },
  {
    "url": "assets/js/71.6a4ce7cb.js",
    "revision": "210c10bcbd4928e108467856894099ca"
  },
  {
    "url": "assets/js/72.56d4b994.js",
    "revision": "4f7c8059d23ad4cc02ea239e6018ac55"
  },
  {
    "url": "assets/js/73.a4e011bd.js",
    "revision": "d3f4899664509ae1272aecdf39481989"
  },
  {
    "url": "assets/js/74.c10645d3.js",
    "revision": "337f921f9f7d9882f86595db54a90048"
  },
  {
    "url": "assets/js/75.e2517f94.js",
    "revision": "330340350b7c73c513523b93b755b70f"
  },
  {
    "url": "assets/js/76.0c60c8aa.js",
    "revision": "3d0f294c008a181fece0741dc4e82fc2"
  },
  {
    "url": "assets/js/77.f302f59b.js",
    "revision": "110bdfae0740410b8f4d9405058e5bf9"
  },
  {
    "url": "assets/js/78.bc147b24.js",
    "revision": "43413c295d2230d9df7869949a6f70af"
  },
  {
    "url": "assets/js/79.592b8d04.js",
    "revision": "29a64b7747414f33b27e28479e062626"
  },
  {
    "url": "assets/js/8.86786e5e.js",
    "revision": "e391f1e83dd096098913019f68aaef61"
  },
  {
    "url": "assets/js/80.8beca7e4.js",
    "revision": "b3d53a573b92a959fd495189d1a08fbf"
  },
  {
    "url": "assets/js/81.27605b59.js",
    "revision": "35b65ef86786b4aedf03df09539752e1"
  },
  {
    "url": "assets/js/82.3018e307.js",
    "revision": "b87a8979e09456477f37fa027ce12c91"
  },
  {
    "url": "assets/js/83.183a14c2.js",
    "revision": "4d3a8c3ea260e1fb828c60a9c1cc158f"
  },
  {
    "url": "assets/js/84.5eab7d2d.js",
    "revision": "6d5b573891fa2a8d9a87846ef80f029e"
  },
  {
    "url": "assets/js/85.779fc9c0.js",
    "revision": "5b938febc492338115d0db38ba1d7608"
  },
  {
    "url": "assets/js/86.2c055167.js",
    "revision": "8135ffd945d56091e409f72c17b8bed4"
  },
  {
    "url": "assets/js/87.bd0f7146.js",
    "revision": "c3462883a4a2c930304b85708dd1c07a"
  },
  {
    "url": "assets/js/88.f6cbf0c1.js",
    "revision": "e09ec1cbc136e731c05975e2cd2cb419"
  },
  {
    "url": "assets/js/89.949e23c7.js",
    "revision": "74e6f63a2924ccc30e2dbc1188ffcd9e"
  },
  {
    "url": "assets/js/9.671f9fb2.js",
    "revision": "33aac8cc4c2318846788df89dc892f93"
  },
  {
    "url": "assets/js/90.ab75fdc9.js",
    "revision": "76ead4dc3e05ecb26f4c64865e82e083"
  },
  {
    "url": "assets/js/91.1e6f7306.js",
    "revision": "94db0709a858b10e78fec24cf9d058ab"
  },
  {
    "url": "assets/js/92.985eae84.js",
    "revision": "65f10c2700874039b6c7a8bd766c5866"
  },
  {
    "url": "assets/js/93.9d8a1c40.js",
    "revision": "440cb80e8f1769c476b1bc8412671471"
  },
  {
    "url": "assets/js/94.ee9a2f45.js",
    "revision": "7213e0a6c322a976819cdd8aef155f0b"
  },
  {
    "url": "assets/js/95.1770b2a7.js",
    "revision": "fcf1b4e308ad3c9999c784213f23501d"
  },
  {
    "url": "assets/js/96.b276ffbd.js",
    "revision": "c7bc071a260bcba26865c1b675b8a18c"
  },
  {
    "url": "assets/js/97.b9043299.js",
    "revision": "e8a4278d3c130c8855e0bb553ba2c4e9"
  },
  {
    "url": "assets/js/98.8ea5024e.js",
    "revision": "579807e14a9d16bc5ad95c13741f253f"
  },
  {
    "url": "assets/js/99.b2d976fa.js",
    "revision": "3b6227246edb1b54809c90c8475b0921"
  },
  {
    "url": "assets/js/app.c5a8d58b.js",
    "revision": "d09fc33303e4c18474df0b49568d2da0"
  },
  {
    "url": "assets/js/vendors~flowchart.d45f6a23.js",
    "revision": "351ba3ce452425eea461bfc8116d0bee"
  },
  {
    "url": "categories/index.html",
    "revision": "74a95d359279837419ae9118db258983"
  },
  {
    "url": "categories/前端 Front-end/index.html",
    "revision": "8cbdb66366368796b7e95259f105c0d9"
  },
  {
    "url": "categories/后端 Back-end/index.html",
    "revision": "2359d0d579dd4625af02de2406bcaa1b"
  },
  {
    "url": "categories/后端 Back-end/page/2/index.html",
    "revision": "80e35ebc89bfa8be1120ed10a5fba99c"
  },
  {
    "url": "categories/后端 Back-end/page/3/index.html",
    "revision": "c5c473e97e89ebef9adb5062a0d46d11"
  },
  {
    "url": "categories/后端 Back-end/page/4/index.html",
    "revision": "86665136fe97c8f121fac04b75c833d0"
  },
  {
    "url": "categories/知识晶体 Q&A/index.html",
    "revision": "376e545ef74001deb2c5fc7a224aee96"
  },
  {
    "url": "categories/规范 Standard/index.html",
    "revision": "961406bcef11858fb7e669076c064146"
  },
  {
    "url": "categories/随笔 Essay/index.html",
    "revision": "f648a384048276071357a3abe716ee71"
  },
  {
    "url": "categories/随笔 Essay/page/2/index.html",
    "revision": "57ccfd07983a3afeef0f771ae1788332"
  },
  {
    "url": "iconfont/iconfont.css",
    "revision": "c8b00d812608bf98f806b55fa4140795"
  },
  {
    "url": "iconfont/iconfont.eot",
    "revision": "0fe2ea06e44b4c5586cd81edfb62fa67"
  },
  {
    "url": "iconfont/iconfont.svg",
    "revision": "40e499073350c37f960f190956a744d2"
  },
  {
    "url": "iconfont/iconfont.ttf",
    "revision": "b2bb6a1eda818d2a9d922d41de55eeb1"
  },
  {
    "url": "iconfont/iconfont.woff",
    "revision": "3779cf87ccaf621f668c84335713d7dc"
  },
  {
    "url": "iconfont/iconfont.woff2",
    "revision": "66dad00c26f513668475f73f4baa29aa"
  },
  {
    "url": "img/backend/14814543-ff52ad16128922f6.jpg",
    "revision": "3020a2831ca822ba01dad963c39757c5"
  },
  {
    "url": "img/backend/16301aac714a64ae.jpg",
    "revision": "4b9f2b0305ea9628b130cc37fa578ed3"
  },
  {
    "url": "img/backend/16301aac716e8f24.jpg",
    "revision": "ab3e61b413226ee4fce4b2907b44be04"
  },
  {
    "url": "img/backend/169b3411b74cfff1.jpg",
    "revision": "fc3440da635511133e5f02f7d60d9ffa"
  },
  {
    "url": "img/backend/169b3432b128105d.jpg",
    "revision": "2c728d709f7647f7547f70b14eef297c"
  },
  {
    "url": "img/backend/21182623_YAbx.png",
    "revision": "f029436c3d58c7861a1ffa97a3c5e6ec"
  },
  {
    "url": "img/backend/21182624_Ar1G.png",
    "revision": "974c19cc5e47ab04a666a6ac88932718"
  },
  {
    "url": "img/backend/48c832dbb6fd5266b69d8573bc18972bd4073622.gif",
    "revision": "4610075c7aed0ae0955dced2bc01a0c0"
  },
  {
    "url": "img/backend/48c832dbb6fd5266b6c18573bc18972bd50736f6.gif",
    "revision": "72dfacdee62e91b256eb177a7c7bd68a"
  },
  {
    "url": "img/backend/4e97afc27d1ed21b532a9782ba6eddc450da3ffd.gif",
    "revision": "101cc6e81bb5cc60aa99a76d4bc1af45"
  },
  {
    "url": "img/backend/ali/app_layout.png",
    "revision": "014d0cfed63df7dee08863aad495507d"
  },
  {
    "url": "img/backend/CountDownLatch.png",
    "revision": "806db4304c12b0c08ff64a5fa2ce15ac"
  },
  {
    "url": "img/backend/docker/搜狗截图20180303145450.png",
    "revision": "b72094f2dc137f642b258d659ba7c5de"
  },
  {
    "url": "img/backend/docker/搜狗截图20180303145531.png",
    "revision": "0192e016514ae6de37acb335483c6365"
  },
  {
    "url": "img/backend/docker/搜狗截图20180303165113.png",
    "revision": "57658a824fedd4daf6c46fb28ddf9a2e"
  },
  {
    "url": "img/backend/HashMap/20180423002750407.png",
    "revision": "f35b7d5feca86f51427b731dd5310e6e"
  },
  {
    "url": "img/backend/itext/pdf2.png",
    "revision": "f557069c584ea0c2bf4031d2306beb5f"
  },
  {
    "url": "img/backend/itext/pdf3.png",
    "revision": "18753afbd11acf6c3864eab6b2e2dd16"
  },
  {
    "url": "img/backend/javaNamingConvention01.png",
    "revision": "60f1ff46b3e4fc370a899dc6d5447adf"
  },
  {
    "url": "img/backend/jvm/gc001.png",
    "revision": "9096a5c1aa708e99e4a0eb011c39f110"
  },
  {
    "url": "img/backend/jvm/gc002.png",
    "revision": "04f03419851adab68f221464d5f236fe"
  },
  {
    "url": "img/backend/jvm/gc003.png",
    "revision": "7c61067e76f98493875fb0318535706f"
  },
  {
    "url": "img/backend/jvm/gc004.png",
    "revision": "fb57425f659c93e108b52848734291a5"
  },
  {
    "url": "img/backend/jvm/gc005.png",
    "revision": "39041532371209775ba5bcf397604011"
  },
  {
    "url": "img/backend/jvm/jvm001.png",
    "revision": "645747e72e6790bb9a70ae6166a61a33"
  },
  {
    "url": "img/backend/jvm/jvm002.png",
    "revision": "f46c1bb2f52ba3826599cf6a5959313e"
  },
  {
    "url": "img/backend/jvm/jvm003.png",
    "revision": "8cfa470daab1e9cde72e91a564182b95"
  },
  {
    "url": "img/backend/jvm/jvm004.png",
    "revision": "53c75a6570d0adf443287266c0fe7efe"
  },
  {
    "url": "img/backend/jwt.png",
    "revision": "08f10cff7fa522a07bdb68b8615c23d2"
  },
  {
    "url": "img/backend/rabbitmq/mq001.png",
    "revision": "06c224d930a517e0c68f6db2032e4a07"
  },
  {
    "url": "img/backend/rabbitmq/mq002.png",
    "revision": "4dee5cf620627c17c267d1a033d7ca86"
  },
  {
    "url": "img/backend/rabbitmq/mq003.png",
    "revision": "ffb23d11d23ddbd85c04820b3d016cc6"
  },
  {
    "url": "img/backend/rabbitmq/rabbitmq.png",
    "revision": "f8ed6faa42fcdba67c8ed7b2c59ac495"
  },
  {
    "url": "img/backend/rabbitmq/topic.png",
    "revision": "76d56b40d2a16592fef156f73f228d20"
  },
  {
    "url": "img/backend/rabbitmq/队列模型.png",
    "revision": "805d0059bd3df57f88b1fb5e0631a654"
  },
  {
    "url": "img/backend/redis/redis02.png",
    "revision": "c48e246e53e5d501cd0fcbdf87258d33"
  },
  {
    "url": "img/backend/redis/缓存更新.png",
    "revision": "29bb26641ac9ff576cffab4de9b0a4f7"
  },
  {
    "url": "img/backend/redis/缓存查询.png",
    "revision": "2fc82232bd83608e50aa29ecba90b733"
  },
  {
    "url": "img/backend/swagger2/swagger2.png",
    "revision": "0ac3840245a81620a4365409ce608e81"
  },
  {
    "url": "img/backend/ThreadTopCpuList.png",
    "revision": "e136dbafb0d88397b8df77e2f11078b7"
  },
  {
    "url": "img/backend/w670h390irtymmw8686038refernsinaim.jpg",
    "revision": "a90f3cdd39138e230011f0b01c303b47"
  },
  {
    "url": "img/backend/zk/zookeeper-1.png",
    "revision": "8297abcdf974db4decafd08880e3da1b"
  },
  {
    "url": "img/backend/zk/zookeeper-10.png",
    "revision": "f37ded35ba2dfc4abb8673f2e74b77c8"
  },
  {
    "url": "img/backend/zk/zookeeper-11.png",
    "revision": "dec4613d616f60acd1debe4219d439e6"
  },
  {
    "url": "img/backend/zk/zookeeper-12.png",
    "revision": "1a7f76b306d7681ddbfe49a235f1341b"
  },
  {
    "url": "img/backend/zk/zookeeper-2.png",
    "revision": "f935b72ec6d8c6fdc4397057b93f4a3b"
  },
  {
    "url": "img/backend/zk/zookeeper-3.png",
    "revision": "a032d1ffa28e51cdc8e6e4bc4a12cfa9"
  },
  {
    "url": "img/backend/zk/zookeeper-4.png",
    "revision": "3394793dc9472cab6ca9e0f91602a149"
  },
  {
    "url": "img/backend/zk/zookeeper-5.png",
    "revision": "2abba67d6ecc059e8ab6d3e931582d15"
  },
  {
    "url": "img/backend/zk/zookeeper-6.png",
    "revision": "fca25dd4addff024fab0210e325dbcdc"
  },
  {
    "url": "img/backend/zk/zookeeper-7.png",
    "revision": "f4a03fddf6c81ff74c2c58e7b2445095"
  },
  {
    "url": "img/backend/zk/zookeeper-8.png",
    "revision": "9d06f8ba5ff4a07d57f0ee322cd805b1"
  },
  {
    "url": "img/backend/zk/zookeeper-9.png",
    "revision": "469c14f12539f8a809a32c1d3d080376"
  },
  {
    "url": "img/backend/zk/脑裂.png",
    "revision": "7c0f917e2ebfb2c1efe21ebc7651823d"
  },
  {
    "url": "img/essay/005J4OU5ly1gec2bk061qj306o06ojrt.jpg",
    "revision": "cc5a100392c57e5dd63e2b043973e460"
  },
  {
    "url": "img/essay/006APoFYjw1fcg5hcgv0fg308c08c0sr.gif",
    "revision": "0ff360dc674dc00d70ce17b86098af8b"
  },
  {
    "url": "img/essay/006r3PQBjw1fbn7cbt4g2g308c08cjre.gif",
    "revision": "6c2f15228111a70b44f28ffec167575f"
  },
  {
    "url": "img/essay/006r3PQBjw1fbrk6urvr5g302i02iq3n.gif",
    "revision": "f814c4bae088a43847885adacfd3504b"
  },
  {
    "url": "img/essay/lmNRgg.png",
    "revision": "fd3cc2df1c32d13e911fc6349b4dc164"
  },
  {
    "url": "img/essay/lmUIQe.png",
    "revision": "b4204c68b6174c07220733dcaf165c3b"
  },
  {
    "url": "img/essay/lmUjW8.png",
    "revision": "1b4e086bec1e1c053c726cd7ba14b480"
  },
  {
    "url": "img/essay/lmUkxe.png",
    "revision": "ee27e01c1867214c85ea23a998707e7c"
  },
  {
    "url": "img/essay/lmUQG8.png",
    "revision": "4551e4806b560715c4910501cd4c756e"
  },
  {
    "url": "img/essay/NiceBlogExamples.png",
    "revision": "4ae74d1a112937624ddcb289604d9d2b"
  },
  {
    "url": "img/essay/ToDo.png",
    "revision": "6aa4b2d90ea09c3cbb13dbc24b5d3947"
  },
  {
    "url": "img/frontend/EChartsStudy/接入百度地图.png",
    "revision": "6536c736188c9ea30914de1c6f09e68c"
  },
  {
    "url": "img/frontend/EChartsStudy/柱+折线图.png",
    "revision": "012d1f48b8e15cf20e763ed5310210b0"
  },
  {
    "url": "img/frontend/EChartsStudy/迁徙图.png",
    "revision": "f9079e675926a79a70417595adf6ce6e"
  },
  {
    "url": "img/frontend/EChartsStudy/饼图.png",
    "revision": "5394c36784b787fd477693968c133693"
  },
  {
    "url": "img/frontend/viaStart/thumb.png",
    "revision": "0d4c9d70e021216c051bf1ce37a37da3"
  },
  {
    "url": "img/frontend/vuedemo/1.png",
    "revision": "ebc5b5e16665f1d3494b9ca7afce270f"
  },
  {
    "url": "img/frontend/vuedemo/2.png",
    "revision": "8c7a40b960334a58a097b1c2292a8fa4"
  },
  {
    "url": "img/frontend/vuedemo/3.png",
    "revision": "acb3adcb4752f27bc621c244252a63ae"
  },
  {
    "url": "img/frontend/vuedemo/4.png",
    "revision": "e0600647cb12f4f3a100383f91baa7c2"
  },
  {
    "url": "img/frontend/vuedemo/5.png",
    "revision": "c0b6c66dd9e8df10c0dda568268ff314"
  },
  {
    "url": "img/frontend/vuedemo/6.png",
    "revision": "2ccae59d8c1134edc7fdaf0a6e41e78d"
  },
  {
    "url": "img/other/4ec4e5f0-947b-3abe-9e8b-47bad5b8cf1c.jpg",
    "revision": "bb87f71654723ad895fa663f73f988b9"
  },
  {
    "url": "img/other/5666c8e4-867a-3356-9708-6ba918e87853.jpg",
    "revision": "8ea7006c94abe02131fccb395d9b82dd"
  },
  {
    "url": "img/other/72c84642-4439-3120-9794-13892b29f00d.jpg",
    "revision": "ee5956c70fc130b28ed254f12a8c297b"
  },
  {
    "url": "img/other/766d39ee-fbf0-329e-8973-45e90625b579.jpg",
    "revision": "74a8a345f1e226513f3c5c0d4c8249bd"
  },
  {
    "url": "img/other/c33a5027-85d3-3eb4-a785-dd404f674baa.jpg",
    "revision": "ef1950ef5e1aec69e6f87b12e760c518"
  },
  {
    "url": "img/other/comment.png",
    "revision": "6878f2fce5e82c12f91eef87bde8bd2c"
  },
  {
    "url": "img/other/git_001.png",
    "revision": "dad7a6694ad6026308d580ada34703f5"
  },
  {
    "url": "img/other/http001.jpg",
    "revision": "856031f897fce74ca2103cd443e81fae"
  },
  {
    "url": "img/other/person_lital.gif",
    "revision": "3ef9a43d5849c4a7f5abd163f80de6b2"
  },
  {
    "url": "index.html",
    "revision": "095a76eeaba7a37c2187f2dc79fba3ab"
  },
  {
    "url": "js/MouseClickEffect.js",
    "revision": "f1e5bfcef7a60110c9b56f2ad16691d6"
  },
  {
    "url": "logo.png",
    "revision": "75a7175d16facb204b22f536bb9bb289"
  },
  {
    "url": "other/friends.html",
    "revision": "54149113119bac5a0d22337e4cc372b7"
  },
  {
    "url": "other/project.html",
    "revision": "72cbced2d8a01d50e1965a60c54f5ffa"
  },
  {
    "url": "tag/Docker/index.html",
    "revision": "d22c8e33d2c5aa19662d738db82fe404"
  },
  {
    "url": "tag/ECharts/index.html",
    "revision": "0b21c94a3e9e87a0da99fcccccac0f48"
  },
  {
    "url": "tag/git/index.html",
    "revision": "1ecc872327470eee0ec2f0acf1943e0c"
  },
  {
    "url": "tag/index.html",
    "revision": "82589b09fd719dea34342bd85c1e4d45"
  },
  {
    "url": "tag/IO模型/index.html",
    "revision": "896315a5353637ee399b4920a10af5d3"
  },
  {
    "url": "tag/Java/index.html",
    "revision": "8fbef51e5a8645235fce99122861ea5d"
  },
  {
    "url": "tag/Java/page/2/index.html",
    "revision": "dab6995a194aa727a6d7ec87acfdaafb"
  },
  {
    "url": "tag/Java/page/3/index.html",
    "revision": "40d7f3e24e082a0ccd3217fa38e5ef05"
  },
  {
    "url": "tag/JavaScript/index.html",
    "revision": "6ab121604685a5a3924735f2d8c82b48"
  },
  {
    "url": "tag/json/index.html",
    "revision": "a62d6a9a30cf0dcdcb6ed01775ff44f5"
  },
  {
    "url": "tag/jvm/index.html",
    "revision": "c9b8be638ddad9695c9359e45594cd33"
  },
  {
    "url": "tag/jwt/index.html",
    "revision": "000dab942cff0e41bb3c9d1ea2c2644e"
  },
  {
    "url": "tag/k8s/index.html",
    "revision": "6c9223ba6fd777cb5e91146ddebbd175"
  },
  {
    "url": "tag/linux/index.html",
    "revision": "b9730b0c3d968c57f6bef7ee79c987ef"
  },
  {
    "url": "tag/MyBatis/index.html",
    "revision": "673d391388cdea331c07c65d991a888b"
  },
  {
    "url": "tag/pdf/index.html",
    "revision": "52a39dee7be7e85790821ed43d7336ee"
  },
  {
    "url": "tag/poi/index.html",
    "revision": "62f6d0bbb4d8b08eae3346de5b755384"
  },
  {
    "url": "tag/RabbitMQ/index.html",
    "revision": "51426e8a51c2c624f711ba97e823a5ba"
  },
  {
    "url": "tag/Redis/index.html",
    "revision": "6dce036c1bcb2e72d898b73b4cc2e69c"
  },
  {
    "url": "tag/SPI/index.html",
    "revision": "63b83108c939e20ffe5bc55372752b7e"
  },
  {
    "url": "tag/SpringSecurity/index.html",
    "revision": "a2f6f082d0af2cfeac61d88e10e892cb"
  },
  {
    "url": "tag/sql优化/index.html",
    "revision": "75b302430d69dbb9bcfa1d6c97240e5b"
  },
  {
    "url": "tag/Swagger2/index.html",
    "revision": "1021882eccdc084bcc68233e179fa05a"
  },
  {
    "url": "tag/Via/index.html",
    "revision": "a00871bb4699721f52b302d39f2e7f05"
  },
  {
    "url": "tag/Vue/index.html",
    "revision": "422ab756b69040c003cc078fb1651570"
  },
  {
    "url": "tag/vuepress/index.html",
    "revision": "12724b6d07a4007f1043a34e2989e67a"
  },
  {
    "url": "tag/zookeeper/index.html",
    "revision": "feec422df03c9b487e312d98dcc65b97"
  },
  {
    "url": "tag/ZooKeeper/index.html",
    "revision": "89ded9a9822fabd6e5e889c9fd727dcf"
  },
  {
    "url": "tag/分布式/index.html",
    "revision": "18683e1d382ceccbd978c7cdce7e405a"
  },
  {
    "url": "tag/单元测试/index.html",
    "revision": "d1abaacf8ec4c8a2c69aa7a7e2a28991"
  },
  {
    "url": "tag/复习/index.html",
    "revision": "cbf0a0251860541ee47ac883e2e690d6"
  },
  {
    "url": "tag/多线程/index.html",
    "revision": "07107f696bc83cf9d97f21bda66ff766"
  },
  {
    "url": "tag/定时任务/index.html",
    "revision": "2a163a6f40dbdba2478e2b5ec73e23d6"
  },
  {
    "url": "tag/开发规范/index.html",
    "revision": "645729590ffea4d143388bdb8b3aab0c"
  },
  {
    "url": "tag/日志/index.html",
    "revision": "9107f93f9d2cc69385057b3beb0cd6e5"
  },
  {
    "url": "tag/源码分析/index.html",
    "revision": "6d0d5fdfd2fe71d5fedf77df10bb319a"
  },
  {
    "url": "tag/网关/index.html",
    "revision": "8d397b52af70749973362bdaa8fb27b6"
  },
  {
    "url": "tag/网络协议/index.html",
    "revision": "7def9b9978cad908724db9c188ac5d4b"
  },
  {
    "url": "tag/随笔/index.html",
    "revision": "b4f90e28e31aa3c21467e7914c0e9700"
  },
  {
    "url": "tag/随笔/page/2/index.html",
    "revision": "5a1f7a44239e8f237e1c5198608e351e"
  },
  {
    "url": "timeline/index.html",
    "revision": "1ccee1d150b2c8132ef3073d81526787"
  },
  {
    "url": "view/index.html",
    "revision": "471c6fd66ac302098c025d89a0777b81"
  },
  {
    "url": "view/kQWXr.gif",
    "revision": "e1effde1daad09edcb5d776c7f603b6a"
  },
  {
    "url": "view/love.html",
    "revision": "68de52e48f4306179d313c0604d4ef57"
  },
  {
    "url": "view/rddek.gif",
    "revision": "638c77362a2c110318d58cc3935f3177"
  },
  {
    "url": "view/比心1.png",
    "revision": "e7be9815e3eda6fdda33d952ec4055bb"
  },
  {
    "url": "views/backend/annotationLog.html",
    "revision": "c10a98adb5931286417fbfa45ad456b7"
  },
  {
    "url": "views/backend/API网关概述.html",
    "revision": "0ad153f2b4b5b8c159dadbc7a450e241"
  },
  {
    "url": "views/backend/ArrayList.html",
    "revision": "2bb0db89122d646c4352ec9667761e26"
  },
  {
    "url": "views/backend/CountDownLatch.html",
    "revision": "fd77c706de0d474e56aa561aaf45cc7d"
  },
  {
    "url": "views/backend/docker.html",
    "revision": "a3da07c39768091ed4160f91646c7619"
  },
  {
    "url": "views/backend/EasyExcel.html",
    "revision": "d66475151bc0fe4b04c78584ac4f42cb"
  },
  {
    "url": "views/backend/HashMap.html",
    "revision": "3c3ee52d80c964ee297a63af72d830d0"
  },
  {
    "url": "views/backend/itext.html",
    "revision": "fe10932ce2c9f3c5d58ee25da515d9b8"
  },
  {
    "url": "views/backend/java_io模型.html",
    "revision": "ba3f3411a79c4963ffd3c7b27c274ea4"
  },
  {
    "url": "views/backend/javaLock.html",
    "revision": "33d3b915f6fcafc59cd646b383bc18c8"
  },
  {
    "url": "views/backend/JUC.html",
    "revision": "5aea481e445ca68b4254b8596ef2c8ac"
  },
  {
    "url": "views/backend/junit4.html",
    "revision": "10bde6340e7865bb42195f312cd1bd86"
  },
  {
    "url": "views/backend/jvm.html",
    "revision": "b4d443070136a5ad61ae5f4f1a0dc6bd"
  },
  {
    "url": "views/backend/jwt.html",
    "revision": "fbcc3949969ae77a85cfb3710c8e7c6f"
  },
  {
    "url": "views/backend/mybatis一二级缓存.html",
    "revision": "7eabf9f088789a54e64fecb832bc83f6"
  },
  {
    "url": "views/backend/mysql_explain.html",
    "revision": "e25183766d0d21dcba453aa375779746"
  },
  {
    "url": "views/backend/poi.html",
    "revision": "2d5d5060212a6d1cb8cb5fa0c61ac677"
  },
  {
    "url": "views/backend/quartz.html",
    "revision": "ae5882f8a8b548a5cf2efa599c9d50d2"
  },
  {
    "url": "views/backend/rabbitmq001.html",
    "revision": "b01a808c54e4aabc5d8b64bcce9f2215"
  },
  {
    "url": "views/backend/rabbitmq002.html",
    "revision": "1350c419d992e525254376a7028fd139"
  },
  {
    "url": "views/backend/redis01.html",
    "revision": "7031072ece2ce0025a9295c434f98d5c"
  },
  {
    "url": "views/backend/redis02.html",
    "revision": "64474b9057d912397cc6cb020426ea51"
  },
  {
    "url": "views/backend/ReentrantLock.html",
    "revision": "97b3b9d1747ee15472d31d6189d7691e"
  },
  {
    "url": "views/backend/SchedulingConfigurer.html",
    "revision": "2b59f3fb426170fbbfa86a2d5dd0caef"
  },
  {
    "url": "views/backend/SPI_JdkDubboSpring.html",
    "revision": "85ba0ea6336edfffddacca682933426d"
  },
  {
    "url": "views/backend/spring_application_json.html",
    "revision": "9527ae56ed8f760714cb4c7dbb98203f"
  },
  {
    "url": "views/backend/spring-security-01.html",
    "revision": "63f287993c55d12637e6fb1965359d58"
  },
  {
    "url": "views/backend/SSH.html",
    "revision": "d6906435ab8bbb98d017a25084bcc990"
  },
  {
    "url": "views/backend/swagger2.html",
    "revision": "e95f9cd97d74e32a1e299e7e89535fc2"
  },
  {
    "url": "views/backend/thread.html",
    "revision": "e00e5fc93ddb54311d8271bc345b169c"
  },
  {
    "url": "views/backend/ThreadLocal.html",
    "revision": "3582c764618d4c110c27bc4661166d6a"
  },
  {
    "url": "views/backend/ThreadPool.html",
    "revision": "6b493f9a70db0582faad862bf27b01c6"
  },
  {
    "url": "views/backend/ThreadPool2.html",
    "revision": "b8d4705a1d7d3b4b1d26f4eb0aa3b98c"
  },
  {
    "url": "views/backend/ThreadTopCPU.html",
    "revision": "721fa4ef720c538f522e5e10b837f07c"
  },
  {
    "url": "views/backend/zk选举和一致性.html",
    "revision": "2300c831bd2b573738008092f6d41bc2"
  },
  {
    "url": "views/backend/zookeeper.html",
    "revision": "9670a0fda1738023b4d3adc31b80c1a6"
  },
  {
    "url": "views/backend/分布式系统概述.html",
    "revision": "3b9bfedaa604429dce6cb070f49b63f0"
  },
  {
    "url": "views/backend/动态代理和静态代理区别.html",
    "revision": "e4c5d4d82728555b35b1a27fcfe43b20"
  },
  {
    "url": "views/essay/20190928.html",
    "revision": "918dfbd4093a2804ea9ac68ec4256a93"
  },
  {
    "url": "views/essay/20191109.html",
    "revision": "38a1f39ef3b3cef711ce32110732a075"
  },
  {
    "url": "views/essay/20191116.html",
    "revision": "27d45312a155f4a15f85de318105b4ff"
  },
  {
    "url": "views/essay/20191130.html",
    "revision": "579bb4f4e480ef23738697032591b867"
  },
  {
    "url": "views/essay/20200227.html",
    "revision": "eedfbf94f84111275b8d5a6503f44ecd"
  },
  {
    "url": "views/essay/20200301.html",
    "revision": "936f0c098ee0b4b9c0f3bc57101a20c8"
  },
  {
    "url": "views/essay/20200703.html",
    "revision": "f328a4e56fd046cfe9aeeb521039d274"
  },
  {
    "url": "views/essay/20200715.html",
    "revision": "8e0797159f1e7c30d65702b03e0d218e"
  },
  {
    "url": "views/essay/20200813.html",
    "revision": "79d00352c890e745980682e71cf85fc8"
  },
  {
    "url": "views/essay/20201012.html",
    "revision": "6445c0e5f6d5cb4666029dffc228c929"
  },
  {
    "url": "views/essay/20201119.html",
    "revision": "f71a5fe7447a571989f5e710dd6f138d"
  },
  {
    "url": "views/essay/20211216.html",
    "revision": "ce91b73061ac49db1a03ac134789b537"
  },
  {
    "url": "views/frontend/EChartsStudy.html",
    "revision": "252cd9703ece3a82cc71fdd277a5edf1"
  },
  {
    "url": "views/frontend/js-json.html",
    "revision": "3fdebbade0f46e40f1c7774ea4de98ea"
  },
  {
    "url": "views/frontend/reco-info.html",
    "revision": "2ac77f2a992ff55d83051e8c5e0f13bb"
  },
  {
    "url": "views/frontend/TCP&UDP.html",
    "revision": "7b454ec82040d20d560187840c8aa586"
  },
  {
    "url": "views/frontend/viaStart.html",
    "revision": "c98d34979579b7602da20af8dd87cbe7"
  },
  {
    "url": "views/frontend/vue-demo.html",
    "revision": "06239b2be5d62516c4cb00426f7fb71a"
  },
  {
    "url": "views/frontend/vuepress-plugin-boxx.html",
    "revision": "c1059b0f72dcd12d69c21d52de2fa0ea"
  },
  {
    "url": "views/index.html",
    "revision": "def70b785fd7dcb5ec30daf1d9cbc363"
  },
  {
    "url": "views/qaq/sum_db_001.html",
    "revision": "0a4ddac3b5f2f0d6266a78b70421a64a"
  },
  {
    "url": "views/qaq/sum_fe_001.html",
    "revision": "e2a827f6db38bfe2c80aae420e383aa8"
  },
  {
    "url": "views/qaq/sum_fe_002.html",
    "revision": "02d59e7c94a45b761cd60d54126c0573"
  },
  {
    "url": "views/qaq/sum_java_001.html",
    "revision": "3a2e5e73ee64b2c4f9250794d128608f"
  },
  {
    "url": "views/qaq/sum_java_002.html",
    "revision": "6cbbc2efebbbe8a3e26e7aa1f50ab010"
  },
  {
    "url": "views/qaq/sum_ms_001.html",
    "revision": "d697ee6c69fa8ee2a30d9f3fd08194dd"
  },
  {
    "url": "views/qaq/sum_spring_001.html",
    "revision": "4d8689a0203b5fc8f6c23d36295dc75d"
  },
  {
    "url": "views/qaq/sum_spring_002.html",
    "revision": "a5f5628cfd1f0b72fe4b6e9cbddb816d"
  },
  {
    "url": "views/qaq/sum_spring_003.html",
    "revision": "abe6c627b1e6f9b636c7f777437eb86a"
  },
  {
    "url": "views/specification/ali.html",
    "revision": "143d46ae77ea2daac522502385f22db5"
  },
  {
    "url": "views/specification/git.html",
    "revision": "a52589363fa8bab236b32f894a171dac"
  },
  {
    "url": "views/specification/guide.html",
    "revision": "d3b439d92e87f975af4cfe4b4b5bca67"
  },
  {
    "url": "views/specification/javaNamingConvention.html",
    "revision": "89bfb5944d568f62d360201c594a16ca"
  },
  {
    "url": "views/specification/k8s基本命令与pod管理.html",
    "revision": "6dd70e76f78101bd4d54ae38d6869850"
  },
  {
    "url": "views/specification/linux01.html",
    "revision": "1cf129590eb10f93e8ff40cb2c797283"
  },
  {
    "url": "views/specification/objectModel.html",
    "revision": "8fe99b03a49275172dbf5feca7483119"
  },
  {
    "url": "views/specification/wildcard.html",
    "revision": "b07c17a2c1478d8bcfeaa04a7a47091d"
  },
  {
    "url": "views/specification/提交规范.html",
    "revision": "9800c1d0bc74f9a2a515789034968206"
  },
  {
    "url": "vuepress/android-chrome-192x192.png",
    "revision": "c9e32c4dc8764cfc7e5b7a13771a2f14"
  },
  {
    "url": "vuepress/android-chrome-512x512.png",
    "revision": "dc6d4703b55a3a4273fe1b906f022563"
  },
  {
    "url": "vuepress/apple-touch-icon-120x120.png",
    "revision": "aca5f9ce7aff36245ae262dff595d0de"
  },
  {
    "url": "vuepress/apple-touch-icon-152x152.png",
    "revision": "4a999ef21d86256ea277b2f23bd0bd4a"
  },
  {
    "url": "vuepress/apple-touch-icon-180x180.png",
    "revision": "b1bffec5d656865886b7336a59a94401"
  },
  {
    "url": "vuepress/apple-touch-icon-57x57.png",
    "revision": "7ae9f6028ae7e58e784f7f006c1b1902"
  },
  {
    "url": "vuepress/apple-touch-icon-60x60.png",
    "revision": "ccba5c67847684194179d64aa996a781"
  },
  {
    "url": "vuepress/apple-touch-icon-72x72.png",
    "revision": "6f63676dd29d51891e9a9921947c77bf"
  },
  {
    "url": "vuepress/apple-touch-icon-76x76.png",
    "revision": "cc4159e14bf07dac50be9a1b3d05ec09"
  },
  {
    "url": "vuepress/apple-touch-icon.png",
    "revision": "b1bffec5d656865886b7336a59a94401"
  },
  {
    "url": "vuepress/favicon-16x16.png",
    "revision": "a95d55ee9164ac2d295287f577fc9caf"
  },
  {
    "url": "vuepress/favicon-32x32.png",
    "revision": "c3d1d95b9b8c82e14083eeb7a62da466"
  },
  {
    "url": "vuepress/head-fish.jpg",
    "revision": "ab7a9c264c4e2e0cddbf8a3229e8b2a0"
  },
  {
    "url": "vuepress/logo.png",
    "revision": "75a7175d16facb204b22f536bb9bb289"
  },
  {
    "url": "vuepress/msapplication-icon-144x144.png",
    "revision": "0495b48d6df2671dcd9cca864ea69934"
  },
  {
    "url": "vuepress/safari-pinned-tab.svg",
    "revision": "da18cbd56328aea79d471efbee77ba53"
  },
  {
    "url": "vuepress/topic.png",
    "revision": "bf80a6f75ed6aff874261bb1d13ff529"
  },
  {
    "url": "vuepress/zanshang01.png",
    "revision": "19f90a3088cb6c2d9eca4bcd02feae9c"
  },
  {
    "url": "vuepress/znote.png",
    "revision": "0098af9084c619fae94c3d593c609bbd"
  },
  {
    "url": "vuepress/zpj80231-logo-1.png",
    "revision": "97de419e4928299047a1de1b2b249f63"
  },
  {
    "url": "vuepress/zpj80231-logo-2.png",
    "revision": "a2aa1799583b0104477b398b98b757c3"
  },
  {
    "url": "vuepress/zpj80231-logo-bg.png",
    "revision": "097cde6f5b50f6d9dabc79d51bf415ee"
  },
  {
    "url": "vuepress/个人微信二维码.jpg",
    "revision": "75a2076c48fa0ebb73f3dfb95a8c5864"
  },
  {
    "url": "vuepress/公众号二维码.jpg",
    "revision": "a0adc2b52f30f9607d300532bf775dce"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
addEventListener('message', event => {
  const replyPort = event.ports[0]
  const message = event.data
  if (replyPort && message && message.type === 'skip-waiting') {
    event.waitUntil(
      self.skipWaiting().then(
        () => replyPort.postMessage({ error: null }),
        error => replyPort.postMessage({ error })
      )
    )
  }
})
