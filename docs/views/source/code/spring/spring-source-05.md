---
title: 手写 Spring 05 - 完善Bean生命周期，加入Bean的初始化和销毁
date: 2023-03-27
tags:
   - 源码分析
   - Java 
categories:
   - 源码 Source-code
isShowComments: true
---

<Boxx/>

在 Spring 中，Bean 的生命周期由容器管理。当容器启动时，它会读取配置文件并创建 Bean 定义，然后通过这些定义来实例化 Bean。在 Bean 实例化的过程中，会按照一定的顺序调用一些特定的方法来完成 Bean 的初始化和销毁。

Bean 初始化的方法：

1. 构造方法：在实例化 Bean 时，容器会调用 Bean 的构造方法创建 Bean 的实例。

2. 实现 InitializingBean 接口：如果 Bean 实现了 InitializingBean 接口，容器会在 Bean 实例化之后调用它的 afterPropertiesSet() 方法。

3. 配置 init-method 属性：在 Bean 配置文件中，可以通过设置 init-method 属性来指定 Bean 初始化时要调用的方法。

Bean 销毁的方法：

1. 实现 DisposableBean 接口：如果 Bean 实现了 DisposableBean 接口，容器在销毁 Bean 之前会调用它的 destroy() 方法。

2. 配置 destroy-method 属性：在 Bean 配置文件中，可以通过设置 destroy-method 属性来指定 Bean 销毁时要调用的方法。

需要注意的是，只有在容器正常关闭时，才会触发 Bean 的销毁方法。如果是容器发生异常或者是通过代码强制关闭容器，那么就不会触发 Bean 的销毁方法。

<!-- more -->

[[toc]]

## 解析

这里我们对于 xml 方式实现，主要是在配置一个 Bean 的时候指定 `init-method` 和 `destroy-method` 两个属性值即可。

在通过加载器扫描 xml，解析为 Bean 定义的时候，将这 2 个值带上。然在 AbstractAutowireCapableBeanFactory.createdBean() 的时候，调用 Bean 的初始化和销毁方法即可。

而销毁方法的调用需向虚拟机注册一个钩子函数，使虚拟机在执行关闭之前回调。

## 初始化方法实现

要加入 Bean 生命周期的初始化，我们知道肯定得再创建 Bean 的时候修改加入初始化的逻辑。

无非就是先在 xml 中配置 `init-method` 方法，然后加载到 Bean 定义中（所以肯定要修改 BeanDefinition），然后在 `AbstractAutowireCapableBeanFactory.createBean(String beanName, BeanDefinition beanDefinition, Object[] args)` 的时候，在 Bean 进行实例化及属性填充后，读取 BeanDefinition 加载这个初始化方法。

销毁方法的调用比较特殊，得在容器关闭的时候调用，我们稍后再分析。

### 定义一些职责和能力：

1. 修改 BeanDefinition ：加入两个属性，用来保存具体是初始化和销毁的哪个方法名。

```java
private String initMethodName;
private String destroyMethodName;
```

### 具体的实现：

1. 修改 xml 加载器：XmlBeanDefinitionReader，使之解析新加的标签属性 `init-method` 和 `destroy-method`，并将解析后的值设置到 BeanDefinition 中。

   ```xml
   <bean id="cat" name="catBEAN" init-method="init" destroy-method="destroy"
         class="com.snail.springframework.beans.factory.support.Cat">
   ```
   
   修改 XmlBeanDefinitionReader 的 doLoadBeanDefinitions(InputStream inputStream)
   
   ```java
   // 新加关键行代码
   String initMethod = bean.getAttribute("init-method");
   String destroyMethod = bean.getAttribute("destroy-method");
   beanDefinition.setInitMethodName(initMethod);
   beanDefinition.setDestroyMethodName(destroyMethod);
   ```
   
1. AbstractAutowireCapableBeanFactory

   ```java
   private void invokeInitMethods(String beanName, Object bean, BeanDefinition beanDefinition) throws InvocationTargetException, IllegalAccessException, NoSuchMethodException {
       String initMethodName = beanDefinition.getInitMethodName();
       if (StrUtil.isNotBlank(initMethodName)) {
           Method initMethod = beanDefinition.getBeanClass().getMethod(initMethodName);
           if (initMethod == null) {
               throw new BeansException("Could not found an init method name: " + initMethodName);
           }
           initMethod.invoke(bean);
       }
   }
   ```
   
   主要实现了 invokeInitMethods() 这个核心方法。

### 将实现加入原有的逻辑中：

1. 修改 AbstractAutowireCapableBeanFactory，在 Bean 实例化及属性填充后，加入初始化方法的调用：

   ```java
   /**
    * 创建 Bean
    */
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
       addSingleton(beanName, bean);
       return bean;
   }
   
   private Object initializeBean(String beanName, Object bean, BeanDefinition beanDefinition) {
       // 前置处理
       Object wrappedBean = applyBeanPostProcessorsBeforeInitialization(bean, beanName);
       // ** 在这个一步，调用上面实现的初始化方法 **
       try {
           invokeInitMethods(beanName, wrappedBean, beanDefinition);
       } catch (InvocationTargetException | IllegalAccessException | NoSuchMethodException e) {
           throw new BeansException("Failed to bean init", e);
       }
       // 后置处理
       wrappedBean = applyBeanPostProcessorsAfterInitialization(wrappedBean, beanName);
       return wrappedBean;
   }
   ```
   
   这样就把初始化加入到了 Bean 的创建中。

## 销毁方法实现

销毁方法的调用比较特殊，在 Spring 容器关闭时，会触发销毁所有 bean 的过程。

销毁方法的配置方式：

1. 跟初始化方法一样，可以在 xml 中配置 `destroy-method` 方法。
2. 为了更好的扩展，我们可以定义接口，只要一个 Bean 实现了相应的初始化或销毁接口，就可以在容器中自动调用相应的实现方法。
3. 注解方式，我们现在赞不讨论。

### 定义一些职责和能力：

1. InitializingBean ：如果 bean 实现了 InitializingBean 接口，容器会调用它的 afterPropertiesSet() 方法，完成 bean 的初始化。如果 bean 没有实现 InitializingBean 接口，容器会调用配置文件中指定的初始化方法（如果有）。

2. DisposableBean：如果 bean 实现了 DisposableBean 接口，容器会调用它的 destroy() 方法，完成 bean 的销毁。如果 bean 没有实现 DisposableBean 接口，容器会调用配置文件中指定的销毁方法（如果有）。

3. SingletonBeanRegistry：之前已经提供过获取一个单例 Bean 的能力。这里再加上 

   注册待销毁的单例对象的能力：`void registerDisposableBean(String beanName, DisposableBean bean);`

   销毁所有单例 Bean 的能力：`void destroySingletons();`。

4. ConfigurableApplicationContext

    extendsApplicationContext

   ConfigurableApplicationContext是Spring框架中ApplicationContext接口的一个扩展接口，它提供了一些额外的方法，例如refresh()：刷新容器，registerShutdownHook()：注册关闭钩子函数，和close()：关闭函数，用于配置和管理应用程序上下文的生命周期和属性。

### 具体的实现：

1. DisposableBeanAdapter：实现了 DisposableBean 接口，并将其委托给一个实际的bean实例来执行销毁操作。这个适配类的出现主要是为了解决在虚拟机关闭的时候不想关注到底是哪种（xml或接口或注解）方式的销毁，由此出现这个适配类。

   ```java
   public class DispoableBeanAdapter implements DisposableBean {
   
       private final Object bean;
       private final String beanName;
       private final String destroyMethodName;
   
       public DispoableBeanAdapter(Object bean, String beanName, BeanDefinition beanDefinition) {
           this.bean = bean;
           this.beanName = beanName;
           this.destroyMethodName = beanDefinition.getDestroyMethodName();
       }
   
       @Override
       public void destroy() throws NoSuchMethodException, InvocationTargetException, IllegalAccessException {
           // 1. 实现接口的方式调用
           if (bean instanceof DisposableBean) {
               ((DisposableBean) bean).destroy();
           }
           // 2. xml 方式反射调用初始化方法
           if (StrUtil.isNotBlank(destroyMethodName) && !(bean instanceof DisposableBean)) {
               Method destroyMethod = bean.getClass().getMethod(destroyMethodName);
               if (destroyMethod == null) {
                   throw new BeansException("Could not found an init method name: " + destroyMethodName);
               }
               destroyMethod.invoke(bean);
           }
       }
   }
   ```
   
2. DefaultSingletonBeanRegistry

   implements SingletonBeanRegistry

   主要实现 `registerDisposableBean(String beanName, DisposableBean bean);` 和 `void destroySingletons();`

   ```java
   public class DefaultSingletonBeanRegistry implements SingletonBeanRegistry {
   
       private final Map<String, Object> singletonObjects = new HashMap<>();
   
       private final Map<String, DisposableBean> disposableBeans = new HashMap<>();
   
       @Override
       public Object getSingleton(String beanName) {
           return singletonObjects.get(beanName);
       }
   
       protected void addSingleton(String beanName, Object singletonObject) {
           singletonObjects.put(beanName, singletonObject);
       }
   
       @Override
       public void registerDisposableBean(String beanName, DisposableBean bean) {
           disposableBeans.put(beanName, bean);
       }
   
       @Override
       public void destroySingletons() {
           Set<String> keySet = disposableBeans.keySet();
           Object[] disposableBeanNames = keySet.toArray();
           for (int i = disposableBeanNames.length - 1; i >= 0; i--) {
               Object beanName = disposableBeanNames[i];
               DisposableBean disposableBean = disposableBeans.remove(beanName);
               try {
                   disposableBean.destroy();
               } catch (NoSuchMethodException | InvocationTargetException | IllegalAccessException e) {
                   throw new BeansException("Failed to bean:[" + beanName + "] destroy", e);
               }
           }
   
       }
       
   }
   ```

1. 在 AbstractAutowireCapableBeanFactory 

   extends AbstractBeanFactory （它又 extends DefaultSingletonBeanRegistry，已经具备了注册待销毁的Bean的能力）
   
   implements AutowireCapableBeanFactory
   
   Bean实例化、属性填充、初始化（Bean的前后置处理）之后，注册所有实现了 DisposableBean 接口的 Bean 对象，留待容器停止的时候调用。
   
   ```java
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
           // 注册所有实现了 DisposableBean 接口的 Bean 对象，留待容器停止的时候调用。
           registerDisposableBeanIfNecessary(beanName, bean, beanDefinition);
           // 添加单例 Bean 缓存
           addSingleton(beanName, bean);
           return bean;
       }
   
       protected void registerDisposableBeanIfNecessary(String beanName, Object bean, BeanDefinition beanDefinition) {
           if (bean instanceof DisposableBean || StrUtil.isNotBlank(beanDefinition.getDestroyMethodName())) {
               registerDisposableBean(beanName, new DispoableBeanAdapter(bean, beanName, beanDefinition));
           }
       }
   ```
   
   主要实现了 registerDisposableBeanIfNecessary() 这个方法。
   
4. AbstractApplicationContext

    extends DefaultResourceLoader

    implements ConfigurableApplicationContext （需要实现注册虚拟机关闭钩子函数和关闭容器的方法）

   ```java
       /** refresh()在之前已经实现 */
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
           // （见 AbstractAutowireCapableBeanFactory.createBean ）。
           registerBeanPostProcessors(beanFactory);
   
           // 5. 提前实例化所有的单例 Bean
           beanFactory.preInstantiateSingletons();
       }
   
       @Override
       public void registerShutdownHook() {
           Runtime.getRuntime().addShutdownHook(new Thread(this::close));
       }
   
       @Override
       public void close() {
           getBeanFactory().destroySingletons();
       }
   ```

### 将实现加入原有的逻辑中：

1. 总结就是先定义了两个接口 InitializingBean 和 DisposableBean，实现他们就具备了相应的能力。
2. 在 创建 Bean 的时候调用所有初始化方法。
3. 因为虚拟机关闭时不想关系具体销毁的实现，所有加了个 DisposableBean 包装所有的销毁方式。
4. Bean 工厂得具备销毁的能力，所以得有注册和销毁的方法。在 SingletonBeanRegistry 定义：注册所有的待销毁实例+销毁所有可销毁的Bean（就是看有没有实现DisposableBean接口或xml指定销毁方法，有就提前存起来），而 DefaultSingletonBeanRegistry 就是对这两个能力的实现。
5. 容器得具备销毁的能力（实际就是调用 Bean 工厂的销毁），在 ConfigurableApplicationContext 定义了 refresh()：刷新容器，registerShutdownHook()：注册关闭钩子函数，和close()：关闭函数。而 AbstractApplicationContext 就是对它的实现（调用 Bean 工厂的销毁方法）。

### 测试：

- xml 准备，这里 cat 采用 xml 的方式实现 init 和 destroy。

```java
<?xml version="1.0" encoding="utf-8" ?>

<beans>
    <bean id="cat" name="catBEAN" init-method="init" destroy-method="destroy"
          class="com.snail.springframework.beans.factory.support.Cat">
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

- Dog 准备，实现接口的方式

```java
public class Dog implements InitializingBean, DisposableBean {

    private String name;

    private Cat cat;

    private static Map<String, Object> initMap = new HashMap<>();

    static {
        initMap.put("inner-dog1", "TomDog");
        initMap.put("inner-dog2", "JerryDog");
    }

    @Override
    public void afterPropertiedSet() {
        System.out.println("-- Dog afterPropertiedSet method by xml --");
    }

    @Override
    public void destroy() throws NoSuchMethodException, InvocationTargetException, IllegalAccessException {
        System.out.println("-- Dog destroy method by xml --");
    }

    public void printName() {
        System.out.println(this.name);
        System.out.println(this.cat);
        System.out.println(initMap);
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Cat getCat() {
        return cat;
    }

    public void setCat(Cat cat) {
        this.cat = cat;
    }

    @Override
    public String toString() {
        return "Dog{" +
                "name='" + name + '\'' +
                ", cat=" + cat +
                '}';
    }
}
```

- 测试类

```java
    @Test
    public void test_xml_context_close() {
        // 1. 利用 xml上下文 加载Bean
        // 上下文的高级实现极大的简化了或融合了上述的 1-4 步操作
        ClassPathXmlApplicationContext applicationContext = new ClassPathXmlApplicationContext("classpath:spring.xml");
        // * 可以提前注册 JVM 关闭钩子，用来确保 Spring 容器在 JVM 关闭之前正确地关闭并释放所有资源。
        applicationContext.registerShutdownHook();
        // 2. 获取bean
        Dog dog = (Dog) applicationContext.getBean("dog");

        String[] beanDefinitionNames = applicationContext.getBeanDefinitionNames();
        System.out.println();
        System.out.println(JSONUtil.toJsonStr(beanDefinitionNames));
        System.out.println();
        dog.printName();
        // * close 和 registerShutdownHook 比，比较暴力，直接手动调用关闭
        // applicationContext.close();
    }
```

- 测试结果

```java
进入到 BeanDefinition 扩展点 BeanFactoryPostProcessor -> postProcessBeanFactory
beanName：dog 属性：name，原先值：dog-name-xml-init 修改后值：dog-BeanDefinition-updated

beanName：cat 进入到 Bean 扩展点 BeanPostProcessor -> postProcessBeforeInitialization
-- Cat init method by xml --
beanName：cat 进入到 Bean 扩展点 BeanPostProcessor -> postProcessAfterInitialization
beanName：dog 进入到 Bean 扩展点 BeanPostProcessor -> postProcessBeforeInitialization
-- Dog afterPropertiedSet method by interface --
beanName：dog 进入到 Bean 扩展点 BeanPostProcessor -> postProcessAfterInitialization

["cat","catBeanPostProcessor","dog","dogBeanFactoryPostProcessor"]

dog-BeanDefinition-updated
Cat{name='postProcessBeforeInitialization name cat'}
{inner-dog2=JerryDog, inner-dog1=TomDog}
-- Dog destroy method by interface --
-- Cat destroy method by xml --

Process finished with exit code 0
```

## 总结

Spring Bean 的初始化和销毁是指在 Spring 容器管理下的 Bean 对象在被实例化和使用前、以及在容器关闭时，分别会执行一些特定的方法，以完成一些必要的操作。下面是关于 Spring Bean 初始化和销毁的总结：

1. 初始化方法：

在 Spring 容器创建 Bean 时，可以通过指定一些特定的初始化方法来对 Bean 进行初始化。Spring 提供了以下三种方式：

- 通过实现 InitializingBean 接口来自定义初始化方法；
- 通过在Bean配置文件中定义 init-method 属性来指定初始化方法；
- 通过 @PostConstruct 注解来定义初始化方法。

1. 销毁方法：

在 Spring 容器关闭时，需要对一些资源进行清理或释放，这时可以通过指定一些特定的销毁方法来完成。Spring 提供了以下两种方式：

- 通过实现 DisposableBean 接口来自定义销毁方法；
- 通过在Bean配置文件中定义 destroy-method 属性来指定销毁方法。

需要注意的是，只有当 Bean 被 Spring 容器管理时，才能够执行初始化和销毁方法。如果 Bean 不是由 Spring 容器管理，则不会执行初始化和销毁方法。

此外，Spring 还提供了一种通过 Java 注解来管理 Bean 的生命周期的方式，即通过 @PreDestroy 注解来定义Bean的作用域和销毁方法。

总之，Spring Bean 的初始化和销毁方法可以通过实现特定接口、指定特定属性或使用注解来实现。在实际应用中，需要根据具体的业务需求和场景来选择合适的方式来管理Bean的生命周期。


<Reward/>
