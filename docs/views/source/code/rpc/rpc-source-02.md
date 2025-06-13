---
title: 手写 RPC 02：项目结构及远程调用
date: 2025-06-09
tags:
  - 源码分析
  - Java
categories:
  - 源码 Source-code
isShowComments: true
---

<Boxx/>

对项目结构做一个简单的介绍，了解项目不同模块都是做什么的，然后对框架做一个运行测试。

先对想做的东西有了清楚的认知之后，再下手或再去了解就简单多了。

<!-- more -->

我的项目源码地址参考：https://github.com/zpj80231/snail/tree/main/snail-source-code/source-rpc

[[toc]]

## 项目结构

大致分为核心包、客户端、服务端、api包、组件spi扩展、项目配置文件抽取等（我这里为了简单作为单体项目实现了，当然也可以拆分为多模块项目实现）。直接贴图吧

![snail_rpc_project.png](/znote/img/source/snail_rpc_project.png)

## 使用

使用的话直接参考：RpcServer、RpcServerMultiple、RpcClient 这3个类即可

主要逻辑就是：

- 服务端启动，自动发现并注册，然后对外提供服务。
- 客户端启动，函数调用时，自动代理、自动发现、负载均衡、远程调用。

```java
@EnableRpcServer
public class RpcServer {

    public static void main(String[] args) {
        // 启动一个服务端，默认端口为 8023
        new RpcServerManager().start();
    }

}
```

```java
@EnableRpcServer
public class RpcServerMultiple {

    public static void main(String[] args) {
        // 启动多个服务端，模拟serviceImpl在多个服务器上，客户端自动负载均衡
        new Thread(() -> new RpcServerManager(8024).start()).start();
        new Thread(() -> new RpcServerManager(8025).start()).start();
        new Thread(() -> new RpcServerManager(8026).start()).start();
    }

}
```

```java
@Slf4j
public class RpcClient {

    /**
     * 用于请求发起，模拟一次请求
     */
    private static final ExecutorService executorService = Executors.newCachedThreadPool();

    public static void main(String[] args) {
        RpcClientManager rpcClientManager = new RpcClientManager();

        // 测试1：默认代理，加 @RpcReference 的话，按注解的分组和版本号走
        RpcClientProxy proxy = new RpcClientProxy(rpcClientManager);
        HelloService helloService = proxy.getProxyService(HelloService.class);

        // 测试2：为代理手动指定分组和版本，模拟加了 @RpcReference 情况 (方便和 Spring 集成)
        RpcReferenceBuilder rpcReferenceBuilder = RpcReferenceBuilder.builder()
                .group("uat").version("2.0.0").service(HelloService.class).build();
        RpcClientProxy proxyRpcReference = new RpcClientProxy(rpcClientManager, rpcReferenceBuilder);
        HelloService helloServiceV2 = proxyRpcReference.getProxyService(HelloService.class);

        // 测试3：可随时启动关闭多个服务端，查看客户端自动负载均衡
        int i = 0;
        while (i <= Integer.MAX_VALUE) {
            ThreadUtil.sleep(1000);
            if (RandomUtil.randomInt(10) > 7) {
                executorService.execute(new Controller(helloServiceV2, " --> 手动hi-模拟@RpcReference-" + i++));
                continue;
            }
            executorService.execute(new Controller(helloService, " --> 默认hi-" + i++));
        }
    }

    /**
     * 模拟一个 Controller
     */
    private static class Controller implements Runnable {

        private final HelloService helloService;
        private final String msg;

        public Controller(HelloService helloService, String msg) {
            this.helloService = helloService;
            this.msg = msg;
        }

        @Override
        public void run() {
            String result = helloService.hello(msg);
            log.info("result: {}", result);
        }

    }

}
```

## 测试

直接启动上述3个类问题，先后顺序无所谓。

### 启动客户端 RpcClient

这里我们先启动客户端，可以看到刚开始调用时都是连接拒绝（服务端没启动，没有对外提供服务）

![snail_rpc_client_connect_refused.png](/znote/img/source/snail_rpc_client_connect_refused.png)

### 启动服务端 RpcServerMultiple

可以看到，服务端启动后，服务自动注册对外提供服务、收到客户端连接

![snail_rpc_server_register.png](/znote/img/source/snail_rpc_server_register.png)
![snail_rpc_server_connect.png](/znote/img/source/snail_rpc_server_connect.png)


### 再次查看客户端调用

与rpc服务端连接成功，并进行了负载均衡（取决于实现算法，默认轮询），远程调用成功

![snail_rpc_client_connect_success.png](/znote/img/source/snail_rpc_client_connect_success.png)


<Reward/>