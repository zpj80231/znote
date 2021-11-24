---
title: Redis - 终结
date: 2019-10-10
tags: 
- Redis
categories:
- 后端 Back-end
isShowComments: false
---

<Boxx/>

个人看完傲丙的redis系列最后做的总结，不得不说他redis系列写的确实不错。

[[toc]]

## Redis基础

看我之前的这篇 - [传送门](/views/backend/redis01.html)

### 使用场景

- 缓存 替数据库分担压力
微博那种不断下拉分页，点赞
单点登陆
分布式锁

### 优缺点

1. 基于内存的单线程非关系型数据库，由于在内存中完成操作，所以速度非常快，每秒十万+
2. 支持持久化 
3. 高可用

### 基本数据结构

- String

	- 缓存功能：String字符串是最常用的数据类型，不仅仅是Redis，各个语言都是最基本类型，因此，利用Redis作为缓存，配合其它数据库作为存储层，利用Redis支持高并发的特点，可以大大加快系统的读写速度、以及降低后端数据库的压力。
	- 计数器：许多系统都会使用Redis作为系统的实时计数器，可以快速实现计数和查询的功能。而且最终的数据结果可以按照特定的时间落地到数据库或者其它存储介质当中进行永久保存
	- 共享用户Session：用户重新刷新一次界面，可能需要访问一下数据进行重新登录，或者访问页面缓存Cookie，但是可以利用Redis将用户的Session集中管理，在这种模式只需要保证Redis的高可用，每次用户Session的更新和获取都可以快速完成。大大提高效率。

- Hash

	- 这个是类似 Map 的一种结构，这个一般就是可以将结构化的数据，比如一个对象（前提是这个对象没嵌套其他的对象）给缓存在 Redis 里，然后每次读写缓存的时候，可以就操作 Hash 里的某个字段。（用的少）

- List

	- 比如可以通过 List 存储一些列表型的数据结构，类似粉丝列表、文章的评论列表之类的东西。

		- lpush key v1 v2 v3	在key中依次插入3个值,每次插入都放在最左边
		- lrange key start(起始下标) stop(结束下标)	取出key中从下标start到stop(包含)的值
		- lrange list (当前页-1)rows pagerows-1	分页

- Set

	- 基于 Set 玩儿交集、并集、差集的操作，比如交集吧，我们可以把两个人的好友列表整一个交集，看看俩人的共同好友是谁？对吧。

- SortedSet

	- 去重且排序

		- 排行榜：有序集合经典使用场景。例如视频网站需要对用户上传的视频做排行榜，榜单维护可能是多方面：按照时间、按照播放量、按照获得的赞数等。
		- 用Sorted Sets来做带权重的队列，比如普通消息的score为1，重要消息的score为2，然后工作线程可以选择按score的倒序来获取工作任务。让重要的任务优先执行。

### 持久化

- **RDB做镜像全量持久化，AOF做增量持久化。** 因为RDB会耗费较长时间，不够实时，在停机的时候会导致大量丢失数据，所以需要AOF来配合使用。在redis实例重启时，会使用RDB持久化文件重新构建内存，再使用AOF重放近期的操作指令来实现完整恢复重启之前的状态。

	- RDB

		- fork和cow：fork是指redis通过创建子进程来进行RDB操作，采用二进制压缩存储。cow指的是copy on write，子进程创建后，父子进程共享数据段，父进程继续提供读写服务，写脏的页面数据会逐渐和子进程分离开来。
		- 因为是子进程完成的，所以效率高一点，但是生成一次RDB快照文件需要花费的时间较长。

	- AOF

		- 效率稍慢，类似于我们用Java流写数据时往文件上不断追加redis操作命令，AOF的执行时间通过配置redis来实现，一般是1秒
		- 效率稍慢，RDB五分钟一次生成快照，但是AOF是一秒一次去通过一个后台的线程fsync操作，那最多丢这一秒的数据。

- 不过Redis本身的机制是 AOF持久化开启且存在AOF文件时，优先加载AOF文件；AOF关闭或者AOF文件不存在时，加载RDB文件；加载AOF/RDB文件城后，Redis启动成功；AOF/RDB文件存在错误时，Redis启动失败并打印错误信息。

## 缓存击穿、雪崩、穿透

### 雪崩

- 原因

	- 如果大量的key过期时间设置的过于集中，到过期的那个时间点，缓存失效，同时又有巨大访问量，没有缓存直接到DB肯定扛不住，这不就炸了吗，这就是缓存雪崩导致的
【大面积的缓存失效，打崩了DB】

- 场景

	- 目前电商首页以及热点数据经常会使用定时任务刷新缓存，可能大量的数据失效时间都十分集中，如果失效时间一样，又刚好在失效的时间点大量用户涌入，就有可能造成缓存雪崩

- 解决方法

	- 1. 我们一般在过期时间上加一个随机值，使得过期时间分散一些（推荐）

		- setRedis（Key，value，time + Math.random() * 10000）；

	- 2. 如果Redis是集群部署，将热点数据均匀分布在不同的Redis库中也能避免全部失效的问题，
	- 3. 或者设置热点数据永远不过期，有更新操作就更新缓存就好了（比如运维更新了首页商品，那你刷下缓存就完事了，不要设置过期时间），电商首页的数据也可以用这个操作，保险。
    - 4. 微服务中的降级、熔断
    
### 击穿

- 原因

	- 和缓存雪崩有点像，但又不大一样，缓存雪崩是大面积缓存失效导致的，而缓存击穿就像是一个key失效，但同时又面临着巨大的访问量，直接打到DB也挂了。
【并发量大的单个缓存失效，打崩DB】

- 解决方法

	- 设置热点数据永远不过期
	- **redis分布式锁**，正常查询是先查缓存，缓存没有再查数据库然后放入缓存中，<br>
	    而我们在查缓存没有之后查数据库的时候加入redis分布式锁，锁中逻辑是这样的，也是先再查一遍缓存，缓存没有查数据库，然后再放入缓存中，最后释放锁。<br>
	    这样当热点缓存失效时，就算你有100个请求同时访问，因为加锁了，所以其他99个请求会进入阻塞，当第一个请求访问成功后又加入了缓存中，所以其他并发请求再来的时候就不会查库嘞。

### 穿透

- 原因

	- 访问缓存和DB中都没有的数据，如id是 -1或者特别大的数据 的时候，攻击者并发高点就会使DB宕机的
【绕过缓存，打崩DB】

- 解决方法

	- 从网管nignx开始配置，对同一ip每秒访问次数超过一定阈值的都拉黑
	- 对访问参数做校验，规范key的命名，并且统一缓存查询和写入的入口。这样，在入口处，对key的规范进行检测。–这样保存恶意的key被拦截。
	- 不管数据库中是否有数据，都在缓存中保存对应的key，值为空就行。–这样是为了避免数据库中没有这个数据，导致的平凡穿透缓存对数据库进行访问。（代码容易，但会浪费redis内存）
	- 如果上面缓存的空值如果太多，也会导致内存耗尽。导致不必要的内存消耗。这样就要定期的清理空值的key。避免内存被恶意占满，导致正常的功能的使用。
	- 使用**布隆过滤器**
	    - 创建一个布隆过滤器，我们只需要关注两个必选参数 **大小**和**误差值** (采用hash算法可能存在误差) 这两个参数即可，至于hash算法可参考guava的布隆过滤器实现即可。查找我们订单表的所有订单编号，循环遍历加入过滤器中。
	    - 优点：布隆过滤器只有 **put()** 和 **mightContain()**，相当于一个ArrayList不能删除元素，只能添加和判断是否存在，底层用hash算法直接保存二进制位(0或1)效率高。
	    - 缺点：布隆过滤器需要手写【一般用 redis setbit(redis中set方法底层就是直接保存的二进制) 实现保证分布式高可用】，维护难，增加数据时往布隆过滤器中put()，删除元素的话需要走**定时任务**定时重新生成布隆过滤器。

## redis集群

我们用到了集群的部署方式也就是Redis cluster，并且是主从同步读写分离，类似Mysql的主从同步，Redis cluster 支撑 N 个 Redis master node，每个master node都可以挂载多个 slave node。

主节点负责写，主从同步，从负责读

这样整个 Redis 就可以横向扩容了。如果你要支撑更大数据量的缓存，那就横向扩容更多的 master 节点，每个 master 节点就能存放更多的数据了。

### 哨兵

- 功能

	- 集群监控：负责监控 Redis master 和 slave 进程是否正常工作。
	- 消息通知：如果某个 Redis 实例有故障，那么哨兵负责发送消息作为报警通知给管理员。
	- 故障转移：如果 master node 挂掉了，会自动转移到 slave node 上。
	- 配置中心：如果故障转移发生了，通知 client 客户端新的 master 地址。

- 原理

	- 一般最低是一主两从三哨兵，当主节点挂了时，哨兵投票选出一个（奇数个哨兵保证能选出一个）去执行故障转移
	- 根据选主策略选出一个新的主节点，断开当前slave所有主从关系，启动时从从同步，升级为主节点，将剩余的从节点指向到新的主节点并通知客户端主节点已更换

- 选主策略

	- slave 的 priority 设置的越低，优先级越高；
	- 同等情况下，slave 复制的数据越多优先级越高；
	- 相同的条件下 runid 越小越容易被选中。

### 主从同步

- redis同步机制

	- Redis可以使用主从同步，从从同步。
1.  启动一台slave 的时候，他会发送一个psync命令给master 
2.  第一次同步时，主节点做一次bgsave，并同时将后续修改操作记录到内存buffer，待完成后将RDB文件全量同步到复制节点，复制节点接受完成后将RDB镜像加载到内存。加载完成后，再通知主节点。
3. 后续的buffer增量数据通过AOF日志同步即可，有点类似数据库的binlog

   	- 1.编辑 vim /etc/redis/6379.conf

   slaveof 172.25.254.101 6379     #redis-master 的ip
2. 重启 /etc/init.d/redis_6379 restart

### redis主从、集群、哨兵搭建

- [传送门](https://www.cnblogs.com/xuwc/p/8900717.html)

## 分布式锁（并发竞争、读写一致性）

- 先拿setnx来争抢锁，抢到之后，再用expire给锁加一个过期时间防止锁忘记了释放。
	set指令有非常复杂的参数，一般是同时把setnx和expire合成一条指令来用的！

- 代码

```java
/**
 * redis分布式锁
 */
public class RedisLockUtil {
 
    private static final String LOCK_SUCCESS = "OK";
    private static final String SET_IF_NOT_EXIST = "NX";
    private static final String SET_WITH_EXPIRE_TIME = "PX";
 
    /**
     * 尝试获取分布式锁
     * @param jedis Redis客户端
     * @param lockKey 锁
     * @param requestId 请求标识
     * @param expireTime 超期时间
     * @return 是否获取成功
       @description 
        我们加锁就一行代码：jedis.set(String key, String value, String nxxx, String expx, int time)，这个set()方法一共有五个形参：
            第一个为key，我们使用key来当锁，因为key是唯一的。
            第二个为value，我们传的是requestId，很多童鞋可能不明白，有key作为锁不就够了吗，为什么还要用到value？原因就是我们在上面讲到可靠性时，分布式锁要满足第四个条件解铃还须系铃人，通过给value赋值为requestId，我们就知道这把锁是哪个请求加的了，在解锁的时候就可以有依据。requestId可以使用UUID.randomUUID().toString()方法生成。
            第三个为nxxx，这个参数我们填的是NX，意思是SET IF NOT EXIST，即当key不存在时，我们进行set操作；若key已经存在，则不做任何操作；
            第四个为expx，这个参数我们传的是PX，意思是我们要给这个key加一个过期的设置，具体时间由第五个参数决定。
            第五个为time，与第四个参数相呼应，代表key的过期时间。
        总的来说，执行set()方法就只会导致两种结果：1. 当前没有锁（key不存在），那么就进行加锁操作，并对锁设置个有效期，同时value表示加锁的客户端。2. 已有锁存在，不做任何操作。
     */
    public static boolean tryGetDistributedLock(Jedis jedis, String lockKey, String requestId, int expireTime) {
 
        String result = jedis.set(lockKey, requestId, SET_IF_NOT_EXIST, SET_WITH_EXPIRE_TIME, expireTime);
 
        if (LOCK_SUCCESS.equals(result)) {
            return true;
        }
        return false;
 
    }



    /**
     * 释放分布式锁
     * @param jedis Redis客户端
     * @param lockKey 锁
     * @param requestId 请求标识
     * @return 是否释放成功
     */
    private static final Long RELEASE_SUCCESS = 1L;
    public static boolean releaseDistributedLock(Jedis jedis, String lockKey, String requestId) {
 
        String script = "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end";
        Object result = jedis.eval(script, Collections.singletonList(lockKey), Collections.singletonList(requestId));
 
        if (RELEASE_SUCCESS.equals(result)) {
            return true;
        }
        return false;
 
    }

 
}
```

## 内存淘汰机制

### redis过期策略

- 定期删除

	- 定期好理解，默认100s就随机抽一些设置了过期时间的key，去检查是否过期，过期了就删了。

		- 为啥不扫描全部设置了过期时间的key呢？

		  假如Redis里面所有的key都有过期时间，都扫描一遍？那太恐怖了，而且我们线上基本上也都是会设置一定的过期时间的。全扫描跟你去查数据库不带where条件不走索引全表扫描一样，100s一次，Redis累都累死了。

- 惰性删除

	- 定期删除肯定删不干净。
惰性删除，见名知意，惰性嘛，我不主动删，我懒，我等你来查询了我看看你过期没，过期就删了还不给你返回，没过期该怎么样就怎么样。

### 定期没删，我也没查询（惰性没删），那可咋整？
内存淘汰机制

- allkeys-lru: 尝试回收最少使用的键（LRU），使得新添加的数据有空间存放。
- volatile-lru: 尝试回收最少使用的键（LRU），但仅限于在过期集合的键,使得新添加的数据有空间存放。
- allkeys-random: 回收随机的键使得新添加的数据有空间存放。
- volatile-random: 回收随机的键使得新添加的数据有空间存放，但仅限于在过期集合的键。

## redis解决

### 事前

- redis高可用，主从+哨兵，redis cluster，避免全盘崩溃

### 事中

- Hystrix限流+降级，避免数据库炸裂

### 事后

- redis持久化，一旦重启自动恢复数据

## 案例

### 秒杀

[查看](https://mp.weixin.qq.com/s?__biz=MzAwNDA2OTM1Ng==&mid=305657212&idx=3&sn=f6a1a6f39257b8749488d475d130f5be&chksm=0cf2d7ff3b855ee9c87e266cd193ef875eaf7ec8b6a9a39699bfe5b29adb729e50919d63b631&scene=18&xtrack=1&key=ebe57afce2f3a109e9797ed19e614ae0a4fae7ab92283105f2dab753cbe327ca1a41e1fd13a80058781edf1d44aae8b555259116a54400ac75761af7ca98f0315133e7f7b81d482d6ac49774f6eeb0e1&ascene=1&uin=MjA2MzU5OTU2Mw%3D%3D&devicetype=Windows+10&version=62070155&lang=zh_CN&pass_ticket=yMrUA%2FpkdEoj2uvU95vik7jUhd7bqgtcnVWYXE9vArgiCxFDX9Gwpt60%2FG1W3Epb)

![](/znote/img/backend/redis/redis02.png)
