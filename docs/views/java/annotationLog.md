---
title: 注解+AOP实现日志记录
date: 2019-06-13
tags:
- "日志"
categories:
- "后端"
isShowComments: false
---

<Boxx/>

[[toc]]

# 注解+AOP实现日志记录

- 使用注解+AOP实现日志记录

## 1. 编写注解

- com.xxx.xx.util.AuditLogger

### 相关注解

1. **@Retention**(*RetentionPolicy.RUNTIME*)：生命周期为运行时
2. **@Target**( *{ java.lang.annotation.ElementType.METHOD,  
           java.lang.annotation.ElementType.TYPE }*) ：该注解可以用于  类、接口，方法   上

```java
package com.sgcc.bsp.util;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Retention(RetentionPolicy.RUNTIME)
@Target( { java.lang.annotation.ElementType.METHOD,  
        java.lang.annotation.ElementType.TYPE })  
public @interface AuditLogger {  
    
    //日志记录
    public abstract String log();  
    //作用于类和方法上，如果方法注解中该属性不为空,则该方法的类型会覆盖类定义的类型
    public CodeEnum typeCode() default CodeEnum.NULL;
    //作用于方法上，用于标记增加、删除、修改操作，这些操作必须被记录，不能被关闭
    public boolean forceRecord() default false;
    
    public enum CodeEnum {
    	
    	SYSTEM("0"),//系统日志
    	NULL(""),
    	MANAGEMENT("1"),//管理模块
    	OTHER("2"),//其它模块等
    	private String code;
    	
    	private CodeEnum(String code){
    		this.code = code;
    	}
    	public String getCode() {
    		return code;
    	}
    	
    	public void setCode(String code) {
    		this.code = code;
    	}
    }
} 
```

## 2. AOP切入

- com.xxx.xx.util.WebLogAspect

### 相关注解

1. ***@Aspect***：作用是把当前类标识为一个切面类供spring容器读取

2. ***@Pointcut***：Pointcut是植入Advice的触发条件。每个Pointcut的定义包括2部分，一是表达式，二是方法签名。

  方法签名必须是 public及void型。可以将Pointcut中的方法看作是一个被Advice引用的助记符，因为表达式不直观，因此我们可以通过方法签名的方式为 此表达式命名。因此Pointcut中的方法只需要方法签名，而不需要在方法体内编写实际代码。

3. ***@Around***：环绕增强，相当于MethodInterceptor

4. ***@AfterReturning***：后置增强，相当于AfterReturningAdvice，方法正常退出时执行

5. ***@Before***：标识一个前置增强方法，相当于BeforeAdvice的功能，相似功能的还有

6. ***@AfterThrowing***：异常抛出增强，相当于ThrowsAdvice

7. ***@After***: final增强，不管是抛出异常或者正常退出都会执行

```java
@Aspect
public class WebLogAspect {

    @Pointcut("@annotation(com.xxx.xx.util.AuditLogger)")
    public void webLog(){}

    @Before("webLog()")
    public void doBefore(JoinPoint joinPoint) throws Throwable {
    }
    
    @After("webLog()")
    public void doAfter(JoinPoint joinPoint) throws Throwable {
    }

    @AfterReturning(returning = "ret", pointcut = "webLog()")
    public void doAfterReturning(JoinPoint joinPoint,Object ret) throws Throwable {
		handleLogInfo(joinPoint,null);
    }
    
    @AfterThrowing(pointcut = "webLog()", throwing= "error")
    public void afterThrowingAdvice(JoinPoint joinPoint, Throwable error) throws Exception{
		handleLogInfo(joinPoint,error);
    }
}
```

#### Aspect方法执行顺序

```java
before around
before
-- sayHello() --
after around
after
after return
```

### JoinPoint解析

- 获取代理类和被代理类对象

| 方法名                    | 功能                                                         |
| ------------------------- | ------------------------------------------------------------ |
| Signature getSignature(); | 获取封装了署名信息的对象,在该对象中可以获取到目标方法名,所属类的Class等信息 |
| Object[] getArgs();       | 获取传入目标方法的参数对象                                   |
| Object getTarget();       | 获取被代理的对象                                             |
| Object getThis();         | 获取代理对象                                                 |

- 常用方法

```java
//1.获取被代理类上注解
joinPoint.getTarget().getClass().getAnnotation(注解类.class);
//2.获取包名、类名
joinPoint.getTarget().getClass().getPackage());
joinPoint.getTarget().getClass().getSimpleName();
//3.获取被代理类方法上的注解
MethodSignature signature = (MethodSignature) joinPoint.getSignature();
注解 methodAnnotion = signature.getMethod().getAnnotation(注解类.class);
//4.获取方法名
signature.getMethod().getName();
//5.获取第一个方法参数
HashMap mapParam = (HashMap) joinPoint.getArgs()[0];
```



### 核心方法handleLogInfo()

- 处理逻辑

1. 获取typeCode属性（会根据它配置相应模块的日志记录开关）：<br/>判断切入的类和方法的某一注解上有没有对typeCode属性进行赋值，若都没有则默认不进行日志记录，直接return结束

2. 获取方法注解中forceRecord属性值（相当于判断是否必须记录）：<br/>判断是否为需要强制记录的方法（增删改）<br/>如果不是强制记录的方法，则根据日志类型（typeCode）查询判断记录开关是否为必须记录，是则记录

3. 书写逻辑，获取request和JoinPoint拼装参数进行日志记录

4. 对记录信息入库

5. 根据逻辑判断是否需要发送告警邮件

