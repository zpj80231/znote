---
title: 手写 Spring Boot Starter：实现分布式锁、防重攻击、二级缓存与延时队列
date: 2025-07-01
tags:
    - Redis
categories:
    - 后端 Back-end
isShowComments: true
---

<Boxx/>

Spring Boot 的自动配置能力让项目开发更快速，而封装自己的 `spring-boot-starter` 是实现模块化、复用代码、开箱即用的最佳方式。

在本系列文章中，我们将手把手拆解一个自定义 `snail-spring-boot-starter-redis` 的结构与实现。基于注解完成以下功能：分布式锁、防重攻击、二级缓存（本地+Redis）、延时队列。

[[toc]]

## 项目概述

`snail-spring-boot-starter-redis` 是一个基于 Spring Boot 的 Redis 增强工具库，提供 **分布式锁、防重攻击、二级缓存、延时队列** 等常见业务场景的开箱即用解决方案。它封装了复杂的手动操作，简化 Redis 在分布式系统中的使用，提升开发效率和系统稳定性。

Spring Boot Starter 是一种依赖模块，它统一封装了相关功能（如 Redis、AOP等）的依赖、配置类和自动装配逻辑，使得开发者可以“开箱即用”。

自定义 Starter 的本质是：

- 提供一些默认配置
- 提供自动配置类
- 使用 `spring.factories` 实现条件装配
- 提供灵活的扩展点

### 核心功能

1. **分布式锁**：通过注解实现声明式加锁，支持超时或阻塞。（一个注解搞定）
2. **防重攻击**：基于用户指纹或请求参数生成唯一标识，防止重复提交。（一个注解搞定）
3. **二级缓存**：整合 Caffeine 与 Redis，优化高并发读性能。（读、写、删，一个注解搞定）
4. **延时队列**：利用 Redis ZSet 实现消息延时投递，支持自定义消费逻辑。（发消息一行代码搞定，监听消息一个注解搞定）

### 技术栈

- Spring Boot + AOP 注解驱动  
- Redis（Redission）  
- Caffeine（本地缓存）  
- Jackson（序列化）
- Spring Boot Starter + Spring 容器动态扩展点
- EL 表达式解析

### 项目结构 

以下是项目目录文件结构及核心代码。具体使用示例请参考 test 文件夹下的测试用例即可。

```lua
├── pom.xml
├── src
│   ├── main
│   │   ├── java
│   │   │   └── com
│   │   │       └── snail
│   │   │           └── framework
│   │   │               └── redis
│   │   │                   ├── cache
│   │   │                   │   ├── CacheManager.java
│   │   │                   │   ├── CaffeineExpiry.java
│   │   │                   │   ├── DoubleCache.java
│   │   │                   │   ├── DoubleCacheAspect.java
│   │   │                   │   ├── DoubleCacheType.java
│   │   │                   │   ├── LocalCache.java
│   │   │                   │   └── RedisCache.java
│   │   │                   ├── common
│   │   │                   │   └── RedisConstant.java
│   │   │                   ├── config
│   │   │                   │   ├── DelayQueueAutoConfiguration.java
│   │   │                   │   ├── DoubleCacheAutoConfiguration.java
│   │   │                   │   ├── DuplicateSubmitAutoConfiguration.java
│   │   │                   │   └── LockAutoConfiguration.java
│   │   │                   ├── delay
│   │   │                   │   ├── annotation
│   │   │                   │   │   └── DelayQueueListener.java
│   │   │                   │   ├── DefaultDelayMessageDeadLetterConsumer.java
│   │   │                   │   ├── DefaultDelayQueueRegistry.java
│   │   │                   │   ├── DelayMessageConsumerContainer.java
│   │   │                   │   ├── DelayMessageConsumerContainerLauncher.java
│   │   │                   │   ├── DelayMessageDeadLetterConsumer.java
│   │   │                   │   ├── DelayQueue.java
│   │   │                   │   ├── DelayQueueRegistry.java
│   │   │                   │   ├── domain
│   │   │                   │   │   └── DelayMessage.java
│   │   │                   │   ├── interceptor
│   │   │                   │   │   ├── DefaultDelayMessageConsumerInterceptor.java
│   │   │                   │   │   ├── DefaultDelayMessageInterceptor.java
│   │   │                   │   │   ├── DefaultDelayMessageProducerInterceptor.java
│   │   │                   │   │   ├── DelayMessageConsumerInterceptor.java
│   │   │                   │   │   ├── DelayMessageInterceptor.java
│   │   │                   │   │   └── DelayMessageProducerInterceptor.java
│   │   │                   │   └── RedisDelayQueue.java
│   │   │                   ├── duplicate
│   │   │                   │   ├── DefaultDuplicateSubmitHandler.java
│   │   │                   │   ├── DuplicateSubmit.java
│   │   │                   │   ├── DuplicateSubmitAspect.java
│   │   │                   │   └── DuplicateSubmitHandler.java
│   │   │                   ├── lock
│   │   │                   │   ├── Lock.java
│   │   │                   │   └── RedisLockAspect.java
│   │   │                   └── util
│   │   │                       └── ElParser.java
│   │   └── resources
│   │       └── META-INF
│   │           ├── spring
│   │           │   └── spring.springframework.boot.autoconfiguer.AotuConfiguration.imports
│   │           └── spring.factories
│   └── test
```

## 快速开始

1. 引入依赖：  

   ```xml
   <dependency>
      <groupId>com.snail</groupId>
      <artifactId>snail-spring-boot-starter-redis</artifactId>
   </dependency>
   ```
   
2. 配置 Redis 连接（application.yml）：  

   ```yml
   spring:
     redis:
       host: 127.0.0.1
       port: 6379
       database: 0
   ```

### 分布式锁

使用 `@Lock` 为指定方法添加分布式锁，以下是不同场景的加锁方式。支持自定义key、阻塞等待时间、自动释放时间、时间单位

```java
@Slf4j
public class Duck {

    private int count = 0;

    public int getCount() {
        return count;
    }

    /**
     * 所有线程阻塞式，等待获取锁，获取到锁后，执行方法，执行完毕后，释放锁
     */
    @Lock
    public void quack() {
        ThreadUtil.sleep(200);
        count ++;
        log.info("Quack!, count: {}", count);
    }

    @Lock(key = "'lock_rounds_' + #rounds")
    public void quackWithArgs(int rounds) {
        for (int i = 0; i < rounds; i++) {
            ThreadUtil.sleep(200);
            count ++;
            log.info("quackWithArgs Quack!, count: {}", count);
        }
    }

    /**
     * 当前线程，最大等待时间：WaitTime 还没有获取到锁，那么就不等锁了，会立马执行当前方法，所以可能会有并发问题（多测几次）
     */
    @Lock(waitTime = 2L, leaseTime = 7L)
    public void quackWaitTimeOut() {
        ThreadUtil.sleep(1000);
        count++;
        log.info("quackWaitTimeOut Quack!, count: {}", count);
    }

    /**
     * 当前线程获取锁后，LeaseTime 到期时，不管方法是否执行完毕，都会立即释放锁
     */
    @Lock(leaseTime = 1L)
    public void quackLeaseTimeOut() {
        ThreadUtil.sleep( 2000);
        count++;
        log.info("quackLeaseTimeOut Quack!, count: {}", count);
    }

}
```

### 防重拦截

使用 `@DuplicateSubmit` 为指定方法添加去重拦截。支持自定义key、超时时间、时间单位、提示信息等

```java
@Slf4j
public class Eagle {

    private int count = 0;

    public int getCount() {
        return count;
    }

   /**
    * 3秒内不允许重复
    */
   @DuplicateSubmit(expire = 3L)
   public void fly() {
      count++;
      log.info("fly...");
   }

   /**
    * key是EL表达式解析后的值（默认1秒不允许重复）
    */
   @DuplicateSubmit(key = "#rounds")
   public void flyCount(int rounds) {
      for (int i = 0; i < rounds; i++) {
         count++;
         log.info("fly...");
      }
   }

}
```

### 二级缓存

使用 `@DoubleCache` 注解，支持自定义key、本地过期时间、redis过期时间、时间单位、缓存类型（获取、新增、删除）、本地缓存是否开启、redis缓存是否开启

```java
@Slf4j
public class Dog {

    private static final Map<String, String> DATAS = new HashMap<>();

    public void setDatas(Map<String, String> datas) {
        DATAS.putAll(datas);
    }

    @DoubleCache(expireOfRedis = 5)
    public Map<String, String> queryDatas() {
        log.info("queryDatas from db ...");
        return DATAS;
    }

    @DoubleCache(expireOfRedis = 5, key = "#key")
    public String queryValueWithElKey(String key) {
        log.info("queryValueWithKey:[{}] from db", key);
        return DATAS.get(key);
    }

   /**
    * 自定义key，本地缓存过期时间是5秒，不启用redis缓存
    */
   @DoubleCache(expireOfLocal = 5, key = "#key", redisCached = false)
   public String queryValueWithElKeyOnlyLocalCache(String key) {
      log.info("queryValueWithElKeyOnlyLocalCache:[{}] from db", key);
      return DATAS.get(key);
   }

    @DoubleCache(expireOfRedis = 5, key = "#key", localCached = false)
    public String queryValueWithElKeyOnlyRedisCache(String key) {
        log.info("queryValueWithElKeyOnlyRedisCache:[{}] from db", key);
        return DATAS.get(key);
    }


    @DoubleCache(expireOfLocal = 2, expireOfRedis = 5)
    public Map<String, String> queryDatasCustomExpire() {
        log.info("queryDatasCustomExpire from db ...");
        return DATAS;
    }

   /**
    * 自定义key，本地缓存过期时间是6秒，redis缓存过期时间是10秒
    */
   @DoubleCache(key = "#key", expireOfLocal = 6, expireOfRedis = 10)
   public String queryValueWithCustomExpire(String key) {
      log.info("queryValueWithCustomExpire:[{}] from db", key);
      return DATAS.get(key);
   }
  
      @Test
    void testDoubleCacheAspect() throws NoSuchMethodException {
        dog.setDatas(MapUtil.of("a", "a"));
        log.info("-----------------------");
        log.info("第一次，模拟从数据库查询数据 queryDatasCustomExpire：{}", dog.queryDatasCustomExpire());
        log.info("第一次，模拟从数据库查询数据 queryValueWithCustomExpire：{}", dog.queryValueWithCustomExpire("a"));
        log.info("-----------------------");
        ThreadUtil.sleep(1000);
        log.info("第二次，从本地缓存获取数据 queryDatasCustomExpire：{}", dog.queryDatasCustomExpire());
        log.info("第二次，从本地缓存获取数据 queryValueWithCustomExpire：{}", dog.queryValueWithCustomExpire("a"));
        log.info("-----------------------");
        ThreadUtil.sleep(2000);
        log.info("第三次，从Redis缓存获取数据 queryDatasCustomExpire：{}", dog.queryDatasCustomExpire());
        log.info("第三次，从本地缓存获取数据 queryValueWithCustomExpire：{}", dog.queryValueWithCustomExpire("a"));
        log.info("-----------------------");
        ThreadUtil.sleep(5000);
        log.info("第四次，queryDatasCustomExpire 所有缓存时间到期，再次从数据库查询数据：{}", dog.queryDatasCustomExpire());
        log.info("第四次，从本地缓存获取数据 queryValueWithCustomExpire：{}", dog.queryValueWithCustomExpire("a"));
        log.info("-----------------------");
        ThreadUtil.sleep(3000);
        log.info("第五次，queryValueWithCustomExpire 所有缓存时间到期，再次从数据库查询数据：{}", dog.queryValueWithCustomExpire("a"));
        log.info("-----------------------");
    }

}
```

### 延迟队列

使用 `DelayQueue` 向指定队列发送延时消息，使用 `@DelayQueueListener` 从指定队列消费消息

```java
package com.snail.framework.redis.config.delay;

import cn.hutool.core.map.MapUtil;
import cn.hutool.core.util.IdUtil;
import cn.hutool.core.util.RandomUtil;
import com.alibaba.fastjson.JSON;
import com.snail.framework.redis.delay.DelayQueue;
import com.snail.framework.redis.delay.annotation.DelayQueueListener;
import com.snail.framework.redis.delay.domain.DelayMessage;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * @author zhangpengjun
 * @date 2024/5/14
 */
@Slf4j
@Data
@Component
@RequiredArgsConstructor
public class DelayQueueProducerConsumer {

    public static final String QUEUE_NAME_1 = "delay_queue_test_1";
    public static final String QUEUE_NAME_2 = "delay_queue_test_2";

    private final DelayQueue delayQueue;

    public AtomicInteger counter = new AtomicInteger(0);

    public void producer(int count) {
        for (int i = 1; i <= count; i++) {
            // 向 队列1 发送延迟消息
            DelayMessage<Object> delayMessage = new DelayMessage<>(Collections.singletonList(QUEUE_NAME_1));
            delayMessage.setHeader(null);
            delayMessage.setMessageId(IdUtil.getSnowflakeNextIdStr());
            delayMessage.setDelay(RandomUtil.randomLong(2, 10));
            delayMessage.setTimeUnit(TimeUnit.SECONDS);
            // 模拟各种格式的消息体
            String messageBody = "default" + i;
            delayMessage.setBody(messageBody);
            if (i % 3 == 0) {
                delayMessage.setBody(MapUtil.of("key" + i, messageBody));
            }
            if (i % 3 == 1) {
                delayMessage.setBody(new Cat("Tom" + i, i));
            }
            if (i % 3 == 2) {
                delayMessage.setBody(JSON.toJSONString(delayMessage));
            }

            log.info("Send delayMessage1: {}", JSON.toJSONString(delayMessage));
            delayQueue.offer(delayMessage);
            counter.incrementAndGet();
        }

        // 向 队列2 发送一个空消息
        DelayMessage<Object> delayMessage2 = new DelayMessage<>(Collections.singletonList(QUEUE_NAME_2));
        delayQueue.offer(delayMessage2);
        log.info("Send delayMessage2: {}", JSON.toJSONString(delayMessage2));
        counter.incrementAndGet();

        // 没有绑定消费队列时，打印告警日志，不发送消息
        delayQueue.offer(new DelayMessage<>(Collections.singletonList(QUEUE_NAME_1 + "no_consumer")));
    }

    /**
     * 消费者方法。
     * @param cat     Cat 类型的消息
     * @param str     str 类型消息
     * @param message 不知道啥类型的消息，必须为 {@link DelayMessage} 类型
     */
    @DelayQueueListener({QUEUE_NAME_1, QUEUE_NAME_2})
    public void consumer(Cat cat, String str, DelayMessage<Object> message) {
        log.info("Received, cat:{}, str:{}, message:{}", cat, str, message);
        counter.decrementAndGet();
    }

    // @DelayQueueListener({QUEUE_NAME_1})
    // public void consumer(Cat cat) {
    //     log.info("Received, cat: {}", cat);
    //     counter.decrementAndGet();
    // }

}

```

### 其它使用

以上只是举例了一部分，更多使用场景，请参考项目的测试用例即可。

![image-20250618175751675](/znote/img/backend/image-20250618175751675.png)

> 项目地址：https://github.com/zpj80231/snail

## 更多

### 适用场景

该组件完美适用于：

1. 电商系统：订单防重、库存锁、超时消单等
2. 配置中心：动态配置缓存，多级缓存加速（二级缓存）
3. 实时监控：延迟报警处理、延迟通知等
4. 金融支付：表单重复提交、短信验证码防刷

### 核心价值

1. 开箱即用的分布式解决方案
2. 优雅的注解驱动编程模型
3. 本地缓存 + Redis 最佳性能组合（各自都支持开关）
4. 轻量无依赖的 Spring Boot 集成

<Reward/>