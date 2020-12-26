---
title: ReentrantLock 详解
date: 2020-06-19
tags:
- "源码分析"
- "多线程"
- Java
categories:
- "后端"
isShowComments: false
---

<Boxx/>

可独占，可重入，可中断，可公平可非公平。

<!-- more -->

引自掘金[hahaeee](https://juejin.im/post/5ae1b4f0f265da0b7b359d7a#heading-2)和[薛8](https://juejin.im/post/5c95df97e51d4551d06d8e8e)糅合而来。

[[toc]]

## 主要特性：

1. **可重入**。ReentrantLock 是可重入锁，因为它会记录之前获得锁线程对象，保存在 exclusiveOwenerThread 变量中，当一个线程要获取锁时，会先判断当前线程是不是已经获取锁的线程。synchronized 也是可重入锁。

2. **可中断**。ReentrantLock 是可中断锁，它提供了 lockInterruptibly 这种可中断的加锁方式，可以有效的避免线程之间因为互相持续占有资源而导致阻塞。synchronized 无法实现可中断。

3. **公平锁与非公平锁可选**。ReentrantLock 默认是非公平锁，但是也可以通过构造方法选择非公平锁。公平锁是指当多个线程尝试获取同一个锁时，获取锁的顺序按照到达的时间顺序排序。

![RenntrantLock](/znote/img/backend/16301aac714a64ae.jpg)

![依赖关系](/znote/img/backend/16301aac716e8f24.jpg)

`斜体为抽象类,下横线为接口`

**聚合关系总结**:

1. ReentrantLock 实现了 Lock,Serializable 接口
2. ReentrantLock.Sync (内部类) 继承了 AQS
3. ReentrantLock.NonfairSync 和 ReentrantLock.FairSync 继承了 ReentrantLock.Sync
4. ReentrantLock 持有 ReentrantLock.Sync 对象 (实现锁功能)

**锁实现总结**:

1. 由 Node 节点组成一条同步队列 (有 head,tail 两个指针，并且 **head 初始化时指向空节点**)
2. int state 标记锁使用数量 (独占锁时，通常为 1, 发生重入时> 1)
3. lock () 时加到队列尾部
4. unlock () 时，释放 head 节点，并指向下一个节点 head=head.next, 然后唤醒当前 head 节点

**性质**:

1. 独占锁 (排它锁): 只能有一个线程获取锁
2. 重入锁：一个线程可以多次 lock ()
3. 公平 / 非公平锁：只针对上锁过程
   1. 非公平锁：尝试获取锁，若成功立刻返回，失败则加入同步队列
   2. 公平锁：直接加入同步队列

## Lock

Lock 接口定义了锁的行为

```java
public interface Lock {
	//上锁(不响应Thread.interrupt()直到获取锁)
    void lock();
	//上锁(响应Thread.interrupt())
    void lockInterruptibly() throws InterruptedException;
	//尝试获取锁(以nonFair方式获取锁)
    boolean tryLock();
  	//在指定时间内尝试获取锁(响应Thread.interrupt(),支持公平/二阶段非公平)
    boolean tryLock(long time, TimeUnit unit) throws InterruptedException;
	//解锁
    void unlock();
	//获取Condition
    Condition newCondition();
}
```

## lock() 过程

```java
//锁具体实现
private final Sync sync;
//根据传入参数选择FairSync或NonfairSync实现
public ReentrantLock(boolean fair) {
        sync = fair ? new FairSync() : new NonfairSync();
}
public void lock() {
	sync.lock();
}
#java.util.concurrent.locks.ReentrantLock.Sync
abstract void lock();
```

### 公平锁

加入同步队列 (当同步队列为空时会直接获得锁), 等待锁

```java
#java.util.concurrent.locks.ReentrantLock.FairSync
final void lock() {
	acquire(1);
}
#java.util.concurrent.locks.AbstractQueuedSynchronizer
public final void acquire(int arg) {
	if (!tryAcquire(arg) &&acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
		selfInterrupt();
}
```

**acquire () 流程**:

1. tryAcquire (): 模板方法，获取锁

   ```java
    #java.util.concurrent.locks.ReentrantLock.FairSync
    protected final boolean tryAcquire(int acquires) {
    	//获取当前线程
       final Thread current = Thread.currentThread();
       int c = getState();
       if (c == 0) {//当前锁没被占用
    	   if (!hasQueuedPredecessors() &&//1.判断同步队列中是否有节点在等待
    		   compareAndSetState(0, acquires)) {//2.如果上面!1成立,修改state值(表明当前锁已被占用)
    		   setExclusiveOwnerThread(current);//3.如果2成立,修改当前占用锁的线程为当前线程
    		   return true;
    	   }
       }
       else if (current == getExclusiveOwnerThread()) {//占用锁线程==当前线程(重入)
    	   int nextc = c + acquires;//
    	   if (nextc < 0)
    		   throw new Error("Maximum lock count exceeded");
    	   setState(nextc);//修改status
    	   return true;
       }
       return false;//直接获取锁失败
   }
   ```

2. acquireQueued (addWaiter (Node.EXCLUSIVE), arg): 加入同步队列

   ```java
   #java.util.concurrent.locks.AbstractQueuedSynchronizer
   //1
   private Node addWaiter(Node mode) {
    //生成node
       Node node = new Node(Thread.currentThread(), mode);
       Node pred = tail;
       if (pred != null) {
    	//将node加到队列尾部
    	   node.prev = pred;
    	   if (compareAndSetTail(pred, node)) {
    		   pred.next = node;
    		   return node;
    	   }
       }
       //如果加入失败(多线程竞争或者tail指针为null)
       enq(node);
       return node;
   }
   //1.1  
   private Node enq(final Node node) {
    //死循环加入节点(cas会失败)
       for (;;) {
    	   Node t = tail;
    	   if (t == null) { //tail为null,同步队列初始化
    		//设置head指针
    		   if (compareAndSetHead(new Node()))//注意这里是个空节点!!
    			   tail = head;//将tail也指向head
    	   } else {
    		   node.prev = t;//将当前node加到队尾
    		   if (compareAndSetTail(t, node)) {
    			   t.next = node;
    			   return t;//注意这里才返回
    		   }
    	   }
       }
   }
   //2
   final boolean acquireQueued(final Node node, int arg) {
       boolean failed = true;
       try {
    	//表示是否被打断
    	   boolean interrupted = false;
    	   for (;;) {
    		//获取node.pre节点
    		   final Node p = node.predecessor();
    		   if (p == head //当前节点是否是同步队列中的第二个节点
    		   && tryAcquire(arg)) {//获取锁,head指向当前节点
    			   setHead(node);//head=head.next
    			   p.next = null;//置空 
    			   failed = false;
    			   return interrupted;
    		   }
   
    		   if (shouldParkAfterFailedAcquire(p, node) && //是否空转(因为空转唤醒是个耗时操作,进入空转前判断pre节点状态.如果pre节点即将释放锁,则不进入空转)
    			   parkAndCheckInterrupt())//利用unsafe.park()进行空转(阻塞)
    			   interrupted = true;//如果Thread.interrupt()被调用,(不会真的被打断,会继续循环空转直到获取到锁)
    	   }
       } finally {
    	   if (failed)//tryAcquire()过程出现异常导致获取锁失败,则移除当前节点
    		   cancelAcquire(node);
       }
   }
   ```

   过程总结:

   1. 空转 (如果当前节点是同步队列中的第二个节点，则直接获得锁返回)
   2. 获得锁

   > 注意，这里有两次tryAcquire()过程：<br/>
   > 第一次，为了避免同步队列为空时还插入队列产生的性能耗费(cas空转)。<br/>
   > 第二次，就是正常的流程，先插入队尾，然后等待唤醒，再获取锁。

3. selfInterrupt (): 唤醒当前线程

   ```java
   static void selfInterrupt() {//在获取锁之后 响应intterpt()请求
   	Thread.currentThread().interrupt();
   }
   ```

### 非公平锁

一阶段

```java
#java.util.concurrent.locks.ReentrantLock.NonfairSync
final void lock() {
	//在acquire()之前先尝试获取锁
	if (compareAndSetState(0, 1))
		setExclusiveOwnerThread(Thread.currentThread());
	else
		acquire(1);
}
```

二阶段 acquire () 流程与公平锁一模一样，唯一区别在于 tryAcquire () 实现中

```java
#java.util.concurrent.locks.ReentrantLock.NonfairSync
protected final boolean tryAcquire(int acquires) {
 	return nonfairTryAcquire(acquires);
 }
 
#java.util.concurrent.locks.ReentrantLock.Sync
 final boolean nonfairTryAcquire(int acquires) {//这个过程其实和FairSync.tryAcquire()基本一致
	final Thread current = Thread.currentThread();
	int c = getState();
	if (c == 0) {
		//唯一区别: 这里不会去判断队列中是否为空
		if (compareAndSetState(0, acquires)) {
			setExclusiveOwnerThread(current);
			return true;
		}
	}
	else if (current == getExclusiveOwnerThread()) {
		int nextc = c + acquires;
		if (nextc < 0) // overflow
			throw new Error("Maximum lock count exceeded");
		setState(nextc);
		return true;
	}
	return false;
}
```

| 区别点      | lock () 过程 (一阶段)       | tryAcquire () 过程 (二阶段)                  |
| ----------- | --------------------------- | -------------------------------------------- |
| FairSync    | 直接 acquire ()             | 当前若无线程持有锁，如果同步队列为空，获取锁 |
| NonFairSync | 先尝试获取锁，再 acquire () | 当前若无线程持有锁，获取锁                   |

## unlock() 过程

```java
#java.util.concurrent.locks.ReentrantLock
public void unlock() {
	sync.release(1);
}
#java.util.concurrent.locks.AbstractQueuedSynchronizer
public final boolean release(int arg) {
if (tryRelease(arg)) {//释放锁
	Node h = head;
	if (h != null &&//head节点为空(非公平锁直接获取锁)
	h.waitStatus != 0)
		unparkSuccessor(h);//唤醒同步队列中离head最近的一个waitStatus<=0的节点
	return true;
}
return false;
}
#java.util.concurrent.locks.ReentrantLock
protected final boolean tryRelease(int releases) {
	int c = getState() - releases;
	//持有锁的线程==当前线程
	if (Thread.currentThread() != getExclusiveOwnerThread())
		throw new IllegalMonitorStateException();
	boolean free = false;
	if (c == 0) {//重入锁全部释放
		free = true;
		//置空持有锁线程
		setExclusiveOwnerThread(null);
	}
	//state==0(此时持有锁,不用cas)
	setState(c);
	return free;
}
```

## lockInterruptibly() 中断锁过程

lockInterruptibly () 与 lock () 过程基本相同，区别在于 Thread.intterpt () 的应对措施不同。

ReentrantLock 中的 lockInterruptibly () 方法使得线程可以在被阻塞时响应中断，`比如一个线程 t1 通过 lockInterruptibly() 方法获取到一个可重入锁，并执行一个长时间的任务，另一个线程通过 lockInterruptibly() 方法就可以立刻打断 t1 线程的执行，来获取 t1 持有的那个可重入锁。`而通过 ReentrantLock 的 lock () 方法或者 Synchronized 持有锁的线程是不会响应其他线程的 interrupt () 方法的，直到该方法主动释放锁之后才会响应 interrupt () 方法。

```java
//lock()
final boolean acquireQueued(final Node node, int arg) {
	boolean failed = true;
	try {
		//表示是否被打断
		boolean interrupted = false;
		for (;;) {
			//获取node.pre节点
			final Node p = node.predecessor();
			if (p == head //当前节点是否是同步队列中的第二个节点
			&& tryAcquire(arg)) {//获取锁,当前head指向当前节点
				setHead(node);//head=head.next
				p.next = null;//置空 
				failed = false;
				return interrupted;
			}

			if (shouldParkAfterFailedAcquire(p, node) && //是否空转(因为空转唤醒是个耗时操作,进入空转前判断pre节点状态.如果pre节点即将释放锁,则不进入空转)
				parkAndCheckInterrupt())//利用unsafe.park()进行空转(阻塞)
				interrupted = true;//如果Thread.interrupt()被调用,(不会真的被打断,会继续循环空转直到获取到锁)
		}
	} finally {
		if (failed)//tryAcquire()过程出现异常导致获取锁失败,则移除当前节点
			cancelAcquire(node);
	}
}
// lockInterruptibly()
private void doAcquireInterruptibly(int arg)
	throws InterruptedException {
	final Node node = addWaiter(Node.EXCLUSIVE);
	boolean failed = true;
	try {
		for (;;) {
			final Node p = node.predecessor();
			if (p == head && tryAcquire(arg)) {
				setHead(node);
				p.next = null; 
				failed = false;
				return;
			}
			if (shouldParkAfterFailedAcquire(p, node) &&
				parkAndCheckInterrupt())//唯一区别当Thread.intterpt()打断时,直接抛出异常
				throw new InterruptedException();
		}
	} finally {
		if (failed)//然后移除当前节点
			cancelAcquire(node);
	}
}
```

- 中断锁代码测试：[CSDN](https://blog.csdn.net/dongyuxu342719/article/details/94395877)

## tryLock()

```java
#java.util.concurrent.locks.ReentrantLock
public boolean tryLock() {
	//尝试获取非公平锁
	return sync.nonfairTryAcquire(1);
}
```

## tryLock(long timeout, TimeUnit unit)

```java
#java.util.concurrent.locks.ReentrantLock
public boolean tryLock(long timeout, TimeUnit unit)
		throws InterruptedException {
	return sync.tryAcquireNanos(1, unit.toNanos(timeout));
}
#java.util.concurrent.locks.AbstractQueuedSynchronizer
public final boolean tryAcquireNanos(int arg, long nanosTimeout)
		throws InterruptedException {
	if (Thread.interrupted())
		throw new InterruptedException();
	return tryAcquire(arg) ||//获取锁(公平/非公平)
		doAcquireNanos(arg, nanosTimeout);//在指定时间内等待锁(空转)
}

private boolean doAcquireNanos(int arg, long nanosTimeout)
		throws InterruptedException {
	...
	final long deadline = System.nanoTime() + nanosTimeout;
	//加入队尾
	final Node node = addWaiter(Node.EXCLUSIVE);
	boolean failed = true;
	try {
		for (;;) {
			final Node p = node.predecessor();
			if (p == head && tryAcquire(arg)) {
				setHead(node);
				p.next = null; 
				failed = false;
				return true;
			}
		  //上面与acquireQueued()相同,重点看这里
		  //计算剩余时间
			nanosTimeout = deadline - System.nanoTime();
			if (nanosTimeout <= 0L)
				return false;
			if (shouldParkAfterFailedAcquire(p, node) &&
				nanosTimeout > spinForTimeoutThreshold)
				//利用parkNanos()指定空转时间
				LockSupport.parkNanos(this, nanosTimeout);
			if (Thread.interrupted())//如果被Thread.interrupt(),则抛异常
				throw new InterruptedException();
		}
	} finally {
		if (failed)//移除节点
			cancelAcquire(node);
	}
}
```



## ReentrantLock 的等待 / 通知机制

### newCondition()

```java
public Condition newCondition() {
	return sync.newCondition();
}
#java.util.concurrent.locks.ReentrantLock.Sync
final ConditionObject newCondition() {
	return new ConditionObject();
}
```

- 等待和唤醒

我们知道关键字 `Synchronized` + `Object` 的 `wait` 和 `notify`、`notifyAll` 方法能实现**等待 / 通知**机制，那么 `ReentrantLock` 是否也能实现这样的等待 / 通知机制，答案是：可以。
 `ReentrantLock` 通过 `Condition` 对象，也就是**条件队列**实现了和 `wait`、`notify`、`notifyAll` 相同的语义。 线程执行 `condition.await()` 方法，将节点 1 从同步队列转移到条件队列中。

![img](/znote/img/backend/169b3432b128105d.jpg)



线程执行 `condition.signal()` 方法，将节点 1 从条件队列中转移到同步队列。

![img](/znote/img/backend/169b3411b74cfff1.jpg)



因为只有在同步队列中的线程才能去获取锁，所以通过 `Condition` 对象的 `wait` 和 `signal` 方法能实现等待 / 通知机制。

- 等待和唤醒部分

如果想单独唤醒部分线程应该怎么做呢？这时就有必要使用多个 `Condition` 对象了，因为 `ReentrantLock` 支持创建多个 `Condition` 对象，例如：

```java
//为了减少篇幅 仅给出伪代码
ReentrantLock lock = new ReentrantLock();
Condition condition = lock.newCondition();
Condition condition1 = lock.newCondition();

//线程1 调用condition.await() 线程进入到条件队列
condition.await();

//线程2 调用condition1.await() 线程进入到条件队列
condition1.await();

//线程32 调用condition.signal() 仅唤醒调用condition中的线程，不会影响到调用condition1。
condition1.await();
```

这样就实现了部分唤醒的功能。



## ReentrantLock 和 Synchronized 对比

|                       | ReentrantLock   | Synchronized                                                 |
| --------------------- | --------------- | ------------------------------------------------------------ |
| 底层实现              | 通过 `AQS` 实现 | 通过 `JVM` 实现，其中 `synchronized` 又有多个类型的锁，除了重量级锁是通过 `monitor` 对象 (操作系统 mutex 互斥原语) 实现外，其它类型的通过对象头实现。 |
| 是否可重入            | 是              | 是                                                           |
| 公平锁                | 是              | 否                                                           |
| 非公平锁              | 是              | 是                                                           |
| 锁的类型              | 悲观锁、显式锁  | 悲观锁、隐式锁 (内置锁)                                      |
| 是否支持中断          | 是              | 否                                                           |
| 是否支持超时等待      | 是              | 否                                                           |
| 是否自动获取 / 释放锁 | 否              | 是                                                           |


