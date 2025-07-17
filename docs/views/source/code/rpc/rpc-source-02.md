---
title: 手写RPC-02：快速实践与运行测试
date: 2025-06-09
tags:
  - 源码分析
  - Java
categories:
  - 源码 Source-code
isShowComments: true
---

<Boxx/>

在上一篇章中，我们详细探讨了 RPC 框架的整体设计思想和核心概念。本文作为实践篇，将快速搭建并运行 RPC 框架的示例，了解其项目结构和基本使用方式。通过实际运行，我们将对 RPC 框架的运作有一个直观的认知，为后续深入理解源码实现打下基础。

<!-- more -->

[[toc]]

## 1. 项目结构概述

大致分为核心包、客户端、服务端、api包、组件spi扩展、项目配置文件抽取等（我这里为了简单作为单体项目实现了，当然也可以拆分为多模块项目实现）。直接贴图吧

![snail_rpc_project.png](/znote/img/source/snail_rpc_project.png)

## 2. 快速使用指南

框架提供了简洁的启动方式，可以通过 `RpcServer`、`RpcServerMultiple` 和 `RpcClient` 这三个示例类来体验其基本功能。

-   **服务端启动**：`RpcServer` 用于启动单个 RPC 服务端，它会自动发现并注册带有 `@RpcService` 注解的服务，并对外提供 RPC 调用能力。
-   **多实例服务端启动**：`RpcServerMultiple` 用于启动多个 RPC 服务端实例，模拟服务在多台服务器上部署的场景，这对于后续测试负载均衡策略非常有用。
-   **客户端调用**：`RpcClient` 用于模拟客户端发起 RPC 调用。它会自动发现可用的服务端实例，并通过动态代理无感知地调用远程服务。

以下是核心示例代码：

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
        new RpcServerManager(8024).startAsync();
        new RpcServerManager(8025).startAsync();
        new RpcServerManager(8026).startAsync();
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

## 3. 测试

直接启动上述3个类问题，先后顺序无所谓。

### 3.1 启动客户端 RpcClient

这里我们先启动客户端，可以看到刚开始调用时都是连接拒绝（服务端没启动，没有对外提供服务）

![snail_rpc_client_connect_refused.png](/znote/img/source/snail_rpc_client_connect_refused.png)

### 3.2 启动服务端 RpcServerMultiple

可以看到，服务端启动后，服务自动注册对外提供服务、收到客户端连接

![snail_rpc_server_register.png](/znote/img/source/snail_rpc_server_register.png)
![snail_rpc_server_connect.png](/znote/img/source/snail_rpc_server_connect.png)


### 3.3 再次查看客户端调用结果

与rpc服务端连接成功，并进行了负载均衡（取决于实现算法，默认轮询），远程调用成功

![snail_rpc_client_connect_success.png](/znote/img/source/snail_rpc_client_connect_success.png)

欧克，现在知道了框架的运行机制，下一章我们看源码是怎么实现的。

项目源码参考我的仓库：[https://github.com/zpj80231/snail/tree/main/snail-source-code/source-rpc](https://github.com/zpj80231/snail/tree/main/snail-source-code/source-rpc)

<Reward/>