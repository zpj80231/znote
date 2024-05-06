---
title: 手写 Spring 13 - 改造代理对象的创建过程及代理对象的属性填充
date: 2024-05-06
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

改造 bean 的创建过程，将代理对象的创建由原先的  bean 实例化之前创建，改为 bean 实例化之后，在 BeanPostProcessor 的初始化后置处理实现。

## 改造代理对象的创建过程

原先 aop 代理对象的创建是在 bean 实例化之前（DefaultAdvisorAutoProxyCreator#postProcessBeforeInstantiation()）创建的，现在改为在 BeanPostProcessor 的初始化后置处理实现（DefaultAdvisorAutoProxyCreator#postProcessAfterInitialization()）。

在创建代理对象时，又由于最终会调用 TargetSource#getTargetClass() 获取接口，所以改造为判断是 cglib 还是 jdk 的代理接口按需返回。

### **定义一些职责和能力**

1. 无


### **具体的实现**

1. DefaultAdvisorAutoProxyCreator 改造 

```java
public class DefaultAdvisorAutoProxyCreator implements InstantiationAwareBeanPostProcessor, BeanFactoryAware {

    private DefaultListableBeanFactory beanFactory;

    @Override
    public void setBeanFactory(BeanFactory beanFactory) {
        this.beanFactory = (DefaultListableBeanFactory) beanFactory;
    }

    @Override
    public PropertyValues postProcessPropertyValues(PropertyValues pvs, Object bean, String beanName) {
        return pvs;
    }

    @Override
    public Object postProcessBeforeInstantiation(Class<?> beanClass, String beanName) throws BeansException {
        return null;
    }

    private boolean isInfrastructureClass(Class<?> beanClass) {
        return Advice.class.isAssignableFrom(beanClass) || Pointcut.class.isAssignableFrom(beanClass) || Advisor.class.isAssignableFrom(beanClass);
    }

    @Override
    public Object postProcessBeforeInitialization(Object bean, String beanName) {
        return bean;
    }

    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) {
        if (isInfrastructureClass(bean.getClass())) {
            return null;
        }

        Collection<AspectJExpressionPointcutAdvisor> advisors = beanFactory.getBeansOfType(AspectJExpressionPointcutAdvisor.class).values();
        for (AspectJExpressionPointcutAdvisor advisor : advisors) {
            // 不匹配当前类，过滤
            ClassFilter classFilter = advisor.getPointcut().getClassFilter();
            if (classFilter != null && !classFilter.matches(bean.getClass())) {
                continue;
            }
            // 转换为代理对象返回
            AdvisedSupport advisedSupport = new AdvisedSupport();
            advisedSupport.setTargetSource(new TargetSource(bean));
            advisedSupport.setMethodMatcher(advisor.getPointcut().getMethodMatcher());
            advisedSupport.setMethodInterceptor((MethodInterceptor) advisor.getAdvice());
            advisedSupport.setProxyTargetClass(false); // 默认使用 cglib 代理
            return new ProxyFactory(advisedSupport).getProxy();
        }
        return null;
    }

}
```

2. TargetSource 改造

```java
public class TargetSource {

    private final Object target;

    public TargetSource(Object target) {
        this.target = target;
    }

    public Class<?>[] getTargetClass() {
        Class<?> clazz = this.target.getClass();
        clazz = ClassUtils.isCglibProxyClass(clazz) ? clazz.getSuperclass() : clazz;
        return clazz.getInterfaces();
    }

    public Object getTarget() {
        return target;
    }

}
```


### **将实现加入原有的逻辑中**

- AbstractAutowireCapableBeanFactory 创建 bean 流程改造

```java
    @Override
    protected Object createBean(String beanName, BeanDefinition beanDefinition, Object[] args) throws BeansException {
        Object bean = null;
        try {
            // 判断是否返回 代理 Bean 对象（注释原因，改用 BeanPostProcessor#postProcessAfterInitialization() 实现）
            // bean = resolveBeforeInstantiation(beanName, beanDefinition);
            // if (bean != null) {
            //     return bean;
            // }
            
            // 实例化
            bean = createBeanInstance(beanName, beanDefinition, args);
            
            // 省略...
            
        } catch (Exception e) {
            throw new BeansException("Failed to bean:[" + beanName + "] instance", e);
        }
        // 添加单例 Bean 缓存
        if (beanDefinition.isSingleton()) {
            // 注册实现了 DisposableBean 接口的 单例Bean 对象，留待容器停止的时候调用。
            registerDisposableBeanIfNecessary(beanName, bean, beanDefinition);
            addSingleton(beanName, bean);
        }
        return bean;
    }
```

### **测试**

- 配置文件，延用之前章节的 spring-advice.xml。

```xml
<?xml version="1.0" encoding="utf-8" ?>

<beans>
    <!--  目标类  -->
    <bean id="tiger" class="com.snail.springframework.beans.factory.bean.Tiger">
        <property name="name" value="name-xml-init-wow!"></property>
    </bean>

    <bean class="com.snail.springframework.aop.framework.autoproxy.DefaultAdvisorAutoProxyCreator"/>

    <!--  切面逻辑  -->
    <bean id="tigerAdvice" class="com.snail.springframework.aop.aspectj.TigerAdvice"/>
    <bean id="methodInterceptor" class="com.snail.springframework.aop.framework.adapter.MethodBeforeAdviceInterceptor">
        <property name="methodBeforeAdvice" ref="tigerAdvice"/>
    </bean>

    <!--  切入点  -->
    <bean class="com.snail.springframework.aop.aspectj.AspectJExpressionPointcutAdvisor">
        <property name="advice" ref="methodInterceptor"></property>
        <!--   cglib 代理     -->
        <property name="expression" value="execution(* com.snail.springframework.beans.factory.bean.Animal.*(..))"></property>
    </bean>
</beans>
```

- 测试类，延用之前章节的 AspectJAopTest#aopSpringAdviceTest()。

```java
public class AspectJAopTest {

    /**
     * aop 和 spring 整合测试
     */
    @Test
    public void aopSpringAdviceTest() {
        ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext("classpath:spring-advice.xml");
        Animal proxy = (Animal) context.getBean("tiger");
        // System.out.println("------------------" + DateUtil.now());
        // proxy.setName("wow^^ hu~ Proxy");
        System.out.println("------------------" + DateUtil.now());
        // debug 查看是是否代理类：Tiger$$EnhancerByCGLIB$$ced6ff89@1860
        System.out.println("proxy tiger name:" + proxy.getAnimalName());
        System.out.println("------------------" + DateUtil.now());
    }

}
```

- 测试结果

```java
------------------2023-09-18 18:36:32
TigerAdvice method before() -> method:getAnimalName(), args:null
TigerAdvice method before() -> 前置aop, 进行一些操作, sleep(2000)
proxy tiger name:name-xml-init-wow!
------------------2023-09-18 18:36:34
```



## 代理对象的属性填充

在我们实现的 Spring 中，bean 默认使用 cglib 来实例化的。

cglib 通常用于在运行时生成Java类的子类。cglib 生成的子类会继承父类的私有属性和方法，但不会自动继承属性的值。属性值的初始化需要在子类中进行处理。

而我们上章节已经在 bean 使用 cglib 实例化后，属性填充之前，利用 BeanPostProcessor 来修改属性值（解析@Value @Autowired等）。

而现在将 代理对象 的创建，放在了 bean 实例化后，属性填充之后，初始化扩展的 BeanPostProcessor#postProcessAfterInitialization()，所以属性已经做了填充，代码无需改动。

### **定义一些职责和能力**

1. 无

### **具体的实现**

1. 无

### **将实现加入原有的逻辑中**

1. 无

### **测试**

- xml 准备，无。

- 提前准备，无。


- 测试类，如上 `AspectJAopTest#aopSpringAdviceTest()`。

- 测试结果，无。

## **总结**

需要对 Spring 生命周期了解，及什么时候可以做哪些事情。

Spring 框架中的 Bean 的生命周期包括以下阶段：

1. **实例化（Instantiation）**：在这个阶段，Spring 容器根据 Bean 定义创建一个 Bean 的实例。这可以通过构造函数实例化、工厂方法或其他方式来完成。
2. **属性赋值（Populate Properties）**：在 Bean 实例化后，Spring 容器会将配置的属性值和依赖注入到 Bean 中。这可以通过 XML 配置、Java 注解或 Java 配置来完成。
3. **Bean 初始化前（Initialization Before）**：在这个阶段，Spring 容器会调用 Bean 的初始化方法（如果有的话）。你可以自定义初始化方法，例如使用 `@PostConstruct` 注解。
4. **Bean 初始化（Initialization）**：在这个阶段，Spring 容器会调用 Bean 的初始化方法。这是 Bean 实际准备就绪的时候。
5. **Bean 初始化后（Initialization After）**：在这个阶段，Spring 容器会执行 Bean 初始化后的一些定制操作。你可以使用 `BeanPostProcessor` 接口来自定义这些操作。
6. **Bean 可用（Bean Ready）**：在上述阶段完成后，Bean 实例已经可以供应用程序使用了。
7. **销毁前（Destruction Before）**：在 Bean 销毁之前，Spring 容器会调用 Bean 的销毁前方法（如果有的话）。你可以自定义销毁前方法，例如使用 `@PreDestroy` 注解。
8. **销毁（Destruction）**：在这个阶段，Spring 容器会销毁 Bean 实例，释放资源。
9. **销毁后（Destruction After）**：在 Bean 销毁后，Spring 容器会执行一些额外的清理操作。

可以通过配置和自定义方法来干预和控制 Bean 的生命周期中的各个阶段。

<Reward/>
