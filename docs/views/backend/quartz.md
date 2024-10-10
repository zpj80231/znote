---
title: Quartz 定时任务
date: 2019-09-15
tags:
  - 定时任务
categories:
  - 后端 Back-end
isShowComments: false
---

<Boxx/>

[[toc]]

## 简介

> Quartz快速入门指南：[https://www.w3cschool.cn/quartz_doc/](https://www.w3cschool.cn/quartz_doc/)

- Quartz 是一个完全由 Java 编写的开源作业调度框架，为在 Java 应用程序中进行作业调度提供了简单却强大的机制。
- 需要注意的是：Spring3.1+版本支持Quartz2.x，对Spring3.1-版本请使用Quartz1.x。（另外Quzrtz2.x版本升级比较大，相比较Quartz1.x配置时请把 `CronTriggerBean` 改为 `CronTriggerFactoryBean`）

## 使用场景

- 定时生成报表
- 定时发送邮件
- 定时发送短信	sms
- 数据库(表)与数据库(表) 同步数据/备份数据
- QQ会员到期

## 简要步骤

>  以下4步中：4依赖3 --> 3依赖2 --> 2依赖1

1. 业务【 Job 】：我们自己手写的业务类（可以有多个）
2. 任务【 JobDetail 】：我们要对哪个业务进行操作，或者具体对业务类里的哪个方法操作（可以有多个）
3. 触发器【 Trigger 】：即Cron表达式，什么时间触发这个任务（可以有多个）
4. 调度器【 Scheduler 】：当我们配置好上述参数时，由Quartz的Scheduler 容器调度（只能有一个，一个调度器可以注册多个JobDetail 和 Trigger）

## Cron表达式

Cron表达式的时间字段除允许设置数值外，还可使用一些特殊的字符，提供列表、范围、通配符等功能，细说如下：

|名称|	释义|
| ---- | ---- |
|星号(\*)：|可用在所有字段中，表示对应时间域的每一个时刻，例如，*在分钟字段时，表示“每分钟”；|
|问号(?）：|该字符只在日期和星期字段中使用，它通常指定为“无意义的值”，相当于点位符；|
|减号(-)：|表达一个范围，如在小时字段中使用“10-12”，则表示从10到12点，即10,11,12；|
|逗号(,)：|表达一个列表值，如在星期字段中使用“MON,WED,FRI”，则表示星期一，星期三和星期五；|
|斜杠(/)：|x/y表达一个等步长序列，x为起始值，y为增量步长值。如在分钟字段中使用0/15，则表示为0,15,30和45秒，而5/15在分钟字段中表示5,20,35,50，你也可以使用*/y，它等同于0/y；|

|名称|	是否必须|	允许值	|允许的通配符|
| ---- | ---- | ---- | ---- |
|秒	|是|	0-59	|, - * /|
|分	|是|	0-59	|, - * /|
|时	|是|	0-23	|, - * /|
|日	|是|	1-31	|, - * / L W ?|
|月	|是|	1-12 或 JAN-DEC	|, - * /|
|周	|是|	1-7 或 SUN-SAT	|, - * / L # ?|
|年	|否|	空 或 1970-2099	|, - * /|

- 在线Corn表达式生成器：[http://cron.qqe2.com](http://cron.qqe2.com)

## Spring整合Quartz

### applicationContext-quartz.xml配置

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xmlns:context="http://www.springframework.org/schema/context"
	xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-3.2.xsd
		http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context-4.0.xsd">

	<!-- 1.业务 我们自己手写的类-->
	<bean id="jobTask" class="com.etoak.task.Job" />
		
	<!-- 2.任务   -->
	<bean id="jobDetail"  class="org.springframework.scheduling.quartz.MethodInvokingJobDetailFactoryBean">
		
		<!-- 任务调用业务目标对象 Job对象 -->
		<property name="targetObject" ref="jobTask"></property>
		<!-- 任务调用业务目标对象方法名称 job方法 -->
		<property name="targetMethod" value="job"></property>
		<!-- false防止并发执行 -->
		<property name="concurrent" value="false"></property>
	
	</bean>		
	
	<!-- 3.触发器 -->
	<bean id="cronTriggerBean" class="org.springframework.scheduling.quartz.CronTriggerBean">
		<!-- 注入任务 -->
		<property name="jobDetail" ref="jobDetail"></property>
		<!-- 
			执行触发时间 ，  一旦时间触发 调用任务 	
		    cron表达式  使用日期和星期  必须有个为问号（？） 而且不能同时出现问号（？）
		-->
		<property name="cronExpression" value="0 0/5 * * * ?"></property>
	</bean>
	
	<!-- 
		4.调度器   监听器 
		容器启动 触发调度器  处于监听	
	-->
	<bean class="org.springframework.scheduling.quartz.SchedulerFactoryBean">
		<!-- 监听触发器 -->
		<property name="triggers">
			<list>
				<ref bean="cronTriggerBean" />
			</list>
		</property>
	</bean>
	
</beans>
```

### 业务类

```java
package com.zpj80231.task;

import com.zpj80231.bean.User;
import com.zpj80231.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

//1.业务
public class Job {
	
	@Autowired
	private UserMapper mapper;
	
	/**
	 *  定时任务 自定义方法时
	 * 	不需要加入返回值
	 * 	方法不能加入参数
	 * 
	 * 	不能接收请求
	 * 	不能响应请求
	 */
	public void job() {
		List<User> list = mapper.getAll();
		for(User user:list) {
			System.out.println(user.getUsername());
			System.out.println("-----------------");
		}	
	}
	
}

```

## SpringBoot整合Quartz

> 两个注解搞定

- 启动类添加`@EnableScheduling`
- 定时任务类的方法上添加`@Scheduled`

### 依赖

```xml
<dependency>  
    <groupId>org.quartz-scheduler</groupId>  
    <artifactId>quartz</artifactId>  
    <version>2.2.3</version>  
</dependency> 
<dependency>  
    <groupId>org.quartz-scheduler</groupId>  
    <artifactId>quartz-jobs</artifactId>  
    <version>2.2.3</version>  
</dependency>
<dependency><!-- 该依赖必加，里面有sping对schedule的支持 -->
    <groupId>org.springframework</groupId>
    <artifactId>spring-context-support</artifactId>
</dependency>
```

## 任务类

```java
package com.zpj80231.task;

import java.util.Date;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class JobAnno {
	
    @Autowire
    private XXXX xxxx;
    
	/**
	 * 定时任务 自定义方法时
	 * 	不需要加入返回值
	 * 	方法不能加入参数
	 * 
	 * 	不能接收请求
	 * 	不能响应请求
	 */
	@Scheduled(cron="0/10 * * * * ?")
	public void jobAnno() {
		System.out.println("jobAnno:" + new Date() + xxxx.xxXX());
	}

}
```

## 可能遇到的问题

### 在实现Job接口的业务类中无法注入其他bean

- 在job任务类的执行方法中通过ApplicationContext.getBean()来获得 -- [传送们](https://blog.csdn.net/u012767184/article/details/85196998)

## 其它

- [Springboot整合Quartz实现动态定时任务](https://segmentfault.com/a/1190000016554033)
- 在Spring中的话通过 [实现定时任务的几种方式](https://www.cnblogs.com/jcjssl/p/9395970.html) 里的`RAMQuartz`实现`ServletContextListener`重写`contextInitialized`方法实现定时任务
