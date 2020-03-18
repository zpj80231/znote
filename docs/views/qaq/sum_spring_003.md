---
title: "Q&A宝典-spring进阶篇"
date: 2020-02-28
tags:
- 复习
categories:
- 总结
isShowComments: false
---

<Boxx/>

## Spring进阶

::: details 1、SpringMVC的流程？

（1）用户发送请求至<u>前端控制器</u> ***DispatcherServlet***；

（2） DispatcherServlet收到请求后，调用 ***HandlerMapping*** <u>处理器映射器</u>，请求获取Handle；

（3）处理器映射器根据请求url找到具体的处理器，生成处理器对象及处理器拦截器(如果有则生成)一并返回给DispatcherServlet；

（4）DispatcherServlet通过 ***HandlerAdapter*** <u>处理器适配器</u>调用处理器；

（5）<u>执行处理器</u>(***Handler***，也叫后端控制器)；

（6）Handler执行完成<u>**返回ModelAndView**</u>；

（7）HandlerAdapter将Handler执行结果ModelAndView返回给DispatcherServlet；

（8）DispatcherServlet将ModelAndView传给 ***ViewReslover*** <u>视图解析器</u>进行解析；

（9）ViewReslover解析后返回具体View；

（10）DispatcherServlet对View进行渲染视图（即将模型数据填充至视图中）

（11）DispatcherServlet响应用户。

:::

::: details 2. IOC控制反转底层原理

1. 自定义两个注解

   ***@Component***：判断是否注入bean容器

   ***@Autowired***：判断是否依赖注入

2. 创建ApplicationContext容器类

   1.  `private ConcurrentHashMap<String, Object> beans = null;` **存放bean的容器**

   2. initBeans(); 根据注解@Component**加载所有bean**

      - 利用反射机制，遍历一个包下的所有类，判断类上有注解@Component就放入beans容器中，` beans.put(beanId, newInstance); `
   
   3. initEntryField(); 根据注解@Autowired**加载所有依赖注入的对象**
   
      - 所有bean初始化之后，判断bean的依赖注入关系
   
      - 遍历beans容器，利用反射机制，获取bean的所有属性并遍历判断有@Autowired注解的进行依赖注入(利用java反射set注入，private不用写set方法了)
   
        ```java
        //判断当前类属性是否存在注解
        //declaredFields：利用反射得到的所有属性
        for (Field field : declaredFields) {
            SelfAutowired extResource = field.getAnnotation(SelfAutowired.class);
            if (extResource != null) {
                //属性名称：即容器中bean
                String beanId = field.getName();
                Object bean = getBean(beanId);
                if (bean != null) {
                    //默认使用属性名称，查找bean容器对象 1参数 当前对象 2参数给属性赋值
                    field.setAccessible(true); //允许访问私有属性,private不用写set()了
                    field.set(object, bean); //依赖注入
                }
            }
        }
        ```
   
        

:::

::: details 3. 动态代理底层原理

- [简书gstansen](https://www.jianshu.com/p/23d3f1a2b3c7)分析的很好，涉及动态代理比较复杂，我在这里简单概括下吧：

1. 业务接口（Interface）
    业务的抽象表示

2. 业务具体实现类（concreteManager）
    实现业务接口，执行具体的业务操作

3. 业务代理类（$proxy，在运行的时候动态生成的类）
    进行业务代理，调用业务代理操作类

4. 业务代理操作类（DynamicProxyHandler，实现了InvocationHandler接口的类）
    代理方法的直接调用者，通过InvocationHandler中的invoke方法直接发起代理

   ```java
   public class DynamicProxyHandler implements InvocationHandler{
       Object realCookManager;
       DynamicProxyHandler(ICook realCookManager){
           this.realCookManager = realCookManager;
       }
       @Override
       public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
           System.out.println("invoke start");
           System.out.println(method.getName());
           method.invoke(realCookManager,args);
           System.out.println("invoke end");
           return null;
       }
   }
   ```

5. 客户端调用对象（client）
    发起业务

- 总体思路：

  ```java
  /* 5.客户端调用对象（client）
   */
  public class Main {
      public static void main(String[] args){
  		//1. 业务实现类
          CookManager cookManager = new CookManager();
          //2. 业务代理操作类
          DynamicProxyHandler dynamicProxyHandler = 
              new DynamicProxyHandler(cookManager);
          //3. Proxy类中的newProxyInstance()方法利用java反射返回代理类的实例
          ICook iCook =(ICook)Proxy.newProxyInstance(
              dynamicProxyHandler.getClass().getClassLoader(),
              cookManager.getClass().getInterfaces(),
              dynamicProxyHandler);
          
          //打印一下代理类的类名
          System.out.println(iCook.getClass().getName());
          iCook.dealWithFoot();
          iCook.cook();
      }
  }
  ```

  > ICook iCook = (ICook)Proxy.newProxyInstance(
  >
  > ​		`业务代理操作类.getClass().getClassLoader(),`
  > 
  > ​		`业务具体实现类.getClass().getInterfaces(), `
  >
  > ​		`业务代理操作类`  );

  1.  ClassLoader是一个抽象类，作用是将字节码文件加载进虚拟机并生成相应的class（注意是小写的）
  2.  interfaces就是被实现的那些业务接口
  3. 业务代理操作类：实现InvocationHandler接口的实例，即DynamicProxyHandler

   Proxy类中的newProxyInstance()方法利用**java反射**返回代理类的实例：

  ```java
  public static Object newProxyInstance(ClassLoader loader,Class<?>[]
                                        interfaces,InvocationHandler h){
       //所有被实现的业务接口
        final Class<?>[] intfs = interfaces.clone();
       //寻找或生成指定的代理类
        Class<?> cl = getProxyClass0(loader, intfs);
        //通过反射类中的Constructor获取其所有构造方法
        final Constructor<?> cons = cl.getConstructor(constructorParams);
        //通过Constructor返回代理类的实例
        return cons.newInstance(new Object[]{h});
  }
  ```

:::

::: details 4、读过springmvc源码？

Springmvc入口 请求 映射器 适配器

```java
//前端控制器分派方法 

protected void doDispatch(HttpServletRequest request, HttpServletResponse response) throws Exception { 

​    HttpServletRequest processedRequest = request; 

​    HandlerExecutionChain mappedHandler = null; 

​    int interceptorIndex = -1;

​    try { 

​      ModelAndView mv; 

​      boolean errorView = false;  

​      try { 

​    //检查是否是请求是否是multipart（如文件上传），如果是将通过MultipartResolver解析 

​        processedRequest = checkMultipart(request); 

​     //步骤2、请求到处理器（页面控制器）的映射，通过HandlerMapping进行映射 

​        mappedHandler = getHandler(processedRequest, false); 

​        if (mappedHandler == null || mappedHandler.getHandler() == null) { 

​          noHandlerFound(processedRequest, response); 

​          return; 

​        } 

 //步骤3、处理器适配，即将我们的处理器包装成相应的适配器（从而支持多种类型的处理器） 

​        HandlerAdapter ha = getHandlerAdapter(mappedHandler.getHandler());  

​        // 304 Not Modified缓存支持 

​        //此处省略具体代码  

​        // 执行处理器相关的拦截器的预处理（HandlerInterceptor.preHandle） 

​        //此处省略具体代码  

​        // 步骤4、由适配器执行处理器（调用处理器相应功能处理方法） 

​        mv = ha.handle(processedRequest, response, mappedHandler.getHandler());  

​        // Do we need view name translation? 

​        if (mv != null && !mv.hasView()) { 

​          mv.setViewName(getDefaultViewName(request)); 

​        }  

​        // 执行处理器相关的拦截器的后处理（HandlerInterceptor.postHandle） 

​        //此处省略具体代码 

​      } 

​      catch (ModelAndViewDefiningException ex) { 

​        logger.debug("ModelAndViewDefiningException encountered", ex); 

​        mv = ex.getModelAndView(); 

​      } 

​      catch (Exception ex) { 

​        Object handler = (mappedHandler != null ? mappedHandler.getHandler() : null); 

​        mv = processHandlerException(processedRequest, response, handler, ex); 

​        errorView = (mv != null); 

​      }  

//步骤5 步骤6、解析视图并进行视图的渲染 

//步骤5 由ViewResolver解析View（viewResolver.resolveViewName(viewName, locale)） 

步骤6 视图在渲染时会把Model传入（view.render(mv.getModelInternal(), request, response);） 

​      if (mv != null && !mv.wasCleared()) { 

​        render(mv, processedRequest, response); 

​        if (errorView) { 

​          WebUtils.clearErrorRequestAttributes(request); 

​        } 

​      } 

​      else { 

​        if (logger.isDebugEnabled()) { 

​          logger.debug("Null ModelAndView returned to DispatcherServlet with name '" + getServletName() + 

​              "': assuming HandlerAdapter completed request handling"); 

​        } 

​      }  

​      // 执行处理器相关的拦截器的完成后处理（HandlerInterceptor.afterCompletion） 

​      //此处省略具体代码  

​    catch (Exception ex) { 

​      // Trigger after-completion for thrown exception. 

​      triggerAfterCompletion(mappedHandler, interceptorIndex, processedRequest, response, ex)      throw ex; 

​    } 

​    catch (Error err) { 

​      ServletException ex = new NestedServletException("Handler processing failed", err); 

​      // Trigger after-completion for thrown exception. 

​      triggerAfterCompletion(mappedHandler, interceptorIndex, processedRequest, response, ex); 

​      throw ex; 

​    }  

​    finally { 

​      // Clean up any resources used by a multipart request. 

​      if (processedRequest != request) {

​        cleanupMultipart(processedRequest); 

​      } 

​    } 

  } 

 

 

Springmvc九大组件：

protected void initStrategies(ApplicationContext context) {

  //用于处理上传请求。处理方法是将普通的request包装成MultipartHttpServletRequest，后者可以直接调用getFile方法获取File.

  initMultipartResolver(context);

  //SpringMVC主要有两个地方用到了Locale：一是ViewResolver视图解析的时候；二是用到国际化资源或者主题的时候。

  initLocaleResolver(context); 

  //用于解析主题。SpringMVC中一个主题对应一个properties文件，里面存放着跟当前主题相关的所有资源、

  //如图片、css样式等。SpringMVC的主题也支持国际化， 

  initThemeResolver(context);

  //用来查找Handler的。

  initHandlerMappings(context);

  //从名字上看，它就是一个适配器。Servlet需要的处理方法的结构却是固定的，都是以request和response为参数的方法。

  //如何让固定的Servlet处理方法调用灵活的Handler来进行处理呢？这就是HandlerAdapter要做的事情

  initHandlerAdapters(context);

  //其它组件都是用来干活的。在干活的过程中难免会出现问题，出问题后怎么办呢？

  //这就需要有一个专门的角色对异常情况进行处理，在SpringMVC中就是HandlerExceptionResolver。

  initHandlerExceptionResolvers(context);

  //有的Handler处理完后并没有设置View也没有设置ViewName，这时就需要从request获取ViewName了，

  //如何从request中获取ViewName就是RequestToViewNameTranslator要做的事情了。

  initRequestToViewNameTranslator(context);

  //ViewResolver用来将String类型的视图名和Locale解析为View类型的视图。

  //View是用来渲染页面的，也就是将程序返回的参数填入模板里，生成html（也可能是其它类型）文件。

  initViewResolvers(context);

  //用来管理FlashMap的，FlashMap主要用在redirect重定向中传递参数。

  initFlashMapManager(context); 

}
```

:::

## 其它

::: details 1. 定时任务

就是在xml中配置，具体可以看我的[这篇文章](/views/java/quartz.html)

1. 先配置(实例化)一个**业务**，就是我们自己写的类
2. 再配置一个**任务**，jobDetailFactoryBean
   - 在这个任务里name=targetObject 注入我们自己写的那个类
   - 要用哪个方法的话，就name=tagetMethod 注入那个方法
   - name=concurrent  设置为false防止并发执行
3. 再配置**触发器**(cron表达式)，CronTriggerBean
   - name=jobDetail 注入那个任务
   - name=cronExpression  设置定时触发时间
4. 配置一个**调度器**(只能有一个) SchedulerFactoryBean
   - name=triggers 注入要调度的哪个触发器

:::

::: details 2. dubbo

> 参考 [dubbo官网配置]( http://dubbo.apache.org/zh-cn/docs/user/quick-start.html )

- 提供者：提供方应用信息

  配置`<dubbo:registry>`zookeeper注册中心暴露服务地址<br/>
  配置dubbo协议和端口号`<dubbo:protocol>` dubbo协议<br/>`
  <dubbo:service>`声明要暴露的服务接口(或者用注解)

- zookeeper：注册中心

- 消费者：消费方应用信息
  
  配置zookeeper注册中心暴露服务地址`<dubbo:registry>`<br/>
  获取注册中心的接口信息`<dubbo:reference>`
  :::

::: details 3. httpclient短信验证码

> 参考[互亿无线文档]( https://www.ihuyi.com/demo/sms/java.html )

1. 前端点击获取验证码的时候，ajax访问后台请求，同时倒计时60秒
2. 我们在后台拿到短信平台提供的接口地址，然后看他需要什么参数（用户名，密码，手机号，短信验证码），它有文档demo嘛，就根据它的改成我们需要的，然后拼装参数给他返回去
3. 然后他呢也会给我们返回一堆参数(是成功还是失败)，我们把这些参数返回给前端

:::

::: details 4. webService

>  参考博客[简单的webService接口生成]( https://blog.csdn.net/qq_37279783/article/details/86242403)<br/>
> 方法上加@WebMentod(exclude=true)后，此方法不被发布<br/>
> 静态方法不会被发布

1. 配置web.xml文件 设置cxf要拦截的路径<br/>
   		cxf服务端必须定义CXFServlet对象
2. 配置服务端cxf.xml文件 （暴露访问地址,发布接口）<br/>`
   		<cxf:endpoint address="/user" implementor="#实现类"/> `
3. 定义一个bean类
4. 争对这个bean类写一个接口，在接口前加注解<br/>`@javax.jws.WebService`(表示一个服务端发布接口)
5. 在这个接口的实现类加`@javax.jws.WebService`、
   					   `@Service (服务层)`
6. 地址栏登陆时：记得<br/>`
   		http://localhost:8080/工程名/ws(web.xml配置)/自己配置的地址?wsdl`
- 如果用cxf测试接口的话
  1. 配置cxf服务端(以上)
  2. 配置客户端xml 
        		请求地址，和服务端暴露的接口
  3. cmd下 一堆命令

:::

::: details 5.  spring中配置事务

>  [声明式事务配置详解]( https://blog.csdn.net/jiadajing267/article/details/81056057 )

- web.xml加载顺序：

1. listener  加载spring

```xml
 <!-- spring start -->
 <listener>
 	<!-- spring web容器  默认加载spring配置文件路径为 WEB-INF/applicationContext.xml-->
 	<listener-class>
 		org.springframework.web.context.ContextLoaderListener
 	</listener-class>
 </listener>
 
 <context-param>
 	<param-name>contextConfigLocation</param-name>
 	<param-value>classpath:applicationContext*.xml</param-value>
 </context-param>
 <!-- spring end -->
```

2. filter 
3. servlet

```xml
<!-- springmvc start -->
 <servlet>
 	<servlet-name>mvc</servlet-name>
 	<servlet-class>
 		org.springframework.web.servlet.DispatcherServlet
 	</servlet-class>
 	<init-param>
 		<param-name>contextConfigLocation</param-name>
 		<param-value>classpath:springmvc.xml</param-value>
 	</init-param>
 </servlet>
 
 <servlet-mapping>
 	<servlet-name>mvc</servlet-name>
 	<url-pattern>/</url-pattern>
 </servlet-mapping>
 <!-- springmvc end -->
```

- web.xml加载的时候先加载spring，后加载springmvc

1. spring自带aop
2. springmvc没有引入aop
3. 所以springmvc会把spring的aop覆盖
4. 而事务依赖于aop
5. 所以配置的时候可以让springmvc只扫描@Controller注解，spring扫描除了@Controller的其它所有注解

- 以下是具体配置：

```xml
<!-- springmvc配置 -->

<!-- use-default-filters="false" 所有注解不被加载 -->
<context:component-scan base-package="com.xxx" use-default-filters="false">
    <!-- 只加载@Controller注解 -->
    <context:include-filter type="annotation" 
                            expression="org.springframework.stereotype.Controller" />
</context:component-scan>
```

```xml
<!-- spring配置 -->

<!-- use-default-filters="true" 默认、加载所有注解 -->
<context:component-scan base-package="com.xxx">
    <!-- 加载除了@Controller的其它所有注解 -->
    <context:exclude-filter type="annotation" 
                            expression="org.springframework.stereotype.Controller"/>
</context:component-scan>
```

:::