---
title: vuepress插件：`<Boxx/>`
date: 2019-11-17 15:53:26
tags:
- "vuepress"
categories:
- "前端"
isShowComments: false
---

<div style="height: 120px">
<Boxx changeTime='500' />
</div>

## 序言

- 由于在引入默认的VuePress Custom Containers太过笨重了，故闲来无事对其做一层封装简化使用

## 安装

- 在文件`package.json`中的`devDependencies`下加入`"vuepress-plugin-boxx": "0.0.6"`：

```json
	"devDependencies": {
        "vuepress-plugin-boxx": "0.0.6"
    }
```

- 在 vuepress 的`config.js`中配置`plugins`：

```json
plugins: [
    ["vuepress-plugin-boxx"]
  ],
```

- 在`package.json`目录下执行命令：`npm install`
- 正常启动项目，接着如下使用即可

## 使用

- 引入：只需在你想要插入的地方加入 `<Boxx/>` 即可（如顶部所示）
- 内容：默认随机展示名人名句，支持自定义
- 样式：有三种样式，默认为 tip 样式，支持自定义
- 注意：除`<Boxx/>`这个标签是必须外，标签属性均为可选，所有标签属性会在下文中详细介绍

## 默认样式

<Boxx type="tip" title="tip" content="只需一行：<code> &#60;Boxx type='tip' title='自定义' content='自定义' /> </code> " />

<Boxx type="warning" title="warning" content="只需一行：<code> &#60;Boxx type='warning' title='自定义' content='自定义' /> </code>" />

<Boxx type="danger" title="danger" content="只需一行：<code> &#60;Boxx type='danger' title='自定义' content='自定义' /> </code>" />

## 自定义标题和内容

- 如果默认的名人名句不满足需求的话，自定义只需指定两个属性`title`和`content`的值

| Name    | Type   | Description             |
| ------- | ------ | ----------------------- |
| title   | String | 要展示的`title`的内容，支持html标签   |
| content | String | 要展示的`content`的内容，支持html标签 |

- 当然你也可以只输入`title`或`content`，如下：

  <Boxx type="warning" :blockStyle="title01" title="短短的 title：<code> &#60;Boxx type='warning' title='自定义' /> </code>"/>
  <Boxx type="danger" :blockStyle="content01" content="更短短的 content：<code> &#60;Boxx type='danger' content='自定义' /> </code>"/>

## 自定义样式

<marquee>

<Boxx :blockStyle="blockStyle"  />
<Boxx type="warning" :blockStyle="titleStyle" :titleStyle="titleStyle" changeTime="1000" title="我是一个大大的且变化的 title"/>
<Boxx type="danger" :blockStyle="contentStyle" :contentStyle="contentStyle" content="我是一个小小的<br><marquee>content</marquee>"/>

 </marquee>

- 可以通过以下几个属性实现

| Name         | Type   | Description           |
| :----------- | ------ | --------------------- |
| blockStyle   | Object | 整体块元素的样式      |
| titleStyle   | Object | 只针对`title`的样式   |
| contentStyle | Object | 只针对`content`的样式 |
| changeTime | Number | 以毫秒值为单位的动态变化时间，顶部为例 |

需要注意的是：属性值传输的对象只能通过`v-bind:`绑定来实现

- 以下是对如上样式的示例，在Markdown中这样书写即可：

```javascript
<marquee>
<Boxx :blockStyle="blockStyle"  />
<Boxx type="warning" :blockStyle="titleStyle" :titleStyle="titleStyle" changeTime="1000" title="我是一个大大的且变化的 title"/>
<Boxx type="danger" :blockStyle="contentStyle" :contentStyle="contentStyle" content="我是一个小小的<br><marquee>content</marquee>"/>
 </marquee>

<script>
	export default {
		data() {
			return {
				blockStyle: {'background':'#eee','color':'red'},
                titleStyle: {'margin-left': '10%','font-size':'16px'},
                contentStyle: {'margin-left': '20%','font-size':'10px',
                               "margin-top": "1rem","margin-bottom": "0.4rem"},
			}
		}
	}
</script>
```



<script>
	export default {
		data() {
			return {
                title01: {'margin-left': '10%'},
                content01: {'margin-left': '20%'},
				blockStyle: {'background':'#eee','color':'red'},
                titleStyle: {'margin-left': '10%','font-size':'16px'},
                contentStyle: {'margin-left': '20%','font-size':'10px',
                               "margin-top": "1rem","margin-bottom": "0.4rem"},
			}
		}
	}
</script>