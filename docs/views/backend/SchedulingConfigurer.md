---
title: Spring 定时任务添加开关，修改cron不用重启
date: 2021-11-22
tags:
  - 定时任务
categories:
  - 后端 Back-end
isShowComments: true
---

<Boxx/>

[[toc]]

### 修改定时任务不重启项目，SpringBoot如何实现？

业务场景描述：定时任务的任务名称，cron（定时任务表达式），定时任务开关，存储在数据库表中。在不重启项目的情况下，修改定时任务表达式，可以实时获取新的定时任务执行时间规则；修改定时任务执行状态，可以随时开关定时任务。

使用技术：基于接口  SchedulingConfigurer

### 1、建表 管理定时任务

```SQL
DROP TABLE IF EXISTS `scheduled_cron`;
CREATE TABLE `scheduled` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(20) DEFAULT NULL,
  `cron` varchar(30) DEFAULT NULL,
  `description` varchar(30) DEFAULT NULL COMMENT '描述',
  `create_user` varchar(30) DEFAULT NULL COMMENT '创建人',
  `status` tinyint(1) DEFAULT NULL COMMENT '1开启， 0关闭',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
 
-- ----------------------------
-- Records of scheduled
-- ----------------------------
```

### 2、代码实现

下面来看看可以在不停服务的情况下动态修改任务周期的实现，步骤如下：

在定时任务类上增加@EnableScheduling注解，并实现SchedulingConfigurer接口。（值得注意的是：@EnableScheduling对Spring的版本要求比较高，一开始使用的3.2.6版本时一直未成功，后来改成4.2.5版本就可以了）
设置一个静态变量cron，用于存放任务执行周期参数。
另辟一线程，用于模拟实际业务中外部原因修改了任务执行周期。
设置任务触发器，触发任务执行，其中就可以修改任务的执行周期。

定时任务配置类：

```JAVA
package com.example.demo.scheduled;
 
import com.google.common.util.concurrent.ThreadFactoryBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.SchedulingConfigurer;
import org.springframework.scheduling.config.ScheduledTaskRegistrar;
import org.springframework.scheduling.support.CronTrigger;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadFactory;
 
/**
 * @Description: 基于接口SchedulingConfigurer的动态定时任务
 */
@Configuration
@EnableScheduling
public abstract class SchedulingAbstractDynamicCroTask implements SchedulingConfigurer {
 
    //定时任务周期表达式
    private String cron;
    
    /** 
     * @Description:  重写配置定时任务的方法
     */
    @Override
    public void configureTasks(ScheduledTaskRegistrar scheduledTaskRegistrar) {
        scheduledTaskRegistrar.setScheduler(taskScheduler());
        scheduledTaskRegistrar.addTriggerTask(
                //执行定时任务
                () ->
                {
                    if(getSwitch()) {
                        taskService();
                    }
                },
                //设置触发器
                triggerContext -> {
                   cron = getCron();//获取定时任务周期表达式
                   CronTrigger trigger = new CronTrigger(cron);
                   return trigger.nextExecutionTime(triggerContext);
                }
        );
 
    }
 
    @Bean
    public Executor taskScheduler() {
        //设置线程名称
        ThreadFactory namedThreadFactory = new ThreadFactoryBuilder().setNameFormat("demo-pool-%d").build();
        //创建线程池
        return Executors.newScheduledThreadPool(5, namedThreadFactory);
    }
 
    /**
     * @Description: 执行定时任务
     */
    public abstract void taskService();
 
    /**
     * @Description: 获取定时任务周期表达式
     */
    public abstract String getCron();
    
    /**
     * @Description: 定时任务开关，true为执行
     */
    public abstract boolean getSwitch();
 
}
```

定时任务

```java
package com.example.demo.scheduled;
 
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.example.demo.dao.CronMapper;
import com.example.demo.entity.Scheduled;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
 
import java.time.LocalDateTime;
 
/**
 * @Description:
 * @Author: 
 */
@Configuration
public class TaskDemo extends ConfigurerSchedulingDemo {
 
    @Autowired      //注入mapper
    @SuppressWarnings("all")
    CronMapper cronMapper;
    
    private boolean openFlag = true;
 
    @Override
    public void taskService() {
        System.out.println("定时任务demo1:"
                           + LocalDateTime.now()+"，线程名称："+Thread.currentThread().getName()
                           + " 线程id："+Thread.currentThread().getId());
    }
 
    @Override
    public String getCron() {
        final String defaultCron = "0 */10 * * * ?";
        QueryWrapper<Scheduled> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("name","demo1");
        Scheduled scheduled = cronMapper.selectOne(queryWrapper);
        if(scheduled != null) {
            String cron = scheduled.getCron();
            Integer status = scheduled.getStatus();
            openFlag = status == 1 ? true : false;
            if(!openFalg) {
                logger.warn("定时任务状态为关闭，不执行此次任务。scheduled:[{}]", scheduled)
            }
            return cron;
        }
        logger.error("获取cron失败，采用默认cron。scheduled:[{}]", scheduled);
        return defaultCron;
    }
 
    @Override
    public Integer getSwitch() {
        return openFlag;
    }
 
}
```



### 3、效果展示

启动项目：控制台输出展示

![图片](https://img-blog.csdnimg.cn/20200828115423957.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2NoZW5waW5nMTk5Mw==,size_16,color_FFFFFF,t_70)

修改数据库 demo1的执行时间为每15秒一次：

![图片](https://img-blog.csdnimg.cn/20200828115545742.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2NoZW5waW5nMTk5Mw==,size_16,color_FFFFFF,t_70)

关闭demo1的定时任务，将demo1的open状态改为0：

![图片](https://img-blog.csdnimg.cn/20200828115652460.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2NoZW5waW5nMTk5Mw==,size_16,color_FFFFFF,t_70)

### 总结

此方法，是在触发运行的时候，刷新定时规则，这种方法的缺点是，刷新规则的时间必须是在某次触发运行的时候。

另一种是：https://blog.csdn.net/jianggujin/article/details/77937316

此方法基于 SchedulingConfigurer 的源码，捕获 ScheduledTaskRegistrar 类的实例，通过该类中的 TaskScheduler 实例操作定时任务的增删，而非采用 ScheduledTaskRegistrar.addTriggerTask 方法维护定时任务。所以需要自行写代码维护定时任务列表，控制任务的删减，代码的实现比较繁琐。

如果想要实现可以动态修改的定时策略，建议使用开源组件 Quartz。

### 参考

- https://blog.csdn.net/chenping1993/article/details/108274814
