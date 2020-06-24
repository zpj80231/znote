---
title: CountDownLatch 详解
date: 2020-06-22
tags:
- "源码分析"
- "多线程"
- Java
categories:
- "后端"
isShowComments: false
---

<Boxx/>

依靠 AQS类中锁标记 state 实现的，任务的分割与合并。

<!-- more -->

[[toc]]

## 适用场景

- **常和线程池共同出现，用做任务的分割合并**，如：

  我们有90万数据，需要多线程多 Sheet 页导出 Excel，这时候就需要用到 CountDownLatch 来将这一任务具体细分。

  1. 将导出 Excel 看作一项大任务。

  2. 用线程池操作，导出的每个 Sheet 页为其中一项小任务。

     2.1 告诉 CountDownLatch 总任务数

     `CountDownLatch countDownLatch = new CountDownLatch(任务总数);`

     2.2 每完成一个任务就调用`countDownLatch.countDown();`（任务数-1）表示此项小任务已完成
  
  3. 在主线程调用`countDownLatch.await();`（即直到任务数为0时）等待所有小任务完成后，再执行其他操作。
  
     当然，为防止一直等待，可以加个超时时间`countDownLatch.await(10L,TimeUnit.SECONDS);`，超出时间后不再等待，直接唤醒 await 线程进行下一步操作。
  
- 以上思路实例代码可见另一篇[poi多线程多sheet导出Excel,csv](/views/java/poi.html#_4-本地90万数据：输入输出流-poi多线程多sheet导出excel)

## CountDownLatch解析

CountDownLatch 类图如下:

![CountDownLatch](/znote/img/backEnd/CountDownLatch.png)

从图中可以看出，CountDownLatch 内部依赖 Sync 实现，而 Sync 继承自 AQS。CountDownLatch 仅提供了一个构造方法：

```java
public CountDownLatch(int count) {
    if (count < 0) throw new IllegalArgumentException("count < 0");

    this.sync = new Sync(count);
}
```

Sync 是 CountDownLatch 的静态内部类，其定义也比较简单，如下所示：

```java
private static final class Sync extends AbstractQueuedSynchronizer {

    private static final long serialVersionUID = 4982264981922014374L;

    // 设置同步状态值（锁标记）
    Sync(int count) {
        setState(count);
    }

    // 获取同步状态值
    int getCount() {
        return getState();
    }
    
    // 共享式获取同步状态
    protected int tryAcquireShared(int acquires) {
        return (getState() == 0) ? 1 : -1;
    }

    // 共享式释放同步状态
    protected boolean tryReleaseShared(int releases) {
        // Decrement count; signal when transition to zero
        for (;;) {
            // 获取当前state属性的值
            int c = getState();
            // 如果state为0，则说明当前计数器已经计数完成，直接返回
            if (c == 0)
                return false;
            int nextc = c-1;
            // 使用CAS算法对state进行设置
            if (compareAndSetState(c, nextc))
                // 设置成功后返回当前是否为最后一个设置state的线程
                return nextc == 0;
        }
    }

}
```

### await () 方法

CountDownLatch 提供了 await () 方法来使当前线程一直等待，直到计数器的值减为 0，或者线程被中断，该方法定义如下：

```java
public void await() throws InterruptedException {
    sync.acquireSharedInterruptibly(1);
}
```

await () 方法调用了 AQS 的共享式相应中断获取同步状态的方法，acquireSharedInterruptibly (int)，如下所示：

```java
public final void acquireSharedInterruptibly(int arg)
        throws InterruptedException {

    if (Thread.interrupted())
        throw new InterruptedException();

    if (tryAcquireShared(arg) < 0)
        doAcquireSharedInterruptibly(arg);
}
```

Sync 类重写了 tryAcquireShared (int) 方法：

```java
protected int tryAcquireShared(int acquires) {
    return (getState() == 0) ? 1 : -1;
}
```

可以看到，只有当计数器（即同步状态）值为 0 时，才返回 1，即当前线程获取到了同步状态，在这里表示等待线程可以继续执行，若计数器值不是 0，则当前线程会调用 doAcquireSharedInterruptibly (int) 方法，一直自旋去尝试获取同步状态：

```java
private void doAcquireSharedInterruptibly(int arg) throws InterruptedException {
  final Node node = addWaiter(Node.SHARED); // 使用当前线程创建一个共享模式的节点
  boolean failed = true;
  try {
    for (;;) {
      final Node p = node.predecessor();    // 获取当前节点的前一个节点
      if (p == head) {  // 判断前一个节点是否为头结点
        int r = tryAcquireShared(arg);  // 查看当前线程是否获取到了执行权限
        if (r >= 0) {   // 大于0表示获取了执行权限
          
          /* 发现 r 大于 0（因为 state 已经被置为 0 了），
           * 该线程就会调用 setHeadAndPropagate (Node, int) 方法，
           * 并且退出当前循环，
           * 也就开始执行我们调用 await() 方法之后的代码
           */
          setHeadAndPropagate(node, r); // 将当前节点设置为头结点，并且唤醒后面处于等待状态的节点
          p.next = null; // help GC
          failed = false;
          return;
        }
      }
      
      // 走到这一步说明没有获取到执行权限，就使当前线程进入“搁置”状态
      if (shouldParkAfterFailedAcquire(p, node) &&
          parkAndCheckInterrupt())
        throw new InterruptedException();
    }
  } finally {
    if (failed)
      cancelAcquire(node);
  }
}
```

这里我们看看 setHeadAndPropagate (Node, int) 方法的具体实现：

```java
private void setHeadAndPropagate(Node node, int propagate) {
  Node h = head;
  setHead(node);    // 将当前节点设置为头节点
  // 检查唤醒过程是否需要往下传递，并且检查头结点的等待状态
  if (propagate > 0 || h == null || h.waitStatus < 0 ||
      (h = head) == null || h.waitStatus < 0) {
    Node s = node.next;
    if (s == null || s.isShared())  // 如果下一个节点是尝试以共享状态获取获取执行权限的节点，则将其唤醒
      doReleaseShared();
  }
}
```

setHeadAndPropagate (Node, int) 方法主要作用是设置当前节点为头结点，并且将唤醒工作往下传递，在传递的过程中，其会判断被传递的节点是否是以共享模式尝试获取执行权限的，如果不是，则传递到该节点处为止（一般情况下，等待队列中都只会都是处于共享模式或者处于独占模式的节点）。也就是说，头结点会依次唤醒后续处于共享状态的节点，这也就是共享锁与独占锁的实现方式。这里 doReleaseShared () 方法也就是我们前面讲到的会将离头结点最近的一个处于等待状态的节点唤醒的方法。

### countDown () 方法

CountDownLatch 提供了 countDown () 方法递减计数器的值，如果计数到达 0，则释放所有等待的线程，该方法定义如下：

```java
public void countDown() {
    sync.releaseShared(1);
}
```

countDown () 方法调用了 AQS 的 releaseShared (int) 方法来释放共享锁同步状态：

```java
public final boolean releaseShared(int arg) {
    if (tryReleaseShared(arg)) {
        //doReleaseShared()主要作用是唤醒调用了await()方法的线程
        doReleaseShared();
        return true;
    }
    return false;
}
```

Sync 类重写了 releaseShared (int) 方法：

可以看到，在执行 sync.releaseShared (1) 方法时，其在调用 tryReleaseShared (int) 方法时会在无限 for 循环中设置 state 属性的值，设置成功之后其会根据设置的返回值（此时 state 已经自减了一），即当前线程是否为将 state 属性设置为 0 的线程，来判断是否执行 if 块中的代码（即doReleaseShared()）。

```java
protected boolean tryReleaseShared(int releases) {
    // Decrement count; signal when transition to zero
    for (;;) {
        // 获取同步状态
        int c = getState();
        // 同步状态为0，则直接返回
        if (c == 0)
            return false;
        // 计算并更新同步状态
        int nextc = c-1;
        if (compareAndSetState(c, nextc))
            return nextc == 0;
    }
}
```

doReleaseShared () 方法主要作用是唤醒调用了 await () 方法的线程。需要注意的是，如果有多个线程调用了 await () 方法，这些线程都是以共享的方式等待在 await () 方法处的，试想，如果以独占的方式等待，那么当计数器减少至零时，就只有一个线程会被唤醒执行 await () 之后的代码，这显然不符合逻辑。如下是 doReleaseShared () 方法的实现代码：

```java
private void doReleaseShared() {
  for (;;) {
    Node h = head;  // 记录等待队列中的头结点的线程
    if (h != null && h != tail) {   // 头结点不为空，且头结点不等于尾节点
      int ws = h.waitStatus;
      if (ws == Node.SIGNAL) {  // SIGNAL状态表示当前节点正在等待被唤醒
        if (!compareAndSetWaitStatus(h, Node.SIGNAL, 0))    // 清除当前节点的等待状态
          continue;
        unparkSuccessor(h); // 唤醒当前节点的下一个节点
      } else if (ws == 0 && !compareAndSetWaitStatus(h, 0, Node.PROPAGATE))
        continue;
    }
    // 如果h还是指向头结点，说明前面这段代码执行过程中没有其他线程对头结点进行过处理
    if (h == head)  
      break;
  }
}
```



## 参考

[Java 并发编程之 CountDownLatch 详解](https://blog.csdn.net/qq_38293564/article/details/80557355)

[CountDownLatch 详解](https://www.jianshu.com/p/128476015902)