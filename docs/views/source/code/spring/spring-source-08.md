---
title: 手写 Spring 08 - 添加事件多播器，支持容器事件的注册、订阅、发布
date: 2023-08-01
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

## 解析

Spring 事件多播器（ApplicationEventMulticaster）是 Spring Framework 中的一个重要组件，用于管理和多播（分发）事件到所有的事件监听器。

在 Spring 应用中，通常会有多个事件监听器来监听不同类型的事件，当有事件触发时，事件源将会把事件发布出去。而事件多播器就是用来接收这些事件，然后将其分发给所有的事件监听器。在 Spring 容器中，通常使用 ApplicationEventMulticaster 实现事件的发布和监听。

在 Spring 中，可以使用 SimpleApplicationEventMulticaster、SyncTaskExecutor、SimpleThreadScope 等类来实现事件多播器。其中，SimpleApplicationEventMulticaster 是最简单的实现，它使用 Java 的线程机制实现了同步调用事件监听器。具体来说，SimpleApplicationEventMulticaster 持有一个监听器列表，并提供了 addApplicationListener 和 removeApplicationListener 方法来添加和删除事件监听器。而当一个事件被触发时，它会按照一定的顺序遍历监听器列表，将事件分发给每个监听器。

除了 SimpleApplicationEventMulticaster，Spring 还提供了另一种默认的事件多播器实现：AsyncApplicationEventMulticaster。与 SimpleApplicationEventMulticaster 不同的是，AsyncApplicationEventMulticaster 支持异步调用事件监听器。具体来说，AsyncApplicationEventMulticaster 通过 Executor（线程池）来管理异步执行的任务，以便将事件的发布和监听从主线程中分离出来，达到异步执行的效果。

需要注意的是，在使用多播器时，应该考虑事件监听器的数量以及监听器的执行时间等因素，以防止事件多播器成为系统的性能瓶颈。在实际使用中，可以通过调整线程池大小、监听器执行顺序、优化监听器代码等方式来提高事件多播器的性能和稳定性。

## 实现 事件发布订阅 的各个角色

基于观察者模式，完成一系列事件的管理就必须有以下几个角色：

1. 事件：一个具体的事件体本身；
2. 事件监听者：监听指定的事件；
3. 事件发布者：具有发布事件的能力；
4. 事件多播器：对前三者的统一管理，相当于事件注册中心，可以添加、删除事件监听器，可以发布指定的事件；

### 定义一些职责和能力：

1. ApplicationEvent：一个具体的事件，这个还比较顶层，所以我们再创建一个 ApplicationContextEvent 更具体的来表明这是一个容器事件。

```java
public abstract class ApplicationEvent extends EventObject {

    private static final long serialVersionUID = 5949591757825084930L;

    public ApplicationEvent(Object source) {
        super(source);
    }

}
```

```java
public class ApplicationContextEvent extends ApplicationEvent {

    private static final long serialVersionUID = -2652382590021151001L;

    public ApplicationContextEvent(Object source) {
        super(source);
    }

    /**
     * 获取应用程序上下文，上下文肯定是容有参构造传递过来的
     *
     * @return {@link ApplicationContext}
     */
    public ApplicationContext getApplicationContext() {
        return (ApplicationContext) getSource();
    }

}
```

2. ApplicationListener：事件监听器

```java
public interface ApplicationListener<E extends ApplicationEvent> extends EventListener {

    /**
     * 事件触发时会回调这个方法
     *
     * @param event 事件
     */
    void onApplicationEvent(E event);

}
```

3. ApplicationEventPublisher：定义事件发布者，所有的事件都需要从这个接口发布出去

```java
public interface ApplicationEventPublisher {

    /**
     * 发布事件
     *
     * @param event 事件
     */
    void publishEvent(ApplicationEvent event);

}
```

4. ApplicationEventMulticaster：事件多播器

```java
public interface ApplicationEventMulticaster {

    /**
     * 添加一个监听器
     *
     * @param listener 监听器
     */
    void addApplicationListener(ApplicationListener<?> listener);

    /**
     * 删除一个监听器
     *
     * @param listener 监听器
     */
    void removeApplicationListener(ApplicationListener<?> listener);

    /**
     * 发布一个事件
     *
     * @param event 事件
     */
    void multicastEvent(ApplicationEvent event);

}
```

### 具体的实现：

具体的实现无非就是对多播器的事件，因为多播器的定义以及包括了对事件的发布以及事件监听器的注册。这里先使用抽象类 `AbstractApplicatioinEventMulticaster` 默认实现多播器中事件监听器的注册、添加以及获取指定事件监听器的方法，把发布事件留给不同子类实现，以方便不同的扩展。

1. AbstractApplicatioinEventMulticaster：多播器的抽象实现类。

```java
public abstract class AbstractApplicatioinEventMulticaster implements ApplicationEventMulticaster, BeanFactoryAware {

    private final Set<ApplicationListener<ApplicationEvent>> applicationListeners = new LinkedHashSet<>();

    private BeanFactory beanFactory;

    @Override
    public void addApplicationListener(ApplicationListener<?> listener) {
        applicationListeners.add((ApplicationListener<ApplicationEvent>) listener);
    }

    @Override
    public void removeApplicationListener(ApplicationListener<?> listener) {
        applicationListeners.remove(listener);
    }

    @Override
    public void setBeanFactory(BeanFactory beanFactory) {
        this.beanFactory = beanFactory;
    }

    /**
     * 获取订阅了某个事件的所有监听器
     *
     * @param event 事件
     * @return {@link Collection}<{@link ApplicationListener}>
     */
    protected Collection<ApplicationListener<ApplicationEvent>> getApplicationListeners(ApplicationEvent event) {
        LinkedList<ApplicationListener<ApplicationEvent>> allListeners = new LinkedList<>();
        for (ApplicationListener<ApplicationEvent> listener : applicationListeners) {
            if (supportsEvent(listener, event)) {
                allListeners.add(listener);
            }
        }
        return allListeners;
    }

    private boolean supportsEvent(ApplicationListener<ApplicationEvent> listener, ApplicationEvent event) {
        Class<? extends ApplicationListener> listenerClass = listener.getClass();
        // 主要是用来获取当前类的接口，但当前类创建时可能是cglib或jdk代理实现的
        // jdk动态代理的代理类已经实现了接口，直接使用该 Class 对象即可。
        Class<?> targetClass = listenerClass;
        // 判断是否是 cglib 代理类，如果是，就获取其父类的 Class 对象，否则直接使用该 Class 对象。
        if (listenerClass.getName().contains("$$")) {
            targetClass = listenerClass.getSuperclass();
        }

        // 获取事件监听器实现的第一个泛型接口（即 ApplicationListener）
        Type genericInterfaces = targetClass.getGenericInterfaces()[0];

        // 获取该接口的实际泛型参数类型，因为只有一个取第一个即可。
        Type actualTypeArgument = ((ParameterizedType) genericInterfaces).getActualTypeArguments()[0];

        // 获取泛型的全类名并得到Class，用于事件类型对比
        String eventClassName = actualTypeArgument.getTypeName();
        Class<?> eventClass;
        try {
            eventClass = Class.forName(eventClassName);
        } catch (ClassNotFoundException e) {
            throw new BeansException("wrong evnet class name: " + eventClassName);
        }

        // 判断泛型和事件是否匹配
        // 父类.class.isAssignableFrom(子类.class)
        // 子类实例 instanceof 父类类型
        return eventClass.isAssignableFrom(event.getClass());
    }

}
```

2. SimpleApplicationEventMulticaster：使用同步方式调用每个监听器的 onApplicationEvent 方法。

```java
public class SimpleApplicationEventMulticaster extends AbstractApplicatioinEventMulticaster {

    @Override
    public void multicastEvent(ApplicationEvent event) {
        for (ApplicationListener<ApplicationEvent> listener : getApplicationListeners(event)) {
            listener.onApplicationEvent(event);
        }
    }

}
```



### 将实现加入原有的逻辑中：

- 无



## 将 事件能力 和容器结合

想一想，怎么把现有的事件相关者和 Spring 容器相结合呢？

其实无非就是在容器启动（`refresh()`）的时候，将事件多播器和所有的事件监听器提前加载到容器中。

当然，也可以提前定义容器的生命周期事件：ContextRefreshedEvent（容器刷新完成事件），ContextClosedEvent（容器关闭事件）在容器启动时就加载到容器中。

### 定义一些职责和能力：

- 无

### 具体的实现：

1. ContextRefreshedEvent：容器刷新完成事件

```java
public class ContextRefreshedEvent extends ApplicationContextEvent {
   
    private static final long serialVersionUID = 5264064757132179583L;

    public ContextRefreshedEvent(Object source) {
        super(source);
    }

}
```

2. ContextClosedEvent：容器关闭事件

```java
public class ContextClosedEvent extends ApplicationContextEvent {

    private static final long serialVersionUID = 9130139349987597886L;

    public ContextClosedEvent(Object source) {
        super(source);
    }

}
```

### 将实现加入原有的逻辑中：

1. 为了方便，直接让容器具备发布事件的能力，所以让 ApplicationContext 这个顶层接口继承 ApplicationEventPublisher，在 AbstractApplicationContext 中实现发布事件方法即可。

```java
public interface ApplicationContext extends ListableBeanFactory, HierarchicalBeanFactory, ResourceLoader, ApplicationEventPublisher {

}
```

```java
public abstract class AbstractApplicationContext 
    extends DefaultResourceLoader 
    // ConfigurableApplicationContext 继承了 ApplicationContext
    implements ConfigurableApplicationContext {
    @Override
    public void publishEvent(ApplicationEvent event) {
        applicationEventMulticaster.multicastEvent(event);
    }  
}
```

2. 完善 `refresh()` 加入 7、8、9 步骤，完成事件多播器和事件监听器的注册，加入容器事件的发布。

```java
public abstract class AbstractApplicationContext 
    extends DefaultResourceLoader 
    implements ConfigurableApplicationContext {
    
    private static final String APPLICATION_EVENT_MULTICASTER_BEAN_NAME = "applicationEventMulticaster";

    private ApplicationEventMulticaster applicationEventMulticaster; 
    
   	@Override
    public void refresh() {
        // 1. 创建 Bean 工厂，加载 BeanDefinition
        refreshBeanFactory();

        // 2. 获得 Bean 工厂
        ConfigurableListableBeanFactory beanFactory = getBeanFactory();
        // 6. 添加 ApplicationContextAware 的后置处理器
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

        // 7. 初始化事件多播器
        initApplicationEventMulticaster();

        // 8. 注册所有的事件监听器
        registerListeners();

        // 5. 提前实例化所有的单例 Bean
        beanFactory.preInstantiateSingletons();

        // 9. 所有工作已就绪，发布容器刷新完成事件
        finishRefresh();
    }

    private void finishRefresh() {
        publishEvent(new ContextRefreshedEvent(this));
    }

    private void registerListeners() {
        Collection<ApplicationListener> applicationListeners = getBeansOfType(ApplicationListener.class).values();
        for (ApplicationListener listener : applicationListeners) {
            applicationEventMulticaster.addApplicationListener(listener);
        }
    }

    private void initApplicationEventMulticaster() {
        ConfigurableListableBeanFactory beanFactory = getBeanFactory();
        applicationEventMulticaster = new SimpleApplicationEventMulticaster();
        beanFactory.registerSingleton(APPLICATION_EVENT_MULTICASTER_BEAN_NAME, applicationEventMulticaster);
    }
    
    @Override
    public void close() {
        // 发布容器关闭事件
        publishEvent(new ContextClosedEvent(this));
        // 执行各个单例 Bean 的销毁方法
        getBeanFactory().destroySingletons();
    }
}
```

### 测试：

- xml 准备，容器启动时提前注册所有的监听器。

```java
<?xml version="1.0" encoding="utf-8" ?>
<beans>
    <bean class="com.snail.springframework.beans.factory.event.CustomEventListener"/>
    <bean class="com.snail.springframework.beans.factory.event.ContextRefreshedEventListener"/>
    <bean class="com.snail.springframework.beans.factory.event.ContextClosedEventListener"/>
</beans>
```

- 这里我们准备一个 2个容器监听器，监听容器刷新完成和容器关闭事件。

  另准备一个自定义事件和自定义事件监听器，用来手动发布。

```java
/**
 * 监听容器刷新完成事件
 */
public class ContextRefreshedEventListener implements ApplicationListener<ContextRefreshedEvent> {

    @Override
    public void onApplicationEvent(ContextRefreshedEvent event) {
        System.out.println("收到事件 ContextRefreshedEvent：" + event);
    }

}
```

```java
/**
 * 监听容器关闭事件
 */
public class ContextClosedEventListener implements ApplicationListener<ContextClosedEvent> {

    @Override
    public void onApplicationEvent(ContextClosedEvent event) {
        System.out.println("收到事件 ContextClosedEvent：" + event);
    }

}
```

```java
/**
 * 自定义事件
 */
public class CustomEvent extends ApplicationContextEvent {

    private static final long serialVersionUID = 2651556915889874385L;
    private String id;
    private String message;

    public CustomEvent(Object source, String id, String message) {
        super(source);
        this.id = id;
        this.message = message;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    @Override
    public String toString() {
        return "CustomEvent{" +
                "id='" + id + '\'' +
                ", message='" + message + '\'' +
                ", source=" + source +
                '}';
    }
}
```

```java
/**
 * 自定义事件监听
 */
public class CustomEventListener implements ApplicationListener<CustomEvent> {

    @Override
    public void onApplicationEvent(CustomEvent event) {
        System.out.println("收到事件 CustomEvent：" + event);
    }

}
```

- 测试类

```java
public class ApplicationListenerTest {

    /**
     * 测试事件
     */
    @Test
    public void test_event() {
        ClassPathXmlApplicationContext applicationContext = new ClassPathXmlApplicationContext("classpath:spring-event.xml");
        applicationContext.publishEvent(new CustomEvent(applicationContext, "13", "哟哟哟~"));
        applicationContext.registerShutdownHook();
    }

}
```

- 测试结果

```java
收到事件 ContextRefreshedEvent：com.snail.springframework.context.event.ContextRefreshedEvent[source=com.snail.springframework.context.support.ClassPathXmlApplicationContext@26ba2a48]
收到事件 CustomEvent：CustomEvent{id='13', message='哟哟哟~', source=com.snail.springframework.context.support.ClassPathXmlApplicationContext@26ba2a48}
收到事件 ContextClosedEvent：com.snail.springframework.context.event.ContextClosedEvent[source=com.snail.springframework.context.support.ClassPathXmlApplicationContext@26ba2a48]

Process finished with exit code 0
```

## 总结

Spring 在容器启动的时候会注册多播器和所有的事件监听器，同时也会注册一些容器自带事件（如容器刷新完成事件、容器关闭事件）。

在向容器手动发布事件后，容器会通过多播器获取到所有订阅了该事件的监听器（具体实现参考`AbstractApplicatioinEventMulticaster#getApplicationListeners(ApplicationEvent event)`遍历所有的监听器，看监听器泛型是否和指定事件所匹配），回调监听器的方法来实现事件的监听。

1. 监听器注册

首先，在 Spring 容器启动过程中，所有的事件监听器会被注册到事件多播器中。通过调用 ApplicationEventMulticaster 的 addApplicationListener 方法，可以向事件多播器中添加一个新的事件监听器。同时，可以使用 removeApplicationListener 来删除一个已经注册的事件监听器。

2. 事件发布

当一个事件被触发时，事件源将会把事件发布出去。在 Spring 中，事件通常通过 ApplicationContext 的 publishEvent 方法来发布。这个方法会依次调用所有注册到容器中的事件多播器，并将事件分发给它们。

在事件多播器中，会按照一定的顺序遍历监听器列表，将事件分发给每个监听器。具体的分发逻辑可以由具体的事件多播器实现类来实现。例如，SimpleApplicationEventMulticaster 使用同步方式调用每个监听器的 onApplicationEvent 方法，而 AsyncApplicationEventMulticaster 则使用异步方式执行任务。

3. 事件监听器的执行

当事件多播器将事件分发给每个事件监听器时，会调用每个监听器的 onApplicationEvent 方法来处理事件。这个方法由具体的事件监听器实现，并且需要根据具体的业务场景来编写。


<Reward/>
