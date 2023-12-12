---
title: 手写 Spring 11 - Bean注解方式扫描，Bean属性xml解析替换
date: 2023-12-12
tags:
   - 源码分析
   - Java
categories:
   - 后端 Back-end
isShowComments: true
---

<Boxx/>

<!-- more -->

[[toc]]

## **解析**

- Bean 注解方式扫描：之前已经实现了从 xml 配置的 bean 加载到容器中。扫描注解加载 bean 无非就是从 xml 中获取要扫描的包路径，然后将解析注解加载 BeanDefinition 的过程插入到之前的解析 xml 配置 bean 的流程中。

> 不管是从 xml 配置的 bean，还是从注解扫描的 bean，其实都是先组装为 BeanDefinition 对象。
>
> 在容器 getBean() 的时候，才将相应的 BeanDefinition 实例化为真正的对象。

- Bean 属性 Xml 配置替换：其实就是利用 Spring 自带的 BeanDefinition 扩展点接口（`BeanFactoryPostProcessor`），创建 BeanDefinition 之后，但在创建 Bean 实例之前。提供修改 BeanDefinition 的机会。只要实现这个接口我们就可以修改 Bean 的属性替换了。

## Bean注解方式扫描

定义注解 `@Component`，定义工具类可以扫描指定包下的所有符合规则的类文件。

修改 `XmlBeanDefinitionReader` 在加载 xml 文件时，取出 `component-scan` 属性用于支持此次逻辑（扫描注解添加到容器中）的添加。

同时本次再添加注解 `@Scope`，用于 Bean 的作用域。

### **定义一些职责和能力**

1. @Component，@Scope
2. ClassPathScanningCandidateComponentProvider：类路径扫描候选组件提供程序，从指定报下找出指定类组装为一个BeanDefinition。
3. ClassPathBeanDefinitionScanner： 继承自ClassPathScanningCandidateComponentProvider，还支持解析 bean 的作用域及最终 bean 的名字，同时还具备向容器中添加 BeanDefinition 的能力。
4. XmlBeanDefinitionReader：将从注解加载 BeanDefinition 的能力，融入到在加载解析 xml 文件过程中。


### **具体的实现**

1. ClassPathScanningCandidateComponentProvider

```java
public class ClassPathScanningCandidateComponentProvider {

    /**
     * 查找 @Component 候选组件
     *
     * @param basePackage 基本包
     * @return {@link Set}<{@link BeanDefinition}>
     */
    public Set<BeanDefinition> findCandidateComponents(String basePackage) {
        LinkedHashSet<BeanDefinition> candidates = new LinkedHashSet<>();
        Set<Class<?>> classes = ClassUtil.scanPackageByAnnotation(basePackage, Component.class);
        for (Class<?> clazz : classes) {
            candidates.add(new BeanDefinition(clazz));
        }
        return candidates;
    }

}
```

2. ClassPathBeanDefinitionScanner

```java
public class ClassPathBeanDefinitionScanner 
    extends ClassPathScanningCandidateComponentProvider {

    private final BeanDefinitionRegistry registry;

    public ClassPathBeanDefinitionScanner(BeanDefinitionRegistry registry) {
        this.registry = registry;
    }

    /**
     * 扫描指定包下的所有文件，判断是否含有指定注解，将符合规则的文件转换为 BeanDefinition 加入到容器中
     *
     * @param basePackages 基本程序包
     */
    public void doScan(String... basePackages) {
        for (String basePackage : basePackages) {
            Set<BeanDefinition> candidates = findCandidateComponents(basePackage);
            for (BeanDefinition beanDefinition : candidates) {
                // 解析 Bean 的作用域和属性
                String scope = resolveBeanScope(beanDefinition);
                if (CharSequenceUtil.isNotBlank(scope)) {
                    beanDefinition.setScope(scope);
                }
                registry.registerBeanDefinition(determineBeanName(beanDefinition), beanDefinition);
            }
        }
    }

    /**
     * 解析 bean 作用域
     *
     * @param beanDefinition bean定义
     * @return {@link String}
     */
    private String resolveBeanScope(BeanDefinition beanDefinition) {
        Class<?> beanClass = beanDefinition.getBeanClass();
        Scope scope = beanClass.getAnnotation(Scope.class);
        if (scope != null && CharSequenceUtil.isNotBlank(scope.value())) {
            return scope.value();
        }
        return "";
    }

    /**
     * 确定 bean 名称
     *
     * @param beanDefinition bean定义
     * @return {@link String}
     */
    private String determineBeanName(BeanDefinition beanDefinition) {
        Class<?> beanClass = beanDefinition.getBeanClass();
        Component component = beanClass.getAnnotation(Component.class);
        if (component != null && CharSequenceUtil.isNotBlank(component.value())) {
            return component.value();
        }
        return CharSequenceUtil.lowerFirst(beanClass.getSimpleName());
    }

}
```


### **将实现加入原有的逻辑中**

- 修改 `XmlBeanDefinitionReader#doLoadBeanDefinitions()`，因为最终这里会解析 xml 文件，组装 BeanDefinition 加入到容器中。

```java
private void doLoadBeanDefinitions(InputStream inputStream) throws ClassNotFoundException, DocumentException {
    SAXReader reader = new SAXReader();
    Document document = reader.read(inputStream);
    Element root = document.getRootElement();

    // 解析 component-scan 标签，从指定包下扫描类文件并加载为 BeanDefinition 对象。这里包含了属性表达式值的替换操作。
    Element componentScan = root.element("component-scan");
    if (componentScan != null) {
        String scanPath = componentScan.attributeValue("base-package");
        if (StrUtil.isBlank(scanPath)) {
            throw new BeansException("The value of base-package attribute can not be empty or null");
        }
        scanPackage(scanPath);
    }

    // 解析 <bean> 标签，从 xml 配置文件中加载为 BeanDefinition
    List<Element> beanList = root.elements("bean");
    for (Element bean : beanList) {
        // 1. 解析 bean 标签
        String id = bean.attributeValue("id");
        String name = bean.attributeValue("name");
        
        // 省略...

        // 5. 注册 BeanDefinition
        getRegistry().registerBeanDefinition(beanName, beanDefinition);
    }
}

/**
 * 从指定包下，扫描注解类，组装 BeanDefinition 加入到容器中
 *
 * @param scanPath 扫描路径
 */
private void scanPackage(String scanPath) {
    String[] basePackages = StrUtil.splitToArray(scanPath, ",");
    ClassPathBeanDefinitionScanner scanner = new ClassPathBeanDefinitionScanner(getRegistry());
    scanner.doScan(basePackages);
}
```

### **测试**

- xml 准备，spring-component-scan.xml。

```xml
<?xml version="1.0" encoding="utf-8" ?>

<beans xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/context">

    <!--  ↓↓ spring @Component 测试 ↓↓ -->
    <context:component-scan base-package="com.snail.springframework.beans.factory.bean"/>

</beans>
```

- 提前准备，指定包下带注解的类。


```java
package com.snail.springframework.beans.factory.bean;

import com.snail.springframework.stereotype.Component;

@Component
public class RabbitComponent implements Animal {

    private String nameFromPropertyPlaceholder;

    @Override
    public String getAnimalName() {
        return nameFromPropertyPlaceholder;
    }

}
```

- 测试类

```java
public class SpringComponentPropertyTest {

    /**
     * 测试从指定包下扫描 @Component 注解
     * RabbitComponent 的属性没有赋值，返回结果应该是 null
     */
    @Test
    public void test_scan_component() {
        ClassPathXmlApplicationContext applicationContext = new ClassPathXmlApplicationContext("classpath:spring-component-scan.xml");
        RabbitComponent rabbitComponent = (RabbitComponent) applicationContext.getBean("rabbitComponent");
        System.out.println("测试结果：" + rabbitComponent.getAnimalName());
        // 测试结果：null
    }
    
}
```

- 测试结果

```java
测试结果：null
```



## Bean属性Xml配置替换

前提知识点：

`BeanFactoryPostProcessor` 接口：创建 BeanDefinition 之后，但在创建 Bean 实例之前，提供修改 BeanDefinition 的机会。

解析：

提前准备好属性替换的 properties 配置文件。再利用 Spring 自带的 BeanDefinition 扩展点接口（`BeanFactoryPostProcessor`），只要实现这个接口我们就可以修改 Bean 的属性替换了。

### **定义一些职责和能力**

1. PropertyPlaceholderConfigurer，实现了 `BeanFactoryPostProcessor` 接口。从配置文件加载占位符的 key value，在 bean 实例化之前，更改属性信息。

### **具体的实现**

1. PropertyPlaceholderConfigurer

```java
/**
 * bean对象 占位符处理 <br/>
 * 从配置文件加载占位符的 key value，在 bean 实例化之前，更改属性信息。
 */
public class PropertyPlaceholderConfigurer 
    implements BeanFactoryPostProcessor {

    /**
     * 默认占位符前缀
     */
    public static final String DEFAULT_PLACEHOLDER_PREFIX = "${";

    /**
     * 默认占位符后缀
     */
    public static final String DEFAULT_PLACEHOLDER_SUFFIX = "}";

    private String location;

    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) {
        // 加载属性文件
        DefaultResourceLoader resourceLoader = new DefaultResourceLoader();
        Properties properties = new Properties();
        try {
            properties.load(resourceLoader.getResource(location).getInputStream());
        } catch (IOException e) {
            throw new BeansException("Could not load properties", e);
        }

        // 遍历所有bean的属性值，符合规则的替换
        String[] beanDefinitionNames = beanFactory.getBeanDefinitionNames();
        for (String beanName : beanDefinitionNames) {
            BeanDefinition beanDefinition = beanFactory.getBeanDefinition(beanName);
            PropertyValues propertyValues = beanDefinition.getPropertyValues();
            for (PropertyValue propertyValue : propertyValues.getPropertyValues()) {
                Object value = propertyValue.getValue();
                if (!(value instanceof String)) {
                    continue;
                }
                String strValue = (String) value;
                StringBuilder builder = new StringBuilder(strValue);
                int startIdx = strValue.indexOf(DEFAULT_PLACEHOLDER_PREFIX);
                int stopIdx = strValue.indexOf(DEFAULT_PLACEHOLDER_SUFFIX);
                if (startIdx != -1 && stopIdx != -1 && startIdx < stopIdx) {
                    String key = strValue.substring(startIdx + 2, stopIdx);
                    String val = properties.getProperty(key);
                    builder.replace(startIdx, stopIdx + 1, val);
                    propertyValues.addPropertyValue(new PropertyValue(propertyValue.getName(), builder.toString()));
                }
                propertyValue.setValue(builder.toString());
            }
        }
    }

    public void setLocation(String location) {
        this.location = location;
    }
}
```

### **将实现加入原有的逻辑中**

1. PropertyPlaceholderConfigurer 实现了 `BeanFactoryPostProcessor`  --> Spring 容器中 BeanDefinition 的扩展点，创建 BeanDefinition 之后，但在创建 Bean 实例之前。修改 BeanDefinition 的属性。

### **测试**

- xml 准备，spring-component-property.xml。

```xml
<?xml version="1.0" encoding="utf-8" ?>

<beans xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/context">

    <!--  ↓↓ spring propertyPlaceholder 测试 ↓↓ -->
    <!--  配置属性表达式解析器  -->
    <bean class="com.snail.springframework.beans.factory.PropertyPlaceholderConfigurer">
        <property name="location" value="classpath:spring-component-property.properties"></property>
    </bean>

    <!--  从xml加载bean实例  -->
    <bean id="rabbitComponent"
        class="com.snail.springframework.beans.factory.bean.RabbitComponent">
        <property name="nameFromPropertyPlaceholder" value="${nameFromPropertyPlaceholder}"></property>
    </bean>

</beans>

```

再准备一个配置文件：spring-component-property.properties，用于 `${nameFromPropertyPlaceholder}` 属性替换。

```properties
nameFromPropertyPlaceholder=rabbit001
```

- 提前准备，还是 RabbitComponent，这次只不过是从 xml 配置的 bean。


```java
package com.snail.springframework.beans.factory.bean;

import com.snail.springframework.stereotype.Component;

@Component
public class RabbitComponent implements Animal {

    private String nameFromPropertyPlaceholder;

    @Override
    public String getAnimalName() {
        return nameFromPropertyPlaceholder;
    }

}
```

- 测试类

```java
public class SpringComponentPropertyTest {

    /**
     * 测试从配置文件加载 bean，并且完成 bean 类的 ${value} 属性替换
     * RabbitComponent 的属性从配置文件 ${nameFromPropertyPlaceholder} 完成替换
     */
    @Test
    public void test_scan_properties_replace() {
        ClassPathXmlApplicationContext applicationContext = new ClassPathXmlApplicationContext("classpath:spring-component-property.xml");
        RabbitComponent rabbitComponent = (RabbitComponent) applicationContext.getBean("rabbitComponent");
        System.out.println("测试结果：" + rabbitComponent.getAnimalName());
        // 测试结果：rabbit001
    }

}
```

- 测试结果

```java
测试结果：rabbit001
```

## **总结**

从外部文件加载到容器中，不管是从 xml 配置的 bean，还是从注解扫描的 bean，其实都是先组装为 BeanDefinition 对象。

只有在首次在容器 getBean() 的时候，才将相应的 BeanDefinition 实例化为真正的对象。

同时也知道了 `BeanFactoryPostProcessor` 接口的作用 --> Spring 容器中 BeanDefinition 的扩展点，创建 BeanDefinition 之后，但在创建 Bean 实例之前。提供了一次修改 BeanDefinition 的机会。

<Reward/>
