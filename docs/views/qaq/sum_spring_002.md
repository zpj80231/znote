---
title: "Q&A宝典-spring基础篇"
date: 2019-12-29
tags:
- 复习
categories:
- 总结
isShowComments: false
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

## SpringMVC

::: details 1、什么是Spring MVC ？简单介绍下你对springMVC的理解?

Spring MVC是一个基于MVC架构的用来简化web应用程序开发的应用开发框架，它是Spring的一个模块,无需中间整合层来整合。

它和Struts2一样都属于**表现层框架**。在web模型中，MVC是一种很流行的框架，通过把Model，View，Controller分离，把较为复杂的web应用分成逻辑清晰的几部分，简化开发，减少出错，方便组内开发人员之间的配合。

::: 

::: details 2、SpringMVC的流程？

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

::: details 3、Springmvc的优点:

（1）它是基于**组件技术**的。全部的应用对象,无论控制器和视图,还是业务对象之类的都是 java组件，并且和Spring提供的其他基础结构紧密集成

（2）不依赖于Servlet API(目标虽是如此,但是在实现的时候确实是依赖于Servlet的)

（3）可以任意使用各种视图技术，而不仅仅局限于JSP

（4）支持各种请求资源的映射策略

（5）它应是易于扩展的

:::

::: details 4、Spring MVC的主要组键？

（1）**前端控制器**DispatcherServlet（不需要程序员开发）

作用：接收请求、响应结果 相当于转发器，有了DispatcherServlet 就减少了其它组件之间的耦合度。

（2）**处理器映射器**HandlerMapping（不需要程序员开发）

作用：根据请求的URL来查找Handler

（3）**处理器适配器**HandlerAdapter

注意：在编写Handler的时候要按照HandlerAdapter要求的规则去编写，这样适配器HandlerAdapter才可以正确的去执行Handler。

（4）**处理器**Handler（需要程序员开发）

（5）**视图解析器** ViewResolver（不需要程序员开发）

作用：进行视图的解析 根据视图逻辑名解析成真正的视图（view）

（6）**视图**View（需要程序员开发jsp）

View是一个接口， 它的实现类支持不同的视图类型（jsp，freemarker，pdf等等）

:::

::: details 5、springMVC和struts2的区别有哪些?

（1）**入口不同**：springmvc的入口是一个`servlet`即前端控制器（DispatchServlet）<br/>struts2入口是一个`filter`过虑器（StrutsPrepareAndExecuteFilter）。

（2）**实现方式不同**：springmvc是**基于方法开发**(一个url对应一个方法)，请求`参数传递到方法的形参`，可以设计为**单例**或多例(建议单例)<br/>struts2是**基于类开发**，`传递参数是通过类的属性`，只能设计为**多例**。

（3）**参数解析不同**：Struts采用值栈存储请求和响应的数据，通过OGNL存取数据<br/>springmvc通过参数解析器是将request请求内容解析，并给方法形参赋值，将数据和视图封装成ModelAndView对象，最后又将ModelAndView中的模型数据通过reques域传输到页面。Jsp视图解析器默认使用jstl。

:::

::: details 6、SpringMVC怎么样设定重定向和转发的？

（1）在返回值前面加"`forward:`"就可以让结果转发,譬如"`forward:user.do?name=method4`"

（2）在返回值前面加"`redirect:`"就可以让返回值重定向,譬如"`redirect:http://www.baidu.com`"

:::

::: details 7、SpringMvc怎么和AJAX相互调用的？

通过Jackson框架就可以把Java里面的对象直接转化成Js可以识别的Json对象。具体步骤如下 ：

（1）加入Jackson.jar

（2）在配置文件中配置json的映射

（3）在接受Ajax的方法里面可以直接返回Object,List等,但方法前面要加上@ResponseBody注解。

:::

::: details 8、SpringMvc里面拦截器是怎么写的：

有两种写法,一种是**实现HandlerInterceptor接口**,另外一种是**继承适配器类**,接着在接口方法当中，实现处理逻辑；然后在SpringMvc的配置文件中配置拦截器即可:

```xml
<!-- 配置SpringMvc的拦截器 -->
<mvc:interceptors>
	
    <!-- 配置一个拦截器的Bean就可以了 默认是对所有请求都拦截 -->
	<bean id="myInterceptor" class="com.abc.action.MyHandlerInterceptor"></bean>
	
    <!-- 只针对部分请求拦截 -->
	<mvc:interceptor>
    	<mvc:mapping path="/modelMap.do" />
		<bean class="com.abc.action.MyHandlerInterceptorAdapter" />
	</mvc:interceptor>

</mvc:interceptors>
```

:::

::: details 9、如何解决POST请求中文乱码问题，GET的又如何处理呢？

（1）**解决post**请求乱码问题：

在web.xml中加入：

```xml
<filter>

  <filter-name>CharacterEncodingFilter</filter-name>

  <filter-class>org.springframework.web.filter.CharacterEncodingFilter</filter-class>

  <init-param>

    <param-name>encoding</param-name>

    <param-value>utf-8</param-value>

  </init-param>

</filter>

<filter-mapping>

  <filter-name>CharacterEncodingFilter</filter-name>

  <url-pattern>/*</url-pattern>

</filter-mapping>
```

（2）**解决get**请求中文参数出现乱码解决方法有两个：

①修改tomcat配置文件添加编码与工程编码一致，如下：

`<ConnectorURIEncoding="utf-8" connectionTimeout="20000" port="8080" protocol="HTTP/1.1" redirectPort="8443"/>`

 ②另外一种方法对参数进行重新编码：

`String userName = new String(request.getParamter("userName").getBytes("ISO8859-1"),"utf-8")`

ISO8859-1是tomcat默认编码，需要将tomcat编码后的内容按utf-8编码。

:::

::: details 10、Spring MVC的异常处理 ？

可以将异常**抛给Spring框架**，由Spring框架来处理；我们只需要配置简单的异常处理器，在异常处理器中添视图页面即可。

:::

::: details 11、SpringMvc的核心入口类是什么,Struts1,Struts2的分别是什么：

SpringMvc的是**DispatchServlet**

Struts1的是**ActionServlet**

Struts2的是**StrutsPrepareAndExecuteFilter**

:::

::: details 12、SpringMvc的控制器是不是单例模式,如果是,有什么问题,怎么解决？

是单例模式，所以在多线程访问的时候**有线程安全问题**，不要用同步，会影响性能的，解决方案是在控制器里面不能写字段。

:::

::: details 13、SpingMvc中的控制器的注解一般用那个,有没有别的注解可以替代？

一般用`@Conntroller`注解,表示是表现层,不能用用别的注解代替。

:::

::: details 14、 @RequestMapping注解用在类上面有什么作用？

是一个用来处理请求地址映射的注解，可用于类或方法上。用于类上，表示类中的所有响应请求的方法都是以该地址作为父路径。

:::

::: details 15、怎么样把某个请求映射到特定的方法上面？

直接在方法上面加上注解`@RequestMapping`,并且在这个注解里面写上要拦截的路径。

:::

::: details 16、如果在拦截请求中,我想拦截get方式提交的方法,怎么配置？

可以在@RequestMapping注解里面加上`method=RequestMethod.GET`。

:::

::: details 17、怎么样在方法里面得到Request,或者Session？

直接在方法的形参中声明request,SpringMvc就自动把request对象传入。

:::

::: details 18、如果想在拦截的方法里面得到从前台传入的参数,怎么得到？

直接在形参里面声明这个参数就可以,但**必须名字和传过来的参数一样**。

:::

::: details 19、如果前台有很多个参数传入,并且这些参数都是一个对象的,那么怎么样快速得到这个对象？

直接在方法中声明这个对象,SpringMvc就自动会把属性赋值到这个对象里面。

:::

::: details 20、SpringMvc中函数的返回值是什么？

返回值可以有很多类型,有`String`, `ModelAndView`，但一般用String比较好。

:::

::: details 21、SpringMvc用什么对象从后台向前台传递数据的？

1. 使用Map、Model和ModelMap的方式

```java
@RequestMapping("/test")
public String test(Map<String,Object> map,Model model,ModelMap modelMap,HttpServletRequest request){
    //1.放在map里  
    map.put("names", Arrays.asList("caoyc","zhh","cjx"));
    //2.放在model里 建议使用
    model.addAttribute("time", new Date());
    //3.放在request里  
    request.setAttribute("request", "requestValue");
    //4.放在modelMap中 
    modelMap.addAttribute("city", "ChengDu");
    modelMap.put("gender", "male");
    return "hello";
}
```

 JSP写法: 

```jsp
time:${requestScope.time}
names:${requestScope.names }
city:${requestScope.city }
gender:${requestScope.gender }
request:${requestScope.request}
```

2. 使用ModelAndView的方式:

```java
@RequestMapping(value="/test2.do",method = RequestMethod.POST)  
public ModelAndView checknameIsExist2(@RequestParam("sid") String sid,Model model,HttpServletRequest request) {  
    ModelAndView mav = new ModelAndView();  
    mav.addObject("ModelAndView", "ModelAndViewValue");  
    //设置要跳转的页面，与返回值时String时返回success类似，以下跳转到/student/studentList.jsp  
    mav.setViewName("/student/studentList");  
    return mav;  
```



:::

::: details 22、SpringMvc中有个类把视图和数据都合并的一起的,叫什么？

叫**ModelAndView**。

:::

::: details 23、怎么样把ModelMap里面的数据放入Session里面？

可以在类上面加上 **@SessionAttributes** 注解,里面包含的字符串就是要放入session里面的key。

:::

::: details 24、当一个方法向AJAX返回特殊对象,譬如Object,List等,需要做什么处理？

要加上 **@ResponseBody** 注解。

:::

::: details 25、读过springmvc源码？

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



 