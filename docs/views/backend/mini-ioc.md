---
title: IOC底层实现原理介绍，手动实现IOC容器
date: 2022-03-23
tags:
- 源码分析
- Java
categories:
- 后端 Back-end
isShowComments: false
---

<Boxx/>

Spring源码晦涩难懂怎么办呢? 自己手动实现一个mini ioc容器吧，实现后再回头看Spring源码事半功倍哦，就算直接和面试官讲也完全可以哦，类名完全按照源码设计，话不多说直接开干~!

<!-- more -->

[[toc]]

### 需要实现的IOC功能

- 可以通过xml配置bean信息
- 可以通过容器getBean获取对象
- 能够根据Bean的依赖属性实现依赖注入
- 可以配置Bean的单例多例

### 实现简易IOC设计的类

| **类/接口**                | **说明**                                                     |
| -------------------------- | ------------------------------------------------------------ |
| BeanFactory                | IOC容器的基础接口，提供IOC容器的基本功能                     |
| DefaultListableBeanFactory | IOC容器的核心实现类，提供多个map集合用来存储bean的定义对象，提供getBean方法的核心实现 |
| XmlBeanFactory             | IOC容器的实现类，基于xml构建bean信息                         |
| XmlBeanDefinitionReader    | 用于解析xml信息，并提供解析Document文档的方法，并将解析到的BeanDefinition对象注册到核心容器中 |
| BeanDefinition             | 封装Bean的定义对象，如: bean的id class,scope ..等等          |
| Property                   | 封装Bean所关联依赖的属性                                     |

### 类之间关系模型

![1597377196425_IOC01.jpg](http://www.itheima.com/images/newslistPIC/1597377196425_IOC01.jpg)



#### 前期准备

**创建maven项目引入依赖**

```xml
<dependencies>
    <!-- 解析xml -->
    <dependency>
        <groupId>dom4j</groupId>
        <artifactId>dom4j</artifactId>
        <version>1.1</version>
    </dependency>
    <!-- BeanUtils    -->
    <dependency>
        <groupId>commons-beanutils</groupId>
        <artifactId>commons-beanutils</artifactId>
        <version>1.9.3</version>
    </dependency>
</dependencies>
```



**准备3个bean的实体类**

```java
/**
 * 学生类  
 * 学生类依赖班级对象
 * 并提供 sayHello() 方法
 **/
public class Student {
    private String name;
    private TClass tClass;
    public void sayHello(){
        System.out.println("大家好,我是" +this.name+" 我的班级是==>"+tClass.getCname() + " 我的老师是"+tClass.getTeacher().getTname());
    }
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public TClass gettClass() {
        return tClass;
    }
    public void settClass(TClass tClass) {
        this.tClass = tClass;
    }
}
/**
 * 班级类
 * 班级类依赖教师对象
 **/
public class TClass {
    private String cname;// 班级名称
    private Teacher teacher; // 老师
    public String getCname() {
        return cname;
    }
    public void setCname(String cname) {
        this.cname = cname;
    }
    public com.itcast.ioc.bean.Teacher getTeacher() {
        return teacher;
    }
    public void setTeacher(com.itcast.ioc.bean.Teacher teacher) {
        this.teacher = teacher;
    }
}
/**
 * 教师类
 **/
public class Teacher {
    private String tname;// 老师名称
    public String getTname() {
        return tname;
    }
    public void setTname(String tname) {
        this.tname = tname;
    }
}
```



**xml配置对象**

配置学生对象: 小明

依赖班级对象: 3年2班

依赖教师对象: 陈老师

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans>
    <!-- 配置IOC容器要管理的对象   bean作用域: 单例  原型 -->
    <bean id="student" class="com.itcast.ioc.bean.Student" scope="singleton"
          lazy-init="true">
        <!-- 依赖注入:   属性注入    构造器注入   注解注入-->
        <property name="name" value="小明"></property>
        <property name="tClass" ref="tclass"></property>
    </bean>
    <bean id="tclass" class="com.itcast.ioc.bean.TClass">
        <property name="cname" value="3年2班"></property>
        <property name="teacher" ref="teacher"></property>
    </bean>
    <bean id="teacher" class="com.itcast.ioc.bean.Teacher">
        <property name="tname" value="陈老师"></property>
    </bean>
</beans>
```



## **mini-IOC容器-定义类**

定义BeanFactory

```java
/**
 * 容器的基础接口
 * 提供容器最基本的功能
 */
public interface BeanFactory {
    // 核心方法 获取对象
    Object getBean(String beanName);
}
```



定义DefaultListableBeanFactory

```java
package com.itcast.ioc.core;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 基础容器的核心实现
 * 提供 beanDefinitionMap 存储bean的定义
 * 提供 singletonObjects 存储bean的对象实例
 **/
public class DefaultListableBeanFactory implements BeanFactory {
    // 提供 beanDefinitionMap 存储bean的定义
    private Map<String,BeanDefinition> beanDefinitionMap = new ConcurrentHashMap<>();
    // 提供 singletonObjects 存储bean的对象实例 (scope为singleton的)
    private Map<String,Object> singletonObjects = new ConcurrentHashMap<>();
    /**
     * 实现getBean方法
     * @param beanName
     * @return
     */
    @Override
    public Object getBean(String beanName) {
        return null;
    }
    /**
     * 将bean注册到容器中
     * @param beanDefinition
     */
    public void registerBeanDefinition(BeanDefinition beanDefinition){
        beanDefinitionMap.put(beanDefinition.getBeanName(),beanDefinition);
    }
}
```


定义BeanDefnition

```java
/**
 * 用于描述Bean的定义
 **/
public class BeanDefinition {
    private String beanName; // bean标签的ID 作为bean的唯一标识
    private String className; // bean的所属class
    private String scope = "singleton";  // bean的scope作用域
    private List<Property> propertyList = new ArrayList<>();
    public String getBeanName() {
        return beanName;
    }
    public void setBeanName(String beanName) {
        this.beanName = beanName;
    }
    public String getClassName() {
        return className;
    }
    public void setClassName(String className) {
        this.className = className;
    }
    public String getScope() {
        return scope;
    }
    public void setScope(String scope) {
        this.scope = scope;
    }
    public List<Property> getPropertyList() {
        return propertyList;
    }
    public void setPropertyList(List<Property> propertyList) {
        this.propertyList = propertyList;
    }
}
```


定义Property

```java
/**
 * 用于封装一个property标签
 * 属性数据
 **/
public class Property {
    private String name; // 属性名称
    private String value; // 属性的值
    private String ref; // 属性的引用
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public String getValue() {
        return value;
    }
    public void setValue(String value) {
        this.value = value;
    }
    public String getRef() {
        return ref;
    }
    public void setRef(String ref) {
        this.ref = ref;
    }
}
```


定义XmlBeanFactory

```java
/**
 * 继承核心实现类
 * 基于xml配置bean的实现类
 **/
public class XmlBeanFactory extends DefaultListableBeanFactory {
    /**
     * 将解析配置文件 注册bean的所有工作交给reader对象
     */
    final XmlBeanDefinitionReader xmlBeanDefinitionReader = new XmlBeanDefinitionReader(this);
    /**
     * 构造器需要传入xml配置文件
     * @param configPath
     */
    public XmlBeanFactory(String configPath) {
        // 使用reader对象 解析配置  注册Bean
        this.xmlBeanDefinitionReader.loadBeanDefinitions(configPath);
    }
}
```


定义XmlBeanDefinitionReader

```java
/**
 * 解析配置
 * 注册到容器中
 **/
public class XmlBeanDefinitionReader {
    // 核心beanfactory对象 用于将解析后的bean注册到beanfactory中
    final DefaultListableBeanFactory beanFactory;
    public XmlBeanDefinitionReader(DefaultListableBeanFactory beanFactory) {
        this.beanFactory = beanFactory;
    }
    /**
     * 根据传递的配置文件
     * 解析配置
     * 注册bean
     * @param configPath
     */
    void loadBeanDefinitions(String configPath){

    }
}
```



## mini-IOC容器--解析注册

实现步骤

1. 通过dom4j解析xml得到Document文档

2. 遍历文档所有Bean标签

3. 解析每一个Bean标签 封装一个BeanDefinition对象

4. 解析每一个Bean标签下的所有Property标签 封装一个Property对象

5. 将BeanDefinition和Property对象注册到容器

**实现xml解析及bean注册**

```java
/**
 * 解析配置
 * 注册到容器中
 **/
public class XmlBeanDefinitionReader {
    // 核心beanfactory对象 用于将解析后的bean注册到beanfactory中
    final DefaultListableBeanFactory beanFactory;
    public XmlBeanDefinitionReader(DefaultListableBeanFactory beanFactory) {
        this.beanFactory = beanFactory;
    }
    /**
     * 根据传递的配置文件
     * 解析配置
     * 注册bean
     * @param configPath
     */
    void loadBeanDefinitions(String configPath){
        // 1. 通过dom4j解析xml得到Document文档
        Document document = doLoadDocument(configPath);
        // 2. 遍历文档所有Bean标签
        Element rootElement = document.getRootElement();
        List<Element> list = rootElement.selectNodes("//bean");
        for (Element element : list) {
            // 3. 解析每一个Bean标签 封装一个BeanDefinition对象
            BeanDefinition beanDefinition = parseBeanDefinition(element);
            // 5. 将BeanDefinition和Property对象注册到容器
            beanFactory.registerBeanDefinition(beanDefinition);
        }
    }
    /**
     * 3. 解析每一个Bean标签 封装一个BeanDefinition对象
     * 4. 解析每一个Bean标签下的所有Property标签 封装一个Property对象
     */
    BeanDefinition parseBeanDefinition(Element element){
        BeanDefinition beanDefinition = new BeanDefinition();
        String beanName = element.attributeValue("id");
        String className = element.attributeValue("class");
        String scope = element.attributeValue("scope");
        beanDefinition.setBeanName(beanName);
        beanDefinition.setClassName(className);
        if(scope!=null&&!"".equals(scope)){
            beanDefinition.setScope(scope);
        }
        List<Element> propertyList = element.elements("property");
        for (Element propertyEle : propertyList) {
            Property property = new Property();
            property.setName(propertyEle.attributeValue("name"));
            property.setValue(propertyEle.attributeValue("value"));
            property.setRef(propertyEle.attributeValue("ref"));
            beanDefinition.getPropertyList().add(property);
        }
        return beanDefinition;
    }
    /**
     * 解析Document文档
     * @param configPath
     * @return
     */
    Document doLoadDocument(String configPath){
        InputStream inputStream = this.getClass().getClassLoader().getResourceAsStream(configPath);
        SAXReader saxReader = new SAXReader();
        try {
            return saxReader.read(inputStream);
        } catch (DocumentException e) {
            e.printStackTrace();
            System.out.println("解析xml出现异常==>"+e.getMessage());
            throw new RuntimeException(e.getMessage());
        }
    }
}
```



**准备测试类**

```java
/**
 * 测试类
 **/
public class IocTest {
    public static void main(String[] args) {
        // 创建IOC容器
        BeanFactory beanFactory = new XmlBeanFactory("applicationContext.xml");
        // 通过容器获取对象
        Student student = (Student)beanFactory.getBean("student");
        // 调用对象sayHello方法
        student.sayHello();
    }
}
```



**断点查看注册情况**

可以看到我们配置的xml内容 已经解析成了BeanDefinition对象，注册到了核心容器的map中



![1597377245545_IOC02.jpg](http://www.itheima.com/images/newslistPIC/1597377245545_IOC02.jpg)



## mini-IOC容器-getBean

实现步骤

1. 先从单例的map集合中获取 是否有指定beanName的对象

  ·有直接返回

  ·没有下一步

2. 从注册集合中获取bean的定义对象

  ·有下一步

  ·没有抛异常NoSuchBeanDefinition

3. 判断bean的scope作用域

  singleton单例

​    · createBean对象

​    ·存入单例集合

​    ·返回对象

prototype多例

​    ·createBean对象

​    ·返回对象

4. createBean方法

​    获取BeanDefinition中的className

​    通过反射API得到Class对象

​    通过反射API得到bean实例

​    获取BeanDefinition中依赖的属性列表

​    实现属性的依赖注入



**实现getBean及createBean方法**

```java
/**
 * 基础容器的核心实现
 * 提供 beanDefinitionMap 存储bean的定义
 * 提供 singletonObjects 存储bean的对象实例
 **/
public class DefaultListableBeanFactory implements BeanFactory {
    // 提供 beanDefinitionMap 存储bean的定义
    private Map<String,BeanDefinition> beanDefinitionMap = new ConcurrentHashMap<>();
    // 提供 singletonObjects 存储bean的对象实例 (scope为singleton的)
    private Map<String,Object> singletonObjects = new ConcurrentHashMap<>();
    /**
     * 实现getBean方法
     * @param beanName
     * @return
     */
    @Override
    public Object getBean(String beanName) {
//        1. 先从单例的map集合中获取 是否有指定beanName的对象
        Object singletonObj = singletonObjects.get(beanName);
//                有直接返回
        if(singletonObj!=null){
            return singletonObj;
        }
//                没有下一步
//        2. 从注册集合中获取bean的定义对象
        BeanDefinition beanDefinition = beanDefinitionMap.get(beanName);
//                有下一步
//        没有抛异常NoSuchBeanDefinition
        if(beanDefinition==null){
            throw new RuntimeException("NoSuchBeanDefinition : 你找的 "+beanName+" 对象 不存在");
        }
//        3. 判断bean的scope作用域
        String scope = beanDefinition.getScope();
//                singleton单例
        if("singleton".equals(scope)){
//        createBean对象
            Object obj = createBean(beanDefinition);
//        存入单例集合
            singletonObjects.put(beanName,obj);
//        返回对象
            return obj;
        }else {
//        prototype多例
//        createBean对象
            return createBean(beanDefinition);
//        返回对象
        }
    }
    /**
     * //4. createBean方法
     * //获取BeanDefinition中的className
     * //通过反射API得到Class对象
     * //通过反射API得到bean实例
     * //获取BeanDefinition中依赖的属性列表
     * //实现属性的依赖注入
     * 创建对象
     * @param beanDefinition
     * @return
     */
    Object createBean(BeanDefinition beanDefinition){
        String className = beanDefinition.getClassName();
        Class<?> aClass;
        try {
            aClass = Class.forName(className);
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
            throw new RuntimeException("类未找到"+e.getMessage());
        }
        // 创建对象:
        Object obj;
        try {
            obj = aClass.newInstance();
        } catch (InstantiationException e) {
            e.printStackTrace();
            throw new RuntimeException("创建对象失败"+e.getMessage());
        } catch (IllegalAccessException e) {
            e.printStackTrace();
            throw new RuntimeException("非法访问"+e.getMessage());
        }
        // 依赖注入
        List<Property> propertyList = beanDefinition.getPropertyList();
        for (Property property : propertyList) {
            String name = property.getName();
            String value = property.getValue();
            String ref = property.getRef();
            // 属性名不为空 进行注入
            if(name!=null&&!"".equals(name)){
                // 如果配置的是value值 直接注入
                if(value!=null&&!"".equals(value)){
                    Map<String,String> params = new HashMap<>();
                    params.put(name,value);
                    try {
                        BeanUtils.populate(obj,params);
                    } catch (IllegalAccessException e) {
                        e.printStackTrace();
                        throw new RuntimeException("非法访问"+e.getMessage());
                    } catch (InvocationTargetException e) {
                        e.printStackTrace();
                        throw new RuntimeException("调用目标对象失败"+e.getMessage());
                    }
                }
                // 如果配置的是ref需要获取其它对象注入
                if(ref!=null&&!"".equals(ref)){
                    try {
                        BeanUtils.setProperty(obj,name,getBean(ref));
                    } catch (IllegalAccessException e) {
                        e.printStackTrace();
                        throw new RuntimeException("非法访问"+e.getMessage());
                    } catch (InvocationTargetException e) {
                        e.printStackTrace();
                        throw new RuntimeException("调用目标对象失败"+e.getMessage());
                    }
                }
            }
        }
        return obj;
    }
    /**
     * 将bean注册到容器中
     * @param beanDefinition
     */
    public void registerBeanDefinition(BeanDefinition beanDefinition){
        beanDefinitionMap.put(beanDefinition.getBeanName(),beanDefinition);
    }
}
```



## mini-IOC容器-单例对象初始化

**DefaultListableBeanFactory增加初始化方法**

```java
public void preInstaniceSingletons(){
        beanDefinitionMap.forEach((beanName,beanDefinition)->{
            String scope = beanDefinition.getScope();
            // 判断单例  非抽象   不懒加载
            if("singleton".equals(scope)){
                this.getBean(beanName);
            }
        });
    }
```



**XmlBeanFactory增加单例对象初始化**

```java
public XmlBeanFactory(String configPath) {
   // 使用reader对象 解析配置  注册Bean
   this.xmlBeanDefinitionReader.loadBeanDefinitions(configPath);
   // 初始化单例对象
   this.preInstaniceSingletons();
}
```



## mini-IOC容器-测试和小结

**测试对象能否获取**

```Java
public class IocTest {
    public static void main(Stiring[] args) {
        BeanFactory beanFactory = new XmlBeanFactory("applicationContext.xml");
        Student student = (Student) beanFactory.getBean("student");
        student.sayHello();
    }
}
```




**查看bean的注册及单例集合信息**

可以通过变更scope的值查看对应的变化

![1597377267020_IOC04.jpg](http://www.itheima.com/images/newslistPIC/1597377267020_IOC04.jpg)

## **IOC容器源码及其它面试细节**

### **扩展: 容器如何创建对象**

IOC容器在准备创建对象时， 会判断是否有配置 factory-method方法

如果有配置 会调用factory-method所指向的方法构建对象.

如果没配置，会检查是否有配置构造参数

无构造参数: 调用默认构造器创建对象

有构造参数: 根据参数情况匹配对应的构造器



### **扩展: bean的生命周期**

spring 容器中的bean的完整生命周期一共分为十一步完成。

1.bean对象的实例化

2.封装属性，也就是设置properties中的属性值

3.如果bean实现了BeanNameAware，则执行setBeanName方法,也就是bean中的id值

4.如果实现BeanFactoryAware或者ApplicationContextAware ，需要设置setBeanFactory或者上下文对象setApplicationContext

5.如果存在类实现BeanPostProcessor后处理bean，执行postProcessBeforeInitialization，可以在初始化之前执行一些方法

6.如果bean实现了InitializingBean，则执行afterPropertiesSet，执行属性设置之后的操作

7.调用执行指定的初始化方法

8.如果存在类实现BeanPostProcessor则执行postProcessAfterInitialization，执行初始化之后的操作

9.执行自身的业务方法

10.如果bean实现了DisposableBean，则执行spring的的销毁方法

11.调用执行自定义的销毁方法。



### **扩展: bean的循环依赖问题**

A 依赖 B B 依赖 A 产生闭环，称为循环依赖

·Spring 默认允许单例对象的属性注入 所产生的循环依赖

单例对象的循环依赖 Spring通过3级缓存来解决

比如一个类A中有一个属性是B类，B类中有一个属性是A类，这时看Spring是怎么解决他们的相互依赖的。Spring注入一个类的大体步骤分为两部分，一是先完成对类的构造工作，二是会对类的属性进行设置和填充。首先Spring构造A类，通过AbstractAutowireCapableBeanFactory的doCreateBean方法中调用addSingletonFactory方法将A类曝光到singletonFactories中。这时完成A的构造后，需要填充B属性，继续第二步，发现B还没有构造，于是开始B流程的构造过程，构造的时候发现需要填充A，从第三层缓存singletonFactories中找到A(此时的A还没有完全构造完成，但是可以拿到A的一个引用)，B拿到A的引用后，完成B自己的填充属性工作，完成初始化工作，把自己放到第一层缓存singletonObjects中。这时回到A的这边，在拿到B对象后，完成自己的填充属性工作。

| 源码                  | 级别     | 描述                                                         |
| --------------------- | -------- | ------------------------------------------------------------ |
| singletonObjects      | 一级缓存 | 用于存放完全初始化好的 bean，从该缓存中取出的 bean 可以直接使用 |
| earlySingletonObjects | 二级缓存 | 存放原始的 bean 对象（尚未填充属性），用于解决循环依赖       |
| singletonFactories    | 三级缓存 | 存放 bean 工厂对象，用于解决循环依赖·如果是构造器依赖属性 会报循环依赖异常 |

·如果对象都是多例对象 会报循环依赖异常

·如果设置allowCircularReferences为false 会报循环依赖异常

```java
protected void customizeBeanFactory(DefaultListableBeanFactory beanFactory) {
   if (this.allowBeanDefinitionOverriding != null) {
      beanFactory.setAllowBeanDefinitionOverriding(this.allowBeanDefinitionOverriding);
   }
   if (this.allowCircularReferences != null) {
      beanFactory.setAllowCircularReferences(this.allowCircularReferences);
   }
}
```

### **扩展: bean的覆盖问题**

默认情况:

同一个配置文件中出现id相同的bean会报错，不同的配置文件出现id相同的bean后加，载的bean会将先加载的bean覆盖掉称为bean的覆盖，bean的覆盖不会报错，但可能影响我们的项目，可以通过属性设置不允许bean的覆盖，allowBeanDefinitionOverriding设置为false。

<Reward/>
