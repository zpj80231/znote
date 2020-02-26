---
title: "面试宝典-试炼篇"
date: 2019-01-31
tags:
- 面试
categories:
- 面试

---

<Boxx/>

- 试炼篇统一没有答案！！

## java基础知识
1. 栈和队列的区别
2. 接口和抽象类的区别
3. int和Integer的区别
4. 常量池的问题
5. ==和equals的区别
6. 重载和重写的区别
7. String和StringBuilder、StringBuffer的区别

## 集合框架
1. ArrayList,LinkedList,HashMap,LinkedHashMap,ConcurrentHashMap的底层实现原理
2. 1.7版本和1.8版本的HashMap的区别
3. 1.7版本和1.8版本的ConcurrentHashMap的区别
4. HashMap能不能排序？HashMap的长度为什么要是2的幂次方

## 多线程
1. 创建线程的几种方式？wait,sleep分别是谁的方法，区别？线程间的通信方式？
2. 介绍下什么是死锁，遇见过死锁吗？你是怎么排查的（可以通过jps排查）
3. 创建线程池的几种方式，线程池有什么好处
4. 线程继承和接口的区别，接口有什么好处
5. synchronized、Lock、ReentrantLock的区别，用法及原理
6. CountDownLatch与CyclicBarrier用法
7. ThreadLocal的用法和原理
8. volatile关键字的作用和原理
9. 乐观锁和悲观锁
10. 对公平锁，非公平锁，可重入锁，自旋锁，读写锁的理解
11. CAS是什么及基层原理
12. ArrayBlockQueue，LinkedBlockingQueue，SynchronousQueue等等阻塞队列的理解
13. ThreadPoolExecutor的传入参数及内部工作原理
14. 给你一个具体的业务场景，让你使用ThreadPoolExecutor创建一个合适的线程池
15. 分布式环境下，怎么保证线程安全

## jvm
1. JVM内存机制
2. 介绍下垃圾收集机制，垃圾收集有哪些算法，各自的特点
3. 聊聊GC，谈谈Major GC，Full GC区别，垃圾收集器有哪些，他们的区别
4. OutOfMemoryError这个错误你遇到过吗，你是怎么解决处理的
5. JVM调优有哪些参数，介绍下，线上环境上，你是怎么查看JVM的参数并进行调优的
6. 能不能自己写一个类叫java. lang. String(类加载的过程，双亲委派模型)

## 框架相关问题
1. Spring用了哪些设计模式？Spring注入bean的方式？对SpringIOC和SpringAOP的理解
2. Spring事务的隔离机制和传播机制
3. Mybatis的缓存机制（一级缓存和二级缓存），Mybatis的mapper文件中#和$的区别
4. SpringMVC的流程
5. Spring和SpringBoot的区别
6. 对SpringBoot的理解
7. RPC框架有哪些，他们的区别
8. Dubbo的使用和理解
9. SprigCloud的使用和组件，谈谈你得理解

## 消息中间件
1. 你们公司是如何进行消息中间件的技术选型
2. 如何保证消息中间件的高可用
3. 如何保证消息中间件重复发送消息
4. 消息队列积压了大量的消息，你该怎么处理
5. 如何保证消费者消费消极是有顺序的
6. 让你来开发一个消息中间件，你会怎么架构

## 缓存
1. 你们公司为什么要使用Redis，Redis有几种数据类型
2. Redis持久化机制，Redis的过期策略
3. 怎么保证Redis的高可用
4. 什么是缓存穿透，如何避免，什么是缓存雪崩，如何避免
5. 如何保证缓存与数据库的读写一致性
6. Redis单线程模型原理，为什么能支撑高并发
7. Redis哨兵架构的理解和底层原理

## 数据库
1. 工作中你是怎么优化sql的
2. 什么情况下，索引会失效
3. 数据库的存储引擎，比如：MySQL的MyISAM和InnoDB区别
4. 索引的最左原则
5. 索引的底层原理
6. 你们公司是怎么进行分库分表，分库分表的方案

## 其他
1. 分布式事务是怎么解决的
2. 分布式session方案
3. 设计一个秒杀场景
4. 怎么防止表单多次提交
5. Linux的基本操作命令
6. ElasticSearch的使用和原理
7. zookeeper的使用和原理