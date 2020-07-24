---
title: linux自用命令
date: 2020-03-26
tags:
 - linux
categories:
 - 后端
isShowComments: false
publish: true
---

<Boxx/>

工作中常用到的linux命令备份，方便查看。

[[toc]]

<!-- more -->

## 工具

自我备份：[Xshell + Xftp（已破解）](https://note.youdao.com/web/#/file/WEB9a8de91346f2b4dbb81dd5308c02352d/default/WEB07643efa9317a66ad0f564022e4aa0cb/ )

## 切换目录

```shell
# 省
cd /home/yx/server8.5.50/apache-tomcat-8.5.40/webapps/uapclient/WEB-INF/repository/application/plugins/
# 总部
cd /home/yx_zb/phantomjs #phantomjs路径
# 查找包含 2020 的 catalina.out文件所在的行
find ./ -name catalina.out |xargs grep 2020
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

## 文件复制/移动

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

