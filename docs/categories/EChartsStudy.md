---
title: ECharts常用图表
date: 2019-08-03 17:37:25
tags:
- ECharts
catagories:
- ECharts
---

::: tip 唐.杜甫《奉赠韦左丞丈二十二韵》

读书破万卷，下笔如有神

 :::

[[toc]]

## 介绍

1. 把常用的ECharts图表整理一下，方便日后的使用

2. 图表实例可见：[http://zpj80231.gitee.io/echartsstudy/](http://zpj80231.gitee.io/echartsstudy/)


## 常用网址

- 在ECharts官网运行编辑实例：[https://www.echartsjs.com/gallery/editor.html?c=doc-example/getting-started](https://www.echartsjs.com/gallery/editor.html?c=doc-example/getting-started)
- ECharts`option`中各参数详细配置项：[https://echarts.baidu.com/option.html#grid](https://echarts.baidu.com/option.html#grid)

## 图表展示如下

- 柱+折线图

![](/img/EChartsStudy/柱+折线图.png)

- 饼图

![](/img/EChartsStudy/饼图.png)

- 迁徙图

![](/img/EChartsStudy/迁徙图.png)

- 接入百度地图

![](/img/EChartsStudy/接入百度地图.png)

## 使用服务端返回数据的异步加载和更新

详见官网：[异步数据加载和更新](https://echarts.baidu.com/tutorial.html#异步数据加载和更新)

```javascript
function method(init的char,option参数,查询条件1,查询条件2,查询条件3){
	//ECharts 默认有提供了一个简单的加载动画。只需要调用 showLoading 方法显示。数据加载完成后再调用 hideLoading 方法隐藏加载动画。
    chart.showLoading({
		text: '加载中...'
	});
    
	$.ajax({
		type:"POST",
		data:{"查询条件1":查询条件1,'查询条件2':查询条件2,'查询条件3':查询条件3},
        url:"/zhidinglianjie",
        success:function(data){
           if(data){
               	/*注意填入数据的格式：
               	series: [{
                    // 根据名字对应到相应的系列
                    name: '销量',
                    data: [53, 25, 26, 20, 32, 25]
        		}]*/
				option.series[0].data =  data.data
				option.series[1].data = data.categories
				chart.setOption(option);
           }else{
                
           }
            //数据加载完成后再调用 hideLoading 方法隐藏加载动画。
			chart.hideLoading();
        },
        error:function(jqXHR){
			chart.hideLoading();
        }
	});
}
```

