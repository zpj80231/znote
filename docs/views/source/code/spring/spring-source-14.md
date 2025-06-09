---
title: 手写 Spring 14 - 循环引用及三级缓存
date: 2024-05-31
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

## **解析**

在 getBean 创建过程中，最重要的大三步为：实例化、属性填充、初始化。

从流程可以看到，循环依赖主要发生在**第二步（populateBean）**，也就是field属性注入的处理。

## 三级缓存及循环引用

```java
private final Map<String, Object> singletonObjects = new ConcurrentHashMap<>(256); //一级缓存
private final Map<String, Object> earlySingletonObjects = new HashMap<>(16); // 二级缓存
private final Map<String, ObjectFactory<?>> singletonFactories = new HashMap<>(16); // 三级缓存
```

处理循环引用的关键点：

- 循环依赖的核心功能实现主要包括 DefaultSingletonBeanRegistry 提供三级缓存：`singletonObjects 、 earlySingletonObjects 、singletonFactories` ，分别存放成品对象、半成品对象和工厂对象。同时包装三个缓存提供方法：getSingleton、registerSingleton、addSingletonFactory，这样使用方就可以分别在不同时间段存放和获取对应的对象了。
- 在 AbstractAutowireCapableBeanFactory 的 doCreateBean 方法中，提供了关于提前暴露对象的操作， `addSingletonFactory(beanName, () ->
  getEarlyBeanReference(beanName, beanDefinition,finalBean)); `，以及后续获取对象和注册对象的操作， `exposedObject = getSingleton(beanName); 、 registerSingleton(beanName, exposedObject); `，经过这样的处理就可以完成对复杂场景循环依赖的操作。
- 另外在 DefaultAdvisorAutoProxyCreator 提供的切面服务中，也需要实现接口 InstantiationAwareBeanPostProcessor 新增的 getEarlyBeanReference 方法，便于把依赖的切面对象也能存放到三级缓存中，处理对应的循环依赖。

### **定义一些职责和能力**

1. ObjectFactory 提前暴露的三级缓存工厂对象，在运行时动态地获取对象的实例。

2. DefaultSingletonBeanRegistry 在原先一级缓存的基础上，添加二级和三级缓存，及相应的add方法，同时改造缓存获取 bean 逻辑为优先一其次二最后三中查找。

3. InstantiationAwareBeanPostProcessor 接口添加 getEarlyBeanReference 方法。

   ```java
   public interface InstantiationAwareBeanPostProcessor extends BeanPostProcessor {
       /**
        * 在 Bean 实例化之后初始化之前，获取 Bean 的早期引用并进行操作。
        * 若不需要执行AOP的逻辑，直接返回Bean。
        *
        * @param bean     bean
        * @param beanName bean 名称
        * @return {@link Object}
        */
       default Object getEarlyBeanReference(Object bean, String beanName) {
           return bean;
       } 
   }
   ```

   主要用于将 aop 对象也提前暴露到三级缓存中。在 DefaultAdvisorAutoProxyCreator 实现它返回 aop 代理对象。


### **具体的实现**

1. ObjectFactory 

```java
public interface ObjectFactory<T> {

    /**
     * 这个方法返回一个类型为 T 的对象实例，您可以通过调用 getObject 方法来获取。
     * ObjectFactory 通常用于将对象的创建和初始化推迟到需要的时候，以避免在应用程序启动时立即创建所有对象。
     * <p>
     * 在 Spring 中，ObjectFactory 的一个常见用法是在解决循环依赖问题时。
     * 当 Spring 需要创建一个 Bean，但该 Bean 正在创建中，因此还不能完全初始化时，它会将该 Bean 的 ObjectFactory 放入二级缓存（earlySingletonObjects）中，
     * 以便其他 Bean 可以提前获取 Bean 的引用，而不会导致循环依赖问题。
     * <p>
     * 另一个常见的用例是在配置中声明原型（prototype）作用域的 Bean，因为原型作用域的 Bean 不会在容器初始化时立即创建，而是在每次请求时动态创建。
     * 在这种情况下，ObjectFactory 可以用于获取原型作用域 Bean 的实例。
     *
     * @return {@link T}
     */
    T getObject();

}
```

2. DefaultSingletonBeanRegistry

```java
/**
 * 保存了所有单例 bean 和待销毁的 bean
 *
 * @author zhangpengjun
 * @date 2023/3/15
 */
public class DefaultSingletonBeanRegistry implements SingletonBeanRegistry {

    /**
     * 空单例对象的内部标记，用作 ConcurrentHashMap（不支持null值）的标记值。
     */
    protected static final Object NULL_OBJECT = new Object();

    /**
     * 一级缓存，一级缓存存储已经完全创建和初始化的单例 Bean 的实例。
     */
    private final Map<String, Object> singletonObjects = new ConcurrentHashMap<>(256);

    /**
     * 二级缓存，用于存储正在创建中的 Bean 的实例（属性尚未填填充）。
     * 当 Spring 创建 Bean 时，如果发现该 Bean 存在循环依赖，它会将 Bean 的实例放入这个缓存中。这个实例可以被其他 Bean 提前获取，以解决循环依赖问题。
     */
    private final Map<String, Object> earlySingletonObjects = new HashMap<>(16);

    /**
     * 三级缓存，存储的是 Bean 的工厂对象（ObjectFactory）。
     * 当 Spring 创建 Bean 时，如果发现该 Bean 存在循环依赖，它会将 Bean 的工厂对象放入这个缓存中。这个工厂对象用于在后续创建 Bean 的过程中获取 Bean 的实例。
     */
    private final Map<String, ObjectFactory<?>> singletonFactories = new HashMap<>(16);

    private final Map<String, DisposableBean> disposableBeans = new HashMap<>();

    @Override
    public Object getSingleton(String beanName) {
        // 先从一级缓存获取
        Object singletonObject = singletonObjects.get(beanName);
        if (singletonObject == null) {
            // 再从二级缓存获取
            singletonObject = earlySingletonObjects.get(beanName);
            if (singletonObject == null) {
                // 最后从三级缓存获取
                ObjectFactory<?> singletonFactory = singletonFactories.get(beanName);
                if (singletonFactory != null) {
                    singletonObject = singletonFactory.getObject();
                    // 三级缓存存在，放入二级缓存
                    earlySingletonObjects.put(beanName, singletonObject);
                    singletonFactories.remove(beanName);
                }
            }
        }
        return singletonObject;
    }

    @Override
    public void registerSingleton(String beanName, Object singletonObject) {
        singletonObjects.put(beanName, singletonObject);
        earlySingletonObjects.remove(beanName);
        singletonFactories.remove(beanName);
    }

    protected void addSingletonFactory(String beanName, ObjectFactory<?> objectFactory) {
        if (!singletonFactories.containsKey(beanName)) {
            singletonFactories.put(beanName, objectFactory);
            earlySingletonObjects.remove(beanName);
        }
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

3. DefaultAdvisorAutoProxyCreator

```java

 * DefaultAdvisorAutoProxyCreator 是 Spring Framework 中的一个类，负责根据配置的 Advisors 自动为 Bean 创建代理。
 * 它会扫描 bean，查找任何配置的 Advisors，并在必要时为这些 bean 创建动态代理。
 * 在 Spring Framework 中，Advisors 是定义 advice 的对象，例如拦截方法调用额外的行为。
 * <br/>
 * 它的工作原理如下：
 * <br/>
 * 1. DefaultAdvisorAutoProxyCreator 在初始化阶段检查应用上下文中的所有 bean。
 * 2. 它查找配置了 Advisors 的 bean。一个 Advisor 通常由切面逻辑（advice）和切入点（pointcut）组成，切入点用于指定 advice 应该应用的位置。
 * 3. 对于每个配置了 Advisors 的 bean，DefaultAdvisorAutoProxyCreator 创建一个代理对象，该代理对象包装了原始的 bean。
 * 4. 代理对象拦截对 bean 的方法调用，并应用配置的 Advisors 定义的 advice。
 * 5. 当应用上下文中的其他 bean 请求原始 bean 时，它们将接收代理对象而不是原始对象。
 *
 * @author zhangpengjun
 * @date 2023/4/19
 */
public class DefaultAdvisorAutoProxyCreator implements InstantiationAwareBeanPostProcessor, BeanFactoryAware {

    private DefaultListableBeanFactory beanFactory;

    private final Set<String> earlyProxyReferences = Collections.synchronizedSet(new HashSet<>());

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

    @Override
    public boolean postProcessAfterInstantiation(Object bean, String beanName) {
        return true;
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
        if (!earlyProxyReferences.contains(beanName)) {
            return wrapIfNecessary(bean, beanName);
        }
        return wrapIfNecessary(bean, beanName);
    }

    private Object wrapIfNecessary(Object bean, String beanName) {
        if (isInfrastructureClass(bean.getClass())) {
            return bean;
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
            advisedSupport.setProxyTargetClass(false); // 默认使用 jdk 代理
            return new ProxyFactory(advisedSupport).getProxy();
        }

        return bean;
    }

    @Override
    public Object getEarlyBeanReference(Object bean, String beanName) {
        earlyProxyReferences.add(beanName);
        return wrapIfNecessary(bean, beanName);
    }
}
```




### **将实现加入原有的逻辑中**

- 修改 `AbstractAutowireCapableBeanFactory#createBean`，在实例化之后，填充属性之前，”提前暴露“原始对象的引用（放入三级缓存），用于解决循环依赖。

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

            // 处理循环依赖，将实例化后的 bean 提前放入缓存中暴露出来
            if (beanDefinition.isSingleton()) {
                Object finalBean = bean;
                // ”提前暴露“原始对象的引用，用于解决循环依赖
                addSingletonFactory(beanName, () -> getEarlyBeanReference(beanName, beanDefinition, finalBean));
            }
            // 实例化后判断，对于不需要填充属性的 bean 直接返回
            boolean continueWithPropertyPopulation = applyBeanPostProcessorsAfterInstantiation(beanName, bean);
            if (!continueWithPropertyPopulation) {
                return bean;
            }

            // 在设置 Bean 属性之前，允许 BeanPostProcessor 修改属性值（解析@Value @Autowired等）
            applyBeanPostProcessorsBeforeApplyingPropertyValues(beanName, bean, beanDefinition);
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
            registerSingleton(beanName, bean);
        }
        return bean;
    }

    private Object getEarlyBeanReference(String beanName, BeanDefinition beanDefinition, Object bean) {
        Object exposedObject = bean;
        for (BeanPostProcessor beanPostProcessor : getBeanPostProcessors()) {
            if (beanPostProcessor instanceof InstantiationAwareBeanPostProcessor) {
                exposedObject = ((InstantiationAwareBeanPostProcessor) beanPostProcessor).getEarlyBeanReference(exposedObject, beanName);
                if (exposedObject == null) {
                    return exposedObject;
                }
            }
        }
        return exposedObject;
    }

    private boolean applyBeanPostProcessorsAfterInstantiation(String beanName, Object bean) {
        boolean continueWithPropertyPopulation = true;
        for (BeanPostProcessor beanPostProcessor : getBeanPostProcessors()) {
            if (beanPostProcessor instanceof InstantiationAwareBeanPostProcessor) {
                InstantiationAwareBeanPostProcessor instantiationAwareBeanPostProcessor = (InstantiationAwareBeanPostProcessor) beanPostProcessor;
                if (!instantiationAwareBeanPostProcessor.postProcessAfterInstantiation(bean, beanName)) {
                    continueWithPropertyPopulation = false;
                    break;
                }
            }
        }
        return continueWithPropertyPopulation;
    }
```

### **测试**

- xml 准备，spring-cyclic-dependence.xml。

```xml
<?xml version="1.0" encoding="utf-8" ?>

<beans>
    <!--  目标类  -->
    <bean class="com.snail.springframework.cyclicDependence.A">
        <property name="b" ref="b"></property>
    </bean>
    <bean class="com.snail.springframework.cyclicDependence.B">
        <property name="a" ref="a"></property>
        <property name="c" ref="cFace"></property>
    </bean>
    <bean id="cFace" class="com.snail.springframework.cyclicDependence.CFace"></bean>

    <!--  aop  -->
    <bean class="com.snail.springframework.aop.framework.autoproxy.DefaultAdvisorAutoProxyCreator"/>

    <!--  切面逻辑  -->
    <bean id="bAdvice" class="com.snail.springframework.cyclicDependence.BAdvice"></bean>
    <bean id="methodInterceptor" class="com.snail.springframework.aop.framework.adapter.MethodBeforeAdviceInterceptor">
        <property name="methodBeforeAdvice" ref="bAdvice"/>
    </bean>

    <!--  切入点  -->
    <bean class="com.snail.springframework.aop.aspectj.AspectJExpressionPointcutAdvisor">
        <property name="advice" ref="methodInterceptor"></property>
        <!--   cglib 代理     -->
        <property name="expression" value="execution(* com.snail.springframework.cyclicDependence.IFace.*(..))"></property>
    </bean>
</beans>

```

- 提前准备，A（循环引用类）、B（循环引用类）、BAdvice（B切面）、IFace接口、CFace（接口实现类）


```java
public class A {

    private B b;

    public String print() {
        return "A print b: " + b;
    }

}
public class B {

    private A a;
    private IFace c;

    public String print() {
        return "B print a: " + a + "\n\t\tB print Face c: " + c.getFace();
    }

}
public class BAdvice implements MethodBeforeAdvice {

    @Override
    public void before(Method method, Object[] args, Object target) throws Throwable {
        System.out.println("BAdvice before method: " + method);
    }

}
public interface IFace {

    String getFace();

}
public class CFace implements FactoryBean<IFace> {

    @Override
    public IFace getObject() {
        return (IFace) Proxy.newProxyInstance(Thread.currentThread().getContextClassLoader(), new Class[]{IFace.class}, ((proxy, method, args) ->
                "proxy face method name: " + method.getName()
        ));
    }

    @Override
    public Class<?> getObjectType() {
        return IFace.class;
    }

    @Override
    public boolean isSingleton() {
        return true;
    }

}
```

- 测试类

```java
public class SpringCyclicDependenceTest {

    /**
     * 测试三级缓存循环引用
     */
    @Test
    public void test_cyclic_dependence() {
        ClassPathXmlApplicationContext applicationContext = new ClassPathXmlApplicationContext("classpath:spring-cyclic-dependence.xml");
        A a = applicationContext.getBean(A.class);
        System.out.println("测试结果：" + a.print());
        B b = applicationContext.getBean(B.class);
        System.out.println("测试结果：" + b.print());
    }

}
```

- 测试结果

```java
测试结果：A print b: com.snail.springframework.cyclicDependence.B$$EnhancerByCGLIB$$d03a45b9@37374a5e
测试结果：B print a: com.snail.springframework.cyclicDependence.A$$EnhancerByCGLIB$$c473690e@4671e53b
		B print Face c: proxy face method name: getFace
```

## **总结**

以上面`A`、`B`类使用属性`field`注入循环依赖的例子为例，对整个流程做文字步骤总结如下：

1. 使用`context.getBean(A.class)`，旨在获取容器内的单例A(若A不存在，就会走A这个Bean的创建流程)，显然初次获取A是不存在的，因此走**A的创建之路~**
2. `实例化`A（注意此处仅仅是实例化），并将它放进`缓存`（此时A已经实例化完成，已经可以被引用了）
3. `初始化`A：`@Autowired`依赖注入B（此时需要去容器内获取B）
4. 为了完成依赖注入B，会通过`getBean(B)`去容器内找B。但此时B在容器内不存在，就走向**B的创建之路~**
5. `实例化`B，并将其放入缓存。（此时B也能够被引用了）
6. `初始化`B，`@Autowired`依赖注入A（此时需要去容器内获取A）
7. `此处重要`：初始化B时会调用`getBean(A)`去容器内找到A，上面我们已经说过了此时候因为A已经实例化完成了并且放进了缓存里，所以这个时候去看缓存里是已经存在A的引用了的，所以`getBean(A)`能够正常返回
8. **B初始化成功**（此时已经注入A成功了，已成功持有A的引用了），return（注意此处return相当于是返回最上面的`getBean(B)`这句代码，回到了初始化A的流程中~）。
9. 因为B实例已经成功返回了，因此最终**A也初始化成功**
10. **到此，B持有的已经是初始化完成的A，A持有的也是初始化完成的B，完美~**

<Reward/>
