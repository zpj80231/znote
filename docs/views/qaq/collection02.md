---
title: "面试宝典-数据库篇"
date: 2020-02-20
tags:
- 面试
categories:
- 面试
---

<Boxx/>


## 第一天

::: details 1. 分页怎么实现的

- Mysql分页使用limit：`select 列名 from 表名 limit 10,10;`
- Oracle分页使用rownum：`select a.* from (select rownum rw, 列名 from 表名 where 条件) a where a.rw>数字 and a.rw<=y;`

:::

::: details 2. sql语句优化

1. 合理使用索引
2. 用exists代替in，exists是直接判断存不存在，而in会挨个比较
3. 复杂的业务功能可以使用存储过程
4. 应尽量避免在 where 子句中使用`!=`、`<>`、`or`、`in`、`not in`操作符，否则将引擎放弃使用索引而进行全表扫描
5. 能多表关联的尽量不写子查询
6. 避免%xxx式查询，前置%查询会导致查全表

:::

::: details 3. Oracle中drop 和truncate的区别？

- drop是删除表，不会释放表原先占有的内存空间；
- truncate是截断表，能够释放表中数据所占有的内存空间，保留表结构；

如果使用drop table 表名 purge;语句则能够直接释放表占有的内存空间。

:::

::: details 4. 左外连接，右外连接，说一下?

- 左外连接：from 原表 left join 新表 on 关联关系<br/>
  原表和新表能够关联的数据+无法通过关联关系关联到**原表**的数据
  
- 右外连接：from 原表 right join 新表 on 关联关系<br/>
  原表和新表能够关联的数据+无法通过关联关系关联到**新表**的数据

:::

::: details 5. sql语句中怎么判断一个字段是不是空

与空判断使用`  is null `或者` is not null `

:::