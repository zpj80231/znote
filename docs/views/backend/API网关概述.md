---
title: API网关概述
date: 2021-07-01
tags:
    - 分布式
    - 网关
categories:
    - 后端
isShowComments: true
---

<Boxx/>

API网关是一个聚合多个不同API的统一出口，同时对API进行流量控制/统计、身份校验、报文转换等操作。

API网关和API的区别主要在于一个是聚合工具，一个是实际干活的。

<!-- more -->

[[toc]]

## 何为API网关

![](/znote/img/backend/14814543-ff52ad16128922f6.jpg)

根据目前所在的自研网关架构项目组，简单点举个例子：

- API网关地址 https://www.znote.openapi.com

- 有3个API：

  a. 订单接口 https://www.aaa.com/aaaOrder <br/>
  b. 商品接口 https://www.bbb.com/bbbGoods <br/>
  c. 促销接口 https://www.ccc.com/cccPromotion <br/>

未接入API网关前：系统需要暴露 a、b、c 3个接口地址，客户方调用

接入API网关后：系统只需暴露网关地址 https://www.znote.openapi.com 即可，客户方根据SDK调用不同接口，同时API网关还可对已接入的API进行**参数转换、流控、权限、监控**等一系列管理操作。

看到上面的图示与描述，我们可能会想到另外一个与网关类似的东西——代理。网关与代理的区别：代理是纯粹的数据透传，协议不会发生变化；网关在数据透传的背景下，还会设计协议的转换，比如上图中用户请求传输到网关的协议是HTTP，通过网关透传到下游则可能已经转换成企业内部的RPC了（比如JSF、Dubbo等企业自研的RPC框架）。

## API网关架构

在一个大型微服务网络中，大概架构分为几层：

1. 渠道层 接受客户端请求和各种协议等
2. 场景层 是否直连，是否走F5，是否走网关
3. 接入层 f5，安全网关，API网关等
4. 集成层 集中管理，rpc远程调用
5. 服务层 各业务逻辑分页、缓存等
6. 产品层 各服务分片

API网关处于接入层角色，具有承上启下的作用，承担着报文转换、参数处理、协议适配、权限管理、监控告警等一系列重要角色信息。

内部网关架构不宜分享，但以开源的 [Soul](https://gitee.com/mirrors/soul) 网关为例：

![](/znote/img/backend/21182623_YAbx.png)

涵盖有：Admin管理中心、zk配置中心和Gateway三部分组成。

- Admin管理中心：统一管理接入API网关的接口

- zk配置中心：经Admin管理中心配置好数据后，由zk负责完成网关的同步信息，保证网关的高可用，承担着网关数据源的角色

- Gateway：由Netty实现，基于异步的、事件驱动的、高性能、高并发解决方案

## Gateway核心设计

API网关基本请求流程：

1. 确定API映射关系和参数协议报文等要素，通过Admin管理中心接入API网关
2. 在Admin管理中心对接口进行场景绑定、应用绑定、授权上线同步zk配置中心，接入网关
3. API网关下发SDK和公私钥、APP_ID等文件，客户方引入SDK加密加签调用相应接口
4. 给客户方开通权限，客户方联调，上送请求报文，请求报文流转于Gateway中

![](/znote/img/backend/21182624_Ar1G.png)

Gateway基于Netty Pipeline Handler的处理模式，以 **过滤链 + 插件化** 的方式将请求流转于Gateway，进一步对请求进行解密验签、参数转换、限流熔断、权限过滤等不同功能处理。

同时可针对不同场景、不同功能做出不同的定制化插件开发。

## API网关基本功能

API管理：基于Admin管理中心进行接口的配置、上线、关系绑定等。

参数处理：基于Admin管理中心对参数进行映射处理（如将真实入参requestId暴露为req_id）；对参数进行动态绑定、对参数进行合理化输出等。

动态配置：基于Admin管理中心对接口进行系统化操作后，基于zk配置中心实现热部署式接口上线、更新、发布等操作。

定制化插件：Gateway支持通过插件的形式对网关请求做出不同功能。

## 插件列表

请求头转换插件：可对请求头和响应头进行配置化定制

鉴权配置插件：支持JWT和OAUTH2鉴权和自定义Jar鉴权

限流配置插件：使用分布式令牌桶的形式对每个服务进行差别化限流

熔断降级配置插件：使用resilience4j来进行熔断降级，如果后端服务有异常处理，可以进行降级

请求报文校验插件：采用json schema对报文体或部分报文体的格式校验

Groovy脚本插件：可动态在调用链中插入一段java脚本，来执行需要的逻辑

Mock插件：mock请求结果，配置该插件后，请求不会再转发给后端服务，根据配置好的freemarker模板直接响应给调用方

Rpc路由转换插件：配置将http请求转化为dubbo请求时需要的参数，如服务名，参数转化逻辑

Url重写插件：该插件可对Tesla请求到后端的url进行差异化配置，支持直接转发和占位符转发

创建token插件：可根据响应报文内容抽取参数后生成JWT

执行上传jar包插件：如果有特殊化的功能，当前插件体系无法满足时，可以使用该插件自己编写逻辑

查询聚合插件：该插件可实现调用方一次查询，聚合多个后端接口数据的效果

消除鉴权插件：该插件用于当API的鉴权类型不是开放时，但个别endpoint不希望鉴权时使用，如/login，/logout等

缓存结果插件：该插件可根据配置缓存请求结果

请求报文转换插件：该插件根据配置的freemarker脚本对请求体和响应体的报文进行转换

支持自定义插件。

<Reward/>

## 参考

[https://gitee.com/mirrors/soul](https://gitee.com/mirrors/soul)

[https://github.com/jiangjunwei/tesla](https://github.com/jiangjunwei/tesla)

[https://www.jianshu.com/p/7baab672b822](https://www.jianshu.com/p/7baab672b822)
