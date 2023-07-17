---
title: ZooKeeper 如何保证一致性及如何选举
date: 2022-03-08
tags:
    - 分布式
    - ZooKeeper
categories:
    - 后端 Back-end
isShowComments: false
---

<Boxx/>


<!-- more -->

[[toc]]

## Zookeeper如何保证数据一致性

ZooKeeper保证数据一致性用的是ZAB协议。通过这个协议来进行ZooKeeper集群间的数据同步，保证数据的一致性。

![](https://upload-images.jianshu.io/upload_images/11345047-41a2e8b3072b7261.png?imageMogr2/auto-orient/strip|imageView2/2/w/1151/format/webp)

两阶段提交+过半写机制：

1. ZooKeeper写数据的机制是客户端 **把写请求发送到leader节点**上（如果发送的是follower节点，follower节点会把写请求转发到leader节点）
2. leader节点会把数据通过proposal请求 **发送到所有节点**（包括自己）
3. 所有到节点接受到数据以后都 **持久化** 会写到自己到本地磁盘上面，写好了以后会发送一个 **ack** 请求给leader
4. leader只要接受到 **过半的节点发送ack响应** 回来，就会发送 **commit** 消息给各个节点，各个节点就会把消息放入到内存中（放内存是为了保证高性能），该消息就会用户可见了。

那么这个时候，如果ZooKeeper要想保证数据一致性，就需要考虑如下两个情况：

- 情况一：leader执行commit了，还没来得及给follower发送commit的时候，leader宕机了，这个时候如何保证消息一致性？
- 情况二：客户端把消息写到leader了，但是leader还没发送proposal消息给其他节点，这个时候leader宕机了，leader宕机后恢复的时候此消息又该如何处理？

## ZAB的崩溃恢复机制

针对情况一，当leader宕机以后，ZooKeeper会选举出来新的leader，新的leader启动以后要到磁盘上面去检查是否存在没有commit的消息。

如果存在，就继续检查看其他follower有没有对这条消息进行了commit，如果有过半节点对这条消息进行了ack，但是没有commit，那么新leader通知follower要完成commit的操作。

## ZAB恢复中删除数据机制

针对情况二，客户端把消息写到leader了，但是leader还没发送portal消息给其他节点，这个时候leader宕机了，这个时候对于用户来说，这条消息是写失败的。

假设过了一段时间以后leader节点又恢复了，不过这个时候角色就变为了follower了，它在检查自己磁盘的时候会发现自己有一条消息没有进行commit，此时就会检测消息的编号。

消息是有编号的，由高32位和低32位组成，高32位是用来体现是否发生过leader切换的，低32位就是展示消息的顺序的。这个时候当前的节点就会根据高32位知道目前leader已经切换过了，所以就把当前的消息删除，然后从新的leader同步数据，这样保证了数据一致性。

## ZK选主过程

**规则：**

1. 初始阶段，都会给自己投票。

2. 当接收到来自其他服务器的投票时，都需要将别人的投票和自己的投票进行pk，规则如下：

   优先检查zxid。zxid比较大的服务器优先作为leader。如果zxid相同的话，就比较sid，sid比较大的服务器作为leader。

**举例：**

假设当前集群中有5台机器组成。

sid（用来标识该机器在集群中的机器序号）分别为1，2，3，4，5。

zxid（即zookeeper事务id号。ZooKeeper状态的每一次改变, 都对应着一个递增的Transaction id, 该id称为zxid）分别为9，9，9，8，8。

并且此时sid为2的机器是leader。

某一时刻，1和2的服务器挂掉了，集群开始进行选主。

- 在第一次投票中，由于无法检测到集群中其他机器的状态信息，因此每台机器都将自己作为被推举的对象来进行投票。于是sid为3，4，5的机器，投票情况分别为（3，9），（4，8），（5，8）
- 每台机器把投票发出后，同时也会接收到来自另外两台机器的投票。
- 对于server3来说，接收到（4，8），（5，8）的投票，对比后由于自己的zxid要大于收到的另外两个投票，因此不需要做任何变更。
- 对于server4来说，接收到（3，9），（5，8）的投票，对比后由于（3，9）这个投票的zxid大于自己，因此需要变更投票为（3，9），然后继续将这个投票发送给另外两台机器。
- 对于server5来说，接收到（3，9），（4，8）的投票，对比后由于（3，9）这个投票的zxid大于自己，因此需要变更投票为（3，9），然后继续将这个投票发送给另外两台机器。
- 经过第二轮投票后，集群中的每台机器都会再次受到其他机器的投票，然后开始统计投票。判断是否有过半的机器收到相同的投票信息，如果有，那么该投票的sid会成为新的leader。
- 机器总数为5台，server3，4，5都收到投票（3，9）。因此server3成为leader。

## FAQ

Q:

- 1.同一个客户端，先发出写请求，leader将写请求事务广播给follow，如果半数follow成功，但是发出请求的follow没有成功，按照半数即成功的原理，leader会返回写操作成功，此时该客户端再读取数据，导致读取到的是旧的值，不符合同一个session写后读的保证，此时该怎么办？

- 2.leader对于一个事务在本地提交了，但是还没广播就down机了，那么从其余follow中选出的leader如何保证这个事务也被提交？

  zab在崩溃选择时，根据什么决定proposal该被抛弃或者该被提交？比如最开始有5台server, leader把日志复制到了另外2台，leader在本地提交日志（或者还没来得及提交），然后立即挂了。剩下4台server, 有2台有这个日志，有2台没有，那么这个日志要不要保留？

A:

- 1.zookeeper不保证读一致性，是弱一致性，如果要保证读到的数据是最新的，读取之前要使用sync方法

- 2.旧leader commit完就挂掉了，因为写入的follower肯定超过一半，新leader具有最大zxid，因此新leader就拥有commit的proposal，这时候只要提交该proposal并进行同步即可。如果旧leader只同步了一个follower就挂掉，该follower就是新leader，新leader同步该proposal然后同步即可。如果旧leader还没来得及同步就挂掉，该proposal在新集群中也不会存在，也不会成功，因此当旧leader恢复时就会被rollback。

  只要数据被写进新leader的log了，均不会丢失，zk只要选出了leader，数据就是从leader这里为准了。leader的选举规则可以额外看看，总之就是zxid最大的当选。那么什么数据会被同步呢？只要被记录到log中的事务都不会丢失。那么可能你会疑问，如果事务没提交呢？ leader在做restore的时候，会将日志中的proposal重新广播。


<Reward/>
