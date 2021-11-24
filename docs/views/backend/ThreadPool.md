---
title: 线程池 - 进阶
date: 2020-03-03
tags:
  - 多线程
  - Java
categories:
  - 后端 Back-end
isShowComments: false

---

<Boxx/>

[[toc]]

## 前言

-  Java中创建线程池很简单，Java提供了 ***Executors*** 这个强大的线程池工具类，我们创造线程池只需调用某个方法即可，比如`Executors.newFixedThreadPool(int nThreads)`，但是便捷不仅隐藏了复杂性，也为我们埋下了潜在的隐患（**OOM**，**线程耗尽**）。
  
-  而强大的 ***Executors*** 在创建线程池时，也只是依赖`ThreadPoolExecutor `类，修改其中几个方法参数而已。
  
- 同时，在阿里规范中也明确【强制】指出 **通过 ThreadPoolExecutor  创建线程池**。

  1.  【强制】创建线程或线程池时请指定有意义的线程名称，方便出错时回溯。
     正例： 

     ```java
     public class TimerTaskThread extends Thread {
         public TimerTaskThread(){
             super.setName("TimerTaskThread"); 
             ...
         }
     }
     ```

  2.  【强制】线程资源必须通过线程池提供，不允许在应用中自行显式创建线程。
     说明： 使用线程池的好处是减少在创建和销毁线程上所花的时间以及系统资源的开销，解决资
     源不足的问题。如果不使用线程池，有可能造成系统创建大量同类线程而导致消耗完内存或者
     “过度切换”的问题。 

  3.  【强制】线程池不允许使用 Executors 去创建，而是通过 ThreadPoolExecutor 的方式，这样
     的处理方式让写的同学更加明确线程池的运行规则，规避资源耗尽的风险。 

## 初识Executors

**1. Executors.newCachedThreadPool();**
说明: 创建一个可缓存线程池，如果线程池长度超过处理需要，可灵活回收空闲线程，若无可回收，则新建线程.
内部实现：

```java
// 无界线程池
public static ExecutorService newCachedThreadPool() {
    return new ThreadPoolExecutor(0, Integer.MAX_VALUE,
                                  60L, TimeUnit.SECONDS,
                                  new SynchronousQueue<Runnable>());
}
```

**2. Executors.newFixedThreadPool(int);**
说明: 创建一个定长线程池，可控制线程最大并发数，超出的线程会在队列中等待。
内部实现：

```java
// 固定大小线程池
public static ExecutorService newFixedThreadPool(int nThreads) {
    return new ThreadPoolExecutor(nThreads, nThreads,
                                  0L, TimeUnit.MILLISECONDS,
                                  new LinkedBlockingQueue<Runnable>());
}
```

**3. Executors.newSingleThreadExecutor();**
说明:创建一个单线程化的线程池，它只会用唯一的工作线程来执行任务，保证所有任务按照顺序执行。
内部实现：

```java
// 单个后台线程
public static ExecutorService newSingleThreadExecutor() {
    return new FinalizableDelegatedExecutorService
        (new ThreadPoolExecutor(1, 1,
                                0L, TimeUnit.MILLISECONDS,
                                new LinkedBlockingQueue<Runnable>()));
}
```

**4. Executors.newScheduledThreadPool(int);**
说明:创建一个定长线程池，支持定时及周期性任务执行。
内部实现：

```java
new ScheduledThreadPoolExecutor(corePoolSize)
```

##  步入`ThreadPoolExecutor `

- 核心参数

```java
// Java线程池的完整构造函数
public ThreadPoolExecutor(
  int corePoolSize, // 线程池长期维持的线程数，即使线程处于Idle状态，也不会回收。
  int maximumPoolSize, // 线程数的上限
  long keepAliveTime, TimeUnit unit, // 超过corePoolSize的线程的idle时长，
                                     // 时长的单位
  BlockingQueue<Runnable> workQueue, // 任务的排队队列
  ThreadFactory threadFactory, // 新线程的产生方式
  RejectedExecutionHandler handler) // 拒绝策略
```

| 参数            | 说明                                                         |
| --------------- | ------------------------------------------------------------ |
| corePoolSize    | 核心线程数量，线程池维护线程的最少数量                       |
| maximumPoolSize | 线程池维护线程的最大数量                                     |
| keepAliveTime   | 线程池除核心线程外的其他线程的最长空闲时间，超过该时间的空闲线程会被销毁 |
| unit            | keepAliveTime的单位，TimeUnit中的几个静态属性：NANOSECONDS、MICROSECONDS、MILLISECONDS、SECONDS |
| workQueue       | 线程池所使用的任务缓冲队列                                   |
| threadFactory   | 线程工厂，用于创建线程，一般用默认的即可                     |
| handler         | 线程池对拒绝任务的处理策略                                   |

### handler拒绝策略

当线程池任务处理不过来的时候，可以通过handler指定的策略进行处理，ThreadPoolExecutor提供了四种策略：

1. ThreadPoolExecutor.AbortPolicy:丢弃任务并抛出RejectedExecutionException异常；也是默认的处理方式。
2. ThreadPoolExecutor.DiscardPolicy：丢弃任务，但是不抛出异常。
3. ThreadPoolExecutor.DiscardOldestPolicy：丢弃队列最前面的任务，然后重新尝试执行任务（重复此过程）。
4. ThreadPoolExecutor.CallerRunsPolicy：由调用线程处理该任务

可以通过实现RejectedExecutionHandler接口自定义处理方式。

### workQueue任务队列

1. ArrayBlockingQueue： 这是一个由数组实现的容量固定的有界阻塞队列。
2. SynchronousQueue： 没有容量，不能缓存数据；每个put必须等待一个take; offer()的时候如果没有另一个线程在poll()或者take()的话返回false。
3. LinkedBlockingQueue： 这是一个由单链表实现的默认×××的阻塞队列。LinkedBlockingQueue提供了一个可选有界的构造函数，而在未指明容量时，容量默认为Integer.MAX_VALUE。 

## 线程池的工作顺序

- corePoolSize ->  workQueue 任务队列 -> maximumPoolSize -> handler 拒绝策略 

  跟银行类似：有2个窗口（`corePoolSize `）办理业务，有人来了就先到候客区（` workQueue `）等着，候客区如果满了就再多开几个窗口（`maximumPoolSize `）办理业务，如果候客区和能开的窗口都满了，那保安就拒绝（` handler `）别人再进入银行。业务办理的差不多了，多开的窗口等待一定时间（` keepAliveTime` ）还没有人办理业务，那就把它关了吧浪费。

## Executors弊端

1. **FixedThreadPool 和 SingleThreadPool:**
   
   允许的请求队列长度为 Integer.MAX_VALUE，可能会堆积大量的请求，从而导致 OOM。
   
2. **CachedThreadPool 和 ScheduledThreadPool:**

   允许的创建线程数量为 Integer.MAX_VALUE， 可能会创建大量的线程，从而导致 OOM。 

## 正确的使用线程池

```java
// 返回可用处理器的Java虚拟机的数量(获取本机cpu核心数)
int poolSize = Runtime.getRuntime().availableProcessors() * 2;
// 使用有界队列，避免OOM
BlockingQueue<Runnable> queue = new ArrayBlockingQueue<>(512);
// 指定拒绝策略
RejectedExecutionHandler policy = new ThreadPoolExecutor.DiscardPolicy();

//自定义的线程池
ExecutorService executorService = new ThreadPoolExecutor(poolSize, poolSize,
    0, TimeUnit.SECONDS,queue,policy);
```

### 线程超时时间

- 单个任务的超时时间

`V Future.get(long timeout, TimeUnit unit)`方法可以指定等待的超时时间，超时未完成会抛出`TimeoutException`。

- 多个任务的超时时间

等待多个任务完成，并设置最大等待时间，可以通过[CountDownLatch](https://docs.oracle.com/javase/7/docs/api/java/util/concurrent/CountDownLatch.html)完成：

```java
public void testLatch(ExecutorService executorService, List<Runnable> tasks) 
    throws InterruptedException{
      
    CountDownLatch latch = new CountDownLatch(tasks.size());
      for(Runnable r : tasks){
          executorService.submit(new Runnable() {
              @Override
              public void run() {
                  try{
                      r.run();
                  }finally {
                      latch.countDown();// countDown
                  }
              }
          });
      }
      latch.await(10, TimeUnit.SECONDS); // 指定超时时间
  }
```

