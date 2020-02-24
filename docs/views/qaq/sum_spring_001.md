---
title: "面试宝典-spring基础篇"
date: 2020-02-24
tags:
- 面试
categories:
- 面试

---

<Boxx/>

## Spring基础

::: details 1. Spring两大核心？

IOC控制反转， AOP面向切面编程

:::

::: details 2. IOC控制反转到底反转了什么？

​	**创建对象的过程，形成对象与对象之间依赖关系的操作**<br/>
​	(Martin: 依赖对象的获得被反转了，本来应该是我们自己new， 现在是通过SpringIOC容器注入)

:::

::: details 3. 什么是AOP？

​	AOP即**面向切面编程**，关注的是`非核心业务的处理`<br/>
​	**用到的地方**：比如日志、网站的访问次数等<br/>
​	**主要目的**:：核心业务和非核心业务之间的解耦<br/>
​	底层使用了**动态代理**模式<br/>
​	**要素**：advice(非核心业务的载体)， pointcut(非核心业务的放置位置)，
​		advisor(建立advice和pointcut之间的联系)

:::

::: details 4. 反转之后的好处？

​	有助于类与类之间的**解耦**

:::

::: details 5. IOC的好处？

​	将对象的创建和属性的赋值完全转交给Spring，
​	从而降低类与类之间的依赖关系，达到松散耦合的目的

:::

::: details 6. ICO的核心？

​	IOC容器之所以叫IOC容器， 是因为其中的IOC指的是`将主动new变成了被动注入`<br/>
​	从此角度出发， IOC的核心是`DI依赖注入`

:::

::: details 7. DI是什么？

​	依赖注入，指的是建立每个对象之间关系的方式，也就是对属性赋值的操作

:::

::: details 8. Bean的属性都有？

​	***id***：(每个IOC容器对象的唯一标识)，<br/>
​	***class***：(当前类对应的类型)，<br/>
​	***scope***：(作用范围)，<br/>
​	***lazy-init***：(是否 延迟加载)，<br/>
​	***factory-method***：(指定返回返回该对象的方法名称)，<br/>
​	***factory-bean***：(指定工厂实例)，<br/>
​	***init-method***：(对象初始化调用的方法)，<br/>
​	***destroy-method***

:::

::: details 9. scope分别有几种情况？如何配置？

- singleton，prototype，request，session，globalSession

- 一般`无状态的类的对象都配置成singleton`，无状态的类一般指像Service和Dao层这样逻辑处理类<br/>`
  有状态的类需要设置成prototype或request`，一般指像Action一样存在多实例， 并且其中数据都不同

:::

::: details 10. Spring创建对象的方式？

1. 构造方法创建(id+class)；
2. 静态工厂创建(class+factory-method)；
3. 实例工厂创建(factory-bean+factory-method)

:::

::: details 11. 完成注入的方式？

1. setter注入 <property ...>
2. 构造方法注入 <constructor-arg ...>

:::

::: details 12. Schema是什么？优势？

- 用来校验xml文件规范的xsd的文件

	1. 基于xml语法
	2. 扩充了数据类型
	3. 支持命名空间
	* schema最重要的能力之一就是对数据类型的支持

:::

::: details 13. 复杂属性如何注入？

- 数组/List/Set <br/>\<property><array/list/set>\<value>value\</value>
- Map <br/> \<map>\<entry key="" value=""/>
- Properties <br/> \<props>\<prop key="">vlaue\</prop>

:::

::: details 14. 常用Spring注解？

@Component， @Repository， @Service， @Controller
	@Autowired， @Qualifier， @Scope，@Value
	@Aspect， @Pointcut， @Before， @After， @AfterReturning， @Around， @AfterThrowing

:::

::: details 15. 接受文件:

​	@RequestParam(value="file") MultipartFile file

:::

::: details 16. 关于日期、时间

- 映射类声明变量前，加入此注解:
  1. **@DatetimeFormat**是将String转换成Date，一般前台给后台传值时用(springmvc用)
  2. 将Date转换成String  一般后台传值给前台时设置响应方式为
     			**@JsonFormat(pattern="yyyy-MM-dd")**
  3. **@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss"，timezone = "GMT+8")**<br/>只争对json响应式的处理(中国为东8区)
  4. **@JsonIgnore** json响应式忽略这个属性
         private Date hiredate;

:::

::: details 17. 使用注解完成IOC的流程？

1. 添加context命名空间以及schemaLocation
2. 配置文件中添加上下文组件扫描<context:component-scan base-package="com"/>
3. 给所有需要放入IOC容器中的组件添加注解@Component/@S../@C../@R../@Scope
4. 给所有需要注入的属性添加注解@Autowired或@Resource

:::

::: details 18. @Resource和@Autowired的区别？

1. **来源不同**<br/>
   **@Autowired**来自Spring类库中，**@Resource**是J2EE官方类库中的
3. **底层匹配机制不同**<br/>
   **@Autowired**优先按照类型进行匹配，如果存在一个接口多个实现类， 再去按照属性名匹配，
   	如果匹配不到，抛出异常NoUniqueBeanDefinitionException，
   	此时，可通过 **Qualifier("对象名")** 指定注入对象<br/>
   **@Resource**优先按照属性名进行匹配，如果匹配不到，再去按照类型进行匹配，
   如果匹配到多个类型，抛出异常NoUniqueBeanDefinitionException
   	此时，可通过 **@Resource(name="对象名")** 指定注入对象

:::

::: details 19. 反射涉及到哪些类？分别对应哪些方法？

- ***Class***：太多， 比如getDeclaredConstructors()， c.newInstance()
- ***Field***： get(obj)，set(obj,value)
- ***Method***： invoke(obj, a.class, b.class, ...)
- ***Constructor***： newInstance(a.class, b.class ...)，setAccessible(true)

:::

::: details 20. 常用设计模式？

​	单例模式， 工厂模式， 观察者模式(监听器)， 装饰者模式(包装流)， 代理模式(AOP)

:::

::: details 21. spring有几种通知(增强)？

1. 前置通知  before
2. 后置通知  after
   			 afterReturnning
3. 环绕通知  aroud
4. 异常通知  throws

:::

::: details 22. 都有哪几种动态代理？

- jdk     依赖接口
- cglib	继承关系

:::