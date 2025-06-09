---
title: 手写 Spring 06 - Aware扩展，感知容器各个组件
date: 2023-04-19
tags:
   - 源码分析
   - Java 
categories:
   - 源码 Source-code
isShowComments: true
---

<Boxx/>

Spring Aware 接口是一个标记接口，实现该接口的 Bean 可以访问 Spring 的核心组件 ApplicationContext 或其他特定的 Spring 框架对象。

这些组件包括 BeanFactory、ResourceLoader、ApplicationEventPublisher 等等。

实现该接口的 bean 需要实现 setApplicationContext() 方法，并在该方法中将 ApplicationContext 或其他 Spring 框架对象注入到该 bean 中。通过实现 Spring Aware 接口，bean 可以获取 Spring 容器中的其他 bean 和资源，从而更好地利用 Spring 框架的功能。

<!-- more -->

[[toc]]

Spring Aware 接口有多个子接口，分别对应不同的 Spring 框架对象和功能。比如：

1. BeanNameAware：实现该接口的 bean 可以获取自己在容器中的 Bean 名称。

2. BeanFactoryAware：实现该接口的 bean 可以获取 BeanFactory（即Spring容器）对象。

3. ApplicationContextAware：实现该接口的 bean 可以获取 ApplicationContext 对象，从而可以访问 Spring 容器中的其他 bean、资源和配置信息。

4. MessageSourceAware：实现该接口的 bean 可以获取 MessageSource 对象，用于国际化处理。

5. ApplicationEventPublisherAware：实现该接口的 bean 可以获取 ApplicationEventPublisher 对象，用于发布应用程序事件。

6. ResourceLoaderAware：实现该接口的 bean 可以获取 ResourceLoader 对象，用于加载外部资源文件。

通过实现这些 Spring Aware 接口，bean 可以更加灵活地使用 Spring 框架提供的各种功能和资源，同时也增强了与 Spring 框架的集成能力。

## 解析

Aware 是如何在 Spring 中实现的呢：在 Spring 中，Aware 接口的实现是通过 BeanPostProcessor 机制来实现的。

当 Spring 容器创建一个 bean 时，会在 bean 的生命周期中调用 BeanPostProcessor 接口中的两个方法 postProcessBeforeInitialization() 和 postProcessAfterInitialization() 。如果一个 bean 实现了某个 Aware 接口， BeanPostProcessor 会检测到该 bean，并调用对应的 setXxx() 方法来注入相应的 Spring 组件。

比如，实现 ApplicationContextAware 接口的 bean，在 postProcessBeforeInitialization() 方法中会调用其 setApplicationContext() 方法，并将 ApplicationContext 对象注入到该 bean 中。由于 Aware 接口是标记接口，因此在 Spring 容器中没有具体的实现类，而是通过 Java 反射机制在运行时动态地为 bean 生成代理类来实现注入操作。

需要注意的是，Aware 接口的实现顺序是非常重要的。如果多个 bean 都实现了同一个 Aware 接口，Spring 会按照某种预定义的顺序依次调用它们的 setXxx() 方法。因此，如果存在顺序依赖关系，就需要设置合适的优先级，确保 bean 的注入顺序正确。可以使用 @Order 注解或实现 Ordered 接口来指定 Aware 接口的执行顺序。

## 容器 Aware 实现

Spring 中的 Aware 实现流程可以分为以下几步：

1. 定义 Aware 接口：在自定义的类中定义一个实现了某个 Aware 接口的方法，如 ApplicationContextAware 接口。

2. 注册 BeanPostProcessor：在 Spring 容器启动时注册 BeanPostProcessor 实现类，该实现类会对所有 Bean 进行处理，判断是否实现了指定的 Aware 接口。如果实现了，则调用相应的方法。

3. 查找并注入相关 Bean：当一个 Bean 实现了指定的 Aware 接口后，在其初始化过程中，Spring 会自动查找相应的 Bean，并将其注入到该 Bean 中。

4. 使用注入的 Bean：在 Bean 初始化完成后，可通过注入的 Bean 来获取相应的资源，如 ApplicationContext、BeanFactory 等。

需要注意的是，具体实现方式会因为实现的 Aware 接口不同而有所差异，例如实现了 BeanNameAware 接口则可获得当前 Bean 的名称等。

### 定义一些职责和能力：

1. Aware

   ```java
   /**
    * Spring Aware 接口是一个标记接口，实现该接口的 Bean 可以访问 Spring 的核心组件 ApplicationContext 或其他特定的 Spring 框架对象。
    * 通过实现 Spring Aware 接口，bean 可以获取 Spring 容器中的其他 bean 和资源，从而更好地利用 Spring 框架的功能。
    */
   public interface Aware {
       
   }
   ```

2. BeanNameAware

   ```java
   /**
    * 实现该接口的 bean 可以获取 所属 Bean 在容器中的名称。
    */
   public interface BeanNameAware extends Aware {
   
       /**
        * 感知 bean 名称
        *
        * @param beanName bean名字
        */
       void setBeanName(String beanName);
   
   }
   ```

3. BeanFactoryAware

   ```java
   /**
    * 实现该接口的 bean 可以获取 BeanFactory（即Spring容器）对象。
    */
   public interface BeanFactoryAware extends Aware {
   
       /**
        * 感知 BeanFactory（即Spring容器）对象
        *
        * @param beanFactory bean工厂
        */
       void setBeanFactory(BeanFactory beanFactory);
   
   }
   ```

4. BeanClassLoaderAware

   ```java
   /**
    * 实现该接口的 bean 可以获取 所属 ClassLoader 对象。
    *
    * @author zhangpengjun
    * @date 2023/3/28
    */
   public interface BeanClassLoaderAware extends Aware {
   
       /**
        * 感知 所属 ClassLoader 对象
        *
        * @param classLoader 类装入器
        */
       void setBeanClassLoader(ClassLoader classLoader);
   
   }
   ```

### 具体的实现：

- 无

### 将实现加入原有的逻辑中：

1. 修改 AbstractAutowireCapableBeanFactory，在 Bean 实例化及属性填充后，初始化方法的调用的过程中加入 Aware 感知的能力：

   ```java
       private Object initializeBean(String beanName, Object bean, BeanDefinition beanDefinition) {
           // 感知类型扩展 处理
           if (bean instanceof Aware) {
               if (bean instanceof BeanNameAware) {
                   ((BeanNameAware) bean).setBeanName(beanName);
               }
               if (bean instanceof BeanClassLoaderAware) {
                   ((BeanClassLoaderAware) bean).setBeanClassLoader(getBeanClassLoader());
               }
               if (bean instanceof BeanFactoryAware) {
                   ((BeanFactoryAware) bean).setBeanFactory(this);
               }
           }
           // BeanPostProcessor 前置处理，ApplicationContextAwareProcessor 也会在这里处理
           Object wrappedBean = applyBeanPostProcessorsBeforeInitialization(bean, beanName);
           // 调用初始化方法
           try {
               invokeInitMethods(beanName, wrappedBean, beanDefinition);
           } catch (InvocationTargetException | IllegalAccessException | NoSuchMethodException e) {
               throw new BeansException("Failed to bean init", e);
           }
           // BeanPostProcessor 后置处理
           wrappedBean = applyBeanPostProcessorsAfterInitialization(wrappedBean, beanName);
           return wrappedBean;
       }
   ```
   
   这样就把容器 Aware 能力加入到了 Bean 的创建中。

## 上下文 Aware 实现

我们在 Spring 中对 ApplicationContextAware 接口的实现可以概括为以下几个步骤：

1. Spring 容器创建 ApplicationContextAware 实例对象。

2. Spring 容器检测到该实例对象实现了 ApplicationContextAware 接口。

3. Spring 容器将当前容器的 ApplicationContext 对象注入到该实例对象的 setApplicationContext() 方法中。

4. 实现 ApplicationContextAware 接口的 bean 可以在 setApplicationContext() 方法中获取 ApplicationContext 对象，从而访问容器中的其他 bean。

需要注意的是，实现原理是通过 BeanPostProcessor 来实现的，其中 ApplicationContextAwareProcessor 就是一个内置的 BeanPostProcessor，它会在初始化 bean 的过程中，检测是否实现了 ApplicationContextAware 接口，并在合适的时候（容器启动，在 Bean 创建时的前置处理器中）调用 setApplicationContext() 方法完成注入操作。因此，如果我们需要自定义 Aware 类型接口的注入逻辑，也可以通过实现自己的 BeanPostProcessor 来实现。

### 定义一些职责和能力：

1. ApplicationContextAware：感知应用程序上下文

    ```java
    /**
     * 感知 应用程序上下文
     *
     * @author zhangpengjun
     * @date 2023/3/28
     */
    public interface ApplicationContextAware extends Aware {
    
        /**
         * 设置应用程序上下文
         *
         * @param applicationContext 应用程序上下文
         */
        void setApplicationContext(ApplicationContext applicationContext);
    
    }
    ```

### 具体的实现：

1. ApplicationContextAwareProcessor：是一个处理器（BeanPostProcessor），用于在 Spring 容器创建 bean 实例后，对实现了 ApplicationContextAware 接口的 bean 进行特殊处理。

   ```java
   /**
    * 应用程序上下文Aware比较特殊，因为在容器直接创建 Bean 的时候没有上下文的存在，
    * 所以只能交由上下文refresh()的时候，将 ApplicationContextAware 包装作为一个 Bean 的后置处理器添加到容器中，
    * 然后在Bean创建的时候，应用Bean前置处理，将上下文设置到Bean中取。
    * <p>
    * 所以：ApplicationContextAware 底层是 通过 BeanPostProcessor 实现的。
    */
   public class ApplicationContextAwareProcessor implements BeanPostProcessor {
   
       private final ApplicationContext applicationContext;
   
       public ApplicationContextAwareProcessor(ApplicationContext applicationContext) {
           this.applicationContext = applicationContext;
       }
   
       @Override
       public Object postProcessBeforeInitialization(Object bean, String beanName) {
           if (bean instanceof ApplicationContextAware) {
               ((ApplicationContextAware) bean).setApplicationContext(applicationContext);
           }
           return bean;
       }
   
       @Override
       public Object postProcessAfterInitialization(Object bean, String beanName) {
           return bean;
       }
   
   }
   ```

具体来说，ApplicationContextAwareProcessor 会在以下两个时刻进行处理：

1. 在 bean 实例化后，但在初始化前：此时 ApplicationContextAwareProcessor 会查找所有实现了 ApplicationContextAware 接口的 bean，并调用它们的 setApplicationContext() 方法，将 ApplicationContext 注入进去。
2. 在 bean 初始化后：此时 ApplicationContextAwareProcessor 不会再对 ApplicationContextAware 类型的 bean 进行处理，而是继续对其他类型的 bean 进行后续的处理。

该处理器会检查每个 bean 是否实现了 ApplicationContextAware 接口，如果实现了，则将 ApplicationContext 容器注入到该 bean 的 setApplicationContext() 方法中，从而使得该 bean 可以访问容器中的其他 bean。

### 将实现加入原有的逻辑中：

1. 修改上下文 AbstractApplicationContext 的 `refresh()` 方法：

   ```java
       @Override
       public void refresh() {
           // 1. 创建 Bean 工厂，加载 BeanDefinition
           refreshBeanFactory();
   
           // 2. 获得 Bean 工厂
           ConfigurableListableBeanFactory beanFactory = getBeanFactory();
           // 2.1 == 这里新加这一步 ==
           // 添加 ApplicationContextAware 的后置处理器
           // 使 Bean 创建时（BeanPostProcessor前置处理器）的时候可以感知到容器上下文
           beanFactory.addBeanPostProcessor(new ApplicationContextAwareProcessor(this));
   
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
   ```

### 测试：

- xml 准备

```java
<?xml version="1.0" encoding="utf-8" ?>
<beans>
    <bean id="mouse" class="com.snail.springframework.beans.factory.support.Mouse">
        <property name="name" value="name-xml-init-jerry"></property>
    </bean>
</beans>
```

- Mouse 类准备，实现各个 Aware 接口

```java
public class Mouse implements BeanNameAware, BeanClassLoaderAware, BeanFactoryAware, ApplicationContextAware {

    private ApplicationContext applicationContext;
    private String name;

    @Override
    public void setBeanClassLoader(ClassLoader classLoader) {
        System.out.println("==> BeanClassLoaderAware classLoader: " + classLoader);
    }

    @Override
    public void setBeanFactory(BeanFactory beanFactory) {
        System.out.println("==> BeanFactoryAware beanFactory: " + beanFactory);
    }

    @Override
    public void setBeanName(String beanName) {
        System.out.println("==> BeanNameAware beanName: " + beanName);
    }

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) {
        System.out.println("==> ApplicationContextAware applicationContext: " + applicationContext);
        this.applicationContext = applicationContext;
    }

    public ApplicationContext getApplicationContext() {
        return applicationContext;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @Override
    public String toString() {
        return "Mouse{" +
                "applicationContext=" + applicationContext +
                ", name='" + name + '\'' +
                '}';
    }
}
```

- 测试类

```java
    /**
     * xml上下文中，加入 Bean 的 Aware（感知能力），测试
     */
    @Test
    public void test_xml_context_aware() {
        // 1. 利用 xml上下文 加载Bean
        // 上下文的高级实现极大的简化了或融合了上述的 1-4 步操作
        ClassPathXmlApplicationContext applicationContext = new ClassPathXmlApplicationContext("classpath:spring-aware.xml");
        // 可以在任何时段，提前注册 JVM 关闭钩子，用来确保 Spring 容器在 JVM 关闭之前正确地关闭并释放所有资源。
        applicationContext.registerShutdownHook();
        // 2. 获取bean
        Mouse mouse = (Mouse) applicationContext.getBean("mouse");

        System.out.println("\n" + mouse);
        // * close 和 registerShutdownHook 比，比较暴力，直接手动调用关闭
        // applicationContext.close();
    }
```

- 测试结果

```java
==> BeanNameAware beanName: mouse
==> BeanClassLoaderAware classLoader: sun.misc.Launcher$AppClassLoader@18b4aac2
==> BeanFactoryAware beanFactory: com.snail.springframework.beans.factory.support.DefaultListableBeanFactory@6df97b55
==> ApplicationContextAware applicationContext: com.snail.springframework.context.support.ClassPathXmlApplicationContext@3cbbc1e0

Mouse{applicationContext=com.snail.springframework.context.support.ClassPathXmlApplicationContext@3cbbc1e0, name='name-xml-init-jerry'}

Process finished with exit code 0
```

## 总结

实现 Aware 接口的 bean 可以在特定的生命周期阶段中获取对应的资源或对象，并进行相应的操作。

例如，在初始化阶段，可以通过 ApplicationContextAware 获取 ApplicationContext 容器，并使用其提供的方法获取其他 bean 实例；在销毁阶段，可以通过 DisposableBean 或 @PreDestroy 注解来实现 bean 的清理操作。

需要注意的是，Spring 框架只会将实现了相应 Aware 接口的 bean 注入对应的资源或对象，而不是所有的 bean 都可以访问这些资源或对象。如果一个 bean 不需要访问任何外部资源或对象，则无需实现任何 Aware 接口。

同时，Spring 还提供了内置的处理器（例如 ApplicationContextAwareProcessor）来处理实现 Aware 接口的 bean，在合适的时候将指定的资源或对象注入到 bean 中。如果需要自定义 Aware 类型接口的注入逻辑，则可以通过实现自己的 BeanPostProcessor 来实现。


<Reward/>
