---
title: snail-spring-boot-starter-redis 02：基于 Redis 的分布式服务增强（分布式锁、防重、二级缓存、延时队列）深入解析
date: 2025-07-11
tags:
    - Redis
    - Spring Boot Starter
categories:
    - 后端 Back-end
isShowComments: true
---

<Boxx/>

在分布式系统中，解决并发问题、数据一致性、性能优化以及消息传递是构建健壮应用的关键。`snail-spring-boot-starter-redis` 项目提供了一系列基于 Redis 的开箱即用的解决方案，包括分布式锁、防重攻击、二级缓存和延时队列。

本文将深入解析这些功能的实现原理和核心代码。

[[toc]]

## 1. 分布式锁

在分布式环境中，为了避免多个服务实例同时操作共享资源导致数据不一致，需要引入分布式锁。`snail-spring-boot-starter-redis` 使用 Redisson 客户端实现了分布式锁，并通过 Spring AOP 提供了声明式的使用方式。

### 1.1 实现原理

核心思想是通过 AOP 拦截方法，在方法执行前尝试获取 Redis 锁，方法执行完毕或发生异常时释放锁。Redisson 提供了强大的分布式锁功能，支持公平锁、非公平锁、可重入锁等，并且自带看门狗机制，防止锁提前释放。

### 1.2 实现代码

**`Lock.java`：分布式锁注解**

这是一个自定义注解，用于标记需要分布式锁的方法，并允许配置锁的 `key`、等待时间、租约时间和时间单位。

```java
package com.snail.framework.redis.lock;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.util.concurrent.TimeUnit;

/**
 * @author zhangpengjun
 * @date 2024/5/16
 */
@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface Lock {

    /**
     * SpEl key，默认：类名#方法名
     *
     * @return {@link String }
     */
    String key() default "";

    /**
     * 尝试获取锁，最长等待时间，默认一直阻塞等待
     *
     * @return long
     */
    long waitTime() default -1L;

    /**
     * 自动释放时间，默认一直阻塞等待
     *
     * @return long
     */
    long leaseTime() default -1L;

    /**
     * 单位，默认：秒
     *
     * @return {@link TimeUnit }
     */
    TimeUnit timeUnit() default TimeUnit.SECONDS;

}
```

**`RedisLockAspect.java`：分布式锁切面实现**

该切面通过 `@Around` 注解拦截带有 `@Lock` 注解的方法。在方法执行前，它根据注解配置的 `key`（支持 SpEL 表达式解析）构建真实的 Redis 锁名，然后调用 Redisson 客户端的 `getLock()` 方法获取 `RLock` 对象，并根据 `waitTime` 和 `leaseTime` 参数选择不同的加锁策略（阻塞加锁或尝试加锁）。无论方法执行成功或失败，最后都会在 `finally` 块中安全地释放锁，确保锁的正确释放。

```java
package com.snail.framework.redis.lock;

import com.snail.framework.redis.common.RedisConstant;
import com.snail.framework.redis.util.ElParser;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.core.annotation.Order;

import java.util.concurrent.TimeUnit;

/**
 * @author zhangpengjun
 * @date 2024/5/16
 */
@Slf4j
@Aspect
@Order
public class RedisLockAspect {

    private final RedissonClient redissonClient;

    public RedisLockAspect(RedissonClient redissonClient) {
        this.redissonClient = redissonClient;
    }

    @Around("@annotation(annotation)")
    public Object around(ProceedingJoinPoint point, Lock annotation) throws Throwable {
        long waitTime = annotation.waitTime();
        long leaseTime = annotation.leaseTime();
        TimeUnit timeUnit = annotation.timeUnit();
        String keyPrefix = ElParser.getPrefixKey(null, RedisConstant.LOCK);
        String splKey = ElParser.parse(point, annotation.key(), false);
        String realKey = keyPrefix + splKey;
        RLock lock = redissonClient.getLock(realKey);
        try {
            if (waitTime < 0 && leaseTime < 0)  {
                if (log.isDebugEnabled()) {
                    log.debug("Get lock: {}", realKey);
                }
                lock.lock();
                return point.proceed();
            }
            if (waitTime < 0 && leaseTime > 0) {
                if (log.isDebugEnabled()) {
                    log.debug("Get lock: {}, leaseTime: {}, timeUnit: {}", realKey, leaseTime, timeUnit);
                }
                lock.lock(leaseTime, timeUnit);
                return point.proceed();
            }
            if (waitTime >= 0 && lock.tryLock(waitTime, leaseTime, timeUnit)) {
                if (log.isDebugEnabled()) {
                    log.debug("Get tryLock: {}, waitTime: {}, leaseTime: {}, timeUnit: {}",
                            realKey, waitTime, leaseTime, timeUnit);
                }
                return point.proceed();
            }
        } finally {
            if (lock.isLocked() && lock.isHeldByCurrentThread()) {
                if (log.isDebugEnabled()) {
                    log.debug("Release lock: {}", realKey);
                }
                lock.unlock();
            }
        }
        return point.proceed();
    }

}
```

## 2. 防重攻击

在用户提交表单或执行敏感操作时，可能会因为网络延迟、用户重复点击等原因导致请求重复提交，从而引发业务逻辑错误或数据混乱。防重攻击机制旨在有效阻止此类重复提交。

### 2.1 实现原理

`snail-spring-boot-starter-redis` 通过 Redis 的 `SETNX` (Set if Not Exists) 命令实现了一个简单的防重提交机制。当一个请求到达时，会在 Redis 中尝试设置一个带有过期时间的键。如果键设置成功，则表示首次提交，允许业务方法执行；如果键已经存在（设置失败），则表示重复提交，拒绝本次请求并返回相应的提示信息。同样，该功能也是通过 Spring AOP 实现的。

### 2.2 实现代码

**`DuplicateSubmit.java`：防重提交注解**

该注解用于标识需要防重提交处理的方法，允许自定义 `key`、过期时间、时间单位以及重复提交时的提示消息。

```java
package com.snail.framework.redis.duplicate;

import java.lang.annotation.*;
import java.util.concurrent.TimeUnit;

/**
 * @author zhangpengjun
 * @date 2024/5/20
 */
@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Inherited
public @interface DuplicateSubmit {

    /**
     * SpEl key，默认：类名#方法名
     *
     * @return {@link String }
     */
    String key() default "";

    /**
     * 过期时间
     *
     * @return long
     */
    long expire() default 1L;

    /**
     * 时间单位
     *
     * @return {@link TimeUnit }
     */
    TimeUnit timeUnit() default TimeUnit.SECONDS;

    /**
     * 提示消息
     *
     * @return {@link String }
     */
    String message() default "操作过于频繁，请稍后再试";

}
```

**`DuplicateSubmitAspect.java`：防重提交切面实现**

该切面拦截带有 `@DuplicateSubmit` 注解的方法。在方法执行前，它会生成一个缓存 `key`，并尝试使用 `redisTemplate.opsForValue().setIfAbsent()` 方法将该 `key` 存入 Redis，并设置过期时间。如果 `setIfAbsent` 返回 `false` (即键已存在)，则表示是重复提交，此时会调用 `duplicateSubmitHandler.handle()` 方法进行处理（例如抛出异常或返回错误信息），阻止方法继续执行。如果返回 `true`，则允许方法继续执行。

```java
package com.snail.framework.redis.duplicate;

import com.snail.framework.redis.common.RedisConstant;
import com.snail.framework.redis.util.ElParser;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.data.redis.core.RedisTemplate;

/**
 * @author zhangpengjun
 * @date 2024/5/20
 */
@Slf4j
@Aspect
public class DuplicateSubmitAspect {

    private final RedisTemplate<Object, Object> redisTemplate;
    private final DuplicateSubmitHandler duplicateSubmitHandler;

    public DuplicateSubmitAspect(RedisTemplate<Object, Object> redisTemplate, DuplicateSubmitHandler duplicateSubmitHandler) {
        this.redisTemplate = redisTemplate;
        this.duplicateSubmitHandler = duplicateSubmitHandler;
    }

    @Around("@annotation(annotation)")
    public Object around(ProceedingJoinPoint point, DuplicateSubmit annotation) throws Throwable {
        String cacheKey = ElParser.getParseKey(null, RedisConstant.DUPLICATE_SUBMIT, annotation.key(), point);
        Boolean locked = redisTemplate.opsForValue().setIfAbsent(cacheKey, 1, annotation.expire(), annotation.timeUnit());
        if (log.isDebugEnabled()) {
            log.debug("Duplicate submit lock: {}, expire: {}, timeUnit: {}, locked: {}",
                    cacheKey, annotation.expire(), annotation.timeUnit(), locked);
        }
        if (locked == null || Boolean.FALSE.equals(locked)) {
            MethodSignature signature = (MethodSignature) point.getSignature();
            return duplicateSubmitHandler.handle(cacheKey, annotation, signature.getMethod(), point.getArgs());
        }
        return point.proceed();
    }

}
```

## 3. 二级缓存

二级缓存（或双层缓存）是一种常见的缓存策略，它结合了本地缓存（如 Caffeine）和分布式缓存（如 Redis）的优势。本地缓存速度快但容量有限且无法跨进程共享，而分布式缓存可共享但访问延迟相对较高。通过二级缓存，可以优先从本地缓存获取数据，提高读取性能；本地缓存未命中时再从分布式缓存获取，并同步到本地。

### 3.1 实现原理

`snail-spring-boot-starter-redis` 的二级缓存通过 Spring AOP 实现，拦截带有 `@DoubleCache` 注解的方法。它首先尝试从本地缓存获取数据，如果本地缓存命中，则直接返回；如果未命中，则从 Redis 获取数据，并将数据同步到本地缓存；如果 Redis 也未命中，则执行原方法获取数据，并将结果同步到 Redis 和本地缓存。同时，它也支持缓存的更新和删除操作。

### 3.2 实现代码

**`DoubleCache.java`：二级缓存注解**

该注解用于标记需要二级缓存的方法，提供了缓存名称、`key`、本地缓存和 Redis 缓存的过期时间、时间单位、缓存类型（获取、更新、删除）以及本地缓存和 Redis 缓存的开关。

```java
package com.snail.framework.redis.cache;

import com.snail.framework.redis.common.RedisConstant;

import java.lang.annotation.*;
import java.util.concurrent.TimeUnit;

/**
 * 双缓存，local + redis，支持各自开关
 *
 * @author zhangpengjun
 * @date 2024/5/16
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface DoubleCache {

    /**
     * 缓存名称
     *
     * @return {@link String }
     */
    String name() default RedisConstant.DOUBLE_CACHE;

    /**
     * spl 待解析的 key。默认为：类全名#方法名#参数值md5值
     *
     * @return {@link String }
     */
    String key() default "";

    /**
     * 本地缓存 过期时间，单位，秒。默认 5 分钟。
     *
     * @return long
     */
    long expireOfLocal() default 5 * 60L;

    /**
     * Redis 过期时间，单位，秒。默认 30 分钟。
     *
     * @return long
     */
    long expireOfRedis() default 30 * 60L;

    /**
     *  过期时间单位，默认：秒。
     *  <b/>
     *  注意：expireOfLocal 和 expireOfRedis 都使用该单位。
     *
     * @return {@link TimeUnit }
     */
    TimeUnit timeUnit() default TimeUnit.SECONDS;

    /**
     * 缓存类型
     *
     * @return {@link DoubleCacheType }
     */
    DoubleCacheType cacheType() default DoubleCacheType.GET;

    /**
     * 本地缓存，默认开启
     *
     * @return boolean
     */
    boolean localCached() default true;

    /**
     * Redis 缓存，默认开启
     *
     * @return boolean
     */
    boolean redisCached() default true;

}
```

**`DoubleCacheAspect.java`：二级缓存切面实现**

该切面是二级缓存的核心逻辑。它首先根据 `@DoubleCache` 注解的配置判断是否开启本地缓存和 Redis 缓存。根据 `cacheType` 的不同，执行相应的缓存操作：
*   **PUT (更新缓存):** 执行原方法，然后将结果同步更新到本地缓存和 Redis。
*   **DELETE (删除缓存):** 删除本地缓存和 Redis 中的对应数据，然后执行原方法。
*   **GET (获取缓存):** 首先尝试从 `cacheManager` 获取数据。`cacheManager` 会优先从本地缓存获取，如果未命中则从 Redis 获取。如果 `cacheManager` 返回了缓存值，则直接返回。否则，执行原方法获取数据，并将结果同步到 `cacheManager` (即本地缓存和 Redis)。

```java
package com.snail.framework.redis.cache;

import com.alibaba.fastjson.JSON;
import com.snail.framework.redis.common.RedisConstant;
import com.snail.framework.redis.util.ElParser;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.core.annotation.Order;

import java.util.Objects;

/**
 * @author zhangpengjun
 * @date 2024/5/16
 */
@Slf4j
@Aspect
@Order
public class DoubleCacheAspect {

    private final CacheManager cacheManager;

    public DoubleCacheAspect(CacheManager cacheManager) {
        this.cacheManager = cacheManager;
    }

    @Around("@annotation(doubleCache)")
    public Object doAround(ProceedingJoinPoint point, DoubleCache doubleCache) throws Throwable {
        String cacheName = doubleCache.name();
        String key = doubleCache.key();
        boolean localCached = doubleCache.localCached();
        boolean redisCached = doubleCache.redisCached();
        long expireOfRedis = doubleCache.expireOfRedis();
        DoubleCacheType cacheType = doubleCache.cacheType();
        if (!localCached && !redisCached) {
            return point.proceed();
        }

        String cacheKey = ElParser.getParseKey(cacheName, RedisConstant.DOUBLE_CACHE, key, point);
        if (cacheType == DoubleCacheType.PUT) {
            Object object = point.proceed();
            cacheManager.set(cacheKey, object, doubleCache);
            return object;
        } else if (cacheType == DoubleCacheType.DELETE) {
            cacheManager.delete(cacheKey, doubleCache);
            return point.proceed();
        }

        Object cacheValue = cacheManager.get(cacheKey, doubleCache);
        if (Objects.nonNull(cacheValue)) {
            return cacheValue;
        }
        Object proceed = point.proceed();
        if (log.isDebugEnabled()) {
            log.debug("DoubleCache GET from proceed, cacheKey: {}, proceed: {}", cacheKey, proceed);
        }
        if (Objects.nonNull(proceed)) {
            if (log.isDebugEnabled()) {
                log.debug("DoubleCache GET from proceed and SET, cacheKey: {}, expireOfRedis: {}, value: {}",
                        cacheKey, expireOfRedis, JSON.toJSONString(proceed));
            }
            cacheManager.set(cacheKey, proceed, doubleCache);
        }
        return proceed;
    }

}
```

（注：`CacheManager.java`、`LocalCache.java` 和 `RedisCache.java` 协同工作，`CacheManager` 负责协调本地缓存和 Redis 缓存的操作。）

## 4. 延时队列

延时队列是一种特殊的消息队列，消息在被消费者消费之前会经历一个延迟阶段。它常用于需要延时处理的场景，如订单超时未支付自动取消、定时任务等。

### 4.1 实现原理

`snail-spring-boot-starter-redis` 使用 Redisson 客户端的 `RDelayedQueue` 和 `RBlockingDeque` 实现了基于 Redis 的延时队列。
*   `RDelayedQueue`：负责将带有延迟时间的消息放入队列。Redisson 会在消息达到指定延迟时间后，自动将消息从延迟队列转移到普通的阻塞队列 (`RBlockingDeque`)。
*   `RBlockingDeque`：一个阻塞双端队列，消费者可以从该队列中阻塞地获取消息。

这种机制利用 Redis 的有序集合 (ZSet) 来存储延迟消息，通过分值 (score) 记录消息的到期时间，Redisson 后台线程会周期性地检查 ZSet 中到期消息并将其转移。

### 4.2 实现代码

**`DelayQueue.java`：延时队列接口**

该接口定义了延时队列的基本操作：`offer` (添加消息) 和 `take` (获取消息)。

```java
package com.snail.framework.redis.delay;

import com.snail.framework.redis.delay.domain.DelayMessage;

/**
 * 延迟队列
 *
 * @author zhangpengjun
 * @date 2024/5/7
 */
public interface DelayQueue extends DelayQueueRegistry {

    /**
     * 添加元素
     *
     * @param message 消息
     */
    <T> void offer(DelayMessage<T> message);

    /**
     * 获取元素
     *
     * @param queueName 队列名称
     * @return {@link T }
     * @throws InterruptedException 中断异常
     */
    <T> DelayMessage<T> take(String queueName) throws InterruptedException;

}
```

**`RedisDelayQueue.java`：基于 Redis 的延时队列实现**

该类实现了 `DelayQueue` 接口，并使用 Redisson 客户端进行操作。
*   **`offer(DelayMessage<T> message)`:** 生产者调用此方法将消息添加到延时队列。它会获取一个 `RBlockingDeque`，然后通过 `redissonClient.getDelayedQueue(blockingDeque)` 获取对应的 `RDelayedQueue`，最后调用 `delayedQueue.offer(message, delay, unit)` 将消息放入延时队列，并指定延迟时间和单位。
*   **`take(String queueName)`:** 消费者调用此方法从队列中获取消息。它会获取一个 `RBlockingDeque`，然后调用 `blockingDeque.take()` 阻塞地获取消息。当消息到期并从延时队列转移到阻塞队列后，消费者即可获取到该消息。

```java
package com.snail.framework.redis.delay;

import com.snail.framework.redis.delay.domain.DelayMessage;
import com.snail.framework.redis.delay.interceptor.DelayMessageInterceptor;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RBlockingDeque;
import org.redisson.api.RDelayedQueue;
import org.redisson.api.RedissonClient;

import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * Redis 延迟队列
 *
 * @author zhangpengjun
 * @date 2024/5/7
 */
@Slf4j
public class RedisDelayQueue extends DefaultDelayQueueRegistry implements DelayQueue {

    private final RedissonClient redissonClient;
    private final DelayMessageInterceptor delayMessageInterceptor;

    public RedisDelayQueue(RedissonClient redissonClient, DelayMessageInterceptor delayMessageInterceptor) {
        this.redissonClient = redissonClient;
        this.delayMessageInterceptor = delayMessageInterceptor;
    }

    @Override
    public <T> void offer(DelayMessage<T> message) {
        if (!delayMessageInterceptor.producerIntercept(message)) {
            return;
        }
        List<String> queues = message.getQueues();
        long delay = message.getDelay();
        TimeUnit unit = message.getTimeUnit();
        for (String queue : queues) {
            RBlockingDeque<Object> blockingDeque = redissonClient.getBlockingDeque(queue);
            RDelayedQueue<Object> delayedQueue = redissonClient.getDelayedQueue(blockingDeque);
            delayedQueue.offer(message, delay, unit);
        }
    }

    @Override
    public <T> DelayMessage<T> take(String queueName) throws InterruptedException {
        RBlockingDeque<Object> blockingDeque = redissonClient.getBlockingDeque(queueName);
        DelayMessage<T> message = (DelayMessage<T>) blockingDeque.take();
        if (!delayMessageInterceptor.consumerIntercept(message)) {
            return null;
        }
        return message;
    }

}
```

## 项目仓库

项目地址：[snail-spring-boot-starter-redis](https://github.com/zpj80231/snail/tree/main/snail-framework/snail-spring-boot-starter-redis)

## 总结

`snail-spring-boot-starter-redis` 项目通过集成 Redisson 和 Spring AOP，为 Spring Boot 应用提供了强大而便捷的分布式增强功能。分布式锁解决了并发资源访问问题，防重攻击有效阻止了重复提交，二级缓存提升了系统性能和响应速度，而延时队列则为异步任务和定时业务提供了可靠的实现基础。这些模块化的设计使得开发者可以轻松地将这些能力集成到自己的分布式应用中，提升系统的健壮性和可用性。 

<Reward/>