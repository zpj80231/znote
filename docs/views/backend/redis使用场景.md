---
title: Redis - 常见应用场景
date: 2021-07-15
tags:
    - Redis
categories:
    - 后端 Back-end
isShowComments: false
---

<Boxx/>

[[toc]]

Redis是一个key-value存储系统，现在在各种系统中的使用越来越多，大部分情况下是因为其高性能的特性，被当做缓存使用，下面介绍下Redis经常遇到的使用场景。

## 一、String 场景

- 计数：例如掘金文章点击数量，阅读数量。
- 缓存：MySQL 缓存。
- session共享：集群环境下的 session 共享。
- 限流：限制一个公共API下某个用户每秒只能调用100次。
  set设置key为userId:api，value为次数，过期时间为1s。(1s内每次调用则value加1)

## 二、Hash 场景

各种 商城购物车 (淘宝，京东。。)

设计思路：

1.购物车绑定了 `userId`。

2.商品id作为feild，商品数量作为value。

模拟过程：

```java
// 初始化购物车数据
hmset userId:1 prod:1 1 prod:2 3 prod:3 4

// 增加商品 prod:1 购买数量为2件时
hincrby userId:1 prod:1 1

// 减少商品 prod:2 数量为1件时
hincrby userId:1 prod:2 -2

// 删除商品 prod:1 时
hdel userId:1 prod:1

// 统计商品数
hlen userId:1
```

## 三、List 场景

微信公众号订阅消息，文章评论列表等等

设计思路：

公众号发布消息时，向订阅本公众号的用户(mess:1)推送(将订阅消息id通过lpush放入用户的list中)，模拟过程。

模拟过程：

```java
// 推送消息
lpush mess:1 999
lpush mess:1 1000
lpush mess:1 1010

// 查看消息，返回结果1010 1000 999
lrange mess:1 0 -1
```

## 四、Set 场景

限时抽奖活动：例如微信有个活动，活动id为2，如何基于Redis设计实现。

设计思路：

用户点击立即参与后，将用户id保存到活动id的集合中，利用Set集合的元素唯一性可查看参加用户、参加用户数量等等。

模拟过程：

```java
// 用户user:1 user:2 user:3参加抽奖活动act:888
sadd act:888 user:1 user:2 user:3

// 模拟一次性随机抽奖1名【抽奖】
srandmember act:888

// 模拟两次抽奖，两次抽奖不重复，使用spop命令，抽取中的用户会从set中移除
spop act:888
spop act:888
    
/* 好友关系：共同关注，我关注的人也关注了他，我可能认识的人
    注： 如果数据量大的情况下使用大数据分析
    设计思路：两个集合取交集
    模拟过程：*/
    
// 三个用户关注的人
sadd user:1 zhangsan lisi wangwu
sadd user:2 zhangsan liliu wanger wangwu
sadd user:3 list wangwu liliu

// user:1和user:2共同关注的人，【取交集】
// 返回zhangsan wangwu
sinter user:1 user:2
```

## 五、zSet 场景

各种榜单：

例如百度新闻排名

设计思路：

将新闻id作为member，点击次数设置为score，每点击一次score+1，当然，为了每日榜单，member在设计时可以加上后缀用于日期区分，例如news:20191216、news:20191217 。

模拟过程：

```java
// 增加热点新闻
zadd topic:20191216 100 new:1 200 new:2 150 new:3 500 new:4

// new:1点击了120次，点击数变为220
zincrby topic:20191216 120 new:1

// 查看今日排行前3名，返回 new:4 500 new:1 220 new:2 200
zrevrange topic:20191216 0 2 withscores

// 1.新添加数据
zadd topic:20191217 110 new:1 200 new:2 150 new:3 100 new:4

zadd topic:20191218 110 new:5 200 new:2 150 new:6 100 new:7

// 2.合并三日的数据
zunionstore topic:3day 3 topic:20191216 topic:20191217 topic:201912168

// 3.查看近三日排行榜前三名，返回new:4 600 new:2 600 new:1 330
zrevrange topic:3day 0 2 withscores
```

## 五、bitmap 场景

如何用redis存储统计1亿用户一年的登陆情况，并快速检索任意时间窗口内的活跃用户数量？redis如何做亿级用户登录日活统计？

利用redis的bitmap，value是一个二进制数据，每一位只能是0或者1。

```java
// setbit key offset value
// 用户登录，用户id为整型
setbit login:20220505 uid 1
        
// 判断用户某日是否登录过
getbit login:20220505 uid
        
// 每日用户登录数量统计 bitcount key [start] [end]
bitcount login:20220505

// 活跃用户(连续三日登录)统计 bitop operation destkey key [key …]
/* bitmap的bitop命令支持对bitmap进行AND(与)，(OR)或，XOR(亦或)，NOT(非)四种相关操作;
    我们对近三日的bitmap做AND操作即可，操作之后会形成一个新的bitmap，
    我们可以取名为login:top_count 
 */
/* 然后我们可以对login:top_count使用bitcount或者getbit命令，
    用于统计活跃用户数量，或者查看某个用户是否为活跃用户
 */
bitop and login:top_count login:20201005 login:20201004 login:20201003
```

以上就是了解Redis常见应用场景的详细内容。

<Reward/>
