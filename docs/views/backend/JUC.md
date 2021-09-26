---
title: JUC小结
date: 2020-03-11
tags:
- Java
categories:
- 后端 Back-end
isShowComments: false
---

<Boxx/>

[[toc]]

## 简介

- 自JDK1.5出现的，JUC（Java并发包）就是java.util .concurrent工具包的简称。
- 所属位置：jre1.8.0/lib/rj.jar，在jvm中rj.jar由👉bootsrap.classloader加载器通过双亲委派机制加载到内存。

## volatile关键字

- Java中各线程变量都是私有的，为 <u>保证多线程共享数据，常用volatile</u> 关键字修饰数据以保证共享数据在内存中的可见性。

- 各线程数据都是从主内存中copy过来的，某一线程修改完数据之后再回写到主内存中去，加volatile就相当于一旦有一个线程修改完数据的**同时**主内存数据也修改**同时**通知其它线程这个数据已被修改其它线程停止对这个数据的所有操作（加volatile可以理解为直接操作主内存）

  ```java
  public class TestVolatile {
      public static void main(String[] args){ //这个线程是用来读取flag的值的
          ThreadDemo threadDemo = new ThreadDemo();
          Thread thread = new Thread(threadDemo);
          thread.start();
          while (true){
              if (threadDemo.isFlag()){
                  System.out.println("主线程读取到的flag = " + threadDemo.isFlag());
                  break;
              }
          }
      }
  }
  
  @Data
  class ThreadDemo implements Runnable{ //这个线程是用来修改flag的值的
      public  boolean flag = false;
      
      //加volatile保证flag在主线程的可见性
      //public  volatile boolean flag = false;
      
      @Override
      public void run() {
          try {
              Thread.sleep(200);
          } catch (InterruptedException e) {
              e.printStackTrace();
          }
          flag = true;
          System.out.println("ThreadDemo线程修改后的flag = " + isFlag());
      }
  }
  ```

- volatile和synchronized的区别：

  volatile禁止指令重排序。
  volatile不具备互斥性(当一个线程持有锁时，其他线程进不来，这就是互斥性)。
  volatile保证可见性但是不具备原子性(保证原子性：1.加锁、2.使用volatile保证可见，使用CAS原子类保证原子性)。

## CAS原子类

- CAS：CompareAndSet，CAS涉及3个元素:内存地址、期盼值和目标值，只有内存地址对应的值和期望的值相同时，才把内存地址对应的值修改为目标值。

- CAS的缺点：

  - 效率低：底层采用遍历比较的方式，如果期望值和当前值比较不成功则会一直循环，时间一长导致CPU开销过大
  
  - 可能导致ABA问题：假设2个线程读取了主内存中的共享变量。如果一个线程对主内存中的值进行了修改后，又把新值改回了原来的值，而此时另一个线程进行CAS操作，发现原值和期盼的值是一样的，就顺利的进行了CAS操作。这就是CAS引发的ABA问题

### ABA问题的解决

- juc的atomic包下提供了**AtomicStampedReference**类，它相较于普通的Atomic原子类多增加了一个**版本号**的字段（相当于svn，git的版本号机制）
- ABA问题的演示与解决

```java
package com.zpj80321.znote.juc.volatiles;

import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;
import java.util.concurrent.atomic.AtomicStampedReference;

/**
 * @Description : TODO 测试ABA问题的产生与解决
 */
public class ABA {

    public static void main(String[] args) throws Exception
    {
        System.out.println("ABA问题的演示---------------------------------");
        AtomicReference<Integer> atomicReference = new AtomicReference<>(10);

        new Thread(()->{
            //先将数据修改成其他值,再修改回原值
            System.out.println(atomicReference.compareAndSet(10 , 11));
            //修改回原值 :10
            System.out.println(atomicReference.compareAndSet(11, 10));
        },"A").start();

        new Thread(()->{
            try
            {
                //让当前线程停止3秒中,让 A 线程先完成ABA问题的修改,然后此线程再执行
                TimeUnit.SECONDS.sleep(3);

                System.out.println("经过ABA操作后,数据修改: "+
                        atomicReference.compareAndSet(10,11)+" 为: " + atomicReference.get());
            }
            catch(Exception e)
            {
                e.printStackTrace();
            }
        },"B").start();

        TimeUnit.SECONDS.sleep(4);
        System.out.println("\n\nABA问题的解决办法---------------------------------------------------");

        AtomicStampedReference<Integer> atomicStampedReference = new AtomicStampedReference<>(10,1);

        new Thread(()->{
			//当前值，期望值，当前版本号，期望版本号
            atomicStampedReference.compareAndSet(10,11,atomicStampedReference.getStamp(),atomicStampedReference.getStamp()+1);
                //更改值的时候也更改版本号
                System.out.println("C线程第一次修改后的版号为 ：　" +atomicStampedReference.getStamp());
                //改回原值也要更新版本号
                atomicStampedReference.compareAndSet(11,10,
                        atomicStampedReference.getStamp(),atomicStampedReference.getStamp()+1);
                System.out.println("C线程第二次修改后的版号为 ：　" +atomicStampedReference.getStamp());
        },"C").start();

        new Thread(()->{
            try
            {
                TimeUnit.SECONDS.sleep(3);
                System.out.println(
                        "D线程修改: "
                                +
                         atomicStampedReference.compareAndSet(10,11,1,atomicStampedReference.getStamp()+1)
                );

            }
            catch(Exception e)
            {
                e.printStackTrace();
            }
        },"D").start();
    }
}
```

## JUC下的常见类

- JUC的atomic包下运用了CAS的AtomicBoolean、AtomicInteger、AtomicReference等原子变量类 

- JUC的locks包下的AbstractQueuedSynchronizer（AQS）以及使用AQS的ReentantLock（显式锁）、ReentrantReadWriteLock
      
    附：运用了AQS的类还有：Semaphore、CountDownLatch、ReentantLock（显式锁）、ReentrantReadWriteLock

- JUC下的一些同步工具类：CountDownLatch（闭锁）、Semaphore（信号量）、CyclicBarrier（栅栏）、FutureTask

### JUC下的一些并发容器类：

1. 使用写时复制类 ***CopyOnWriteArrayList***，此类适合读多写少的场合,它的性能比Vector好的多。

   - 它的读取方法没有使用加锁操作，而是在使用add，set等修改操作的时候将原内容和要修改的内容复制到新的副本中，写完后，再将副本赋予原数据。

   ```java
   /**
     * Appends the specified element to the end of this list.
     *
     * @param e element to be appended to this list
     * @return {@code true} (as specified by {@link Collection#add})
     */
   public boolean add(E e) {
       final ReentrantLock lock = this.lock;
       lock.lock();
       try {
           Object[] elements = getArray();
           int len = elements.length;
           Object[] newElements = Arrays.copyOf(elements, len + 1);
           newElements[len] = e;
           setArray(newElements);
           return true;
       } finally {
           lock.unlock();
       }
   }
   
   /**
     * 实现CopyOnWriteArraySet需要用到的方法
     */
   public boolean addIfAbsent(E e) {
       Object[] snapshot = getArray();
       return indexOf(e, snapshot, 0, snapshot.length) >= 0 ? false :
       addIfAbsent(e, snapshot);
   }
   private static int indexOf(Object o, Object[] elements,
                                  int index, int fence) {
       if (o == null) {
           for (int i = index; i < fence; i++)
               if (elements[i] == null)
                   return i;
       } else {
           for (int i = index; i < fence; i++)
               if (o.equals(elements[i]))
                   return i;
       }
       return -1;
   }
   ```

2. ***CopyOnWriteArraySet***： 值得一提的是：CopyOnWriteArraySet使用CopyOnWriteArrayList实现。

     ```java
     private final CopyOnWriteArrayList<E> al;
     
     public boolean add(E e) {
         //还是遍历list，看是否有这个元素
         return al.addIfAbsent(e);
     }
     ```

3. ***ConcurrentHashMap***: 并发map，很好的支持高性能和高并发（分段锁）。

     - jdk1.7之前使用分段数组+链表实现。jdk1.8后使用 数组+链表/红黑树 实现

     - jdk1.7之前给每段数据加锁，当一个线程访问其中一段数据时，其他数据也能被其他线程访问，也是非常的高效
     - jdk1.8后使用数组+链表/红黑树实现，其扩容等机制与HashMap一样，但是控制并发的方法改为了CAS+synchronized

       synchronized锁的只是链表的首节点或红黑树的首节点，这样一来，只要节点不冲突(hash不冲突)，synchronized也不会触发，更加高效

### 未完待续
