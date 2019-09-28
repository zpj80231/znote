---
title: 多线程和线程池
date: 2019-07-15 21:51:41
tags:
- "多线程"
- Java
catagories:
- Java
---

::: tip 杰弗逊	

从不浪费时间的人，没有工夫抱怨时间不够

 :::

[[toc]]

## 多线程

- 这篇介绍了什么是多线程及多线程的实现方式和常用方法，写的很详细，特在此记录一下

  [https://blog.csdn.net/vbirdbest/article/details/81282163](https://blog.csdn.net/vbirdbest/article/details/81282163)

## 多线程创建方式

- 如看过上文地址，可跳过此节直接看下一节`自己造一个并发实例`，后面才是干货！

### 继承 Thread 类

```java
public class Main {
    public static void main(String[] args) {
        new MyThread().start();
    }
}

class MyThread extends Thread {
    @Override
    public void run() {
        System.out.println(Thread.currentThread().getName() + "\t" + Thread.currentThread().getId());
    }
}
```

### 实现 Runable 接口

- 第一种方式是继承Thread类，因Java是单继承，如果一个类继承了Thread类，那么就没办法继承其它的类了，在继承上有一点受制，有一点不灵活，第二种方式就是为了解决第一种方式的单继承不灵活的问题，所以平常使用就使用第二种方式

```java
public class Main {
    public static void main(String[] args) {
         // 将Runnable实现类作为Thread的构造参数传递到Thread类中，然后启动Thread类
        MyRunnable runnable = new MyRunnable();
        new Thread(runnable).start();
    }
}

class MyRunnable implements Runnable {
    @Override
    public void run() {
        System.out.println(Thread.currentThread().getName() + "\t" + Thread.currentThread().getId());
    }
}
```

### 实现 Callable 接口

- 重写call()方法，然后包装成java.util.concurrent.FutureTask, 再然后包装成Thread
- Callable：有返回值并且能捕获异常，能取消线程，可以判断线程是否执行完毕

```java
public class Main {
    public static void main(String[] args) throws Exception {
         // 将Callable包装成FutureTask，FutureTask也是一种Runnable
        MyCallable callable = new MyCallable();
        FutureTask<Integer> futureTask = new FutureTask<>(callable);
        new Thread(futureTask).start();

        // get方法会阻塞调用的线程
        Integer sum = futureTask.get();
        System.out.println(Thread.currentThread().getName() + Thread.currentThread().getId() + "=" + sum);
    }
}

class MyCallable implements Callable<Integer> {
    @Override
    public Integer call() throws Exception {
        System.out.println(Thread.currentThread().getName() + "\t" + Thread.currentThread().getId() + "\t" + new Date() + " \tstarting...");

        int sum = 0;
        for (int i = 0; i <= 100000; i++) {
            sum += i;
        }
        Thread.sleep(5000);

        System.out.println(Thread.currentThread().getName() + "\t" + Thread.currentThread().getId() + "\t" + new Date() + " \tover...");
        return sum;
    }
}
```



## 自己造一个并发实例

- 有人可能对多线程及并发还不是很了解，那么就简单上手一个并发实例来体验一下吧！

- 注意：下边的例子，自己多运行几次，看一下不同的结果

  > 1. 当对现场加锁的时候就不会并发：
  >    - 打印结果：张曼玉：女士 / 梁朝伟：先生
  > 2. 而如果对线程不加锁的话，就可能会造成并发：
  >    - 打印结果：张曼玉：先生 / 梁朝伟：女士
  >    - 打印结果：张曼玉：女士 / 梁朝伟：先生

```java
/**
 * @className: TestThreadPool
 * @descripe: 自己造一个并发的例子
 * @author: zpj
 * @date: 2019/7/8
 * @version: 1.0
 */
public class TestConcurrentError{
	public static void main(String[] args){
		Student stu = new Student("张曼玉","女士");
		PrintThread pt = new PrintThread(stu);
		ChangeThread ct = new ChangeThread(stu);
		pt.start();
		ct.start();
	}
}

class Student{
	String name;
	String gender;
	public Student(String name,String gender){
		this.name = name;
		this.gender = gender;
	}
}

class PrintThread extends Thread{
	Student stu;
	public PrintThread(Student stu){
		this.stu = stu;
	}
	@Override
	public void run(){
		while(true){
			//synchronized(stu){
			{
				System.out.println(stu.name + " : " + stu.gender);
			}
		}
	}
}
class ChangeThread extends Thread{
	Student stu;
	public ChangeThread(Student stu){
		this.stu = stu;
	}
	@Override
	public void run(){
		boolean isOkay = true;
		while(true){
			//synchronized(stu){
			{
				if(isOkay){
					stu.name = "梁朝伟";//梁朝伟 女士
					stu.gender = "先生";//梁朝伟 先生
				}else{
					stu.name = "张曼玉";//张曼玉 先生
					stu.gender = "女士";//张曼玉 女士
				}
				isOkay = !isOkay;
			}
		}
	}
}
```

## 实现线程同步的几种方式

​	通过上面的实例我们知道了并发是怎么产生的，那我们如何解决呢？那就是使线程同步或给线程加锁呗！

- 实现线程同步的几种方式：

1. 使用synchronized关键字

   synchronized既可以修饰方法也可以修饰代码块，用synchronized 关键字时一定要注意用于保护共享数据，防止造成资源浪费（synchronized 本来效率就不高）

2. wait()和notify() => 相当于引入等待池

   wait()：Object类的方法，使一个线程处于等待状态，并且释放所持有的对象的lock。

   sleep(1000)：Thread类的方法，使一个正在运行的线程处于睡眠状态，是一个静态方法，调用此方法要捕捉InterruptedException异常。
   notify()：唤醒一个处于等待状态的线程，注意的是在调用此方法的时候，并不能确切的唤醒某一个等待状态的线程，而是由JVM确定唤醒哪个线程，而且不是按优先级。
   Allnotity()：唤醒所有处入等待状态的线程，注意并不是给所有唤醒线程一个对象的锁，而是让它们竞争。

   **注意：**wait、notify和notifyAll方法只能在同步方法或者同步代码块中使用，而sleep方法可以在任何地方使用。

3. 使用java.util.concurrent.ReentrantLock重入锁实现线程同步

   ```java
   	private int account = 100;
   	//获得锁对象
   	private ReentrantLock lock = new ReentrantLock();
   	public int getAccount() {
   		return account;
   	}
   	//同步方法
   	public  void save(int money) {
   		lock.lock();//加锁
   		try {
   			account+=money;
   		} finally {
   			lock.unlock();//解锁
   		}
   		
   	}
   ```

## 创建线程池的几种方式

- 既然都了解到线程并发了，那怎么能不了解了解线程池呢！😄
- java.util.concurrent.Executors类，这个类是用来创建线程池的：

1. newFixedThreadPool()

   创建固定大小的线程池 线程池的大小一旦达到最大值就会保持不变，如果某个线程因为执行异常而结束，那么线程池会补充一个新线程

2. newCachedThreadPool()

   创建一个可缓存的线程池，如果线程池的大小超过了处理任务所需要的线程，那么就会回收部分空闲(60s不执行任务)的线程，当任务数量增加时，此线程池又可以智能的添加新线程来处理任务。此线程池不会对线程池大小做限制，线程池大小完全依赖于系统（JVM）能够创建的最大线程大小

3. newSingleThreadExecutor() 

   创建一个单线程的线程池。这个线程池只有线程在工作，也就是相当于单线程串行执行所有任务。如果这个唯一的线程因为异常结束，那么会有一个新的线程来替代它。此线程池保证所有任务的执行顺序按照任务的提交顺序执行

4. newScheduledThreadPool()

   创建一个大小无限的线程池，此线程池支持定时以及周期性执行任务的需求

5. newSingleThreadScheduledExecutor()

   创建一个单线程的线程池。此线程池支持定时以及周期性执行任务的需求

## 线程池的基本使用

```java
import java.text.SimpleDateFormat;
import java.util.concurrent.*;

/**
 * @className: TestThreadPool
 * @descripe: 多线程的基本使用
 * @author: zpj
 * @date: 2019/7/8
 * @version: 1.0
 */
public class TestThreadPool {

    /*  打印结果：多个线程同时开始
        Thread:pool-1-thread-2 开始执行时间：2019-07-08 22:14:31
            ==  I'm a cat!  ==     <1>
        Thread:pool-1-thread-1 开始执行时间：2019-07-08 22:14:31
            ==  I'm a cat!  ==     <0>
        Thread:pool-1-thread-4 开始执行时间：2019-07-08 22:14:31
        Thread:pool-1-thread-3 开始执行时间：2019-07-08 22:14:31
            ==  I'm a cat!  ==     <2>
        Thread:pool-1-thread-5 开始执行时间：2019-07-08 22:14:31
            ==  I'm a cat!  ==     <4>
        Thread:pool-1-thread-4 开始执行时间：2019-07-08 22:14:31
            ==  I'm a cat!  ==     <5>
        Thread:pool-1-thread-4 开始执行时间：2019-07-08 22:14:32
            ==  I'm a cat!  ==     <6>
        Thread:pool-1-thread-5 开始执行时间：2019-07-08 22:14:32
            ==  I'm a cat!  ==     <7>
        Thread:pool-1-thread-3 开始执行时间：2019-07-08 22:14:32
        Thread:pool-1-thread-1 开始执行时间：2019-07-08 22:14:32
        Thread:pool-1-thread-3 开始执行时间：2019-07-08 22:14:32
            ==  I'm a cat!  ==     <9>
            ==  I'm a cat!  ==     <10>

     */
    public static void main(String[] args) throws InterruptedException {

        //要循环的次数
        int x = 10;

        //ExecutorService executorService = Executors.newFixedThreadPool(1);//单线程
        ExecutorService executorService = Executors.newFixedThreadPool(5);//多线程

        //线程计数器
        CountDownLatch downLatch = new CountDownLatch(x);

        System.out.println("多线程执行开始！");
        for (int i = 0;i <= x;i++) {
            Future<?> future = executorService.submit(new Cat(i, downLatch));
            /*
            //加上它就变同步了，不知道为啥（百度咯，因为这是个阻塞的方法，future.isDone();是个非阻塞方法）
            try {
                if(future.get()==null){
                    System.out.println("第   "+i+"   个任务执行成功!\n");
                }
            } catch (ExecutionException e) {
                System.out.println("第   "+i+"   个任务执行失败!    " + e.getMessage() + "\n");
            }*/
        }
        System.out.println("这就证明：多线程是异步执行的！");
        downLatch.await();
        executorService.shutdown();
    }

   /* public static void main(String[] args) throws InterruptedException {

        //要循环的次数
        int x = 10;

        //ExecutorService executorService = Executors.newFixedThreadPool(1);//单线程
        ExecutorService executorService = Executors.newFixedThreadPool(5);//多线程

        //线程计数器
        CountDownLatch downLatch = new CountDownLatch(x);

        for (int i = 0;i <= x;i++) {
            executorService.execute(new Cat(i, downLatch));
        }
        *//*
         *  打印结果：可以看到多个线程基本同时开始执行
            Exception in thread "pool-1-thread-4" java.lang.ArithmeticException: / by zero
                at Cat.run(TestThreadPool.java:141)
                at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1142)
                at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:617)
                at java.lang.Thread.run(Thread.java:745)
            Thread:pool-1-thread-1 开始执行时间：2019-07-08 22:00:39
                ==  I'm a cat!  ==     <0>
            Thread:pool-1-thread-2 开始执行时间：2019-07-08 22:00:39
                ==  I'm a cat!  ==     <1>
            Thread:pool-1-thread-3 开始执行时间：2019-07-08 22:00:39
                ==  I'm a cat!  ==     <2>
            Thread:pool-1-thread-4 开始执行时间：2019-07-08 22:00:39
            Thread:pool-1-thread-5 开始执行时间：2019-07-08 22:00:39
                ==  I'm a cat!  ==     <4>
            Thread:pool-1-thread-6 开始执行时间：2019-07-08 22:00:39
                ==  I'm a cat!  ==     <5>
            Exception in thread "pool-1-thread-3" java.lang.ArithmeticException: / by zero
            Thread:pool-1-thread-1 开始执行时间：2019-07-08 22:00:40
                at Cat.run(TestThreadPool.java:141)
                ==  I'm a cat!  ==     <6>
                at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1142)
                at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:617)
            Thread:pool-1-thread-2 开始执行时间：2019-07-08 22:00:40
                at java.lang.Thread.run(Thread.java:745)
                ==  I'm a cat!  ==     <7>
            Thread:pool-1-thread-3 开始执行时间：2019-07-08 22:00:40
            Thread:pool-1-thread-6 开始执行时间：2019-07-08 22:00:40
                ==  I'm a cat!  ==     <10>
            Thread:pool-1-thread-5 开始执行时间：2019-07-08 22:00:40
                ==  I'm a cat!  ==     <9>
            *//*
        downLatch.await();
        executorService.shutdown();
    }*/

}

class Cat implements Runnable {

    int i;
    private CountDownLatch downLatch;

    public Cat(int i,CountDownLatch downLatch) {
        this.i = i;
        this.downLatch = downLatch;
    }

    SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

    @Override
    public void run() {
        System.out.println("Thread:"+Thread.currentThread().getName()+" 开始执行时间："+format.format(System.currentTimeMillis()));

        if(i == 8 || i == 3)
            i = i/0;
            System.out.println("    ==  I'm a cat!  ==     <" + i + ">");
        //每执行完一个线程 计数器就减1
        downLatch.countDown();

        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

