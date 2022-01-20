---
title: k8s基本命令与pod管理
date: 2022-01-17
tags:
- 分布式
- k8s
categories:
- 后端 Back-end
isShowComments: false
---

<Boxx/>

工作中常用到的 k8s 命令备份，方便查看。

<!-- more -->

[[toc]]

## 查看指定命名空间下的所有节点

```shell
kubectl get pod -n znote
```

## 进入某一节点

```shell
kubectl exec -it test-pod-statefulset-1 /bin/bash -n znote
```

## 删除某一节点

```shell
kubectl delete test-pod-statefulset-1 -n znote
```

## 查看pod暴露的端口号

```shell
kubectl get svc -n znote
```

## 移动文件至pod内部

移到文件到容器中pod的pvc目录下后重启pod，pvc目录中的文件不会丢失

```shell
kubectl -n znote cp ./aaa test-pod-statefulset-1:/bbb/sdf
```

## 修改ConfigMap

同理修改：pod、svc、statefulset、cm（cm代表ConfigMap）

```shell
# 查看ConfigMap
kubectl get cm -n obp
# 编辑
kubectl edit cm test-pod-config -n znote
# 删除
kubectl delete cm test-pod-config -n znote
```

## 其他参考

[k8s中部署发布应用](https://www.cnblogs.com/benjamin77/p/12446781.html)
