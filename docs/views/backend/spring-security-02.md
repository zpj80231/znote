---
title: Spring Security 认证授权
date: 2022-12-19
tags:
- 分布式
- Spring Security 
categories:
- 后端 Back-end 
isShowComments: true
---

<Boxx/>

<!-- more -->

[[toc]]

## 简介

在 Spring Boot 风靡的今天，一款强大的安全管理框架必不可少，作为 Spring Boot 项目首选的默认安全技术选型，对 Spring Security 的学习必不可少，其实主要包括 **认证** 和 **授权** 两部分。

而 Spring Security 的底层原理其实也就是一个 **过滤器链**，通过一个过滤器链中的不同过滤器组件实现不同的安全功能。

![过滤器链](/znote/img/backend/20200719232119971.png)

过滤器链中的前三个部分都是可配置的，我们也可以在指定过滤器之前或之后添加我们自定义的过滤器。而 ExceptionTranslationFilter 和 FilterSecurityInterceptor 是一定会执行的。

Spring Security 默认的过滤器：

| 序号 | 过滤器                                   | 描述                                                         |
| ---- | ---------------------------------------- | ------------------------------------------------------------ |
| 1    | SecurityContextPersistenceFilter         | 首当其冲的一个过滤器，非常重要，主要是使用SecurityContextRepository在session中保存或更新一个SecurityContext，并将SecurityContext给以后的过滤器使用，来为后续filter建立所需的上下文，SecurityContext中存储了当前用户的认证和权限信息。 |
| 2    | WebAsyncManagerIntegrationFilter         | 此过滤器用于继承SecurityContext到Spring异步执行机制中的WebAsyncManager，和spring整合必须的。 |
| 3    | HeaderWriterFilter                       | 向请求的header中添加响应的信息，可以在http标签内部使用 security:headers 来控制。 |
| 4    | CsrfFilter                               | Csrf又称跨域请求伪造，SpringSecurity会对所有post请求验证是否包含系统生成的csrf的token信息，如果不包含则报错，起到防止csrf攻击的效果。 |
| 5    | LogoutFilter                             | 匹配URL为/logout的请求，实现用户退出，清楚认证信息。         |
| 6    | **UsernamePasswordAuthenticationFilter** | 认证操作全靠这个过滤器，默认匹配URL为/login且必须为POST请求。 |
| 7    | DefaultLoginPageGeneratingFilter         | 如果没有在配置文件中指定认证页面，则由该过滤器生成一个默认的认证界面。 |
| 8    | DefaultLogoutPageGeneratingFilter        | 由此过滤器生成一个默认的退出登录页面。                       |
| 9    | BasicAuthenticationFilter                | 此过滤器会自动解析HTTP请求中头部名字为Authentication，且以Basic开头的头部信息。 |
| 10   | RequestCacheAwareFilter                  | 通过HttpSessionRequestCache内部维护一个RequestCache，用于缓存HttpServletRequest。 |
| 11   | SecurityContextHolderAwareRequestFilter  | 针对ServletRequest进行一次包装，使得request具有更加丰富的API。 |
| 12   | AnonymousAuthenticationFilter            | 当SecurityContextHolder中认证信息为空，则会创建一个匿名用户存储到SecurityContextHolder中，SpringSecurity为了兼容未登录的访问，也走了一套认证流程，只不过是一个匿名的身份。 |
| 13   | SessionManagementFilter                  | SecurityContextRepository限制同一个用户开启多个会话的数量。  |
| 14   | **ExceptionTranslationFilter**           | 异常转换过滤器位于整个SpringSecurityFilterChain的后方，用来转换整个链路中出现的异常。 |
| 15   | **FilterSecurityInterceptor**            | 获取所有配置资源的访问授权信息，根据SecurityContextHolder中存储的用户信息来决定其是否有权限。 |

Spring 虽提供了拦截器，但 Spring Security 使用过滤器实现的主要原因是因为：过滤器是 servlet 层面的，而拦截器是 spring 层面的。一个请求进来的时候会依次经过：`Filter -> Servlet -> Inteceptor -> Controller`，若用 Inteceptor（拦截器）实现的话，可能一些请求已经被 Filter（过滤器） 过滤掉了导致Inteceptor（拦截器）无法处理。所以 Filter（过滤器）作为请求的入口，安全框架应该从 Filter（过滤器） 入手。

## 认证

认证流程：

1. 请求进来后先经过 **用户名密码认证过滤器**（这个在使用JWT的情况下会被我们自己实现的 **JwtAuthenticationTokenFilter** 代替），只要用户的请求满足该过滤器的条件，即认证成功（这些都是我们后续在代码中自己实现）。如果不满足则放行给下一个；
2. 请求继续向后，经过 **BasicAutenticationFilter** 继续进行认证，直到最后 **FilterSecurityInterceptor** 拦截器，它是API的最后一环，由它来决定请求是否能到达具体的API。简单来说，就是负责权限校验（利用 **SecurityContextHolder** 来获取用户的权限相关信息）;

   1. 它会根据我们配置的一些要求，来进行判断，如果不通过则抛出异常

   2. 例如某API要求请求必须经过认证，则在最后一个拦截器处，请求如果没有进行认证，则抛出对应的异常

   3. 比如某API要求请求具有VIP的权限，则最后一个拦截器会判断该请求是否具有VIP权限
3. **ExceptionTranslationFilter** 的作用主要是捕获 **FilterSecurityInterceptor** 抛出的异常( **AccessDeniedException** 和 **AuthenticationException** )，并做响应的处理
4. 黄色的部分可以通过配置来决定是否存在于过滤器链上，即由我们来决定使用哪些认证方式

![认证流程](/znote/img/backend/fe935daca752e32778b690d8660cab00.png)

## 授权

### 基于注解的鉴权

基于方法的权限管理主要是通过AOP来实现的，spring security 中通过 MethodSecurityInterceptor 来提供相关的实现。不同在于，FilterSecurityInterceptor 只是在请求之前进行前置处理，MethodSecurityInterceptor 在此基础上还可以进行后置处理。前置处理就是在请求之前判断是否具备相应的权限，后置处理则是对方法的执行结果进行二次过滤。

1. 通过`@EnableGlobalMethodSecurity(prePostEnabled = true)`注解开启权限注解的使用

2. *`@PreAuthorize`*

   ```java
   @Service
   public class HelloService {
   	// 执行该方法必须具备ADMIN角色才可以访问
       @PreAuthorize("hasRole('ADMIN')")
       public String preAuthorizeTest01() {
           return "Hello";
       }
       // 访问者名称必须是javaboy，而且还需要同事具备ADMIN角色才可以访问
       @PreAuthorize("hasRole('ADMIN') and authentication.name == 'javaboy'")
       public String preAuthorizeTest02() {
           return "Hello";
       }
       // 通过#引用方法参数，并对其进行校验，表示请求者的用户名必须等于方法参数name的值，方法才可以被执行
       @PreAuthorize("authentication.name == #name")
       public String preAuthorizeTest03(String name) {
           return "Hello: " + name;
       }
   }
   
   @SpringBootTest
   class BasedOnMethodApplicationTests {
   	@Autowired
       HelloService helloService;
       @Test
       // 通过该注解设定当前执行的用户角色是ADMIN
       @WithMockUser(roles = "ADMIN")
       void preAuthorizeTest01() {
           String hello = helloService.preAuthorizeTest01();
           Assertions.assertNotNull(hello);
           Assertions.assertEquals("Hello", hello);
       }
       @Test
       @WithMockUser(roles = "ADMIN", username = "javaboy")
       void preAuthorizeTest02() {
           String hello = helloService.preAuthorizeTest02();
           Assertions.assertNotNull(hello);
           Assertions.assertEquals("Hello", hello);
       }
       @Test
       @WithMockUser(username = "javaboy")
       void preAuthorizeTest03() {
           String hello = helloService.preAuthorizeTest03("javaboy");
           Assertions.assertNotNull(hello);
           Assertions.assertEquals("Hello: javaboy", hello);
       }
   }
   ```

### 基于url的动态鉴权

鉴权主要在 FilterSecurityInterceptor 这个类，如果默认的 FilterSecurityInterceptor 不满足要求，那我们就重写它就好了。

1. 实现 FilterInvocationSecurityMetadataSource.getAttributes 提供一个 url 对应的所需权限集合
2. 实现 AccessDecisionManager.decide 将当前登录用户的权限和 url 的所需权限比对，有则鉴权通过

代码已经完成，实例可参考项目：[https://github.com/zpj80231/imall](https://github.com/zpj80231/imall) admin 模块

## 参考

- [Spring Security 认证与授权流程](https://blog.csdn.net/qq_53578500/article/details/125938103)
- [Spring Security 基本认证，授权流程，原理方法](https://blog.csdn.net/qq_14930709/article/details/125348833)
- [Spring Security 权限管理](https://blog.csdn.net/qq_39748549/article/details/123847030)

<Reward/>
