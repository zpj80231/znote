---
title: Java中的各种锁
date: 2020-04-27
tags:
- Java
categories:
- 后端 Back-end
isShowComments: false
---

<Boxx/>

公平非公平锁，可重入锁，自旋锁，读写锁等。

<!-- more -->

[[toc]]

## 公平锁

指根据线程在队列中的优先级获取锁，比如线程优先加入阻塞队列，那么线程就优先获取锁（火车站买票排队）

## 非公平锁
指在获取锁的时候，每个线程都会去争抢，并且都有机会获取到锁，无关线程的优先级（火车站买票可插队）

## 可重入锁
一个线程获取到锁后，如果继续遇到被相同锁修饰的资源或方法，那么可以继续获取该锁（允许多道锁，小区门口上锁，单元门上锁，厕所再上一把锁）

对 ***synchronized*** 来说，每个锁都有线程持有者和锁计数器，每次线程获取到锁,会记录下改线程，并且锁的计数器就+1，当线程退出synchronized代码块的时候，线程计数就会-1，当锁计数为0的时候，就释放锁。

## 自旋锁:
   指当锁被获取后，其他线程并不会停止获取，而是一直去尝试获取（while + CAS实现的锁，各自线程不断地去看锁有没有释放）

```java
public class SpinLock {

    private static final AtomicReference<Thread> atomicReference = new AtomicReference<>();

    public  void lock(){
        //当前线程作为锁资源
        Thread thread = Thread.currentThread();

        //如果期盼值是null,也就是代表没有锁引用了,就设置为当前线程引用,如果不成功就while
        while (!atomicReference.compareAndSet(null,thread)){

        }
    }

    public  void unlock(){
        //当前获取锁的线程
        Thread thread = Thread.currentThread();
        
        //释放锁,让下一个线程获取
        atomicReference.compareAndSet(thread,null);
    }
    
    public static void main(String[] args) throws Exception{
        SpinLock spinLock = new SpinLock();

        new Thread(()->{
            spinLock.lock();
            //其他操作...
            spinLock.unlock();
        },"A").start();
    }
}
```

这样做的**好处是减少上下文开销，缺点是增加cpu消耗。**

CAS底层就使用了自旋操作（不是自旋锁，而是如果预期值和原值比较不成功就会一直比较）

## 读写锁

- 独占锁:（一个坑只能有一个人拉屎）
  
  锁一次只能被一个线程占有使用，Synchronized和ReetrantLock都是独占锁。

- 共享锁:（允许多个人同时看到那个牌子：厕所有人，正在拉屎。。）
  
  锁可以被多个线程持有，对于ReentrantReadWriteLock而言，它的读锁是共享锁，写锁是独占锁 。

```java
//模拟hibernate缓存被读和被写
public class ReadWriteLockDemo{
    
    static class Cache{
        //用map来充当缓存容器
        private HashMap<String,Object> cache = new HashMap<>();
        private ReadWriteLock readWriteLock = new ReentrantReadWriteLock();
		
        public void put(String key , Object val){
            readWriteLock.writeLock().lock();
            try{
                System.out.println(Thread.currentThread().getName()+" 开始写入");
                cache.put(key,val);
                System.out.println(Thread.currentThread().getName()+" 写入完成");
            }
            catch(Exception e){
                e.printStackTrace();
            }
            finally{
                readWriteLock.writeLock().unlock();
            }
        }


        public void get(String key)
        {
            readWriteLock.readLock().lock();
            try{
                System.out.println(Thread.currentThread().getName() + " 开始读取");
                Object obj = cache.get(key);
                System.out.println(Thread.currentThread().getName() + " 读取完成 : " + obj);
            }
            catch(Exception e){
                e.printStackTrace();
            }
            finally{
               readWriteLock.readLock().unlock();
            }
        }
    }

    public static void main(String[] args){
        Cache cache = new Cache();
        for (int i = 0 ; i < 5; ++i){
            final int tempI = i;
            new Thread(()->{
               cache.put(String.valueOf(tempI),tempI);
            }).start();
        }

        for (int i = 0 ; i < 5; ++i){
            final int tempI = i;
            new Thread(()->{
                cache.get(String.valueOf(tempI));
            }).start();
        }
    }
}
```

## 其他

- 刚发现美团写的不错 -- [传送门](https://tech.meituan.com/2018/11/15/java-lock.html)

