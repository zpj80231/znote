---
title: "面试宝典-入门"
date: 2020-02-17
tags:
- 面试题
categories:
- 面试
---

<Boxx/>


## 第一天

::: details 1. 常用的集合有哪些？

Map接口和Collection接口是所有集合框架的父接口：
- Collection接口的子接口包括：Set接口和List接口；
- Map接口的实现类主要有：HashMap、ConcurrentHashMap、TreeMap、Hashtable以及Properties等；
- Set接口的实现类主要有：HashSet、LinkedHashSet、TreeSet等；
- List接口的实现类主要有：ArrayList、LinkedList、Stack、Vector等。

:::

::: details 2. 静态变量和成员变量的区别？

- 所属不同：静态变量属于类，所以也成为类变量；成员变量属于对象，所有也成为实例变量（对象变量）；
- 在内存中出现的时间不同：静态变量只在类创建时加载一次，随着类的加载而加载随着类的消失而消失；成员变量随着对象（也叫实例）的创建而存在，随着对象的消失而消失；
- 在内存中的位置不同：静态变量存储于方法区里的静态区，成员变量属于对内存；
- 调用方式不同：静态变量可以通过类名调用，也可以通过对象调用；成员变量只能通过对象调用；

:::

::: details 3. filter过滤器用过吗？一般用在什么地方？

- 用过
- 例如实现Servlet，Jsp或静态html等文件的拦截，从而实现一些特殊功能。
- 例如实现URL级别的权限访问控制、过滤敏感词汇、压缩响应信息等一些高级功能。

:::

::: details 4. 多线程一般用在什么地方？

- 多线程的作用：充分利用CPU资源，提高CPU使用率，才用多线程的方式去同时完成几件事情而不相互干扰
- 用在什么地方：大多情况下，用到多线程主要是需要处理大量的IO操作或处理需要耗费大量时间的操作等等。比如：读写文件等。

:::

::: details 5. int和Integer的区别？

- Integer是int的包装类，而int是Java的一种基本数据类型
- Integer是类，必须实例化之后才能使用，而int变量不需要
- Integer的默认值是null，而int的默认值是0
- Integer实际是对象的引用，当new一个Integer时，实际上是生成一个指针只想此对象；而int是直接存储数据值

:::


## 第二天

::: details 1. list用过哪些？ArrayList如何排序？list和Set的区别？

用过ArrayList、LinkedList、Vector

排序：sort()

List和Set的区别：

1. List，Set都是继承自Collection接口

2. List特点：元素放入有顺序，元素可以重复。

   Set特点：元素放入无顺序，元素不可重复，重复元素会覆盖。

3. Set和List对比：

   Set：检索元素效率低下，删除和插入效率高，删除和插入不会引起元素位置的改变。

   List：和数组类似，List可以动态增长，查找元素效率高，增删元素效率低，因为增删元素会引起其他元素位置的改变。

:::

::: details 2. 异常包括什么？说一下什么是运行时异常、非运行时异常，举例说明。

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

1. 继承Thread类，重写run方法 (其实Thread类本身也实现了Runnable接口) 

2. 实现Runnable接口， 重写run方法。（传入Thread类的构造方法中，由Thread的start启用线程）

3. 实现Callable接口，重写call方法(有抛出异常和有返回值)

   通过Callable和FutureTask创建线程，将Callable实现类传入FutureTask构造方法中，由FutureTask的start方法启用线程

4. 通过线程池创建线程

:::

::: details 4. 怎么处理异常

- 抛还上级：throws
- 自行处理：try catch finally

:::

::: details 5.多态的实现机制

Java中实现多态的机制靠的是父类或接口定义的引用变量可以指向子类或具体的实现类的实例对象，而程序调的方法在运行期才动态绑定，就是引用变量所指向的具体实例对象的方法，也就是内存里正在运行的那个对象的方法，而不是引用变量的类型中定义的方法。

> 一句话：父类或接口引用指向具体的实例对象

多态的不同表现形式：方法的重写和重载就是Java多态的不同表现
- 重写Overriding是父类与子类之间多态的一种表现
- 重载OverLoding是一个类中多态的一种表现

:::

## 第三天

::: details 1. &和&&的区别

&和&&都可以作为逻辑运算符使用

&&**有短路特性**，当通过前面条件能够得知最终表达式结论的话，后面的条件会短路掉不做判断，所以**效率更高**。&没有短路特性，两边的条件都会进行判断。

另外&还是按位运算符的**按位与运算**。当&左右两边连接的是整数类型的时候作为二进制按位与运算，也就是将两个数的二进制位都是1的结果写1。

:::

::: details 2. final，finally，finalize的区别

- final是一个修饰符，可以用于修饰类、方法、变量

  修饰类代表最终类，表示不能被继承

  修饰方法代表最终方法，表示此方法不能被覆盖（但是可以被继承）

  修饰表示引用地址或值不能被修改

- finally是异常处理的语法结构，表示无论是否出现异常最终都要执行的操作。

  通常是释放和关闭资源的操作（如数据库连接和文件io流的关闭）

- finalize是Object类中的一个方法，表示在gc回收对象之前会调用这个方法

:::

::: details 3. String和StringBuffer的区别

String和StringBuffer都是Java当中提供的字符串类型，其中String没有预留**缓冲空间**，而StringBuffer会在原先内容的基础上预留一部分的缓冲空间。

"a" + "b" 相当于创建了一个新对象，返回值是”ab"。

sbuff.append("b")相当于还是在原先的对象上进行修改值。

:::

::: details 4. 请说出你所知道的线程同步的方法

- synchronize修饰符

  修饰代码块

  修饰方法

- java.util.concurrent.locks.ReentrantLock（并发包中的可重入锁）

  Lock  lock = new ReentrantLock(); 

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

接口可以继承接口，而且可以多继承，多个接口之间用`,`隔开；

抽象类可以实现接口，而且可以暂时不实现接口当中要求的抽象方法，因为抽象类中本身就可以有抽象方法留待子类具体实现；

抽象类可以继承实体类，如果继承的实体类没有默认的无参构造方法，需要写出抽象类的构造方法并在其构造方法的首行使用super()传参来明确指定调用父类的哪个构造方法。

:::