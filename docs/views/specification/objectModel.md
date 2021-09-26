---
title: 项目中的各种 O对象模型 到底是什么
date: 2020-05-21
tags:
- "开发规范"
- Java
categories:
- 规范 Standard
isShowComments: true
---

<Boxx/>

简单介绍工作中各种VO, TO, PO, BO...

<!-- more -->

[[toc]]

## VO

VO：值对象、视图对象

项目中经常用到，主要对应界面显示的数据对象。

在一个 web 页面中，一般用一个 VO 对象对应整个界面的值。

## DTO
DTO：Data Transfer Object 数据传输对象

项目中较少用到，主要用于远程调用等需要大量传输对象的地方。

比如我们一张表有 100 个字段，那么对应的 PO 就有 100 个属性。
但是我们界面上只要显示 10 个字段，
客户端用 webService 来获取数据，没有必要把整个 PO 对象传递到客户端，
这时我们就可以用只有这 10 个属性的 DTO 来传递结果到客户端，这样也不会暴露服务端表结构。到达客户端以后，如果用这个对象来对应界面显示，那此时它的身份就转为 VO

## PO

PO：persistant object 持久对象

项目中经常用到，可以看成是与数据库中的表相映射的 java 对象。

最简单的 PO 就是对应数据库中某个表中的一条记录，多个记录可以用 PO 的集合。PO 中应该不包含任何对数据库的操作。

## DAO

DAO：数据访问对象

项目中经常用到，主要用来封装对数据库的访问。

## BO

BO：business object 业务对象

项目中较少用到，封装业务逻辑的 java 对象，通过调用 DAO 方法，结合 PO，VO 进行业务操作。

## 规范

> 阿里巴巴 Java 开发手册中的 DO、DTO、BO、AO、VO、POJO 定义

- 分层领域模型规约：

DO（ Data Object）：与数据库表结构一一对应，通过 DAO 层向上传输数据源对象。

DTO（ Data Transfer Object）：数据传输对象，Service 或 Manager 向外传输的对象。

BO（ Business Object）：业务对象。 由 Service 层输出的封装业务逻辑的对象。

AO（ Application Object）：应用对象。 在 Web 层与 Service 层之间抽象的复用对象模型，极为贴近展示层，复用度不高。

VO（ View Object）：显示层对象，通常是 Web 向模板渲染引擎层传输的对象。

POJO（ Plain Ordinary Java Object）：在本手册中， POJO 专指只有 setter/getter/toString 的简单类，包括 DO/DTO/BO/VO 等。

Query：数据查询对象，各层接收上层的查询请求。 注意超过 2 个参数的查询封装，禁止使用 Map 类来传输。

- 领域模型命名规约：

数据对象：xxxDO，xxx 即为数据表名。

数据传输对象：xxxDTO，xxx 为业务领域相关的名称。

展示对象：xxxVO，xxx 一般为网页名称。

POJO 是 DO/DTO/BO/VO 的统称，禁止命名成 xxxPOJO。

<Reward/>
