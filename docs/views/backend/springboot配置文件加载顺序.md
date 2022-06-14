---
title: SpringBoot配置文件加载顺序
date: 2022-04-28
tags:
  - springboot
categories:
  - 后端 Back-end
isShowComments: true
---

<Boxx/>

<!-- more -->

[[toc]]

SpringBoot 默认支持 properties 和 YAML 两种格式的配置文件，并且有 bootstrap 和 application 两种配置文件。

bootstrap 配置文件先于 application 配置文件被加载，会先创建初始化 Bootstrap Context，再创建初始化 Application Context，应用于更早期的配置信息，可以理解为系统配置。

bootstrap 和 application 共享同一个 Environment，默认情况下，**bootstrap 的配置不会被覆盖**，而 application 的配置项可以被覆盖。（比如被 application-dev 覆盖，或被 java 命令行覆盖）

## 配置文件所在的位置

默认值为：classpath:/, classpath:/config/, file:./, file:./config/ （优先级从低到高），最先加载file:./config/ 位置的配置文件；如果配置了spring.config.location属性则取这个属性的值。

加载顺序如下：优先级由高到底，如果所有文件某个字段配置了一样的信息，高优先级的配置会覆盖低优先级的配置，但是加载的时候其他字段会进行互补配置；

![](/znote/img/backend/springConfigurationFileLoadingSequence.png)

项目打包好以后，我们还可以使用命令行参数的形式，在启动项目的时候来指定配置文件的新位置；

用指定配置文件和默认加载的这些配置文件共同起作用形成互补配置；

例如：`java -jar spring-boot-config-demo.jar --spring.config.location=G:/application.properties`

还可以在 java 命令中覆盖配置项（这里指定了新的 port 和 profile）：

`java -jar spring-boot-config-demo.jar --spring.profiles.active=prod --server.port=8081`

## 配置文件的名字

默认值为：application; 如果配置了spring.config.name属性则取改属性值。

所有的扩展名：properties xml yml yaml

加载顺序如下（优先级从低到高）：
properties -> xml -> yml -> yaml

加载时候到的拼接过程为 location + name + “.” +ext

location : 指的就是上面提到配置文件所在的位置。
name： 指的就是配置文件的名称 默认就是appliction。
ext: 指的就是后缀名。
然后对拼接后的资源路径进行加载。

**小结：** 上面加载的总体过程就是两层循环，外层控制加载配置文件位置的顺序，在相同位置时，内层就是控制后缀名不同时的加载顺序。

理解了上面的原理，然后主要针对如下几个问题进行回答

### 1、springBoot何时加载配置文件？

在容器启动时，会有方法调用所有监听器的onApplicationEvent方法。然后与配置加载相关的ConfigFileApplicationListener的对应方法就会被加载，执行读取配置文件操作。

### 2、springBoot加载配置文件时，不同位置及不同后缀的配置文件如何加载？

classpath:/, classpath:/config/, file:./, file:./config/ （优先级从低到高）

properties -> xml -> yml -> yaml（优先级从低到高）

加载顺序如下：

1. config/application.properties（项目根目录中config目录下）
2. config/application.yml
3. application.properties（项目根目录下）
4. application.yml
5. resources/config/application.properties（项目resources目录中config目录下）
6. resources/config/application.yml
7. resources/application.properties（项目的resources目录下）
8. resources/application.yml

  注：

1. 如果同一个目录下，有application.yml也有application.properties，默认先读取application.properties。
2. 如果同一个配置属性，在多个不同名的配置文件中都配置了，默认使用第1个读取到的，后面读取的不覆盖前面读取到的。
3. 创建SpringBoot项目时，一般配置文件都放置在“项目的resources目录下”

### 3、springBoot的{prifile}文件时是如何加载的？如:（application-dev.yml）

每次加载配置文件时都会先读取 spring.profiles.active属性，如果存在则将该配置文件装载到 加载队列的首位，然后在下次循环时进行寻找加载。

### 4、不同位置的配置文件配置了相同的属性时 将如何加载？

- 当无spring.profiles.active 时， 先读取到的属性会先生效。例如：file:./config/配置端口 8080 ；file:./配置端口8081；classpath:/config/配置端口8082 ；classpath:/配置的端口为8083 。根据上文的讲解最先读取到的时 file:./config/的8080，后面再次读取后该属性并不会生效。所以最终的配置端口为8080 (并不是后读取到到配置文件不加载，会加载；但是不生效)
- 当有spring.profiles.active 时，配置了相同属性时是profiles上的配置生效。例如：file:./config/上的yml配置了端口 8080 但是存在 spring.profiles.active属性 dev;然后我们在dev上也配置来一个端口 8081.此时生效的为8081.

### 5、不同位置到配置文件，设置不同属性时，后加载的文件是否会生效？

会有效果。会是互补配置。即先加载先生效，后加载的不同配置产生互补效果。

例如：file:./config/配置了端口8080；file:./配置了访问路径/path。最总二者的配置会达成并集的效果。即二者都生效。
