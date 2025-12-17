---
title: Kubernetes-3 命令
date: 2025-12-17
tags:
- k8s
categories:
- 一体化 DevOps
isShowComments: true
sidebarDepth: 1
---

<Boxx/>

<!-- more -->

[[toc]]

kubectl是Kubernetes集群的命令行工具，您可以将kubectl安装在任意一台机器上，通过kubectl命令操作Kubernetes集群。

```sql
# kubectl cluster-info
Kubernetes master is running at https://*.*.*.*:5443
CoreDNS is running at https://*.*.*.*:5443/api/v1/namespaces/kube-system/services/coredns:dns/proxy

To further debug and diagnose cluster problems, use 'kubectl cluster-info dump'.
```

执行kubectl get nodes可以查看集群中的节点信息。

```sql
# kubectl get nodes
NAME            STATUS    ROLES     AGE       VERSION
192.168.0.153   Ready     <none>    7m        v1.15.6-r1-20.3.0.2.B001-15.30.2
192.168.0.207   Ready     <none>    7m        v1.15.6-r1-20.3.0.2.B001-15.30.2
192.168.0.221   Ready     <none>    7m        v1.15.6-r1-20.3.0.2.B001-15.30.2
```

更多kubectl命令请参考[kubectl 快速参考](https://kubernetes.io/zh-cn/docs/reference/kubectl/quick-reference/)。

## 基础命令

#### get

get命令用于获取集群的一个或一些资源的详细信息。

该命令可以列出集群所有资源的详细信息，包括集群节点、运行的Pod、Deployment、Service等。

**须知：**

集群中可以创建多个命名空间，未指定命名空间的情况下，默认指定为--namespace=default，即查询default命名空间下的资源。

例如：

获取所有Pod的详细信息：

```sql
kubectl get pod -o wide
```

获取所有命名空间下的运行的所有Pod：

```sql
kubectl get pod --all-namespaces
```

获取所有命名空间下的运行的所有Pod的标签：

```sql
kubectl get pod --show-labels
```

获取该节点的所有命名空间：

```sql
kubectl get namespace
```

**说明：**

类似可以使用“kubectl get svc”，“kubectl get nodes”，“kubectl get deploy”等获取其他资源的信息。

以YAML格式输出Pod的详细信息：

```sql
kubectl get pod <podname> -o yaml
```

以JSON格式输出Pod的详细信息：

```sql
kubectl get pod <podname> -o json
```

```sql
kubectl get pod rc-nginx-2-btv4j -o=custom-columns=LABELS:.metadata.labels.app
```

**说明：**

其中LABELS为显示的列标题，可以自己设置，“.metadata.labels.app”为查询的数据需要按照之前的YAML或JSON获取。

#### create

create命令用于根据文件或输入创建集群资源。

如果已经定义了相应资源的YAML或JSON文件，直接使用以下命令即可创建文件内定义的资源。

```sql
kubectl create -f <filename>
```

#### expose

expose将一个资源包括Pod、Service、Deployment等公开为一个新的Service。

```sql
kubectl expose deployment <deployname> --port=81 --type=NodePort --target-port=80 --name=<service-name>
```

**说明：**

以上命令会给Deployment创建一个服务，--port为服务暴露出去的端口，--type为服务类型，--target-port为服务对应后端Pod的端口，port提供了集群内部访问服务的入口，即ClusterIP:port。

#### run

在集群中运行一个特定的镜像。

例如：

```sql
kubectl run <deployname> --image=nginx:latest
```

在创建时指定运行的命令：

```sql
kubectl run <deployname> --image=busybox --command -- ping example.com
```
#### set


在对象上设置特定功能。

例如：

滚动更新一个Deployment的容器镜像改为1.0版本：

```sql
kubectl set image deployment/<deployname> <containername>=<containername>:1.0
```

edit

edit提供了另一种更新资源的操作。

例如：

使用edit直接更新Pod的命令为：

```sql
kubectl edit pod po-nginx-btv4j
```

上面命令的效果等同于：

```sql
kubectl get pod po-nginx-btv4j -o yaml >> /tmp/nginx-tmp.yaml
vim /tmp/nginx-tmp.yaml
/*do some changes here */
kubectl replace -f /tmp/nginx-tmp.yaml
```

#### explain

查看文档或参考资料。

例如：

查看Pod的相关文档：

```sql
kubectl explain pod
```

#### delete

根据资源名或标签删除资源。

例如：

立刻删除该Pod：

```sql
kubectl delete pod <podname> --now 
```

```sql
kubectl delete -f nginx.yaml
kubectl delete deployment <deployname>
```

## 部署命令

#### rollout

管理资源的发布。

例如：

查看指定资源的部署状态：

```sql
kubectl rollout status deployment/<deployname>
```

查看指定资源的发布历史：

```sql
kubectl rollout history deployment/<deployname>
```

回滚指定资源，默认回滚至上一个版本：

```sql
kubectl rollout undo deployment/test-nginx
```

#### scale

scale用于程序在负载加重或缩小时将副本进行扩容或缩小。

```sql
kubectl scale deployment <deployname> --replicas=<newnumber>
```

#### autoscale

autoscale命令提供了自动根据工作负载的CPU利用率对其副本进行扩缩的功能。autoscale命令会给工作负载（Deployment、ReplicaSet、StatefulSet或ReplicationController）指定一个副本数的范围，在实际运行中根据所有Pod的平均CPU利用率自动在指定的范围内对Pod进行扩容或缩容。如果未指定目标利用率或设置为负数，将使用默认的自动扩缩策略。

```sql
kubectl autoscale deployment <deployname> --min=<minnumber> --max=<maxnumber> --cpu-percent=<cpu>
```

## 集群管理命令

#### cordon、drain、uncordon

有时候会遇到这样一个场景，一个节点需要升级，但是在该节点上又有许多运行的Pod，或者该节点已经瘫痪，需要保证业务功能的完善，则需要使用这组命令将该节点上运行的Pod调度到其他节点上。使用步骤如下：

1. 使用cordon命令将一个节点标记为不可调度。这意味着新的Pod将不会被调度到该节点上。

```sql
kubectl cordon <nodename>
```

CCE中\<nodename>默认为节点私网IP。

* 使用drain命令，驱逐该节点上的Pod，将运行在该节点上运行的Pod平滑的搬迁到其他节点上。

```sql
kubectl drain <nodename> --ignore-daemonsets --delete-emptydir-data
```

\--ignore-daemonsets表示忽略DaemonSet所控制的Pod，--delete-emptydir-data表示即使存在使用emptyDir（腾空节点时将删除本地数据）的Pod也会继续腾空节点。

* 对该节点进行一些节点维护的操作，如重置节点等。

* 节点维护完后，使用uncordon命令解锁该节点，使其重新变得可调度。

```sql
kubectl uncordon <nodename>
```

#### cluster-info

查看在集群中运行的插件：

```sql
kubectl cluster-info
```

查看详细信息：

```sql
kubectl cluster-info dump
```

#### top

显示资源（CPU/Memory/Storage）使用，该命令需要集群中的Metrics Server正常运行。

#### taint

修改一个或多个节点上的污点。

#### certificate

修改证书资源。

## 故障诊断和调试命令

#### describe

describe命令类似于get，同样用于获取资源的相关信息。不同的是，get获得的是定义该资源的详细信息，而describe获得的是资源在集群内相关的状态信息。describe命令同get类似，但是describe命令不支持-o选项，对于同一类型的资源，describe命令输出的信息格式，内容域相同。

**说明：**

如果发现是查询某个资源的信息，使用get命令能够获取更加详尽的信息。但是如果想要查询某个资源的状态，如某个Pod并不是在running状态，这时需要获取更详尽的状态信息时，就应该使用describe命令。

kubectl describe pod \<podname>

#### logs

logs命令用于显示Pod运行中，容器内程序输出到标准输出的内容。如果要获得tail -f的方式，需使用-f选项。

```sql
kubectl logs -f <podname>
```

#### exec

与Docker的exec用法相似，如果一个Pod中，有多个容器，需要使用-c选项指定容器。

```sql
kubectl exec -it <podname> -- bash
```

```sql
kubectl exec -it <podname> -c <containername> -- bash
```

#### port-forward

转发一个或多个本地端口至一个Pod。

例如：

侦听本地端口5000并转发到\<my-deployment>创建的Pod里的端口6000：

```sql
kubectl port-forward deploy/my-deployment 5000:6000
```

#### cp

复制文件或目录到容器：

```sql
kubectl cp /tmp/foo <podname>:/tmp/bar -c <containername>
```

将/tmp/foo本地文件复制到远程Pod中特定容器的/tmp/bar下。

#### auth

检查授权。

#### attach

attach命令效果类似于logs -f，退出查看使用ctrl-c。如果一个Pod中有多个容器，要查看具体的某个容器的输出，需要在Pod名后使用-c containername指定运行的容器。

```sql
kubectl attach <podname> -c <containername>
```

## 高级命令

#### replace

replace命令用于对已有资源进行更新、替换。当需要更新资源的一些属性的时候，如果修改副本数量，增加、修改标签，更改镜像版本，修改端口等，都可以直接修改原YAML文件，然后执行replace命令。

```sql
kubectl replace -f <filename>
```

**须知：**

资源名称不能被更新。

#### apply

apply命令提供了比patch，edit等更严格的更新资源的方式。通过apply，用户可以将资源的configuration使用source control的方式维护在版本库中。每次有更新时，将配置文件推送server，然后使用kubectl apply将更新应用到资源。Kubernetes会在应用更新前将当前配置文件中的配置同已经应用的配置做比较，并只更新更改的部分，而不会主动更改任何用户未指定的部分。apply命令的使用方式同replace相同，不同的是，apply不会删除原有资源，然后创建新的。apply直接在原有资源的基础上进行更新。同时kubectl apply还会在资源中添加一条注释，标记当前的apply，类似于git操作。

```sql
kubectl apply -f <filename>
```

#### patch

如果一个容器已经在运行，这时需要对一些容器属性进行修改，又不想删除容器，或不方便通过replace的方式进行更新。Kubernetes还提供了一种在容器运行时，直接对容器进行修改的方式，就是patch命令。 例如已存在一个Pod的标签为app=nginx1，如果需要在运行过程中，将其修改为app=nginx2。

```sql
kubectl patch pod <podname> -p '{"metadata":{"labels":{"app":"nginx2"}}}'
```

#### convert

不同的API版本之间转换配置文件。

## 设置命令

#### label

更新资源上的标签：

```sql
kubectl label pods my-pod new-label=newlabel
```

#### annotate

更新资源上的注释：

```sql
kubectl annotate pods my-pod icon-url=http://*****
```

#### completion

用于实现kubectl工具自动补全。

## 其他命令

#### api-versions

打印受支持的API版本：

```sql
kubectl api-versions
```

#### api-resources

打印支持的API资源：

```sql
kubectl api-resources
```

#### config

修改kubeconfig文件：用于访问API，比如配置认证信息。

#### help

所有命令帮助。

#### version

打印客户端和服务版本信息。

```sql
kubectl version
```

<Reward/>