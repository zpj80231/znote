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
    "revision": "9118ee4713fac06ff6122ba6cfba8f9b"
  },
  {
    "url": "about/index.html",
    "revision": "b63b07d71362adec77505033e57f4d43"
  },
  {
    "url": "assets/css/0.styles.26ba07dc.css",
    "revision": "0a9c8b058565d62207c58bb0cb93ee26"
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
    "url": "assets/js/1.32b9718e.js",
    "revision": "9406ceba8c7a75ce21fdcc0ffbda184b"
  },
  {
    "url": "assets/js/10.28a6cfc5.js",
    "revision": "353b835de64c94eec6d3a9ae91ac4c33"
  },
  {
    "url": "assets/js/100.066704f9.js",
    "revision": "ad319a2608316aa65194be7d8817beb5"
  },
  {
    "url": "assets/js/101.4407a787.js",
    "revision": "038efaf2bbf33ef4fbfee89c7924c2ce"
  },
  {
    "url": "assets/js/102.e1067238.js",
    "revision": "b12005c6065eab508efd1b889992b626"
  },
  {
    "url": "assets/js/103.342dc95d.js",
    "revision": "31cd31777f089917a68485911efaffde"
  },
  {
    "url": "assets/js/104.e6b47e0c.js",
    "revision": "0a11716aab618dcb575f66686e8fe1f0"
  },
  {
    "url": "assets/js/105.b55864e6.js",
    "revision": "d104b87eb69b53f777733ccd2a9f91d4"
  },
  {
    "url": "assets/js/106.abe65691.js",
    "revision": "9943bad13dd39f8ddb1d32e46742e6ed"
  },
  {
    "url": "assets/js/11.df8a2d71.js",
    "revision": "9fa2c43e485877f4c5de4716ca3ecf59"
  },
  {
    "url": "assets/js/12.6edacd55.js",
    "revision": "52fc79b9a25df0ff5d29d8337b292fc9"
  },
  {
    "url": "assets/js/13.8697806f.js",
    "revision": "9837333eab414c6fa94aa6a9f4a38dde"
  },
  {
    "url": "assets/js/14.7255f28e.js",
    "revision": "e52bddb193252c10477fca3d86d32529"
  },
  {
    "url": "assets/js/15.e2641d8b.js",
    "revision": "443ac1055a826035bce11cecfbc50b2e"
  },
  {
    "url": "assets/js/16.d34299db.js",
    "revision": "197aef67e6a8d88fb4a3e0b9c1b5d364"
  },
  {
    "url": "assets/js/17.8b3efeab.js",
    "revision": "4d63572ab03d4a8f915eea5973b2a3f5"
  },
  {
    "url": "assets/js/18.5abc9afc.js",
    "revision": "0879aa95b4fefac79c00b9e2097275d1"
  },
  {
    "url": "assets/js/19.0898944e.js",
    "revision": "ea17c0762032eb9dc7c1e0cff2f7ddff"
  },
  {
    "url": "assets/js/2.392cf0c2.js",
    "revision": "cf54fa547c1bf3b52189130bc5f0845f"
  },
  {
    "url": "assets/js/20.fa3a58ef.js",
    "revision": "43102ac31a222c8ce33866e49defcdd4"
  },
  {
    "url": "assets/js/21.d73ee505.js",
    "revision": "9bd07c4386067bb8b654c2b3a32ede52"
  },
  {
    "url": "assets/js/22.99c14e00.js",
    "revision": "d565f792aa2669391b6ef7c98fc7e9f8"
  },
  {
    "url": "assets/js/23.75d2c5d5.js",
    "revision": "9826fa50392def964884e26b21a1d535"
  },
  {
    "url": "assets/js/24.ee71474a.js",
    "revision": "6e67421605ab1672a68409693fa13b2c"
  },
  {
    "url": "assets/js/25.7504e6d9.js",
    "revision": "b213f05fe6a4b75022f0c40a9e48b432"
  },
  {
    "url": "assets/js/26.9375dd53.js",
    "revision": "4385bdc3f1b6becb32be841140f98434"
  },
  {
    "url": "assets/js/27.2b194838.js",
    "revision": "89764b7b3210a3e6c1eff1a466955da3"
  },
  {
    "url": "assets/js/28.5607992f.js",
    "revision": "c1f2eeb57cb92b7349e9af146712bc59"
  },
  {
    "url": "assets/js/29.a1685244.js",
    "revision": "7221b8ed2506826d4dd7f1ede1bec3f1"
  },
  {
    "url": "assets/js/30.40d23741.js",
    "revision": "f4839b3439544fec3fc79f0165720372"
  },
  {
    "url": "assets/js/31.f18f0f2a.js",
    "revision": "f4b0d801bd691f959834b2f89523b3e9"
  },
  {
    "url": "assets/js/32.9371d9f6.js",
    "revision": "98ec883234f3480eefdff8f0a113fd08"
  },
  {
    "url": "assets/js/33.7036a2b4.js",
    "revision": "224b730c007156e1eb6a4326fb8ae4ba"
  },
  {
    "url": "assets/js/34.eb32c10a.js",
    "revision": "8b54c5ec4a054bba8474ae0eeb045861"
  },
  {
    "url": "assets/js/35.9abc3476.js",
    "revision": "30ba31c72c19115e8e9dd34037d5b0e3"
  },
  {
    "url": "assets/js/36.f519c572.js",
    "revision": "c1bbc341d61716a48d8dbd78024d6d10"
  },
  {
    "url": "assets/js/37.4a18f09a.js",
    "revision": "0cf148587ed91f79c92721e82fe21bdf"
  },
  {
    "url": "assets/js/38.619b388f.js",
    "revision": "0bbc0d5fe728a00c4dac17cf96d7da16"
  },
  {
    "url": "assets/js/39.66d19678.js",
    "revision": "9f6a1f496ae42ce3b7e8ad69df8f7768"
  },
  {
    "url": "assets/js/40.695953ff.js",
    "revision": "221af38249df13e1db0719d05e89bc75"
  },
  {
    "url": "assets/js/41.074a7c83.js",
    "revision": "b646f408b64c6cc2f4e366159ef8f687"
  },
  {
    "url": "assets/js/42.5cc8dd0a.js",
    "revision": "0b14029fde519aa2017bef2f9f181c7c"
  },
  {
    "url": "assets/js/43.d36a126a.js",
    "revision": "db983d3829fdbb9a437db427db7616fc"
  },
  {
    "url": "assets/js/44.a85fd4e0.js",
    "revision": "561bc23baed94f0897b87a235ca357e4"
  },
  {
    "url": "assets/js/45.25591145.js",
    "revision": "58b70c574b7f682bb86d2a93f057c951"
  },
  {
    "url": "assets/js/46.16d436b1.js",
    "revision": "1f7d030dffc0ce2a5cacc28ad601e396"
  },
  {
    "url": "assets/js/47.c1da3c52.js",
    "revision": "0348da558095080aad6471a8ab6282a1"
  },
  {
    "url": "assets/js/48.fe528c90.js",
    "revision": "35128167baff0550c64a32587092434e"
  },
  {
    "url": "assets/js/49.23a66747.js",
    "revision": "1ea633a415723922df56d0d6dde81a73"
  },
  {
    "url": "assets/js/5.6aa1d9c8.js",
    "revision": "9f9b32f83e33b8bd63b55ee1f1a26ca3"
  },
  {
    "url": "assets/js/50.47060c30.js",
    "revision": "dccd769eb1261c76d12338e560843538"
  },
  {
    "url": "assets/js/51.10301659.js",
    "revision": "d6c927e1818229359fd9e09c41f3c28d"
  },
  {
    "url": "assets/js/52.5e2f10ed.js",
    "revision": "1b2b97890b418407f12efdc253b4549e"
  },
  {
    "url": "assets/js/53.c6c87fb9.js",
    "revision": "fa1b2abd72e3021582402293b46e44fb"
  },
  {
    "url": "assets/js/54.f0fabc4c.js",
    "revision": "88615635bf4a6d8cdb9c58580978e205"
  },
  {
    "url": "assets/js/55.82923509.js",
    "revision": "9067357cc3363c10f9ffbc7d186d3a27"
  },
  {
    "url": "assets/js/56.2baa7005.js",
    "revision": "54b04cfefb19a6ba40920d3656487f61"
  },
  {
    "url": "assets/js/57.03d5bec3.js",
    "revision": "b4569ce021c3194e1f23a3a0efd3375d"
  },
  {
    "url": "assets/js/58.e81bc6e1.js",
    "revision": "fb8de3e2d1992e2e09b1aa1801b1fd97"
  },
  {
    "url": "assets/js/59.0f64a4c1.js",
    "revision": "a57ba9839bd3f3f7510804ad287335d0"
  },
  {
    "url": "assets/js/6.e2ac37c4.js",
    "revision": "45bdb7e15dc221749d1b1a5554618a75"
  },
  {
    "url": "assets/js/60.7ba55758.js",
    "revision": "a4bbec5d1ec7676b7d332c99f7ec0255"
  },
  {
    "url": "assets/js/61.e5934a5a.js",
    "revision": "6fa9d792ae49d800b8fdf5fc210b0d9d"
  },
  {
    "url": "assets/js/62.5e278aba.js",
    "revision": "d49a9e7ecacfde67cb80c8a7013d64d6"
  },
  {
    "url": "assets/js/63.759bb1a2.js",
    "revision": "96c61b9438350517ea1481b49c6066a7"
  },
  {
    "url": "assets/js/64.c100704f.js",
    "revision": "f46de8a1252b083b3ed07c17438ae98a"
  },
  {
    "url": "assets/js/65.c7ec47db.js",
    "revision": "96e191fa75faad739d23bbc074e50f25"
  },
  {
    "url": "assets/js/66.95a20285.js",
    "revision": "0577e6ec31c1db18a95c1831d8998c45"
  },
  {
    "url": "assets/js/67.fa319616.js",
    "revision": "3c87b94b1ef2b37d37c0e39ef0e8665b"
  },
  {
    "url": "assets/js/68.76c9c1a2.js",
    "revision": "007a87d3dc0b4c534ab86d889c32b3a3"
  },
  {
    "url": "assets/js/69.f4de8987.js",
    "revision": "66957e17e0706503d8860f878474db2c"
  },
  {
    "url": "assets/js/7.c9a0b6bd.js",
    "revision": "433b67d93a096173cbde5879dd35d6d3"
  },
  {
    "url": "assets/js/70.3603c5d6.js",
    "revision": "6a722c94fdca622bbefeb58a7b4a9520"
  },
  {
    "url": "assets/js/71.27c8a008.js",
    "revision": "59c96edbaf7dbd87a3f9971562213306"
  },
  {
    "url": "assets/js/72.219256f4.js",
    "revision": "4a90eeffa1b359288b6258b97f22eec7"
  },
  {
    "url": "assets/js/73.d492f27f.js",
    "revision": "9336ce95b5285ed36770b69f345cf4ca"
  },
  {
    "url": "assets/js/74.5c235d44.js",
    "revision": "455d271cb55531ae1e8f86f87ecbca12"
  },
  {
    "url": "assets/js/75.46223517.js",
    "revision": "7fc43e2402b688f51744e6ffe5abd06e"
  },
  {
    "url": "assets/js/76.93797a0e.js",
    "revision": "4ba764d6f537c13a3fefd210d23d0748"
  },
  {
    "url": "assets/js/77.5e188667.js",
    "revision": "a1b2939d3b3d44cb0d546a6cce28014e"
  },
  {
    "url": "assets/js/78.c0795664.js",
    "revision": "94ce3913652ad0431c3c1bcbd9c95f1b"
  },
  {
    "url": "assets/js/79.721929d0.js",
    "revision": "7a1e4c9dd650c20cf577129a4df4d497"
  },
  {
    "url": "assets/js/8.661dcbfa.js",
    "revision": "21b4cbb2c7920115155b6428e97ae05c"
  },
  {
    "url": "assets/js/80.95921a39.js",
    "revision": "3b161b200cb7969722051c11187b0663"
  },
  {
    "url": "assets/js/81.b69b522b.js",
    "revision": "43ab6c6e19c4cab91cc5a0a80f5a08b6"
  },
  {
    "url": "assets/js/82.e864e8dd.js",
    "revision": "eb7379d1ac556f93ed82a833f178e319"
  },
  {
    "url": "assets/js/83.f2901f93.js",
    "revision": "8f78bfbce12cc5de0f134cf8d16e9bf2"
  },
  {
    "url": "assets/js/84.122cc8c3.js",
    "revision": "5acdcf6409e6e72b596050b4b91abf57"
  },
  {
    "url": "assets/js/85.b2c489e0.js",
    "revision": "c913c1c651da06639c4506268791707f"
  },
  {
    "url": "assets/js/86.abc42860.js",
    "revision": "b4a18598463f78cd0f8a7f62a66eea27"
  },
  {
    "url": "assets/js/87.e4634f9f.js",
    "revision": "675206241161c5bf94f734683fb88e9d"
  },
  {
    "url": "assets/js/88.5488a039.js",
    "revision": "3b21b220cbe34431b0af634447835ef4"
  },
  {
    "url": "assets/js/89.7a7c943b.js",
    "revision": "03baf83742b923190f119c7e3f760e2e"
  },
  {
    "url": "assets/js/9.ef576f0f.js",
    "revision": "ff69144c41e42ec3230d26d5e7262c0d"
  },
  {
    "url": "assets/js/90.2a57c73c.js",
    "revision": "5cb875a42ab747912ffe7fe72660d0e9"
  },
  {
    "url": "assets/js/91.d9230640.js",
    "revision": "6bac0d946467d60494c46c9b1f0695d5"
  },
  {
    "url": "assets/js/92.027307dd.js",
    "revision": "76894d6a3dd7195133235739aa438134"
  },
  {
    "url": "assets/js/93.63c514de.js",
    "revision": "e417474c6f17e522c83eb0b7736bf2ee"
  },
  {
    "url": "assets/js/94.3d560d61.js",
    "revision": "2281277cc01853d1414bc8928aa9478a"
  },
  {
    "url": "assets/js/95.6eb9b6c5.js",
    "revision": "5e427910033399300b35f2d1718807e0"
  },
  {
    "url": "assets/js/96.c6a8206b.js",
    "revision": "33e8df6ae2c3e5929d915f2a924291a2"
  },
  {
    "url": "assets/js/97.475ee313.js",
    "revision": "f84ceeddd870301d2d66eb09dd914c50"
  },
  {
    "url": "assets/js/98.ca1f2baf.js",
    "revision": "d553c470bba6d535bd844b47a2e90a5f"
  },
  {
    "url": "assets/js/99.86b7c01a.js",
    "revision": "e4b6334777c54a5236dab899100ac444"
  },
  {
    "url": "assets/js/app.f8a637f4.js",
    "revision": "c0d6f2990012390c1409536acd5e1980"
  },
  {
    "url": "assets/js/vendors~flowchart.4e8f7d7d.js",
    "revision": "5518cf523c28a81d665018f275d9ff55"
  },
  {
    "url": "categories/index.html",
    "revision": "d05267f59349a2ef834c596717dfcffa"
  },
  {
    "url": "categories/前端 Front-end/index.html",
    "revision": "bde2cd899a1bed07a1526ad559b25d61"
  },
  {
    "url": "categories/后端 Back-end/index.html",
    "revision": "081215d26c5fb5dc6c4e122b4979e7a9"
  },
  {
    "url": "categories/后端 Back-end/page/2/index.html",
    "revision": "4026649e27549a8bac24ddb635dc1dff"
  },
  {
    "url": "categories/后端 Back-end/page/3/index.html",
    "revision": "542e9d0638337f98f0f86b308bc20958"
  },
  {
    "url": "categories/后端 Back-end/page/4/index.html",
    "revision": "7d462146625423c308c95af35e555cd7"
  },
  {
    "url": "categories/后端 Back-end/page/5/index.html",
    "revision": "2f88bfe1db65d2d320b9be8a8df5c8dc"
  },
  {
    "url": "categories/知识晶体 Q&A/index.html",
    "revision": "90be74d097dd4406226d7ef3dd28a5e5"
  },
  {
    "url": "categories/规范 Standard/index.html",
    "revision": "4c7e12569998a24eeb765b16e73ad571"
  },
  {
    "url": "categories/随笔 Essay/index.html",
    "revision": "6b11aa317c7681fc1e3f93e9ded37577"
  },
  {
    "url": "categories/随笔 Essay/page/2/index.html",
    "revision": "dab3471e6b316728447901e374e0a905"
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
    "url": "img/backend/spring-ioc流程.jpg",
    "revision": "c18a8976242b758df685969800dbb175"
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
    "revision": "38320c293cd3ea03d18e2437aba48537"
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
    "revision": "bc9b9d298d98c0a45fb271f80d0f1f40"
  },
  {
    "url": "other/project.html",
    "revision": "0453c9d1fc8c17f010b1818d639d5f25"
  },
  {
    "url": "tag/Docker/index.html",
    "revision": "803308cbf678ce26dc94184f6bc65694"
  },
  {
    "url": "tag/ECharts/index.html",
    "revision": "db1fd3bfdecd6e1e64df4c2ffdc43d5f"
  },
  {
    "url": "tag/git/index.html",
    "revision": "86cc91c9dbacbfe740aa5956d10813c6"
  },
  {
    "url": "tag/index.html",
    "revision": "6b43394208219b8f06e382df17385056"
  },
  {
    "url": "tag/IO模型/index.html",
    "revision": "ab7f15b645a26f8b2401924f91a3a186"
  },
  {
    "url": "tag/Java/index.html",
    "revision": "4b9bea69e73e8cb17ffa9951e3bf16a4"
  },
  {
    "url": "tag/Java/page/2/index.html",
    "revision": "60a0f8c678318e2c28d3f38f28e532eb"
  },
  {
    "url": "tag/Java/page/3/index.html",
    "revision": "86d7ea450ff4a8cef8707d1fd688df75"
  },
  {
    "url": "tag/JavaScript/index.html",
    "revision": "ff5f68f743076943830731e62b2e78c0"
  },
  {
    "url": "tag/json/index.html",
    "revision": "8f8bc2ea976640592a8c2c23a26746f0"
  },
  {
    "url": "tag/jvm/index.html",
    "revision": "1718bec61bbc5eeaec58ef92aa01b829"
  },
  {
    "url": "tag/jwt/index.html",
    "revision": "861451796d318c7fe06b1357389ff59e"
  },
  {
    "url": "tag/k8s/index.html",
    "revision": "d494b86e49fe17c3a922284c23cdd486"
  },
  {
    "url": "tag/linux/index.html",
    "revision": "e0f8aafe7eccbf1075c319464b48f34b"
  },
  {
    "url": "tag/MyBatis/index.html",
    "revision": "e03b4fd6cd7d80900f482096a943f788"
  },
  {
    "url": "tag/pdf/index.html",
    "revision": "19b1e7d9935edbe13006b1a98397648d"
  },
  {
    "url": "tag/poi/index.html",
    "revision": "2d959d5c2da401f6cfba4755da9060d6"
  },
  {
    "url": "tag/RabbitMQ/index.html",
    "revision": "b81fb0e0446ed1710448f14ebe5cf817"
  },
  {
    "url": "tag/Redis/index.html",
    "revision": "026b71ea9773ecec06afc9bc8e38cf7b"
  },
  {
    "url": "tag/SPI/index.html",
    "revision": "8c8cc78f141971d38c3ce45449f1feb5"
  },
  {
    "url": "tag/SpringSecurity/index.html",
    "revision": "79e5790cc52d76c47bfc0500cbdc461f"
  },
  {
    "url": "tag/sql优化/index.html",
    "revision": "c9a4703f3ed3441a4790e9ee05fc7dfa"
  },
  {
    "url": "tag/Swagger2/index.html",
    "revision": "1b50c4d46a1b5b583cf6c1bb5be13819"
  },
  {
    "url": "tag/Via/index.html",
    "revision": "7aa0bfbbc0ada02b4ae1df0873e3c8b4"
  },
  {
    "url": "tag/Vue/index.html",
    "revision": "73949cff1f4cf28fbe0d17de2a3f1625"
  },
  {
    "url": "tag/vuepress/index.html",
    "revision": "131e20fbf106e351c2fd0f49227b9206"
  },
  {
    "url": "tag/zookeeper/index.html",
    "revision": "d51a26c07876418aa824d1b76d4352b0"
  },
  {
    "url": "tag/ZooKeeper/index.html",
    "revision": "734c7d091609a8d3545503f883064a72"
  },
  {
    "url": "tag/分布式/index.html",
    "revision": "6324773c0c2eb3bbb5813e13e74df148"
  },
  {
    "url": "tag/单元测试/index.html",
    "revision": "9da13e180c02f0ac2f0c8cc9daa5426f"
  },
  {
    "url": "tag/复习/index.html",
    "revision": "af6f41d240b0b173cf50948a36efa478"
  },
  {
    "url": "tag/多线程/index.html",
    "revision": "04a242a24d6db31569e9d5a8c3658204"
  },
  {
    "url": "tag/定时任务/index.html",
    "revision": "b7308f1b3c5d5d67ff93b0e808b94ffb"
  },
  {
    "url": "tag/开发规范/index.html",
    "revision": "2c07828ea2b010d7203e29811fd8997a"
  },
  {
    "url": "tag/日志/index.html",
    "revision": "ed100d9937dadbbdea3cb2582bfd399e"
  },
  {
    "url": "tag/源码分析/index.html",
    "revision": "782a9fe720b8a5197cdd1d1ee8a0a6e9"
  },
  {
    "url": "tag/网关/index.html",
    "revision": "e83a6bd6bfbf4e23ffb4558bb394276a"
  },
  {
    "url": "tag/网络协议/index.html",
    "revision": "53c89cbd38d015f4157851b04ca8cd22"
  },
  {
    "url": "tag/随笔/index.html",
    "revision": "5c7d70a7c93d89c713d3d39e594699c2"
  },
  {
    "url": "tag/随笔/page/2/index.html",
    "revision": "79df4b3cb6087301b569bdbc8b475016"
  },
  {
    "url": "timeline/index.html",
    "revision": "c411d94e4747e12c658243529e618b40"
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
    "revision": "142436a808884ae7b5b302056777a33f"
  },
  {
    "url": "views/backend/API网关概述.html",
    "revision": "5b218b1453b29506794002957944fd42"
  },
  {
    "url": "views/backend/ArrayList.html",
    "revision": "4410d2965400cc05e52fb75189d1b4c0"
  },
  {
    "url": "views/backend/CountDownLatch.html",
    "revision": "d615d0f95f9240a991e6b141d478a394"
  },
  {
    "url": "views/backend/docker.html",
    "revision": "09d9d364c81cae16d27c03940dffd4cb"
  },
  {
    "url": "views/backend/EasyExcel.html",
    "revision": "699a37042e176c753159ff361eac63d3"
  },
  {
    "url": "views/backend/HashMap.html",
    "revision": "4d52b72b5b755f046379f5188b71be3e"
  },
  {
    "url": "views/backend/itext.html",
    "revision": "976bebe302558eec1c1c4e7713484a05"
  },
  {
    "url": "views/backend/java_io模型.html",
    "revision": "b3ee0f50900991513d1f2fe41e14b788"
  },
  {
    "url": "views/backend/javaLock.html",
    "revision": "7f2ac660972db3522600b782d4394eb4"
  },
  {
    "url": "views/backend/JUC.html",
    "revision": "7ea7b1a3e3ca8bfdd6af15681a8c277c"
  },
  {
    "url": "views/backend/junit4.html",
    "revision": "918e39518e6ab0aafa7f37a79ae2ada7"
  },
  {
    "url": "views/backend/jvm.html",
    "revision": "962a56d3e20aadebefee25ed2638d087"
  },
  {
    "url": "views/backend/jwt.html",
    "revision": "0dadc7af91834a8ad7a92a8fdbfa1a6d"
  },
  {
    "url": "views/backend/mini-ioc.html",
    "revision": "242ea5f7ca4f6d9c1375083157e62717"
  },
  {
    "url": "views/backend/mybatis一二级缓存.html",
    "revision": "4a970a16b6054d13f0cab6314ea53cf9"
  },
  {
    "url": "views/backend/mysql_explain.html",
    "revision": "0e405f0e3294994643f58d3023483049"
  },
  {
    "url": "views/backend/OOM分类及排查.html",
    "revision": "b51314ece3bf19cc9dc2fa445b3d1eca"
  },
  {
    "url": "views/backend/poi.html",
    "revision": "6c99cb531546a6a287c7c7db3b81ed2f"
  },
  {
    "url": "views/backend/quartz.html",
    "revision": "263d3fe134d27457e0d2ed2453346015"
  },
  {
    "url": "views/backend/rabbitmq001.html",
    "revision": "f7004f0fd98889e3b26109e8ac26fc77"
  },
  {
    "url": "views/backend/rabbitmq002.html",
    "revision": "70ea5a499391a13f4564734014160920"
  },
  {
    "url": "views/backend/redis01.html",
    "revision": "21934a11f84612a7383bbea0b76cd7b3"
  },
  {
    "url": "views/backend/redis02.html",
    "revision": "597cc448f484c254baf37749b806545e"
  },
  {
    "url": "views/backend/redis使用场景.html",
    "revision": "1ad506479724736ffc94e5f6a5b8514a"
  },
  {
    "url": "views/backend/ReentrantLock.html",
    "revision": "47cdbe7e9ee9bf71f8aa0d8917cb1fa0"
  },
  {
    "url": "views/backend/SchedulingConfigurer.html",
    "revision": "83c49a2972bbe69b25b1229b723d2283"
  },
  {
    "url": "views/backend/SPI_JdkDubboSpring.html",
    "revision": "05a8eac074f0539f8fbc3e9d672fbc58"
  },
  {
    "url": "views/backend/spring_application_json.html",
    "revision": "41537c4a606e0ec3c91cad9e23edcd8a"
  },
  {
    "url": "views/backend/spring-security-01.html",
    "revision": "49020a1bae261f147f36476d2f71e186"
  },
  {
    "url": "views/backend/Spring的IOC源码以及流程分析.html",
    "revision": "67cbf7cd59aad2a8856bb226b3bf1bdf"
  },
  {
    "url": "views/backend/SSH.html",
    "revision": "6898b9a2bf5fe089edcc3f08dad78400"
  },
  {
    "url": "views/backend/swagger2.html",
    "revision": "f14ab0c083e49302464e1b67f545807b"
  },
  {
    "url": "views/backend/thread.html",
    "revision": "b277a8b61e40b79edb44a348fded6cc3"
  },
  {
    "url": "views/backend/ThreadLocal.html",
    "revision": "0434c587d574275cc398615c08313d88"
  },
  {
    "url": "views/backend/ThreadPool.html",
    "revision": "f13e4b1479febd398b1a6d8a0335a77e"
  },
  {
    "url": "views/backend/ThreadPool2.html",
    "revision": "46f1931d989d30c13cfb23971fffea00"
  },
  {
    "url": "views/backend/ThreadTopCPU.html",
    "revision": "72fe1deaf823c6e0de25d8819102a500"
  },
  {
    "url": "views/backend/zk选举和一致性.html",
    "revision": "b0b97fd1d16a900151ce2b7993dfd75d"
  },
  {
    "url": "views/backend/zookeeper.html",
    "revision": "82343d098cc430d7a5b8926057faaa00"
  },
  {
    "url": "views/backend/分布式系统概述.html",
    "revision": "e57805bd6c8fb3d8a0e53c5dc3187864"
  },
  {
    "url": "views/backend/动态代理和静态代理区别.html",
    "revision": "8e85dc1cf73ae1e8fc1684e05ba70cf3"
  },
  {
    "url": "views/backend/超时取消分析.html",
    "revision": "5de2709f48c249777c740ab2bab2b565"
  },
  {
    "url": "views/essay/20190928.html",
    "revision": "7144be574d91d92adc4272cd8ea20983"
  },
  {
    "url": "views/essay/20191109.html",
    "revision": "8c1d763b5daa03f99c184ddfed2b750c"
  },
  {
    "url": "views/essay/20191116.html",
    "revision": "ddd990b84bda16cfc7b1ebecbb17efc0"
  },
  {
    "url": "views/essay/20191130.html",
    "revision": "966d3c3ca55718f72e972240d72edcd1"
  },
  {
    "url": "views/essay/20200227.html",
    "revision": "a07879737d58f610d8214c4a573116da"
  },
  {
    "url": "views/essay/20200301.html",
    "revision": "29469fcae48d046d8456e7d5557e02c9"
  },
  {
    "url": "views/essay/20200703.html",
    "revision": "7548a91b97273cfecdf98b3d4deba55c"
  },
  {
    "url": "views/essay/20200715.html",
    "revision": "16d44c769185634868e2f30d389687bf"
  },
  {
    "url": "views/essay/20200813.html",
    "revision": "1259ba22267bc6abf4614ad07b817376"
  },
  {
    "url": "views/essay/20201012.html",
    "revision": "4338b98fd69f4f7b1e47806ee39c84d8"
  },
  {
    "url": "views/essay/20201119.html",
    "revision": "40da0cec766eaee97d7c1cc4780795a0"
  },
  {
    "url": "views/essay/20211216.html",
    "revision": "dab40b4287a7964f317e131ba82a3c11"
  },
  {
    "url": "views/frontend/EChartsStudy.html",
    "revision": "cb32938d2c015268ea7347368480bfbb"
  },
  {
    "url": "views/frontend/js-json.html",
    "revision": "a15ea50c9e866754a7da8a02f4d65f70"
  },
  {
    "url": "views/frontend/reco-info.html",
    "revision": "d7b9367b3ebfe8378806aea098a227cc"
  },
  {
    "url": "views/frontend/TCP&UDP.html",
    "revision": "db542d90b8b42ca85b7ddf7a56006e25"
  },
  {
    "url": "views/frontend/viaStart.html",
    "revision": "579ea0cfbb8316ea1fcbfd15c20c58d1"
  },
  {
    "url": "views/frontend/vue-demo.html",
    "revision": "72001004314ea9ddc2d4cbe8f144dc1f"
  },
  {
    "url": "views/frontend/vuepress-plugin-boxx.html",
    "revision": "4cba101bc78913ef549a45834620a09c"
  },
  {
    "url": "views/index.html",
    "revision": "3de57f908972fe88881222a01703f0d5"
  },
  {
    "url": "views/qaq/sum_db_001.html",
    "revision": "bb92c94653201e1b08da5ecfea33eb04"
  },
  {
    "url": "views/qaq/sum_fe_001.html",
    "revision": "134108e95a764b95d0f94e3c0a779989"
  },
  {
    "url": "views/qaq/sum_fe_002.html",
    "revision": "838990132250fb1b3df8e753626df93a"
  },
  {
    "url": "views/qaq/sum_java_001.html",
    "revision": "52e67d5c6d52206da6eeecb4f7de9271"
  },
  {
    "url": "views/qaq/sum_java_002.html",
    "revision": "495d198af2cfb4989a2f137167f9765b"
  },
  {
    "url": "views/qaq/sum_ms_001.html",
    "revision": "6c38426019daca8a9cabcfa0a7e76b72"
  },
  {
    "url": "views/qaq/sum_spring_001.html",
    "revision": "5208a2d7c0f6a4ded1a62949bf22a679"
  },
  {
    "url": "views/qaq/sum_spring_002.html",
    "revision": "461e1c577223444c0234330195ffe9ae"
  },
  {
    "url": "views/qaq/sum_spring_003.html",
    "revision": "6d31361a810ce47085e22bb22774b70f"
  },
  {
    "url": "views/specification/ali.html",
    "revision": "eae036115ba2bd539bc4129eaa8e6b07"
  },
  {
    "url": "views/specification/git.html",
    "revision": "fbb4e8b25d9c5b8dd81b1544b6bec20a"
  },
  {
    "url": "views/specification/guide.html",
    "revision": "fb1cdbe2b381ed1930e92ab699099f4d"
  },
  {
    "url": "views/specification/javaNamingConvention.html",
    "revision": "391488dcc4dff97e9ca529f9494549e9"
  },
  {
    "url": "views/specification/k8s基本命令与pod管理.html",
    "revision": "de582d241ea7b7e2ffbe2a0697435828"
  },
  {
    "url": "views/specification/linux01.html",
    "revision": "30da64c2303e818eb2cc9399061f1ea0"
  },
  {
    "url": "views/specification/objectModel.html",
    "revision": "a2fabd0a45b9054e0efea1f072ac1188"
  },
  {
    "url": "views/specification/wildcard.html",
    "revision": "f4785c9a84d891827b654774d2f17588"
  },
  {
    "url": "views/specification/提交规范.html",
    "revision": "3f51dd7a9223c870e2a589f3974f8c74"
  },
  {
    "url": "vuepress/android-chrome-192x192.png",
    "revision": "3a21fd95f501cbba95ccd6ccba826327"
  },
  {
    "url": "vuepress/android-chrome-512x512.png",
    "revision": "b23c11d769ccb252734d6489dd50bc86"
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
