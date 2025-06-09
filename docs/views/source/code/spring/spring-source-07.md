---
title: 手写 Spring 07 - 完善 Bean 作用域和实现 FactoryBean
date: 2023-07-14
tags:
   - 源码分析
   - Java 
categories:
   - 源码 Source-code
isShowComments: true
---

<Boxx/>

Spring 中的 Bean 作用域是指定 Bean 的生命周期范围，而 FactoryBean 则是一种特殊的Bean，其主要作用是创建其他 Bean 实例。

具体来说，FactoryBean 是一个接口，它提供了一个用于创建 Bean 实例的方法 getObject()。当容器需要获取 FactoryBean 所创建的 Bean 时，会调用 getObject() 方法返回实际的 Bean 实例。

与普通的 Bean 不同，FactoryBean 本身并不会被直接注入到其他 Bean 中使用，而是通过在 ApplicationContext 中配置 FactoryBean，然后通过 getBean() 方法获取实际的 Bean 实例。

与 Bean 作用域相比，FactoryBean 的概念更加专业化，它通常用于需要在 Bean 创建时进行一些复杂的初始化操作或者需要实现某种特定功能的场景。例如，Spring 中提供的 JdbcTemplate 就是通过 JdbcTemplateFactoryBean 来创建的。

<!-- more -->

[[toc]]

## 解析

Spring 的 scope 作用域实现无非就是在 xml 中配置 bean 时预先定义好，通过加载器加载后解析到 BeanDefinition 中，后续创建 bean 实例时根据不同作用域创建即可。

Spring 的 `FactoryBean` 接口定义了一种工厂类，可以用于创建其他 bean 实例。其实现原理是在 Spring 容器启动时，扫描所有的 `FactoryBean` 类型的 bean，对每个实现了 `FactoryBean` 接口的 bean，Spring 会调用其 `getObject()` 方法来获取一个实际的 bean 实例，这个实例被纳入到 Spring 容器中，并且可以像普通的 bean 一样被注入和使用。

需要注意的是，通过 `FactoryBean` 创建的对象在 Spring 容器中存在两个名字：一个是 `FactoryBean` 对象自身的名字（即 `&beanName`），另一个则是由 `FactoryBean` 创建的目标 bean 的名字（即 `beanName`）。因此，如果要获取 `FactoryBean` 创建的实例，需要在 bean 名称前加上 `&` 前缀，例如 `&beanName`。

`FactoryBean` 的使用场景包括但不限于：

- 需要在 bean 创建时进行一些特殊的逻辑判断或初始化操作。
- 需要创建的 bean 是一些复杂的对象，需要通过多个步骤进行创建。
- 需要创建的 bean 不是基于类的，而是基于某些配置信息的，比如从配置文件中读取的属性值等。

需要注意的是，如果 FactoryBean 实现了单例模式，那么由它创建的 Bean 实例也将成为单例。否则，每次请求都会创建新的 Bean 实例。因此，通过FactoryBean 创建的 Bean 实例的作用域也可以通过指定相应的 scope 属性来进行控制。

## 完善 Bean 作用域

完善 Bean 作用域无非就是对之前的实现做一点改动而已：

1. 更新 BeanDefinition，加入作用域 scope（默认为单例） 及相关字段。
2. 更新加载器 XmlBeanDefinitionReader，在解析 xml 的时候解析新加的 scope 标签，并赋值给 BeanDefinition。
3. 修改 Bean xml 配置，加入作用域 scope。

### 定义一些职责和能力：

1. 修改 BeanDefinition，加入作用域相关字段。

   ```java
   public class BeanDefinition {
   
       private static final String SCOPE_SINGLETON = ConfigurableBeanFactory.SCOPE_SINGLETON;
   
       private static final String SCOPE_PROTOTYPE = ConfigurableBeanFactory.SCOPE_PROTOTYPE;
   
       /**
        * 定义为 Class，这样就可以把 Bean 的实例化（通过反射）操作放到容器中处理了，实例化用
        */
       private Class<?> beanClass;
       /**
        * 一个 Bean 的所有字段信息，留作属性填充用
        */
       private PropertyValues propertyValues;
       /**
        * init方法名称
        */
       private String initMethodName;
       /**
        * 销毁方法名称
        */
       private String destroyMethodName;
   
       /**
        * 生命周期，默认单例的
        */
       private String scope = SCOPE_SINGLETON;
       /**
        * 单例，默认是
        */
       private boolean singleton = true;
       /**
        * 原型，默认不是
        */
       private boolean prototype = false;
   
       public BeanDefinition(Class<?> beanClass) {
           this.beanClass = beanClass;
           this.propertyValues = new PropertyValues();
       }
   
       public BeanDefinition(Class<?> beanClass, PropertyValues propertyValues) {
           this.beanClass = beanClass;
           this.propertyValues = propertyValues == null ? new PropertyValues() : propertyValues;
       }
   
       public void setScope(String scope) {
           this.scope = scope;
           this.singleton = SCOPE_SINGLETON.equals(scope);
           this.prototype = SCOPE_PROTOTYPE.equals(scope);
       }
   
       public String getScope() {
           return scope;
       }
   
       public Class<?> getBeanClass() {
           return beanClass;
       }
   
       public void setBeanClass(Class<?> beanClass) {
           this.beanClass = beanClass;
       }
   
       public PropertyValues getPropertyValues() {
           return propertyValues;
       }
   
       public void setPropertyValues(PropertyValues propertyValues) {
           this.propertyValues = propertyValues;
       }
   
       public String getInitMethodName() {
           return initMethodName;
       }
   
       public void setInitMethodName(String initMethodName) {
           this.initMethodName = initMethodName;
       }
   
       public String getDestroyMethodName() {
           return destroyMethodName;
       }
   
       public void setDestroyMethodName(String destroyMethodName) {
           this.destroyMethodName = destroyMethodName;
       }
   
       public boolean isSingleton() {
           return singleton;
       }
   
       public void setSingleton(boolean singleton) {
           this.singleton = singleton;
       }
   
       public boolean isPrototype() {
           return prototype;
       }
   
       public void setPrototype(boolean prototype) {
           this.prototype = prototype;
       }
   }
   ```

### 具体的实现：

1. 更新加载器 `XmlBeanDefinitionReader#doLoadBeanDefinitions()`，在解析 xml 的时候解析新加的 scope 标签，并赋值给 BeanDefinition。

```java
private void doLoadBeanDefinitions(InputStream inputStream) throws ClassNotFoundException {
    // 改动核心代码
	String beanScope = bean.getAttribute("scope");
    if (StrUtil.isNotBlank(beanScope)) {
        beanDefinition.setScope(beanScope);
    }
}
```

### 将实现加入原有的逻辑中：

1. 修改 `AbstractAutowireCapableBeanFactory#createBean()` ，单例 Bean 添加缓存，同时将实现了销毁接口的 Bean 也改为单例时注册方便容器停止时进行销毁。

```java
    @Override
    protected Object createBean(String beanName, BeanDefinition beanDefinition, Object[] args) throws BeansException {
        Object bean = null;
        try {
            // 实例化
            bean = createBeanInstance(beanName, beanDefinition, args);
            // 属性填充
            applyPropertyValues(beanName, bean, beanDefinition);
            // 添加 Bean 的初始化扩展
            bean = initializeBean(beanName, bean, beanDefinition);
        } catch (Exception e) {
            throw new BeansException("Failed to bean instance", e);
        }
        // ==> 添加单例 Bean 缓存
        if (beanDefinition.isSingleton()) {
            // ==> 注册实现了 DisposableBean 接口的 单例Bean 对象，留待容器停止的时候调用。
            registerDisposableBeanIfNecessary(beanName, bean, beanDefinition);
            addSingleton(beanName, bean);
        }
        return bean;
    }
```

2. 当然，别忘了修改`DefaultListableBeanFactory#preInstantiateSingletons()`，在容器启动后提前实例化所有的【单例 Bean】，之前是初始化所有 bean 的。

```java
    @Override
    public void preInstantiateSingletons() {
        for (Map.Entry<String, BeanDefinition> entry : beanDefinitionMap.entrySet()) {
            String beanName = entry.getKey();
            BeanDefinition beanDefinition = entry.getValue();
            if (beanDefinition.isSingleton()) {
                getBean(beanName);
            }
        }
    }
```

### 测试：

- xml 准备

```java
<?xml version="1.0" encoding="utf-8" ?>
<beans>
    <!--  ↓↓ bean scope 测试 ↓↓ -->
    <!--  多例的 mouse  -->
    <bean id="mouse" scope="prototype"
        class="com.snail.springframework.beans.factory.bean.Mouse">
        <property name="name" value="name-xml-init-jerry"></property>
    </bean>
    <!--  单例的 Tiger  -->
    <bean id="cat" name="catBEAN" init-method="init" destroy-method="destroy"
          class="com.snail.springframework.beans.factory.bean.Cat">
        <property name="name" value="cat-name-xml-init"></property>
    </bean>
</beans>
```

- 测试 Bean 准备

还用之前已有的 Mouse 和 Cat 类即可。

- 测试类

```java
    /**
     * bean scope 测试
     */
    @Test
    public void bean_scope_test() {
        // 1. 利用 xml上下文 加载Bean
        ClassPathXmlApplicationContext applicationContext = new ClassPathXmlApplicationContext("classpath:spring-scope.xml");
        applicationContext.registerShutdownHook();
        // 2. 获取bean
        Mouse mouse1 = (Mouse) applicationContext.getBean("mouse");
        Mouse mouse2 = (Mouse) applicationContext.getBean("mouse");
        System.err.println("mouse1：" + mouse1.hashCode());
        System.err.println("mouse2：" + mouse2.hashCode());
        System.err.println("Mouse 是否单例：" + (mouse1 == mouse2));

        System.err.println();

        Cat cat1 = (Cat) applicationContext.getBean("cat");
        Cat cat2 = (Cat) applicationContext.getBean("cat");
        System.err.println("cat1：" + cat1.hashCode());
        System.err.println("cat2：" + cat1.hashCode());
        System.err.println("Cat 是否单例：" + (cat1 == cat2));
    }
```

- 测试结果

```java
-- Cat init method by xml --
==> BeanNameAware beanName: mouse
==> BeanClassLoaderAware classLoader: sun.misc.Launcher$AppClassLoader@18b4aac2
==> BeanFactoryAware beanFactory: com.snail.springframework.beans.factory.support.DefaultListableBeanFactory@97e1986
==> ApplicationContextAware applicationContext: com.snail.springframework.context.support.ClassPathXmlApplicationContext@26f67b76
==> BeanNameAware beanName: mouse
==> BeanClassLoaderAware classLoader: sun.misc.Launcher$AppClassLoader@18b4aac2
==> BeanFactoryAware beanFactory: com.snail.springframework.beans.factory.support.DefaultListableBeanFactory@97e1986
==> ApplicationContextAware applicationContext: com.snail.springframework.context.support.ClassPathXmlApplicationContext@26f67b76
mouse1：356473385
mouse2：2136344592
Mouse 是否单例：false

cat1：110992469
cat2：110992469
Cat 是否单例：true
-- Cat destroy method by xml --

Process finished with exit code 0

```



## 实现 FactoryBean

在 Spring 源码中， `FactoryBean` 接口的具体实现主要是在 `org.springframework.beans.factory.support.FactoryBeanRegistrySupport` 类中。这个类是 Spring 容器的一个关键组件，主要负责处理所有的 `FactoryBean` 对象，并将它们转化为普通的 bean 实例。

`FactoryBeanRegistrySupport` 中的核心方法包括：

- `containsBeanDefinition(String beanName)`：判断指定的 bean 是否是一个 `FactoryBean`。
- `getFactoryBean(String name, RootBeanDefinition mbd)`：获取指定名称的 `FactoryBean` 实例，并调用其 `getObject()` 方法来创建目标 bean。
- `isFactoryBean(String name, RootBeanDefinition mbd)`：判断指定的 bean 是否是一个 `FactoryBean`。
- `getObjectForBeanInstance(Object beanInstance, String name, String beanName, RootBeanDefinition mbd)`：获取指定实例对应的目标 bean，如果该实例是一个 `FactoryBean`，则调用其 `getObject()` 方法来获取目标 bean。

除了 `FactoryBeanRegistrySupport` 外，Spring 还提供了很多其他支持 `FactoryBean` 的类和接口，比如 `AbstractBeanFactory`、`BeanWrapperImpl` 等等，这些组件共同构成了 Spring 容器中 `FactoryBean` 实现的基础框架。

### 定义一些职责和能力：

1. FactoryBean：FactoryBean 将对应一个工厂类，该工厂类负责创建目标 bean，并返回它的实例。

    ```java
    public interface FactoryBean<T> {
    
        /**
         * 获取对象
         */
        T getObject();
    
        /**
         * 获取对象类型
         */
        Class<?> getObjectType();
    
        /**
         * 是否为单例
         */
        boolean isSingleton();
    
    }
    ```

### 具体的实现：

1. FactoryBeanRegistrySupport：保存所有 FactoryBean 目标 bean 的能力（单例才缓存），实现 FactoryBean 目标 bean 获取和缓存。这个类是 Spring 容器的一个关键组件，主要负责处理所有的 `FactoryBean` 对象，并将它们转化为普通的 bean 实例。

   ```java
   public class FactoryBeanRegistrySupport 
       extends DefaultSingletonBeanRegistry // 保存了所有单例 bean 和待销毁的 bean
   {
   
       /**
        * 对所有的 单例FactoryBean 包装的 真实类，进行缓存
        */
       private final Map<String, Object> factoryBeanObjectCache = new ConcurrentHashMap<>();
   
       /**
        * 直接从缓存中获取真实的被FactoryBean包装的单例对象
        *
        * @param beanName bean名字
        * @return {@link Object}
        */
       protected Object getCachedObjectForFactoryBean(String beanName) {
           Object object = factoryBeanObjectCache.get(beanName);
           return (object != NULL_OBJECT ? object : null);
       }
   
       /**
        * 从FactoryBean获取真实的被FactoryBean包装的单例对象，如果是单例Bean还会将查出的结果放入缓存中
        *
        * @param factoryBean 工厂bean
        * @param beanName    bean名字
        * @return {@link Object}
        */
       protected Object getObjectFromFactoryBean(FactoryBean factoryBean, String beanName) {
           if (factoryBean.isSingleton()) {
               Object object = factoryBeanObjectCache.get(beanName);
               if (object == null) {
                   object = doGetObjectFromFactoryBean(factoryBean, beanName);
                   factoryBeanObjectCache.put(beanName, (object == null ? NULL_OBJECT : object));
               }
               return (object != NULL_OBJECT ? object : null);
           } else {
               return doGetObjectFromFactoryBean(factoryBean, beanName);
           }
       }
   
       private Object doGetObjectFromFactoryBean(FactoryBean factoryBean, String beanName) {
           try {
               return factoryBean.getObject();
           } catch (Exception e) {
               throw new BeansException("Faild to bean[" + beanName + "] doGetObjectFromFactoryBean", e);
           }
       }
   
   }
   ```

### 将实现加入原有的逻辑中：

1. 我们想一下，FactoryBean 作为 bean 的包装扩展，改动逻辑肯定是在 getBean() 最后一步的时候，如果是 FactoryBean 那么就用 `FactoryBean#getObject() `替换原始对象从而获取真正的目标 bean 对象。

1. 当然，在 getBean(String beanName) 的时候，如果 beanName 是 & 开头，那我们得返回原始的 FactoryBean 对象。

   所以修改 `AbstractBeanFactory#getBean()`：
   
   ```java
   public abstract class AbstractBeanFactory 
       // 这里修改原先的 DefaultSingletonBeanRegistry 为 FactoryBeanRegistrySupport
       extends FactoryBeanRegistrySupport 
       implements ConfigurableBeanFactory {
       
       protected <T> T doGetBean(final String name, final Object[] args) {
           // 获取真实 bean 的名字
           String beanName = transformedBeanName(name);
           Object sharedInstance = getSingleton(beanName);
           if (sharedInstance != null) {
               // 如果是 FactoryBean，那么就转换为 目标bean 返回
               return (T) getObjectForBeanInstance(sharedInstance, name, beanName);
           }
           BeanDefinition beanDefinition = getBeanDefinition(beanName);
           Object bean = createBean(beanName, beanDefinition, args);
           // 如果是 FactoryBean，那么就转换为 目标bean 返回
           return (T) getObjectForBeanInstance(bean, name, beanName);
       }
   
       /**
        * 获取：去除 & 后的 beanName
        *
        * @param name 名字
        * @return {@link String}
        */
       private String transformedBeanName(String name) {
           if (name.startsWith("&")) {
               return name.substring(name.indexOf("&") + 1);
           }
           return name;
       }
   
       /**
        * 获得bean实例对象
        * 获取指定实例对应的目标 bean，如果该实例是一个 FactoryBean，则调用其 getObject() 方法来获取目标 bean。
        *
        * @param beanInstance bean实例
        * @param name         bean原始名字
        * @param beanName     bean名字
        * @return {@link Object}
        */
       private Object getObjectForBeanInstance(Object beanInstance, String name, String beanName) {
           if (!(beanInstance instanceof FactoryBean) || name.startsWith("&")) {
               return beanInstance;
           }
           Object object = getCachedObjectForFactoryBean(beanName);
           if (object == null) {
               FactoryBean<?> factoryBean = (FactoryBean<?>) beanInstance;
               object = getObjectFromFactoryBean(factoryBean, beanName);
           }
           return object;
       }
   }
   ```

### 测试：

- xml 准备

```java
<?xml version="1.0" encoding="utf-8" ?>
<beans>
    <!--  ↓↓ FactoryBean 测试 ↓↓ -->
    <!--  TigerFactoryBean  -->
    <bean id="animalFactoryBean" class="com.snail.springframework.beans.factory.bean.AnimalFactoryBean"/>
</beans>
```

- 这里我们准备一个 Animal 接口，一个 Tiger 类，Tiger 引用了 Animal ，并调用 Animal 的方法。

  在准备一个 AnimalFactoryBean 类，使用 FactoryBean 作为一个 Bean，采用 jdk动态代理 的方式来实现 Animal，并注入到 Tiger 中，这样的话 Tiger 中的 Animal 就是我们 FactoryBean 的包装类了。

```java
public interface Animal {
    String getName(String name);
}
```

```java
public class Tiger implements Animal {

    private String name;

    @Override
    public String getAnimalName() {
        return name;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
```

```java
public class AnimalFactoryBean implements FactoryBean<Animal> {

    /**
     * 要代理的对象
     */
    private Animal animal;

    public void setAnimal(Animal animal) {
        this.animal = animal;
    }

    @Override
    public Animal getObject() {
        System.out.println("-- into FactoryBean getObject() --");
        InvocationHandler handler = (proxy, method, args) -> {
            System.out.println("-- into FactoryBean JdkProxy method:[" + method.getName() + "] before --");
            Object result = method.invoke(animal, args);
            System.out.println("-- into FactoryBean JdkProxy method:[" + method.getName() + "] after --");
            return result;
        };
        return (Animal) Proxy.newProxyInstance(Thread.currentThread().getContextClassLoader(),
                new Class[]{Animal.class}, handler);
    }

    @Override
    public Class<?> getObjectType() {
        return Animal.class;
    }

    @Override
    public boolean isSingleton() {
        return true;
    }

}
```

- 测试类

```java
    @Test
    public void factoryBean_test() {
        // 1. 利用 xml上下文 加载Bean
        ClassPathXmlApplicationContext applicationContext = new ClassPathXmlApplicationContext("classpath:spring-factorybean.xml");
        applicationContext.registerShutdownHook();

        // 2. 获取原始 FactoryBean 对象
        AnimalFactoryBean animalFactoryBean = (AnimalFactoryBean) applicationContext.getBean("&animalFactoryBean");
        System.err.println("获取原始 FactoryBean 对象: " + animalFactoryBean);
        Tiger tiger = new Tiger();
        tiger.setName("我是小老虎ai~");
        animalFactoryBean.setAnimal(tiger);

        // 3. 获取真正的 bean，并调用它的方法，
        // 当然利用代理可以在调用它的方法前后做一些其他操作
        Animal proxyAnimal = (Animal) applicationContext.getBean("animalFactoryBean");
        System.err.println("获取真实 FactoryBean 目标 bean 对象: " + proxyAnimal);
        System.err.println(proxyAnimal.getAnimalName());
    }
```

- 测试结果

```java
-- into FactoryBean getObject() --
获取原始 FactoryBean 对象: com.snail.springframework.beans.factory.bean.AnimalFactoryBean$$EnhancerByCGLIB$$585388b2@64616ca2
-- into FactoryBean JdkProxy method:[toString] before --
获取真实 FactoryBean 目标 bean 对象: com.snail.springframework.beans.factory.bean.Tiger@13fee20c
-- into FactoryBean JdkProxy method:[toString] after --
-- into FactoryBean JdkProxy method:[getAnimalName] before --
我是小老虎ai~
-- into FactoryBean JdkProxy method:[getAnimalName] after --
```

## 总结

FactoryBean 是 Spring 框架中的一个接口，用于创建和管理 bean 实例。与普通的 bean 不同，FactoryBean 本身也是一个 bean，但其主要作用是负责创建和初始化其他 bean 的实例。

具体来说，FactoryBean 将对应一个工厂类，该工厂类负责创建目标 bean，并返回它的实例。在 Spring 容器启动时，会先创建 FactoryBean 的实例，然后再调用该实例的 getObject() 方法来获取目标 bean 的实例。因此，可以通过使用 FactoryBean 来实现一些特殊的 bean 创建逻辑，比如在每次获取 bean 实例时都创建一个新的对象，或者根据不同的条件返回不同的 bean 实例等。

要创建一个自定义的 FactoryBean，需要实现 FactoryBean 接口，并重写其 getObject() 和 getObjectType() 方法。其中，getObject() 方法用于创建并返回目标 bean 实例，而 getObjectType() 方法则用于指定目标 bean 的类型。另外，如果希望让 Spring 容器直接将 FactoryBean 本身注入到其他 bean 中，而不是将其产生的 bean 注入进去，则需要在实现类上添加 @Primary 或 @Qualifier 注解。

需要注意的是，当一个 bean 实现了 FactoryBean 接口时，Spring IOC 容器会默认将其注册为一个工厂类 bean，而不会直接将其产生的 bean 注册进容器中。因此，在获取 bean 实例时，需要使用 "&" 符号来获取 FactoryBean 本身，或者使用 getObject() 方法来获取目标 bean 的实例。


<Reward/>
