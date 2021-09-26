---
title: "Q&A宝典-数据库基础篇"
date: 2019-10-20
tags:
- 复习
categories:
- 知识晶体 Q&A
isShowComments: false
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

::: details 6. 数据源、数据库连接池、DBCP三者的关系？

1. **数据源**：是连接数据库的一个<u>标准</u>
2. **数据库**：连接池是实现数据源的一种<u>解决方案</u>
3. **DBCP**：是连接池的<u>具体实现</u>

:::

## 第二天

::: details 1. Mysql和Oracle的区别

1. Oracle使用rownum来实现分页，MySQL使用limit实现**分页**

```sql
-- - mysql查询行号
select 
	w.id,
	@rowno := @rowno + 1 AS rowno,
	-- 查到当前这一行的行号
	CASE WHEN w.ID ='123456' THEN
@rowno END currentrowno 
	from table w order by w.rowno;
```

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

- 都是取并集，可以用来代替 or

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

::: details 7. 什么是事务？特征？JDBC如何控制事务？

- 多条sql语句作为 一个执行单元，要么全部执行，要么全不执行

- 四大特性：**原子性，一致性，隔离性，持久性**

- JDBC控制事务：
  - 开始事务：connection.setAutoCommit(false);
  - 执行sql语句
  - 提交:connection.commit();
  - 回滚：Connection.rollback();

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

::: details 6. Hibernate中常见的主键增长策略？

- ***Assigned***:在调用save方法之前设置，自定义主键增长方式
- ***Identity***:建表语句必须支持auto_increment
- ***Sequence***:指定序列生成主键
- ***Native***:底层自动选择合适的策略
- ***Increment***：最大值+1的方式
- ***Uuid***:生成32为字符串

:::

## 第四天

::: details 1. 结构化查询语言都是什么？

1. **DDL**	alter drop truncate create
2. **DML**	insert delete update
3. **DQL**	select
4. **DCL**	grant revoke
5. **TCL**	commit rollback savepoint

:::

::: details 2. drop和truncate的区别?

- drop：删除表结构和表数据(如果删除表空间的话需要+purge)
- truncate：删除表数据和表空间，会保留表结构

:::

::: details 3. 组函数?多行函数?

- sum() avg() count() max() min()

:::

::: details 4. 怎么去重？

1. **distinct**  专业去重(支持多列)
   		  `select distinct salary,name from student;`
2. **group by**  聚合统计

:::

::: details 5. 什么时候使用多表连接？什么时候使用子查询？

1. 如果需要查询的数据在多个表中,一定要使用多表连接
2. 不需要表A中的列,但是下需要表A中的条件,可以用子查询
3. 子查询中如果使用了in some any all这几个关键字,效率比较低,可以转换成多表关联

:::

::: details 6. 为什么要使用视图?

1. **节省编译时间,提高查询效率**
2. **屏蔽原表中的字段**，避免没有权限的用户查询到其他字段
3. 视图的数据能够动态的来源于原表
4. 简单的视图可以更新视图中的数据，复杂的视图无法更新<br/>`
   create view 视图名 as select name from student;`

:::

::: details 7. 为什么要给普通用户创建属于自己的表空间?

1. 项目中很有可能与其他项目使用同一个数据库,
   	多个用户在使用用一个数据库时有可能访问同一个数据库文件,
      	就会产生资源争用的问题。给不同的用户指定不同的表空间，
      	就可以让他们使用不同的数据库文件，**解决资源争用的问题**。
2.  **给予用户部分权限**

:::

::: details 8. 约束有哪几种?

1. 外键约束	foreign key references
2. 唯一约束	unique
3. 非空约束	not null
4. 主键约束	primary key
5. 检查约束	check

:::

::: details 9. 索引有哪几种?

1. 函数索引
2. 普通索引 normal
3. 唯一索引 unique
4. 位图索引 bitmap（适合在数据量比较大，基数比较小的列  如：男/女）

:::

::: details 10. 索引的优缺点?

- 能够更快的帮助我们**提高查询效率**
- 索引会降低数据库的增删改的效率，因为数据库需要花时间去维护索引,所以**索引适合数据量比较大而且数据不经常改动的列**

:::

::: details 11. sql语句怎么优化?

1. 尽量**用exists代替in**
2. 合理**使用索引**
3. 查询多个表中的数据时,尽量用**多表连接**
4. 多表连接时尽量把**多的数据放在where之后**
5. 多表连接时尽量**使用表的别名**,减少数据库的解析时间
6. 在确保语句完整的情况下,多使用commit提交语句
7. **优化group by**，将不需要的记录在group by之前过滤掉

:::

::: details 12. 查询语句常见的关键字的优先级?

1. select  列名		优先级高于order by
2. from	表明		优先级最高
3. where	条件		优先级次高
4. group by条件		优先级次于where
5. having	条件		优先级一定在group by之后
6. order by分组		优先级最低

:::

::: details 13. Oracle分页

​	`rownum`，这是Oracle对动态查询结果的编号，用来实现分页查询有序的整数列，每多一条自动加1

1. 不能和 group by 在同一个查询语句中
2. 不能用 表名.rownum
3. 它肯定是从1开始
- 编号21-30，实现排序效果的分页

```sql
select rownum,a.*
   	from
   		(select rownum rn,b.* 
         from (select * from student order by salary) b
         where rownum <=30) a
   	where
   		a.rn >=21;
```

:::
