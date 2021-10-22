---
title: "Q&A宝典-Java进阶篇"
date: 2019-04-15
tags:
- 复习
categories:
- 知识晶体 Q&A
isShowComments: false
---

<Boxx/>


## List和Map

::: details 1. 接口和抽象类之间的区别？

1. 分别表示的**类型不同**

   接口：**interface**<br/>
   抽象类：**class**

2. 里面**定义的属性修饰符不同**

   接口：里面定义的属性默认都是静态的最终变量（public static final）<br/>
   抽象类：里面定义的属性默认是（default）

3. 里面**定义的方法不同**	

   接口：里面定义的方法默认都是抽象方法（public abstarct）<br/>
   从 jdk8.0开始 接口里面可以定义普通方法<br/>
   抽象类：里面既可以定义抽象方法 又可以定义普通方法

:::

::: details 2. ArrayList和Vector之间的区别？

- ***Vector***：同一时间允许单个线程进行访问 效率较低，但是不会出现并发错误<br/>
  ***ArrayList***：同一时间允许多个线程进行访问 效率较高，但是可能会出现并发错误

- 从jdk5.0开始 集合的工具类里面提供一个方法(***synchronizedList***) 可以将线程不安全的ArrayList对象变成线程安全的集合对象，于是Vector渐渐被淘汰

:::

::: details 3. ArrayList和LinkedList之间的区别？

- ***ArrayList***：底层基于**数组**实现的

  优点：随机访问 遍历查找效率高<br/>
  缺点：添加/删除元素  

- ***LinkedList***：底层基于**链表**实现的

  优点：添加/删除元素效率高<br/>
  缺点：随机访问/遍历查找效率低  

- *：当正常开发的时候 尽量避免使用LinkedList里面的get(下标)方法

:::

::: details 4. HashMap和Hashtable之间的区别？

1. 同步特性不同：
   - ***HashMap*** 同一时间允许多个线程进行访问 **效率较高**，但是**可能会出现并发错误**
   - ***Hashtable*** 同一时间允许一个线程进行访问 **效率较低**，但是**不会出现并发错误**
   - 从jdk5.0开始，集合的工具类里面提供一个方法（***synchronizedList***） 可以将线程不安全的HashMap对象变成线程安全的集合对象

2. 对null的要求不同
   - **HashMap无论主键还是值都可以存放null**，但是由于主键唯一 所以主键只能添加一个null
   - Hashtable无论主键还是值都不能装null，一旦泛型里面装null 都会触发NullPointerException

3. 底层分组不同：
   - **HashMap底层数组大小默认为16**，程序员可以随意的定义，但是最终一定是2的n次方数
   - Hashtable底层数组大小默认为11，程序员可以随意定义

4. 出现的版本不同
   - **Hashtable：since jdk1.0**
   - **HashMap：since jdk1.2**

:::

::: details 5. hashmap 红黑树

- 负载因子，代表了table的填充度有多少，默认是0.75

  加载因子存在的原因，还是因为减缓哈希冲突，提高查询效率。如果初始桶为16，等到满16个元素才扩容，某些桶里可能就有不止一个元素了。
  所以加载因子默认为0.75，也就是说大小为16的HashMap，到了第13个元素，就会扩容成32。

- 为何HashMap的数组长度一定是2的次幂（减少hash碰撞）

  扩容时需要重新计算数组索引index = h&(length-1)，需要进行大量的与运算，保证2的次幂，可以保证在进行与运算时，(length-1)的值的二进制所有的位均为1，这种情况下，Index的结果等于hashCode的最后几位。只要输入的hashCode本身符合均匀分布，Hash算法的结果就是均匀的。

:::

## 泛型

::: details 1. 泛型中的通配符 T，E，K，V，？

本质上这些个都是通配符，没啥区别，换成 A-Z 之间的任何一个 字母都可以。<br/>
通常情况下，T，E，K，V，？ 是这样约定的：

- ？ 表示不确定的 java 类型
- T (type) 表示具体的一个java类型
- K V (key value) 分别代表java键值中的Key Value
- E (element) 代表Element

> 可参考：[掘金](https://juejin.im/post/5d5789d26fb9a06ad0056bd9#heading-1)

:::
