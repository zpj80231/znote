---
title: 手写 Spring 10 - AOP 和 Spring 容器的整合
date: 2023-11-09
tags:
   - 源码分析
   - Java
categories:
   - 源码 Source-code
isShowComments: true
---

<Boxx/>

我们先大致了解正常在 Spring 容器中使用 AOP 的基本步骤：

1. 定义切面类：创建一个切面类，该类包含了切面逻辑（Advice）和切入点（Pointcut）。切面逻辑定义了要在切入点处执行的逻辑，而切入点定义了在哪些方法或位置应用该切面逻辑。
2. 配置切面类：在 Spring 配置文件（如 XML 配置文件）中，声明切面类作为一个 bean，并配置其相关属性，例如切面逻辑和切入点。
3. 使用 AOP 功能：在应用程序中，可以直接使用被代理的 bean，并在其方法上应用切面逻辑。当方法被调用时，AOP 将拦截相应的切入点，并执行切面逻辑中定义的逻辑。

而 AOP 和 Spring 容器的整合，如上就是我们最终封装之后，对外暴露的流程。

<!-- more -->

[[toc]]

## **解析**

主要就是对上一篇 AOP 的进一步封装。与 Spring 整合 AbstractAutowireCapableBeanFactory.createBean 在创建 Bean 时，在实例化 Bean 之前判断是否需要代理，通过 InstantiationAwareBeanPostProcessor 查找所有的需要被代理的类和当前类比较，如果当前类需要被代理则创建代理类返回（不走正常的实例化逻辑了）；

## 进一步封装 AOP

### **定义一些职责和能力**

1. Advisor

   *一个* *aop* *操作的访问者，持有要执行的具体操作。*

```java
public interface Advisor {

    /**
     * 获取一个准备好的 aop 执行器
     *
     * @return {@link Advice}
     */
    Advice getAdvice();

}
```

2. BeforeAdvice，MethodBeforeAdvice

   *MethodBeforeAdvice* 用于在目标方法执行之前执行一些额外的逻辑操作（在 Spring 框架中，Advice 都是通过方法拦截器 MethodInterceptor 实现的。环绕 Advice 类似一个拦截器的链路，Before Advice、After advice等。这里简单只做一个MethodBeforeAdvice前置拦截）。

   通过实现 *MethodBeforeAdvice* 接口，开发人员可以在目标方法执行之前插入自定义的行为，比如日志记录、权限验证、事务管理等。

```java
public interface BeforeAdvice extends Advice {

}
```

```java
public interface MethodBeforeAdvice extends BeforeAdvice {

    /**
     * aop 方法前置操作
     *
     * @param method 目标方法
     * @param args   目标方法参数
     * @param target 目标对象，可能是空
     * @throws Throwable throwable
     */
    void before(Method method, Object[] args, Object target) throws Throwable;

}
```

3. PointcutAdvisor

   切入点访问者，*PointcutAdvisor* *承担了* *Pointcut* *和* *Advice* *的组合，*Pointcut 用于获取  JoinPoint，而 Advice 决定于 JoinPoint 执行什么操作。

```java
public interface PointcutAdvisor extends Advisor {

    /**
     * 获取一个切入点
     *
     * @return {@link Pointcut}
     */
    Pointcut getPointcut();

}
```




### **具体的实现**

1. AspectJExpressionPointcutAdvisor 切面拦截器

   将切面表达式，切面，匹配后的执行操作进行封装实现，后续就可以配置为一个 bean 加载到容器中方便使用了。

```java
public class AspectJExpressionPointcutAdvisor implements PointcutAdvisor {

    private Advice advice;

    private String expression;

    private AspectJExpressionPointcut aspectJExpressionPointcut;

    public void setAdvice(Advice advice) {
        this.advice = advice;
    }

    public void setExpression(String expression) {
        this.expression = expression;
    }

    @Override
    public Advice getAdvice() {
        return advice;
    }

    @Override
    public Pointcut getPointcut() {
        if (aspectJExpressionPointcut == null) {
            aspectJExpressionPointcut = new AspectJExpressionPointcut(expression);
        }
        return aspectJExpressionPointcut;
    }

}
```

2. MethodBeforeAdviceInterceptor 方法前置拦截器

   对方法拦截器的适配，将拦截到的方法，执行前后交由 spring 处理。

   这里处理了执行前交由 *MethodBeforeAdvice* 处理。

```java
public class MethodBeforeAdviceInterceptor implements MethodInterceptor {

    private MethodBeforeAdvice methodBeforeAdvice;

    public MethodBeforeAdviceInterceptor() {

    }

    public MethodBeforeAdviceInterceptor(MethodBeforeAdvice methodBeforeAdvice) {
        this.methodBeforeAdvice = methodBeforeAdvice;
    }

    @Override
    public Object invoke(MethodInvocation invocation) throws Throwable {
        methodBeforeAdvice.before(invocation.getMethod(), invocation.getArguments(), invocation.getThis());
        return invocation.proceed();
    }
}
```

3. ProxyFactory 代理工厂

   选择 JDK 还是 Cglib 代理。

```java
public class ProxyFactory {

    private final AdvisedSupport advisedSupport;

    public ProxyFactory(AdvisedSupport advisedSupport) {
        this.advisedSupport = advisedSupport;
    }

    public Object getProxy() {
        return createAopProxy().getProxy();
    }

    private AopProxy createAopProxy() {
        if (advisedSupport.isProxyTargetClass()) {
            return new Cglib2AopProxy(advisedSupport);
        }
        return new JdkDynamicAopProxy(advisedSupport);
    }

}
```




### **将实现加入原有的逻辑中**

- 原有类修改，AdvisedSupport（主要是用于把代理、拦截、匹配的各项属性包装到一个类中，方便在 *AopProxy* 实现类进行使用。），添加通过什么方式代理。

```java
    /**
     * 是否通过 类 代理对象（cglib代理？true：false）
     */
    private boolean proxyTargetClass = false;

    public boolean isProxyTargetClass() {
        return proxyTargetClass;
    }

    public void setProxyTargetClass(boolean proxyTargetClass) {
        this.proxyTargetClass = proxyTargetClass;
    }
```



### **测试**

- 测试类

```java
无
```

- 测试结果

```java
无
```



## 与 Spring 整合



### **定义一些职责和能力**

1. InstantiationAwareBeanPostProcessor

   扩展自 BeanPostProcessor，接口的主要作用在于：目标对象的实例化过程中需要处理的事情，包括实例化对象的前后过程以及实例的属性设置。

```java
public interface InstantiationAwareBeanPostProcessor extends BeanPostProcessor {

    /**
     * 在目标对象实例化之前调用，该方法的返回值类型是Object，我们可以返回任何类型的值。
     * 由于这个时候目标对象还未实例化，所以这个返回值可以用来代替原本该生成的目标对象的实例(比如代理对象)。
     * 如果该方法的返回值代替原本该生成的目标对象，后续只有postProcessAfterInitialization方法会调用，其它方法不再调用；否则按照正常的流程走。
     */
    Object postProcessBeforeInstantiation(Class<?> beanClass, String beanName) throws BeansException;

}
```

### **具体的实现**

1. DefaultAdvisorAutoProxyCreator

   `DefaultAdvisorAutoProxyCreator` 是 Spring Framework 中的一个类，负责根据配置的 Advisors 自动为 Bean 创建代理。它会扫描 bean，查找任何配置的 Advisors，并在必要时为这些 bean 创建动态代理。

   在 Spring Framework 中，Advisors 是定义切面逻辑（advice）的对象，例如拦截方法调用以应用额外的行为。

   它的工作原理如下：

   1. `DefaultAdvisorAutoProxyCreator` 在初始化阶段检查应用上下文中的所有 bean。
   2. 它查找配置了 Advisors 的 bean。一个 Advisor 通常由切面逻辑（advice）和切入点（pointcut）组成，切入点用于指定切面逻辑应该应用的位置。
   3. 对于每个配置了 Advisors 的 bean，`DefaultAdvisorAutoProxyCreator` 创建一个代理对象，该代理对象包装了原始的 bean。
   4. 代理对象拦截对 bean 的方法调用，并应用配置的 Advisors 定义的切面逻辑。
   5. 当应用上下文中的其他 bean 请求原始 bean 时，它们将接收代理对象而不是原始对象。

```java
public class DefaultAdvisorAutoProxyCreator implements InstantiationAwareBeanPostProcessor, BeanFactoryAware {

    private DefaultListableBeanFactory beanFactory;

    @Override
    public void setBeanFactory(BeanFactory beanFactory) {
        this.beanFactory = (DefaultListableBeanFactory) beanFactory;
    }

    @Override
    public Object postProcessBeforeInstantiation(Class<?> beanClass, String beanName) throws BeansException {
        if (isInfrastructureClass(beanClass)) {
            return null;
        }

        Collection<AspectJExpressionPointcutAdvisor> advisors = beanFactory.getBeansOfType(AspectJExpressionPointcutAdvisor.class).values();
        for (AspectJExpressionPointcutAdvisor advisor : advisors) {
            // 不匹配当前类，过滤
            ClassFilter classFilter = advisor.getPointcut().getClassFilter();
            if (classFilter != null && !classFilter.matches(beanClass)) {
                continue;
            }
            // 转换为代理对象返回
            TargetSource targetSource = null;
            try {
                targetSource = new TargetSource(beanClass.getDeclaredConstructor().newInstance());
            } catch (Exception e) {
                e.printStackTrace();
            }
            AdvisedSupport advisedSupport = new AdvisedSupport();
            advisedSupport.setTargetSource(targetSource);
            advisedSupport.setMethodMatcher(advisor.getPointcut().getMethodMatcher());
            advisedSupport.setMethodInterceptor((MethodInterceptor) advisor.getAdvice());
            // 是否使用 cglib 代理，这里先写死为 true，后续根据目标类动态改造
            advisedSupport.setProxyTargetClass(true);
            return new ProxyFactory(advisedSupport).getProxy();
        }
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
        return bean;
    }

}
```

   

### **将实现加入原有的逻辑中**

1. 修改 AbstractAutowireCapableBeanFactory，在创建 bean 时，与 spring 整合。

```java
    @Override
    protected Object createBean(String beanName, BeanDefinition beanDefinition, Object[] args) throws BeansException {
        Object bean = null;
        try {
            // 这里加入逻辑：判断是否返回 代理 Bean 对象
            bean = resolveBeforeInstantiation(beanName, beanDefinition);
            if (bean != null) {
                return bean;
            }

            // 实例化
            bean = createBeanInstance(beanName, beanDefinition, args);
            // 属性填充
            applyPropertyValues(beanName, bean, beanDefinition);
            // 添加 Bean 的初始化扩展
            bean = initializeBean(beanName, bean, beanDefinition);
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

    protected Object resolveBeforeInstantiation(String beanName, BeanDefinition beanDefinition) {
        // 前置方法，尝试获取一个代理对象
        Object bean = applyBeanPostProcessorsBeforeInstantiation(beanDefinition.getBeanClass(), beanName);
        if (bean != null) {
            // 如果生成了目标代理对象，后续只有 postProcessAfterInitialization 方法会调用，其它方法不再调用
            bean = applyBeanPostProcessorsAfterInitialization(bean, beanName);
        }
        return bean;
    }

    protected Object applyBeanPostProcessorsBeforeInstantiation(Class<?> beanClass, String beanName) {
        for (BeanPostProcessor beanPostProcessor : getBeanPostProcessors()) {
            if (beanPostProcessor instanceof InstantiationAwareBeanPostProcessor) {
                Object result = ((InstantiationAwareBeanPostProcessor) beanPostProcessor).postProcessBeforeInstantiation(beanClass, beanName);
                if (null != result) {
                    return result;
                }
            }
        }
        return null;
    }

```



### **测试**

- xml 准备，spring-advice.xml。

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
        <property name="expression" value="execution(* com.snail.springframework.beans.factory.bean.Tiger.*(..))"></property>
    </bean>
</beans>

```



- 提前准备

  TigerAdvice

```java
public class TigerAdvice implements MethodBeforeAdvice {

    @Override
    public void before(Method method, Object[] args, Object target) throws Throwable {
        System.out.println("TigerAdvice method before() -> method:" + method.getName() + "(), args:" + JSONUtil.toJsonStr(args));
        System.out.println("TigerAdvice method before() -> 前置aop, 进行一些操作, sleep(2000)");
        Thread.sleep(2000);
    }

}
```

- 测试类

```java
    /**
     * aop 和 spring 整合测试
     */
    @Test
    public void aopSpringAdviceTest() {
        ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext("classpath:spring-advice.xml");
        Tiger proxy = (Tiger) context.getBean("tiger");
        System.out.println("------------------" + DateUtil.now());
        proxy.setName("wow^^ hu~ Proxy");
        System.out.println("------------------" + DateUtil.now());
        // debug 查看是是否代理类：Tiger$$EnhancerByCGLIB$$ced6ff89@1860
        System.out.println("proxy tiger name:" + proxy.getAnimalName());
        System.out.println("------------------" + DateUtil.now());
    }
```

- 测试结果

```java
------------------2023-07-17 17:35:40
TigerAdvice method before() -> method:setName(), args:["wow^^ hu~ Proxy"]
TigerAdvice method before() -> 前置aop, 进行一些操作, sleep(2000)
------------------2023-07-17 17:35:42
TigerAdvice method before() -> method:getAnimalName(), args:[]
TigerAdvice method before() -> 前置aop, 进行一些操作, sleep(2000)
proxy tiger name:wow^^ hu~ Proxy
------------------2023-07-17 17:35:44
```

## **总结**

AOP（面向切面编程）和 Spring 容器的整合是 Spring Framework 提供的一项重要功能。通过将 AOP 和 Spring 容器结合使用，可以实现横切关注点的处理，提高代码的模块化和复用性，以及增强应用程序的可维护性和可扩展性。

在 AOP 和 Spring 容器的整合过程中，关键点包括：

1. 切面定义：通过定义切面类，其中包含切面逻辑（Advice）和切入点（Pointcut），来描述切面。
2. 切点解析：切入点是一个表达式，用于确定在哪些方法或位置应用切面逻辑。
3. 代理模式：Spring 使用代理模式来实现切面逻辑的织入。它通过动态创建代理对象并将切面逻辑织入到目标对象中。
4. 代理创建和织入：对于实现接口的目标对象，Spring 使用 JDK 动态代理；对于没有实现接口的目标对象，Spring 使用 CGLIB 代理。
5. AOP 配置：通过注解、XML 配置或基于 Java 的配置，开发者可以定义切面类、建议、切入点和切点表达式，以及指定目标对象和要织入的切面逻辑。

<Reward/>
