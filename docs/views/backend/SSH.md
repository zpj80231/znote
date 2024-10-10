---
title: SSH 架构知识点概览
date: 2017-07-24 16:41:12
tags: 
- Java
categories:
- 后端 Back-end
isShowComments: false
---

<Boxx/>

[[toc]]

## 关于SSH架构的所有东西，看这一篇就够了

### 基本公司面试要求
1. 计算机相关专业本科以上学历，精通java语言，具有一定的软件项目开发的实际工作经验，熟悉SSH等开源框架，了解jdk的基本内容，从事过相关开发工作；
2. 熟悉J2EE平台企业应用开发以及SOA架构，精通XML、Web Service等相关技术，使用过flex、jsp、servlet、jdbc等相关技术开发；
3. 熟悉SSH、SG_UAP平台开发者优先考虑；
4. 了解tomcat、weblogic等web服务器；
5. 了解Oracle数据库，精通Sql语法，有存储过程编写经验者优先；
6. 责任心强，有相当强的工作压力承受能力；
7. 具备良好的语言沟通能力和团队协作精神；
8. 有良好的编写代码基础,学习能力强，有较强文字能力；
9. 有代码安全漏洞处理经验者优先。

### 面试准备
#### 1. java基础知识
#### 2. SSH框架

 - 这个写的比较好 -- [传送门](https://www.cnblogs.com/laibin/p/5847111.html)

#### 3. SOA架构(对比微服务架构)

 - SOA专题 -- [传送门](https://www.jdon.com/soa/soa-interview.html#)

#### 4. XML

 -  W3school XML教程 -- [传送门](http://www.w3school.com.cn/xml/index.asp)
 - 但是推荐看一下Dom4j解析xml -- [传送门](https://www.cnblogs.com/hongwz/p/5514786.html)

#### 5. WebService及HttpClient,电网项目尤其是`WebService`

- WebService cxf -- [传送门](https://blog.csdn.net/qq_41602595/article/details/80582709)

#### 6. flex

- 和jsp差不多，相当于一个组件，可以自定义标签到html中

#### 7. jsp(几种语言和九大隐含对象)

- 这篇文章写的很好,但是重点都在后边，多往后划拉划拉 -- [传送门](https://www.cnblogs.com/whgk/p/6427759.html)

#### 8. servlet

- 个人感觉是写的最好的了，知识点全覆盖有图示还带有源码讲解 -- [传送们](https://www.cnblogs.com/whgk/p/6399262.html)

#### 9. jdbc
- 基本的crud -- [传送门](https://www.cnblogs.com/wuyuegb2312/p/3872607.html)

#### 10. SG_UAP平台的了解
- 听说过，类似一个开发工具，可以实现权限管理、任务调度、报表统计、系统监督等功能

#### 11. Tomcat与weblogic容器的区别及常用部署命令

> Tomcat开源免费
> WebLogic不开源不免费

- 可以看看这 -- [传送门](https://www.cnblogs.com/DONGb/p/7844349.html)

#### 12. Oracle数据库,常用sql函数,存储过程的编写
- Oracle 数据库 -- [传送门](https://www.cnblogs.com/qneverever/p/4500023.html)
- Oracle 存储过程 -- [传送门](https://blog.csdn.net/crazygolf/article/details/38989461#)
- JAVA调用存储过程 --[传送门](https://www.cnblogs.com/zhengcheng/p/4255559.html)

### 面试流程及可能遇到的问题
#### 项目相关
##### 1. 做过哪些项目？介绍项目涉及的业务流程。
##### 2. 项目中遇到过什么困难，怎么解决的？体现个人解决问题的能力

#### 可能问到的问题

##### **程序相关**

###### 1. 介绍自己熟悉的开发框架。比如：spring、structs

- SpringMVC与structs2区别 -- [传送们](https://blog.csdn.net/zuochao_2013/article/details/80994843)

     > - springmvc的入口是servlet，而struts2是filter
    > - spring mvc是基于方法的设计，而sturts是基于类(一次请求创建一个action)
    > - springmvc通过`形参`获取数据，而struts2是通过`属性`获取数据
     > - springmvc处理ajsx @ResponseBody，而struts2较麻烦

###### 2. 线程、进程的区别？
- 一个迅雷搞定

###### 3. 系统性能优化
- 代码优化
- 数据库优化

###### 4. 第三方系统接口的开发和调用，比如restful、webService（cxf、xfire）

 一般就是webservice和httpclient,具体上文有介绍

###### 5. 服务器集群

###### 6. Redis、kafka、MQ
- Redis简单介绍 -- [传送门](https://blog.csdn.net/middleware2018/article/details/80355418)
- Spring整合Redis -- [传送门](https://www.cnblogs.com/phil_jing/p/7468586.html)

###### 7. 数据加密
###### 8. 定时器（定时任务）
- Spring整合Quartz实现定时任务的配置方法 -- [传送们](https://www.cnblogs.com/happyday56/p/4164877.html)

##### **数据库相关**

###### 1.  Oracle和MySQL的区别

> - Oracle使用rownum来实现分页，MySQL使用limit实现分页
> - Oracle没有主键自增特性,可以使用调用序列的方式来实现主键自增；MySQL可以在主键列之后添加auto_increment设置自增特性
 > - Oracle有表空间的概念，MySQL没有表空间
 > - Oracle的分组函数中select之后不能直接写非分组的其他列；MySQL如果没有聚组函数则可以写 其他列
 > - Oracle的表存放在用户（其实是schema对象）所属的表空间的数据文件中，
   mySQL的表存放在某个database中（mysql一个root用户下可以有很多database）
 > - Oracle中的一些函数和MySQL也不一样，如：
    ORACLE:`SELECT to_date('2009-3-6','yyyy-mm-dd') VAULE FROM DUAL`
    MySQL: `SELECT STR_TO_DATE('2004-03-01', '%Y-%m-%d') VAULE`
 > - Oracle中的字符类型可以使用varchar2 MySQL不能使用该类型

###### 2. 存储过程、触发器是不是写过
- Oracle 存储过程 -- [传送门](https://blog.csdn.net/crazygolf/article/details/38989461#)

###### 3. 数据库SQL调优。可以结合自己做过的项目进行说明
 - sql语句调优 -- [传送门](https://blog.csdn.net/u010520146/article/details/81161762)
 - 写存储过程调优

###### 4. 数据库备份命令、备份策略（增量备份--每天或每周、全量备份--每月或每年）
- Oracle数据库三种备份方案 -- [传送门](http://www.cnblogs.com/ray-bk/p/7977873.html)

###### 5. Oracle行转列、列转行
- Oracle行转列(pivot、wm_concat、decode)使用总结 -- [传送门](https://www.cnblogs.com/markfeifei/p/4009343.html)

    > 列转行： unpivot
    > 行转列： WM_CONCAT、pivot

##### **其他**
###### 1.  Linux常用命令
- Linux常用命令 -- [传送门](https://www.cnblogs.com/yjd_hycf_space/p/7730690.html)

###### 2.  Linux下部署tomcat、Weblogic服务

###### 3.  集群服务部署
- 常见的部署出现的问题

    - 各部属的版本是否对应(如jdk版本和服务器版本)
    - 环境的账号密码是否正确(测试环境和正式环境)
    - 部署的url地址是否正确

### 面试时注意的问题
1. 面试着装要正式,自然大方;
2. 态度要严肃认真,言谈举止等,不紧张,不散漫;可以看一下贾哥的姿态
3. 进门基本的问候语要有;
4. 自我介绍要有逻辑(毕业年限,工作年限,参与的项目(项目大概介绍,负责功能,涉及技术)必须和简历上匹配起来),工作的新得等
5. 问到不会的技术,能说多少就说多少,最后得表明一下,自己也是正在实践中积累学习
6. 介绍技术时,要挑自己熟悉的,擅长的项目介绍;能和甲方技术要求匹配最好

### 自我介绍模板

>   - 自然进门，安稳落下
>   - 领导下午好，很高兴能来参加这次面试，我叫XXX，从事java开发XX年了，
    曾用过SSH,SSM框架做过开发，了解Spring、SpringMVC，
    数据库用过Oracle、MySQL,
    前端框架用过BootStrap、EasyUI
>   - 最近做过的一个项目是大东全渠道项目，大东是一家做鞋的公司，然后它想
        给自己做一套零售系统嘛。
    我负责的模块主要有：门店信息管理，店员信息的管理和维护，人资信息管理
        和报表统计管理等。
    这个项目用的技术是SSM+MySQl+dubbo+EasyUI，我在这个项目中主要学会了
        dubbo通信、httpClient调接口、和项目版本管理工具git的使用
>   - 我的基本情况就这些,请领导指示
        ... ...
>   - 待面试结束后 -> 谢谢领导！





