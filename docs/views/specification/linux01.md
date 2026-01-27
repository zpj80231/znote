---
title: linux 自用命令
date: 2020-03-26
tags:
 - linux
categories:
 - 规范 Standard
isShowComments: true
publish: true
---

<Boxx/>

工作中常用到的linux命令备份，方便查看。

[[toc]]

<!-- more -->

## 工具

自我备份：[Xshell + Xftp（已破解）](https://note.youdao.com/web/#/file/WEB9a8de91346f2b4dbb81dd5308c02352d/default/WEB07643efa9317a66ad0f564022e4aa0cb/ )

## 常用命令

### **tail**

很多新手习惯用 `cat`，但对于大文件，`cat` 会导致屏幕刷屏，还容易把终端卡死。`tail` 才是实时监控的神器。

**真实场景 A：服务发版启动监控**

每次发版重启服务时，我们都需要确认 Spring Boot 是否启动成功，或者有没有初始化报错。

```shell
# -f (follow)：实时追加显示文件尾部内容
tail -f logs/application.log
```

**真实场景 B：配合测试复现 Bug**

测试同学说：我现在点一下按钮，你看看后台有没有报错。

此时不需要看历史日志，只需要盯着最新的输出。

```shell
# 只看最后 200 行，并保持实时刷新，避免被历史日志干扰
tail -n 200 -f logs/application.log
```

### **less**

如果需要查看之前的日志，推荐使用 `less`。不同于 `vim` 会一次性加载整个文件占用大量内存，`less` 是按需加载，打开几个 G 的文件也极其流畅，且支持向后回溯。

**真实场景：追查某笔客诉订单**

运营反馈：刚才 10 点左右，订单号 `ORD12345678` 支付失败了。

你需要从日志末尾开始，往前反向查找这个订单号。

```shell
less logs/application.log
```

**进入界面后的操作流：**

1. `Shift + G` 先跳到日志最末尾（因为报错通常发生在最近）。
2. `?ORD12345678` 输入问号+订单号，**向上反向搜索**。
3. `n`：如果当前这行不是关键信息，按 `n` 继续向上找上一次出现的位置。
4. `Shift + F` 如果看着看着，日志又更新了，按这个组合键可以让 less 进入类似 `tail -f` 的实时滚动模式；按 `Ctrl + C` 退回浏览模式。

### **grep**

`grep` 是最常用的搜索命令，但在实际业务中，简单的关键词搜索往往不够用。

**真实场景 A：还原报错现场（重点）**

只看到 `NullPointerException` 这一行往往无法定位问题，我们需要知道**报错前**的请求参数是什么，**报错后**的堆栈信息是什么。

此时必须配合 `-C` (Context) 参数。

```shell
# 搜索异常关键字，并显示该行 "前后各 20 行"
grep -C 20 "NullPointerException" logs/application.log
```

**真实场景 B：全链路追踪 TraceId**

微服务我们通常会通过 `TraceId` 串联请求。日志文件可能发生了滚动（Rolling），变成了 `app.log`、`app.log.1`、`app.log.2`。

我们需要在所有日志文件中搜索同一个 TraceId。

```shell
# 搜索当前目录下所有以 app.log 开头的文件
grep "TraceId-20251219001" logs/app.log*
```

**真实场景 C：统计异常频次**

老板问：“Redis 超时异常今天到底发生了多少次？是偶发还是大规模？”

不需要数数，直接统计行数。

```shell
# -c (count)：只统计匹配的行数
grep -c "RedisConnectionException" logs/application.log
```

**真实场景 D：排除干扰噪音**

排查问题时，日志里充斥着大量无关的 `INFO` 心跳日志或健康检查日志，严重干扰视线。

```shell
# -v (invert)：显示不包含 "HealthCheck" 的所有行
grep -v "HealthCheck" logs/application.log
```

###  **sed**

有时候日志非常大，例如有 10GB，grep 搜出来的内容依然过多。如果我们明确知道生产事故发生在 **14:00 到 14:05** 之间，该怎么办？

下载整个日志不现实，`sed` 可以帮我们把这段时间的日志单独**切**出来，保存成一个小文件慢慢分析。

**真实场景：导出事故时间窗口的日志**

```shell
# 语法：sed -n '/开始时间/,/结束时间/p' 源文件 > 目标文件
# 注意：时间格式必须和日志里的格式完全一致
sed -n '/2025-12-19 14:00/,/2025-12-19 14:05/p' logs/application.log > error_segment.log
```

这样你就得到了一个只有几 MB 的 `error_segment.log`，这时候再下载到本地分析，或者发给同事，都非常方便。

### **awk**

`awk` 擅长处理列数据，对于格式规范的日志，如 Nginx 访问日志、Apache 日志，它可以直接在服务器上生成简报。

**真实场景 A：遭到攻击，查找恶意 IP**

服务突然报警 CPU 飙升，怀疑遭到 CC 攻击或爬虫抓取，我们需要分析 Nginx 日志，找出访问量最高的 IP。

假设日志格式第一列是 IP：

```shell
# 1. awk '{print $1}'：提取第一列（IP）
# 2. sort：排序，把相同的 IP 排在一起
# 3. uniq -c：去重并统计每个 IP 出现的次数
# 4. sort -nr：按次数(n)倒序(r)排列
# 5. head -n 10：取前 10 名

awk '{print $1}' access.log | sort | uniq -c | sort -nr | head -n 10
```

**真实场景 B：找出响应最慢的接口**

Nginx 日志中通常记录了响应时间，假设在最后一列，我们想把响应时间超过 1 秒的请求找出来。

```shell
# $NF 代表最后一列
# 打印所有响应时间大于 1 秒的 URL（假设 URL 在第 7 列）
awk '$NF > 1.000 {print $7, $NF}' access.log
```

## 文件内容查找

```shell
# 查找文件夹下或某个文件包含某字符的所有文件
# -r 是递归查找
# -n 是显示行号
# -C 5 显示file文件里匹配字串那行以及上下5行
# -B 5 显示前5行
# -A 5 显示后5行
# --include '*.html' 指定后缀名
grep -rn "message" ./
# 实时显示日志记录
tail -100f a.log
# tail和多个grep使用
tail -100f a.log | grep --line-buffer aa | grep bb
# 查找包含 2020 的 catalina.out文件所在的行
find ./ -name catalina.out | xargs grep 2020
# grep之后，按行统计行数 wc -l
find ./ -name catalina.out | xargs grep 2020 | wc -l
# 查看当前路径下各个目录大小(后面也可以跟指定目录)， -h 以K，M，G为单位，提高信息的可读性。
du -sh *
# 查找当前目录下的大文件并倒叙排列
du -sh * | sort -nr | head 
```

## 根据pid查程序目录

```shell
ps -ef | grep redis
# root     14145     1  0 Jul08 ?        00:17:14 ./redis-server *:6379
ls -al /proc/14145/exe
# lrwxrwxrwx. 1 root root 0 7月 31 05:10 /proc/14145/exe -> /usr/local/bin/redis-server
```

## Tomcat

  ```shell
  # 查看tomcat是否启动，并查看tomcat端口号
  ps -ef| grep tomcat
  sudo netstat -apn | grep 7507  
  netstat –pan | grep XXXX  (此处XXXX为pid)
  # 重启tomcat
  cd /home/yx/server8.5.50/apache-tomcat-8.5.40/bin
  sh shutdown.sh
  sh startup.sh
  # 有时关闭服务操作不成功，强制删掉后台进程
  kill -9 7010
  # 实时查看tomcat运行日志
  cd /home/yx/server8.5.50/apache-tomcat-8.5.40/logs
  tail -f -n 500 catalina.out #查看日志，同样Ctrl+c退出
  # 清缓存
  cd /home/yx/server8.5.50/apache-tomcat-8.5.40/work
  rm -rf Catalina
  # 截取日志 （前提是 catalina.out 日志中的每行都是以日期格式开头的）
  sed -n '/^2012-05-15/,/^2012-05-16/p' catalina.out > catalina_20120515.out
  ```

## 权限

```shell
#给文件的所有者加上 x 权限,即可使用:
chmod   u+x   文件
#查看文件权限
ls  -l   文件
```

> 参考：[ 白小黑..](https://blog.csdn.net/weixin_42711549/article/details/81156370)

## 文件复制/移动/大小

```shell
#复制文件夹 -r
cp -r a文件夹 b新文件夹
#将/test1目录下的file1复制到/test3 目录，并将文件名改为file2
mv /test1/file1 /test3/file2
```

## 上传下载

```shell
yum -y install lrzsz #安装
rz #上传
sz #下载
```

## 压缩解压

```shell
#压缩指定文件夹为 tar.bz2
[root@db phantomjs]# tar -cjf echarts-convert.tar.bz2 echarts-convert/
#解压 tar.bz2
[root@db yx_zb]# tar -xjvf echarts-convert.tar.bz2
```

## 建立软链接

```shell
ln -s /usr/PhantomJS/phantomjs-2.1.1-linux-x86_64/bin/phantomjs /usr/bin/phantomjs
```

## 更改环境变量

```shell
vim /etc/profile #编辑
source /etc/profile #重启使环境变量生效
```

## 端口/防火墙

```shell
netstat -ntlp   #查看当前所有tcp端口
netstat -ntulp |grep 80   #查看所有80端口使用情况

#开放端口： 1.修改 /etc/sysconfig/iptables 文件
# 2.如开放80端口,ACCEPT为开启、DROP为关闭
iptables -A INPUT -p tcp --dport 80 -j ACCEPT #当数据从外部进入服务器为目标端口
iptables -A OUTPUT -p tcp --sport 80 -j ACCEPT #数据从服务器出去
service iptables save #保证重启服务器后也不会失效

service iptables restart #改完后重启防火墙
/sbin/iptables -L -n #查看开放的端口
```

## 禁IP

```shell
iptables -A INPUT -p tcp -s 192.168.1.2 -j DROP
```

<Reward/>
