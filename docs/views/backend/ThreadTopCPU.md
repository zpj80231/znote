---
title: 找出某个Java进程中最耗费CPU的Java线程
date: 2021-12-06
tags:
  - 多线程
  - Java
categories:
  - 后端 Back-end
isShowComments: true
---

<Boxx/>

找出某个Java进程中最耗费CPU的Java线程并定位堆栈信息，用到的命令有：ps、top、printf、jstack、grep。

<!-- more -->

[[toc]]

##  排查步骤

**第一步：** 先找出Java进程ID，服务器上的Java应用名称为 wordcount.jar：

 ```shell
 [root@storm-master home] ps -ef | grep wordcount
 root    2860  2547 13 02:09 pts/0  00:02:03 java -jar wordcount.jar /home/input 3 
 ```

得到进程ID为 2860 。

**第二步：** 找出该进程内最耗费CPU的线程，可以使用如下3个命令，这里我们使用第3个命令得出如下结果：

1. ps -Lfp pid ： 即 ps -Lfp 2860 

2. ps -mp pid -o THREAD, tid, time ：即 ps -mp 2860 -o THREAD,tid,time 

3. top -Hp pid： 即 <strong>top -Hp 2860</strong> 

这里用第三个命令：` top -Hp 2860 `

```shell
top -Hp 2860
```

输出如下：  


![img](/znote/img/backend/ThreadTopCpuList.png)

TIME列就是各个Java线程耗费的CPU时间，显然CPU时间最长的是ID为2968的线程，用

```shell
printf "%x\n" 2968
```

得到2968的十六进制值为b98，下面会用到。   

**第三步：** 终于轮到jstack上场了，它用来输出进程2860的堆栈信息，然后根据线程ID的十六进制值grep，如下：

 ```shell
 [root@storm-master home] jstack 2860 | grep b98 
 "SessionTracker" prio=10 tid=0x00007f55a44e4800 nid=0xb53 in Object.wait() [0x00007f558e06c000 
 ```

可以看到CPU消耗在SessionTracker这个类的Object.wait()，于是就能很容易的定位到相关的代码了。

当然，可以 `jstack -l pid > /tmp/thread.txt` 导出的文件中搜索，就可以定位到具体的线程，类。

## 其他问题排查

**查看某进程及某线程占用 CPU 的例子**

- `jps`: 列出 java 进程,找到 pid.
- `pidstat -p pid -u 1 3 -u -t`: 查看 pid 的进程所有线程的 cpu 使用情况.
- `jstack -l pid > /tmp/thread.txt`: 导出指定 Java 应用的所有线程.

然后查看 `nid=xxx`(即第二步里线程号的线程),即可定位到某段代码.

**查看某进程及某线程占用 IO 的例子**

- `jps`: 列出 java 进程,找到 pid.
- `pidstat -p pid -u 1 3 -d -t`: 查看 pid 的进程所有线程的 IO 使用情况.
- `jstack -l pid > /tmp/thread.txt`: 导出指定 Java 应用的所有线程.

然后查看 `nid=xxx`(即第二步里线程号的线程),即可定位到某段代码.

## 相关脚本

1. 阿里开源的 Arthas

2. 看了下有位大神提个 [issue](https://github.com/emacsist/emacsist.github.io/issues/2) , 推荐了个自动化脚本, 亲测更好用点. 这样子就可以免去上面的一步一步地查找和计算了.
   所以, 这里也直接引用这个工具, 有需要的可以用下.<br/>
   [show-busy-java-threads](https://github.com/oldratlee/useful-scripts/blob/master/docs/java.md#beer-show-busy-java-threads)
