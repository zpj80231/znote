---
title: 手写 Spring 01 - 核心容器实现
date: 2023-02-17
tags:
   - 源码分析
   - Java 
categories:
   - 后端 Back-end
isShowComments: true
---

<Boxx/>

Spring 的核心容器由两个部分组成：BeanFactory 和 ApplicationContext。BeanFactory 是 Spring 的基础，负责实例化、配置和管理应用程序中的对象。ApplicationContext 是 BeanFactory 的一个更高级别的实现，提供了额外的功能，如国际化、事件传播和Bean预处理。

<!-- more -->

[[toc]]

设计一个Spring容器需要考虑以下几个方面：

1. 容器初始化

Spring 容器初始化过程中需要完成的任务包括：读取 XML 配置文件，解析 XML 配置信息，创建 Bean 对象，进行 Bean 之间的依赖注入等。因此，设计一个高效的初始化过程是非常重要的。可以考虑采用单例模式，使用懒加载机制来避免无用的资源浪费。

2. Bean 的实例化和管理

在设计 Spring 容器时，需要考虑如何管理 Bean 的生命周期，包括 Bean 的实例化、初始化、销毁等。可以使用反射机制来实例化 Bean，使用依赖注入技术来完成 Bean 之间的依赖关系。对于 Bean 的生命周期管理，可以使用 BeanPostProcessor 和 BeanFactoryPostProcessor 等机制。

3. 依赖注入

依赖注入是 Spring 的核心功能之一，它使得 Bean 之间的关系更加松散。设计一个高效的依赖注入机制是非常重要的。可以考虑使用自动装配机制，根据 Bean 之间的依赖关系自动完成依赖注入。同时，为了避免循环依赖问题，可以使用构造函数注入或者延迟依赖注入等机制。

4. AOP

面向切面编程（AOP）是Spring的另一个核心功能。在设计 Spring 容器时，需要考虑如何支持 AOP。可以使用代理模式或者字节码增强技术来实现 AOP 功能。同时，为了方便用户使用，可以提供注解或者 XML 配置文件等方式来配置 AOP。

5. Web 支持

Spring 也提供了 Web 支持，包括 MVC 架构和 RESTful 服务等。在设计 Spring 容器时，需要考虑如何支持 Web 功能。可以使用 Servlet 容器来支持 Web 功能，并提供注解或者 XML 配置文件等方式来配置 Web 功能。

总的来说，设计一个高效、易用、灵活的 Spring 容器需要考虑多个方面，包括容器初始化、Bean 的实例化和管理、依赖注入、AOP 和 Web 支持等。需要根据具体需求来确定设计方案，并不断优化和改进。


## 核心容器 DefaultListableBeanFactory

对 Spring 中的核心类：DefaultListableBeanFactory 做一个简单初步的实现：

### 定义一些职责和能力：

1. BeanFactory：提供获取 Bean 的能力；

2. BeanDefinition：Spring 可以通过 xml 或 注解 的方式加载一个 Bean，但为了更好的扩展，不管从何处加载的 Bean， 最好都统一转换为一个指定对象，
   那么就需要定义一个统一的门面对象：BeanDefinition，只要有 BeanDefinition 我们就可以实例化一个 Bean；

3. SingletonBeanRegistry：提供获取一个 单例Bean 的能力（其实就是通过每个BeanDefinition定义的Class反射获得一个Bean，并缓存起来）；

4. BeanDefinitionRegistry：提供注册 BeanDefinition 的能力；

### 具体的实现：

1. DefaultSingletonBeanRegistry： implements SingletonBeanRegistry， 实现了 单例Bean 的添加，获取；

2. AbstractBeanFactory：extends DefaultSingletonBeanRegistry implements BeanFactory， 实现了 getBean(String beanName)
   而 getBean(String beanName) 的实现则主要是调用留给子类实现的空方法 createBean(beanName, beanDefinition)；

3. AbstractAutowireCapableBeanFactory：extends AbstractBeanFactory，实现createBean(beanName, beanDefinition)， 实现通过
   BeanDefinition 创建 Bean 的能力；

4. ★ DefaultListableBeanFactory：extends AbstractAutowireCapableBeanFactory implements BeanDefinitionRegistry， 实现注册
   BeanDefinition 的能力，获得一个 Bean 的能力；

### 将实现加入原有的逻辑中：

- 无

### 测试：

```java
public void testDefaultListableBeanFactory(){
   // DefaultListableBeanFactory 的用法
   DefaultListableBeanFactory beanFactory=new DefaultListableBeanFactory();
   // 1. 注册Bean的能力：将一个普通对象转换为 BeanDefinition，并注册进容器中
   BeanDefinition beanDefinition=new BeanDefinition(Cat.class);
   beanFactory.registerBeanDefinition("cat",beanDefinition);
   // 2. 获取Bean的能力：从容器中获取指定 Bean，第一次获取会示例化并缓存
   Cat cat=(Cat)beanFactory.getBean("cat");
   cat.name();
   // 3. 第二次会直接从单例缓存中获取
   Cat cat_cache=(Cat)beanFactory.getBean("cat");
   cat_cache.name();
}
```

## 实例化

上述方式只支持默认的无参构造实例化 Bean。

### 定义一些职责和能力：

1. InstantiationStrategy：要想容器支持对 Bean的有参构造器 实例化的方式，需要定义一个实例化策略接口 InstantiationStrategy，当然，定义这个 InstantiationStrategy 策略接口也是为了支持不同实例化方式方便扩展。

添加一个实例化方法：Object instantiatie(BeanDefinition beanDefinition, String beanName, Constructor constructor, Object[] args);

一个 Bean 的实例化，需要的基本参数有：

- BeanDefinition：主要保存了一个具体类的定义，主要就是实例化这个类
- Constructor：通过哪个构造方法实例化
- args：构造方法的参数

### 具体的实现：

- SimpleInstantiationStrategy：JDK 实例化策略

- CglibSubclassingInstantiationStrategy：cglib 实例化策略

### 将实现加入原有的逻辑中：

1. AbstractAutowireCapableBeanFactory：修改 createBean(String beanName, BeanDefinition beanDefinition) 实现，加入支持有参构造的实例化策略  createBeanInstance(beanDefinition, beanName, args);。

### 测试：

```java
@Test
public void testDefaultListableBeanFactoryGetBeanWithConstructor(){
   // DefaultListableBeanFactory 的用法
   DefaultListableBeanFactory beanFactory=new DefaultListableBeanFactory();
   // 1. 注册Bean的能力：将一个普通对象转换为 BeanDefinition，并注册进容器中
   BeanDefinition beanDefinition=new BeanDefinition(Cat.class);
   beanFactory.registerBeanDefinition("cat",beanDefinition);
   // 2. 获取Bean的能力：从容器中获取指定 Bean（通过有参构造），第一次获取会示例化并缓存
   Cat cat=(Cat)beanFactory.getBean("cat","Cat -> Constructor");
   cat.printName();
   // 3. 第二次会直接从单例缓存中获取
   Cat cat_cache=(Cat)beanFactory.getBean("cat");
   cat_cache.printName();
}
```

## 属性填充

完成 Bean 的实例化之后，进行 Bean 的属性填充。

### 定义一些职责和能力：

- 无

### 具体的实现：

1. PropertyValue：将一个 Bean 本身的 字段名、字段值映射为一个 PropertyValue；
2. PropertyValues：当一个 Bean 有多个字段时，将 PropertyValue 保存为一个集合；
3. BeanReference：属性填充时可能遇到 Bean 的依赖，A 依赖 B, B 依赖 C, 循环调用实例化，主要解决 Bean依赖 问题的属性填充；

### 将实现加入原有的逻辑中：

1. BeanDefinition：之前只保存了实例化的类型Class（实例化用），现在将 PropertyValues 也填充进去（属性填充用）；
2. AbstractAutowireCapableBeanFactory：修改 createBeanInstance(String beanName, BeanDefinition beanDefinition, Object[] args)
   加入属性填充步骤 applyPropertyValues(beanName, bean, beanDefinition)；

### 测试：

```java
 @Test
public void testDefaultListableBeanFactoryGetBeanWithApplyPropertyValues(){
   // DefaultListableBeanFactory 的用法
   DefaultListableBeanFactory beanFactory=new DefaultListableBeanFactory();
   
   // 1. 注册Bean的能力：将一个普通对象（和属性）转换为 BeanDefinition，并注册进容器中
   // 注册一个 cat
   PropertyValues catPropertyValues=new PropertyValues();
   catPropertyValues.addPropertyValue(new PropertyValue("name","TomCat"));
   BeanDefinition catBeanDefinition=new BeanDefinition(Cat.class,catPropertyValues);
   beanFactory.registerBeanDefinition("cat",catBeanDefinition);
   // 注册一个 dog，dog 依赖 cat
   PropertyValues dogPropertyValues=new PropertyValues();
   dogPropertyValues.addPropertyValue(new PropertyValue("name","JjDog"));
   dogPropertyValues.addPropertyValue(new PropertyValue("cat",new BeanReference("cat")));
   BeanDefinition dogBeanDefinition=new BeanDefinition(Dog.class,dogPropertyValues);
   beanFactory.registerBeanDefinition("dog",dogBeanDefinition);
   
   // 2. 获取Bean的能力：从容器中获取指定 Bean，第一次获取会示例化并缓存
   Dog dog=(Dog)beanFactory.getBean("dog");
   dog.printName();
}
```

<Reward/>
