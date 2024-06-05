---
title: 手写 Spring 15 - 数据类型转换
date: 2024-06-05
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

数据类型转接：在配置一个 Bean 时，配置项是  `<property name="date" value="2000-10-10 10:10:10"></property>`，而 `date`  字段类型是 `Java.util.Date` ，这时就需要类型转换器来为完成类型的自动转换了。

## 数据类型转换

使容器具备类型转换的能力：在 `refresh()` 初始化容器上下文的时候，在最后一步 `finishBeanFactoryInitialization(beanFactory);` 完成 bean 工厂初始化时，也将转换器服务器 `ConversionService` 注册到容器中，在 getBean() 时使容器具有类型转换的能力。

### **定义一些职责和能力**

1. Converter，类型转换处理器

```java
public interface Converter<S, T> {

    /**
     * 将类型为 {@code S} 的源对象转换为目标类型 {@code T}
     *
     * @param source 来源
     * @return {@link T}
     */
    T convert(S source);

}
```

2. ConverterFactory，类型转换工厂

```java
public interface ConverterFactory<S, R> {

    /**
     * 获取指定转换器，转换器可以把 S 转换为目标类型 T，其中 T 也是 R 的一个实例。
     *
     * @param targetType 目标类型
     * @return {@link Converter}<{@link S}, {@link T}>
     */
    <T extends R> Converter<S, T> getConverter(Class<T> targetType);

}
```

3. ConverterRegistry，类型转换器注册器

```java
public interface ConverterRegistry {

    /**
     * 添加转换器
     *
     * @param converter 转换器
     */
    void addConverter(Converter<?, ?> converter);

    /**
     * 添加转换器
     *
     * @param converter 转换器
     */
    void addConverter(GenericConverter converter);

    /**
     * 添加转换器工厂
     *
     * @param converterFactory 转换器工厂
     */
    void addConverterFactory(ConverterFactory<?, ?> converterFactory);

}
```

4. GenericConverter，通用转换器接口

```java
public interface GenericConverter {

    /**
     * 获取 转换类型对
     *
     * @return {@link Set}<{@link ConvertiblePair}>
     */
    Set<ConvertiblePair> getConvertibleTypes();

    /**
     * 转换
     *
     * @param source     来源
     * @param sourceType 源类型
     * @param targetType 目标类型
     * @return {@link Object}
     */
    Object convert(Object source, Class<?> sourceType, Class<?> targetType);


    final class ConvertiblePair {
        private final Class<?> sourceType;
        private final Class<?> targetType;

        public ConvertiblePair(Class<?> sourceType, Class<?> targetType) {
            this.sourceType = sourceType;
            this.targetType = targetType;
        }

        public Class<?> getSourceType() {
            return sourceType;
        }

        public Class<?> getTargetType() {
            return targetType;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            ConvertiblePair that = (ConvertiblePair) o;
            return Objects.equals(sourceType, that.sourceType) && Objects.equals(targetType, that.targetType);
        }

        @Override
        public int hashCode() {
            return Objects.hash(sourceType, targetType);
        }
    }

}
```

5. ConversionService，类型转换服务接口

```java
public interface ConversionService {

    /**
     * 是否可以转换
     *
     * @param sourceType 源类型
     * @param targetType 目标类型
     * @return boolean
     */
    boolean canConvert(@Nullable Class<?> sourceType, Class<?> targetType);

    /**
     * 转换
     *
     * @param source     源
     * @param targetType 目标类型
     * @return {@link T}
     */
    <T> T convert(Object source, Class<T> targetType);

}
```

6. 修改 ConfigurableBeanFactory 接口（AbstractBeanFactory为实现），使容器具备类型转换的能力。

```java
public interface ConfigurableBeanFactory extends HierarchicalBeanFactory, SingletonBeanRegistry {

    /**
     * 设置类型转换服务
     */
    void setConversionService(ConversionService conversionService);

    /**
     * 获取类型转换服务
     */
    @Nullable
    ConversionService getConversionService();

}
```




### **具体的实现**

1. StringToNumberConverterFactory，String 转 数字。

```java
public class StringToNumberConverterFactory implements ConverterFactory<String, Number> {


    @Override
    public <T extends Number> Converter<String, T> getConverter(Class<T> targetType) {
        return new StringToNumber<>(targetType);
    }

    private static final class StringToNumber<T extends Number> implements Converter<String, T> {

        private final Class<T> targetType;

        public StringToNumber(Class<T> targetType) {
            this.targetType = targetType;
        }

        @Override
        @Nullable
        public T convert(String source) {
            if (source.isEmpty()) {
                return null;
            }
            return Convert.convert(targetType, source);
        }
    }

}
```

2. GenericConversionService，通用转换服务

```java
public class GenericConversionService implements ConversionService, ConverterRegistry {

    private Map<GenericConverter.ConvertiblePair, GenericConverter> converters = new HashMap<>();

    @Override
    public boolean canConvert(Class<?> sourceType, Class<?> targetType) {
        GenericConverter converter = getConverter(sourceType, targetType);
        return converter != null;
    }

    @Override
    public <T> T convert(Object source, Class<T> targetType) {
        Class<?> sourceType = source.getClass();
        GenericConverter converter = getConverter(sourceType, targetType);
        return (T) converter.convert(source, sourceType, targetType);
    }

    @Override
    public void addConverter(Converter<?, ?> converter) {
        GenericConverter.ConvertiblePair typeInfo = getRequiredTypeInfo(converter);
        ConverterAdapter converterAdapter = new ConverterAdapter(typeInfo, converter);
        for (GenericConverter.ConvertiblePair convertibleType : converterAdapter.getConvertibleTypes()) {
            converters.put(convertibleType, converterAdapter);
        }
    }

    @Override
    public void addConverter(GenericConverter converter) {
        for (GenericConverter.ConvertiblePair convertibleType : converter.getConvertibleTypes()) {
            converters.put(convertibleType, converter);
        }
    }

    @Override
    public void addConverterFactory(ConverterFactory<?, ?> converterFactory) {
        GenericConverter.ConvertiblePair typeInfo = getRequiredTypeInfo(converterFactory);
        ConverterFactoryAdapter converterFactoryAdapter = new ConverterFactoryAdapter(typeInfo, converterFactory);
        for (GenericConverter.ConvertiblePair convertibleType : converterFactoryAdapter.getConvertibleTypes()) {
            converters.put(convertibleType, converterFactoryAdapter);
        }
    }

    /**
     * 这段代码的作用是获取一个对象的泛型参数类型信息，并返回一个 ConvertPair 对象。
     * <p>
     * 代码步骤如下：
     * 1. 获取对象的所有泛型接口类型。
     * 2. 将第一个泛型接口类型转换为ParameterizedType类型。
     * 3. 获取ParameterizedType的实际类型参数。
     * 4. 将第一个实际类型参数转换为Class类型，作为源类型。
     * 5. 将第二个实际类型参数转换为Class类型，作为目标类型。
     * 6. 创建一个ConvertPair对象，使用源类型和目标类型作为参数。
     * 7. 返回ConvertPair对象。
     *
     * @param object 对象
     * @return {@link GenericConverter.ConvertiblePair}
     */
    private GenericConverter.ConvertiblePair getRequiredTypeInfo(Object object) {
        Type[] types = object.getClass().getGenericInterfaces();
        ParameterizedType parameterized = (ParameterizedType) types[0];
        Type[] actualTypeArguments = parameterized.getActualTypeArguments();
        Class sourceType = (Class) actualTypeArguments[0];
        Class targetType = (Class) actualTypeArguments[1];
        return new GenericConverter.ConvertiblePair(sourceType, targetType);
    }

    protected GenericConverter getConverter(Class<?> sourceType, Class<?> targetType) {
        List<Class<?>> sourceCandidates = getClassHierarchy(sourceType);
        List<Class<?>> targetCandidates = getClassHierarchy(targetType);
        for (Class<?> sourceCandidate : sourceCandidates) {
            for (Class<?> targetCandidate : targetCandidates) {
                GenericConverter.ConvertiblePair convertiblePair = new GenericConverter.ConvertiblePair(sourceCandidate, targetCandidate);
                GenericConverter converter = converters.get(convertiblePair);
                if (converter != null) {
                    return converter;
                }
            }
        }
        return null;
    }

    private List<Class<?>> getClassHierarchy(Class<?> clazz) {
        List<Class<?>> hierarchy = new ArrayList<>();
        while (clazz != null) {
            hierarchy.add(clazz);
            clazz = clazz.getSuperclass();
        }
        return hierarchy;
    }

    private static final class ConverterAdapter implements GenericConverter {

        private final ConvertiblePair typeInfo;

        private final Converter<Object, Object> converter;

        public ConverterAdapter(ConvertiblePair typeInfo, Converter<?, ?> converter) {
            this.typeInfo = typeInfo;
            this.converter = (Converter<Object, Object>) converter;
        }

        @Override
        public Set<ConvertiblePair> getConvertibleTypes() {
            return Collections.singleton(typeInfo);
        }

        @Override
        public Object convert(Object source, Class sourceType, Class targetType) {
            return converter.convert(source);
        }

    }

    private static final class ConverterFactoryAdapter implements GenericConverter {

        private final ConvertiblePair typeInfo;

        private final ConverterFactory<Object, Object> converterFactory;

        public ConverterFactoryAdapter(ConvertiblePair typeInfo, ConverterFactory<?, ?> converterFactory) {
            this.typeInfo = typeInfo;
            this.converterFactory = (ConverterFactory<Object, Object>) converterFactory;
        }

        @Override
        public Set<ConvertiblePair> getConvertibleTypes() {
            return Collections.singleton(typeInfo);
        }

        @Override
        public Object convert(Object source, Class sourceType, Class targetType) {
            return converterFactory.getConverter(targetType).convert(source);
        }
    }

}
```

3. DefaultConversionService，在 GenericConversionService 的基础上，支持添加各类型转换工厂。

```java
public class DefaultConversionService extends GenericConversionService {

    public DefaultConversionService() {
        addDefaultConverters(this);
    }

    public static void addDefaultConverters(ConverterRegistry converterRegistry) {
        // 添加各类型转换工厂
        converterRegistry.addConverterFactory(new StringToNumberConverterFactory());
    }

}
```




### **将实现加入原有的逻辑中**

- 修改容器上下文的生命周期 `AbstractApplicationContext#refresh()` 中加入 `类型转接器` 的注入。

```java
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

    // 5. 提前实例化所有的单例 Bean + 10. 设置类型转换器
    finishBeanFactoryInitialization(beanFactory);

    // 9. 所有工作已就绪，发布容器刷新完成事件
    finishRefresh();
}

protected void finishBeanFactoryInitialization(ConfigurableListableBeanFactory beanFactory) {
    // 10. 设置类型转换器服务器
    if (beanFactory.containsBean("conversionService")) {
        Object conversionService = getBean("conversionService");
        if (conversionService instanceof ConversionService) {
            beanFactory.setConversionService((ConversionService) conversionService);
        }
    }

    // 5. 提前实例化所有的单例 Bean
    beanFactory.preInstantiateSingletons();
}
```

2. 创建 `conversionService`，这样上下文加载到这个 bean 就具备了类型转换的能力。

```java
public class ConversionServiceFactoryBean implements FactoryBean<ConversionService>, InitializingBean {

    @Nullable
    private Set<?> converters;

    @Nullable
    private GenericConversionService conversionService;

    @Override
    public ConversionService getObject() {
        return conversionService;
    }

    @Override
    public Class<?> getObjectType() {
        return conversionService.getClass();
    }

    @Override
    public boolean isSingleton() {
        return true;
    }

    @Override
    public void afterPropertiedSet() {
        this.conversionService = new DefaultConversionService();
        registerConverters(converters, conversionService);
    }

    private void registerConverters(Set<?> converters, ConverterRegistry registry) {
        if (converters == null) {
            return;
        }
        for (Object converter : converters) {
            if (converter instanceof GenericConverter) {
                registry.addConverter((GenericConverter) converter);
            } else if (converter instanceof Converter<?, ?>) {
                registry.addConverter((Converter<?, ?>) converter);
            } else if (converter instanceof ConverterFactory<?, ?>) {
                registry.addConverterFactory((ConverterFactory<?, ?>) converter);
            } else {
                throw new IllegalArgumentException("Each converter object must implement one of the " +
                        "Converter, ConverterFactory, or GenericConverter interfaces");
            }
        }
    }

    public void setConverters(Set<?> converters) {
        this.converters = converters;
    }

}
```

3. 在 getBean() 给属性赋值时，利用类型转换器，处理属性类型转换。

```java
// xml 解析属性值的类型转换，AbstractAutowireCapableBeanFactory#applyPropertyValues()
protected void applyPropertyValues(String beanName, Object bean, BeanDefinition beanDefinition) {
    try {
        PropertyValues propertyValues = beanDefinition.getPropertyValues();
        for (PropertyValue propertyValue : propertyValues.getPropertyValues()) {
            String name = propertyValue.getName();
            Object value = propertyValue.getValue();
            // A 依赖 B, B 依赖 C, 循环调用实例化
            if (value instanceof BeanReference) {
                BeanReference beanReference = (BeanReference) value;
                value = getBean(beanReference.getBeanName());
            } else { // 类型转换
                Class<?> sourceType = value.getClass();
                Class<?> targetType = (Class<?>) TypeUtil.getFieldType(bean.getClass(), name);
                ConversionService conversionService = getConversionService();
                if (conversionService != null) {
                    if (conversionService.canConvert(sourceType, targetType)) {
                        value = conversionService.convert(value, targetType);
                    }
                }
            }
            // 属性填充
            BeanUtil.setFieldValue(bean, name, value);
        }
    } catch (Exception e) {
        throw new BeansException("Failed to bean applyPropertyValues", e);
    }
}

// @Value 解析属性值的类型转换，AutowiredAnnotationBeanPostProcessor#postProcessPropertyValues()
public PropertyValues postProcessPropertyValues(PropertyValues pvs, Object bean, String beanName) {
    Class<?> clazz = bean.getClass();
    clazz = ClassUtils.isCglibProxyClass(clazz) ? clazz.getSuperclass() : clazz;

    // 处理 @Value 注解
    Field[] declaredFields = clazz.getDeclaredFields();
    for (Field field : declaredFields) {
        Value valueAnnotation = field.getDeclaredAnnotation(Value.class);
        if (valueAnnotation != null) {
            Object value = valueAnnotation.value();
            value = beanFactory.resolveEmbeddedValue((String) value);

            // 类型转换
            Class<?> sourceType = value.getClass();
            Class<?> targetType = (Class<?>) TypeUtil.getType(field);
            ConversionService conversionService = beanFactory.getConversionService();
            if (conversionService != null) {
                if (conversionService.canConvert(sourceType, targetType)) {
                    value = conversionService.convert(value, targetType);
                }
            }

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
```



### **测试**

- xml 准备，spring-field-convert.xml。

```xml
<?xml version="1.0" encoding="utf-8" ?>

<beans>
    <!--  目标类  -->
    <bean class="com.snail.springframework.convert.FieldConvertPO">
        <property name="name" value="FieldConvertPOName"></property>
        <property name="date" value="2000-10-10 10:10:10"></property>
    </bean>

    <bean id="converters" class="com.snail.springframework.convert.ConvertersFactoryBean"></bean>

    <bean class="com.snail.springframework.context.support.ConversionServiceFactoryBean">
        <property name="converters" ref="converters"></property>
    </bean>
</beans>

```



- 提前准备，实体类 FieldConvertPO，StringToDateConverter，StringToNumberConverter，ConvertersFactoryBean


```java
public class FieldConvertPO {

    private String name;

    private Date date;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }

    @Override
    public String toString() {
        return "FieldConvertPO{" +
                "name='" + name + '\'' +
                ", date=" + date +
                '}';
    }
}
```

StringToDateConverter

```java
public class StringToDateConverter implements Converter<String, Date> {

    @Override
    public Date convert(String source) {
        return DateUtil.parse(source);
    }

}
```

StringToNumberConverter

```java
public class StringToNumberConverter implements Converter<String, Number> {

    @Override
    public Number convert(String source) {
        return Convert.convert(Number.class, source);
    }

}
```

ConvertersFactoryBean

```java
public class ConvertersFactoryBean implements FactoryBean<Set<?>> {

    @Override
    public Set<?> getObject() {
        HashSet<Object> converts = new HashSet<>();
        StringToDateConverter stringToDateConverter = new StringToDateConverter();
        converts.add(stringToDateConverter);
        return converts;
    }

    @Override
    public Class<?> getObjectType() {
        return null;
    }

    @Override
    public boolean isSingleton() {
        return true;
    }
}
```

- 测试类

```java
public class SpringFieldConvertTest {

    /**
     * 测试三级缓存循环引用
     */
    @Test
    public void test_field_convert() {
        ClassPathXmlApplicationContext applicationContext = new ClassPathXmlApplicationContext("classpath:spring-field-convert.xml");
        FieldConvertPO fieldConvertPO = applicationContext.getBean(FieldConvertPO.class);
        System.out.println("测试结果：" + fieldConvertPO);
        // 测试结果：FieldConvertPO{name='FieldConvertPOName', date=Tue Oct 10 10:10:10 CST 2000}
    }

    @Test
    public void test_StringToNumberConverter() {
        StringToNumberConverter stringToNumberConverter = new StringToNumberConverter();
        Number n1 = stringToNumberConverter.convert("123");
        System.out.println("测试结果：" + n1);
        Number n2 = stringToNumberConverter.convert("123.12");
        System.out.println("测试结果：" + n2);
        // 测试结果：123
        // 测试结果：123.12
    }

    @Test
    public void test_StringToNumberConverterFactory() {
        StringToNumberConverterFactory converterFactory = new StringToNumberConverterFactory();
        Converter<String, Integer> integerConverter = converterFactory.getConverter(Integer.class);
        Number n1 = integerConverter.convert("123.45");
        System.out.println("测试结果：" + n1);
        Converter<String, Long> longConverter = converterFactory.getConverter(Long.class);
        Number n2 = longConverter.convert("123.12");
        System.out.println("测试结果：" + n2);
        Converter<String, Double> doubleConverter = converterFactory.getConverter(Double.class);
        Number n3 = doubleConverter.convert("123.78");
        System.out.println("测试结果：" + n3);
        // 测试结果：123
        // 测试结果：123
        // 测试结果：123.78
    }

}
```

- 测试结果

```java
如上
```

## **总结**

思考或借鉴：如何把一个转换操作抽象为接口适配、工厂模型等方式，还是很值得借鉴的。

<Reward/>
