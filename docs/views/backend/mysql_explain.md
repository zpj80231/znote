---
title: MySQL慢查询优化
date: 2020-05-16
tags:
- sql优化
categories:
- 后端 Back-end
isShowComments: false
---

<Boxx/>

通过 **explain** 解析sql运行情况

<!-- more -->

[[toc]]

## explain 使用介绍

通过 explain，可以查看 sql 语句的执行情况（比如查询的表，使用的索引以及 mysql 在表中找到所需行的方式等） 用 explain 查询 mysql 查询计划的输出参数有:

| 列名          | 说明                                                         |
| :------------ | :----------------------------------------------------------- |
| id            | 执行编号，标识 select 所属的行。如果在语句中没子查询或关联查询，只有唯一的 select，每行都将显示 1。否则，内层的 select 语句一般会顺序编号，对应于其在原始语句中的位置 |
| select_type   | 显示本行是简单或复杂 select。如果查询有任何复杂的子查询，则最外层标记为 PRIMARY（DERIVED、UNION、UNION RESUlT） |
| table         | 访问引用哪个表（引用某个查询，如 “derived3”）                |
| type          | 数据访问 / 读取操作类型（ALL、index、range、ref、eq_ref、const/system、NULL） |
| possible_keys | 揭示哪一些索引可能有利于高效的查找                           |
| key           | 显示 mysql 决定采用哪个索引来优化查询                        |
| key_len       | 显示 mysql 在索引里使用的字节数                              |
| ref           | 显示了之前的表在 key 列记录的索引中查找值所用的列或常量      |
| rows          | 为了找到所需的行而需要读取的行数，估算值，不精确。通过把所有 rows 列值相乘，可粗略估算整个查询会检查的行数 |
| Extra         | 额外信息，如 using index、filesort 等                        |

需要注意的是我们重点关注 type 即可！！！

type 显示的是访问类型，是较为重要的一个指标，结果值从好到坏依次是： system > const > eq_ref > ref > fulltext > ref_or_null > index_merge > unique_subquery > index_subquery > range > index > ALL ，一般来说，得保证查询至少达到 range 级别，最好能达到 ref。

| 类型   | 说明                                                         |
| :----- | :----------------------------------------------------------- |
| All    | 最坏的情况，全表扫描                                         |
| index  | 和全表扫描一样。只是扫描表的时候按照索引次序进行而不是行。主要优点就是避免了排序，但是开销仍然非常大。如在 Extra 列看到 Using index，说明正在使用覆盖索引，只扫描索引的数据，它比按索引次序全表扫描的开销要小很多 |
| range  | 范围扫描，一个有限制的索引扫描。key 列显示使用了哪个索引。当使用 =、 <>、>、>=、<、<=、IS NULL、<=>、BETWEEN 或者 IN 操作符，用常量比较关键字列时，可以使用 range |
| ref    | 一种索引访问，它返回所有匹配某个单个值的行。此类索引访问只有当使用非唯一性索引或唯一性索引非唯一性前缀时才会发生。这个类型跟 eq_ref 不同的是，它用在关联操作只使用了索引的最左前缀，或者索引不是 UNIQUE 和 PRIMARY KEY。ref 可以用于使用 = 或 <=> 操作符的带索引的列。 |
| eq_ref | 最多只返回一条符合条件的记录。使用唯一性索引或主键查找时会发生 （高效） |
| const  | 当确定最多只会有一行匹配的时候，MySQL 优化器会在查询前读取它而且只读取一次，因此非常快。当主键放入 where 子句时，mysql 把这个查询转为一个常量（高效） |
| system | 这是 const 连接类型的一种特例，表仅有一行满足条件。          |
| Null   | 意味说 mysql 能在优化阶段分解查询语句，在执行阶段甚至用不到访问表或索引（高效） |

## 其它

- 0529看见的[掘金很nice啊](https://juejin.im/post/5ec4e4a5e51d45786973b357#heading-42)

