---
title: Kubernetes-9 认证与授权
date: 2026-03-17
tags:
- k8s
categories:
- 能力扩展 DevOps
isShowComments: true
---

<Boxx/>

<!-- more -->

[[toc]]

## ServiceAccount

Kubernetes中所有的访问，无论外部内部，都会通过API Server处理，访问Kubernetes资源前需要经过认证与授权。

* Authentication：用于识别用户身份的认证，Kubernetes分外部服务账号和内部服务账号，采取不同的认证机制，具体请参见认证与ServiceAccount。

* Authorization：用于控制用户对资源访问的授权，对访问的授权目前主要使用RBAC机制，将在RBAC介绍。

图1 API Server的认证授权

![](/znote/img/devops/Q5sqbHuxmo48A8xaokvctEWbnGh.png)

#### 认证与ServiceAccount

Kubernetes的用户分为服务账户（ServiceAccount）和普通账户两种类型。

* 服务账户与Namespace绑定，关联一套凭证，Pod创建时挂载Token，从而允许与API Server之间调用。

* Kubernetes中没有代表普通账户的对象，这类账户默认由外部服务独立管理。

与Pod、ConfigMap类似，ServiceAccount是Kubernetes中的资源，属于命名空间级别。当创建一个新的命名空间时，系统会自动在其中生成一个名为default的ServiceAccount。

使用下面命令可以查看ServiceAccount。

```yaml
# kubectl get sa
NAME     SECRETS   AGE
default  1         30d
```

**说明：**

* 1.21以前版本的集群中，Pod中获取Token的形式是通过挂载ServiceAccount的Secret来获取Token，这种方式获得的Token是永久的。该方式在1.21及以上的版本中不再推荐使用，并且根据社区版本迭代策略，在1.25及以上版本的集群中，ServiceAccount将不会自动创建对应的Secret。

* 1.21及以上版本的集群中，直接使用[TokenRequest](https://kubernetes.io/zh-cn/docs/reference/kubernetes-api/authentication-resources/token-request-v1/) API[获得Token](https://kubernetes.io/zh-cn/docs/reference/access-authn-authz/service-accounts-admin/#bound-service-account-token-volume)，并使用投射卷（Projected Volume）挂载到Pod中。使用这种方法获得的Token具有固定的生命周期，并且当挂载的Pod被删除时这些Token将自动失效。详情请参见Token安全性提升说明。

* 如果在业务中需要一个永不过期的Token，您也可以选择[手动管理ServiceAccount的Secret](https://kubernetes.io/zh-cn/docs/reference/access-authn-authz/service-accounts-admin/#manual-secret-management-for-serviceaccounts)。尽管存在手动创建永久ServiceAccount Token的机制，但还是推荐使用[TokenRequest](https://kubernetes.io/zh-cn/docs/reference/kubernetes-api/authentication-resources/token-request-v1/)的方式使用短期的Token，以提高安全性。

1.25以前版本的集群中，ServiceAccount会自动创建对应的Secret。1.25及以上版本的集群中，ServiceAccount将不会自动创建对应的Secret。下面分别查看两种集群下的ServiceAccount状态。

* 1.25以前版本集群，查看名为default的ServiceAccount状态。

**kubectl describe sa default**

回显内容如下，说明default自动创建对应的Secret，即default-token-vssmw。

```sql
Name:                  default
Namespace:             default
Labels:                <none>
Annotations:           <none>
Image pull secrets:    <none>
Mountable secrets:     default-token-vssmw
Tokens:                default-token-vssmw
Events:                <none>
```

* 1.25及以上版本集群，查看名为default的ServiceAccount状态。

**kubectl describe sa default**

由回显内容可知，default未自动创建对应的Secret。

```sql
Name:                     default
Namespace:                default 
Labels:                   <none>
Annotations:              <none>
Image pull secrets:       <none>
Mountable secrets:        <none>
Tokens:                   <none>
Events:                   <none>
```

在Pod的定义文件中，可以用指定账户名称的方式将一个ServiceAccount赋值给一个Pod，如果不指定就会使用默认的ServiceAccount。当API Server接收到一个带有认证Token的请求时，API Server会用这个Token来验证发送请求的客户端所关联的ServiceAccount是否允许执行请求的操作。

#### 创建ServiceAccount

1. 以1.29版本集群为例，使用如下命令在default命名空间内创建ServiceAccount。

kubectl create serviceaccount ***sa-example***

```sql
serviceaccount/sa-example created
```

使用以下命令可以检查sa-example是否创建成功，若NAME列出现sa-example则说明创建成功。

kubectl get sa

```sql
NAME            SECRETS   AGE
default         1         30d
sa-example      0         2s
```

由于本案例使用的集群版本在1.25以上，ServiceAccount将不会自动创建对应的Secret。使用以下命令可以查看创建的ServiceAccount的详细信息，回显中Mountable secrets和Tokens值为none，则说明该ServiceAccount没有自动创建Secret。

kubectl describe sa ***sa-example***

```sql
Name:                   sa-example
Namespace:              default
Labels:                 <none>
Annotations:            <none>
Image pull secrets:     <none>
Mountable secrets:      <none>
Tokens:                 <none>
Events:                 <none>
```



* 这里选择手动管理Secret，从而得到永不过期的Token。利用以下代码，手动创建名为sa-example-token的Secret，并与名为sa-example的ServiceAccount关联。

```sql
kubectl apply -f - <<EOF
apiVersion: v1 
kind: Secret 
metadata:
  namespace: default  
  name: sa-example-token  
  annotations:
    kubernetes.io/service-account.name: sa-example 
type: kubernetes.io/service-account-token 
EOF
```



* 检查sa-example-token是否创建成功。若命名空间default的Secrets中出现sa-example-token，则说明创建成功。

kubectl get secrets

```sql
NAME                        TYPE                                    DATA        AGE
default-secret              kubernetes.io/dockerconfigjson          1           6d20h
paas.elb                    cfe/secure-opaque                       1           6d20h
sa-example-token            kubernetes.io/service-account-token     3           16s
```

查看Secret的内容，可以发现ca.crt、namespace和token三个数据。

kubectl describe secre&#x74;**&#x20;*sa-example-token***

```sql
Name:         sa-example-token
Namespace:    default
Labels:       <none>
Annotations:  kubernetes.io/service-account.name: sa-example
              kubernetes.io/service-account.uid: 4b7d3e19-1dfe-4ee0-bb49-4e2e0c3c5e25

Type:  kubernetes.io/service-account-token

Data
====
ca.crt:     1123 bytes
namespace:  7 bytes
token:      eyJhbGciOiJSU...
```



* 检验ServiceAccount与新建的Secret关联是否成功，即检查ServiceAccount是否获取到Token。由回显内容可知，sa-example与sa-example-token关联成功。

kubectl describe s&#x61;**&#x20;*sa-example***

```sql
Name:                 sa-example
Namespace:            default
Labels:               <none>
Annotations:          <none>
Image pull secrets:   <none>
Mountable secrets:    <none>
Tokens:               sa-example-token
Events:               <none>
```

#### 在Pod中使用ServiceAccount

Pod中使用ServiceAccount非常方便，只需要指定ServiceAccount的名称即可。下面以“nginx:latest”为例，演示具体步骤。

1. 创建一个名为sa-pod.yaml的描述文件。其中，mysql.yaml为自定义名称，您可以随意命名。

vi&#x6D;**&#x20;*sa-pod.yaml***

**须知：**

为了确保Pod能够使用手动创建的Secret中的Token，需要明确地将该Secret挂载到容器中，挂载方式请参见描述文件中的加粗代码。

文件内容如下：

```sql
apiVersion: v1
kind: Pod
metadata:
  name: sa-pod
spec:
  serviceAccountName: sa-example                  #  指定sa-example为Pod使用的服务账户
  imagePullSecrets:
  - name: default-secret
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
    volumeMounts:                             #  将名为secret-volume的存储卷挂载到Pod
    - name: secret-volume      
      readOnly: true                          #  表示挂载的存储卷是只读的
      mountPath: "/etc/secret-volume"         #  指定存储卷在容器内部的挂载路径，可以自定义
  volumes:                                    #  定义Pod可以使用的Secret存储卷
  - name: secret-volume                       #  指定Secret存储卷的名称，可以自定义
    secret:                                   #  指定这个存储卷的类型为Secret
      secretName: sa-example-token            #  将之前建立的sa-example-token挂载到定义的存储卷
```

* 创建并查看这个Pod，可以看到Pod挂载了sa-example-token，即Pod可以使用这个Token来做认证。

kubectl create -&#x66;**&#x20;*sa-pod.yaml***

回显内容如下：

```sql
pod/sa-pod created
```

使用以下代码，检验Pod是否创建成功。

kubectl get pod

回显内容如下，若sa-pod的状态为Running，则说明Pod创建成功

```sql
NAME                 READY   STATUS              RESTARTS   AGE
sa-pod               1/1     running             0          5s
```

* 查看sa-pod的具体信息，可以检验sa-example-token是否挂载成功。

kubectl describe po&#x64;**&#x20;*sa-pod***

回显内容如下：

```sql
...
Containers:
  container-0:
    Container ID:

    Image:          nginx:latest
    Image ID:

    Port:           <none>
    Host Port:      <none>
    State:          Waiting
      Reason:       ImagePullBackOff
    Ready:          False
    Restart Count:  0
    Limits:
      cpu:     100m
      memory:  200Mi
    Requests:
      cpu:        100m
      memory:     200Mi
    Environment:  <none>
    Mounts:
       #  表示Pod已挂载sa-example-token，即Pod可以使用这个Token来做认证 
      /etc/secret-volume from secret-volume (ro)     
       #  自动挂载的TokenRequest，可以提供短期的Token
      /var/run/secrets/kubernetes.io/serviceaccount from kube-api-access-2s4sw (ro)  
...
```

进入Pod内部，还可以看到对应的文件，具体命令如下。其中，cd后的路径与secret-volume的挂载路径一致。

```sql
kubectl exec -it sa-pod -- /bin/sh
cd /etc/secret-volume
ls
```

回显内容如下：

```sql
ca.crt     namespace  token
```

* 验证手动创建的ServiceAccount Token能否生效。

  1. 在Kubernetes集群中，默认为API Server创建了一个名为kubernetes的Service，通过这个Service可以访问集群内的Pod资源。ctrl+d退出Pod后，使用以下命令可以查看该服务的具体信息。

  kubectl get svc

  回显内容如下：

  ```sql
  NAME           TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)          AGE
  kubernetes     ClusterIP   10.247.0.1       <none>        443/TCP          34
  ```

  b. 进入Pod，并检查Pod是否能够在不使用Token的情况下通过API Server访问集群内的Pod资源。

  ```sql
  kubectl exec -it sa-pod -- /bin/sh
  curl https://10.247.0.1:443/api/v1/namespaces/default/pods
  ```

回显结果如下，说明Pod不能直接通过API Server访问集群内的Pod资源。

export CURL\_CA\_BUNDLE =**&#x20;*/etc/secret-volume/ca.crt***

&#x20;     d. 将Token的内容放到TOKEN中。

TOKEN=$(cat ***/etc/secret-volume/token***)

检验TOKEN是否设置成功。

echo $TOKEN

若回显内容如下，则设置成功。

## RBAC

#### RBAC资源

Kubernetes中完成授权工作的就是RBAC机制，RBAC授权规则是通过四种资源来进行配置。

* Role：角色，其实是定义一组对Kubernetes资源（命名空间级别）的访问规则。

* RoleBinding：角色绑定，定义了用户和角色的关系。

* ClusterRole：集群角色，其实是定义一组对Kubernetes资源（集群级别，包含全部命名空间）的访问规则。

* ClusterRoleBinding：集群角色绑定，定义了用户和集群角色的关系。

Role和ClusterRole指定了可以对哪些资源做哪些动作，RoleBinding和ClusterRoleBinding将角色绑定到特定的用户、用户组或ServiceAccount上。如下图所示。

图1 角色绑定

![](/znote/img/devops/CIbSbLL39ommdMx9i31cwqm0n7M.png)

#### 创建Role

Role的定义非常简单，指定namespace，然后就是rules规则。如下面示例中的规则就是允许对default命名空间下的Pod进行GET、LIST操作。

```sql
kind: Role
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  namespace: default                          # 命名空间
  name: role-example
rules:
- apiGroups: [""]  
  resources: ["pods"]                         # 可以访问pod
  verbs: ["get", "list"]                      # 可以执行GET、LIST操作
```

#### 创建RoleBinding

有了Role之后，就可以将Role与具体的用户绑定起来，实现这个的就是RoleBinding了。如下所示。

```sql
kind: RoleBinding
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: rolebinding-example
  namespace: default
subjects:                                 # 指定用户
- kind: User                              # 普通用户
  name: user-example
  apiGroup: rbac.authorization.k8s.io
- kind: ServiceAccount                    # ServiceAccount
  name: sa-example
  namespace: default
roleRef:                                  # 指定角色
  kind: Role
  name: role-example
  apiGroup: rbac.authorization.k8s.io
```

这里的subjects就是将Role与用户绑定起来，用户可以是外部普通用户，也可以是ServiceAccount，这两种用户类型在ServiceAccount有过介绍。绑定后的关系如下图所示。

图2 RoleBinding绑定Role和用户

![](/znote/img/devops/WLcVbMt4codY8uxqNcGcylM6n9c.png)

下面来验证一下授权是否生效。

在前面一个章节使用ServiceAccount中，创建一个Pod，使用了sa-example这个ServiceAccount，而刚刚又给sa-example绑定了role-example这个角色，现在进入到Pod，使用curl命令通过API Server访问资源来验证权限是否生效。

使用sa-example对应的ca.crt和Token认证，查询default命名空间下所有Pod资源，对应创建Role中的LIST。

```javascript
$ kubectl exec -it sa-pod -- /bin/sh 
# export CURL_CA_BUNDLE=/var/run/secrets/kubernetes.io/serviceaccount/ca.crt
# TOKEN=$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)
# curl -H "Authorization: Bearer $TOKEN" https://kubernetes/api/v1/namespaces/default/pods
{
  "kind": "PodList",
  "apiVersion": "v1",
  "metadata": {
    "selfLink": "/api/v1/namespaces/default/pods",
    "resourceVersion": "10377013"
  },
  "items": [
    {
      "metadata": {
        "name": "sa-example",
        "namespace": "default",
        "selfLink": "/api/v1/namespaces/default/pods/sa-example",
        "uid": "c969fb72-ad72-4111-a9f1-0a8b148e4a3f",
        "resourceVersion": "10362903",
        "creationTimestamp": "2020-07-15T06:19:26Z"
      },
      "spec": {
...
```

返回结果正常，说明sa-example是有LIST Pod的权限的。再查询一下Deployment，返回如下，说明没有访问Deployment的权限。

```sql
# curl -H "Authorization: Bearer $TOKEN" https://kubernetes/api/v1/namespaces/default/deployments
...
  "status": "Failure",
  "message": "deployments is forbidden: User \"system:serviceaccount:default:sa-example\" cannot list resource \"deployments\" in API group \"\" in the namespace \"default\"",
...
```

Role和RoleBinding作用的范围是命名空间，能够做到一定程度的权限隔离，如下图所示，上面定义role-example就不能访问kube-system命名空间下的资源。

图3 Role和RoleBinding作用的范围是命名空间

![](/znote/img/devops/5C0EF0C6-9B4C-4877-A91A-E8A713522A21.png)

在上面Pod中继续访问，返回如下，说明确实没有权限。

```sql
# curl -H "Authorization: Bearer $TOKEN" https://kubernetes/api/v1/namespaces/kube-system/pods
...
  "status": "Failure",
  "message": "pods is forbidden: User \"system:serviceaccount:default:sa-example\" cannot list resource \"pods\" in API group \"\" in the namespace \"kube-system\"",
  "reason": "Forbidden",
...
```

在RoleBinding中，还可以绑定其他命名空间的ServiceAccount，只要在subjects字段下添加其他命名空间的ServiceAccount即可。

```sql
subjects:                                 # 指定用户
- kind: ServiceAccount                    # ServiceAccount
  name: kube-sa-example
  namespace: kube-system
```

加入之后，kube-system下kube-sa-example这个ServiceAccount就可以GET、LIST命名空间default下的Pod了，如下图所示。

图4 跨命名空间访问

![](/znote/img/devops/BgxgbN7rMowM45xtKuycHovAnrc.png)

#### ClusterRole和ClusterRoleBinding

相比Role和RoleBinding，ClusterRole和ClusterRoleBinding有如下几点不同：

* ClusterRole和ClusterRoleBinding不用定义namespace字段

* ClusterRole可以定义集群级别的资源

可以看出ClusterRole和ClusterRoleBinding控制的是集群级别的权限。

在Kubernetes中，默认定义了非常多的ClusterRole和ClusterRoleBinding，如下所示。

```sql
$ kubectl get clusterroles
NAME                                                                   AGE
admin                                                                  30d
cceaddon-prometheus-kube-state-metrics                                 6d3h
cluster-admin                                                          30d
coredns                                                                30d
custom-metrics-resource-reader                                         6d3h
custom-metrics-server-resources                                        6d3h
edit                                                                   30d
prometheus                                                             6d3h
system:aggregate-customedhorizontalpodautoscalers-admin                6d2h
system:aggregate-customedhorizontalpodautoscalers-edit                 6d2h
system:aggregate-customedhorizontalpodautoscalers-view                 6d2h
....
view                                                                   30d

$ kubectl get clusterrolebindings
NAME                                                   AGE
authenticated-access-network                           30d
authenticated-packageversion                           30d
auto-approve-csrs-for-group                            30d
auto-approve-renewals-for-nodes                        30d
auto-approve-renewals-for-nodes-server                 30d
cceaddon-prometheus-kube-state-metrics                 6d3h
cluster-admin                                          30d
cluster-creator                                        30d
coredns                                                30d
csrs-for-bootstrapping                                 30d
system:basic-user                                      30d
system:ccehpa-rolebinding                              6d2h
system:cluster-autoscaler                              6d1h
...
```

其中，最重要最常用的是如下四个ClusterRole。

* view：拥有查看命名空间资源的权限

* edit：拥有修改命名空间资源的权限

* admin：拥有命名空间全部权限

* cluster-admin：拥有集群的全部权限

使用kubectl describe clusterrole命令能够查看到各个规则的具体权限。

通常情况下，使用这四个ClusterRole与用户做绑定，就可以很好的做到权限隔离。这里的关键一点是理解到Role（规则、权限）与用户是分开的，只要通过Rolebinding来对这两者进行组合就能做到灵活的权限控制。

<Reward/>