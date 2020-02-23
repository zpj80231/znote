# web音乐播放器
> 基于vue开发的web音乐播放器组件，几行代码即可快速引用到自己的项目当中。
# 使用方法
一、下载到本地
```bash
npm i zw-player
```
二、在需要使用的页面直接引入
引入模块
```bash
import Player from '播放器路径' #例如 import Player from 'zw-player' （放在了node_modules中）
```
然后在出口中注册组件
```bash
components: {
    Player
}
```
再直接使用组件
```bash
<Player></Player>
```

以上步骤例子：
```
<template>
    <div id="app">
        <Player></Player>
    </div>
</template>

<script>
import Player from 'zw-player'

export default {
    name: 'App',
    components: {
        Player
    }
}
</script>

<style>
</style>
```
三、运行项目，看见右下角播放器表示安装完成

# 界面展示
进入页面默认状态：
![后台播放界面](https://www.blogme.top/img/1161551317408288768.jpg)
点击播放器展开：
![播放器展开界面](https://www.blogme.top/img/1161551706664865792.png)
双击播放器或者点击播放器展开界面右上角 ...：
![播放列表选择界面](https://www.blogme.top/img/1161552220802650112.jpg)

# 问题和建议
欢迎在此处评论区指出：
[评论区](https://www.blogme.top/blog/#/Article/56)

# 结束
本项目是为了方便很多博主快速在自己的博客中引用一个音乐播放器，浏览文章时更加有氛围，本项目使用的网易云音乐的官方接口，功能可能不是很完善，今后会慢慢更新。