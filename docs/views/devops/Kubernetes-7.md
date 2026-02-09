---
title: Kubernetes-7 容器网络
date: 2026-02-09
tags:
- k8s
categories:
- 能力扩展 DevOps
isShowComments: true
---

<Boxx/>

<!-- more -->

[[toc]]

## 容器网络

Kubernetes本身并不负责网络通信，但提供了容器网络接口CNI（Container Network Interface），具体的网络通信交由CNI插件来实现。开源的CNI插件非常多，像Flannel、Calico等。针对Kubernetes网络，CCE为不同网络模型的集群提供不同的网络插件实现，用于负责集群内网络通信。

Kubernetes虽然不负责搭建网络模型，但要求集群网络满足以下要求：

* Pod能够互相通信，且Pod必须通过非NAT网络连接，即收到的数据包的源IP就是发送数据包Pod的IP。

* 节点之间可以在非NAT网络地址转换的情况下通信。

#### Pod通信

同一个节点中的Pod通信

Pod通过虚拟Ethernet接口对（Veth Pair）与外部通信，Veth Pair像一根网线，一端在Pod内部，一端在Pod外部。同一个节点上的Pod通过网桥（Linux Bridge）通信，如下图所示。

图1 同一个节点中的Pod通信

![](/znote/img/devops/MbFwbnjO6oZvn0xOqPvcotR0nxg.png)

在同一节点上的Pod会通过Veth设备将一端连接到网桥，且它们的IP地址是通过网桥动态获取的，和网桥IP属于同一网段。此外，同一节点上的所有Pod默认路由都指向网桥，网桥会负责将所有非本地地址的流量进行转发。因此，同一节点上的Pod可以直接通信。

不同节点上的Pod通信

Kubernetes要求集群Pod的地址唯一，因此集群中的每个节点都会分配一个子网，以保证Pod的IP地址在整个集群内部不会重复。在不同节点上运行的Pod通过IP地址互相访问，该过程需要通过集群网络插件实现，按照底层依赖大致可分为Overlay模式、路由模式、Underlay模式三类。

* Overlay模式是在节点网络基础上通过隧道封装构建的独立网络，拥有自己独立的IP地址空间、交换或者路由的实现。VXLAN协议是目前最流行的Overlay网络隧道协议之一。

* 路由模式采用VPC路由表的方式与底层网络相结合，能够更加便捷地连接容器和主机，在性能上会优于Overlay的隧道封装。

* Underlay模式是借助驱动程序将节点的底层网络接口直接暴露给容器使用的一种网络构建技术，享有较高的性能，较为常见的解决方案有IP VLAN等。

图2 不同节点上的Pod通信

![](/znote/img/devops/Wv0IbQBxzo6bjIxKaV6cISmUnoh.png)

以上就是容器网络底层视图，后面将进一步介绍Kubernetes如何在此基础上向用户提供访问方案，具体请参见Service和Ingress。

## Service

#### 直接访问Pod的问题

Pod创建完成后，如何访问Pod呢？直接访问Pod会有如下几个问题：

* Pod会随时被Deployment这样的控制器删除重建，那访问Pod的结果就会变得不可预知。

* Pod的IP地址是在Pod启动后才被分配，在启动前并不知道Pod的IP地址。

* 应用往往都是由多个运行相同镜像的一组Pod组成，逐个访问Pod也变得不现实。

举个例子，假设有这样一个应用程序，使用Deployment创建了前台和后台，前台会调用后台做一些计算处理，如图1所示。后台运行了3个Pod，这些Pod是相互独立且可被替换的，当Pod出现状况被重建时，新建的Pod的IP地址是新IP，前台的Pod无法直接感知。

图1 Pod间访问

![](/znote/img/devops/HuANbyilMoU1soxfraBc6YvrnDh.png)

#### 使用Service解决Pod的访问问题

Kubernetes中的Service对象就是用来解决上述Pod访问问题的。Service有一个固定IP地址（在创建CCE集群时有一个服务网段的设置，这个网段专门用于给Service分配IP地址），Service将访问它的流量转发给Pod，具体转发给哪些Pod通过Label来选择，而且Service可以给这些Pod做负载均衡。

那么对于上面的例子，为后台添加一个Service，通过Service来访问Pod，这样前台Pod就无需感知后台Pod的变化，如图2所示。

图2 通过Service访问Pod

![](/znote/img/devops/YC5ibObA7oiYTfxLeM4cWsROnTe.png)

#### 创建后台Pod

首先创建一个3副本的Deployment，即3个Pod，且Pod上带有标签“app: nginx”，具体如下所示。

```yaml
apiVersion: apps/v1      
kind: Deployment         
metadata:
  name: nginx            
spec:
  replicas: 3                    
  selector:              
    matchLabels:
      app: nginx
  template:              
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - image: nginx:latest
        name: container-0
        resources:
          limits:
            cpu: 100m
            memory: 200Mi
          requests:
            cpu: 100m
            memory: 200Mi
      imagePullSecrets:
      - name: default-secret
```

#### 创建Service

下面示例创建一个名为“nginx”的Service，通过selector选择到标签“app:nginx”的Pod，目标Pod的端口为80，Service对外暴露的端口为8080。

访问服务只需要通过“服务名称:对外暴露的端口”接口，对应本例即“nginx:8080”。这样，在其他Pod中，只需要通过“nginx:8080”就可以访问到“nginx”关联的Pod。

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx        # Service的名称
spec:
  selector:          # Label Selector，选择包含app=nginx标签的Pod
    app: nginx
  ports:
  - name: service0
    targetPort: 80   # Pod的端口
    port: 8080       # Service对外暴露的端口
    protocol: TCP    # 转发协议类型，支持TCP和UDP
  type: ClusterIP    # Service的类型
```

将上面Service的定义保存到nginx-svc.yaml文件中，使用kubectl创建这个Service。

```yaml
$ kubectl create -f nginx-svc.yaml
service/nginx created

$ kubectl get svc
NAME         TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)    AGE
kubernetes   ClusterIP   10.247.0.1       <none>        443/TCP    7h19m
nginx        ClusterIP   10.247.124.252   <none>        8080/TCP   5h48m
```

您可以看到Service有个Cluster IP，这个IP是固定不变的，除非Service被删除，所以您也可以使用ClusterIP在集群内部访问Service。

下面创建一个Pod并进入容器，使用ClusterIP访问Pod，可以看到能直接返回内容。

```xml
$ kubectl run -i --tty --image nginx:alpine test --rm /bin/sh
If you don't see a command prompt, try pressing enter.
/ # curl 10.247.124.252:8080
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
...
```

#### 使用ServiceName访问Service

通过DNS进行域名解析后，可以使用“ServiceName:Port”访问Service，这也是Kubernetes中最常用的一种使用方式。在创建CCE集群的时候，会默认要求安装CoreDNS插件，在kube-system命名空间下可以查看到CoreDNS的Pod。

```xml
$ kubectl get po --namespace=kube-system
NAME                                      READY   STATUS    RESTARTS   AGE
coredns-7689f8bdf-295rk                   1/1     Running   0          9m11s
coredns-7689f8bdf-h7n68                   1/1     Running   0          11m
```

CoreDNS安装成功后会成为DNS服务器，当创建Service后，CoreDNS会将Service的名称与IP记录起来，这样Pod就可以通过向CoreDNS查询Service的名称获得Service的IP地址。

访问时通过nginx.\<namespace>.svc.cluster.local访问，其中nginx为Service的名称，\<namespace>为命名空间名称，svc.cluster.local为域名后缀，在实际使用中，在同一个命名空间下可以省略\<namespace>.svc.cluster.local，直接使用ServiceName即可。

例如上面创建的名为nginx的Service，直接通过“nginx:8080”就可以访问到Service，进而访问后台Pod。

使用ServiceName的方式有个主要的优点就是可以在开发应用程序时可以将ServiceName写在程序中，这样无需感知具体Service的IP地址。

下面创建一个Pod并进入容器，查询nginx域名的地址，可以发现是解析出nginx这个Service的IP地址10.247.124.252；同时访问Pod的域名，可以看到能直接返回内容。

```xml
$ kubectl run -i --tty --image tutum/dnsutils dnsutils --restart=Never --rm /bin/sh
If you don't see a command prompt, try pressing enter.
/ # nslookup nginx
Server:                10.247.3.10
Address:        10.247.3.10#53

Name:        nginx.default.svc.cluster.local
Address: 10.247.124.252

/ # curl nginx:8080
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
...
```

#### Service是如何做到服务发现的

前面说到有了Service后，无论Pod如何变化，Service都能够发现到Pod。

如果调用kubectl describe命令查看Service的信息，您会看到如下信息。

```xml
$ kubectl describe svc nginx
Name:              nginx
......
Endpoints:         172.16.2.132:80,172.16.3.6:80,172.16.3.7:80
......
```

可以看到一个Endpoints，Endpoints同样也是Kubernetes的一种资源对象，可以查询得到。Kubernetes正是通过Endpoints监控到Pod的IP，从而让Service能够发现Pod。

```xml
$ kubectl get endpoints
NAME         ENDPOINTS                                     AGE
nginx        172.16.2.132:80,172.16.3.6:80,172.16.3.7:80   5h48m
```

这里的172.16.2.132:80是Pod的IP:Port，通过如下命令可以查看到Pod的IP，与上面的IP一致。

```xml
$ kubectl get po -o wide
NAME                     READY   STATUS    RESTARTS   AGE     IP             NODE         
nginx-869759589d-dnknn   1/1     Running   0          5h40m   172.16.3.7     192.168.0.212
nginx-869759589d-fcxhh   1/1     Running   0          5h40m   172.16.3.6     192.168.0.212
nginx-869759589d-r69kh   1/1     Running   0          5h40m   172.16.2.132   192.168.0.94
```

![](/znote/img/devops/A2eVbNuNVo9MrIx999acKHaSnqe.png)

如果删除一个Pod，Deployment会将Pod重建，新的Pod IP会发生变化。

```xml
$ kubectl delete po nginx-869759589d-dnknn
pod "nginx-869759589d-dnknn" deleted

$ kubectl get po -o wide
NAME                     READY   STATUS    RESTARTS   AGE     IP             NODE         
nginx-869759589d-fcxhh   1/1     Running   0          5h41m   172.16.3.6     192.168.0.212
nginx-869759589d-r69kh   1/1     Running   0          5h41m   172.16.2.132   192.168.0.94 
nginx-869759589d-w98wg   1/1     Running   0          7s      172.16.3.10    192.168.0.212
```

再次查看Endpoints，会发现Endpoints的内容随着Pod发生了变化。

```xml
$ kubectl get endpoints
NAME         ENDPOINTS                                      AGE
kubernetes   192.168.0.127:5444                             7h20m
nginx        172.16.2.132:80,172.16.3.10:80,172.16.3.6:80   5h49m
```

下面进一步了解这又是如何实现的。

在Kubernetes集群架构中介绍过Node节点上的kube-proxy，实际上Service相关的事情都由节点上的kube-proxy处理。在Service创建时Kubernetes会分配IP给Service，同时通过API Server通知所有kube-proxy有新Service创建了，kube-proxy收到通知后通过iptables记录Service对应的IP和端口，从而让Service在节点上可以被查询到。

下图是一个实际访问Service的图示，Pod X访问Service（10.247.124.252:8080），在往外发数据包时，在节点上根据iptables规则目的IP:Port被随机替换为Pod1的IP:Port，从而通过Service访问到实际的Pod。

除了记录Service对应的IP和端口，kube-proxy还会监控Service和Endpoint的变化，从而保证Pod重建后仍然能通过Service访问到Pod。

图3 Pod X访问Service的过程

![](/znote/img/devops/KDAebg3mco9QAJx7ihhcVJkfn6f.png)

#### Service的类型与使用场景

Service的类型除了ClusterIP还有NodePort、LoadBalancer和Headless Service，这几种类型的Service有着不同的用途。

* ClusterIP：用于在集群内部互相访问的场景，通过ClusterIP访问Service。

* NodePort：用于从集群外部访问的场景，通过节点上的端口访问Service，详细介绍请参见NodePort类型的Service。

* LoadBalancer：用于从集群外部访问的场景，其实是NodePort的扩展，通过一个特定的LoadBalancer访问Service，这个LoadBalancer将请求转发到节点的NodePort，而外部只需要访问LoadBalancer，详细介绍请参见LoadBalancer类型的Service。

* Headless Service：用于Pod间的互相发现，该类型的Service并不会分配单独的ClusterIP， 而且集群也不会为它们进行负载均衡和路由。您可通过指定spec.clusterIP字段的值为“None”来创建Headless Service，详细介绍请参见Headless Service。

#### NodePort类型的Service

NodePort类型的Service可以让Kubernetes集群每个节点上保留一个相同的端口， 外部访问连接首先访问节点IP:Port，然后将这些连接转发给服务对应的Pod。如下图所示。

图4 NodePort Service

![](/znote/img/devops/NHB3bFjxQo8CqhxeBUYcuDJen1c.png)

下面是一个创建NodePort类型的Service。创建完成后，可以通过节点的IP:Port访问到后台Pod。

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nodeport-service
spec:
  type: NodePort
  ports:
  - port: 8080
    targetPort: 80
    nodePort: 30120
  selector:
    app: nginx
```

创建并查看，可以看到PORT这一列为8080:30120/TCP，说明Service的8080端口是映射到节点的30120端口。

```sql
$ kubectl create -f nodeport.yaml 
service/nodeport-service created

$ kubectl get svc -o wide
NAME               TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)          AGE    SELECTOR
kubernetes         ClusterIP   10.247.0.1       <none>        443/TCP          107m   <none>
nginx              ClusterIP   10.247.124.252   <none>        8080/TCP         16m    app=nginx
nodeport-service   NodePort    10.247.210.174   <none>        8080:30120/TCP   17s    app=nginx
```

此时，通过节点IP:端口访问Service可以访问到Pod，如下所示。

```xml
$ kubectl run -i --tty --image nginx:alpine test --rm /bin/sh
If you don't see a command prompt, try pressing enter.
/ # curl 192.168.0.212:30120
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
......
```

#### LoadBalancer类型的Service

LoadBalancer类型的Service其实是NodePort类型Service的扩展，通过一个特定的LoadBalancer访问Service，这个LoadBalancer将请求转发到节点的NodePort。

LoadBalancer本身不是属于Kubernetes的组件，这部分通常是由具体厂商（云服务提供商）提供，不同厂商的Kubernetes集群与LoadBalancer的对接实现各不相同，例如CCE对接了ELB。这就导致了创建LoadBalancer类型的Service有不同的实现。

图5 LoadBalancer Service

![](/znote/img/devops/07630B01-0F73-4E36-9DD8-6949238EE415.png)

下面是一个创建LoadBalancer类型的Service。创建完成后，可以通过ELB的IP:Port访问到后台Pod。

```yaml
apiVersion: v1 
kind: Service 
metadata: 
  annotations:   
    kubernetes.io/elb.id: 3c7caa5a-a641-4bff-801a-feace27424b6
  labels: 
    app: nginx 
  name: nginx 
spec: 
  loadBalancerIP: 10.78.42.242     #  ELB实例的IP地址
  ports: 
  - name: service0 
    port: 80
    protocol: TCP 
    targetPort: 80
    nodePort: 30120
  selector: 
    app: nginx 
  type: LoadBalancer    # 类型为LoadBalancer 
```

上面metadata.annotations里的参数配置是CCE的LoadBalancer类型Service需要配置的参数，表示这个Service绑定哪个ELB实例。CCE还支持创建LoadBalancer类型Service时新建ELB实例，详细的内容请参见负载均衡(LoadBalancer)。

#### Headless Service

前面讲的Service解决了Pod的内外部访问问题，允许客户端连接到Service关联的某个Pod。但还有下面这些问题没解决。

* 同时访问所有Pod

* 一个Service内部的Pod互相访问

为了解决以上问题，Kubernetes提供了另一种较为特殊的Service类型，称为Headless Service。对于其他Service来说，客户端在访问服务时，DNS查询时只会返回Service的ClusterIP地址，具体访问到哪个Pod是由集群转发规则（IPVS或iptables）决定的。而Headless Service并不会分配单独的ClusterIP，在进行DNS查询时会返回所有Pod的DNS记录，这样就可查询到每个Pod的IP地址。有状态负载（StatefulSet）中StatefulSet正是使用Headless Service解决Pod间互相访问的问题。

```yaml
apiVersion: v1
kind: Service       # 对象类型为Service
metadata:
  name: nginx-headless
  labels:
    app: nginx
spec:
  ports:    
    - name: nginx     # Pod间通信的端口名称
      port: 80        # Pod间通信的端口号
  selector:    
    app: nginx        # 选择标签为app:nginx的Pod
  clusterIP: None     # 必须设置为None，表示Headless Service
```

执行如下命令创建Headless Service。

```yaml
# kubectl create -f headless.yaml 
service/nginx-headless created
```

创建完成后可以查询Service。

```yaml
# kubectl get svc
NAME             TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
nginx-headless   ClusterIP   None         <none>        80/TCP    5s
```

创建一个Pod来查询DNS，可以看到能返回所有Pod的记录，这就解决了访问所有Pod的问题了。

```yaml
$ kubectl run -i --tty --image tutum/dnsutils dnsutils --restart=Never --rm /bin/sh
If you don't see a command prompt, try pressing enter.
/ # nslookup nginx-headless
Server:         10.247.3.10
Address:        10.247.3.10#53

Name:   nginx-headless.default.svc.cluster.local
Address: 172.16.0.31
Name:   nginx-headless.default.svc.cluster.local
Address: 172.16.0.18
Name:   nginx-headless.default.svc.cluster.local
Address: 172.16.0.19
```

## Ingress

#### 为什么需要Ingress

Service是基于四层TCP和UDP协议转发的，而Ingress可以基于七层的HTTP和HTTPS协议转发，可以通过域名和路径做到更细粒度的划分，如下图所示。

图1 Ingress-Service

![](/znote/img/devops/O9gUbGEBBoxMBFxch43cKzGZnYe.png)

#### Ingress工作机制

要想使用Ingress功能，必须在Kubernetes集群上安装Ingress Controller。Ingress Controller有很多种实现，最常见的就是Kubernetes官方维护的[NGINX Ingress Controller](https://github.com/kubernetes/ingress-nginx)；不同厂商通常有自己的实现，例如CCE使用弹性负载均衡服务ELB实现Ingress的七层负载均衡。

外部请求首先到达Ingress Controller，Ingress Controller根据Ingress的路由规则，查找到对应的Service，进而通过Endpoint查询到Pod的IP地址，然后将请求转发给Pod。

图2 Ingress工作机制

![](/znote/img/devops/768AAE1F-95EF-447F-9298-FBD174C4A00A.png)

#### 创建Ingress

下面例子中，使用http协议，关联的后端Service为“nginx:8080”，使用负载作为Ingress控制器（metadata.annotations字段都是指定使用哪个负载实例），当访问“http://192.168.10.155:8080/”时，流量转发“nginx:8080”对应的Service，从而将流量转发到对应Pod。

示例如下（适用于v1.23及以上版本的集群）：

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: test-ingress
  annotations:
    kubernetes.io/elb.class: union
    kubernetes.io/elb.port: '8080'
    kubernetes.io/elb.id: aa7cf5ec-7218-4c43-98d4-c36c0744667a
spec:
  rules:
    - host: ''
      http:
        paths:
          - path: /
            backend:
              service:
                name: nginx
                port:
                  number: 8080
            property:
              ingress.beta.kubernetes.io/url-match-mode: STARTS_WITH
            pathType: ImplementationSpecific
  ingressClassName: cce
```

Ingress中还可以设置外部域名，这样您就可以通过域名来访问到ELB，进而访问到后端服务。

**说明：**

域名访问依赖于域名解析，需要您将域名解析指向ELB实例的IP地址，例如您可以使用云解析服务 DNS来实现域名解析。

```yaml
...
spec:
  rules:
    - host: www.example.com       # 域名
      http:
        paths:
          - path: /
            backend:
              service:
                name: nginx
                port:
                  number: 8080
...
```

#### 路由到多个服务

Ingress可以同时路由到多个服务，配置如下所示。

* 当访问“http://foo.bar.com/foo”时，访问的是“s1:80”后端。

* 当访问“http://foo.bar.com/bar”时，访问的是“s2:80”后端。

**须知：**

Ingress转发策略中的path路径要求后端应用内存在相同的路径，否则转发无法生效。

例如，Nginx应用默认的Web访问路径为“/usr/share/nginx/html”，在为Ingress转发策略添加“/test”路径时，需要应用的Web访问路径下也包含相同路径，即“/usr/share/nginx/html/test”，否则将返回404。

```yaml
...
spec:
  rules:
    - host: foo.bar.com          # host地址
      http:
        paths:
          - path: "/foo"
            backend:
              service:
                name: s1
                port:
                  number: 80
          - path: "/bar"
            backend:
              service:
                name: s2
                port:
                  number: 80
...
```

## 就绪探针（Readiness Probe）

一个新Pod创建后，Service就能立即选择到它，并会把请求转发给Pod，那问题就来了，通常一个Pod启动是需要时间的，如果Pod还没准备好（可能需要时间来加载配置或数据，或者可能需要执行一个预热程序之类），这时把请求转给Pod的话，Pod也无法处理，造成请求失败。

Kubernetes解决这个问题的方法就是给Pod加一个业务就绪探针Readiness Probe，当检测到Pod就绪后才允许Service将请求转给Pod。

Readiness Probe同样是周期性的检测Pod，然后根据响应来判断Pod是否就绪，与存活探针（Liveness Probe）相同，就绪探针也支持如下三种类型。

* Exec：Probe执行容器中的命令并检查命令退出的状态码，如果状态码为0则说明已经就绪。

* HTTP GET：往容器的IP:Port发送HTTP GET请求，如果Probe收到2xx或3xx，说明已经就绪。

* TCP Socket：尝试与容器建立TCP连接，如果能建立连接说明已经就绪。

#### Readiness Probe的工作原理

通过Endpoints就可以实现Readiness Probe的效果，当Pod还未就绪时，将Pod的IP:Port从Endpoints中删除，Pod就绪后再加入到Endpoints中，如下图所示。

图1 Readiness Probe的实现原理

![](/znote/img/devops/F1aWbXVlVo8dTGxSZYTckp4Wnqd.png)

#### Exec

Exec方式与HTTP GET方式一致，如下所示，这个探针执行ls /ready命令，如果这个文件存在，则返回0，说明Pod就绪了，否则返回其他状态码。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - image: nginx:alpine
        name: container-0
        resources:
          limits:
            cpu: 100m
            memory: 200Mi
          requests:
            cpu: 100m
            memory: 200Mi
        readinessProbe:      # Readiness Probe
          exec:              # 定义 ls /ready 命令
            command:            
            - ls            
            - /ready
      imagePullSecrets:
      - name: default-secret
```

将上面Deployment的定义保存到deploy-ready.yaml文件中，删除之前创建的Deployment，用deploy-ready.yaml创建这个Deployment。

```plain&#x20;text
# kubectl delete deploy nginx
deployment.apps "nginx" deleted

# kubectl create -f deploy-ready.yaml
deployment.apps/nginx created
```

这里由于nginx镜像不包含/ready这个文件，所以在创建完成后容器不在Ready状态，如下所示，注意READY这一列的值为0/1，表示容器没有Ready。

```plain&#x20;text
# kubectl get po
NAME                     READY     STATUS    RESTARTS   AGE
nginx-7955fd7786-686hp   0/1       Running   0          7s
nginx-7955fd7786-9tgwq   0/1       Running   0          7s
nginx-7955fd7786-bqsbj   0/1       Running   0          7s
```

创建Service。

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx        
spec:
  selector:          
    app: nginx
  ports:
  - name: service0
    targetPort: 80   
    port: 8080       
    protocol: TCP    
  type: ClusterIP
```

查看Service，发现Endpoints一行的值为空，表示没有Endpoints。

```yaml
$ kubectl describe svc nginx
Name:              nginx
......
Endpoints:         
......
```

如果此时给容器中创建一个/ready的文件，让Readiness Probe成功，则容器会处于Ready状态。再查看Pod和Endpoints，发现创建了/ready文件的容器已经Ready，Endpoints也已经添加。

```sql
# kubectl exec nginx-7955fd7786-686hp -- touch /ready

# kubectl get po -o wide
NAME                     READY     STATUS    RESTARTS   AGE       IP
nginx-7955fd7786-686hp   1/1       Running   0          10m       192.168.93.169 
nginx-7955fd7786-9tgwq   0/1       Running   0          10m       192.168.166.130
nginx-7955fd7786-bqsbj   0/1       Running   0          10m       192.168.252.160

# kubectl get endpoints
NAME       ENDPOINTS           AGE
nginx      192.168.93.169:80   14d
```

#### HTTP GET

Readiness Probe的配置与存活探针（livness probe）一样，都是在Pod Template的containers里面，如下所示，这个Readiness Probe向Pod发送HTTP请求，当Probe收到2xx或3xx返回时，说明Pod已经就绪。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - image: nginx:alpine
        name: container-0
        resources:
          limits:
            cpu: 100m
            memory: 200Mi
          requests:
            cpu: 100m
            memory: 200Mi
        readinessProbe:           # readinessProbe          
          httpGet:                # HTTP GET定义            
            path: /read            
            port: 80
      imagePullSecrets:
      - name: default-secret
```

#### TCP Socket

同样，TCP Socket类型的探针如下所示。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - image: nginx:alpine
        name: container-0
        resources:
          limits:
            cpu: 100m
            memory: 200Mi
          requests:
            cpu: 100m
            memory: 200Mi
        readinessProbe:             # readinessProbe          
          tcpSocket:                # TCP Socket定义            
            port: 80
      imagePullSecrets:
      - name: default-secret
```

#### Readiness Probe高级配置

与Liveness Probe相同，Readiness Probe也有同样的高级配置选项，上面nginx Pod的describe命令回显有中有如下行。

```yaml
Readiness: exec [ls /var/ready] delay=0s timeout=1s period=10s #success=1 #failure=3
```

这一行表示Readiness Probe的具体参数配置，其含义如下：

* delay=0s 表示容器启动后立即开始探测，没有延迟时间

* timeout=1s 表示容器必须在1s内做出相应反馈给probe，否则视为探测失败

* period=10s 表示每10s探测一次

* \#success=1 探测连续1次成功表示成功

* \#failure=3 探测连续3次失败表示失败

这些是创建时默认设置的，您也可以手动配置，如下所示。

```yaml
        readinessProbe:      # Readiness Probe
          exec:              # 定义 ls /readiness/ready 命令
            command:            
            - ls            
            - /readiness/ready          
          initialDelaySeconds: 10    # 容器启动后多久开始探测
          timeoutSeconds: 2          # 表示容器必须在2s内做出相应反馈给probe，否则视为探测失败
          periodSeconds: 30          # 探测周期，每30s探测一次
          successThreshold: 1        # 连续探测1次成功表示成功
          failureThreshold: 3        # 连续探测3次失败表示失败
```

## NetworkPolicy

NetworkPolicy是Kubernetes设计用来限制Pod访问的对象，相当于从应用的层面构建了一道防火墙，进一步保证了网络安全。NetworkPolicy支持的能力取决于集群的网络插件的能力。

默认情况下，如果命名空间中不存在任何策略，则所有进出该命名空间中的Pod的流量都被允许。

NetworkPolicy的规则可以选择如下3种：

* namespaceSelector：根据命名空间的标签选择，具有该标签的命名空间都可以访问。

* podSelector：根据Pod的标签选择，具有该标签的Pod都可以访问。

* ipBlock：根据网络选择，网段内的IP地址都可以访问。（仅Egress支持IPBlock）

#### 通过YAML使用Ingress规则

* 场景一：通过网络策略限制Pod只能被带有特定标签的Pod访问

图1 podSelector

![](/znote/img/devops/55C8E553-D58D-4E30-B477-CE3AD4B594FE.png)

目标Pod具有role=db标签，该Pod只允许带有role=frontend标签的Pod访问其6379端口。设置该网络策略的具体操作步骤如下：

* 场景二：通过网络策略限制Pod只能被指定命名空间下的Pod访问

图2 namespaceSelector

![](/znote/img/devops/476F0CA6-54A3-444A-8045-C828D374573A.png)

目标Pod具有role=db标签，该Pod只允许project=myproject标签的命名空间中的Pod访问其6379端口。设置该网络策略的具体操作步骤如下：

#### 通过YAML使用Egress规则

**说明：**

容器隧道网络模型集群中，1.23及以上集群版本支持Egress规则操作系统。

* 场景一：通过网络策略限制Pod只能访问指定地址

图3 ipBlock

![](/znote/img/devops/VF7NbVb39oJDmfxhci4cFvY1nyh.png)

目标Pod具有role=db标签，该Pod只允许访问172.16.0.16/16网段，但不允许访问该网段中的172.16.0.40/32地址。

这个描述是关于 **网络访问控制** 的规则，它的意思是：

1. 该 Pod **允许访问** `172.16.0.16/16` 网段，表示它可以访问 `172.16.0.0` 到 `172.16.255.255` 之间的所有 IP 地址。

2. 但是，它 **不允许访问** `172.16.0.40/32`，表示 `172.16.0.40` 这个特定的 IP 地址是被**排除**的，Pod 不能与其进行网络通信。

设置该网络策略的具体操作步骤如下：

* 场景二：通过网络策略限制Pod只能被带有特定标签的Pod访问，且只能访问指定Pod

图4 同时使用Ingress和Egress

![](/znote/img/devops/IXFBbw6LioAnTTxxJ2Tc72x9nvy.png)

目标Pod具有role=db标签，该Pod只允许带有role=frontend标签的Pod访问其6379端口，且该Pod只能访问带有role=web标签的Pod。网络策略中的Ingress和Egress可以定义在同一个规则中，具体操作步骤如下：


<Reward/>