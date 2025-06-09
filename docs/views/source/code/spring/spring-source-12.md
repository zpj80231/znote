---
title: 手写 Spring 12 - 实现 @Autowired,@Qualifier,@Value
date: 2024-01-04
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

不妨先想一下，在 Spring 流程中的哪一步，可以实现通过注解给 bean 注入属性，或者说什么时候或者有哪个切入点可以支持我们修改。

没错，在 bean 生命周期中 doGetBean() -> createBean()，有实例化，属性填充，初始化这么几步。

改造流程肯定是在 `实例化和属性填充之间`，在设置 Bean 属性之前，允许通过 `BeanPostProcessor` 修改属性值。

## 通过注解注入属性

核心：在 bean 实例化之后，设置属性之前，允许通过 BeanPostProcessor 修改属性值。

### **定义一些职责和能力**

1. 修改 InstantiationAwareBeanPostProcessor，添加扩展点postProcessPropertyValues()。凡是实现这个接口方法的，都可以在 bean 实例化之后，设置属性之前，修改属性值。

```java
/**
 * InstantiationAwareBeanPostProcessor 接口的主要作用在于：目标对象的实例化过程中需要处理的事情，包括实例化对象的前后过程以及实例的属性设置
 */
public interface InstantiationAwareBeanPostProcessor extends BeanPostProcessor {

    /**
     * 后置处理属性值
     *
     * @param pvs      一个 bean 的所有字段及值
     * @param bean     bean
     * @param beanName bean名称
     * @return {@link PropertyValues}
     */
    PropertyValues postProcessPropertyValues(PropertyValues pvs, Object bean, String beanName);

    /**
     * 在目标对象实例化之前调用，该方法的返回值类型是Object，我们可以返回任何类型的值。
     * 由于这个时候目标对象还未实例化，所以这个返回值可以用来代替原本该生成的目标对象的实例(比如代理对象)。
     * 如果该方法的返回值代替原本该生成的目标对象，后续只有postProcessAfterInitialization方法会调用，其它方法不再调用；否则按照正常的流程走。
     */
    Object postProcessBeforeInstantiation(Class<?> beanClass, String beanName) throws BeansException;

}
```

2. 相关属性注解

```java
@Target({ElementType.FIELD, ElementType.METHOD, ElementType.CONSTRUCTOR})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Autowired {

}

@Target({ElementType.FIELD, ElementType.METHOD, ElementType.PARAMETER, ElementType.TYPE, ElementType.ANNOTATION_TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited
public @interface Qualifier {

    String value() default "";

}

@Target({ElementType.FIELD, ElementType.METHOD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Value {

    /**
     * The actual value expression: e.g. "${systemProperties.myProp}".
     */
    String value();

}
```

3. StringValueResolver，字符串解析器，实现这个接口的类都注入到容器中，方便解析 @Value 使用。

```java
public interface StringValueResolver {

    /**
     * 解析字符串值
     *
     * @param value 要解析的字段的属性值
     * @return {@link String} 替换后的值
     */
    String resolveStringValue(String value);

}
```

4. 修改接口 ConfigurableBeanFactory，支持向容器中添加StringValueResolver，使容器支持解析属性值。

```java
/**
 * 扩展 BeanFactory 接口，支持设置父级容器、自自定义作用域、添加 Bean 后置处理器、设置 bean 的初始化和销毁回调方法等
 *
 * @author zhangpengjun
 * @date 2023/3/21
 */
public interface ConfigurableBeanFactory extends HierarchicalBeanFactory, SingletonBeanRegistry {

    String SCOPE_SINGLETON = "singleton";
    String SCOPE_PROTOTYPE = "prototype";

    void addBeanPostProcessor(BeanPostProcessor beanPostProcessor);

    /**
     * 为嵌入式值（例如注释属性）添加字符串解析器
     */
    void addEmbeddedValueResolver(StringValueResolver valueResolver);

    /**
     * 解析给定的嵌入式值，例如一个注解属性
     */
    String resolveEmbeddedValue(String value);

}
```



### **具体的实现**

1. 修改 AbstractBeanFactory，使容器具备添加字符串解析器，和解析字符串表达式的能力。

```java
public abstract class AbstractBeanFactory extends FactoryBeanRegistrySupport implements ConfigurableBeanFactory {

    /**
     * 字符串解析器，应用于注解属性值（替换@Value的值）
     */
    private final List<StringValueResolver> embeddedValueResolvers = new ArrayList<>();

    @Override
    public void addEmbeddedValueResolver(StringValueResolver valueResolver) {
        this.embeddedValueResolvers.add(valueResolver);
    }

    @Override
    public String resolveEmbeddedValue(String value) {
        String result = value;
        for (StringValueResolver resolver : this.embeddedValueResolvers) {
            result = resolver.resolveStringValue(result);
        }
        return result;
    }
}
```

2. PropertyPlaceholderConfigurer，StringValueResolver 的实现，支持属性值的解析。并向容器中添加字符串解析器，供容器具备解析 @Value 的能力。

```java
/**
 * bean对象 占位符处理 <br/>
 * 从给定的配置文件加载占位符的 key value。
 * 在 bean 实例化之前，替换 xml 配置的属性表达式。
 * 在 bean 实例化之后，属性赋值之前，替换 @Value 配置的属性表达式。
 *
 * @author zhangpengjun
 * @date 2023/9/13
 */
public class PropertyPlaceholderConfigurer implements BeanFactoryPostProcessor {

    /**
     * 默认占位符前缀
     */
    public static final String DEFAULT_PLACEHOLDER_PREFIX = "${";

    /**
     * 默认占位符后缀
     */
    public static final String DEFAULT_PLACEHOLDER_SUFFIX = "}";

    private String location;

    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) {
        // 加载属性文件
        DefaultResourceLoader resourceLoader = new DefaultResourceLoader();
        Properties properties = new Properties();
        try {
            properties.load(resourceLoader.getResource(location).getInputStream());
        } catch (IOException e) {
            throw new BeansException("Could not load properties", e);
        }

        // 遍历所有bean的属性值，符合规则的替换
        String[] beanDefinitionNames = beanFactory.getBeanDefinitionNames();
        for (String beanName : beanDefinitionNames) {
            BeanDefinition beanDefinition = beanFactory.getBeanDefinition(beanName);
            PropertyValues propertyValues = beanDefinition.getPropertyValues();
            for (PropertyValue propertyValue : propertyValues.getPropertyValues()) {
                Object value = propertyValue.getValue();
                if (!(value instanceof String)) {
                    continue;
                }
                String strValue = (String) value;
                strValue = resolvePlaceholder(strValue, properties);
                propertyValues.addPropertyValue(new PropertyValue(propertyValue.getName(), strValue));
            }
        }

        // 向容器中添加字符串解析器，供解析@Value使用
        StringValueResolver valueResolver = new PlaceholderResolvingStringValueResolver(properties);
        beanFactory.addEmbeddedValueResolver(valueResolver);
    }

    private static String resolvePlaceholder(String strValue, Properties properties) {
        StringBuilder builder = new StringBuilder(strValue);
        int startIdx = strValue.indexOf(DEFAULT_PLACEHOLDER_PREFIX);
        int stopIdx = strValue.indexOf(DEFAULT_PLACEHOLDER_SUFFIX);
        if (startIdx != -1 && stopIdx != -1 && startIdx < stopIdx) {
            String key = strValue.substring(startIdx + 2, stopIdx);
            String val = properties.getProperty(key);
            builder.replace(startIdx, stopIdx + 1, val);
        }
        return builder.toString();
    }

    public void setLocation(String location) {
        this.location = location;
    }

    private static class PlaceholderResolvingStringValueResolver implements StringValueResolver {

        private final Properties properties;

        public PlaceholderResolvingStringValueResolver(Properties properties) {
            this.properties = properties;
        }

        @Override
        public String resolveStringValue(String value) {
            return resolvePlaceholder(value, properties);
        }

    }
}
```

3. AutowiredAnnotationBeanPostProcessor，InstantiationAwareBeanPostProcessor#postProcessPropertyValues() 的实现。处理 @Autowired @Value 等注解。

```java
/**
 * Spring 注解驱动的核心组件之一，处理的Bean 的依赖注入，处理的相关的注解有：@Autowired @Value
 *
 * @author zhangpengjun
 * @date 2023/9/15
 */
public class AutowiredAnnotationBeanPostProcessor implements InstantiationAwareBeanPostProcessor, BeanFactoryAware {

    private ConfigurableListableBeanFactory beanFactory;

    @Override
    public void setBeanFactory(BeanFactory beanFactory) {
        this.beanFactory = (ConfigurableListableBeanFactory) beanFactory;
    }

    @Override
    public PropertyValues postProcessPropertyValues(PropertyValues pvs, Object bean, String beanName) {
        Class<?> clazz = bean.getClass();
        clazz = ClassUtils.isCglibProxyClass(clazz) ? clazz.getSuperclass() : clazz;

        // 处理 @Value 注解
        Field[] declaredFields = clazz.getDeclaredFields();
        for (Field field : declaredFields) {
            Value valueAnnotation = field.getDeclaredAnnotation(Value.class);
            if (valueAnnotation != null) {
                String value = valueAnnotation.value();
                value = beanFactory.resolveEmbeddedValue(value);
                BeanUtil.setFieldValue(bean, field.getName(), value);
            }
        }

        // 处理 @Autowired 注解
        for (Field field : declaredFields) {
            Autowired autowiredAnnotation = field.getAnnotation(Autowired.class);
            if (autowiredAnnotation != null) {
                Class<?> fieldType = field.getType();
                Object dependentBean = null;
                Qualifier qualifierAnnotation = field.getDeclaredAnnotation(Qualifier.class);
                // 优先按照 @Qualifier 注入，再按照类型注入
                if (qualifierAnnotation != null) {
                    String dependentBeanName = qualifierAnnotation.value();
                    dependentBean = beanFactory.getBean(dependentBeanName, fieldType);
                } else {
                    dependentBean = beanFactory.getBean(fieldType);
                }
                BeanUtil.setFieldValue(bean, field.getName(), dependentBean);
            }
        }

        return pvs;
    }

    @Override
    public Object postProcessBeforeInitialization(Object bean, String beanName) {
        return bean;
    }

    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) {
        return bean;
    }

    @Override
    public Object postProcessBeforeInstantiation(Class<?> beanClass, String beanName) throws BeansException {
        return null;
    }

}
```


### **将实现加入原有的逻辑中**

- 修改 AbstractAutowireCapableBeanFactory#createBean() 创建 bean 的过程，将逻辑加入原先实例化后，属性赋值之前。

```java
public abstract class AbstractAutowireCapableBeanFactory extends AbstractBeanFactory implements AutowireCapableBeanFactory {

    @Override
    protected Object createBean(String beanName, BeanDefinition beanDefinition, Object[] args) throws BeansException {
        Object bean = null;
        try {
            // 判断是否返回 代理 Bean 对象
            bean = resolveBeforeInstantiation(beanName, beanDefinition);
            if (bean != null) {
                return bean;
            }
            // 实例化
            bean = createBeanInstance(beanName, beanDefinition, args);
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
            addSingleton(beanName, bean);
        }
        return bean;
    }

    protected void applyBeanPostProcessorsBeforeApplyingPropertyValues(String beanName, Object bean, BeanDefinition beanDefinition) {
        for (BeanPostProcessor beanPostProcessor : getBeanPostProcessors()) {
            if (beanPostProcessor instanceof InstantiationAwareBeanPostProcessor) {
                PropertyValues pvs = ((InstantiationAwareBeanPostProcessor) beanPostProcessor)
                        .postProcessPropertyValues(beanDefinition.getPropertyValues(), bean, beanName);
                if (pvs != null) {
                    for (PropertyValue propertyValue : pvs.getPropertyValues()) {
                        beanDefinition.getPropertyValues().addPropertyValue(propertyValue);
                    }
                }
            }
        }
    }
}
```

### **测试**

- xml 准备，spring-component-scan-autowired-value.xml。

```xml
<?xml version="1.0" encoding="utf-8" ?>

<beans xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/context">

    <!--  ↓↓ spring @Component 测试 ↓↓ -->

    <!--  指定包扫描路径  -->
    <context:component-scan base-package="com.snail.springframework.beans.factory.bean"/>

    <!--  配置属性表达式解析器  -->
    <bean class="com.snail.springframework.beans.factory.PropertyPlaceholderConfigurer">
        <property name="location" value="classpath:spring-component-property.properties"></property>
    </bean>

    <bean class="com.snail.springframework.beans.factory.annotation.AutowiredAnnotationBeanPostProcessor"/>

</beans>
```

- 配置文件，spring-component-property.properties。

```properties
catServiceNameFromPropertyPlaceholder=cat001
```

- 提前准备，指定包下带注解的类。

  CatService


```java
package com.snail.springframework.beans.factory.bean;

import com.snail.springframework.beans.factory.annotation.Autowired;
import com.snail.springframework.beans.factory.annotation.Value;
import com.snail.springframework.stereotype.Component;

import java.util.Random;

@Component("catServiceTest")
public class CatService implements Animal {

    @Value("${catServiceNameFromPropertyPlaceholder}")
    private String catServiceNameFromPropertyPlaceholder;

    @Autowired
    private CatDao catDao;

    @Override
    public String getAnimalName() {
        String calls = catDao.queryCalls(new Random().nextInt(4));
        return catServiceNameFromPropertyPlaceholder + " --> " + calls;
    }

}
```

  CatDao

```java
package com.snail.springframework.beans.factory.bean;

import com.snail.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class CatDao {

    private static Map<Integer, String> hashMap = new HashMap<>();

    static {
        hashMap.put(1, "喵！");
        hashMap.put(2, "喵！喵！");
        hashMap.put(3, "喵！喵！喵！");
    }

    public String queryCalls(int number) {
        return hashMap.get(number);
    }

}
```

- 测试类

```java
public class SpringComponentPropertyTest {

    /**
     * 测试从指定包下扫描 @Component 注解
     * 注入 @Autowired 和 @Value
     */
    @Test
    public void test_scan_component_autowired_value() {
        ClassPathXmlApplicationContext applicationContext = new ClassPathXmlApplicationContext("classpath:spring-component-scan-autowired-value.xml");
        CatService catService = applicationContext.getBean("catServiceTest", CatService.class);
        for (int i = 0; i < 3; i++) {
            System.out.println("测试结果：" + catService.getAnimalName());
        }
    }

}
```

- 测试结果

```java
// 测试结果：cat001 --> 喵！
// 测试结果：cat001 --> 喵！喵！喵！
// 测试结果：cat001 --> 喵！喵！喵！
```

## **总结**

通过向容器中添加属性表达式解析器，使容器具备解析 @Value 的能力。

修改 bean 的创建过程，在 bean 实例化后，属性赋值前，通过 InstantiationAwareBeanPostProcessor#postProcessPropertyValues() 修改 bean 的属性值。

AutowiredAnnotationBeanPostProcessor 实现了 InstantiationAwareBeanPostProcessor，真正处理 @Autowired、@Value等注解。

<Reward/>
