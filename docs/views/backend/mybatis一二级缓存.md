---
title: MyBatis 中的一、二级缓存
date: 2021-04-23
tags:
- MyBatis
categories:
- 后端 Back-end
isShowComments: true
---

<Boxx/>

[[toc]]

## MyBatis 一级缓存介绍

一级缓存是 **SqlSession级别** 的缓存。在操作数据库时需要构造 sqlSession 对象，在对象中有一个(内存区域)数据结构（HashMap）用于存储缓存数据。不同的 sqlSession 之间的缓存数据区域（HashMap）是互相不影响的。用一张图来表示一下一级缓存，其中每一个 SqlSession 的内部都会有一个一级缓存对象。

![img](https://img2018.cnblogs.com/blog/1515111/201908/1515111-20190808213428708-881945789.png)

在应用运行过程中，我们有可能在一次数据库会话中，执行多次查询条件完全相同的SQL，**MyBatis 提供了一级缓存的方案优化这部分场景，如果是相同的SQL语句，会优先命中一级缓存，避免直接对数据库进行查询，提高性能。**

### 一级缓存是如何失效的

1. 增删改操作会清空缓存

2. 不同请求（会话）中的同一个查询，各是各自的缓存，一级缓存是基于会话的。

   **需要注意的是**
   当Mybatis整合Spring后，直接通过Spring注入Mapper的形式，如果不是在同一个事务中每个Mapper的每次查询操作都对应一个全新的SqlSession实例，这个时候就不会有一级缓存的命中，但是在同一个事务中时共用的是同一个SqlSession。

## MyBatis 二级缓存介绍

MyBatis 一级缓存最大的共享范围就是一个SqlSession内部，那么如果多个 SqlSession 需要共享缓存，则需要开启二级缓存，开启二级缓存后，会使用 CachingExecutor 装饰 Executor，进入一级缓存的查询流程前，先在CachingExecutor 进行二级缓存的查询，具体的工作流程如下所示

![img](https://img2018.cnblogs.com/blog/1515111/201908/1515111-20190810211431621-1800471104.png)

当二级缓存开启后，同一个命名空间(namespace) 所有的操作语句，都影响着一个**共同的 cache**，也就是二级缓存被多个 SqlSession 共享，是一个**全局的变量**。当开启缓存后，数据的查询执行的流程就是 二级缓存 -> 一级缓存 -> 数据库。

### 二级缓存开启条件

二级缓存默认是不开启的，需要手动开启二级缓存，实现二级缓存的时候，MyBatis要求返回的POJO必须是可序列化的。开启二级缓存的条件也是比较简单，通过直接在 MyBatis 配置文件中通过

```xml
<settings>
	<setting name = "cacheEnabled" value = "true" />
</settings>
```

来开启二级缓存，还需要在 Mapper 的xml 配置文件中加入 `<cache>`标签

### 是否应该使用二级缓存？

那么究竟应该不应该使用二级缓存呢？先来看一下二级缓存的注意事项：

1. 缓存是以`namespace`为单位的，不同`namespace`下的操作互不影响。
2. insert,update,delete操作会清空所在`namespace`下的全部缓存。
3. 通常使用MyBatis Generator生成的代码中，都是各个表独立的，每个表都有自己的`namespace`。
4. 多表操作一定不要使用二级缓存，因为多表操作进行更新操作，一定会产生脏数据。（同一个namespace下，多表级联第一次查询后，对其中一张单表更新，再次查询多表级联语句，还是返回第一次查询后的）

如果你遵守二级缓存的注意事项，那么你就可以使用二级缓存。

但是，如果不能使用多表操作，二级缓存不就可以用一级缓存来替换掉吗？而且二级缓存是表级缓存，开销大，没有一级缓存直接使用 HashMap 来存储的效率更高，所以**二级缓存并不推荐使用**。

## 其他

[MyBatis 一级缓存](https://www.cnblogs.com/cxuanBlog/p/11324034.html)

[MyBatis 二级缓存](https://www.cnblogs.com/cxuanBlog/p/11333021.html)

<Reward/>
