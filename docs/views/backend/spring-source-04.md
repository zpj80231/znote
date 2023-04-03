---
title: 手写 Spring 04 - 加入上下文，预加载容器操作
date: 2023-03-19
tags:
   - 源码分析
   - Java 
categories:
   - 后端 Back-end
isShowComments: true
---

<Boxx/>

Spring 上下文（Context）和 BeanFactory 是 Spring 框架中的两个重要概念，它们之间存在继承关系。

BeanFactory 是 Spring 框架中最基本的容器，它是一个用于管理 Bean 实例的工厂。在 Spring 中，BeanFactory 提供了一些基本的功能，例如 Bean 的创建、配置、生命周期管理等。但是，BeanFactory 的功能相对较为简单，只有在使用时才会进行 Bean 的创建和初始化。

Spring 上下文则是在 BeanFactory 的基础上扩展而来的，它提供了更多的高级功能，例如国际化、AOP、事件发布等。与 BeanFactory 不同，**Spring 上下文在启动时会一次性创建并初始化所有的 Bean 实例**，这样可以提高应用程序的启动速度和运行效率。同时，Spring 上下文还提供了更多的扩展点，使得可以在运行时动态地加载和卸载 Bean 定义、注册和取消注册 BeanFactory 后置处理器和应用程序监听器等。

因此，Spring 上下文可以看作是 BeanFactory 的一个扩展，它在 BeanFactory 的基础上添加了更多的高级功能和扩展点。在实际应用中，通常使用 Spring 上下文来管理 Bean 实例和配置信息，而不是直接使用 BeanFactory。

<!-- more -->

[[toc]]

## 加入上下文

### 定义一些职责和能力：

1. ListableBeanFactory：扩展 BeanFactory 接口，支持获取多个 Bean 或者与获取多个 Bean 相关的能力。

   根据类型获取 Spring 容器中所有对应类型的 Bean 实例：`<T> Map<String, T> getBeansOfType(Class<T> type);`

   获取 Spring 容器中所有 BeanDefinition 的名称：`String[] getBeanDefinitionNames();`

2. ApplicationContext：

   ```java
    extends ListableBeanFactory
   ```

   容器顶层接口，与 BeanFactory 不同，ApplicationContext 在容器启动时会一次性创建并初始化所有的 Bean 实例，而不是在使用时再进行创建。这意味着，ApplicationContext 在应用程序启动时会更快地启动和准备好，同时也减少了在运行时创建 Bean 实例的开销。此外，ApplicationContext 还提供了更多的特性，例如事件发布、国际化、AOP 等。

   这里我们只定义，留空不做任何处理。

3. ConfigurableApplicationContext

   ```java
    extends ApplicationContext
   ```

   扩展了 ApplicationContext 的功能，在这里定义了大名鼎鼎的刷新 **`refresh()`** 功能，另外，ConfigurableApplicationContext 还提供了一些工具方法，例如获取系统环境变量、获取资源、获取 Bean 类型、启动和关闭容器等。

4. ConfigurableListableBeanFactory

   ```java
    extends ListableBeanFactory,// 可获取多个 Bean 
           AutowireCapableBeanFactory, // BeanPostProcessor 的前后置处理
           ConfigurableBeanFactory // 添加 BeanPostProcessor
   ```

   这里我们主要定义了预实例化所有单例 bean 的能力：`void preInstantiateSingletons();`



### 具体的实现：

1. AbstractApplicationContext

   ```java
   extends DefaultResourceLoader // 获得了资源加载器的能力
   implements ConfigurableApplicationContext {
       @Override
       public void refresh() {
           // 1. 创建 Bean 工厂，加载 BeanDefinition
           refreshBeanFactory();
   
           // 2. 获得 Bean 工厂
           ConfigurableListableBeanFactory beanFactory = getBeanFactory();
   
           // 3. BeanDefinition 扩展点：
           // Spring 容器中 BeanDefinition 的扩展点。
           // 创建 BeanDefinition 之后，但在创建 Bean 实例之前。
           invokeBeanFactoryPostProcessors(beanFactory);
   
           // 4. Bean 扩展点：
           // 提前注册所有的 BeanPostProcessor，在 Bean 创建后，初始化时扩展
           //（见 AbstractAutowireCapableBeanFactory.createBean ）。
           registerBeanPostProcessors(beanFactory);
   
           // 5. 提前实例化所有的单例 Bean
           beanFactory.preInstantiateSingletons();
       }
   }
   ```

   主要实现了 refresh() 这个核心方法。

2. AbstractRefreshableApplicationiContext

   ```java
    extends AbstractApplicationContext
   ```

   主要实现了 refreshBeanFactory()，这个方法中创建了默认的容器 DefaultListableBeanFactory，同时在创建容器后向容器中加载Bean定义：loadBeanDefinitions(DefaultListableBeanFactory beanFactory)，留给子类实现。

3. AbstractXmlApplicationContext

   ```java
    extends AbstractRefreshableApplicationiContext
   ```

   主要实现了从指定资源位置加载 Bean 定义： loadBeanDefinitions(DefaultListableBeanFactory beanFactory)

   同时留作获取资源位置： getConfigLocations(); 给子类实现。

4. ClassPathXmlApplicationContext：

   ```java
   extends AbstractXmlApplicationContext
   ```

   ClassPathXmlApplicationContext 上下文是 Bean 工厂的高级实现，将复杂的 xml 的加载、解析，Bean 的注册、实例化、属性填充、生命周期扩展等进行融合，让我们对 Bean 的管理更加简单易用。

   实现通过构造参数的方式`new ClassPathXmlApplicationContext("classpath:spring.xml");`赋值给 getConfigLocations() 来实现资源位置的获取。



### 将实现加入原有的逻辑中：

1. 可以看到，refresh() 默认创建的容器是 DefaultListableBeanFactory，而 refresh() 中弟 5 步：提前实例化所有的单例 Bean，这个是之前 DefaultListableBeanFactory 这个容器所不具备的能力。修改 DefaultListableBeanFactory：

   ```java
   extends AbstractAutowireCapableBeanFactory // 具备真正创建bean实例化、属性填充、BeanPostProcessor前后置扩展的能力
       implements BeanDefinitionRegistry, // 之前 DefaultListableBeanFactory 已经实现了 注册 BeanDefinition 相关的能力
   	ConfigurableListableBeanFactory // 新添加 要实现的功能：预实例化所有单例 Bean
   {
   	private final Map<String, BeanDefinition> beanDefinitionMap = new HashMap<>();
       @Override
       public void preInstantiateSingletons() {
           beanDefinitionMap.keySet().forEach(this::getBean);
       }
       @Override
       public <T> Map<String, T> getBeansOfType(Class<T> type) {
           HashMap<String, T> result = new HashMap<>();
           beanDefinitionMap.forEach((beanName, beanDefinition) -> {
               Class<?> beanClass = beanDefinition.getBeanClass();
               if (type.isAssignableFrom(beanClass)) {
                   result.put(beanName, (T) getBean(beanName));
               }
           });
           return result;
       }
       @Override
       public String[] getBeanDefinitionNames() {
           return beanDefinitionMap.keySet().toArray(new String[0]);
       }
   }
   ```

   因为在 XmlBeanDefinitionReader 资源加载的时候，会将所有的 BeanDefinition 注册到容器 DefaultListableBeanFactory，所以在这里只需将所有 BeanDefinition 遍历去构建 Bean 即可。



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

之前使用容器的测试类：

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

使用上下文后的测试类，可以看到相比之前已经有了极大的便利性：

```java
@Test
public void test_xml_context() {
    // 1. 利用 xml上下文 加载Bean
    // 上下文的高级实现极大的简化了或融合了上述的 1-4 步操作
    ClassPathXmlApplicationContext applicationContext = new ClassPathXmlApplicationContext("classpath:spring.xml");
    // 2. 获取bean
    Dog dog = (Dog) applicationContext.getBean("dog");

    String[] beanDefinitionNames = applicationContext.getBeanDefinitionNames();
    System.out.println();
    System.out.println(JSONUtil.toJsonStr(beanDefinitionNames));
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

["cat","catBeanPostProcessor","dog","dogBeanFactoryPostProcessor"]

dog-BeanDefinition-updated
Cat{name='postProcessBeforeInitialization name cat'}
{inner-dog2=JerryDog, inner-dog1=TomDog}
```



## 总结

总结，Spring 上下文（Context）相对于 BeanFactory 有以下优势：

1. 预加载：BeanFactory 在容器启动时并不会实例化所有的 Bean，而是在需要时才进行实例化。相反，Spring 上下文会在容器启动时一次性创建并初始化所有的 Bean 实例。这样可以加快应用程序的启动速度，减少应用程序的资源消耗。
2. 自动装配：Spring 上下文支持自动装配，可以根据类型或名称自动注入 Bean 实例，而 BeanFactory 需要手动配置依赖注入关系。
3. 高级特性：Spring 上下文提供了更多的高级特性，例如 AOP、事务、国际化、事件发布等。而 BeanFactory 只提供了基本的 Bean 创建和管理功能。
4. 扩展性：Spring 上下文是在 BeanFactory 的基础上扩展而来的，它提供了更多的扩展点，使得可以在运行时动态地加载和卸载 Bean 定义、注册和取消注册 BeanFactory 后置处理器和应用程序监听器等。
5. 代码简洁性：Spring 上下文可以将多个 BeanFactory 集成到一个上下文中，从而简化了代码的编写和维护。

综上所述，相对于 BeanFactory，Spring 上下文提供了更多的高级特性和扩展点，同时也具有更高的预加载性能和自动装配能力。因此，在实际应用中，通常使用 Spring 上下文来管理 Bean 实例和配置信息。


<Reward/>
