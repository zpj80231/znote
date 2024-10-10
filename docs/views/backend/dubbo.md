---
title: Dubbo 连环问
date: 2019-07-22
tags:
- Dubbo
categories:
- 后端 Back-end
isShowComments: true
---

<Boxx/>

<!-- more -->

[[toc]]

### Dubbo 是什么

Dubbo 是阿里巴巴开源的基于 Java 的高性能 RPC（一种远程调用） 分布式服务框架（SOA），致力于提供高性能和透明化的 RPC 远程服务调用方案，以及 SOA 服务治理方案。

### 为什么要用 Dubbo

 因为是阿里开源项目，国内很多互联网公司都在用，已经经过很多线上考验。内部使用了 Netty、Zookeeper，保证了高性能高可用性。

1、使用Dubbo可以将核心业务抽取出来，作为独立的服务，逐渐形成稳定的服务中心，可用于提高业务复用
灵活扩展，使前端应用能更快速的响应多变的市场需求。
2、分布式架构可以承受更大规模的并发流量。

### Dubbo 和 Spring Cloud 有什么区别

1、通信方式不同：Dubbo 使用的是 RPC 通信，而Spring Cloud 使用的是HTTP RESTFul 方式。

2、组成不一样：dubbo的服务注册中心为Zookeerper，服务监控中心为dubbo-monitor,无消息总线，服务跟踪、批量任务等组件；
spring-cloud的服务注册中心为spring-cloud netflix  enruka，服务监控中心为spring-boot admin,有消息总线，数据流、服务跟踪、批量任务等组件；

### HTTP 和 RPC 的区别

RPC 主要用于公司内部的服务调用，性能消耗低，传输效率高，实现复杂。

HTTP 主要用于对外的异构环境，浏览器接口调用，App 接口调用，第三方接口调用等。

RPC 使用场景 (大型的网站，内部子系统较多、接口非常多的情况下适合使用 RPC)：

长链接。不必每次通信都要像 HTTP 一样去 3 次握手，减少了网络开销。
注册发布机制。RPC 框架一般都有注册中心，有丰富的监控管理；发布、下线接口、动态扩展等，对调用方来说是无感知、统一化的操作。
安全性，没有暴露资源操作。
微服务支持。就是最近流行的服务化架构、服务化治理，RPC 框架是一个强力的支撑。

### Dubbo 需要 Web 容器吗

 不需要，如果硬要用 Web 容器，只会增加复杂性，也浪费资源。

### Dubbo 内置了哪几种服务容器

三种服务容器：
1、Spring Container
2、Jetty Container
3、Log4j Container

Dubbo 的服务容器只是一个简单的 Main 方法，并加载一个简单的 Spring 容器，用于暴露服务。

### dubbo 都支持什么协议，推荐用哪种

1、dubbo://（推荐）
2、http://
3、rest://
4、redis://
5、memcached://

### Dubbo 里面有哪几种节点角色

1、provide：暴露服务的服务提供方
2、consumer：调用远程服务的服务消费方
3、registry:服务注册于发现的注册中心
4、monitor:统计服务调用次数和调用时间的监控中心
5、container:服务运行容器

### dubbo 服务注册与发现的流程图

![img](https:////upload-images.jianshu.io/upload_images/12956417-f031b9e95a1b6340.png?imageMogr2/auto-orient/strip|imageView2/2/w/1060/format/webp)

### Dubbo 默认使用什么注册中心，还有别的选择吗

推荐使用 zookeeper 作为注册中心，还有 redis、multicast、simple 注册中心。

### Dubbo 核心的配置有哪些

![img](https:////upload-images.jianshu.io/upload_images/12956417-2b6e7165b28d4502.png?imageMogr2/auto-orient/strip|imageView2/2/w/666/format/webp)

### 在 Provider 上可以配置的 Consumer 端的属性有哪些

1、timeout：方法调用超时
2、retries：失败重试次数，默认重试 2 次
3、loadbalance：负载均衡算法，默认随机
4、actives 消费者端，最大并发调用限制

### Dubbo 有哪几种负载均衡策略，默认是哪种

1、random loadbalance：安权重设置随机概率（默认）；
2、roundrobin loadbalance：轮寻，按照公约后权重设置轮训比例；
3、lastactive loadbalance：最少活跃调用数，若相同则随机；
4、consistenthash loadbalance：一致性hash，相同参数的请求总是发送到同一提供者。

### Dubbo 启动时如果依赖的服务不可用会怎样

 Dubbo 缺省会在启动时检查依赖的服务是否可用，不可用时会抛出异常，阻止 Spring 初始化完成，默认
 check="true"，可以通过 check="false" 关闭检查。

### Dubbo 推荐使用什么序列化框架，你知道的还有哪些

推荐使用Hessian序列化，还有Duddo、FastJson、Java自带序列化；

### Dubbo 默认使用的是什么通信框架，还有别的选择吗

Dubbo 默认使用 Netty 框架，也是推荐的选择，另外内容还集成有Mina、Grizzly。

### Dubbo 有哪几种集群容错方案，默认是哪种

![img](https:////upload-images.jianshu.io/upload_images/12956417-185b2a3476fb74ed.png?imageMogr2/auto-orient/strip|imageView2/2/w/665/format/webp)

### 服务提供者能实现失效踢出是什么原理

服务失效踢出基于zookeeper的临时节点原理。

### Dubbo 服务之间的调用是阻塞的吗

默认是同步等待结果阻塞的，支持异步调用。
Dubbo 是基于 NIO 的非阻塞实现并行调用，客户端不需要启动多线程即可完成并行调用多个远程服务，相对
多线程开销较小，异步调用会返回一个 Future 对象。

Dubbo 暂时不支持分布式事务。

### Dubbo 的管理控制台能做什么

管理控制台主要包含：路由规则，动态配置，服务降级，访问控制，权重调整，负载均衡，等管理功能。
注：dubbo源码中的dubbo-admin模块打成war包，发布运行即可得到dubbo控制管理界面。

### Dubbo 服务暴露的过程

Dubbo 会在 Spring 实例化完 bean 之后，在刷新容器最后一步发布 ContextRefreshEvent 事件的时候，通知
实现了 ApplicationListener 的 ServiceBean 类进行回调 onApplicationEvent 事件方法，Dubbo 会在这个方法
中调用 ServiceBean 父类 ServiceConfig 的 export 方法，而该方法真正实现了服务的（异步或者非异步）发
布。

### 当一个服务接口有多种实现时怎么做？

当一个接口有多种实现时，可以用 group 属性来分组，服务提供方和消费方都指定同一个 group 即可。

### 服务上线怎么兼容旧版本

可以用版本号（version）过渡，多个不同版本的服务注册到注册中心，版本号不同的服务相互间不引用。这 个和服务分组的概念有一点类似。

### Dubbo 和 Dubbox 有什么区别

Dubbox 是继 Dubbo 停止维护后，当当网基于 Dubbo 做的一个扩展项目，如加了服务可 Restful 调用，更新了开源组件等。

### 你觉得用 Dubbo 好还是 Spring Cloud 好

扩展性的问题，没有好坏，只有适合不适合，我更倾向于使用 Dubbo, Spring Cloud 版本升级太快，组件更新替换太频繁，配置太繁琐。

### 出现调用超时 com.alibaba.dubbo.remoting.TimeoutException 异常怎么办

通常是业务处理太慢，可在服务提供方执行：jstack PID > jstack.log 分析线程都卡在哪个方法调用上，这里就是慢的原因。
如果不能调优性能，请将timeout设大。 

### 出现 java.util.concurrent.RejectedExecutionException 或者 Thread pool exhausted 怎么办

1、RejectedExecutionException表示线程池已经达到最大值，并且没有空闲连，拒绝执行了一些任务。 
2、Thread pool exhausted通常是min和max不一样大时，表示当前已创建的连接用完，进行了一次扩充，创建了新线程，但不影响运行。 
原因可能是连接池不够用，请调整dubbo.properites中的：
// 设成一样大，减少线程池收缩开销  
dubbo.service.min.thread.pool.size=200  
dubbo.service.max.thread.pool.size=200  



