---
title: "面试宝典-数据库基础篇"
date: 2019-10-20
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

- **drop是删除表**，`不会释放表原先占有的内存空间`；
- **truncate是截断表**，`能够释放表中数据所占有的内存空间，保留表结构`；

如果使用drop table 表名 purge;语句则能够直接释放表占有的内存空间。

:::

::: details 4. 左外连接，右外连接，说一下?

- 左外连接：from 原表 left join 新表 on 关联关系<br/>
  `原表和新表能够关联的数据+无法通过关联关系关联到原表的数据`
  
- 右外连接：from 原表 right join 新表 on 关联关系<br/>
  `原表和新表能够关联的数据+无法通过关联关系关联到新表的数据`

:::

::: details 5. sql语句中怎么判断一个字段是不是空

与空判断使用`  is null `或者` is not null `

:::

## 第二天

::: details 1. Mysql和Oracle的区别

1. Oracle使用rownum来实现分页，MySQL使用limit实现**分页**
2. Oracle没有主键自增特性,可以使用调用序列的方式来实现主键自增；MySQL可以在主键列之后添加auto_increment设置**自增特性** 
3. Oracle有表空间的概念，MySQL没有**表空间**
4. Oracle的**分组函数**中select之后不能直接写非分组的其他列；MySQL如果没有聚组函数则可以写 其他列
5. Oracle的表存放在用户（其实是schema对象）所属的表空间的数据文件中，
   mySQL的表存放在某个database中（mysql一个root用户下可以有很多database）
6. Oracle中的一些函数和MySQL也不一样
   如：`ORACLE：substr('abcd',2,2) ，MYSQL：substring('abcd',2,2) `,`ORACLE：to_char(sysdate,'yyyy-mm-dd') ，MYSQL：date_format(now(),'%Y-%m-%d') `
7. Oracle中的字符类型可以使用**varchar2**，MySQL不能使用该类型

:::

::: details 2. jdbc怎样执行sql语句？

1. 加载驱动
2. 通过驱动管理对象获得连接
3. 获得执行器对象编写SQL语句,JAVA中用String类型表示SQL
4. 通过执行器执行SQL语句<br/>
常用的执行SQL语句的方法有:
 `execute()`  boolean (执行select语句时返回true,因为select能够返回一个查询结果 其他命令开头的语句返回false)；
`executeUpdate()`  int；
`executeQuery()`   ResultSet 
5. 释放资源

:::

::: details 3. 索引用过吗？在什么情况下会导致索引失效？用索引还需要注意哪些问题呢？索引分为几种？

- 用过；如果有索引的列空值比较多、重复数据比较多的话索引不起作用。
  通常索引用在查询较多而增删改较少的列，因为索引也会花时间自己维护会降低增删改的效率。

- 常用的索引有**普通索引、唯一性索引、位图索引**，如果某个列上经常使用函数，还可以建一个函数索引。

:::

::: details 4. like 用过吗？怎么用的？

like常用来实现模糊查询，与%和_匹配使用，如果需要匹配特殊字符，则需要使用**escape**逃离符。<br/>
例:搜索以“QA_”开头的数据：`select code from 表 where code like 'QA/_%' escape '/'`

:::

::: details 5. union 和union all的区别

- union取交集，union all取并集

 例如：有{1，2，3}和{2，3，4}<br/>
  **union 能够去除重复数据** (做排序操作)（1，2，3，4）<br/>
  **union all 不会做去重操作 效率高** （1，2，2，3，3，4）

* 多个查询语句必须有相同的列数<br/>
  多个查询语句中的列对应的数据类型必须一致<br/>
如：`select ename,job from emp01
  union
  select ename,job from emp02;`

:::

::: details 6. 事务的特性

- 事务四大特性(简称ACID) 
1. **原子性(Atomicity)：** 事务中的全部操作在数据库中是不可分割的，要么全部完成，要么均不执行。
2. **一致性(Consistency)：** 事务必须是使数据库从一个一致性状态变到另一个一致性状态。一致性与原子性是密切相关的。
3. **隔离性(Isolation)：** 事务的执行不受其他事务的干扰。
4. **持久性(Durability)：** 能够将提交的数据持久化到数据库中。

:::

## 第三天

::: details 1. 存储过程、视图、触发器

- **存储过程 procedure：** 在服务器端，能够被多个程序调用的一段SQL语句块。<br/>
简单来说就是事先用数据库语言写好的一段功能，能够像函数一样被程序调用，但是存储过程本身没有返回值，是通过返回参数的形式返回数据。 

- **视图 View ：** 视图其实就是伪表，将编译后的SQL语句保存在数据库中，拿出只想让用户看见的字段，这就是视图。<br/>
一般来讲视图不能创建索引（因为视图本身只是一个编译后的查询语句，索引只能创建在表的列上），但是Oracle提供了一种物化视图可以创建索引（物化视图：虽然叫视图但是实际类似于表，将数据暂时存储并在基表刷新或者提交数据时刷新本视图以便与基表数据保持一致）。

- **触发器 trigger：** 一种特殊的存储过程，不需要调用，在满足条件时触发。<br/>
触发条件：在对某个表做insert 、 update 或delete操作之前或之后（取决于如何实现）自动执行

:::

::: details 2. 如何调用存储过程？

1. JDBC中使用**CallableStatement**执行器对象，通过`execute("{call  过程名(?,?)}")`
的方式来调用；
2. PL/SQL Developer工具中可以通过`declare begin 过程名(参数);  end;`的方式调用；

:::

::: details 3. 备份数据

1. 第一种方式： 通过导入导出命令备份数据库中全部数据<br/>
Oracle用`exp`命令导出数据，MySQL使用`mysqldump`命令备份数据
2. 第二种方式： 使用工具导出数据

:::

::: details 4. in与exists的区别? 那个效率更高?

exists效率更高
- in :需要通过条件比较结果中的所有数据
- exists: 只关心子查询能够查询出数据

:::

::: details 5. 悲观锁与乐观锁?

- **悲观锁: 在操作表时认为另外一个对表的操作会修改数据** <br/>
1.所以每次在拿数据的时候都会上锁，这样别人想拿这个数据就会阻塞直到它拿到锁（共享资源每次只给一个线程使用，其它线程阻塞，用完后再把资源转让给其它线程）。<br/>
2.java中**synchronized**和**ReentrantLock**等独占锁就是悲观锁思想的实现。<br/>
3.传统的关系型数据库里边就用到了很多这种锁机制，比如**行锁，表锁等，读锁，写锁**等，都是在做操作之前先上锁。

- **乐观锁: 在操作表时认为别的操作不会对表有修改数据的操作** <br/>
1.所以不会上锁，但是在更新的时候会判断一下在此期间别人有没有去更新这个数据，可以使用**版本号机制(原子类)和CAS算法**实现。<br/>
2.乐观锁适用于多读的应用类型，这样可以提高吞吐量。

:::

