---
title: "Q&A宝典-前端进阶篇"
date: 2019-05-24
tags:
- 复习
categories:
- 知识晶体 Q&A
isShowComments: false

---

<Boxx/>


## Servlet(单实例多线程)

::: details 1.Servlet的生命周期

1. 构造方法
2. 初始化方法init()
3. service方法(由容器帮我们调用,不建议重写)
4. **doGet/doPost方法(需要我们来进行逻辑处理)**
5. 销毁方法destory()

:::

::: details 2. Servlet的四个范围及其局限性

> 因为可以通过这四个对象setAttribute()传值。

1. **pageContext**：第一范围,页面跳转立即失效
2. **HttpServletRequest**：第二范围,重定向失效
3. **HttpSession**：第三范围,默认有效期到或者浏览器关闭失效
4. **ServletContext**：第四范围,只要tomcat开着一直有效

:::

::: details 3. 两种跳转方式

1. <u>**请求转发**</u><br/>
   跳转之后浏览器地址栏不发生改变；<br/>
   跳转之前执行的是doGet/doPost，跳转之后还是执行的这个方法

2. **<u>重定向</u>**<br/>
   跳转之后浏览器地址栏发生改变；<br/>
   跳转之后肯定执行doGet方法；<br/>
   request第二范围失效(因为浏览器发送的不是同一个请求了)

:::

::: details 4. session保存信息及删除

- 保存信息：<br/>`session.setAttribute("n",name);`<br/>
  String name = (String)sessin.getAttribute("n");
- 删除信息：<br/>session.removeAttribute("n");<br/>
  `session.invalidate()`是把session内的所有属性都清除;

:::

::: details 5. Cookie HttpSession两种会话机制比较

- ***Cookie***:<br/>
  浏览器提供的会话信息,安全性较低；<br/>
  Cookie cookie = new Cookie(String,String)；<br/>
  cookie仅支持字符串，默认不支持中文，是将信息保存到客户端本地
- ***session***:<br/>
  服务器提供的会话信息，安全性较高；<br/>
  session的信息当**默认时间到期**(期间没有任何操作!!)或者**关闭浏览器**或者**调用invalidate()** 之后失效

> 不过现在一般都用基于客户端的[<u>**JWT**</u>]( https://jwt.io/ )，轻便安全高效

:::

::: details 6. Cookie和Session之间有什么联系,如果有,请说出他们的联系

1. **session默认依靠cookie维持**，如果cookie被禁用，那么session会话机制失效
2. session是由servlet容器创建的<br/>
   当用户getSession()时，web容器会先去cookie查找有没有这个session的id，如果没有，那么cookie就会分配一个就jsessionid并且保存在cookie中

:::

## 偏后端

::: details 1. Servlet核心的API？

Javax.servlet.Servlet

Javax.servlet.ServletConfig

Javax.servlet.http.HttpServlet

HttpServletRequest，HttpServletResponse

:::

::: details 2. Servlet/jsp中的对象的创建、实现和调用？

| |创建者|实现者|调用者|
|--|--|--|--|
|Servlet|			容器	| <u>我们</u> |		容器|
|ServletConfig|	容器	|	容器		|<u>我们</u>|
|Cookie		|	<u>我们</u>	|	容器	| <u>我们</u> |
|Session	|	容器	|	容器	| <u>我们</u> |

:::
