---
title: Kubernetes-6 配置管理
date: 2026-01-26
tags:
- k8s
categories:
- 能力扩展 DevOps
isShowComments: true
---

<Boxx/>

<!-- more -->

[[toc]]

## ConfigMap

ConfigMap是一种用于存储应用所需配置信息的资源类型，用于保存配置数据的键值对，可以用来保存单个属性，也可以用来保存配置文件。

通过ConfigMap可以方便地做到配置解耦，使得不同环境有不同的配置。

#### 创建ConfigMap

下面示例创建了一个名为configmap-test的ConfigMap，ConfigMap的配置数据在data字段下定义。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: configmap-test
data:                     # 配置数据
  property_1: Hello  
  property_2: World
```

#### 在环境变量中引用ConfigMap

ConfigMap最为常见的使用方式就是在环境变量和Volume中引用。

例如下面例子中，引用了configmap-test的property\_1，将其作为环境变量EXAMPLE\_PROPERTY\_1的值，这样容器启动后里面EXAMPLE\_PROPERTY\_1的值就是property\_1的值，即“Hello”。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx
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
    env:
    - name: EXAMPLE_PROPERTY_1
      valueFrom:
        configMapKeyRef:          # 引用ConfigMap
          name: configmap-test          
          key: property_1
  imagePullSecrets:
  - name: default-secret
```

#### 在Volume中引用ConfigMap

在Volume中引用ConfigMap，就是通过文件的方式直接将ConfigMap的每条数据填入Volume，每条数据是一个文件，键就是文件名，键值就是文件内容。

如下示例中，创建一个名为vol-configmap的Volume，这个Volume引用名为“configmap-test”的ConfigMap，再将Volume挂载到容器的“/tmp”路径下。Pod创建成功后，在容器的“/tmp”路径下，就有两个文件property\_1和property\_2，它们的值分别为“Hello”和“World”。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx
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
    volumeMounts:
    - name: vol-configmap           # 挂载名为vol-configmap的Volume
      mountPath: "/tmp"
  imagePullSecrets:
  - name: default-secret
  volumes:
  - name: vol-configmap
    configMap:                      # 引用ConfigMap
      name: configmap-test
```

## Secret

Secret是一种加密存储的资源对象，您可以将认证信息、证书、私钥等保存在Secret中，而不需要把这些敏感数据暴露到镜像或者Pod定义中，从而更加安全和灵活。

Secret与ConfigMap非常像，都是key-value键值对形式，使用方式也相同，不同的是Secret会加密存储，所以适用于存储敏感信息。

#### Base64编码

Secret与ConfigMap相同，是以键值对形式保存数据，所不同的是在创建时，Secret的Value必须使用Base64编码。

对字符串进行Base64编码，可以直接使用“echo -n 要编码的内容 | base64”命令即可，示例如下：

```yaml
root@ubuntu:~# echo -n "3306" | base64
MzMwNg==
```

#### 创建Secret

如下示例中定义的Secret中包含两条Key-Value。

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: mysecret
data:  
  key1: aGVsbG8gd29ybGQ=   # "hello world" Base64编码后的值
  key2: MzMwNg==           # "3306" Base64编码后的值
```

#### 在环境变量中引用Secret

Secret最常见的用法是作为环境变量注入到容器中，如下示例。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx
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
    env:
    - name: key
      valueFrom:
        secretKeyRef:          
          name: mysecret          
          key: key1
  imagePullSecrets:
  - name: default-secret
```

#### 在Volume中引用Secret

在Volume中引用Secret，就是通过文件的方式直接将Secret的每条数据填入Volume，每条数据是一个文件，键就是文件名，键值就是文件内容。

如下示例中，创建一个名为vol-secret的Volume，这个Volume引用名为“mysecret”的Secret，再将Volume挂载到容器的“/tmp”路径下。Pod创建成功后，在容器的“/tmp”路径下，就有两个文件key1和key2。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx
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
    volumeMounts:
    - name: vol-secret              # 挂载名为vol-secret的Volume
      mountPath: "/tmp"
  imagePullSecrets:
  - name: default-secret
  volumes:
  - name: vol-secret
    secret:                         # 引用Secret
      secretName: mysecret
```

进入Pod容器中，可以在/tmp目录下发现key1和key2两个文件，并看到文件中的值是base64解码后的值，分别为“hello world”和“3306”。

<Reward/>