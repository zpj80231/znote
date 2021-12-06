---
title: 线程池 - 动态调节参数
date: 2021-11-24
tags:
  - 多线程
  - Java
categories:
  - 后端 Back-end
isShowComments: true
---

<Boxx/>

线程池是一种基于池化思想管理线程的工具，使用线程池可以减少创建销毁线程的开销，避免线程过多导致系统资源耗尽。在高并发的任务处理场景，线程池的使用是必不可少的。在双11主项目中为了提升处理性能，很多地方使用到了线程池。随着线程池的使用，逐渐发现一个问题，线程池的参数如何设置？

<!-- more -->

[[toc]]

## 背景

根据任务的类型，线程池可以区分为IO密集型和CPU密集型，对于CPU密集型，一般经验是设置corePoolSize=CPU核数+1，对于IO密集型需要根据具体的RT和流量来设置，没有普适的经验值。然而，我们一般遇到的情况多数是处理IO密集型任务，如果线程池参数不可动态调节，就没办法根据实际情况实时调整处理速度，只能通过发布代码调整参数。

如果线程池参数不合理会导致什么问题呢？下面列举几种可能出现的场景：最大线程数设置偏小，工作队列大小设置偏小，导致服务接口大量抛出RejectedExecutionException。

最大线程数设置偏小，工作队列大小设置过大，任务堆积过度，接口响应时长变长。

最大线程数设置过大，线程调度开销增大，处理速度反而下降。

核心线程数设置过小，流量突增时需要先创建线程，导致响应时长过大。

核心线程数设置过大，空闲线程太多，占用系统资源。

## 线程池任务调度机制

要明白线程池参数对运行时的影响，就必须理解其中的原理，所以下面先简单总结了线程池的核心原理。

Java中的线程池核心实现类是ThreadPoolExecutor，ThreadPoolExecutor一方面维护自身的生命周期，另一方面同时管理线程和任务，使两者良好的结合从而执行并行任务。用户无需关注如何创建线程，如何调度线程来执行任务，用户只需提供Runnable对象，将任务的运行逻辑提交到执行器(Executor)中，由Executor框架完成线程的调配和任务的执行部分。

ThreadPoolExecutor是如何运行，如何同时维护线程和执行任务的呢？其运行机制如下图所示：

![](https://img-blog.csdnimg.cn/img_convert/074a5affd33da0c2e73cd6c8e762360b.png)

所有任务的调度都是由execute方法完成的，这部分完成的工作是：检查现在线程池的运行状态、运行线程数、运行策略，决定接下来执行的流程，是直接申请线程执行，或是缓冲到队列中执行，亦或是直接拒绝该任务。其执行过程如下：首先检测线程池运行状态，如果不是RUNNING，则直接拒绝，线程池要保证在RUNNING的状态下执行任务。

如果workerCount < corePoolSize，则创建并启动一个线程来执行新提交的任务。

如果workerCount >= corePoolSize，且线程池内的阻塞队列未满，则将任务添加到该阻塞队列中。

如果workerCount >= corePoolSize && workerCount < maximumPoolSize，且线程池内的阻塞队列已满，则创建并启动一个线程来执行新提交的任务。

如果workerCount >= maximumPoolSize，并且线程池内的阻塞队列已满, 则根据拒绝策略来处理该任务, 默认的处理方式是直接抛异常。

**线程池参数中有几个比较关键的参数，分别是：**

1. corePoolSize：核心线程数大小，不管它们创建以后是不是空闲的。线程池需要保持 corePoolSize 数量的线程，除非设置了 allowCoreThreadTimeOut；
2. maximumPoolSize：最大线程数，线程池中最多允许创建 maximumPoolSize 个线程;
3. keepAliveTime：存活时间，如果经过 keepAliveTime 时间后，超过核心线程数的线程还没有接受到新的任务，那就回收;
4. unit： keepAliveTime 的时间单位;
5. workQueue：存放待执行任务的队列：当提交的任务数超过核心线程数大小后，再提交的任务就存放在这里。它仅仅用来存放被 execute 方法提交的 Runnable 任务; 目前JDK提供了以下阻塞队列的实现：

![](https://img-blog.csdnimg.cn/img_convert/67dbd72c11b4953a5991344de505871b.png)

6. threadFactory：线程工厂，用来创建线程工厂。比如这里面可以自定义线程名称，当进行虚拟机栈分析时，看着名字就知道这个线程是哪里来的，不会懵逼；
7. handler ：拒绝策略，当队列里面放满了任务、最大线程数的线程都在工作时，这时继续提交的任务线程池就处理不了，应该执行怎么样的拒绝策略；

![](https://imgconvert.csdnimg.cn/aFR0cHM6Ly9qZXNzaWNhLTEyNTk2NzEzMzQuY29zLmFwLWNoZW5nZHUubXlxY2xvdWQuY29tL2p2bS9qdm0vMDIucG5n?x-oss-process=image/format,png)

## 动态调节线程池参数实现

线程池相关的重要参数有三个，分别是**核心线程数**、**最大线程数**和**工作队列大小**，接下来将阐述如何实现动态调节线程池参数。

### 调节核心和最大线程数的原理

ThreadPoolExecutor已经提供了两个方法在运行时设置核心线程数和最大线程数，分别是ThreadPoolExecutor.setCorePoolSize()和ThreadPoolExecutor.setMaximumPoolSize()。

setCorePoolSize方法的执行流程是：首先会覆盖之前构造函数设置的corePoolSize，然后，如果新的值比原始值要小，当多余的工作线程下次变成空闲状态的时候会被中断并销毁，如果新的值比原来的值要大且工作队列不为空，则会创建新的工作线程。流程图如下：

<img src="https://img-blog.csdnimg.cn/img_convert/9943d6e8df5f7d2fcd11b5161ec5e3a6.png" width="60%">

setMaximumPoolSize方法执行流程是：首先会覆盖之前构造函数设置的maximumPoolSize，然后，如果新的值比原来的值要小，当多余的工作线程下次变成空闲状态的时候会被中断并销毁。

**代码设置：**

![](https://imgconvert.csdnimg.cn/aFR0cHM6Ly9qZXNzaWNhLTEyNTk2NzEzMzQuY29zLmFwLWNoZW5nZHUubXlxY2xvdWQuY29tL2p2bS9qdm0vMDQucG5n?x-oss-process=image/format,png)

### 调节工作队列大小的原理

线程池中是以生产者消费者模式，通过一个阻塞队列来缓存任务，工作线程从阻塞队列中获取任务。工作队列的接口是阻塞队列(BlockingQueue)，在队列为空时，获取元素的线程会等待队列变为非空，当队列满时，存储元素的线程会等待队列可用。

目前JDK提供了以下阻塞队列的实现：

![](https://img-blog.csdnimg.cn/img_convert/67dbd72c11b4953a5991344de505871b.png)

但是很不幸，这些阻塞队列的实现都不支持动态调整大小，那么为什么不自己实现一个可动态调整大小的阻塞队列呢。重复造轮子是不可取的，所以选择改造轮子。LinkedBlockingQueue是比较常用的一个阻塞队列，它无法修改大小的原因是capacity字段设置成了final private final int capacity;。如果把final去掉，并提供修改capacity的方法，是不是就满足我们的需求呢？事实证明是可行的。

所以要想动态修改只能自己实现一个BlockingQueue，然后capacity可以动态修改即可；复制一个LinkedBlockingQueue源码，将capacity的final修饰去掉，添加set方法，保存为ResizableCapacityLinkedBlockingQueue.java即可，然后使用ResizableCapacityLinkedBlockingQueue作为任务队列；

![](https://imgconvert.csdnimg.cn/aFR0cHM6Ly9qZXNzaWNhLTEyNTk2NzEzMzQuY29zLmFwLWNoZW5nZHUubXlxY2xvdWQuY29tL2p2bS9qdm0vMDYucG5n?x-oss-process=image/format,png)

## 这个过程中涉及到的面试题有哪些？

问题一：线程池被创建后里面有线程吗？如果没有的话，你知道有什么方法对线程池进行预热吗？

答：线程池被创建后如果没有任务过来，里面是不会有线程的。如果需要预热的话可以调用下面的两个方法：

prestartCoreThread()和prestartAllCoreThreads()

问题二：核心线程数会被回收吗？需要什么设置？

答：核心线程数默认是不会被回收的，如果需要回收核心线程数，需要调用下面的方法：allowCoreThreadTimeOut();

## 参考

[Java-线程池动态修改大小](https://blog.csdn.net/qq_21239913/article/details/105750002?utm_medium=distribute.pc_aggpage_search_result.none-task-blog-2~aggregatepage~first_rank_ecpm_v1~rank_v31_ecpm-15-105750002.pc_agg_new_rank&utm_term=java%E5%AE%9E%E7%8E%B0%E5%8A%A8%E6%80%81%E7%BA%BF%E7%A8%8B%E6%B1%A0&spm=1000.2123.3001.4430)

[java动态线程池_可动态调节参数的线程池实现](https://blog.csdn.net/weixin_42306503/article/details/114347975)
