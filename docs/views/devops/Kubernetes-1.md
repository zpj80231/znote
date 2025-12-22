---
title: Kubernetes-1 简介
date: 2025-12-07
tags:
- k8s
categories:
- 能力扩展 DevOps
isShowComments: true
---

<Boxx/>

<!-- more -->

[[toc]]

## Kubernetes是什么

[Kubernetes](https://kubernetes.io/) 是一个很容易地部署和管理容器化的应用软件系统，使用Kubernetes能够方便对容器进行调度和编排。

对应用开发者而言，可以把Kubernetes看成一个集群操作系统。Kubernetes提供服务发现、伸缩、负载均衡、自愈甚至选举等功能，让开发者从基础设施相关配置等解脱出来。

Kubernetes可以把大量的服务器看做一台巨大的服务器，在一台大服务器上面运行应用程序。无论Kubernetes的集群有多少台服务器，在Kubernetes上部署应用程序的方法永远一样。

图1 在Kubernetes集群上运行应用程序

![](/znote/img/devops/CS6UbNf0Go0FVZxx5vUcwv7DnEd.png)

## Kubernetes集群架构

Kubernetes集群包含Master节点（控制节点）和Node节点（计算节点/工作节点），应用部署在Node节点上，且可以通过配置选择应用部署在某些特定的节点上。

**说明：**

通过云容器引擎服务创建的集群，Master节点将由云容器引擎服务托管，您只需创建Node节点。

Kubernetes集群的架构如下所示：

图2 Kubernetes集群架构

![](/znote/img/devops/UhFHbKRwNo7T0UxFjswcyCbnn9c.png)

Master节点

Master节点是集群的控制节点，由API Server、Scheduler、Controller Manager和ETCD四个组件构成。

* API Server：各组件互相通讯的中转站，接受外部请求，并将信息写到ETCD中。

* Controller Manager：执行集群级功能，例如复制组件，跟踪Node节点，处理节点故障等等。

* Scheduler：负责应用调度的组件，根据各种条件（如可用的资源、节点的亲和性等）将容器调度到Node上运行。

* ETCD：一个分布式数据存储组件，负责存储集群的配置信息。

在生产环境中，为了保障集群的高可用，通常会部署多个Master，如CCE的集群高可用模式就是3个Master节点。

Node节点

Node节点是集群的计算节点，即运行容器化应用的节点。

* kubelet：kubelet主要负责同Container Runtime打交道，并与API Server交互，管理节点上的容器。

* kube-proxy：应用组件间的访问代理，解决节点上应用的访问问题。

* Container Runtime：容器运行时，如Docker，最主要的功能是下载镜像和运行容器。

## Kubernetes的扩展性

Kubernetes开放了容器运行时接口（CRI）、容器网络接口（CNI）和容器存储接口（CSI），这些接口让Kubernetes的扩展性变得最大化，而Kubernetes本身则专注于容器调度。

* CRI（Container Runtime Interface）：容器运行时接口，提供计算资源，CRI隔离了各个容器引擎之间的差异，而通过统一的接口与各个容器引擎之间进行互动。

* CNI（Container Network Interface）：容器网络接口，提供网络资源，通过CNI接口，Kubernetes可以支持不同网络环境。例如CCE就是开发的CNI插件支持Kubernetes集群运行在VPC网络中。

* CSI（Container Storage Interface）：容器存储接口，提供存储资源，通过CSI接口，Kubernetes可以支持各种类型的存储。例如CCE就可以方便地对接块存储（EVS）、文件存储（SFS）和对象存储（OBS）。

## Kubernetes中的基本对象

上面介绍Kubernetes集群的构成，下面将介绍Kubernetes中基本对象及它们之间的一些关系。

图3 Kubernetes基本对象

![](/znote/img/devops/At8DbQ96To7pWwxyyjpc2LhPnhg.png)

* Pod

Pod是Kubernetes创建或部署的最小单位。一个Pod封装一个或多个容器（container）、存储资源（volume）、一个独立的网络IP以及管理控制容器运行方式的策略选项。

* Deployment

Deployment是对Pod的服务化封装。一个Deployment可以包含一个或多个Pod，每个Pod的角色相同，所以系统会自动为Deployment的多个Pod分发请求。

* StatefulSet

StatefulSet是用来管理有状态应用的对象。和Deployment相同的是，StatefulSet管理了基于相同容器定义的一组Pod。但和Deployment不同的是，StatefulSet为它们的每个Pod维护了一个固定的ID。这些Pod是基于相同的声明来创建的，但是不能相互替换，无论怎么调度，每个Pod都有一个永久不变的ID。

* Job

Job是用来控制批处理型任务的对象。批处理业务与长期伺服业务（Deployment）的主要区别是批处理业务的运行有头有尾，而长期伺服业务在用户不停止的情况下永远运行。Job管理的Pod根据用户的设置把任务成功完成就自动退出（Pod自动删除）。

* CronJob

CronJob是基于时间控制的Job，类似于Linux系统的crontab，在指定的时间周期运行指定的任务。

* DaemonSet

DaemonSet是这样一种对象（守护进程），它在集群的每个节点上运行一个Pod，且保证只有一个Pod，这非常适合一些系统层面的应用，例如日志收集、资源监控等，这类应用需要每个节点都运行，且不需要太多实例，一个比较好的例子就是Kubernetes的kube-proxy。

* Service

Service是用来解决Pod访问问题的。Service有一个固定IP地址，Service将访问流量转发给Pod，而且Service可以给这些Pod做负载均衡。

* Ingress

Service是基于四层TCP和UDP协议转发的，Ingress可以基于七层的HTTP和HTTPS协议转发，可以通过域名和路径做到更细粒度的划分。

* ConfigMap

ConfigMap是一种用于存储应用所需配置信息的资源类型，用于保存配置数据的键值对。通过ConfigMap可以方便地做到配置解耦，使得不同环境有不同的配置。

* Secret

Secret是一种加密存储的资源对象，您可以将认证信息、证书、私钥等保存在Secret中，而不需要把这些敏感数据暴露到镜像或者Pod定义中，从而更加安全和灵活。

* PersistentVolume（PV）

PV指持久化数据存储卷，主要定义的是一个持久化存储在宿主机上的目录，比如一个NFS的挂载目录。

* PersistentVolumeClaim（PVC）

Kubernetes提供PVC专门用于持久化存储的申请，PVC可以让您无需关心底层存储资源如何创建、释放等动作，而只需要申明您需要何种类型的存储资源、多大的存储空间。

## 搭建Kubernetes集群

[Kubernetes网站](https://kubernetes.io/docs/setup/)上有多种搭建Kubernetes集群的方法，例如minikube、kubeadm等。

## Kubernetes对象的描述

kubernetes中资源可以使用YAML描述（如果您对YAML格式不了解，可以参考YAML语法），也可以使用JSON。其内容可以分为如下四个部分：

* typeMeta：对象类型的元信息，声明对象使用哪个API版本，哪个类型的对象。

* objectMeta：对象的元信息，包括对象名称、使用的标签等。

* spec：对象的期望状态，例如对象使用什么镜像、有多少副本等。

* status：对象的实际状态，只能在对象创建后看到，创建对象时无需指定。

图4 YAML描述文件

![](/znote/img/devops/ELP1bPvEzouwEQxFlLRcRI1Znbb.png)

## 在Kubernetes上运行应用

一个名为nginx-deployment.yaml的文件，如下所示：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name:  nginx
  labels:
    app:  nginx
spec:
  selector:
    matchLabels:
      app: nginx
  replicas: 3
  template:
    metadata:
      labels:
        app:  nginx
    spec:
      containers:
      - name:  nginx
        image:  nginx:alpine
        resources:
          requests:
            cpu: 100m
            memory: 200Mi
          limits:
            cpu: 100m
            memory: 200Mi
      imagePullSecrets:
      - name: default-secret
```

使用kubectl连接集群后，执行如下命令：

```sql
# kubectl create -f nginx-deployment.yaml 
deployment.apps/nginx created
```

命令执行后，Kubernetes集群中会创建3个Pod，使用如下命令可以查询到Deployment和Pod：

```sql
# kubectl get deploy
NAME    READY   UP-TO-DATE   AVAILABLE   AGE
nginx   3/3     3            3           9s

# kubectl get pods
NAME                     READY   STATUS    RESTARTS   AGE
nginx-685898579b-qrt4d   1/1     Running   0          15s
nginx-685898579b-t9zd2   1/1     Running   0          15s
nginx-685898579b-w59jn   1/1     Running   0          15s
```

<Reward/>