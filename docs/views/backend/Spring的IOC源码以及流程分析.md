---
title: Spring的 IOC 源码以及流程分析
date: 2022-04-02
tags:
  - 源码分析
  - Java
categories:
  - 后端 Back-end
isShowComments: false
---

<Boxx/>

<Toc/>

IOC的流程分析，深入理解具体的接口和类，内容包括ApplicationContext，BeanDefinitionReader，BeanFactory,BeanFactoryPostProcessor,FactoryBean,BeanPostProcessor,Environment等。

<!-- more -->

[[toc]]

## 一 前言

本文章的主要内容：

（1）反射，反射是框架设计的灵魂，必须会的。

（2）设计模式，框架里面体现了很多设计模式，比如单例模式，观察者模式，工厂模式等

（3）IOC的流程分析，spring源码之所以难，是因为里面的接口和类真的很多，可以将其中的核心接口和类了解清楚流程，并深入看一下其中的内容。想全部的掌握spring源码很难，并且没有那么大的必要，它已经封装好了，封装就是为了让你使用的。所以，我们只要把它的核心源码弄清楚就可以了。

（4）深入理解具体的接口和类，内容包括ApplicationContext，BeanDefinitionReader，BeanFactory,BeanFactoryPostProcessor,FactoryBean,BeanPostProcessor,Environment等。

## 二 反射基础

反射基础的话我为大家找了一篇清晰易懂的文章，这不是本文章的重点，请参考：

[传送门](https://blog.csdn.net/sinat_38259539/article/details/71799078?utm_medium=distribute.pc_relevant.none-task-blog-BlogCommendFromBaidu-4&depth_1-utm_source=distribute.pc_relevant.none-task-blog-BlogCommendFromBaidu-4)

## 三 设计模式

设计模式的话，重点看其中的单例，观察者，工厂即可，参考：

[传送门](https://liteyu.blog.csdn.net/article/details/105754312)

## 四 IOC流程分析

### 4.1 IOC流程图

![](/znote/img/backend/spring-ioc流程.jpg)

百度找的马士兵教育的流程图，侵删。

### 4.2 IOC流程图讲解

（1）从XML，配置类，annotation中读取响应的配置信息。

（2）如果想要对配置的信息进行人为的修改，可以采用BeanFactoryProcessor

（3）然后创建对应的BeanFactory，如果这个时候扩展的话，就可以利用FactoryBean，它是用来扩展的。

（4）实例化之前还可以利用BeanPostProcessor进行扩展

（5）利用反射进行实例化的过程。

（6）如果想要在容器的不同阶段做不同的事情，可以利用观察者模式，也就是监听器进行处理。

（7）其中的Environment也是一个重要的类，获取一些环境的属性。

先在脑海中有这样一张大概的流程图，然后再去看相应的源码部分抠细节。

## 五 核心类分析

以下类的内容都是双击shift查找得到的源码，由于源码过长，我真粘贴其中重要的部分进行分析。

### 5.0 ContextLoaderListener与它的父类ContextLoader

容器构建启动入口

容器构建启动的入口有多种多样，这边以常用的 web.xml 配置的方式来说。

首先，我们会在 web.xml 中配置 ContextLoaderListener 监听器，当 Tomcat 启动时，会触发 ContextLoaderListener 的 contextInitialized 方法，从而开始 IoC 的构建流程。

另一个常用的参数是 contextConfigLocation，用于指定 Spring 配置文件的路径。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app version="2.5" xmlns="Java EE: XML Schemas for Java EE Deployment Descriptors" 
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="Java EE: XML Schemas for Java EE Deployment Descriptors
         http://java.sun.com/xml/ns/javaee/web-app_2_5.xsd">
    <display-name>open-joonwhee-service WAR</display-name>
 
    <context-param>
        <param-name>contextConfigLocation</param-name>
        <param-value>
            classpath*:config/spring/appcontext-*.xml
        </param-value>
    </context-param>
 
    <listener>
        <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
    </listener>
</web-app>
```



ContextLoaderListener 是 Spring 的入口

并且的它的父类ContextLoader存在这样一个方法，可以实现扩功能先简单知道一下

refresh（）方法是核心，并且在它之前也需要做一些准备

请参考：https://blog.csdn.net/v123411739/article/details/86555733

```java
protected void customizeContext(ServletContext sc, ConfigurableWebApplicationContext wac) {
	List<Class<ApplicationContextInitializer<ConfigurableApplicationContext>>> initializerClasses =
			determineContextInitializerClasses(sc);
 
	for (Class<ApplicationContextInitializer<ConfigurableApplicationContext>> initializerClass : initializerClasses) {
		Class<?> initializerContextClass =
				GenericTypeResolver.resolveTypeArgument(initializerClass, ApplicationContextInitializer.class);
		if (initializerContextClass != null && !initializerContextClass.isInstance(wac)) {
			throw new ApplicationContextException(String.format(
					"Could not apply context initializer [%s] since its generic parameter [%s] " +
					"is not assignable from the type of application context used by this " +
					"context loader: [%s]", initializerClass.getName(), initializerContextClass.getName(),
					wac.getClass().getName()));
		}
		this.contextInitializers.add(BeanUtils.instantiateClass(initializerClass));
	}
 
	AnnotationAwareOrderComparator.sort(this.contextInitializers);
	for (ApplicationContextInitializer<ConfigurableApplicationContext> initializer : this.contextInitializers) {
		initializer.initialize(wac);
	}
}
```
### 5.1 classPathXmlApplicationContext

从这个类的注释我提取出了这样两句话

taking the context definition files from the class path

loading the definitions from the given XML files

 

意思就是从class path下提取全局的配置文件，加载给定的XML文件，也就知道了这个类大概就是加载一些配置的。

然后发现其中有两个构造方法中有refresh方法，那么这个refresh方法是干什么的呢？其实这是一个非常重要的方法，它将整个IOC的过程进行了一个串联，最关键的部分。

![img](https://img-blog.csdnimg.cn/20200501095633744.png)



### 5.2 AbstractApplicationContext

上面提到了refresh方法，右键这个方法，goto，实现方法，就会到达这个重要的类，这是一个核心类，将所有的IOC过程进行了一个串联，那下面我们就对这个类的refresh方法进行一个详细的分析，依照四中给的图。然后我们将对其中的每一个方法进行具体的源码分析，深入每个方法之中。

其中最重要的几个方法：

```java
ConfigurableListableBeanFactory beanFactory = obtainFreshBeanFactory();
```


```java
invokeBeanFactoryPostProcessors(beanFactory);
```

```java
registerBeanPostProcessors(beanFactory);
```

```java
finishBeanFactoryInitialization(beanFactory);
```

然后我们将在后面的小结依次讲解各个方法。

```java
public void refresh() throws BeansException, IllegalStateException {
	synchronized (this.startupShutdownMonitor) {
        // Prepare this context for refreshing.
        prepareRefresh();
        // Tell the subclass to refresh the internal bean factory.
		ConfigurableListableBeanFactory beanFactory = obtainFreshBeanFactory();
 
		// Prepare the bean factory for use in this context.
		prepareBeanFactory(beanFactory);
 
		try {
			// Allows post-processing of the bean factory in context subclasses.
			postProcessBeanFactory(beanFactory);
 
			// Invoke factory processors registered as beans in the context.
			invokeBeanFactoryPostProcessors(beanFactory);
 
			// Register bean processors that intercept bean creation.
			registerBeanPostProcessors(beanFactory);
 
			// Initialize message source for this context.
			initMessageSource();
 
			// Initialize event multicaster for this context.
			initApplicationEventMulticaster();
 
			// Initialize other special beans in specific context subclasses.
			onRefresh();
 
			// Check for listener beans and register them.
			registerListeners();
 
			// Instantiate all remaining (non-lazy-init) singletons.
			finishBeanFactoryInitialization(beanFactory);
 
			// Last step: publish corresponding event.
			finishRefresh();
		}
 
		catch (BeansException ex) {
			if (logger.isWarnEnabled()) {
				logger.warn("Exception encountered during context initialization - " +
						"cancelling refresh attempt: " + ex);
			}
 
			// Destroy already created singletons to avoid dangling resources.
			destroyBeans();
 
			// Reset 'active' flag.
			cancelRefresh(ex);
 
			// Propagate exception to caller.
			throw ex;
		}
 
		finally {
			// Reset common introspection caches in Spring's core, since we
			// might not ever need metadata for singleton beans anymore...
			resetCommonCaches();
		}
	}
}
```
### 5.3 prepareRefresh()

这个方法还是比较简单的，也就是做了一个时间戳，日志，环境校验，初始化监听器容器，初始化ApplicationEvents容器

```java
protected void prepareRefresh() {
	// Switch to active.
        //前面这些就是记录以下启动的时间
	this.startupDate = System.currentTimeMillis();
	this.closed.set(false);
	this.active.set(true);
		//进行一些日志的设置
	if (logger.isDebugEnabled()) {
		if (logger.isTraceEnabled()) {
            logger.trace("Refreshing " + this);
        }
        else {
            logger.debug("Refreshing " + getDisplayName());
        }
	}
	// Initialize any placeholder property sources in the context environment.
		//这是一个空的方法，目前spring没有对其做任何事
	initPropertySources();
 
	// Validate that all properties marked as required are resolvable:
	// see ConfigurablePropertyResolver#setRequiredProperties
            //验证配置文件的有效性
            //Environment这个类主要用于当前环境的判断，判断有效性之类的
            //getEnvironment这个方法的逻辑你可以试着点进去，发现就是
            //有的话直接返回，没有的话就创建一个
	getEnvironment().validateRequiredProperties();
 
	// Store pre-refresh ApplicationListeners...
            //在最开始的图中我们也提到了监听器，这里就是监听器
            //准备的时候创建一个监听器的容器
	if (this.earlyApplicationListeners == null) {
		this.earlyApplicationListeners = new LinkedHashSet<>(this.applicationListeners);
	}
	else {
		// Reset local application listeners to pre-refresh state.
		this.applicationListeners.clear();
		this.applicationListeners.addAll(this.earlyApplicationListeners);
	}
 
	// Allow for the collection of early ApplicationEvents,
	// to be published once the multicaster is available...
            //在multicaster设置之前发布的ApplicationEvents
	this.earlyApplicationEvents = new LinkedHashSet<>();
}
```
### 5.4 核心方法之一  obtainFreshBeanFactory()

这个地方方法走的比较多，解释我基本都会写在注释当中

```java
protected ConfigurableListableBeanFactory obtainFreshBeanFactory() {
		//一共有两步
                //关闭旧的beanFactory 创建新的beanFactory 并注册
                refreshBeanFactory();
                //返回创造的对象
                之后我们将具体来看一下这两个方法
		return getBeanFactory();
	}
```


右键， refreshBeanFactory()，goto，来到相应的方法，这个方法在

AbstractRefreshableApplicationContext类当中

```java
protected final void refreshBeanFactory() throws BeansException {
    //这一步很简单，如果有的话，就关闭之前的，重新创建
    if (hasBeanFactory()) {
        destroyBeans();
        closeBeanFactory();
    }
    try {
        //这一步又要详细分析这四个方法了
        //这个方法里面就一句话
        //new DefaultListableBeanFactory(getInternalParentBeanFactory());
        //也就是创建一个beanFactory这个类，初步形成
        DefaultListableBeanFactory beanFactory = createBeanFactory();

        //设置序列化ID
        beanFactory.setSerializationId(getId());
        //这个地方有点意思，需要讲一下，在下面看一下它的方法
        //customize是定制的意思，所以英文对程序员真的很有用
        customizeBeanFactory(beanFactory);
        //这是创建的时候最核心的方法，一层一层深入看一下吧
        loadBeanDefinitions(beanFactory);
        //设置到这个类的属性当中，用于返回对象方法时的使用
        synchronized (this.beanFactoryMonitor) {
            this.beanFactory = beanFactory;
        }
    }
    catch (IOException ex) {
        throw new ApplicationContextException("I/O error parsing bean definition source for " + getDisplayName(), ex);
    }
}
```
 customizeBeanFactory方法，定义覆盖以及循环依赖的问题

 


protected void customizeBeanFactory(DefaultListableBeanFactory beanFactory) {

```java
	if (this.allowBeanDefinitionOverriding != null) {
		//是否允许bean定义的覆盖
		// BeanDefinition 的覆盖问题大家也许会碰到，
		// 就是在配置文件中定义 bean 时使用了相同的 id 或 name
		// ，默认情况下，allowBeanDefinitionOverriding 属性为 null，
		// 如果在同一配置文件中重复了，会抛错，但是如果不是同一配置文件中，会发生覆盖。
		beanFactory.setAllowBeanDefinitionOverriding(this.allowBeanDefinitionOverriding);
	}
	if (this.allowCircularReferences != null) {
		//是否允许bean 间的循环依赖
		// A 依赖 B，而 B 依赖 A。或 A 依赖 B，B 依赖 C，而 C 依赖 A
		// 默认情况下，Spring 允许循环依赖，当然如果你在 A 的构造方法中依赖 B，在 B 的构造方法中依赖 A 是不行的。
		beanFactory.setAllowCircularReferences(this.allowCircularReferences);
	}
}
```
 核心方法：loadBeanDefinitions(beanFactory)，这里就和我们图中的beanDefinitionReader联系在一起了，有内味儿了

```java
protected void loadBeanDefinitions(DefaultListableBeanFactory beanFactory) throws BeansException, IOException {
	// Create a new XmlBeanDefinitionReader for the given BeanFactory.
	// 创建同一个XmlBeanDefinitionReader 见名知意 xml的BeanDefine读取器转换器 也就是将xml文件转化为BeanDefinition
	XmlBeanDefinitionReader beanDefinitionReader = new XmlBeanDefinitionReader(beanFactory);
	// Configure the bean definition reader with this context's
	// resource loading environment.
	// 设置当前环境
	beanDefinitionReader.setEnvironment(this.getEnvironment());
	//这里的setResourceLoader赋值 我们在refresh方法的时候就已经给this赋值
	//且看
	// 		super(parent);
	//		// 将配置文件路径设置给AbstractRefreshableConfigApplicationContext 的        configLocations的属性
	//		setConfigLocations(configLocations); //这个方法就将配置路径赋值了
	//		// 由上面的参数传进refresh为true 下面我们就进入refresh方法 spring初始化全程
	//		if (refresh) {
	//			refresh();
	//		}
	beanDefinitionReader.setResourceLoader(this);
	beanDefinitionReader.setEntityResolver(new ResourceEntityResolver(this));
	// Allow a subclass to provide custom initialization of the reader,
	// then proceed with actually loading the bean definitions.
	initBeanDefinitionReader(beanDefinitionReader);
	//下面方法是核心
	loadBeanDefinitions(beanDefinitionReader);
 
}
```
继续进入loadBeanDefinitions(beanDefinitionReader);方法

点进reader.loadBeanDefinitions(configLocations);方法

点进loadBeanDefinitions方法 

点进doLoadBeanDefinitions方法，在spring中带do的都是干实事的

```java
 
protected int doLoadBeanDefinitions(InputSource inputSource, Resource resource)
    throws BeanDefinitionStoreException {
    try {
        //这里我们将资源文件转化为Document对象
        Document doc = doLoadDocument(inputSource, resource);
        //开始注册对应的BeanDefinition 我们继续进去
        int count = registerBeanDefinitions(doc, resource);
        if (logger.isDebugEnabled()) {
            logger.debug("Loaded " + count + " bean definitions from " + resource);
        }
        return count;
    }
    catch (BeanDefinitionStoreException ex) {
        throw ex；
    }
    catch (SAXParseException ex) {
        throw new XmlBeanDefinitionStoreException(resource.getDescription(),
                                                  "Line " + ex.getLineNumber() + " in XML document from " + resource + " is invalid", ex);
    }
    catch (SAXException ex) {
        throw new XmlBeanDefinitionStoreException(resource.getDescription(),
                                                  "XML document from " + resource + " is invalid", ex);
    }
    catch (ParserConfigurationException ex) {
        throw new BeanDefinitionStoreException(resource.getDescription(),
                                               "Parser configuration exception parsing XML from " + resource, ex);
    }
    catch (IOException ex) {
        throw new BeanDefinitionStoreException(resource.getDescription(),
                                               "IOException parsing XML document from " + resource, ex);
    }
    catch (Throwable ex) {
        throw new BeanDefinitionStoreException(resource.getDescription(),
                                               "Unexpected exception parsing XML document from " + resource, ex);
    }
}
```


直接进入DefaultBeanDefinitionDocumentReader 下面的doRegisterBeanDefinitions

```java
protected void doRegisterBeanDefinitions(Element root) {
		// Any nested <beans> elements will cause recursion in this method. In
		// rder to propagate and preserve <beans> default-* attributes correctly,
		// keep track of the current (parent) delegate, which may be null. Create
		// the new (child) delegate with a reference to the parent for fallback purposes,
		// then ultimately reset this.delegate back to its original (parent) reference.
		// this behavior emulates a stack of delegates without actually necessitating one.
		BeanDefinitionParserDelegate parent = this.delegate;
		this.delegate = createDelegate(getReaderContext(), root, parent);
if (this.delegate.isDefaultNamespace(root)) {
			String profileSpec = root.getAttribute(PROFILE_ATTRIBUTE);
			if (StringUtils.hasText(profileSpec)) {
				String[] specifiedProfiles = StringUtils.tokenizeToStringArray(
						profileSpec, BeanDefinitionParserDelegate.MULTI_VALUE_ATTRIBUTE_DELIMITERS);
				// We cannot use Profiles.of(...) since profile expressions are not supported
				// in XML config. See SPR-12458 for details.
				if (!getReaderContext().getEnvironment().acceptsProfiles(specifiedProfiles)) {
					if (logger.isDebugEnabled()) {
						logger.debug("Skipped XML bean definition file due to specified profiles [" + profileSpec +
								"] not matching: " + getReaderContext().getResource());
					}
					return;
				}
			}
		}
		preProcessXml(root);
		// 解析xml 将xml元素转化为BeanDefinition
		parseBeanDefinitions(root, this.delegate);
		postProcessXml(root);
		this.delegate = parent;
 
	}
```
根据上面的解释我们直接进入parseBeanDefinitions(root, this.delegate);

再进入parseDefaultElement(ele, delegate)


```java
private void parseDefaultElement(Element ele, BeanDefinitionParserDelegate delegate) {
	if (delegate.nodeNameEquals(ele, IMPORT_ELEMENT)) {
		//处理import标签
		importBeanDefinitionResource(ele);
	}
	else if (delegate.nodeNameEquals(ele, ALIAS_ELEMENT)) {
		//处理alias标签
		processAliasRegistration(ele);
	}
	else if (delegate.nodeNameEquals(ele, BEAN_ELEMENT)) {
		//处理bean标签
		processBeanDefinition(ele, delegate);
	}
	else if (delegate.nodeNameEquals(ele, NESTED_BEANS_ELEMENT)) {
		// 处理beans标签
		doRegisterBeanDefinitions(ele);
	}
}
```
进入processBeanDefinition(ele, delegate);我们只关心bean

```java
protected void processBeanDefinition(Element ele, BeanDefinitionParserDelegate delegate) {
	// xml节点信息转化为BeanDefinitionHolder对象
	BeanDefinitionHolder bdHolder = delegate.parseBeanDefinitionElement(ele);
	if (bdHolder != null) {
		//如果有自定义属性的话 进行相应的解析
		bdHolder = delegate.decorateBeanDefinitionIfRequired(ele, bdHolder);
		try {
			// Register the final decorated instance.
			// 这一步就是注册bean啦
			BeanDefinitionReaderUtils.registerBeanDefinition(bdHolder, getReaderContext().getRegistry());
		}
		catch (BeanDefinitionStoreException ex) {
			getReaderContext().error("Failed to register bean definition with name '" +
					bdHolder.getBeanName() + "'", ele, ex);
		}
		// Send registration event.
		getReaderContext().fireComponentRegistered(new BeanComponentDefinition(bdHolder));
	}
}
```
进入registerBeanDefinition方法

```java
	public static void registerBeanDefinition(
			BeanDefinitionHolder definitionHolder, BeanDefinitionRegistry registry)
			throws BeanDefinitionStoreException {
 
		// Register bean definition under primary name.
		String beanName = definitionHolder.getBeanName();
		registry.registerBeanDefinition(beanName, definitionHolder.getBeanDefinition());
 
		// Register aliases for bean name, if any.
		String[] aliases = definitionHolder.getAliases();
		if (aliases != null) {
			for (String alias : aliases) {
				registry.registerAlias(beanName, alias);
			}
		}
	}
```
再进入registry.registerBeanDefinition 

```java
public void registerBeanDefinition(String beanName, BeanDefinition beanDefinition)
			throws BeanDefinitionStoreException {

    Assert.hasText(beanName, "Bean name must not be empty");
    Assert.notNull(beanDefinition, "BeanDefinition must not be null");

    if (beanDefinition instanceof AbstractBeanDefinition) {
        try {
            ((AbstractBeanDefinition) beanDefinition).validate();
        }
        catch (BeanDefinitionValidationException ex) {
            throw new BeanDefinitionStoreException(beanDefinition.getResourceDescription(), beanName,
                                                   "Validation of bean definition failed", ex);
        }
    }

    BeanDefinition existingDefinition = this.beanDefinitionMap.get(beanName);
    if (existingDefinition != null) {
        if (!isAllowBeanDefinitionOverriding()) {
            throw new BeanDefinitionOverrideException(beanName, beanDefinition, existingDefinition);
        }
        else if (existingDefinition.getRole() < beanDefinition.getRole()) {
            // e.g. was ROLE_APPLICATION, now overriding with ROLE_SUPPORT or ROLE_INFRASTRUCTURE
            if (logger.isInfoEnabled()) {
                logger.info("Overriding user-defined bean definition for bean '" + beanName +
                            "' with a framework-generated bean definition: replacing [" +
                            existingDefinition + "] with [" + beanDefinition + "]");
            }
        }
        else if (!beanDefinition.equals(existingDefinition)) {
            if (logger.isDebugEnabled()) {
                logger.debug("Overriding bean definition for bean '" + beanName +
                             "' with a different definition: replacing [" + existingDefinition +
                             "] with [" + beanDefinition + "]");
            }
        }
        else {
            if (logger.isTraceEnabled()) {
                logger.trace("Overriding bean definition for bean '" + beanName +
                             "' with an equivalent definition: replacing [" + existingDefinition +
                             "] with [" + beanDefinition + "]");
            }
        }
        this.beanDefinitionMap.put(beanName, beanDefinition);
    }
    else {
        if (hasBeanCreationStarted()) {
            // Cannot modify startup-time collection elements anymore (for stable iteration)
            synchronized (this.beanDefinitionMap) {
                this.beanDefinitionMap.put(beanName, beanDefinition);
                List<String> updatedDefinitions = new ArrayList<>(this.beanDefinitionNames.size() + 1);
                updatedDefinitions.addAll(this.beanDefinitionNames);
                updatedDefinitions.add(beanName);
                this.beanDefinitionNames = updatedDefinitions;
                removeManualSingletonName(beanName);
            }
        }
        else {
            // Still in startup registration phase
            this.beanDefinitionMap.put(beanName, beanDefinition);
            this.beanDefinitionNames.add(beanName);
            removeManualSingletonName(beanName);
        }
        this.frozenBeanDefinitionNames = null;
    }

    if (existingDefinition != null || containsSingleton(beanName)) {
        resetBeanDefinition(beanName);
    }
}
```
然后我们看看这个DefaultListableBeanFactory的关系图

![img](https://imgconvert.csdnimg.cn/aHR0cHM6Ly9qYXZhZG9vcC5jb20vYmxvZ2ltYWdlcy9zcHJpbmctY29udGV4dC8yLnBuZw?x-oss-process=image/format,png)

 到此为止基本就创建完了，最后执行获取这个操作了。

```java
	public final ConfigurableListableBeanFactory getBeanFactory() {
 
            //因为在刚才的refreshBeanFactory()方法中，我们已经将beanFactory这个类设置到this当中了
            //所以在这个地方直接获取
	synchronized (this.beanFactoryMonitor) {
		if (this.beanFactory == null) {
			throw new IllegalStateException("BeanFactory not initialized or already closed - " +
					"call 'refresh' before accessing beans via the ApplicationContext");
		}
		return this.beanFactory;
	}
}
```
### 5.5 prepareBeanFactory()

```java
protected void prepareBeanFactory(ConfigurableListableBeanFactory beanFactory) {
    //设置类加载器：存在则直接设置/不存在则新建一个默认类加载器
    beanFactory.setBeanClassLoader(getClassLoader());
    //设置EL表达式解析器（Bean初始化完成后填充属性时会用到）
    beanFactory.setBeanExpressionResolver(new StandardBeanExpressionResolver(beanFactory.getBeanClassLoader()));
    //设置属性注册解析器PropertyEditor
    beanFactory.addPropertyEditorRegistrar(new ResourceEditorRegistrar(this, getEnvironment()));
    // 将当前的ApplicationContext对象交给ApplicationContextAwareProcessor类来处理，从而在Aware接口实现类中的注入applicationContext
    beanFactory.addBeanPostProcessor(new ApplicationContextAwareProcessor(this));
    //设置忽略自动装配的接口
    beanFactory.ignoreDependencyInterface(ResourceLoaderAware.class);
    beanFactory.ignoreDependencyInterface(ApplicationEventPublisherAware.class);
    beanFactory.ignoreDependencyInterface(MessageSourceAware.class);
    beanFactory.ignoreDependencyInterface(ApplicationContextAware.class);
    beanFactory.ignoreDependencyInterface(EnvironmentAware.class);
    //注册可以解析的自动装配
    // MessageSource registered (and found for autowiring) as a bean.
    beanFactory.registerResolvableDependency(BeanFactory.class, beanFactory);
    beanFactory.registerResolvableDependency(ResourceLoader.class, this);
    beanFactory.registerResolvableDependency(ApplicationEventPublisher.class, this);
    beanFactory.registerResolvableDependency(ApplicationContext.class, this);
    //如果当前BeanFactory包含loadTimeWeaver Bean，说明存在类加载期织入AspectJ，则把当前BeanFactory交给类加载期BeanPostProcessor实现类LoadTimeWeaverAwareProcessor来处理，从而实现类加载期织入AspectJ的目的。
    if (beanFactory.containsBean(LOAD_TIME_WEAVER_BEAN_NAME)) {
        beanFactory.addBeanPostProcessor(new LoadTimeWeaverAwareProcessor(beanFactory));
        // Set a temporary ClassLoader for type matching.
        beanFactory.setTempClassLoader(new ContextTypeMatchClassLoader(beanFactory.getBeanClassLoader()));
    }
    //注册当前容器环境environment组件Bean
    if (!beanFactory.containsLocalBean(ENVIRONMENT_BEAN_NAME)) {
        beanFactory.registerSingleton(ENVIRONMENT_BEAN_NAME, getEnvironment());
    }
    //注册系统配置systemProperties组件Bean
    if (!beanFactory.containsLocalBean(SYSTEM_PROPERTIES_BEAN_NAME)) {
        beanFactory.registerSingleton(SYSTEM_PROPERTIES_BEAN_NAME, getEnvironment().getSystemProperties());
    }
    //注册系统环境systemEnvironment组件Bean
    if (!beanFactory.containsLocalBean(SYSTEM_ENVIRONMENT_BEAN_NAME)) {
        beanFactory.registerSingleton(SYSTEM_ENVIRONMENT_BEAN_NAME, getEnvironment().getSystemEnvironment());
    }
}
```

### 5.6 postProcessBeanFactory()

spring中并没有具体去实现postProcessBeanFactory方法，作用是在BeanFactory准备工作完成后做一些定制化的处理。

### 5.7 核心方法之一  invokeBeanFactoryPostProcessors()

Instantiate and invoke all registered BeanFactoryPostProcessor beans,respecting explicit order if given.

上面是对这个方法的描述，调用所有注册的BeanFactoryPostProcessor，并遵循显式顺序（如果给定的话）。

BeanFactoryPostProcessor 接口是 Spring 初始化 BeanFactory 时对外暴露的扩展点，Spring IoC 容器允许 BeanFactoryPostProcessor 在容器实例化任何 bean 之前读取 bean 的定义，并可以修改它。

```java
protected void invokeBeanFactoryPostProcessors(ConfigurableListableBeanFactory beanFactory) {
            //getBeanFactoryPostProcessors(): 拿到当前应用上下文beanFactoryPostProcessors变量中的值
            //invokeBeanFactoryPostProcessors: 实例化并调用所有已注册的BeanFactoryPostProcessor
            PostProcessorRegistrationDelegate.invokeBeanFactoryPostProcessors(beanFactory, getBeanFactoryPostProcessors());
 
	// Detect a LoadTimeWeaver and prepare for weaving, if found in the meantime
	// (e.g. through an @Bean method registered by ConfigurationClassPostProcessor)
	if (beanFactory.getTempClassLoader() == null && beanFactory.containsBean(LOAD_TIME_WEAVER_BEAN_NAME)) {
		beanFactory.addBeanPostProcessor(new LoadTimeWeaverAwareProcessor(beanFactory));
		beanFactory.setTempClassLoader(new ContextTypeMatchClassLoader(beanFactory.getBeanClassLoader()));
	}
}
```
这一段代码的核心在于获取和调用，下面进行详细的讲解
getBeanFactoryPostProcessors()，这个方法默认是没有的，返回null

```java
public List<BeanFactoryPostProcessor> getBeanFactoryPostProcessors() {
	return this.beanFactoryPostProcessors;
}
```
如何添加自定义 BeanFactoryPostProcessor 到 this.beanFactoryPostProcessors 变量中了？

新建一个 ApplicationContextInitializer 的实现类 SpringApplicationContextInitializer ，并在 initialize 方法中写我们的逻辑。

```java
package com.joonwhee.open.demo.spring;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
/**
 * @author joonwhee
 * @date 2019/1/19
 */
public class SpringApplicationContextInitializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {
    @Override
    public void initialize(ConfigurableApplicationContext applicationContext) {
        FirstBeanDefinitionRegistryPostProcessor firstBeanDefinitionRegistryPostProcessor = new FirstBeanDefinitionRegistryPostProcessor();
        // 将自定义的firstBeanDefinitionRegistryPostProcessor添加到应用上下文中
        applicationContext.addBeanFactoryPostProcessor(firstBeanDefinitionRegistryPostProcessor);
        // ...自定义操作
        System.out.println("SpringApplicationContextInitializer#initialize");
    }
 
}
```


将 SpringApplicationContextInitializer 作为初始化参数 contextInitializerClasses 配置到 web.xml 中。

```xml
<context-param>
    <param-name>contextInitializerClasses</param-name>
    <param-value>
        com.joonwhee.open.demo.spring.SpringApplicationContextInitializer
    </param-value>
</context-param>
```


invokeBeanFactoryPostProcessors方法

```java
 
public static void invokeBeanFactoryPostProcessors(
        ConfigurableListableBeanFactory beanFactory, List<BeanFactoryPostProcessor> beanFactoryPostProcessors) {
 
 
 
    // Invoke BeanDefinitionRegistryPostProcessors first, if any.
 
    Set<String> processedBeans = new HashSet<String>();
 
 
 
    // 1.判断beanFactory是否为BeanDefinitionRegistry，beanFactory为DefaultListableBeanFactory,
 
    // 而DefaultListableBeanFactory实现了BeanDefinitionRegistry接口，因此这边为true
 
    if (beanFactory instanceof BeanDefinitionRegistry) {
 
        BeanDefinitionRegistry registry = (BeanDefinitionRegistry) beanFactory;
 
        // 用于存放普通的BeanFactoryPostProcessor
 
        List<BeanFactoryPostProcessor> regularPostProcessors = new LinkedList<BeanFactoryPostProcessor>();
 
        // 用于存放BeanDefinitionRegistryPostProcessor
 
        List<BeanDefinitionRegistryPostProcessor> registryProcessors = new LinkedList<BeanDefinitionRegistryPostProcessor>();
 
 
 
        // 2.首先处理入参中的beanFactoryPostProcessors
 
        // 遍历所有的beanFactoryPostProcessors, 将BeanDefinitionRegistryPostProcessor和普通BeanFactoryPostProcessor区分开
 
        for (BeanFactoryPostProcessor postProcessor : beanFactoryPostProcessors) {
 
            if (postProcessor instanceof BeanDefinitionRegistryPostProcessor) {
 
                // 2.1 如果是BeanDefinitionRegistryPostProcessor
 
                BeanDefinitionRegistryPostProcessor registryProcessor =
 
                        (BeanDefinitionRegistryPostProcessor) postProcessor;
 
                // 2.1.1 直接执行BeanDefinitionRegistryPostProcessor接口的postProcessBeanDefinitionRegistry方法
 
                registryProcessor.postProcessBeanDefinitionRegistry(registry);
 
                // 2.1.2 添加到registryProcessors(用于最后执行postProcessBeanFactory方法)
 
                registryProcessors.add(registryProcessor);
 
            } else {
 
                // 2.2 否则，只是普通的BeanFactoryPostProcessor
 
                // 2.2.1 添加到regularPostProcessors(用于最后执行postProcessBeanFactory方法)
 
                regularPostProcessors.add(postProcessor);
 
            }
 
        }
 
 
 
        // Do not initialize FactoryBeans here: We need to leave all regular beans
 
        // uninitialized to let the bean factory post-processors apply to them!
 
        // Separate between BeanDefinitionRegistryPostProcessors that implement
 
        // PriorityOrdered, Ordered, and the rest.
 
        // 用于保存本次要执行的BeanDefinitionRegistryPostProcessor
 
        List<BeanDefinitionRegistryPostProcessor> currentRegistryProcessors = new ArrayList<BeanDefinitionRegistryPostProcessor>();
 
 
 
        // First, invoke the BeanDefinitionRegistryPostProcessors that implement PriorityOrdered.
 
        // 3.调用所有实现PriorityOrdered接口的BeanDefinitionRegistryPostProcessor实现类
 
        // 3.1 找出所有实现BeanDefinitionRegistryPostProcessor接口的Bean的beanName
 
        String[] postProcessorNames =
 
                beanFactory.getBeanNamesForType(BeanDefinitionRegistryPostProcessor.class, true, false);
 
        // 3.2 遍历postProcessorNames
 
        for (String ppName : postProcessorNames) {
 
            // 3.3 校验是否实现了PriorityOrdered接口
 
            if (beanFactory.isTypeMatch(ppName, PriorityOrdered.class)) {
 
                // 3.4 获取ppName对应的bean实例, 添加到currentRegistryProcessors中,
 
                // beanFactory.getBean: 这边getBean方法会触发创建ppName对应的bean对象, 目前暂不深入解析
 
                currentRegistryProcessors.add(beanFactory.getBean(ppName, BeanDefinitionRegistryPostProcessor.class));
 
                // 3.5 将要被执行的加入processedBeans，避免后续重复执行
 
                processedBeans.add(ppName);
 
            }
 
        }
 
        // 3.6 进行排序(根据是否实现PriorityOrdered、Ordered接口和order值来排序)
 
        sortPostProcessors(currentRegistryProcessors, beanFactory);
 
        // 3.7 添加到registryProcessors(用于最后执行postProcessBeanFactory方法)
 
        registryProcessors.addAll(currentRegistryProcessors);
 
        // 3.8 遍历currentRegistryProcessors, 执行postProcessBeanDefinitionRegistry方法
 
        invokeBeanDefinitionRegistryPostProcessors(currentRegistryProcessors, registry);
 
        // 3.9 执行完毕后, 清空currentRegistryProcessors
 
        currentRegistryProcessors.clear();
 
 
 
        // Next, invoke the BeanDefinitionRegistryPostProcessors that implement Ordered.
 
        // 4.调用所有实现了Ordered接口的BeanDefinitionRegistryPostProcessor实现类（过程跟上面的步骤3基本一样）
 
        // 4.1 找出所有实现BeanDefinitionRegistryPostProcessor接口的类, 这边重复查找是因为执行完上面的BeanDefinitionRegistryPostProcessor,
 
        // 可能会新增了其他的BeanDefinitionRegistryPostProcessor, 因此需要重新查找
 
        postProcessorNames = beanFactory.getBeanNamesForType(BeanDefinitionRegistryPostProcessor.class, true, false);
 
        for (String ppName : postProcessorNames) {
 
            // 校验是否实现了Ordered接口，并且还未执行过
 
            if (!processedBeans.contains(ppName) && beanFactory.isTypeMatch(ppName, Ordered.class)) {
 
                currentRegistryProcessors.add(beanFactory.getBean(ppName, BeanDefinitionRegistryPostProcessor.class));
 
                processedBeans.add(ppName);
 
            }
 
        }
 
        sortPostProcessors(currentRegistryProcessors, beanFactory);
 
        registryProcessors.addAll(currentRegistryProcessors);
 
        // 4.2 遍历currentRegistryProcessors, 执行postProcessBeanDefinitionRegistry方法
 
        invokeBeanDefinitionRegistryPostProcessors(currentRegistryProcessors, registry);
 
        currentRegistryProcessors.clear();
 
 
 
        // Finally, invoke all other BeanDefinitionRegistryPostProcessors until no further ones appear.
 
        // 5.最后, 调用所有剩下的BeanDefinitionRegistryPostProcessors
 
        boolean reiterate = true;
 
        while (reiterate) {
 
            reiterate = false;
 
            // 5.1 找出所有实现BeanDefinitionRegistryPostProcessor接口的类
 
            postProcessorNames = beanFactory.getBeanNamesForType(BeanDefinitionRegistryPostProcessor.class, true, false);
 
            for (String ppName : postProcessorNames) {
 
                // 5.2 跳过已经执行过的
 
                if (!processedBeans.contains(ppName)) {
 
                    currentRegistryProcessors.add(beanFactory.getBean(ppName, BeanDefinitionRegistryPostProcessor.class));
 
                    processedBeans.add(ppName);
 
                    // 5.3 如果有BeanDefinitionRegistryPostProcessor被执行, 则有可能会产生新的BeanDefinitionRegistryPostProcessor,
 
                    // 因此这边将reiterate赋值为true, 代表需要再循环查找一次
 
                    reiterate = true;
 
                }
 
            }
 
            sortPostProcessors(currentRegistryProcessors, beanFactory);
 
            registryProcessors.addAll(currentRegistryProcessors);
 
            // 5.4 遍历currentRegistryProcessors, 执行postProcessBeanDefinitionRegistry方法
 
            invokeBeanDefinitionRegistryPostProcessors(currentRegistryProcessors, registry);
 
            currentRegistryProcessors.clear();
 
        }
 
 
 
        // Now, invoke the postProcessBeanFactory callback of all processors handled so far.
 
        // 6.调用所有BeanDefinitionRegistryPostProcessor的postProcessBeanFactory方法(BeanDefinitionRegistryPostProcessor继承自BeanFactoryPostProcessor)
 
        invokeBeanFactoryPostProcessors(registryProcessors, beanFactory);
 
        // 7.最后, 调用入参beanFactoryPostProcessors中的普通BeanFactoryPostProcessor的postProcessBeanFactory方法
 
        invokeBeanFactoryPostProcessors(regularPostProcessors, beanFactory);
 
    } else {
 
        // Invoke factory processors registered with the context instance.
 
        invokeBeanFactoryPostProcessors(beanFactoryPostProcessors, beanFactory);
 
    }
 
 
 
    // 到这里 , 入参beanFactoryPostProcessors和容器中的所有BeanDefinitionRegistryPostProcessor已经全部处理完毕,
 
    // 下面开始处理容器中的所有BeanFactoryPostProcessor
 
 
 
    // Do not initialize FactoryBeans here: We need to leave all regular beans
 
    // uninitialized to let the bean factory post-processors apply to them!
 
    // 8.找出所有实现BeanFactoryPostProcessor接口的类
 
    String[] postProcessorNames =
 
            beanFactory.getBeanNamesForType(BeanFactoryPostProcessor.class, true, false);
 
 
 
    // Separate between BeanFactoryPostProcessors that implement PriorityOrdered,
 
    // Ordered, and the rest.
 
    // 用于存放实现了PriorityOrdered接口的BeanFactoryPostProcessor
 
    List<BeanFactoryPostProcessor> priorityOrderedPostProcessors = new ArrayList<BeanFactoryPostProcessor>();
 
    // 用于存放实现了Ordered接口的BeanFactoryPostProcessor的beanName
 
    List<String> orderedPostProcessorNames = new ArrayList<String>();
 
    // 用于存放普通BeanFactoryPostProcessor的beanName
 
    List<String> nonOrderedPostProcessorNames = new ArrayList<String>();
 
    // 8.1 遍历postProcessorNames, 将BeanFactoryPostProcessor按实现PriorityOrdered、实现Ordered接口、普通三种区分开
 
    for (String ppName : postProcessorNames) {
 
        // 8.2 跳过已经执行过的
 
        if (processedBeans.contains(ppName)) {
 
            // skip - already processed in first phase above
 
        } else if (beanFactory.isTypeMatch(ppName, PriorityOrdered.class)) {
 
            // 8.3 添加实现了PriorityOrdered接口的BeanFactoryPostProcessor
 
            priorityOrderedPostProcessors.add(beanFactory.getBean(ppName, BeanFactoryPostProcessor.class));
 
        } else if (beanFactory.isTypeMatch(ppName, Ordered.class)) {
 
            // 8.4 添加实现了Ordered接口的BeanFactoryPostProcessor的beanName
 
            orderedPostProcessorNames.add(ppName);
 
        } else {
 
            // 8.5 添加剩下的普通BeanFactoryPostProcessor的beanName
 
            nonOrderedPostProcessorNames.add(ppName);
 
        }
 
    }
 
 
 
    // First, invoke the BeanFactoryPostProcessors that implement PriorityOrdered.
 
    // 9.调用所有实现PriorityOrdered接口的BeanFactoryPostProcessor
 
    // 9.1 对priorityOrderedPostProcessors排序
 
    sortPostProcessors(priorityOrderedPostProcessors, beanFactory);
 
    // 9.2 遍历priorityOrderedPostProcessors, 执行postProcessBeanFactory方法
 
    invokeBeanFactoryPostProcessors(priorityOrderedPostProcessors, beanFactory);
 
 
 
    // Next, invoke the BeanFactoryPostProcessors that implement Ordered.
 
    // 10.调用所有实现Ordered接口的BeanFactoryPostProcessor
 
    List<BeanFactoryPostProcessor> orderedPostProcessors = new ArrayList<BeanFactoryPostProcessor>();
 
    for (String postProcessorName : orderedPostProcessorNames) {
 
        // 10.1 获取postProcessorName对应的bean实例, 添加到orderedPostProcessors, 准备执行
 
        orderedPostProcessors.add(beanFactory.getBean(postProcessorName, BeanFactoryPostProcessor.class));
 
    }
 
    // 10.2 对orderedPostProcessors排序
 
    sortPostProcessors(orderedPostProcessors, beanFactory);
 
    // 10.3 遍历orderedPostProcessors, 执行postProcessBeanFactory方法
 
    invokeBeanFactoryPostProcessors(orderedPostProcessors, beanFactory);
 
 
 
    // Finally, invoke all other BeanFactoryPostProcessors.
 
    // 11.调用所有剩下的BeanFactoryPostProcessor
 
    List<BeanFactoryPostProcessor> nonOrderedPostProcessors = new ArrayList<BeanFactoryPostProcessor>();
 
    for (String postProcessorName : nonOrderedPostProcessorNames) {
 
        // 11.1 获取postProcessorName对应的bean实例, 添加到nonOrderedPostProcessors, 准备执行
 
        nonOrderedPostProcessors.add(beanFactory.getBean(postProcessorName, BeanFactoryPostProcessor.class));
 
    }
 
    // 11.2 遍历nonOrderedPostProcessors, 执行postProcessBeanFactory方法
 
    invokeBeanFactoryPostProcessors(nonOrderedPostProcessors, beanFactory);
 
 
 
    // Clear cached merged bean definitions since the post-processors might have
 
    // modified the original metadata, e.g. replacing placeholders in values...
 
    // 12.清除元数据缓存（mergedBeanDefinitions、allBeanNamesByType、singletonBeanNamesByType），
 
    // 因为后处理器可能已经修改了原始元数据，例如， 替换值中的占位符...
 
    beanFactory.clearMetadataCache();
 
}
```

### 5.8 核心方法之一  registerBeanPostProcessors()

本方法会注册所有的 BeanPostProcessor，将所有实现了 BeanPostProcessor 接口的类加载到 BeanFactory 中。BeanPostProcessor 接口是 Spring 初始化 bean 时对外暴露的扩展点，Spring IoC 容器允许 BeanPostProcessor 在容器初始化 bean 的前后，添加自己的逻辑处理。

```java
 
public static void registerBeanPostProcessors(
        ConfigurableListableBeanFactory beanFactory, AbstractApplicationContext applicationContext) {
 
 
 
    // 1.找出所有实现BeanPostProcessor接口的类
 
    String[] postProcessorNames = beanFactory.getBeanNamesForType(BeanPostProcessor.class, true, false);
 
 
 
    // Register BeanPostProcessorChecker that logs an info message when
 
    // a bean is created during BeanPostProcessor instantiation, i.e. when
 
    // a bean is not eligible for getting processed by all BeanPostProcessors.
 
    // BeanPostProcessor的目标计数
 
    int beanProcessorTargetCount = beanFactory.getBeanPostProcessorCount() + 1 + postProcessorNames.length;
 
    // 2.添加BeanPostProcessorChecker(主要用于记录信息)到beanFactory中
 
    beanFactory.addBeanPostProcessor(new BeanPostProcessorChecker(beanFactory, beanProcessorTargetCount));
 
 
 
    // Separate between BeanPostProcessors that implement PriorityOrdered,
 
    // Ordered, and the rest.
 
    // 3.定义不同的变量用于区分: 实现PriorityOrdered接口的BeanPostProcessor、实现Ordered接口的BeanPostProcessor、普通BeanPostProcessor
 
    // 3.1 priorityOrderedPostProcessors: 用于存放实现PriorityOrdered接口的BeanPostProcessor
 
    List<BeanPostProcessor> priorityOrderedPostProcessors = new ArrayList<BeanPostProcessor>();
 
    // 3.2 internalPostProcessors: 用于存放Spring内部的BeanPostProcessor
 
    List<BeanPostProcessor> internalPostProcessors = new ArrayList<BeanPostProcessor>();
 
    // 3.3 orderedPostProcessorNames: 用于存放实现Ordered接口的BeanPostProcessor的beanName
 
    List<String> orderedPostProcessorNames = new ArrayList<String>();
 
    // 3.4 nonOrderedPostProcessorNames: 用于存放普通BeanPostProcessor的beanName
 
    List<String> nonOrderedPostProcessorNames = new ArrayList<String>();
 
    // 4.遍历postProcessorNames, 将BeanPostProcessors按3.1 - 3.4定义的变量区分开
 
    for (String ppName : postProcessorNames) {
 
        if (beanFactory.isTypeMatch(ppName, PriorityOrdered.class)) {
 
            // 4.1 如果ppName对应的Bean实例实现了PriorityOrdered接口, 则拿到ppName对应的Bean实例并添加到priorityOrderedPostProcessors
 
            BeanPostProcessor pp = beanFactory.getBean(ppName, BeanPostProcessor.class);
 
            priorityOrderedPostProcessors.add(pp);
 
            if (pp instanceof MergedBeanDefinitionPostProcessor) {
 
                // 4.2 如果ppName对应的Bean实例也实现了MergedBeanDefinitionPostProcessor接口,
 
                // 则将ppName对应的Bean实例添加到internalPostProcessors
 
                internalPostProcessors.add(pp);
 
            }
 
        }
 
        else if (beanFactory.isTypeMatch(ppName, Ordered.class)) {
 
            // 4.3 如果ppName对应的Bean实例没有实现PriorityOrdered接口, 但是实现了Ordered接口, 则将ppName添加到orderedPostProcessorNames
 
            orderedPostProcessorNames.add(ppName);
 
        }
 
        else {
 
            // 4.4 否则, 将ppName添加到nonOrderedPostProcessorNames
 
            nonOrderedPostProcessorNames.add(ppName);
 
        }
 
    }
 
 
 
    // First, register the BeanPostProcessors that implement PriorityOrdered.
 
    // 5.首先, 注册实现PriorityOrdered接口的BeanPostProcessors
 
    // 5.1 对priorityOrderedPostProcessors进行排序
 
    sortPostProcessors(priorityOrderedPostProcessors, beanFactory);
 
    // 5.2 注册priorityOrderedPostProcessors
 
    registerBeanPostProcessors(beanFactory, priorityOrderedPostProcessors);
 
 
 
    // Next, register the BeanPostProcessors that implement Ordered.
 
    // 6.接下来, 注册实现Ordered接口的BeanPostProcessors
 
    List<BeanPostProcessor> orderedPostProcessors = new ArrayList<BeanPostProcessor>();
 
    for (String ppName : orderedPostProcessorNames) {
 
        // 6.1 拿到ppName对应的BeanPostProcessor实例对象
 
        BeanPostProcessor pp = beanFactory.getBean(ppName, BeanPostProcessor.class);
 
        // 6.2 将ppName对应的BeanPostProcessor实例对象添加到orderedPostProcessors, 准备执行注册
 
        orderedPostProcessors.add(pp);
 
        if (pp instanceof MergedBeanDefinitionPostProcessor) {
 
            // 6.3 如果ppName对应的Bean实例也实现了MergedBeanDefinitionPostProcessor接口,
 
            // 则将ppName对应的Bean实例添加到internalPostProcessors
 
            internalPostProcessors.add(pp);
 
        }
 
    }
 
    // 6.4 对orderedPostProcessors进行排序
 
    sortPostProcessors(orderedPostProcessors, beanFactory);
 
    // 6.5 注册orderedPostProcessors
 
    registerBeanPostProcessors(beanFactory, orderedPostProcessors);
 
 
 
    // Now, register all regular BeanPostProcessors.
 
    // 7.注册所有常规的BeanPostProcessors（过程与6类似）
 
    List<BeanPostProcessor> nonOrderedPostProcessors = new ArrayList<BeanPostProcessor>();
 
    for (String ppName : nonOrderedPostProcessorNames) {
 
        BeanPostProcessor pp = beanFactory.getBean(ppName, BeanPostProcessor.class);
 
        nonOrderedPostProcessors.add(pp);
 
        if (pp instanceof MergedBeanDefinitionPostProcessor) {
 
            internalPostProcessors.add(pp);
 
        }
 
    }
 
    registerBeanPostProcessors(beanFactory, nonOrderedPostProcessors);
 
 
 
    // Finally, re-register all internal BeanPostProcessors.
 
    // 8.最后, 重新注册所有内部BeanPostProcessors（相当于内部的BeanPostProcessor会被移到处理器链的末尾）
 
    // 8.1 对internalPostProcessors进行排序
 
    sortPostProcessors(internalPostProcessors, beanFactory);
 
    // 8.2注册internalPostProcessors
 
    registerBeanPostProcessors(beanFactory, internalPostProcessors);
 
 
 
    // Re-register post-processor for detecting inner beans as ApplicationListeners,
 
    // moving it to the end of the processor chain (for picking up proxies etc).
 
    // 9.重新注册ApplicationListenerDetector（跟8类似，主要是为了移动到处理器链的末尾）
 
    beanFactory.addBeanPostProcessor(new ApplicationListenerDetector(applicationContext));
 
}
```

使用：可以在bean的初始化前后添加自己想要的代码

```java
 
public static void registerBeanPostProcessors(
        ConfigurableListableBeanFactory beanFactory, AbstractApplicationContext applicationContext) {
 
 
 
    // 1.找出所有实现BeanPostProcessor接口的类
 
    String[] postProcessorNames = beanFactory.getBeanNamesForType(BeanPostProcessor.class, true, false);
 
 
 
    // Register BeanPostProcessorChecker that logs an info message when
 
    // a bean is created during BeanPostProcessor instantiation, i.e. when
 
    // a bean is not eligible for getting processed by all BeanPostProcessors.
 
    // BeanPostProcessor的目标计数
 
    int beanProcessorTargetCount = beanFactory.getBeanPostProcessorCount() + 1 + postProcessorNames.length;
 
    // 2.添加BeanPostProcessorChecker(主要用于记录信息)到beanFactory中
 
    beanFactory.addBeanPostProcessor(new BeanPostProcessorChecker(beanFactory, beanProcessorTargetCount));
 
 
 
    // Separate between BeanPostProcessors that implement PriorityOrdered,
 
    // Ordered, and the rest.
 
    // 3.定义不同的变量用于区分: 实现PriorityOrdered接口的BeanPostProcessor、实现Ordered接口的BeanPostProcessor、普通BeanPostProcessor
 
    // 3.1 priorityOrderedPostProcessors: 用于存放实现PriorityOrdered接口的BeanPostProcessor
 
    List<BeanPostProcessor> priorityOrderedPostProcessors = new ArrayList<BeanPostProcessor>();
 
    // 3.2 internalPostProcessors: 用于存放Spring内部的BeanPostProcessor
 
    List<BeanPostProcessor> internalPostProcessors = new ArrayList<BeanPostProcessor>();
 
    // 3.3 orderedPostProcessorNames: 用于存放实现Ordered接口的BeanPostProcessor的beanName
 
    List<String> orderedPostProcessorNames = new ArrayList<String>();
 
    // 3.4 nonOrderedPostProcessorNames: 用于存放普通BeanPostProcessor的beanName
 
    List<String> nonOrderedPostProcessorNames = new ArrayList<String>();
 
    // 4.遍历postProcessorNames, 将BeanPostProcessors按3.1 - 3.4定义的变量区分开
 
    for (String ppName : postProcessorNames) {
 
        if (beanFactory.isTypeMatch(ppName, PriorityOrdered.class)) {
 
            // 4.1 如果ppName对应的Bean实例实现了PriorityOrdered接口, 则拿到ppName对应的Bean实例并添加到priorityOrderedPostProcessors
 
            BeanPostProcessor pp = beanFactory.getBean(ppName, BeanPostProcessor.class);
 
            priorityOrderedPostProcessors.add(pp);
 
            if (pp instanceof MergedBeanDefinitionPostProcessor) {
 
                // 4.2 如果ppName对应的Bean实例也实现了MergedBeanDefinitionPostProcessor接口,
 
                // 则将ppName对应的Bean实例添加到internalPostProcessors
 
                internalPostProcessors.add(pp);
 
            }
 
        }
 
        else if (beanFactory.isTypeMatch(ppName, Ordered.class)) {
 
            // 4.3 如果ppName对应的Bean实例没有实现PriorityOrdered接口, 但是实现了Ordered接口, 则将ppName添加到orderedPostProcessorNames
 
            orderedPostProcessorNames.add(ppName);
 
        }
 
        else {
 
            // 4.4 否则, 将ppName添加到nonOrderedPostProcessorNames
 
            nonOrderedPostProcessorNames.add(ppName);
 
        }
 
    }
 
 
 
    // First, register the BeanPostProcessors that implement PriorityOrdered.
 
    // 5.首先, 注册实现PriorityOrdered接口的BeanPostProcessors
 
    // 5.1 对priorityOrderedPostProcessors进行排序
 
    sortPostProcessors(priorityOrderedPostProcessors, beanFactory);
 
    // 5.2 注册priorityOrderedPostProcessors
 
    registerBeanPostProcessors(beanFactory, priorityOrderedPostProcessors);
 
 
 
    // Next, register the BeanPostProcessors that implement Ordered.
 
    // 6.接下来, 注册实现Ordered接口的BeanPostProcessors
 
    List<BeanPostProcessor> orderedPostProcessors = new ArrayList<BeanPostProcessor>();
 
    for (String ppName : orderedPostProcessorNames) {
 
        // 6.1 拿到ppName对应的BeanPostProcessor实例对象
 
        BeanPostProcessor pp = beanFactory.getBean(ppName, BeanPostProcessor.class);
 
        // 6.2 将ppName对应的BeanPostProcessor实例对象添加到orderedPostProcessors, 准备执行注册
 
        orderedPostProcessors.add(pp);
 
        if (pp instanceof MergedBeanDefinitionPostProcessor) {
 
            // 6.3 如果ppName对应的Bean实例也实现了MergedBeanDefinitionPostProcessor接口,
 
            // 则将ppName对应的Bean实例添加到internalPostProcessors
 
            internalPostProcessors.add(pp);
 
        }
 
    }
 
    // 6.4 对orderedPostProcessors进行排序
 
    sortPostProcessors(orderedPostProcessors, beanFactory);
 
    // 6.5 注册orderedPostProcessors
 
    registerBeanPostProcessors(beanFactory, orderedPostProcessors);
 
 
 
    // Now, register all regular BeanPostProcessors.
 
    // 7.注册所有常规的BeanPostProcessors（过程与6类似）
 
    List<BeanPostProcessor> nonOrderedPostProcessors = new ArrayList<BeanPostProcessor>();
 
    for (String ppName : nonOrderedPostProcessorNames) {
 
        BeanPostProcessor pp = beanFactory.getBean(ppName, BeanPostProcessor.class);
 
        nonOrderedPostProcessors.add(pp);
 
        if (pp instanceof MergedBeanDefinitionPostProcessor) {
 
            internalPostProcessors.add(pp);
 
        }
 
    }
 
    registerBeanPostProcessors(beanFactory, nonOrderedPostProcessors);
 
 
 
    // Finally, re-register all internal BeanPostProcessors.
 
    // 8.最后, 重新注册所有内部BeanPostProcessors（相当于内部的BeanPostProcessor会被移到处理器链的末尾）
 
    // 8.1 对internalPostProcessors进行排序
 
    sortPostProcessors(internalPostProcessors, beanFactory);
 
    // 8.2注册internalPostProcessors
 
    registerBeanPostProcessors(beanFactory, internalPostProcessors);
 
 
 
    // Re-register post-processor for detecting inner beans as ApplicationListeners,
 
    // moving it to the end of the processor chain (for picking up proxies etc).
 
    // 9.重新注册ApplicationListenerDetector（跟8类似，主要是为了移动到处理器链的末尾）
 
    beanFactory.addBeanPostProcessor(new ApplicationListenerDetector(applicationContext));
 
}
```

### 5.9 initMessageSource()

```java
/**
* Initialize the MessageSource.
* Use parent's if none defined in this context.
*/
protected void initMessageSource() {
   //获取Bean工厂，一般是DefaultListBeanFactory
   ConfigurableListableBeanFactory beanFactory = getBeanFactory();
   //首先判断是否已有xml文件定义了id为messageSource的bean对象
   if (beanFactory.containsLocalBean(MESSAGE_SOURCE_BEAN_NAME)) {
      //如果有，则从Bean工厂得到这个bean对象
      this.messageSource = beanFactory.getBean(MESSAGE_SOURCE_BEAN_NAME, MessageSource.class);
      // Make MessageSource aware of parent MessageSource.
      //当父类Bean工厂不为空，并且这个bean对象是HierarchicalMessageSource类型
      if (this.parent != null && this.messageSource instanceof HierarchicalMessageSource) {
         //为HierarchicalMessageSource的实现类
         HierarchicalMessageSource hms = (HierarchicalMessageSource) this.messageSource;
         //设置父类MessageSource，此处设置内部的parent messageSource
         if (hms.getParentMessageSource() == null) {
            // Only set parent context as parent MessageSource if no parent MessageSource
            // registered already.
            hms.setParentMessageSource(getInternalParentMessageSource());
         }
      }
      if (logger.isTraceEnabled()) {
         logger.trace("Using MessageSource [" + this.messageSource + "]");
      }
   }
   else {
      // Use empty MessageSource to be able to accept getMessage calls.
      //如果没有xml文件定义信息源对象，新建DelegatingMessageSource类作为messageSource的Bean
      //因为DelegatingMessageSource类实现了HierarchicalMessageSource接口，而这个接口继承了MessageSource这个类
      //因此实现了这个接口的类，都是MessageSource的子类，因此DelegatingMessageSource也是一个MessageSource
      DelegatingMessageSource dms = new DelegatingMessageSource();
      //给这个DelegatingMessageSource添加父类消息源
      dms.setParentMessageSource(getInternalParentMessageSource());
      this.messageSource = dms;
      //将这个messageSource实例注册到Bean工厂中
      beanFactory.registerSingleton(MESSAGE_SOURCE_BEAN_NAME, this.messageSource);
      if (logger.isTraceEnabled()) {
         logger.trace("No '" + MESSAGE_SOURCE_BEAN_NAME + "' bean, using [" + this.messageSource + "]");
      }
   }
}
```

### 5.10 initApplicationEventMulticaster()

代码很简单，就是分两种情况进行初始化的过程

```java
protected void initApplicationEventMulticaster() {
    ConfigurableListableBeanFactory beanFactory = getBeanFactory();
    if (beanFactory.containsLocalBean(APPLICATION_EVENT_MULTICASTER_BEAN_NAME)) {
        this.applicationEventMulticaster =
            beanFactory.getBean(APPLICATION_EVENT_MULTICASTER_BEAN_NAME, ApplicationEventMulticaster.class);
        if (logger.isTraceEnabled()) {
            logger.trace("Using ApplicationEventMulticaster [" + this.applicationEventMulticaster + "]");
        }
    }
    else {
        this.applicationEventMulticaster = new SimpleApplicationEventMulticaster(beanFactory);
        beanFactory.registerSingleton(APPLICATION_EVENT_MULTICASTER_BEAN_NAME, this.applicationEventMulticaster);
        if (logger.isTraceEnabled()) {
            logger.trace("No '" + APPLICATION_EVENT_MULTICASTER_BEAN_NAME + "' bean, using " +
                         "[" + this.applicationEventMulticaster.getClass().getSimpleName() + "]");
        }
    }
}
```

### 5.11 onRefresh()

这个方法是空的没有进行实现，官网给的注释是

Initialize other special beans in specific context subclasses.

初始化一些其他的特殊的bean

### 5.12 registerListeners()

获取ApplicationContext初始化的listeners，然后添加到EventMulticaster，这个刚才初始化的

这里面的earlyApplicationEvents是在第一步的时候进行初始化的

在prepareRefresh方法中的


this.earlyApplicationEvents = new LinkedHashSet<>();

```java
	protected void registerListeners() {
		// Register statically specified listeners first.
		for (ApplicationListener<?> listener : getApplicationListeners()) {
			getApplicationEventMulticaster().addApplicationListener(listener);
		}
 
		// Do not initialize FactoryBeans here: We need to leave all regular beans
		// uninitialized to let post-processors apply to them!
		String[] listenerBeanNames = getBeanNamesForType(ApplicationListener.class, true, false);
		for (String listenerBeanName : listenerBeanNames) {
			getApplicationEventMulticaster().addApplicationListenerBean(listenerBeanName);
		}
 
		// Publish early application events now that we finally have a multicaster...
		Set<ApplicationEvent> earlyEventsToProcess = this.earlyApplicationEvents;
		this.earlyApplicationEvents = null;
		if (earlyEventsToProcess != null) {
			for (ApplicationEvent earlyEvent : earlyEventsToProcess) {
				getApplicationEventMulticaster().multicastEvent(earlyEvent);
			}
		}
	}
```
 自定义监听器的实现

```java
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.stereotype.Component;
@Component
public class MyRefreshedListener implements ApplicationListener<ContextRefreshedEvent> {
    @Override
    public void onApplicationEvent(ContextRefreshedEvent event) {
        // 自己的逻辑处理
    }
 
}
```

### 5.13 核心方法之一  finishBeanFactoryInitialization(beanFactory)

```java
protected void finishBeanFactoryInitialization(ConfigurableListableBeanFactory beanFactory) {
    // Initialize conversion service for this context.
    if (beanFactory.containsBean(CONVERSION_SERVICE_BEAN_NAME) &&
    beanFactory.isTypeMatch(CONVERSION_SERVICE_BEAN_NAME, ConversionService.class)) {
    beanFactory.setConversionService(
    beanFactory.getBean(CONVERSION_SERVICE_BEAN_NAME, ConversionService.class));
    }

    // Register a default embedded value resolver if no bean post-processor
    // (such as a PropertyPlaceholderConfigurer bean) registered any before:
    // at this point, primarily for resolution in annotation attribute values.
    if (!beanFactory.hasEmbeddedValueResolver()) {
    beanFactory.addEmbeddedValueResolver(strVal -> getEnvironment().resolvePlaceholders(strVal));
    }

    // Initialize LoadTimeWeaverAware beans early to allow for registering their transformers early.
    String[] weaverAwareNames = beanFactory.getBeanNamesForType(LoadTimeWeaverAware.class, false, false);
    for (String weaverAwareName : weaverAwareNames) {
    getBean(weaverAwareName);
    }

    // Stop using the temporary ClassLoader for type matching.
    beanFactory.setTempClassLoader(null);

    // Allow for caching all bean definition metadata, not expecting further changes.
    beanFactory.freezeConfiguration();

    // Instantiate all remaining (non-lazy-init) singletons.
    beanFactory.preInstantiateSingletons();
}
```
关键起作用的在最后一行beanFactory.preInstantiateSingletons();我们进入

这个时候发现又进入了我们的老朋友

DefaultListableBeanFactory这个重要的类

这里里面的关键代码在于通过名字获取bean，也就是getBean(beanName);方法

```java
public void preInstantiateSingletons() throws BeansException {
    if (logger.isTraceEnabled()) {
    	logger.trace("Pre-instantiating singletons in " + this);
    }
    
    // Iterate over a copy to allow for init methods which in turn register new bean definitions.
	// While this may not be part of the regular factory bootstrap, it does otherwise work fine.
	List<String> beanNames = new ArrayList<>(this.beanDefinitionNames);
 
	// Trigger initialization of all non-lazy singleton beans...
	for (String beanName : beanNames) {
		RootBeanDefinition bd = getMergedLocalBeanDefinition(beanName);
		if (!bd.isAbstract() && bd.isSingleton() && !bd.isLazyInit()) {
			if (isFactoryBean(beanName)) {
				Object bean = getBean(FACTORY_BEAN_PREFIX + beanName);
				if (bean instanceof FactoryBean) {
					final FactoryBean<?> factory = (FactoryBean<?>) bean;
					boolean isEagerInit;
					if (System.getSecurityManager() != null && factory instanceof SmartFactoryBean) {
						isEagerInit = AccessController.doPrivileged((PrivilegedAction<Boolean>)
										((SmartFactoryBean<?>) factory)::isEagerInit,
								getAccessControlContext());
					}
					else {
						isEagerInit = (factory instanceof SmartFactoryBean &&
								((SmartFactoryBean<?>) factory).isEagerInit());
					}
					if (isEagerInit) {
						getBean(beanName);
					}
				}
			}
			else {
				getBean(beanName);
			}
		}
	}
 
	// Trigger post-initialization callback for all applicable beans...
	for (String beanName : beanNames) {
		Object singletonInstance = getSingleton(beanName);
		if (singletonInstance instanceof SmartInitializingSingleton) {
			final SmartInitializingSingleton smartSingleton = (SmartInitializingSingleton) singletonInstance;
			if (System.getSecurityManager() != null) {
				AccessController.doPrivileged((PrivilegedAction<Object>) () -> {
					smartSingleton.afterSingletonsInstantiated();
					return null;
				}, getAccessControlContext());
			}
			else {
				smartSingleton.afterSingletonsInstantiated();
			}
		}
	}
}
```
 我们进入getBean(beanName);方法

```java
public Object getBean(String name) throws BeansException {
		return doGetBean(name, null, null, false);
}
```

发现仅仅是调用了dogetbean这个方法，但是我们在这里看到了do，在spring中do都是干实事的地方，那我们就要知道，创建bean的重点来了。

	protected <T> T doGetBean(final String name, @Nullable final Class<T> requiredType,
	    	@Nullable final Object[] args, boolean typeCheckOnly) throws BeansException {
	    	
	    final String beanName = transformedBeanName(name);
		Object bean;
	 
		// Eagerly check singleton cache for manually registered singletons.
	            //这部分是通过getSingleton(beanName)方法去singleton缓存中找bean实例，
	            //应该是拿不到的，因为我们是第一次初始化，缓存中肯定不存在。
		Object sharedInstance = getSingleton(beanName);
		if (sharedInstance != null && args == null) {
			if (logger.isTraceEnabled()) {
				if (isSingletonCurrentlyInCreation(beanName)) {
					logger.trace("Returning eagerly cached instance of singleton bean '" + beanName +
							"' that is not fully initialized yet - a consequence of a circular reference");
				}
				else {
					logger.trace("Returning cached instance of singleton bean '" + beanName + "'");
				}
			}
			bean = getObjectForBeanInstance(sharedInstance, name, beanName, null);
		}
	 
		else {
			// Fail if we're already creating this bean instance:
			// We're assumably within a circular reference.
	                    //这段是根据当前的beanfactory获取父一级的beanfactory，然后逐级递归的查找我们需要的bean
			if (isPrototypeCurrentlyInCreation(beanName)) {
				throw new BeanCurrentlyInCreationException(beanName);
			}
	 
			// Check if bean definition exists in this factory.
			BeanFactory parentBeanFactory = getParentBeanFactory();
			if (parentBeanFactory != null && !containsBeanDefinition(beanName)) {
				// Not found -> check parent.
				String nameToLookup = originalBeanName(name);
				if (parentBeanFactory instanceof AbstractBeanFactory) {
					return ((AbstractBeanFactory) parentBeanFactory).doGetBean(
							nameToLookup, requiredType, args, typeCheckOnly);
				}
				else if (args != null) {
					// Delegation to parent with explicit args.
					return (T) parentBeanFactory.getBean(nameToLookup, args);
				}
				else if (requiredType != null) {
					// No args -> delegate to standard getBean method.
					return parentBeanFactory.getBean(nameToLookup, requiredType);
				}
				else {
					return (T) parentBeanFactory.getBean(nameToLookup);
				}
			}
	        //第三部分先判断并把需要创建的bean打上正在创建标记，
	        //也就是开头的if判断加markBeanAsCreated(beanName)方法
	        //（这样做的目的是在我创建这个bean之前就先打上创建标记，告诉其它来创建的线程，避免了重复创建，那么这个方法内部肯定是同步的）
			if (!typeCheckOnly) {
				markBeanAsCreated(beanName);
			}
	 
			try {
				final RootBeanDefinition mbd = getMergedLocalBeanDefinition(beanName);
				checkMergedBeanDefinition(mbd, beanName, args);
	 
				// Guarantee initialization of beans that the current bean depends on.
				String[] dependsOn = mbd.getDependsOn();
				if (dependsOn != null) {
					for (String dep : dependsOn) {
						if (isDependent(beanName, dep)) {
							throw new BeanCreationException(mbd.getResourceDescription(), beanName,
									"Circular depends-on relationship between '" + beanName + "' and '" + dep + "'");
						}
						registerDependentBean(dep, beanName);
						try {
							getBean(dep);
						}
						catch (NoSuchBeanDefinitionException ex) {
							throw new BeanCreationException(mbd.getResourceDescription(), beanName,
									"'" + beanName + "' depends on missing bean '" + dep + "'", ex);
						}
					}
				}
	 
				// Create bean instance.
				if (mbd.isSingleton()) {
					sharedInstance = getSingleton(beanName, () -> {
						try {
							return createBean(beanName, mbd, args);
						}
						catch (BeansException ex) {
							// Explicitly remove instance from singleton cache: It might have been put there
							// eagerly by the creation process, to allow for circular reference resolution.
							// Also remove any beans that received a temporary reference to the bean.
							destroySingleton(beanName);
							throw ex;
						}
					});
					bean = getObjectForBeanInstance(sharedInstance, name, beanName, mbd);
				}
	 
				else if (mbd.isPrototype()) {
					// It's a prototype -> create a new instance.
					Object prototypeInstance = null;
					try {
						beforePrototypeCreation(beanName);
						prototypeInstance = createBean(beanName, mbd, args);
					}
					finally {
						afterPrototypeCreation(beanName);
					}
					bean = getObjectForBeanInstance(prototypeInstance, name, beanName, mbd);
				}
	 
				else {
					String scopeName = mbd.getScope();
					final Scope scope = this.scopes.get(scopeName);
					if (scope == null) {
						throw new IllegalStateException("No Scope registered for scope name '" + scopeName + "'");
					}
					try {
						Object scopedInstance = scope.get(beanName, () -> {
							beforePrototypeCreation(beanName);
							try {
								return createBean(beanName, mbd, args);
							}
							finally {
								afterPrototypeCreation(beanName);
							}
						});
						bean = getObjectForBeanInstance(scopedInstance, name, beanName, mbd);
					}
					catch (IllegalStateException ex) {
						throw new BeanCreationException(beanName,
								"Scope '" + scopeName + "' is not active for the current thread; consider " +
								"defining a scoped proxy for this bean if you intend to refer to it from a singleton",
								ex);
					}
				}
			}
			catch (BeansException ex) {
				cleanupAfterBeanCreationFailure(beanName);
				throw ex;
			}
		}
	 
		// Check if required type matches the type of the actual bean instance.
		if (requiredType != null && !requiredType.isInstance(bean)) {
			try {
				T convertedBean = getTypeConverter().convertIfNecessary(bean, requiredType);
				if (convertedBean == null) {
					throw new BeanNotOfRequiredTypeException(name, requiredType, bean.getClass());
				}
				return convertedBean;
			}
			catch (TypeMismatchException ex) {
				if (logger.isTraceEnabled()) {
					logger.trace("Failed to convert bean '" + name + "' to required type '" +
							ClassUtils.getQualifiedName(requiredType) + "'", ex);
				}
				throw new BeanNotOfRequiredTypeException(name, requiredType, bean.getClass());
			}
		}
		return (T) bean;
	}
 不知道小伙伴能否在这里体会到反射的思想呢

### 5.14 finishRefresh()

最后进行一些收尾工作

	protected void finishRefresh() {
		// Clear context-level resource caches (such as ASM metadata from scanning).
		clearResourceCaches();
	 
		// Initialize lifecycle processor for this context.
		initLifecycleProcessor();
	 
		// Propagate refresh to lifecycle processor first.
		getLifecycleProcessor().onRefresh();
	 
		// Publish the final event.
		publishEvent(new ContextRefreshedEvent(this));
	 
		// Participate in LiveBeansView MBean, if active.
		LiveBeansView.registerApplicationContext(this);
	}
## 总结

### 源码分析中比较重要的类有

ApplicationContet（主要的容器，串联流程）

Environment（可以判断环境的有效性）

BeanPostProcessor（用于bean实例化前后的扩展）

BeanFactory（最顶层的一个接口）

FactoryBean（也是用来更好的扩展，他也就有三个方法）

BeanFactoryPostPorcessor（用来工厂后来的扩展）

BeanDefinitionReader（读取前面的一些信息）

classPathXmlApplicationContext（读取总的配置文件）

ContextLoaderListener与它的父类ContextLoader（spring的入口）

## 参考

1.https://blog.csdn.net/spring_live_in/article/details/101059038

2.https://blog.csdn.net/sinat_38259539/article/details/71799078?utm_medium=distribute.pc_relevant.none-task-blog-BlogCommendFromBaidu-4&depth_1-utm_source=distribute.pc_relevant.none-task-blog-BlogCommendFromBaidu-4

3.https://liteyu.blog.csdn.net/article/details/105754312

4.https://blog.csdn.net/v123411739/article/details/87741251
