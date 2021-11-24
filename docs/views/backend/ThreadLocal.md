---
title: 线程池 - 简介
date: 2020-03-31
tags:
  - 多线程
  - Java
categories:
  - 后端 Back-end
isShowComments: false
---

<Boxx/>

[[toc]]

## 适用场景

- 每个线程需要有自己单独的实例
- 实例需要在多个方法中共享，但不希望被多线程共享
- 线程间数据隔离，数据库连接，Session会话管理。

每个线程都对应一个ThreadLocalMap, 而Threadlocal负责访问和维护ThreadLocalMap。
set()方法就是把Threadlocal插入当前Thread维护的ThreadLocalMap中，如果你在线程1里面去set()，那么你在线程2里面去获取的时候，它取得是线程2的ThreadLocalMap，但是线程2里面的ThreadLocalMap并没有插入ThreadLocal。

## 简介

ThreadLocal的目的是为了解决多线程访问资源时的共享问题 。

可以把`ThreadLocal`看成一个全局`Map`：每个线程获取`ThreadLocal`变量时，总是使用`Thread`自身作为key。

ThreadLocal 变量通常被`private static`修饰。  ThreadLocal 提供了线程本地的实例。它与普通变量的区别在于，**每个使用该变量的线程都会初始化一个完全独立的实例副本**。 

也就是说，不管你有多少个线程，ThreadLocal 相当于在每一个线程中映射一个副本，各线程间只会访问自己线程的ThreadLocal 。

## 实例

::: details 代码示例（点击展开）

```java
public class TestThreadLocal {
    private static ThreadLocal<Long> longLocal = new ThreadLocal<Long>();
    private static ThreadLocal<String> stringLocal = new ThreadLocal<String>(){
        /* 1. ThreadLocal 设置默认值的方式 */
        protected String initialValue() {
            return Thread.currentThread().getName();
        };
    };
 
    public void set() {
        /* 2. ThreadLocal 赋值方式 */
        longLocal.set(Thread.currentThread().getId());
        // stringLocal.set(Thread.currentThread().getName());
    }
     
    public long getLong() {
        /* 3. ThreadLocal 取值方式 */
        return longLocal.get();
    }
     
    public String getString() {
        return stringLocal.get();
    }
     
    public static void main(String[] args) throws InterruptedException {
        final TestThreadLocal test = new TestThreadLocal();
         
        //当前线程
        test.set();
        System.out.println("main线程：  " + test.getLong());
        System.out.println("main线程：  " + test.getString());
 
        Thread thread1 = new Thread(){
            public void run() {
                //其它线程
                test.set();
                System.out.println("新线程：  " + test.getLong());
                System.out.println("新线程：  " + test.getString());
            };
        };
        thread1.start();
        thread1.join();
         
        //当前线程
        System.out.println("main线程：  " + test.getLong());
        System.out.println("main线程：  " + test.getString());
    }
}
```

::::

## ThreadLocalMap与内存泄漏

该方案中，Map 由 ThreadLocal 类的静态内部类 ThreadLocalMap 提供。该类的实例维护某个 ThreadLocal 与具体实例的映射。与 HashMap 不同的是，ThreadLocalMap 的每个 Entry 都是一个对 ***键\*** 的弱引用，这一点从`super(k)`可看出。另外，每个 Entry 都包含了一个对 ***值\*** 的强引用。

```java
static class Entry extends WeakReference<ThreadLocal<?>> {  
    /** The value associated with this ThreadLocal. */  
    Object value;  
    Entry(ThreadLocal<?> k, Object v) {    
        super(k);    
        value = v;  
    }
}
```

使用弱引用的原因在于，当没有强引用指向 ThreadLocal 变量时，它可被回收，从而避免上文所述 ThreadLocal 不能被回收而造成的内存泄漏的问题。

但是，这里又可能出现另外一种内存泄漏的问题。ThreadLocalMap 维护 ThreadLocal 变量与具体实例的映射，当 ThreadLocal 变量被回收后，该映射的键变为 null，该 Entry 无法被移除。从而使得实例被该 Entry 引用而无法被回收造成内存泄漏。

注：Entry虽然是弱引用，但它是 ThreadLocal 类型的弱引用（也即上文所述它是对 ***键\*** 的弱引用），而非具体实例的的弱引用，所以无法避免具体实例相关的内存泄漏。

### 防止内存泄露

1. 特别注意`ThreadLocal`一定要在`finally`中清除：

```java
try {
    threadLocalUser.set(user);
    ...
} finally {
    threadLocalUser.remove();
}
```

这是因为当前线程执行完相关代码后，很可能会被重新放入线程池中，如果`ThreadLocal`没有被清除，该线程执行其他代码时，会把上一次的状态带进去。

2. 为了保证能释放`ThreadLocal`关联的实例，我们可以通过`AutoCloseable`接口配合`try (resource) {...}`结构，让编译器自动为我们关闭。例如，一个保存了当前用户名的`ThreadLocal`可以封装为一个`UserContext`对象：

```java
public class UserContext implements AutoCloseable {

    static final ThreadLocal<String> ctx = new ThreadLocal<>();

    public UserContext(String user) {
        ctx.set(user);
    }

    public static String currentUser() {
        return ctx.get();
    }

    @Override
    public void close() {
        ctx.remove();
    }
}
```

使用的时候，我们借助`try (resource) {...}`结构，可以这么写：

```java
try (var ctx = new UserContext("Bob")) {
    // 可任意调用UserContext.currentUser():
    String currentUser = UserContext.currentUser();
} // 在此自动调用UserContext.close()方法释放ThreadLocal关联对象
```

这样就在`UserContext`中完全封装了`ThreadLocal`，外部代码在`try (resource) {...}`内部可以随时调用`UserContext.currentUser()`获取当前线程绑定的用户名。

## 总结

- ThreadLocal 并不解决线程间共享数据的问题
- ThreadLocal 通过隐式的在不同线程内创建独立实例副本避免了实例线程安全的问题
- 每个线程持有一个 Map 并维护了 ThreadLocal 对象与具体实例的映射，该 Map 由于只被持有它的线程访问，故不存在线程安全以及锁的问题
- ThreadLocalMap 的 Entry 对 ThreadLocal 的引用为弱引用，避免了 ThreadLocal 对象无法被回收的问题
- ThreadLocalMap 的 set 方法通过调用 replaceStaleEntry 方法回收键为 null 的 Entry 对象的值（即为具体实例）以及 Entry 对象本身从而防止内存泄漏
- ThreadLocal 适用于变量在线程间隔离且在方法间共享的场景

## 参考

[ http://www.jasongj.com/java/threadlocal/ ]( http://www.jasongj.com/java/threadlocal/ )

[ https://droidyue.com/blog/2016/03/13/learning-threadlocal-in-java/ ]( https://droidyue.com/blog/2016/03/13/learning-threadlocal-in-java/ )

[ThreadLocal内存泄漏问题]( https://juejin.im/post/5ba9a6665188255c791b0520 )

 [廖雪峰的官方网站](https://www.liaoxuefeng.com/wiki/1252599548343744/1306581251653666)
