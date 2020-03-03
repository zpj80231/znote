## JUC

### 简介

- 自JDK1.5出现的，JUC（Java并发包）就是java.util .concurrent工具包的简称。
- 所属位置：jre1.8.0/lib/rj.jar，在jvm中rj.jar由👉bootsrap.classloader加载器通过双亲委派机制加载到内存。

### volatile关键字

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

### CAS原子类

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

