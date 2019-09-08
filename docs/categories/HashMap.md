---
title: HashMap底层实现和原理
date: 2019-07-13 20:53:26
tags:
- "源码分析"
- Java
catagories:
- "源码分析"
keys:
- '123456'
---

::: tip 罗曼·罗兰

先相信自己，然后别人才会相信你

 :::

[[toc]]

# HashMap底层实现和原理

## 简介

- HashMap是一个散列桶（数组和链表），它存储的内容是键值对(key-value)映射
- HashMap采用了数组和链表的数据结构，方便继承了数组的线性查找和链表的寻址修改
- HashMap是非synchronized（但是在rehash和扩容的时候可能出现并发问题），所以HashMap很快
- HashMap可以接受null键和值，而Hashtable则不能（原因就是equlas()方法需要对象）

## 继承关系

```java
public class HashMap<K,V> extends AbstractMap<K,V>
    implements Map<K,V>, Cloneable, Serializable {
```

## 实现原理

- HashMap由数组+链表(+红黑树 1.8)来实现对数据的存储
- 详细可以看：[HashMap原理深入理解](https://blog.csdn.net/visant/article/details/80045154)

![](/img/HashMap/20180423002750407.png)

## 手写一个简单的HashMap

- 很简单，就是看一下HashMap源码中定义了什么属性、方法，然后我们写一个简单的类继承HashMap，挑其中几个重要的方法做出实现就好了

```java
package com.eee;

import java.util.HashMap;

/**
 * @className: MyHashMap
 * @descripe: 模拟HashMap底层实现
 * @author: zpj
 * @date: 2019/7/7
 * @version: 1.0
 */
public class MyHashMap<key,value> extends HashMap<key,value>{

    //定义一个数组
    private Node<key,value>[] table; 
    //初始化数组容量大小为 16
    private static Integer CSHSZRL = 16;
    //定义一个size，用来统计HashMap内个数
    private int size = 0;

    public MyHashMap() {
        //创建对象的时候就初始化数组
        table = new Node[CSHSZRL];
    }

    @Override
    public int size() {
        return size;
    }

    @Override
    public value get(Object key) {
        //算出这个节点是在哪个hash组
        int hash = key.hashCode();
        int index = hash % table.length;

        //遍历
        for(Node<key,value> node = table[index];table[index]!=null;node.getNext()){
            //新元素和老元素一样的话
            if(node.getK().equals(key)){
                return node.getV();
            }
        }
        return null;
    }

    @Override
    public boolean containsKey(Object key) {
        return super.containsKey(key);
    }

    /**
     * HashMap的 put()方法
     * @param key
     * @param value
     * @return 当put元素出现重复的时候，新元素覆盖老元素，返回老元素的value
     */
    @Override
    public value put(key key, value value) {
        //算出这个节点是在哪个hash组
        int hash = key.hashCode();
        int index = hash % table.length;

        //新增元素时，遍历老元素，和新元素比较
        for(Node<key,value> node = table[index];table[index]!=null;node.getNext()){
            //新元素和老元素一样的话
            if(node.k.equals(key)){
                value oldValue = node.v;
                node.v=value;
                return oldValue;
            }
        }
        
        //当put第N个元素
        addNode(key, value, index);

        return null;
    }

    private void addNode(key key, value value, int index) {
        //Node<key, value> node = new Node<>(key, value, null);//这个hash组是空的，put第一个元素
        //table[index] = node;

        //老节点对象
        Node node = table[index];
        //再把新的节点对象追加到原先节点头部,形成链表
        table[index] = new Node(key,value,node);
        //每增加一个元素，HashMap内 个数加1
        size++;
    }

    @Override
    public value remove(Object key) {
        return super.remove(key);
    }

    /**
     * 源码中定义了一个节点类对象，用来存放每个数据
     * @param <K>
     * @param <V>
     */
    static class Node<K,V> {

        private K k;
        private V v;
        //用来充当链表
        private Node<K,V> next;

        //可以传入新元素，然后构成链表
        public Node(K k, V v, Node<K, V> next) {
            this.k = k;
            this.v = v;
            this.next = next;
        }

        public K getK() {
            return k;
        }

        public V getV() {
            return v;
        }

        public Node<K, V> getNext() {
            return next;
        }
    }

    public static void main(String[] args){
        MyHashMap<String,String> myHashMap = new MyHashMap<>();
        for (int x=0;x<10;x++){
            myHashMap.put(x+"貂蝉",x+"貂蝉配吕布");
        }
        myHashMap.put("8貂蝉","8貂蝉戏吕布");
        System.out.println(myHashMap.get("8貂蝉"));
        System.out.println(myHashMap.size());
    }

}
```

## HashMap的扩容机制 resize()

- 这一节是整个文章的重点，也是我学习的重点笔记，从这我也理解了为什么阿里规范手册中初始化HashMap的时候要指定大小。

### HashMap的负载因子

1. 负载因子loadFactor保持在0.75f是在时间跟空间上达到一个平衡，实际上也就是说0.75f是效率相对比较高的

### 先说HashMap底层数组长度扩容为什么是2的幂次方数(其实就是为了使hash均匀分组)

1. 它其实涉及到了底层二进制算法，但目的很简单：就是为了使hash均匀分组
2. 当数组长度为2的n次幂的时候，不同的key算得得index相同的几率较小，那么数据在数组上分布就比较均匀，也就是说碰撞的几率小，相对的，查询的时候就不用遍历某个位置上的链表，这样查询效率也就较高了

### 再来说HashMap的resize()

1. 当hashmap中的元素越来越多的时候，碰撞的几率也就越来越高（因为数组的长度是固定的），所以为了提高查询的效率，就要对hashmap的数组进行扩容，数组扩容这个操作也会出现在ArrayList中，所以这是一个通用的操作，很多人对它的性能表示过怀疑，不过想想我们的“均摊”原理，就释然了，而在hashmap数组扩容之后，最消耗性能的点就出现了：原数组中的数据必须重新计算其在新数组中的位置，并放进去，这就是resize()。

2. 那么hashmap什么时候进行扩容呢？当hashmap中的元素个数超过数组大小*loadFactor时，就会进行数组扩容，loadFactor的默认值为0.75，也就是说，默认情况下，数组大小为16，那么当hashmap中元素个数超过16\*0.75=12的时候，就把数组的大小扩展为2\*16=32，即扩大一倍，然后重新计算每个元素在数组中的位置，而这是一个非常消耗性能的操作，所以如果我们已经预知hashmap中元素的个数，那么预设元素的个数能够有效的提高hashmap的性能。比如说，我们有1000个元素new HashMap(1000), 但是理论上来讲new HashMap(1024)更合适，不过扩容是2的幂次方数，即使是1000，hashmap也自动会将其设置为1024。 但是new HashMap(1024)还不是更合适的，因为0.75\*1000 < 1000, 也就是说为了让0.75 * size > 1000, 我们必须这样new HashMap(2048)才最合适，既考虑了&的问题，也避免了resize的问题。  

   > 具体resize()的实现可以看：<https://blog.csdn.net/u010890358/article/details/80496144>

## HashMap面试题

1. hashmap的主要参数都有哪些？

2. hashmap的数据结构是什么样子的？自己如何实现一个hashmap？

3. hash计算规则是什么？

4. 说说hashmap的存取过程？

5. 说说hashmap如何处理碰撞的，或者说说它的扩容？

   ==	[答案](https://www.cnblogs.com/qfxydtk/p/8734784.html)	==

6. 针对 HashMap 中某个 Entry 链太长，查找的时间复杂度可能达到 O(n)，怎么优化？

7. 如果HashMap的大小超过了负载因子(load factor)定义的容量，怎么办？

8. 为什么String, Interger这样的类适合作为键？

9. HashMap与HashTable区别，能否让HashMap同步？

   ==	[答案](<https://blog.csdn.net/u012512634/article/details/72735183>)	==

10. HashMap 的 table 的容量如何确定？loadFactor 是什么？ 该容量如何变化？这种变化会带来什么问题？

11. HashMap 的遍历方式及其性能对比

12. HashMap，LinkedHashMap，TreeMap 有什么区别？

13. HashMap & TreeMap & LinkedHashMap 使用场景？

14. 为什么 ConcurrentHashMap 比 HashTable 效率要高，及ConcurrentHashMap？

    ==	[答案](<https://www.jianshu.com/p/75adf47958a7>)	==

15. [hashMap put()](<https://blog.csdn.net/the_one_and_only/article/details/81665098>)