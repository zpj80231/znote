---
title: "Q&A宝典-前端基础篇"
date: 2019-03-26
tags:
- 复习
categories:
- 总结
isShowComments: false
---

<Boxx/>


## Ajax

::: details 1. Ajax支持几种数据传递的方式?

1. **字符串** text/plain
2. **xml**	 text/xml
3. **json**	 text/plain

:::

## Json

::: details 1. json的格式?

1. **键值对** {key1:value1,key2:value2..}

2. **数组**   [value1,value2..]

> 其中key必须是String类型,value支持null,Object,json等

:::

::: details 2. json有哪几种封装方式?

1. 可以封装**任意类型的数据**
   		
     JSONObject jo1 = new JSONObject();
      		jo1.put("key",value);
     
2. 用来封装**自定义数据类型**和**Map**

     Map<Integer,String> map = new HashMap<>();<br/>
     map.put(1,"王者");
     map.put(2,"荣耀");<br/>
     JSONObject jo2 = JSONObject.fromObject(map);

3. 专门用来封装**集合**和**数组**

     List\<String\> list = new ArrayList<>();<br/>
     list.add("飞龙");list.add("在天");<br/>
     JSONArray jo3 = JSONArray.fromObject(list);

:::

::: details 3. json如何对自定义数据类型进行有选择性的封装?(hibernate中`防止`多表级联发生的`死循环`)

- 引入**JsonConfig**

  JsonConfig jc = new JsonConfig(new String[]{"不想要的属性1","不想要的属性2"..});<br/>
  JSONObject jo = JSONObject.fromObject(对象,jc);

:::

::: details 4. json的包名是?

​    net.sf.json.JSONArray;<br/>
​	net.sf.json.JSONObject;

:::

## jQuery

::: details 1. jQuery基本选择器

- #id、.class
- 查找所有未选中的input元素：`$("input:not(:checked)");`
- 选中所有name属性是newsletter的input元素：`$("input[name='newsletter']").attr("checked",true);`

:::

::: details 2. attr和prop的区别

*attr*：可以获取元素**自定义属性**和**本身自带的属性**<br/>
*prop*：用来获取元素**本身属性**

:::

::: details 3. disabled和readonly的区别

*disabled*：样式 灰色，**后台请求接收不到参数 始终为null**<br/>
*readonly*：样式 白色，**后台请求参数可以接收**

:::

::: details 3. 简述Css层叠特性与继承特性

- 层叠特性:
  当多种基本选择器出现冲突时优先级问题，`id选择器>类别选择器>标记选择器`

- 继承特性:
  当子元素与父元素没有任何冲突时，子元素会完全继承父元素的所有css渲染样式

:::

::: details 4. 写出至少三种Js选择器的使用方式

document.getElementById("idName");<br/>
document.getElementsByTagName("tagName");<br/>
document.getElementsByClassName("className");<br/>
document.getElementsByName("name");

:::

## Jsp el表达式

::: details 1. 请使用Js脚本在页面显示九九乘法表

```javascript
let str = "";
for(let a = 1;a<=9;a++){
    for(let b = 1;b<=a;b++){
        str += b+"*"+a+"="+b*a+"\t";
    }
    str += "<br />";
}					
document.write(str);
```

:::

::: details 2. el表达式取值

1. 通过属性取值：${param.键}<br/>
   拿取全局参数：${initParam.键}

2. 四范围取值：<br/>
   ${pageScope.elena} 当前页有效<br/>
   ${requestScope.elena} 跳转页面有效<br/>
   ${sessionScope.elena} session范围有效<br/>
   ${application.elena} 时间到期前一直有效

> 我们一般只写键,但是当有多个范围的键冲突时,默认拿取范围最小的键值

:::

::: details 3. el表达式的缺陷

1. EL表达式无法直接取值，必须通过key和提供的四范围取值，**如果取值失败,什么都不显示**
2. 解决：空验证，如果取不到值返回true，如果可以取值返回false<br/>
   如：`${empty sessionScope.key}`

:::

