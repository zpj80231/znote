---
title: Docker的基本了解和使用
date: 2019-04-09 09:56:47
tags:
- Docker
catagories:
- Docker
---

::: tip 鲁迅

改造自己，总比禁止别人来得难

 :::

[[toc]]

## Docker

## 1、简介

**Docker**是一个开源的应用容器引擎；是一个轻量级容器技术；

Docker支持将软件编译成一个镜像；然后在镜像中各种软件做好配置，将镜像发布出去，其他使用者可以直接使用这个镜像；

运行中的这个镜像称为容器，容器启动是非常快速的。

![](/znote/img/docker/搜狗截图20180303145450.png)



![](/znote/img/docker/搜狗截图20180303145531.png)

## 2、核心概念

docker主机(Host)：安装了Docker程序的机器（Docker直接安装在操作系统之上）；

docker客户端(Client)：连接docker主机进行操作；

docker仓库(Registry)：用来保存各种打包好的软件镜像；

docker镜像(Images)：软件打包好的镜像；放在docker仓库中；

docker容器(Container)：镜像启动后的实例称为一个容器；容器是独立运行的一个或一组应用

![](/znote/img/docker/搜狗截图20180303165113.png)

使用Docker的步骤：

1）、安装Docker

2）、去Docker仓库找到这个软件对应的镜像；

3）、使用Docker运行这个镜像，这个镜像就会生成一个Docker容器；

4）、对容器的启动停止就是对软件的启动停止；

## 3、安装Docker

### 1）、安装linux虚拟机

   1）、VMWare、VirtualBox（安装）；

   2）、导入虚拟机文件centos7；（安装linux）

   3）、双击启动linux虚拟机;使用  root/ 123456登陆

   4）、使用客户端连接linux服务器进行命令操作；

   5）、设置虚拟机网络；

​       桥接网络===选好网卡====接入网线；

   6）、设置好网络以后使用命令重启虚拟机的网络

```shell
service network restart
```

   7）、查看linux的ip地址

```shell
ip addr
```

   8）、使用客户端连接linux；

### 2）、在linux虚拟机上安装docker

步骤：

```shell
1、检查内核版本，必须是3.10及以上
uname -r
2、安装docker
yum install docker
3、输入y确认安装
4、启动docker
[root@localhost ~]# systemctl start docker
[root@localhost ~]# docker -v
Docker version 1.12.6, build 3e8e77d/1.12.6
5、开机启动docker
[root@localhost ~]# systemctl enable docker
Created symlink from /etc/systemd/system/multi-user.target.wants/docker.service to /usr/lib/systemd/system/docker.service.
6、停止docker
systemctl stop docker
```

## 4、Docker常用命令&操作

### 1）、镜像操作

| 操作 | 命令                                            | 说明                                                     |
| ---- | ----------------------------------------------- | -------------------------------------------------------- |
| 检索 | docker  search 关键字  eg：docker  search redis | 我们经常去docker  hub上检索镜像的详细信息，如镜像的TAG。 |
| 拉取 | docker pull 镜像名:tag                          | :tag是可选的，tag表示标签，多为软件的版本，默认是latest  |
| 列表 | docker images                                   | 查看所有本地镜像                                         |
| 删除 | docker rmi image-id                             | 删除指定的本地镜像                                       |

https://hub.docker.com/

### 2）、容器操作

软件镜像（QQ安装程序）----运行镜像----产生一个容器（正在运行的软件，运行的QQ）；

步骤：

````shell
1、搜索镜像
[root@localhost ~]# docker search tomcat
2、拉取镜像
[root@localhost ~]# docker pull tomcat
3、根据镜像启动容器
docker run --name mytomcat -d tomcat:latest
4、docker ps
查看运行中的容器
5、 停止运行中的容器
docker stop  容器的id
6、查看所有的容器
docker ps -a
7、启动容器
docker start 容器id
8、删除一个容器
 docker rm 容器id
9、启动一个做了端口映射的tomcat
[root@localhost ~]# docker run -d -p 8888:8080 tomcat
-d：后台运行
-p: 将主机的端口映射到容器的一个端口    主机端口:容器内部的端口

10、为了演示简单关闭了linux的防火墙
service firewalld status ；查看防火墙状态
service firewalld stop：关闭防火墙
11、查看容器的日志
docker logs container-name/container-id

更多命令参看
https://docs.docker.com/engine/reference/commandline/docker/
可以参考每一个镜像的文档

````



### 3）、安装MySQL示例

```shell
docker pull mysql
```



错误的启动

```shell
[root@localhost ~]# docker run --name mysql01 -d mysql
42f09819908bb72dd99ae19e792e0a5d03c48638421fa64cce5f8ba0f40f5846

mysql退出了
[root@localhost ~]# docker ps -a
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS                           PORTS               NAMES
42f09819908b        mysql               "docker-entrypoint.sh"   34 seconds ago      Exited (1) 33 seconds ago                            mysql01
538bde63e500        tomcat              "catalina.sh run"        About an hour ago   Exited (143) About an hour ago                       compassionate_
goldstine
c4f1ac60b3fc        tomcat              "catalina.sh run"        About an hour ago   Exited (143) About an hour ago                       lonely_fermi
81ec743a5271        tomcat              "catalina.sh run"        About an hour ago   Exited (143) About an hour ago                       sick_ramanujan


//错误日志
[root@localhost ~]# docker logs 42f09819908b
error: database is uninitialized and password option is not specified
  You need to specify one of MYSQL_ROOT_PASSWORD, MYSQL_ALLOW_EMPTY_PASSWORD and MYSQL_RANDOM_ROOT_PASSWORD；这个三个参数必须指定一个
```

正确的启动

```shell
[root@localhost ~]# docker run --name mysql01 -e MYSQL_ROOT_PASSWORD=123456 -d mysql
b874c56bec49fb43024b3805ab51e9097da779f2f572c22c695305dedd684c5f
[root@localhost ~]# docker ps
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS               NAMES
b874c56bec49        mysql               "docker-entrypoint.sh"   4 seconds ago       Up 3 seconds        3306/tcp            mysql01
```

做了端口映射

```shell
[root@localhost ~]# docker run -p 3306:3306 --name mysql02 -e MYSQL_ROOT_PASSWORD=123456 -d mysql
ad10e4bc5c6a0f61cbad43898de71d366117d120e39db651844c0e73863b9434
[root@localhost ~]# docker ps
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                    NAMES
ad10e4bc5c6a        mysql               "docker-entrypoint.sh"   4 seconds ago       Up 2 seconds        0.0.0.0:3306->3306/tcp   mysql02
```



几个其他的高级操作

```shell
docker run --name mysql03 -v /conf/mysql:/etc/mysql/conf.d -e MYSQL_ROOT_PASSWORD=my-secret-pw -d mysql:tag
把主机的/conf/mysql文件夹挂载到 mysqldocker容器的/etc/mysql/conf.d文件夹里面
改mysql的配置文件就只需要把mysql配置文件放在自定义的文件夹下（/conf/mysql）

docker run --name some-mysql -e MYSQL_ROOT_PASSWORD=my-secret-pw -d mysql:tag --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci
指定mysql的一些配置参数
```

## 5、其它
- [开发者必备Docker命令](https://mp.weixin.qq.com/s?__biz=MzU1Nzg4NjgyMw==&mid=2247483776&idx=1&sn=736fb79ad59257d1f1e83394ca27e711&chksm=fc2fbd88cb58349ef2134a3bd27e247ae755e619ca3334fbccb3054b47d969e843bbe7ec974b&scene=0&xtrack=1&key=e785e0a87d6a3fb5ef628380ee061d999f263fe68c0b8a6a12698547db89ccc9363668987e16c89de129ba7b6d0add70e5c5db8c5a651f2a090b5af00fff76a1f88190e6701c3255904b64967fa0bafa&ascene=1&uin=MjA2MzU5OTU2Mw%3D%3D&devicetype=Windows+10&version=62060739&lang=zh_CN&pass_ticket=OQ5GV8Pby5xujW5Gd96WhPTByLJqlv0yDsnZzp8FTFYDUgwFUxB2D1l8djC3mpFU)
- [使用Maven插件构建Docker镜像](https://mp.weixin.qq.com/s?__biz=MzU1Nzg4NjgyMw==&mid=2247483781&idx=1&sn=77379ed72d307cdad67495455d487a97&scene=21#wechat_redirect)
- [Docker在Linux下的各种操作](https://mp.weixin.qq.com/s?__biz=MzU1Nzg4NjgyMw==&mid=2247483786&idx=1&sn=33052d6967de1a2c9592b2a1c58b8bef&chksm=fc2fbd82cb583494c5e1a1f079f81c66343514299e44732239f6b85ea25dc6f9947434939529&scene=0&xtrack=1&key=56b40bf83a3314543f1f3d01c17206aff3943f67de059581f61d2ae7d6c835edc5c1bb48a6109125c75aab7f5441c6b97b97af1ecbaf371d40a10f5a2c6a3e4bb9694e7829e3a199ed34fbdb450fe43e&ascene=1&uin=MjA2MzU5OTU2Mw%3D%3D&devicetype=Windows+10&version=62060739&lang=zh_CN&pass_ticket=lmhGQOGOy88Ide7XKyX7SFYdBDE3zSOmHIZAJ3pyAGpeeloWcmqke9BaJeViq%2Bo4)
- [使用Dockerfile为SpringBoot应用构建Docker镜像](https://mp.weixin.qq.com/s?__biz=MzU1Nzg4NjgyMw==&mid=2247483795&idx=1&sn=b46ce4823e2e2b5a2abdec1ca5654800&chksm=fc2fbd9bcb58348dd27656fb81840aeab849b66be8cb7d419afb417c9d5b5733f45ab32ec1d0&scene=0&xtrack=1&key=5184507a09135c09d1d1971fd83d99fe2cf715168c5208de8a298ed8b866bf04788b14a30ca4c3af464585aec08c38f4fa3823e44864db14823e3d4592eaa20a13be8f59431eab70a4069b26d8948ee2&ascene=1&uin=MjA2MzU5OTU2Mw%3D%3D&devicetype=Windows+10&version=62060833&lang=zh_CN&pass_ticket=XKqYMZBWcdrSq1Lcxtwiwc6GHYR6jC5yC0SVVufqiwJjZajHJXYbT06Le4KILTlW)
- [使用Docker Compose部署SpringBoot应用](https://mp.weixin.qq.com/s?__biz=MzU1Nzg4NjgyMw==&mid=2247483800&idx=1&sn=b9e0b6c006bad05e4055a3c0bb61c815&chksm=fc2fbd90cb5834863ceaf2ea924a65b4bec0e631d7836f7b7fa03ba7676ccfc1cda0c1085aeb&scene=0&xtrack=1&key=c3ccbc6d8c9be9e33d962e53afd6a98a7b9f82a618b1b890eeffae404eb8f590cba826ab0d16ae7938811239093f361e70799b8422f4d686a61eb2f0b054f878887719cc0d3e07d22ee7442683701cdc&ascene=1&uin=MjA2MzU5OTU2Mw%3D%3D&devicetype=Windows+10&version=62060833&lang=zh_CN&pass_ticket=4T%2F%2BRJjRiFqp%2BmXHF8wXHdp%2BERMWvSeoTelE12W5yoOQmW6ZHTheDJufJBr2HrVN)