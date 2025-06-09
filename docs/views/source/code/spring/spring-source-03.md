---
title: 手写 Spring 03 - 扩展 Bean 的生命周期
date: 2023-03-07
tags:
   - 源码分析
   - Java
categories:
   - 源码 Source-code
isShowComments: true
---

<Boxx/>

<!-- more -->

[[toc]]

## 在 Bean 的生命周期添加扩展点

### 定义一些职责和能力：

1. BeanFactoryPostProcessor：用于修改 Spring 容器中 BeanDefinition 的扩展点。

   当 Spring 容器创建 BeanDefinition 之后，但在创建 Bean 实例之前，BeanFactoryPostProcessor 就可以通过实现 postProcessBeanFactory 方法来修改 BeanDefinition 的属性，如修改 Bean 的作用域、添加 Bean 的属性值等。BeanFactoryPostProcessor 的实现类在 Spring 容器启动时就会被调用。

2. BeanPostProcessor：用于修改 Bean 实例的扩展点。

   当 Spring 容器创建 Bean 实例之后，但在初始化 Bean 之前，BeanPostProcessor 就可以通过实现 postProcessBeforeInitialization 和 postProcessAfterInitialization 方法来修改 Bean 的属性或执行一些初始化操作。例如，可以为 Bean 添加代理对象、修改属性值、执行 AOP 操作等。BeanPostProcessor 的实现类在 Spring 容器启动时就会被调用，并且会对容器中的每个 Bean 实例都进行处理。

3. HierarchicalBeanFactory：扩展 BeanFactory 接口，支持父子容器，这里暂时无用。

4. DefaultSingletonBeanRegistry： implements SingletonBeanRegistry

   实现了添加和获取单例 Bean 的能力

5. ConfigurableBeanFactory：extends HierarchicalBeanFactory, SingletonBeanRegistry

   扩展 BeanFactory 接口，支持设置父级容器、自自定义作用域、**添加 BeanPostProcessor 后置处理器**、设置 bean 的初始化和销毁回调方法等。

6. **AutowireCapableBeanFactory**：扩展 BeanFactory 接口，支持自动装配 Bean 的能力，

   这里主要添加扩展点 `Object applyBeanPostProcessorsBeforeInitialization(Object existingBean, String beanName);` 作为 **初始化前 bean 的前置处理**，`Object applyBeanPostProcessorsAfterInitialization(Object existingBean, String beanName);` 作为 **初始化后 bean 的后置处理**。



### 具体的实现：

1. AbstractBeanFactory：[主要实现了doGetBean()，添加BeanPostProcessor]

    extends DefaultSingletonBeanRegistry（已经实现了添加和获取单例 Bean 的能力）

    implements ConfigurableBeanFactory（添加 BeanPostProcessor  后置处理器）

   实现：内置一个 `List<BeanPostProcessor>` 列表，实现了 **添加 BeanPostProcessor**  和 获取 BeanPostProcessor 的能力。

2. AbstractAutowireCapableBeanFactory：[真实的doGetBean()调用的`createBean(beanName, beanDefinition, args);`的过程在这个类里，所以将Bean的扩展点加入到创建Bean的过程中]

    extends AbstractBeanFactory （已经具备了添加BeanPostProcessor的能力）

    implements **AutowireCapableBeanFactory**（实现 bean 的实例化前后置回调）

   实现：在 createBean() 中，一个 Bean 实例化后进行属性填充，之后加入 Bean 的 init()，在 init() 前后加入 BeanPostProcessor 前后置方法的回调，这样在创建一个 Bean 的时候就加入了 Bean 的生命周期干预。
   
3. 对于 BeanFactoryPostProcessor，在测试的时候我们手写一个实现了，手动调用一下即可。（后续加入上下文的时候，在上下文里实现自动调用）



### 将实现加入原有的逻辑中：

1. 如上 AbstractBeanFactory 和 AbstractAutowireCapableBeanFactory



### 测试：

- BeanPostProcessor 准备

```java
public class CatBeanPostProcessor implements BeanPostProcessor {

    @Override
    public Object postProcessBeforeInitialization(Object bean, String beanName) {
        System.out.println("beanName：" + beanName + " 进入到 Bean 扩展点 BeanPostProcessor -> postProcessBeforeInitialization");
        if ("cat".equals(beanName)) {
            Cat cat = (Cat) bean;
            return new Cat("postProcessBeforeInitialization name cat");
        }
        return bean;
    }

    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) {
        System.out.println("beanName：" + beanName + " 进入到 Bean 扩展点 BeanPostProcessor -> postProcessAfterInitialization");
        return bean;
    }

}
```

- BeanFactoryPostProcessor 准备

```java
public class DogBeanFactoryPostProcessor implements BeanFactoryPostProcessor {

    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) {
        System.out.println("进入到 BeanDefinition 扩展点 BeanFactoryPostProcessor -> postProcessBeanFactory");
        String beanName = "dog";
        BeanDefinition beanDefinition = beanFactory.getBeanDefinition(beanName);
        PropertyValues propertyValues = beanDefinition.getPropertyValues();
        PropertyValue propertyValue = propertyValues.getPropertyValue("name");
        String oldValue = String.valueOf(propertyValue.getValue());
        String updateValue = beanName + "-BeanDefinition-updated";
        propertyValue.setValue(updateValue);
        System.out.println("beanName：" + beanName + " 属性：name，原先值：" + oldValue + " 修改后值：" + updateValue);
        System.out.println();
    }

}
```

- 外部资源 spring.xml 准备

```xml
<?xml version="1.0" encoding="utf-8" ?>

<beans>
    <bean id="cat" name="catBEAN" class="com.snail.springframework.beans.factory.support.Cat">
        <property name="name" value="cat-name-xml-init"></property>
    </bean>
    <bean id="dog" class="com.snail.springframework.beans.factory.support.Dog">
        <property name="name" value="dog-name-xml-init"></property>
        <property name="cat" ref="cat"></property>
    </bean>

    <!--  添加扩展点相关类  -->
    <bean class="com.snail.springframework.beans.factory.support.CatBeanPostProcessor"/>
    <bean class="com.snail.springframework.beans.factory.support.DogBeanFactoryPostProcessor"/>
</beans>
```

- 测试类

```java
@Test
public void test_beanFactoryAndPostProcessor() {
    // 1. 初始化 Bean 工厂
    DefaultListableBeanFactory beanFactory = new DefaultListableBeanFactory();
    // 2. 使用加载器加载xml配置文件，初始化 BeanDefinition
    XmlBeanDefinitionReader reader = new XmlBeanDefinitionReader(beanFactory);
    reader.loadBeanDefinitions("classpath:spring.xml");
    
	// 3. 添加 BeanDefinition 扩展点，（这里的扩展点是手动调用的）
    // 在 Bean 实例化前，BeanDefinition 初始化后
    new DogBeanFactoryPostProcessor().postProcessBeanFactory(beanFactory);
    // 4. 添加 Bean 扩展点
    // Bean 初始化前后回调相应方法
    CatBeanPostProcessor catBeanPostProcessor = new CatBeanPostProcessor();
    beanFactory.addBeanPostProcessor(catBeanPostProcessor);
    
    // 5. 获取bean
    Dog dog = (Dog) beanFactory.getBean("dog");
    System.out.println();
    dog.printName();
}
```

- 测试结果

```java
进入到 BeanDefinition 扩展点 BeanFactoryPostProcessor -> postProcessBeanFactory
beanName：dog 属性：name，原先值：dog-name-xml-init 修改后值：dog-BeanDefinition-updated

beanName：cat 进入到 Bean 扩展点 BeanPostProcessor -> postProcessBeforeInitialization
beanName：cat 进入到 Bean 扩展点 BeanPostProcessor -> postProcessAfterInitialization
beanName：dog 进入到 Bean 扩展点 BeanPostProcessor -> postProcessBeforeInitialization
beanName：dog 进入到 Bean 扩展点 BeanPostProcessor -> postProcessAfterInitialization

dog-BeanDefinition-updated
Cat{name='postProcessBeforeInitialization name cat'}
{inner-dog2=JerryDog, inner-dog1=TomDog}
```

<Reward/>
