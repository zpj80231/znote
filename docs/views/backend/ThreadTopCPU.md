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

找出某个Java进程中最耗费CPU的Java线程并定位堆栈信息，用到的命令有：ps、top、printf、jstack、grep。当然还有神器：arthas。

<!-- more -->

[[toc]]

## 问题原因

现实企业级Java应用开发、维护中，有时候我们会碰到下面这些问题：

- OutOfMemoryError，内存不足
- 内存泄露
- 线程死锁
- 锁争用（Lock Contention）
- Java进程消耗CPU过高
  ......

这些问题在日常开发、维护中可能被很多人忽视（比如有的人遇到上面的问题只是重启服务器或者调大内存，而不会深究问题根源），但能够理解并解决这些问题是Java程序员进阶的必备要求。

##  传统排查步骤

### jps

jps主要用来输出JVM中运行的进程状态信息。语法格式如下：

```shell
jps [options] [hostid]
```

如果不指定hostid就默认为当前主机或服务器。

命令行参数选项说明如下：

```shell
-q 不输出类名,Jar名和传入main方法的参数

-m 输出传入main方法的参数

-l 输出main类或Jar的全限名

-v 输出传入JVM的参数
```

比如下面：

```shell
root@ubuntu:/# jps -m -l
2458 org.artifactory.standalone.main.Main /usr/local/artifactory-2.2.5/etc/jetty.xml
29920 com.sun.tools.hat.Main -port 9998 /tmp/dump.dat
3149 org.apache.catalina.startup.Bootstrap start
30972 sun.tools.jps.Jps -m -l
8247 org.apache.catalina.startup.Bootstrap start
25687 com.sun.tools.hat.Main -port 9999 dump.dat
21711 mrf-center.jar
```

### jstack

jstack主要用来查看某个Java进程内的线程堆栈信息。语法格式如下：

```shell
jstack [option] pid
jstack [option] executable core
jstack [option] [server-id@]remote-hostname-or-ip
```

命令行参数选项说明如下：

```shell
# 会打印出额外的锁信息
# 在发生死锁时可以用 jstack -l pid 来观察锁持有情况
# -m mixed mode，不仅会输出Java堆栈信息，还会输出C/C++堆栈信息（比如Native方法）
-l long listings
```

jstack可以定位到线程堆栈，根据堆栈信息我们可以定位到具体代码，所以它在JVM性能调优中使用得非常多。

下面我们来一个实例找出某个Java进程中最耗费CPU的Java线程并定位堆栈信息，用到的命令有ps、top、printf、jstack、grep。

---

**第一步：** 先找出Java进程ID，服务器上的Java应用名称为 wordcount.jar：

 ```shell
[root@storm-master home] ps -ef | grep wordcount
root    2860  2547 13 02:09 pts/0  00:02:03 java -jar wordcount.jar /home/input 3 
 ```

得到进程ID为 2860 。

---

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

---

**第三步：** 终于轮到jstack上场了，它用来输出进程2860的堆栈信息，然后根据线程ID的十六进制值grep，如下：

 ```shell
[root@storm-master home] jstack 2860 | grep b98 
"SessionTracker" prio=10 tid=0x00007f55a44e4800 nid=0xb53 in Object.wait() [0x00007f558e06c000 
 ```

可以看到CPU消耗在SessionTracker这个类的Object.wait()，于是就能很容易的定位到相关的代码了。

当然，可以 `jstack -l pid > /tmp/thread.txt` 在导出的文件中搜索，就可以定位到具体的线程，类。

---

## Arthas 排查

### jdk 环境

1. 下载并解压 arthas

   ```shell
   cd /opt/arthas
   
   wget -O arthas-packaging-4.0.5-bin.zip 'https://maven.aliyun.com/repository/public/com/taobao/arthas/arthas-packaging/4.0.5/arthas-packaging-4.0.5-bin.zip'
   
   unzip arthas-packaging-4.0.5-bin.zip
   ```

2. 启动 arthas，[官网传送门](https://arthas.aliyun.com/doc/quick-start.html#_2-%E5%90%AF%E5%8A%A8-arthas)

   ```shell
   # https://arthas.aliyun.com/doc/quick-start.html#_2-%E5%90%AF%E5%8A%A8-arthas
   java -jar arthas-boot.jar
   ```

   输入 `dashboard`，按 `回车/enter`，会展示当前进程的信息， 按 `ctrl+c` 可以中断执行。[dashboard 传送门](https://arthas.aliyun.com/doc/dashboard.html)

   ![arthas-dashboard.png](/znote/img/backend/arthas/arthas-dashboard.png)

   或者输入 `thread -n 10`，指定最忙的前 10 个线程并打印堆栈。[thread 传送门](https://arthas.aliyun.com/doc/thread.html)

   ![arthas-thread.png](/znote/img/backend/arthas/arthas-thread.png)

3. 最后根据线程堆栈并分析业务代码，定位问题即可

### jre 环境

如果是在 docker 里并且使用的是 jre 启动项目的话，需要 jre 结合 jattach 来使用 arthas：

1. 不同系统 jattach 项目安装和配置指南，[传送门](https://blog.csdn.net/gitblog_01239/article/details/143042639)

   ```shell
   apt install jattach
   ```

2. 找出 java 进程 pid

   ```shell
   ps aux | grep java
   ```

   ![arthas-java-pid.png](/znote/img/backend/arthas/arthas-java-pid.png)

   这里以 pid 是 7 的举例

3. 需要使用如下命令启动 arthas

   ```shell
   pid=7;\
   jattach ${pid} load instrument false /opt/arthas/arthas-agent.jar && \
   java -jar /opt/arthas/arthas-client.jar 127.0.0.1 3658
   ```

4. 启动成功，使用 arthas 命令如 `dashboard` 和 `thread` 进行分析即可

### 常用命令速查表（Arthas）

![arthas_command.png](/znote/img/backend/arthas/arthas_command.png)

## 其他命令排查

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

1. 阿里开源的 [Arthas](https://arthas.aliyun.com/)

2. 看了下有位大佬提个 [issue](https://github.com/emacsist/emacsist.github.io/issues/2) ，推荐了个自动化脚本，亲测更好用点。这样子就可以免去上面的一步一步地查找和计算了。
   所以，这里也直接引用这个工具。有需要的可以用下。<br/>
   [show-busy-java-threads](https://github.com/oldratlee/useful-scripts/blob/master/docs/java.md#beer-show-busy-java-threads)

