---
title: JDK/Dubbo/Spring 三种SPI机制解析
date: 2022-02-15
tags:
- SPI
categories:
- 后端 Back-end
isShowComments: true
---

<Boxx/>

[[toc]]

> SPI 全称为 Service Provider Interface，是一种服务发现机制。SPI 的本质是将接口实现类的全限定名配置在文件中，并由服务加载器读取配置文件，加载实现类。这样可以在运行时，动态为接口替换实现类。正因此特性，我们可以很容易的通过 SPI 机制为我们的程序提供拓展功能。

本文主要是特性 & 用法介绍，不涉及源码解析（源码都很简单，相信你一定一看就懂）

## SPI 有什么用？

举个栗子，现在我们设计了一款全新的日志框架：**super-logger**。默认以XML文件作为我们这款日志的配置文件，并设计了一个配置文件解析的接口：

```java
package com.github.kongwu.spisamples;

public interface SuperLoggerConfiguration {
	void configure(String configFile);
}
```

然后来一个默认的XML实现：

```java
package com.github.kongwu.spisamples;

public class XMLConfiguration implements SuperLoggerConfiguration{
	public void configure(String configFile){
    	......
    }
}
```

那么我们在初始化，解析配置时，只需要调用这个XMLConfiguration来解析XML配置文件即可。

```java
package com.github.kongwu.spisamples;

public class LoggerFactory {
    static {
        SuperLoggerConfiguration configuration = new XMLConfiguration();
    	configuration.configure(configFile);
    }

    public static getLogger(Class clazz){
    	......
    }
}
```

这样就完成了一个基础的模型，看起来也没什么问题。不过扩展性不太好，因为如果想定制/扩展/重写解析功能的话，我还得重新定义入口的代码，LoggerFactory 也得重写，不够灵活，侵入性太强了。

比如现在用户/使用方想增加一个 yml 文件的方式，作为日志配置文件，那么只需要新建一个YAMLConfiguration，实现 SuperLoggerConfiguration 就可以。但是……怎么注入呢，怎么让 LoggerFactory中使用新建的这个 YAMLConfiguration ？难不成连 LoggerFactory 也重写了？

如果借助SPI机制的话，这个事情就很简单了，可以很方便的完成这个入口的扩展功能。

下面就先来看看，利用JDK 的 SPI 机制怎么解决上面的扩展性问题。

## JDK SPI

JDK 中 提供了一个 SPI 的功能，核心类是 java.util.ServiceLoader。其作用就是，可以通过类名获取在"META-INF/services/"下的多个配置实现文件。

为了解决上面的扩展问题，现在我们在`META-INF/services/`下创建一个`com.github.kongwu.spisamples.SuperLoggerConfiguration`文件（没有后缀）。文件中只有一行代码，那就是我们默认的`com.github.kongwu.spisamples.XMLConfiguration`（注意，一个文件里也可以写多个实现，回车分隔）

```java
META-INF/services/com.github.kongwu.spisamples.SuperLoggerConfiguration:

com.github.kongwu.spisamples.XMLConfigurationCOPY
```

然后通过 ServiceLoader 获取我们的 SPI 机制配置的实现类：

```java
ServiceLoader<SuperLoggerConfiguration> serviceLoader = ServiceLoader.load(SuperLoggerConfiguration.class);
Iterator<SuperLoggerConfiguration> iterator = serviceLoader.iterator();
SuperLoggerConfiguration configuration;

while(iterator.hasNext()) {
    //加载并初始化实现类
	configuration = iterator.next();
}

//对最后一个configuration类调用configure方法
configuration.configure(configFile);
```

最后在调整LoggerFactory中初始化配置的方式为现在的SPI方式：

```java
package com.github.kongwu.spisamples;

public class LoggerFactory {
	static {
        ServiceLoader<SuperLoggerConfiguration> serviceLoader = ServiceLoader.load(SuperLoggerConfiguration.class);
        Iterator<SuperLoggerConfiguration> iterator = serviceLoader.iterator();
        SuperLoggerConfiguration configuration;

        while(iterator.hasNext()) {
            configuration = iterator.next();//加载并初始化实现类
        }
        configuration.configure(configFile);
    }
    
    public static getLogger(Class clazz){
    	......
    }
}
```

**等等，这里为什么是用 iterator ? 而不是get之类的只获取一个实例的方法？**

试想一下，如果是一个固定的get方法，那么get到的是一个固定的实例，SPI 还有什么意义呢？

SPI 的目的，就是增强扩展性。将固定的配置提取出来，通过 SPI 机制来配置。那既然如此，一般都会有一个默认的配置，然后通过 SPI 的文件配置不同的实现，这样就会存在一个接口多个实现的问题。要是找到多个实现的话，用哪个实现作为最后的实例呢？

所以这里**使用iterator来获取所有的实现类配置**。刚才已经在我们这个 **super-logger** 包里增加了默认的SuperLoggerConfiguration 实现。

为了支持 YAML 配置，现在在使用方/用户的代码里，增加一个YAMLConfiguration的 SPI 配置：

```java
META-INF/services/com.github.kongwu.spisamples.SuperLoggerConfiguration:

com.github.kongwu.spisamples.ext.YAMLConfiguration
```

此时通过iterator方法，就会获取到默认的XMLConfiguration和我们扩展的这个YAMLConfiguration两个配置实现类了。

在上面那段加载的代码里，我们遍历iterator，遍历到最后，我们使用最后一个实现配置作为最终的实例。

**再等等？最后一个？怎么算最后一个？**

使用方/用户自定义的的这个 YAMLConfiguration 一定是最后一个吗？

这个真的不一定，取决于我们运行时的 ClassPath 配置，在前面加载的jar自然在前，最后的jar里的自然当然也在后面。所以**如果用户的包在ClassPath中的顺序比super-logger的包更靠后，才会处于最后一个位置；如果用户的包位置在前，那么所谓的最后一个仍然是默认的XMLConfiguration。**

举个栗子，如果我们程序的启动脚本为：

```java
java -cp super-logger.jar:a.jar:b.jar:main.jar example.Main
```

默认的XMLConfiguration SPI配置在`super-logger.jar`，扩展的YAMLConfiguration SPI配置文件在`main.jar`，那么iterator获取的最后一个元素一定为YAMLConfiguration。

但这个classpath顺序如果反了呢？main.jar 在前，super-logger.jar 在后

```java
java -cp main.jar:super-logger.jar:a.jar:b.jar example.Main
```

这样一来，iterator 获取的最后一个元素又变成了默认的XMLConfiguration，我们使用 JDK SPI 没啥意义了，获取的又是第一个，还是默认的XMLConfiguration。

由于这个加载顺序（classpath）是由用户指定的，所以无论我们加载第一个还是最后一个，都有可能会导致加载不到用户自定义的那个配置。

**所以这也是JDK SPI机制的一个劣势，无法确认具体加载哪一个实现，也无法加载某个指定的实现，仅靠ClassPath的顺序是一个非常不严谨的方式**

**JDK SPI机制的缺点是：会加载所有的实现类，需要知道接口的所有具体实现类，通过迭代的方式获取指定的实现类。**（可能还会存在并发问题）

## Dubbo SPI

> Dubbo 就是通过 SPI 机制加载所有的组件。不过，Dubbo 并未使用 Java 原生的 SPI 机制，而是对其进行了增强，使其能够更好的满足需求。在 Dubbo 中，SPI 是一个非常重要的模块。基于 SPI，我们可以很容易的对 Dubbo 进行拓展。如果大家想要学习 Dubbo 的源码，SPI 机制务必弄懂。接下来，我们先来了解一下 Java SPI 与 Dubbo SPI 的用法，然后再来分析 Dubbo SPI 的源码。

Dubbo 中实现了一套新的 SPI 机制，功能更强大，也更复杂一些。相关逻辑被封装在了 ExtensionLoader 类中，通过 ExtensionLoader，我们可以加载指定的实现类。Dubbo SPI 所需的配置文件需放置在 META-INF/dubbo 路径下，配置内容如下（以下demo来自dubbo官方文档）。

```java
optimusPrime = org.apache.spi.OptimusPrime
bumblebee = org.apache.spi.Bumblebee
```

与 Java SPI 实现类配置不同，Dubbo SPI 是通过键值对的方式进行配置，这样我们可以按需加载指定的实现类。另外在使用时还需要在接口上标注 @SPI 注解。下面来演示 Dubbo SPI 的用法：

```java
@SPI
public interface Robot {
    void sayHello();
}

public class OptimusPrime implements Robot {

    @Override
    public void sayHello() {
        System.out.println("Hello, I am Optimus Prime.");
    }
}

public class Bumblebee implements Robot {

    @Override
    public void sayHello() {
        System.out.println("Hello, I am Bumblebee.");
    }
}

public class DubboSPITest {

    @Test
    public void sayHello() throws Exception {
        ExtensionLoader<Robot> extensionLoader = 
            ExtensionLoader.getExtensionLoader(Robot.class);
        Robot optimusPrime = extensionLoader.getExtension("optimusPrime");
        optimusPrime.sayHello();
        Robot bumblebee = extensionLoader.getExtension("bumblebee");
        bumblebee.sayHello();
    }
}
```

**Dubbo SPI 和 JDK SPI 最大的区别就在于支持“别名”**，可以通过某个扩展点的别名来获取固定的扩展点。就像上面的例子中，我可以获取 Robot 多个 SPI 实现中别名为“optimusPrime”的实现，也可以获取别名为“bumblebee”的实现，这个功能非常有用！

通过 @SPI 注解的 value 属性，还可以默认一个“别名”的实现。比如在Dubbo 中，默认的是Dubbo 私有协议：**dubbo protocol – dubbo://** ** 来看看Dubbo中协议的接口：

```java
@SPI("dubbo")
public interface Protocol {
	......
}
```

在 Protocol 接口上，增加了一个 @SPI 注解，而注解的 value 值为 Dubbo ，通过 SPI 获取实现时就会获取 Protocol SPI 配置中别名为dubbo的那个实现，`com.alibaba.dubbo.rpc.Protocol`文件如下：

```java
filter=com.alibaba.dubbo.rpc.protocol.ProtocolFilterWrapper
listener=com.alibaba.dubbo.rpc.protocol.ProtocolListenerWrapper
mock=com.alibaba.dubbo.rpc.support.MockProtocol

dubbo=com.alibaba.dubbo.rpc.protocol.dubbo.DubboProtocol

injvm=com.alibaba.dubbo.rpc.protocol.injvm.InjvmProtocol
rmi=com.alibaba.dubbo.rpc.protocol.rmi.RmiProtocol
hessian=com.alibaba.dubbo.rpc.protocol.hessian.HessianProtocol
com.alibaba.dubbo.rpc.protocol.http.HttpProtocol
com.alibaba.dubbo.rpc.protocol.webservice.WebServiceProtocol
thrift=com.alibaba.dubbo.rpc.protocol.thrift.ThriftProtocol
memcached=com.alibaba.dubbo.rpc.protocol.memcached.MemcachedProtocol
redis=com.alibaba.dubbo.rpc.protocol.redis.RedisProtocol
rest=com.alibaba.dubbo.rpc.protocol.rest.RestProtocol
registry=com.alibaba.dubbo.registry.integration.RegistryProtocol
qos=com.alibaba.dubbo.qos.protocol.QosProtocolWrapper
```

然后只需要通过getDefaultExtension，就可以获取到 @SPI 注解上value对应的那个扩展实现了

```
Protocol protocol = ExtensionLoader.getExtensionLoader(Protocol.class).getDefaultExtension();
```

还有一个 Adaptive 的机制，虽然非常灵活，但……用法并不是很“优雅”，这里就不介绍了

Dubbo 的 SPI 中还有一个“加载优先级”，优先加载内置（internal）的，然后加载外部的（external），按优先级顺序加载，**如果遇到重复就跳过不会加载**了。

所以如果想靠classpath加载顺序去覆盖内置的扩展，也是个不太理智的做法，原因同上 – 加载顺序不严谨

## Spring SPI

Spring 的 SPI 配置文件是一个固定的文件 – `META-INF/spring.factories`，功能上和 JDK 的类似，每个接口可以有多个扩展实现，使用起来非常简单：

```java
List<LoggingSystemFactory> factories = 
    SpringFactoriesLoader.loadFactories(LoggingSystemFactory.class, classLoader);
```

下面是一段 Spring Boot 中 spring.factories 的配置

```java
# Logging Systems
org.springframework.boot.logging.LoggingSystemFactory=\
org.springframework.boot.logging.logback.LogbackLoggingSystem.Factory,\
org.springframework.boot.logging.log4j2.Log4J2LoggingSystem.Factory,\
org.springframework.boot.logging.java.JavaLoggingSystem.Factory

# PropertySource Loaders
org.springframework.boot.env.PropertySourceLoader=\
org.springframework.boot.env.PropertiesPropertySourceLoader,\
org.springframework.boot.env.YamlPropertySourceLoader

# ConfigData Location Resolvers
org.springframework.boot.context.config.ConfigDataLocationResolver=\
org.springframework.boot.context.config.ConfigTreeConfigDataLocationResolver,\
org.springframework.boot.context.config.StandardConfigDataLocationResolver

......
```

Spring SPI 中，将所有的配置放到一个固定的文件中，省去了配置一大堆文件的麻烦。至于多个接口的扩展配置，是用一个文件好，还是每个单独一个文件好这个，这个问题就见仁见智了（个人喜欢 Spring 这种，干净利落）。

*Spring的SPI 虽然属于spring-framework(core)，但是目前主要用在spring boot中……*

和前面两种 SPI 机制一样，Spring 也是支持 ClassPath 中存在多个 spring.factories 文件的，加载时会按照 classpath 的顺序依次加载这些 spring.factories 文件，添加到一个 ArrayList 中。由于没有别名，所以也没有去重的概念，有多少就添加多少。

但由于 Spring 的 SPI 主要用在 Spring Boot 中，而 Spring Boot 中的 ClassLoader 会优先加载项目中的文件，而不是依赖包中的文件。所以如果在你的项目中定义个spring.factories文件，那么你项目中的文件会被第一个加载，得到的Factories中，项目中spring.factories里配置的那个实现类也会排在第一个

如果我们要扩展某个接口的话，只需要在你的项目（spring boot）里新建一个`META-INF/spring.factories`文件，**只添加你要的那个配置，不要完整的复制一遍 Spring Boot 的 spring.factories 文件然后修改** ** 比如我只想添加一个新的 LoggingSystemFactory 实现，那么我只需要新建一个`META-INF/spring.factories`文件，而不是完整的复制+修改：

```java
org.springframework.boot.logging.LoggingSystemFactory=\
com.example.log4j2demo.Log4J2LoggingSystem.FactoryCOPY
```

## 对比

|                    | JDK SPI                        | DUBBO SPI                                                    | Spring SPI                                                   |
| ------------------ | ------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 文件方式           | 每个扩展点单独一个文件         | 每个扩展点单独一个文件                                       | 所有的扩展点在一个文件                                       |
| 获取某个固定的实现 | 不支持，只能按顺序获取所有实现 | 有“别名”的概念，可以通过名称获取扩展点的某个固定实现，配合Dubbo SPI的注解很方便 | 不支持，只能按顺序获取所有实现。但由于Spring Boot ClassLoader会优先加载用户代码中的文件，所以可以保证用户自定义的spring.factoires文件在第一个，通过获取第一个factory的方式就可以固定获取自定义的扩展 |
| 其他               | 无                             | 支持Dubbo内部的依赖注入，通过目录来区分Dubbo 内置SPI和外部SPI，优先加载内部，保证内部的优先级最高 | 无                                                           |
| 文档完整度         | 文章 & 三方资料足够丰富        | 文档 & 三方资料足够丰富                                      | 文档不够丰富，但由于功能少，使用非常简单                     |
| IDE支持            | 无                             | 无                                                           | IDEA 完美支持，有语法提示                                    |

三种 SPI 机制对比之下，JDK 内置的机制是最弱鸡的，但是由于是 JDK 内置，所以还是有一定应用场景，毕竟不用额外的依赖；Dubbo 的功能最丰富，但机制有点复杂了，而且只能配合 Dubbo 使用，不能完全算是一个独立的模块；Spring 的功能和JDK的相差无几，最大的区别是所有扩展点写在一个 spring.factories 文件中，也算是一个改进，并且 IDEA 完美支持语法提示。

## SPI 的使用

举个简单的例子：

有个maven工程，分为三个项目：

- 项目1有一个接口`Pay.java`
- 项目2依赖项目1，有个实现类`AliPay.java`，在resources下创建META-INF.services包，采用SPI的方式暴露出实现类
- 项目3依赖项目1，有个实现类`WeiXinPay.java`，在resources下创建META-INF.services包，采用SPI的方式暴露出实现类

新建一个项目4，测试：

```java
public static void main(String[] args) {
    ServiceLoader<Pay> services = ServiceLoader.load(Pay.class);
    for (Pay pay : services) {
        pay.pay();
    }
}
```
- 若项目4依赖项目1和项目2，此时项目4用的实现类为AliPay
- 若项目4依赖项目1和项目3，此时项目4用的实现类为WeiXinPay
- 若项目4依赖项目1和项目2、项目3，此时项目4用的实现类为AliPay、WeiXinPay

## 参考

- [Introduction to the Service Provider Interfaces – Oracle](https://link.juejin.cn/?target=https%3A%2F%2Fdocs.oracle.com%2Fjavase%2Ftutorial%2Fsound%2FSPI-intro.html)
- [Dubbo SPI – Apache Dubbo](https://link.juejin.cn/?target=https%3A%2F%2Fdubbo.apache.org%2Fzh%2Fdocs%2Fv2.7%2Fdev%2Fsource%2Fdubbo-spi%2F)
- [Creating Your Own Auto-configuration – Spring](https://link.juejin.cn/?target=https%3A%2F%2Fdocs.spring.io%2Fspring-boot%2Fdocs%2Fcurrent%2Freference%2Fhtml%2Fspring-boot-features.html%23boot-features-developing-auto-configuration)

<Reward/>
