---
title: ArrayList底层实现和原理
date: 2017-06-13 20:53:26
tags:
- "源码分析"
- Java
categories:
- "后端"
isShowComments: false
---

<Boxx/>

ArrayList可以简单的看作是动态数组，相对于普通的数组它可以动态的增加容量或者减少容量。要注意的是ArrayList并不是线程安全的，因此一般建议在单线程中使用ArrayList。

<!-- more -->

[[toc]]

## ArrayList底层简介

- ArrayList是List接口的一个可变大小的数组的实现
- ArrayList的内部是使用一个Object对象数组来存储元素的
- 初始化ArrayList的时候，可以指定初始化容量的大小，如果不指定，就会使用默认大小，为10
- 当添加一个新元素的时候，首先会检查容量是否足够添加这个元素，如果够就直接添加，如果不够就进行扩容，扩容为原数组容量的1.5倍（1.7以后）
- 当在index处放置一个元素的时候，会将数组index处右边的元素全部右移
- 当在index处删除一个元素的时候，会将数组index处右边的元素全部左移

## 手写一个简单的MyArrayList

```java
package com.zpj.electric.SourceCodeAnalysis;

/**
 * Created by admin on 2017/6/10.
 */
public class MyArrayList {

    //ArrayList有一个专门用来装元素的容器，为了保证集合什么类型的数据都可存储，所以定义的Object[]
    public Object[] data;
    //ArrayList里还有一个属性，用来记录集合元素的个数
    public int size;

    /**
     * 有参构造方法
     *
     * @param x 指定数组大小
     */
    public MyArrayList(int x) {
        if (x > 0) {
            data = new Object[x];
        } else {
            System.out.println("参数异常");
        }
    }

    /**
     * 如果指定数组大小，默认10个
     */
    public MyArrayList() {
        this(10);
    }

    /**
     * 得到集合的大小  如：int x = list.size();
     *
     * @return
     */
    public int size() {
        return size;
    }

    /**
     * 往集合中添加元素 如：list.add(Object obj);
     *
     * @param obj
     */
    public void add(Object obj) {
        //当我们往集合中添加元素的时候，obj最终都会添加进Object[]数组中去
        //所以每次添加数据的时候都需要判断Object[],即data数组有没有填满
        if (data.length == size) {
            //如果填满了，那么需要扩容:
            // jdk1.7之前：size*3/2+1
            // jdk1.7及之后：size+(size>>1)
            Object[] temp = new Object[size + (size >> 1)];
            //扩容后将老数组复制到新数组里
            System.arraycopy(data, 0, temp, 0, size);
            //改变引用指向 gc回收老数组对象
            data = temp;
        } else {
            data[size] = obj;
            size++;
        }
    }

    /**
     * 按指定下标删除集合中的元素
     *
     * @param index
     */
    public void remove(int index) {
        //System.arraycopy(要被复制的老数组，从下标index开始复制，要复制到的新数组，从新数组的下标index插入,从老数组下标开始要被复制的个数);
        System.arraycopy(data, index + 1, data, index, size - (index + 1));
        size--;
    }

    /**
     * 指定元素删除集合中的元素
     *
     * @param obj
     */
    public void remove(Object obj) {
        //每当指定元素删除的时候，底层会拿着obj和每个元素做equals比较
        for (int x = 0; x < size; x++) {
            if (obj.equals(data[x])) {
                remove(x);//按下标删除元素
                break;//一个remove方法只能删除一个对象
            }
        }
    }

    /**
     * 根据指定下标获得元素
     *
     * @param x
     * @return
     */
    public Object get(int x) {
        return x >= 0 && x < size ? data[x] : "参数越界异常";
    }

}

class TestMyArrayList {
    public static void main(String[] args) {
        MyArrayList myArrayList = new MyArrayList();
        myArrayList.add(234);
        myArrayList.add("john");
        myArrayList.add("demon");
        myArrayList.add("alex");
        System.out.println(myArrayList.size());
        System.out.println(myArrayList.get(2));

        myArrayList.remove(1);
        System.out.println(myArrayList.size());

        MyArrayList myArrayList1 = new MyArrayList(20);
        System.out.println(myArrayList1.data.length);
    }
}
```

> ArrayList其他方法如add(int index, E element)，contains(E)可以去看：https://blog.csdn.net/aizhuyanwei/article/details/78493495

## ArrayList的线程安全性

对ArrayList进行添加元素的操作的时候是分两个步骤进行的，即第一步先在object[size]的位置上存放需要添加的元素；第二步将size的值增加1。由于这个过程在多线程的环境下是不能保证具有原子性的，因此ArrayList在多线程的环境下是线程不安全的。

具体举例说明：在单线程运行的情况下，如果Size = 0，添加一个元素后，此元素在位置 0，而且Size=1；而如果是在多线程情况下，比如有两个线程，线程 A 先将元素存放在位置0。但是此时 CPU 调度线程A暂停，线程 B 得到运行的机会。线程B也向此ArrayList 添加元素，因为此时 Size 仍然等于 0 （注意哦，我们假设的是添加一个元素是要两个步骤哦，而线程A仅仅完成了步骤1），所以线程B也将元素存放在位置0。然后线程A和线程B都继续运行，都增 加 Size 的值。  那好，现在我们来看看 ArrayList 的情况，元素实际上只有一个，存放在位置 0，而Size却等于 2。这就是“线程不安全”了。

如果非要在多线程的环境下使用ArrayList，就需要保证它的线程安全性，通常有两种解决办法：第一，使用synchronized关键字；第二，可以用Collections类中的静态方法synchronizedList();对ArrayList进行调用即可。

## ArrayList和LinkedList、Vector的优缺点？

- ArrayList底层是数组结构，查询快，增删慢，线程不安全，效率高

- LinkedList底层是链表数据结构，查询慢，增删快，线程不安全，效率高

- Vector底层是数组结构，查询快，增删慢，线程安全，效率低