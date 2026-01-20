---
title: SpringBoot Nightingale 飞书告警
date: 2026-01-20
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

**环境：** 在现有监控基础上，添加 Nightingale 告警集成 和 飞书告警

**版本：** 最新版。官网：https://n9e.github.io/。

夜莺监控（Nightingale）是一款侧重告警的监控类开源项目。类似 Grafana 的数据源集成方式，夜莺也是对接多种既有的数据源，不过 Grafana 侧重在可视化，夜莺是侧重在告警引擎、告警事件的处理和分发。

> 夜莺监控项目，最初由滴滴开发和开源，并于 2022 年 5 月 11 日，捐赠予中国计算机学会开源发展委员会（CCF ODC），为 CCF ODC 成立后接受捐赠的第一个开源项目。

**监控：**

* 监控，页面地址：http://124.70.95.70/grafana/d/sbapmwalker/springboot-apm-dashboard?orgId=1\&from=now-30m\&to=now

**告警：**

* 告警，Nightingale 控制台：http://120.46.29.140:17000/metric/explorer

夜莺的侧重点是做告警引擎，即负责产生告警事件，并根据规则做灵活派发，内置支持 20 种通知媒介（电话、短信、邮件、钉钉、飞书、企微、Slack 等）。

## 搭建

```yaml
networks:
  nightingale:
    driver: bridge

services:
  mysql:
    image: "mysql:8"
    container_name: mysql
    hostname: mysql
    restart: always
    environment:
      TZ: Asia/Shanghai
      MYSQL_ROOT_PASSWORD: 1234
    volumes:
      - ./mysqldata:/var/lib/mysql/
      - ../initsql:/docker-entrypoint-initdb.d/
      - ./etc-mysql/my.cnf:/etc/my.cnf
    networks:
      - nightingale
    ports:
      - "3306:3306"

  redis:
    image: "redis:6.2"
    container_name: redis
    hostname: redis
    restart: always
    environment:
      TZ: Asia/Shanghai
    networks:
      - nightingale
    ports:
      - "6379:6379"

  # prometheus:
  #   image: prom/prometheus
  #   container_name: prometheus
  #   hostname: prometheus
  #   restart: always
  #   environment:
  #     TZ: Asia/Shanghai
  #   volumes:
  #     - ./etc-prometheus:/etc/prometheus
  #   command:
  #     - "--config.file=/etc/prometheus/prometheus.yml"
  #     - "--storage.tsdb.path=/prometheus"
  #     - "--web.console.libraries=/usr/share/prometheus/console_libraries"
  #     - "--web.console.templates=/usr/share/prometheus/consoles"
  #     - "--enable-feature=remote-write-receiver"
  #     - "--query.lookback-delta=2m"
  #   networks:
  #     - nightingale
  #   ports:
  #     - "9090:9090"

  victoriametrics:
    image: victoriametrics/victoria-metrics:v1.79.12
    container_name: victoriametrics
    hostname: victoriametrics
    restart: always
    environment:
      TZ: Asia/Shanghai
    ports:
      - "8428:8428"
    networks:
      - nightingale
    command:
      - "--loggerTimezone=Asia/Shanghai"

  nightingale:
    image: flashcatcloud/nightingale:latest
    container_name: nightingale
    hostname: nightingale
    restart: always
    environment:
      GIN_MODE: release
      TZ: Asia/Shanghai
      WAIT_HOSTS: mysql:3306, redis:6379
    volumes:
      - ./etc-nightingale:/app/etc
    networks:
      - nightingale
    ports:
      - "17000:17000"
      - "20090:20090"
    depends_on:
      - mysql
      - redis
      - victoriametrics
    command: >
      sh -c "/app/n9e"

  categraf:
    image: "flashcatcloud/categraf:latest"
    container_name: "categraf"
    hostname: "categraf01"
    restart: always
    environment:
      TZ: Asia/Shanghai
      HOST_PROC: /hostfs/proc
      HOST_SYS: /hostfs/sys
      HOST_MOUNT_PREFIX: /hostfs
      WAIT_HOSTS: nightingale:17000, nightingale:20090
    volumes:
      - ./etc-categraf:/etc/categraf/conf
      - /:/hostfs
    networks:
      - nightingale
    depends_on:
      - nightingale
```

执行命令 \`docker-compose up -d\`，启动夜莺。

![](/znote/img/devops/nightingale/image.png)

## 基础组件

介绍一下夜莺的基础组件，介绍一下用夜莺告警的基本流程是怎么样的。

### 添加数据源

![](/znote/img/devops/nightingale/image-1.png)

### 权限配置

![](/znote/img/devops/nightingale/image-2.png)

基本规则是：

* 用户绑定权限

* 团队绑定用户

* 业务组绑定团队

### 告警通知

主要是各种消息通知的配置，如邮件告警、企微告警、钉钉告警、飞书告警等。

这里简单了解下。后续我们会详细配置一个飞书告警通知。

![](/znote/img/devops/nightingale/image-3.png)

### 告警管理

主要是配置告警规则，然后跟配置的告警渠道进行绑定。

详细的规则配置我们下面再介绍。

![](/znote/img/devops/nightingale/image-4.png)



## 飞书告警通知配置

主要分为通知媒介、消息模板、通知规则 3 块。

* 通知媒介：定义通知是飞书、企微还是钉钉等，做一些简单的通用配置

* 消息模版：方便添加不同样式或不同格式的告警内容模版

* 通知规则：绑定通知媒介和消息模版

### 通知媒介

定义飞书的基本通知定义：主要就是定义固定的模板、占位符等。

如将 飞书token 作为变量配置，方便后续不同通知规则配置不同的token，进行多个飞书群的通知。

![](/znote/img/devops/nightingale/image-5.png)

![](/znote/img/devops/nightingale/image-6.png)

### 消息模版

方便添加不同样式或不同格式的告警内容模版。

如飞书支持 文本类消息 和 html类消息。

![](/znote/img/devops/nightingale/image-7.png)

这里我们新增一个专属于 cloud 的飞书卡片类消息模板：

![](/znote/img/devops/nightingale/image-8.png)

模版内容：

```bash
S{{$event.Severity}} {{if $event.IsRecovered}}✅【告警恢复】{{else}}⚠️【触发告警】{{end}}   
{{- if $event.IsRecovered -}}
{{- if ne $event.Cate "host" -}}
{{end}}   
{{if $labels.project }}**平台信息:** {{ $labels.project }} {{ $labels.env }}  {{end}}   
**服务信息:** {{ $labels.job }}, {{ $labels.instance }}   
**恢复时间:** {{timeformat $event.LastEvalTime}}   
**告警描述:** {{$event.RuleName}} 已恢复   
{{- else }}
{{- if ne $event.Cate "host"}}   
{{end}}   
{{if $labels.project }}**平台信息:** {{ $labels.project }} {{ $labels.env }}  {{end}}   
**服务信息:** {{ $labels.job }}, {{ $labels.instance }} 
**触发时间:** {{timeformat $event.TriggerTime}}    
**触发时值:** {{$event.TriggerValue}}   
{{if $event.RuleName }}**告警描述:** {{$event.RuleName}}{{end}}   
{{- end -}}

{{$domain := "http://120.46.29.140:17000" }}   
[事件详情]({{$domain}}/alert-his-events/{{$event.Id}})｜[查看曲线]({{$domain}}/metric/explorer?data_source_id={{$event.DatasourceId}}&data_source_name=prometheus&mode=graph&prom_ql={{$event.PromQl|escape}})
```

### 通知规则

主要用于绑定通知媒介和消息模板。

这样我们可以创建多个通知规则，方面后面配置告警规则的时候进行绑定，触发告警时可以有多种通知或不同的通知效果。

![](/znote/img/devops/nightingale/image-9.png)

## 告警规则配置

这里我们新增一个 服务宕机 规则为例。

主要分为：基础配置、规则配置、生效配置、通知配置这几步。

### 基础配置

![](/znote/img/devops/nightingale/image-10.png)

### 规则配置

数据源选择 Prometheus，告警条件为 dky 模块，每 15 秒执行一次，如果持续时长超过 30 秒，那么就触发告警。

![](/znote/img/devops/nightingale/image-11.png)

### 生效配置

配置生效时间为：周一到周日，每天的 07:00 到 20:59。

![](/znote/img/devops/nightingale/image-12.png)

### 通知配置

通知规则选择我们之前创建的飞书告警。

启用恢复通知：告警恢复时是否也发送通知

留观时长（秒）：60。持续 60 秒没有再次触发阈值才发送恢复通知

重复通知间隔（分钟）：60。如果告警持续未恢复，间隔 60 分钟之后重复提醒告警接收组的成员

最大发送次数：0。如果值为0，则不做最大发送次数的限制

![](/znote/img/devops/nightingale/image-13.png)

## Prometheus 告警规则导入

当然除了自定义告警规则外，也可以从 Prometheus 导入。直接导入即可，这里不多做介绍。

![](/znote/img/devops/nightingale/image-14.png)

## 配置测试

### 触发告警

重启 java 服务，查看是否会触发通知。（当然前提是 java 服务已被 Prometheus 监控）

![](/znote/img/devops/nightingale/image-15.png)

### 查看飞书通知

![](/znote/img/devops/nightingale/image-16.png)

![](/znote/img/devops/nightingale/image-17.png)

可以看到，哪个平台、什么环境、哪个模块、什么时间。触发告警、告警恢复已经成功进行飞书通知。

### 事件详情

点击 **事件详情**，会直接跳转到浏览器，显示详细的告警信息：

http://120.46.29.140:17000/alert-his-events/2758

![](/znote/img/devops/nightingale/image-18.png)

### 查看曲线

点击 **查看曲线**，也会直接跳转到浏览器，显示历史告警曲线：

http://120.46.29.140:17000/metric/explorer?data\_source\_id=1\&data\_source\_name=prometheus\&mode=graph\&prom\_ql=up%7Bjob=\~%22dky-.%2A%22%7D%20==%200

![](/znote/img/devops/nightingale/image-19.png)

<Reward/>



