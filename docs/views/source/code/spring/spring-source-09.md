---
title: 手写 Spring 09 - 核心增强，AOP实现
date: 2023-10-13
tags:
   - 源码分析
   - Java
categories:
   - 源码 Source-code
isShowComments: true
---

<Boxx/>

这个文档讨论了如何使用 Spring AOP 实现动态代理。它包括了 AspectJExpressionPointcut、TargetSource、AdvisedSupport、ReflectiveMethodInvocation、AopProxy、JdkDynamicAopProxy 和 Cglib2AopProxy 等类的实现。

此外，文档还提供了一个 TigerInterceptor 类，该类演示了如何在代理对象上拦截方法调用并执行增强逻辑。最后，文档提供了一个测试类，该类演示了如何使用 Spring AOP 创建动态代理对象。

<!-- more -->

[[toc]]

## **解析**

AOP 的实现，最主要的核心就是切面表达式和动态代理。切面表达式匹配到指定的切面，再交由不用的代理（jdk 或 cglib）来实现。而他们的实现已经由 aspectj 、jdk 、 cglib 实现了，我们所作的就是封装他们的复杂性，将一个简单的类或功能暴露出来。

切面表达式：使用 aspectj 的 `org.aspectj.weaver.tools.PointcutExpression`

动态代理：将 jdk 和 cglib 的代理统一由 `aopalliance` 的 `org.aopalliance.intercept.MethodInterceptor` 和 `org.aopalliance.intercept.MethodInvocation` 实现（换句话说，aopalliance 将方法的调用转发到不同的代理实现中）。

这样对用户来说，只需 ① 自己定义一个切面表达式和 ② 自己实现 `MethodInvocation` 来实现切面，简单了用户操作，屏蔽了底层实现。

## 实现切面表达式

切面表达式就一个作用：过滤出指定的类和方法。

### **定义一些职责和能力**

1. Pointcut

   Pointcut 接口是 Spring 框架 AOP（面向切面编程）的一个核心接口，它用于描述一组需要被拦截的方法或类。

   在 Spring 中，Pointcut 可以被看作是一个逻辑切面，它包含了需要被增强的方法和类的信息，并可以根据这些信息来决定哪些方法需要被拦截和增强。

```java
public interface Pointcut {

    /**
     * 获取类过滤器
     * 类过滤器用于对目标类进行筛选和匹配，以便确定哪些类需要被代理和增强；
     *
     * @return {@link ClassFilter}
     */
    ClassFilter getClassFilter();

    /**
     * 获取方法匹配器
     * 方法匹配器用于对目标类的方法进行筛选和匹配，以便确定哪些方法需要被拦截和增强；
     *
     * @return {@link MethodMatcher}
     */
    MethodMatcher getMethodMatcher();

}
```

2. ClassFilter

   在 AOP 中，ClassFilter 用于在 BeanFactory 和 ApplicationContext 中过滤出需要被代理的类，主要作用是对目标类进行筛选和匹配，以便确定哪些类需要被代理和增强。

   例如，在 Spring AOP 中，可以使用切点（Pointcut）来定义一个需要拦截的切点，然后使用 ClassFilter 对目标类进行筛选和匹配。

   - 在匹配过程中，Spring 将会遍历所有的类，将每个类传递给 ClassFilter 的 matches 方法进行匹配。

   - 如果这个类符合条件，则将其加入到代理列表中，否则跳过不处理。

```java
public interface ClassFilter {

    /**
     * 用于判断指定的 Class 对象是否符合条件
     *
     * @param clazz clazz
     * @return boolean
     */
    boolean matches(Class<?> clazz);

}
```

3. MethodMatcher

   在 AOP 中，MethodMatcher 主要作用是对目标类的方法进行筛选和匹配，以便确定哪些方法需要被拦截和增强。通常情况下，MethodMatcher 总是和 ClassFilter 一起使用，以实现更加细粒度的 AOP 控制。

   例如，在 Spring AOP 中，可以通过 Pointcut 来定义一个切点，然后使用 MethodMatcher 进行方法匹配。
    * 在匹配过程中，Spring 将会遍历所有的方法，将每个方法传递给 MethodMatcher 的 matches 方法进行匹配。
    * 如果这个方法符合条件，则将其加入到代理列表中，否则跳过不处理。

```java
public interface MethodMatcher {

    /**
     * 用于在代理对象上进行目标方法匹配，判断是否符合条件
     *
     * @param method      方法
     * @param targetClass 目标类
     * @return boolean
     */
    boolean matches(Method method, Class<?> targetClass);

}
```

### **具体的实现**

1. AspectJExpressionPointcut

   AspectJExpressionPointcut 是 Spring 框架中实现 Pointcut 接口的一个具体实现类，用于定义一个基于 AspectJ 表达式的静态切点。

   AspectJ 是一种基于注解的 AOP 框架，它提供了一组强大的注解和表达式来进行方法拦截和增强。

```java
public class AspectJExpressionPointcut implements Pointcut, ClassFilter, MethodMatcher {

    private static final Set<PointcutPrimitive> SUPPORTED_PRIMITIVES = new HashSet<>();

    static {
        SUPPORTED_PRIMITIVES.add(PointcutPrimitive.EXECUTION);
    }

    private final PointcutExpression pointcutExpression;

    public AspectJExpressionPointcut(String expression) {
        PointcutParser pointcutParser =
                PointcutParser.getPointcutParserSupportingSpecifiedPrimitivesAndUsingSpecifiedClassLoaderForResolution(
                        SUPPORTED_PRIMITIVES, this.getClass().getClassLoader());
        pointcutExpression = pointcutParser.parsePointcutExpression(expression);
    }

    @Override
    public boolean matches(Class<?> clazz) {
        return pointcutExpression.couldMatchJoinPointsInType(clazz);
    }

    @Override
    public boolean matches(Method method, Class<?> targetClass) {
        return pointcutExpression.matchesMethodExecution(method).alwaysMatches();
    }

    @Override
    public ClassFilter getClassFilter() {
        return this;
    }

    @Override
    public MethodMatcher getMethodMatcher() {
        return this;
    }

}
```

### **将实现加入原有的逻辑中**

- 无

### **测试**

- 测试类

```java
    @Test
    public void aspectJExpressionPointcutTest() throws NoSuchMethodException {
        AspectJExpressionPointcut pointcut =
                new AspectJExpressionPointcut("execution(* com.snail.springframework.beans.factory.bean.Cat.*(..))");
        Class<Cat> clazz = Cat.class;
        Method method = clazz.getDeclaredMethod("toString");

        System.out.println(pointcut.matches(clazz));
        System.out.println(pointcut.matches(method, clazz));
    }
```

- 测试结果

```java
true
true

Process finished with exit code 0
```



## 封装动态代理

动态代理的实现肯定是代理切面表达式匹配到的方法，所以我们实现一个动态代理需要的核心三元素就是：

1. MethodMatcher 方法匹配器
2. TargetSource 被代理对象
3. MethodInterceptor 方法拦截器，拦截方法实现类，由用户自己实现

我们要做的就是把这些封装简化，对用户而言只需要一个 `AopProxy#getProxy` 获取代理对象。

### **定义一些职责和能力**

1. AopProxy

   AopProxy 接口是实现 AOP 的关键，它用于创建一个代理对象来拦截目标对象的方法调用，并将增强逻辑嵌入到方法调用过程中。通过 AopProxy，可以将任何普通的 Java 对象转换成带有切面的代理对象，从而实现 AOP 功能。

   Spring 提供了多种类型的 AopProxy 实现，包括 JDK 动态代理和 CGLIB 代理。在使用 Spring 进行 AOP 编程时，可以根据需要选择不同的代理实现来生成代理对象。

```java
public interface AopProxy {

    /**
     * 获得代理
     *
     * @return {@link Object}
     */
    Object getProxy();

}
```

### **具体的实现**

1. TargetSource：被代理的对象信息

```java
public class TargetSource {

    private final Object target;

    public TargetSource(Object target) {
        this.target = target;
    }

    public Class<?>[] getTargetClass() {
        return this.target.getClass().getInterfaces();
    }

    public Object getTarget() {
        return target;
    }

}
```

2. AdvisedSupport

   主要是用于把代理、拦截、匹配的各项属性包装到一个类中，方便在 AopProxy 实现类进行使用。

```java
public class AdvisedSupport {

    /**
     * 被代理对象
     */
    private TargetSource targetSource;

    /**
     * 方法拦截器，拦截方法实现类，由用户自己实现
     */
    private MethodInterceptor methodInterceptor;

    /**
     * 方法匹配器（切面表达式）
     */
    private MethodMatcher methodMatcher;

    public TargetSource getTargetSource() {
        return targetSource;
    }

    public void setTargetSource(TargetSource targetSource) {
        this.targetSource = targetSource;
    }

    public MethodInterceptor getMethodInterceptor() {
        return methodInterceptor;
    }

    public void setMethodInterceptor(MethodInterceptor methodInterceptor) {
        this.methodInterceptor = methodInterceptor;
    }

    public MethodMatcher getMethodMatcher() {
        return methodMatcher;
    }

    public void setMethodMatcher(MethodMatcher methodMatcher) {
        this.methodMatcher = methodMatcher;
    }
}
```

3. ReflectiveMethodInvocation

   ReflectiveMethodInvocation 是 Spring AOP 中实现 MethodInvocation 接口的一个具体类，用于封装方法调用信息并提供一些便捷的操作方法。在 AOP 操作中，ReflectiveMethodInvocation 负责将目标对象的方法调用转发到代理对象，并提供了运行时切面通知所需的 Method 对象、参数，以及目标对象等信息。

```java
public class ReflectiveMethodInvocation implements MethodInvocation {

    /**
     * 目标
     */
    protected final Object target;
    /**
     * 方法
     */
    protected final Method method;
    /**
     * 参数
     */
    protected final Object[] arguments;

    public ReflectiveMethodInvocation(Object target, Method method, Object[] arguments) {
        this.target = target;
        this.method = method;
        this.arguments = arguments;
    }

    @Override
    public Method getMethod() {
        return method;
    }

    @Override
    public Object[] getArguments() {
        return arguments;
    }

    @Override
    public Object proceed() throws Throwable {
        return method.invoke(target, arguments);
    }

    @Override
    public Object getThis() {
        return target;
    }

    @Override
    public AccessibleObject getStaticPart() {
        return method;
    }
}
```

### **将实现加入原有的逻辑中**

这里没有原先的逻辑，只是将上述的实现整合加入不同的动态代理实现类中。

1. JdkDynamicAopProxy 

   JdkDynamicAopProxy 是 Spring AOP 中的一个核心类，实现了 AopProxy 接口和 jdk 代理的 InvocationHandler 接口，用于创建使用 JDK 动态代理技术实现的 AOP 代理对象。JDK 动态代理只能代理接口，因此 JdkDynamicAopProxy 只能为实现了接口的目标对象创建代理。

```java
public class JdkDynamicAopProxy implements AopProxy, InvocationHandler {

    private final AdvisedSupport advised;

    public JdkDynamicAopProxy(AdvisedSupport advised) {
        this.advised = advised;
    }

    @Override
    public Object getProxy() {
        return Proxy.newProxyInstance(Thread.currentThread().getContextClassLoader(),
                advised.getTargetSource().getTargetClass(), this);
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        // 1. 获取被代理的类
        Object targetObject = advised.getTargetSource().getTarget();
        // 2. 获取表达式匹配器
        MethodMatcher methodMatcher = advised.getMethodMatcher();
        // 3. 获取用户自己实现的方法拦截器
        MethodInterceptor methodInterceptor = advised.getMethodInterceptor();
        // 4. 符合指定的切面规则的话，invoke 3.用户自己实现的方法拦截器
        if (methodMatcher.matches(method, targetObject.getClass())) {
            return methodInterceptor.invoke(new ReflectiveMethodInvocation(targetObject, method, args));
        }
        return method.invoke(targetObject, args);
    }

}
```

2. Cglib2AopProxy

   Cglib2AopProxy 是 Spring AOP 中基于 CGLIB 技术实现的代理对象创建类，实现了 AopProxy 接口。与 JDK 动态代理不同，CGLIB 可以为没有实现接口的类生成代理，因此 Cglib2AopProxy 可以为任何类创建代理。

```java
public class Cglib2AopProxy implements AopProxy {

    private final AdvisedSupport advised;

    public Cglib2AopProxy(AdvisedSupport advised) {
        this.advised = advised;
    }

    @Override
    public Object getProxy() {
        Enhancer enhancer = new Enhancer();
        enhancer.setSuperclass(advised.getTargetSource().getTarget().getClass());
        enhancer.setInterfaces(advised.getTargetSource().getTargetClass());
        enhancer.setCallback(new DynamicAdvisedInterceptor(advised));
        return enhancer.create();
    }

    private static class DynamicAdvisedInterceptor implements MethodInterceptor {
        private final AdvisedSupport advised;

        private DynamicAdvisedInterceptor(AdvisedSupport advised) {
            this.advised = advised;
        }

        @Override
        public Object intercept(Object obj, Method method, Object[] args, MethodProxy proxy) throws Throwable {
            Object targetObject = advised.getTargetSource().getTarget();
            MethodMatcher methodMatcher = advised.getMethodMatcher();
            org.aopalliance.intercept.MethodInterceptor methodInterceptor = advised.getMethodInterceptor();
            CglibMethodInvocation methodInvocation = new CglibMethodInvocation(targetObject, method, args, proxy);
            if (methodMatcher.matches(method, targetObject.getClass())) {
                return methodInterceptor.invoke(methodInvocation);
            }
            return methodInvocation.proceed();
        }
    }

    private static class CglibMethodInvocation extends ReflectiveMethodInvocation {

        private final MethodProxy methodProxy;

        public CglibMethodInvocation(Object target, Method method, Object[] arguments, MethodProxy methodProxy) {
            super(target, method, arguments);
            this.methodProxy = methodProxy;
        }

        @Override
        public Object proceed() throws Throwable {
            return methodProxy.invoke(getThis(), getArguments());
        }
    }

}
```

### **测试**

- xml 准备，无。

- 提前准备

  自定义 aop 拦截后的处理类：TigerInterceptor

```java
public class TigerInterceptor implements MethodInterceptor {

    @Override
    public Object invoke(MethodInvocation invocation) throws Throwable {
        System.out.println("~方法执行前~");
        Object result = invocation.proceed();
        ThreadUtil.sleep(100);
        System.out.println("~方法执行后~ 返回结果：" + result);
        return result;
    }

}
```

- 测试类

```java
    @Test
    public void aopTest() throws NoSuchMethodException {
        AspectJExpressionPointcut pointcut =
                new AspectJExpressionPointcut("execution(* com.snail.springframework.beans.factory.bean.Animal.*(..))");
        Tiger tiger = new Tiger();
        tiger.setName("[11 hu~]");
        System.out.println("tiger：" + tiger.getAnimalName());
        System.out.println("------------------");

        AdvisedSupport advised = new AdvisedSupport();
        advised.setMethodMatcher(pointcut);
        advised.setTargetSource(new TargetSource(tiger));
        advised.setMethodInterceptor(new TigerInterceptor());

        Animal jdkProxy = (Animal) new JdkDynamicAopProxy(advised).getProxy();
        tiger.setName("[12 hu~ jdkProxy]");
        System.out.println("jdk aop：" + jdkProxy.getAnimalName());
        System.out.println("------------------");
        Animal cglibProxy = (Animal) new Cglib2AopProxy(advised).getProxy();
        tiger.setName("[13 hu~ cglibProxy]");
        System.out.println("cglib aop：" + cglibProxy.getAnimalName());
    }
```

- 测试结果

```java
tiger：[11 hu~]
------------------
~方法执行前~
~方法执行后~ 返回结果：[12 hu~ jdkProxy]
jdk aop：[12 hu~ jdkProxy]
------------------
~方法执行前~
~方法执行后~ 返回结果：[13 hu~ cglibProxy]
cglib aop：[13 hu~ cglibProxy]

Process finished with exit code 0
```

## **总结**

AOP（面向切面编程）代理的实现可以分为两类：基于 JDK 动态代理和基于 CGLIB 技术。

基于 JDK 动态代理的实现是通过实现 InvocationHandler 接口以及调用 Proxy.newProxyInstance 方法来创建代理对象。JDK 动态代理只能代理接口，因此需要为目标对象接口定义一个代理对象，并实现 InvocationHandler 的 invoke 方法来实现增强逻辑。JDK 动态代理的优点是速度相对较快，缺点则是只能代理接口，无法代理类。

基于 CGLIB 技术的实现是通过继承 Enhancer 类并重写 CallbackFilter 和 intercept 方法来创建代理对象。CGLIB 可以为没有实现接口的类生成代理，因此可以为任何类创建代理。在 CGLIB 实现中，可以使用 MethodInterceptor 将代理对象、目标对象和方法参数打包成 MethodInvocation 对象，并通过该对象调用目标方法并应用切面增强逻辑。CGLIB 的优点是可以代理任意类，缺点则是相对 JDK 动态代理速度稍慢。

在 Spring AOP 中，还有一些其它的类和接口，比如 ReflectiveMethodInvocation、AopProxy、AdvisedSupport 等，它们与代理对象创建密切相关。ReflectiveMethodInvocation 类用于封装方法调用信息并提供一些便捷的操作方法，AopProxy 接口用于定义获取代理对象的方法，AdvisedSupport 类用于保存 AOP 配置信息。这些类和接口配合使用，可以方便地创建代理对象，并将切面逻辑应用到目标对象的方法调用中。

总之，AOP 代理是 Spring AOP 的核心功能之一，它可以帮助程序员将切面逻辑与目标对象的业务逻辑分离，从而实现更加灵活、高效的应用开发。无论是基于 JDK 动态代理还是基于 CGLIB 技术实现，都能够通过 Spring 框架提供的类和接口来快速创建代理对象，并将切面逻辑应用到目标对象的方法调用中。

<Reward/>
