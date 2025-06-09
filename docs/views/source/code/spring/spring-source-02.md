---
title: 手写 Spring 02 - 添加外部资源加载器以及和现有容器结合
date: 2023-02-28
tags:
    - 源码分析
    - Java 
categories:
    - 源码 Source-code
isShowComments: true
---

<Boxx/>

添加资源加载接口定义类：Resource，及核心实现：DefaultResourceLoader；

添加加载Bean定义接口：BeanDefinitionReader，及核心实现xml解析：XmlBeanDefinitionReader

与现有容器结合：通过构造参数的方式将容器注入到xml加载器中，将加载到资源解析给指定容器

<!-- more -->

[[toc]]

## 从外部资源加载 Bean

在 Bean 的实例化和属性填充完成后，我们已经可以通过在代码里手动 new 对象的方式实现一个简单的 Bean 容器。

为了方便的从外部配置、加载 Bean，抽取一个工具类可以从不同位置获取 定义 Bean 的配置文件信息。

### 定义一些职责和能力：

1. Resource：InputStream getInputStream() throws IOException; 定义资源接口；
2. ResourceLoader：Resource getResource(String location); 定义资源包装接口，根据入参自动匹配相应的资源（Resource）；

### 具体的实现：

1. ClassPathResource：可以从类路径下读取资源；
2. FileSystemResource：可以从指定路径或指定文件读取资源；
3. UrlResource：可以从指定url读取资源；
4. DefaultResourceLoader：根据location自动匹配相应的资源；

### 将实现加入原有的逻辑中：

- 无

### 测试：

```java
public class DefaultResourceLoaderTest {

   private ResourceLoader resourceLoader;

   @Before
   public void init() {
      resourceLoader = new DefaultResourceLoader();
   }

   @Test
   public void test_classpath() throws IOException {
      Resource resource = resourceLoader.getResource("classpath:spring.xml");
      InputStream inputStream = resource.getInputStream();
      String content = IoUtil.readUtf8(inputStream);
      System.out.println("===== classpath =====");
      System.out.println(content);
      System.out.println("===== classpath =====");
   }

   @Test
   public void test_file() throws IOException {
      Resource resource = resourceLoader.getResource("src/main/resources/spring.xml");
      InputStream inputStream = resource.getInputStream();
      String content = IoUtil.readUtf8(inputStream);
      System.out.println("===== file =====");
      System.out.println(content);
      System.out.println("===== file =====");
   }

}
```

## 外部资源和现有容器整合

从外部资源获取到 Bean 的配置信息后，需要解析配置信息与现有的 Bean 容器结合，增强容器的能力（省去了在代码中手动添加 Bean 的过程）。

### 定义一些职责和能力：

1. BeanDefinitionReader：定义加载Bean定义接口，从各个资源加载为 BeanDefinition；

### 具体的实现：

1. AbstractBeanDefinitionReader：一个抽线类默认实现，主要提供对 getRegistry()、getResourceLoader() 的默认实现，子类只需关心加载Bean定义即可；
2. XmlBeanDefinitionReader：从 xml 文件读取 bean，转换为 BeanDefinition，并注册到指定的 BeanDefinitionRegistry （DefaultListableBeanFactory 已经具备了这个能力）；

### 将实现加入原有的逻辑中：

- 无

### 测试：

```java
public class XmlBeanDefinitionReaderTest {

   @Test
   public void test_xml() {
      // 核心容器
      DefaultListableBeanFactory beanFactory = new DefaultListableBeanFactory();
      // 读取 xml 解析为 Bean
      XmlBeanDefinitionReader reader = new XmlBeanDefinitionReader(beanFactory);
      reader.loadBeanDefinitions("classpath:spring.xml");
      // 获取指定 Bean
      Dog dog = (Dog) beanFactory.getBean("dog");
      dog.printName();
   }

}
```

<Reward/>
