---
title: Deploy 服务部署
date: 2025-12-27
tags:
- k8s
categories:
- 能力扩展 DevOps
isShowComments: true
---

<Boxx/>

<!-- more -->

[[toc]]

## 简介

分布式系统的应用程序性能监控工具，特别为企业内部微服务、云原生和基于容器(docker)架构设计。

## 服务升级

目标：完成CI/CD流程的全面优化，提高发布效率，减少上线项目的平均部署时间

升级：完善 deploy 服务，单服务构建及发布时间由 40 秒左右提升至 10 秒左右，如下对比

上个版本：40秒左右

![](/znote/img/devops/deploy/deploy-1.0.png)

现在版本：10秒左右

![](/znote/img/devops/deploy/deploy_v2.png)

## 版本交付

目标：引入并实施持续集成和持续交付工具，确保每个版本发布过程中都具备自动化部署功能，减少人为错误

支持各环境一键发布（生产环境必须输入密码才能发布）。

![](/znote/img/devops/deploy/image-10.png)

## 平台应用

目标：推动各开发团队掌握并应用构建工具，确保各团队具备DepOps构建部署能力。

## V2.0.0 服务重构

20250418 对部署服务进行优化重构，现支持按照 不同项目、不同模块、不同环境、不同分支 4个维度的一键发版

**cc2项目：**

![](/znote/img/devops/deploy/image-3.png)

**cc2-ael 项目：**

![](/znote/img/devops/deploy/image-4.png)

## V2.0.1 支持AEL

20250422 ael支持：ael实现一键秒级发版

![](/znote/img/devops/deploy/image-5.png)

## V2.1.0 里程碑

20250704 Deploy 服务部署，发布里程碑版本 V2.1.0 ：

* 大幅重构前端页面

* 使用js缓存和虚拟dom，提高页面日志回显性能问题（页面空白卡死问题）

* 增加前端项目部署（toolbar、admin-ui、sdk2），支持依赖安装、项目打包发版、nginx重启 ，3 大操作按需发布

* 大幅重构后端代码（提升代码健壮性、扩展性及兼容前端项目部署）

* 机构涉及的所有代码，前端、后端、asterisk，支持全项目、全流程一键发版

![](/znote/img/devops/deploy/1b597996066b739229811f08b68e6f45.png)

## V2.1.1 并发部署和飞书通知

20250915 支持并发部署和飞书发版通知。

* 支持项目级别的并发部署（多个项目可以并发部署）

* 部署支持飞书告警通知

如下：发版4个模块，在发开始时和发版完成后都会有飞书告警通知。

![](/znote/img/devops/deploy/image-7.png)


<p align="center">
    <img src="/znote/img/devops/deploy/image-8.png" alt="image-8" width=300>
    <img src="/znote/img/devops/deploy/image-9.png" alt="image-9" width=300>
</p>

<Reward/>