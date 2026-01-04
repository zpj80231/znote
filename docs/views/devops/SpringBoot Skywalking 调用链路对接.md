---
title: SpringBoot Skywalking 调用链路对接
date: 2026-01-04
tags:
- 监控告警
categories:
- 能力扩展 DevOps
isShowComments: true
---

<Boxx/>

<!-- more -->

[[toc]]

## 简介

分布式系统的应用程序性能监控工具，特别为微服务、云原生和基于容器(Kubernetes)架构设计。

* https://github.com/apache/skywalking

* https://skywalking.apache.org

环境：dev，引入监控工具链，Skywalking（微服务调用链路）的构建和部署

版本：Skywalking 8.5.0、Skywalking 9.5.0

8.5 版本成品页面地址：http://120.46.29.140:8888/topology

9.5 版本成品页面地址：http://120.46.29.140:28080/general

### 对接服务列表

![](/znote/img/devops/skywalking/999E64CD-DD2C-4E22-8679-3606FE19C3DA.png)
![](/znote/img/devops/skywalking/image-1.png)

### 服务调用链路（主要）

![](/znote/img/devops/skywalking/image-2.png)

## Skywalking 搭建

### 部署文件

使用 docker 一键部署

```sql
# 可参考 https://github.com/apache/skywalking/blob/master/docker/docker-compose.yml
version: '3.8'

# 网桥 -> 方便相互通讯
networks:
  skywalking:
    ipam:
      driver: default
      config:
        - subnet: "192.168.100.0/24"

services:
  # 应用性能分析 -- 不使用docker的话可下载 https://dlcdn.apache.org/skywalking/9.5.0/apache-skywalking-apm-9.5.0.tar.gz 进行测试
  # 交互式运行容器测试能够正常启动 docker run --privileged --name oap -i -t  -p 12800:12800 -p 11800:11800 registry.cn-hangzhou.aliyuncs.com/zhengqing/skywalking-oap-server:9.5.0 /bin/bash
  oap:
    image: apache/skywalking-oap-server:9.5.0  #registry.cn-hangzhou.aliyuncs.com/zhengqing/skywalking-oap-server:9.5.0 # 原镜像`apache/skywalking-oap-server:9.5.0`
    container_name: oap
    restart: unless-stopped
    privileged: true                    # 获取宿主机root权限
    environment:
      TZ: Asia/Shanghai
      JAVA_OPTS: "-Xmx2048M -Xms2048M"
      # 配置见 https://github.com/apache/skywalking/blob/master/oap-server/server-starter/src/main/resources/application.yml
      SW_STORAGE: elasticsearch # 指定es存储
      SW_STORAGE_ES_CLUSTER_NODES: elasticsearch:9200
      SW_ES_USER: elastic
      SW_ES_PASSWORD: elastic123456 # tips: 密码不能为纯数字，启动会出问题
#    volumes:
#      - "./skywalking/mysql-connector-java-8.0.28.jar:/skywalking/ext-libs/mysql-connector-java-8.0.28.jar"
    ports:
      - "21800:11800" # agent 上报数据的端口，这是 gRPC 端口
      - "22800:12800" # ui 读取数据的端口， 这是 http 端口
    depends_on:
      - elasticsearch
    links:
      - elasticsearch
    networks:
      skywalking:
        ipv4_address: 192.168.100.81

  # 可视化界面
  oap-ui:
    image: apache/skywalking-ui:9.5.0 #registry.cn-hangzhou.aliyuncs.com/zhengqing/skywalking-ui:9.5.0 # 原镜像`apache/skywalking-ui:9.5.0`
    container_name: oap-ui
    restart: unless-stopped
    privileged: true                    # 获取宿主机root权限
    depends_on:
      - oap
    links:
      - oap
    ports:
      - "28080:8080"
    environment:
      SW_OAP_ADDRESS: http://192.168.100.81:12800
      TZ: Asia/Shanghai
    networks:
      skywalking:
        ipv4_address: 192.168.100.82

  # es存储
  elasticsearch:
    image: elasticsearch:7.14.1 #registry.cn-hangzhou.aliyuncs.com/zhengqing/elasticsearch:7.14.1      # 原镜像`elasticsearch:7.14.1`
    container_name: oap-es             # 容器名
    restart: unless-stopped                           # 指定容器退出后的重启策略为始终重启，但是不考虑在Docker守护进程启动时就已经停止了的容器
    volumes:                                  # 数据卷挂载路径设置,将本机目录映射到容器目录
      - "./elasticsearch/data:/usr/share/elasticsearch/data"
      - "./elasticsearch/logs:/usr/share/elasticsearch/logs"
      - "./elasticsearch/config/elasticsearch.yml:/usr/share/elasticsearch/config/elasticsearch.yml"
      #      - "./elasticsearch/config/jvm.options:/usr/share/elasticsearch/config/jvm.options"
      - "./elasticsearch/plugins/ik:/usr/share/elasticsearch/plugins/ik" # IK中文分词插件
    environment:                              # 设置环境变量,相当于docker run命令中的-e
      TZ: Asia/Shanghai
      LANG: en_US.UTF-8
      TAKE_FILE_OWNERSHIP: "true"  # 权限
      discovery.type: single-node
      ES_JAVA_OPTS: "-Xmx512m -Xms512m"
      ELASTIC_PASSWORD: "elastic123456" # elastic账号密码
    ports:
      - "2200:9200"
      - "2300:9300"
    networks:
      skywalking:
        ipv4_address: 192.168.100.83
```

## SpringBoot 对接

### Skywalking Agent 准备

https://skywalking.apache.org/downloads/

### Skywalking Agent 配置文件更新

```sql
# 区分 namespace
agent.namespace=${SW_AGENT_NAMESPACE:DEV}
# 上报地址
collector.backend_service=${SW_AGENT_COLLECTOR_BACKEND_SERVICES:192.168.0.225:21800}
```

### Java 配置文件更改

主要更新启动命令参数。

添加： `-javaagent:/home/dky/agent/skywalking-agent.jar  -DSW\_AGENT\_NAME=cc-dev::dky-ws-adk-1`。

挂载代理插件目录：`- /home/dky/agent:/home/dky/agent`

```sql
  dky-ws-sdk-1:
    build:
      context: ./dky/dky-ws-sdk-1
      dockerfile: Dockerfile
    image: dky/dky-ws-sdk:1.0.0
    container_name: dky-ws-sdk-1
    restart: always
    environment:
      JAVA_OPTS: >
        -Xmx512m 
        -Dserver.port=8111
        -Dspring.cloud.nacos.discovery.ip=192.168.0.10
        -javaagent:/home/dky/agent/skywalking-agent.jar 
        -DSW_AGENT_NAME=cc-dev::dky-ws-adk-1
        -Drocketmq.client.logLevel=OFF
    ports:
      - '8111:8111'
    volumes:
      - /home/dky/dky-ws-sdk/logs:/home/dky/dky-ws-sdk/logs
      - /home/dky/agent:/home/dky/agent
```

## 遇到问题

&#x20;1\. Skywalking 8.5 会有页面空白或持续很长时间没数据的问题。

解决方案：

- 那一套升级到了 9.5 版本
- 同时又发现可以在 Skywalking oap 中添加配置自动清理数据。（待观察）

```sql
# Set a timeout on metrics data.  After the timeout has expired, the metrics data will automatically be deleted.
recordDataTTL: ${SW_CORE_RECORD_DATA_TTL:3} # Unit is day
metricsDataTTL: ${SW_CORE_METRICS_DATA_TTL:7} # Unit is day
```

2. 压测时，发现加入 skywalking-agent 导致 java 服务崩溃假死。具体分析及解决参考我单独开了一篇文章：[Spring Gateway 宕机排查实录：SkyWalking Agent 引发的内存泄漏深度分析](https://zpj80231.github.io/znote/views/backend/SpringGateway%E5%AE%95%E6%9C%BA%E6%8E%92%E6%9F%A5.html)

## 后续计划

1. 观察 Skywalking 页面空白卡死的情况和数据自动清理的情况（没问题）。

<Reward/>