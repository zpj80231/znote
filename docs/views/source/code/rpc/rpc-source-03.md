---
title: 手写RPC-03：与 Spring 深度集成
date: 2025-07-10
tags:
  - 源码分析
  - Java
categories:
  - 源码 Source-code
isShowComments: true
---

<Boxx/>

在微服务架构盛行的今天，RPC（Remote Procedure Call，远程过程调用）框架成为服务间通信的核心技术之一。为了让 RPC 能够无缝融入 Spring 生态，开发者通常会实现一套 Starter 机制，结合 Spring 的自动装配、注解驱动和 Bean 生命周期管理，实现“开箱即用”的开发体验。本文还是以自研 RPC 框架为例，介绍其与 Spring 集成的实现思路与关键技术点。

<!-- more -->

[[toc]]

## 1. 目录结构与模块划分

接上一章，重构项目为采用多模块结构，核心模块包括：

- source-rpc-api：RPC 公共接口定义
- source-rpc-core：RPC 框架核心实现（与 Spring 集成的核心代码实现）
- source-rpc-client：RPC 客户端（Spring程序）示例
- source-rpc-server：RPC 服务端（Spring程序）示例

与 Spring 集成的相关代码主要位于 source-rpc-core 模块下的 com.sanil.source.code.rpc.spring 包。

![snail_rpc_module_project.png](/znote/img/source/snail_rpc_module_project.png)

ok，模块划分完成，下面开始实现核心功能。

## 2. 注解驱动：Enable 与 Service

主要通过一系列注解来开启或标识 rpc 服务。如：

- @EnableRpcClient：标识开启 rpc 客户端，用于自动服务发现、远程调用
- @EnableRpcService：标识开启 rpc 服务端，用于自动服务暴露
- @RpcReference：类似 @Autowire，标识注入一个远程服务
- @RpcService：标识一个真正的服务提供者

### 2.1. 开启 RPC 功能

通过自定义注解 @EnableRpcService、@EnableRpcClient，用户可以在 Spring Boot 启动类上声明式地开启 RPC 能力。例如：

```java
@EnableRpcService
@SpringBootApplication
public class SourceRpcServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(SourceRpcServerApplication.class, args);
    }

}
```

这些注解的作用类似于 Spring 的 @EnableXXX，本质上是通过 @Import 导入相关的配置类或注册器。

### 2.2. 服务暴露与引用

- @RpcService：用于标注需要暴露为 RPC 服务的实现类

```java
@RpcService(group = "dev", version = "1.0.0")
public class HiServiceImplDevV1 implements HiService {

    @Override
    public String hi(String name) {
        return StrUtil.join("<br>", name, "group: dev", "version: 1.0.0");
    }

}
```

- @RpcReference：用于注入远程服务代理

```java
@Slf4j
@RestController
public class HiRpcController {

    @RpcReference
    private HiService hiService;
    @RpcReference(group = "dev", version = "1.0.0")
    private HiService hiServiceDev;
    @RpcReference(group = "uat", version = "2.0.0")
    private HiService hiServiceUat;
    @RpcReference(group = "unknow", version = "unknow")
    private HiService hiServiceUnknow;

    /**
     * 刷新页面查看rpc调用结果，http://127.0.0.1:8021/hi
     */
    @GetMapping("/hi")
    public String hi() {
        String msg = "Hi RPC! <br>";
        int randomInt = RandomUtil.randomInt(15);
        String result;
        if (randomInt <= 4) {
            result = hiService.hi(msg);
        } else if (randomInt <= 8) {
            result = hiServiceDev.hi(msg);
        } else if (randomInt <= 13){
            result = hiServiceUat.hi(msg);
        } else {
            // 未知服务
            try {
                result = hiServiceUnknow.hi(msg);
            } catch (Exception e) {
                log.error("模拟未知服务", e);
                result = e.getMessage();
            }
        }
        log.info("hi result: {}", result);
        return result;
    }

}
```

## 3. 自动装配与 Bean 后置处理

### 3.1. 自动配置类

RpcServiceAutoConfiguration 作为自动装配入口，负责注册与 RPC 相关的 Bean。它通常会被 spring.factories 或 spring.autoconfigure.imports 文件声明，实现 Spring Boot 的自动装配机制。

```java
public class RpcServiceAutoConfiguration {

    @Bean(initMethod = "startAsync", destroyMethod = "destroy")
    public RpcServerManager rpcServerManager() {
        RpcServerManager manager = new RpcServerManager();
        manager.setAutoRegister(false);
        return manager;
    }

    @Bean
    public RpcServiceBeanPostProcessor rpcServiceBeanPostProcessor(RpcServerManager rpcServerManager) {
        return new RpcServiceBeanPostProcessor(rpcServerManager);
    }

}
```

### 3.2. BeanPostProcessor 扩展

- RpcServiceBeanPostProcessor：在 Spring 容器初始化 Bean 时，扫描并注册带有 @RpcService 注解的服务，将其暴露到 RPC 服务端。

```java
@Slf4j
public class RpcServiceBeanPostProcessor implements BeanPostProcessor {

    private final RpcServerManager rpcServerManager;

    public RpcServiceBeanPostProcessor(RpcServerManager rpcServerManager) {
        this.rpcServerManager = rpcServerManager;
    }

    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
        Class<?> clazz = AopUtils.getTargetClass(bean);
        RpcService rpcService = AnnotationUtils.findAnnotation(clazz, RpcService.class);
        if (rpcService != null) {
            // 获取服务名、分组、版本
            String serviceName = Optional.ofNullable(rpcService.name())
                    .filter(StrUtil::isNotBlank)
                    .orElse(clazz.getInterfaces()[0].getName());
            String group = rpcService.group();
            String version = rpcService.version();
            // 注册服务
            String providerName = RpcServiceUtil.getProviderName(serviceName, group, version);
            InetSocketAddress serverAddress = rpcServerManager.getServerAddress();
            log.debug("register RpcService: {}, service: {}, serverAddress: {}", providerName, bean, serverAddress);
            rpcServerManager.getServiceProvider().register(providerName, bean);
            rpcServerManager.getServerRegistry().register(providerName, serverAddress);
        }
        return bean;
    }

}
```

- RpcReferenceBeanPostProcessor：在 Bean 初始化阶段，自动为带有 @RpcReference 注解的字段注入远程代理对象，实现客户端透明调用。

```java
@Slf4j
public class RpcReferenceBeanPostProcessor implements BeanPostProcessor {

    private final RpcClientManager rpcClientManager;

    public RpcReferenceBeanPostProcessor() {
        rpcClientManager = new RpcClientManager();
    }

    /**
     * rpc 客户端，为 @RpcReference 创建代理
     */
    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
        Field[] declaredFields = bean.getClass().getDeclaredFields();
        for (Field field : declaredFields) {
            if (field.isAnnotationPresent(RpcReference.class)) {
                // 获取 @RpcReference 注解
                RpcReference rpcReference = field.getAnnotation(RpcReference.class);
                String group = rpcReference.group();
                String version = rpcReference.version();
                // 创建代理
                RpcReferenceBuilder rpcReferenceBuilder = RpcReferenceBuilder.builder()
                        .group(group).version(version).service(field.getType()).build();
                RpcClientProxy proxyRpcReference = new RpcClientProxy(rpcClientManager, rpcReferenceBuilder);
                Object proxyService = proxyRpcReference.getProxyService(field.getType());
                // 注入代理
                ReflectionUtils.makeAccessible(field);
                ReflectionUtils.setField(field, bean, proxyService);
            }
        }
        return bean;
    }

}
```

这两个后处理器的核心逻辑是利用 Spring 的 Bean 生命周期回调，在 Bean 实例化后进行增强或代理。

## 4. 包扫描与注册器

RpcServiceScannerRegistrar 实现了 Spring 的 ImportBeanDefinitionRegistrar 接口，负责根据 @EnableRpcService 注解的 basePackages 属性，扫描指定包下的服务实现类，并将其注册为 Spring Bean。这一机制类似于 MyBatis、Dubbo 等框架的包扫描实现。

```java
@Slf4j
public class RpcServiceScannerRegistrar implements ImportBeanDefinitionRegistrar, ResourceLoaderAware {

    private ResourceLoader resourceLoader;

    @Override
    public void setResourceLoader(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }

    @Override
    public void registerBeanDefinitions(AnnotationMetadata importingClassMetadata, BeanDefinitionRegistry registry) {
        // 获取启动注解的属性
        AnnotationAttributes attributes = AnnotationAttributes.fromMap(
                importingClassMetadata.getAnnotationAttributes(EnableRpcService.class.getName()));
        if (attributes == null) {
            log.warn("annotation not found on {}", importingClassMetadata.getClassName());
            return;
        }

        // 解析扫描包路径
        List<String> basePackages = getBasePackages(importingClassMetadata, attributes);
        if (basePackages.isEmpty()) {
            log.warn("No base packages specified for RPC service scanning");
            return;
        }

        // 创建并配置扫描器
        ClassPathBeanDefinitionScanner rpcServiceScanner = new ClassPathBeanDefinitionScanner(registry);
        rpcServiceScanner.addIncludeFilter(new AnnotationTypeFilter(RpcService.class));
        rpcServiceScanner.setResourceLoader(resourceLoader);

        // 执行扫描
        String[] packagesToScan = basePackages.toArray(new String[0]);
        int rpcServiceBeanCount = rpcServiceScanner.scan(packagesToScan);
        log.info("RPC service scan completed. basePackages:{}, rpcServiceBeanCount:{}", basePackages, rpcServiceBeanCount);
    }

    /**
     * 获取基础扫描包路径
     *
     * @param importingClassMetadata 导入类的元数据
     * @param attributes             注解属性
     * @return 基础包路径列表
     */
    private List<String> getBasePackages(AnnotationMetadata importingClassMetadata,
                                         AnnotationAttributes attributes) {
        List<String> basePackages = new ArrayList<>();

        // 从 value 属性获取
        String[] valuePackages = attributes.getStringArray("value");
        if (valuePackages.length > 0) {
            basePackages.addAll(Arrays.asList(valuePackages));
        }
        // 从 basePackages 属性获取
        String[] basePackageArray = attributes.getStringArray("basePackages");
        if (basePackageArray.length > 0) {
            basePackages.addAll(Arrays.asList(basePackageArray));
        }
        // 从 basePackageClasses 获取
        Class<?>[] basePackageClasses = attributes.getClassArray("basePackageClasses");
        for (Class<?> basePackageClass : basePackageClasses) {
            basePackages.add(ClassUtils.getPackageName(basePackageClass));
        }
        // 如果没有指定任何包，使用标注注解的类所在的包
        if (basePackages.isEmpty()) {
            String defaultPackage = ClassUtils.getPackageName(importingClassMetadata.getClassName());
            if (StringUtils.hasText(defaultPackage)) {
                basePackages.add(defaultPackage);
            }
        }

        // 去重并过滤空值
        return basePackages.stream()
                .filter(StringUtils::hasText)
                .distinct()
                .collect(Collectors.toList());
    }

}
```

## 5. 配置与启动流程

ok，通过以上操作，与 Spring 集成就完成了。我们总结一下流程：

1. 用户在启动类上添加 @EnableRpcService 或 @EnableRpcClient 注解
2. 注解通过 @Import 导入注册器（如 RpcServiceScannerRegistrar）或其他配置
3. 注册器扫描并注册服务 Bean
4. 自动配置类注册 BeanPostProcessor
5. BeanPostProcessor 在 Bean 初始化时处理服务暴露与远程代理注入
6. RPC 框架完成与 Spring 的集成，用户可直接通过注解方式发布和引用远程服务

## 6. 总结

通过自定义注解、自动配置、Bean 后处理器和包扫描注册器等机制，这套 RPC 框架实现了与 Spring 的深度集成。开发者只需简单配置，即可享受类似 Dubbo、gRPC 等主流框架的开发体验。

项目源码参考我的仓库：[https://github.com/zpj80231/snail/tree/main/snail-source-code/source-rpc](https://github.com/zpj80231/snail/tree/main/snail-source-code/source-rpc)

<Reward/>