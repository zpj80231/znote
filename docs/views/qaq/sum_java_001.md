---
title: "面试宝典-Java基础篇"
date: 2019-02-17
tags:
- 面试
categories:
- 面试
isShowComments: false
---

<Boxx/>


## 第一天

::: details 1. 常用的集合有哪些？

**Map**接口和**Collection**接口是所有集合框架的父接口：
- Collection接口的子接口包括：Set接口和List接口；
- Map接口的实现类主要有：**HashMap、ConcurrentHashMap、TreeMap、Hashtable**以及**Properties**等；
- Set接口的实现类主要有：**HashSet、LinkedHashSet、TreeSet**等；
- List接口的实现类主要有：**ArrayList、LinkedList、Stack、Vector**等。

:::

::: details 2. 静态变量和成员变量的区别？

- **所属不同：** 静态变量属于类，所以也成为类变量；成员变量属于对象，所有也成为实例变量（对象变量）；
- **在内存中出现的时间不同：** 静态变量只在类创建时加载一次，随着类的加载而加载随着类的消失而消失；成员变量随着对象（也叫实例）的创建而存在，随着对象的消失而消失；
- **在内存中的位置不同：** 静态变量存储于方法区里的静态区，成员变量属于对内存；
- **调用方式不同：** 静态变量可以通过类名调用，也可以通过对象调用；成员变量只能通过对象调用；

:::

::: details 3. filter过滤器用过吗？一般用在什么地方？

- 用过
- 例如实现Servlet，Jsp或静态html等**文件的拦截**，从而实现一些特殊功能。
- 例如实现URL级别的**权限访问控制**、**过滤敏感词汇**、压缩响应信息等一些高级功能。

:::

::: details 4. 多线程一般用在什么地方？

- 多线程的作用：`充分利用CPU资源，提高CPU使用率`，才用多线程的方式去同时完成几件事情而不相互干扰
- 用在什么地方：大多情况下，用到多线程主要是需要处理`大量的IO操作`或处理需要`耗费大量时间的操作`等等。比如：读写文件等。

:::

::: details 5. int和Integer的区别？

- Integer是int的包装类，而int是Java的一种基本数据类型
- Integer是类，必须实例化之后才能使用，而int变量不需要
- Integer的默认值是null，而int的默认值是0
- Integer实际是对象的引用，当new一个Integer时，实际上是生成一个指针只想此对象；而int是直接存储数据值

:::

::: details 6. 3.2E3F 里面的E/F分别表示什么？

- E：科学计数法	3.2*10（3）
- F:表示float类型

:::

::: details 7. switch（参数） case的参数可以传哪些数据类型？

- jdk1.0	 char byte short int<br/>
  jdk5.0   enum(枚举)<br/>
  jdk7.0   String

:::

::: details 8. do while 和while之间的区别？

- ***do while*** 先执行 然后在判断 保证程序至少执行一次【先斩后奏】
- ***while*** 先判断 符合条件在执行

:::


## 第二天

::: details 1. list用过哪些？ArrayList如何排序？list和Set的区别？

- 用过ArrayList、LinkedList、Vector<br/>
- 排序：sort()

> List和Set的区别：
> 1. List，Set都是继承自Collection接口
> 2. List特点：元素放入有顺序，元素可以重复。<br/>
>    Set特点：元素放入无顺序，元素不可重复，重复元素会覆盖。
> 3. Set和List对比：<br/>
   Set：检索元素效率低下，删除和插入效率高，删除和插入不会引起元素位置的改变。<br/>
   List：和数组类似，List可以动态增长，查找元素效率高，增删元素效率低，因为增删元素会引起其他元素位置的改变。

:::

::: details 2. 异常包括什么？说一下什么是运行时异常、非运行时异常，举例说明。

- 异常是指程序运行过程当中出现的例外情况

  异常的体系结构：

  ```mermaid
  graph TB
  	Throwable --> Error
  	Throwable --> Exception
  	Exception --> RuntimeException
  ```

异常包括：运行时异常和非运行时异常

- 运行时异常(RuntimeException)：指编译能通过，直到运行的时候才体现出来
- 非运行时异常(Exception)：指在编译的时候必须明确该如何处理，否则根本无法通过编译
- Error：描述了Java运行时系统的内部错误或资源耗尽错误。大多数错误与代码编写无关，而表示代码运行时JVM出现的问题。应用程序不应该抛出这种类型的对象。

常见的运行时异常(RuntimeException)有：

1. IndexOutOfBoundsException（下标越界异常）
2. NullPointerException（空指针异常）
3. NumberFormatException（String转换为指定的数字异常）
4. ArithmeticException（算术异常，如除数为0）
5. FileNotFoundException（文件未找到异常）
6. IOException（操作输入流和输出流时可能出现的异常，如磁盘损坏等）

:::

::: details 3. 线程的实现方式

1. **继承Thread类**，重写run方法 (其实Thread类本身也实现了Runnable接口) 

2. **实现Runnable接口**， 重写run方法。（传入Thread类的构造方法中，由Thread的start启用线程）

3. **实现Callable接口**，重写call方法(有抛出异常和有返回值)

   通过Callable和FutureTask创建线程，将Callable实现类传入FutureTask构造方法中，由FutureTask的start方法启用线程

4. 通过线程池创建线程

:::

::: details 4. 怎么处理异常

- 抛还上级：throws
- 自行处理：try catch finally

:::

::: details 5. 多态的实现机制

**Java中实现多态的机制靠的是：** 父类或接口定义的引用变量可以指向子类或具体的实现类的实例对象，而程序调的方法在运行期才动态绑定，就是引用变量所指向的具体实例对象的方法，也就是内存里正在运行的那个对象的方法，而不是引用变量的类型中定义的方法。

> 一句话：**父类或接口引用指向具体的实例对象**

多态的不同表现形式：方法的重写和重载就是Java多态的不同表现
- 重写Overriding是父类与子类之间多态的一种表现
- 重载OverLoding是一个类中多态的一种表现

:::

::: details 6. Java简单运算面试题

```java
short x = 1;
x = x + 1;//左边short = 右边int？
System.out.println(x);//报错

short y = 1;
y += 1;//y = (short)(y + 1); +=会自动转换
System.out.println(y);//2
```

:::

::: details 7. StringBuffer和StringBuilder之间的区别？

- StringBuffer和StringBuilder在创建对象的时候 都会多预留16块缓冲区

1. ***StringBuffer*** 同一时间允许一个线程进行访问，**效率较低**，但是**不会出现并发错误**
2. ***StringBuilder*** 同一时间允许多个线程进行访问，**效率较高**，但是**可能会出现并发错误**

:::

::: details 8.  为什么不把一个类所有的方法全部定义成静态的呢？

- 静态方法里面只能直接的访问静态成员
- 如果想要在静态方法里面访问非静态成员的话，需要先创建对象，拿着对象去调用

:::

## 第三天

::: details 1. &和&&的区别

&和&&都可以作为逻辑运算符使用

&&**有短路特性**，当通过前面条件能够得知最终表达式结论的话，后面的条件会短路掉不做判断，所以**效率更高**。&没有短路特性，两边的条件都会进行判断。

另外&还是按位运算符的**按位与运算**。当&左右两边连接的是整数类型的时候作为二进制按位与运算，也就是将两个数的二进制位都是1的结果写1。

:::

::: details 2. final，finally，finalize的区别

- **final是一个修饰符**，可以用于修饰类、方法、变量

  修饰类代表最终类，表示不能被继承<br/>
  修饰方法代表最终方法，表示此方法不能被覆盖（但是可以被继承）<br/>
  修饰表示引用地址或值不能被修改

- **finally是异常处理的语法结构**，表示无论是否出现异常最终都要执行的操作。

  通常是释放和关闭资源的操作（如数据库连接和文件io流的关闭）

- **finalize是Object类中的一个方法**，表示在gc回收对象之前会调用这个方法

:::

::: details 3. String和StringBuffer的区别

String和StringBuffer都是Java当中提供的字符串类型，其中String没有预留**缓冲空间**，而StringBuffer会在原先内容的基础上预留一部分的缓冲空间。

> **String：** "a" + "b" 相当于创建了一个新对象，返回值是”ab"。<br/>
> **StringBuffer：** sbuff.append("b")相当于还是在原先的对象上进行修改值。

:::

::: details 4. 请说出你所知道的线程同步的方法

- synchronize修饰符

  修饰代码块<br/>
  修饰方法

- java.util.concurrent.locks.ReentrantLock（并发包中的可重入锁）

  Lock  lock = new ReentrantLock(); <br/>
  其中lock.lock()用于上锁，lock.unLock()用于释放锁

:::

::: details 5. 在Java中，如何跳出当前的多重循环

1. break加循环标签，如：

   ```java
   example_this:for(int x=0; x<10; x++) {
       if(...) {
           break example_this;//结束循环
       }
   }
   ```

2. 使用return

3. 使用System.exit(0);结束虚拟机

:::

::: details 6. 接口是否可以继承？抽象类时候可以实现接口？抽象类是否可以继承实体类？

**接口可以继承接口**，而且可以多继承，多个接口之间用`,`隔开；

**抽象类可以实现接口**，而且可以暂时不实现接口当中要求的抽象方法，因为抽象类中本身就可以有抽象方法留待子类具体实现；

**抽象类可以继承实体类**，如果继承的实体类没有默认的无参构造方法，需要写出抽象类的构造方法并在其构造方法的首行使用super()传参来明确指定调用父类的哪个构造方法。

:::

::: details 7. 抽象类是类 有构造方法 但是不能创建对象那么要构造方法的作用？

- 给子类构造方法首行的super去调用的

:::

## 第四天

::: details 1. ==和equals的区别？

- **==：是一个运算符**，用于比较两端的内容是否相等

  基本数据类型：两端的值是否相等<br/>
  引用类型：内存地址是否相等

- **equals：是Object类的一个方法**。子类继承这个方法之后可以按照自己的逻辑需求覆盖这个方法，从而描述自己的比较规则。
  例如：String类就将equals()方法覆盖为比较字符串的内容

:::

::: details 2. 怎么解决死锁？

- wait()，notify()，notifyAll()

使用 **wait()** 让当前线程(a)放弃锁标记进入等待池当中阻塞，从而成全另外的线程(b)能够成功获得它(b)需要的锁标记之后再调用 **notify()** 或者 **notifyAll()** 唤醒线程(a)，让线程(a)从等待池进入锁池等待获得锁标记

> [注意这三个方法都必须已经持有锁标记才能调用所以他们只能出现在synchronized代码块当中]

:::

::: details 3. 线程的生命周期

新生 就绪 运行 消亡 阻塞（等待池 锁池）

:::

::: details 4. 线程池

- **可重用的线程池**，方法的参数表示同一时间允许多少个线程并发执行，当线程执行完时，线程将被归还给线程池  `Executors.newFixedThreadPool(2)`;

- **带缓存机制的线城池**，当线程执行完时，线程将被归还给线程池，如果一分钟之内没有其他线程被提交， 线程将会消亡  `Executors.newCachedThreadPool()`;  

- **单一执行器**：同一时间仅允许一条线程执行  `Executors.newSingleThreadExcutor()`

:::

::: details 5. 简述JDBC中Statement和PrepareStatement的区别

1. 两者同为接口	, **PreparedStatement是Statement的子类**
2. Statement 只能执行静态语句
   PreparedStatement存在一个强大缓存区，相同的sql语句执行相同语句结构**仅仅编译一次**，PreparedStatement仅对改动数据进行修改而不再进行编译，而Statement只要语句发生了改变，则必须重新进行编译
3. PreparedStatement支持对sql语句使用 **?占位符**，杜绝了 sql注入安全隐患
4. 如果sql语句不需要多次执行，或者?过多，则效率可能较Statement低

:::

::: details 6. 简述 execute() executeUpdate() executeQuery() executeBatch()的使用场合，返回值?

|                 | 返回类型  | 使用场合                                |
| --------------- | --------- | --------------------------------------- |
| execute()       | boolean   | 执行dql语句返回true，dml语句返回false   |
| executeUpdate() | int       | 执行dml返回更改记录数，dql立刻报错      |
| executeQuery()  | ResultSet | 执行dql语句返回结果集                   |
| executeBatch()  | int[]     | 只能执行dml语句，返回更改的记录数的数组 |

:::

## 第五天

::: details 1. Java当中如何实现数据共享~

1. 使用**静态变量**完成数据共享
2. 使用**参数传递**完成数据共享
3. 使用**内部类**完成数据共享

:::

::: details 2. 为什么要使用内部类？

​	内部类是Java当中 <u>共享数据最最简单的方式之一</u>

:::

::: details 3. 内部类都有哪几种？

​	成员内部类、静态内部类、局部内部类、匿名内部类

:::

::: details 4. 如何自定义异常和如何主动制造异常出现的场景？

- 自定义异常 

  自己写一个类型**继承Exception** => 非运行时异常<br/>
  自己写一个类型**继承RuntimeException** => 运行时异常

- 如何主动制造异常出现的场景		

  throw new 异常的类型();

:::

::: details 5. throw 和 throws 的区别?

- throw 用在方法体当中

  在没有异常出现的情况下主动制造异常出现的场景
  ​		**[没事找事型]**

- throws 用在方法签名的最后

  表明本方法当中出现指定种类的异常 本方法不做处理<br/>抛还给调用的上级进行处理
  ​		**[有事甩锅型]**

:::

::: details 6. 如何控制线程?

1. ***setPriority(int)*** : 设置**线程优先级别** 可选范围 1-10 默认5<br/>优先级越高 代表抢到时间片的概率越高
2. ***static sleep(long)*** : 让当前线程**休眠**指定的毫秒数
3. ***static yield()*** : 让当前线程直接**放弃时间片返回就绪**
4. ***join()*** : 当前线程邀请另一个线程**优先执行**

::: details 7. 如何解决并发错误?

- **synchronized**(临界资源){执行操作}
- 可重入锁java.util.concurrent.locks.**ReentrantLock**

:::

::: details 8. 如何解决死锁?

- 一块空间 : 等待池

- 三个方法 : 

  1. **wait()** : 让当前线程放弃已经持有的锁标记
     			并且进入调用方法那个对象等待池当中
  2. **notify()** : 从调用方法的那个对象的等待池当中
     			随机的唤醒一个线程
  3. **notifyAll()** : 从调用方法的那个对象的等待池当中
     			唤醒所有线程

> 这三个方法不是线程类的 是Object类的<br/>
  这三个方法必须在已经持有锁标记的前提下才能使用，否则不但失败 还会触发异常

:::

::: details 9. 锁池和等待池的区别？

1. **进入的时候**是否需要释放锁标记
   - 锁池：不需要 所以可能会造成死锁
   - 等待池：需要 先释放锁标记才能进入等待池
2. **离开的时候**是否需要调用方法
   - 锁池：不需要 只要锁标记再度可用
   - 等待池：需要 必须要notify() 或 notifyAll()
3. **离开之后**去往何方：
   - 锁池：就绪
   - 等待池：锁池

:::

::: details 10. 流的分类?

- **按照方向分**：输入流 输出流

  **按照单位分**：字节流 字符流

  **按照功能分**：节点流 处理流（过滤流、包装流）

:::