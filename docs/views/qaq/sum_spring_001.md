---
title: "Q&A宝典-spring入门篇"
date: 2019-12-06
tags:
- 复习
categories:
- 知识晶体 Q&A
isShowComments: false
---

<Boxx/>

## 综合入门

:::details 1.hibernate 和 mybatis 区别？

1. hibernate**自动**，mybatis半自动
2. **日志** hibernate自带
3. **移植性** hibernate：hql qbc面向对象,更换数据库,只更换方言即可
4. **优化**	  mybatis自己写sql灵活方便
5. 一级**缓存**<br/>
   		hibernate底层是Hashtable 线程安全<br/>
      		mybatis底层是HashMap		线程不安全

:::details 2.spring容器启动流程、配置

- 配置spring.xml

1. 初始化springIOC容器,加载spring.xml<br/>
    		`ApplicatonContext ac =
        			new ClassPathXmlApplicationContext("spring.xml");`
  
2. 扫描注解<br/>`<context:component-scan base-package="com.etoak">`

3. 配置spring加载数据源

   - DriverManagerDataSource

4. 配置spring整合mybatis

   - 注入数据源
   - 设置别名(包下所有类类名全部小写)
   - 加载 sql.xml映射文件
   - 加载 PageHelper等插件

5. 配置扫描接口(sql.xml文件所在包)

   - 获得sqlSessionFactory(上一步的3以获得)
       			sqlSessionFactoryBeanName
   - 实例化接口
       			basePackage

6. 配置事务管理器(只需注入数据源)

   ```xml
   <bean id="tx" class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
       <property name="dataSource" ref="dataSource"></property>
   </bean>
   ```

   

7. 注解(在需要事务的方法上@Transactional)使用声明事务(底层我们用cglib动态代理)

   注意属性readOnly="true"为只读，在select时可以设置<br/>

   ```xml
   <!-- 配置事务管理器 -->
   <bean id="tx" class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
       <!-- 注入数据源  加入事务   但是没有开启事务 -->
       <property name="dataSource" ref="dataSource"></property>
   </bean>
   
   <!-- 声明式事务  aop环绕通知-->
   <tx:annotation-driven proxy-target-class="true" transaction-manager="tx" />
   ```

   

:::

:::details 3.什么是事务?

​	多条sql语句作为一个执行单元,**要么全部执行,要么全不执行**

- 原子性、一致性、隔离性、持久性

:::

:::details 4.spring创建事物的方式?(两种)

1. **声明式事务** 在xml中配置信息
2. **编程式事务** 在代码中编写

:::

:::details 5.软编码硬编码

- **硬编码**：就是在程序中将代码写死,维护不方便
- **软编码**：可以在运行时确定,软编码只支持post请求

:::

:::details 6.web.xml文件加载先后顺寻

1. ***listener***<br/>
   ​		多个监听器	谁在前	谁先被加载
2. ***filter***<br/>
   		多个过滤器	谁在前	谁先被加载
3. ***servlet***<br/>
   		启动不会被加载
      		当第一个请求发送过来时`<url-pattern>*.do</url-pattern>` 才会被实例化

:::

:::details 7.HttPServlet声明周期

1. 实例化 
2. 初始化方法
3. 运行(doGet/doPost) 
4. 消亡

:::

:::details 8.springmvc提供的两种视图类型

1. **ModelAndView**
2. **String**

:::

:::details 9.重定向和请求转发

1. **请求转发**：发送一次请求,跳转后地址栏不发生改变
2. **重定向**：跳转后地址栏发生改变<br/>
   主要用在防止表单重复提交、
   不能使用request范围、
   跳转之后肯定执行doGet方法

:::

:::details 10.springmvc流程

1. 新建一个页面,发送**第一次请求地址**

2. **到达web.xml**，web.xml依次加载

   - ***listener***：初始化spring容器
   - ***filter***：设置请求、响应编码
   - ***servlet***：
     				默认加载WEB-INF/某某某(注意名字保持一致,可自定义)-servlet.xml配置文件
     				拦截请求

3. 加载XXX-servlet.xml配置文件并解析<br/>

   ​		[1] context注解扫描<br/>
   ​			  springmvc必须的有@Controller注解(得在这层接收客户端请求)<br/>

   ​		[2] 配置映射器、适配器 、类型转换(底层自动实现)<br/>
   ​			<mvc:acnotation-driven />

   ​		[3] 实例化视图解析器<br/>

   ```xml
   <!-- 视图解析器 -->
   <bean class="org.springframework.web.servlet.view.InternalResourceViewResolver">
       <!-- 前缀 -->
       <property name="prefix"
                 value="/pages/"></property>
       <!-- 后缀 -->
       <property name="suffix"
                 value=".jsp"></property>
   </bean>
   ```

   

   ​		[4] 文件上传解析器,id必须是这个

   ```xml
   <bean id="multipartResolver" class="org.springframework.web.multipart.commons.CommonsMultipartResolver">
       <property name="defaultEncoding" value="utf-8" />
       <property name="maxUploadSize" value="3000000000" />
   </bean>
   ```

   

4. 通过拦截的请求来**匹配@Controller层**

   ​		[1] 映射器匹配拿到的请求
   ​			在某个方法上@RequestMappeing(value="/login")

   ​		[2] 适配器指定执行这个方法

   ​		[3] 接受请求参数,并经行类型转换
   @RequestParam(valeu="前台name")<br/>
   ​			注意日期不能自动转,所以有个注解@DateTimeFormat(pattern="yyyy-MM-dd")

5. **执行方法**里的业务逻辑
   
6. **ModelAndView**跳转视图<br/>
   ModelAndView mv = new ModelAndView("除前后缀页面");
   ​		return mv;

7. 视图解析器**渲染视图**名称,完成之后跳转视图

:::

:::details 11.springmvc组成部分

1. **自中央处理器**	DispatcherServlet<br/>
2. **映射器**		mvc:annotation-driven	@RequestMappeing<br/>
3. **适配器**		mvc:annotation-driven	执行方法
4. **处理器**		@Controller<br/>
5. **视图解析器**	InternalResourceViewResolver<br/>
6. **视图**         我们看不见，底层动的<br/>
7. **异常处理器**<br/>
8. **上传解析器**

:::

:::details 12.spring Bean 声明周期

​	[spring Bean 声明周期](https://blog.csdn.net/admin9527_/article/details/78506135)

:::

:::details 13.如何在src目录加载properties

`<context:property-placeholder file-encoding="UTF-8"
						location="classpath:jdbc.properties"/>`

:::

:::details 14.将文件存放到数据库中

| mysql    | oracle | java   |            |
| -------- | ------ | ------ | ---------- |
| longblob | blob   | byte[] | 二进制类型 |
| text     | clob   | String | 大文本类型 |

:::

:::details 15.springmvc文件上传

​	有个类MultipartFile、方法transferTo

```java
public String upload(@RequestParam(value="f") MultipartFile f,HttpSession session){

    //MultipartFile有transferTo()这么一个方法写出文件
    f.transferTo(new File(path,filenewname));

}
```
- springmvc文件下载

  记得设置响应头信息
  		`response.setHeader("Content-Disposition","attachment;filename="+filename);`

:::

:::details 16，springmvc 提供2种 请求格式

1. \*.do、\*.action

2.  /       默认不加载静态资源  js css <br/>				默认不加载静态资源，要加载的话需要在spring配置文件中配置解析
	
	```xml
	<!-- 静态servlet对象 针对/请求不加载静态资源 js css img  -->
	<mvc:default-servlet-handler />
	```

:::

:::details 17.在前端 json 和 js对象的互转

- JSON.parse(str);
- JSON.stringify(object);

:::

:::details 18.springmvc集成spring,可以使用spring拥有的信息,但只能使用spring的ioc信息,aop不能使用

​		即：容器启动时,spring先加载,springmvc后加载<br/>
​			spring 	  配置事务,事务底层时aop实现的,springmvc没有aop的配置<br/>
​			**springmvc 没有配置事务,所以会覆盖掉spring配置**<br/>

​		所以事务会失效，***解决办法***：<br/>
​			`让springmvc不扫描有事务的层(service层)只扫描Controller层`<br/>
​			`让spring扫描除了Controller的其他层`

:::

:::details 19.数据库建表3范式

1. 关系型数据库<br/>
   		表、字段、值	**有相互关系**
2. 创建字段<br/>
   		所有字段中**必须有一个字段是唯一的**
3. **字段不能冗余**

:::

:::details 20.disabled和readonly的区别

- 都是使文本框失效(不能输入)<br/>
  	***disabled***：前端显示为灰色,后台接受值为null<br/>
    	***readonly***：前端显示为白色,后台可以接受到值

:::

:::details 21.bootstrap和easyui区别

- easyui 	  是**js框架**,没有响应式布局
- bootstrap 侧重css的前端框架,有**响应式布局**

:::

:::details 22.js中 == 和 === 的区别

​	== 只比较内容<br/>
​	===	先比较类型，再比较内容

:::

:::details 23.过滤器和拦截器的区别

- 过滤器：<br/>
  		在web.xml中配置,**由servlet**实例化对象,spring不能注入,**什么请求都拦截**
- 拦截器：<br/>
  		只拦截后台请求,
    		都是**由spring进行管理**的,springmvc**除了jsp之外都拦截**

:::

:::details 24.struts2和springmvc的区别

1. **入口**<br/>
   			struts2：web.xml filter元素,容器启动初始化<br/>
      			mvc:		web.xml servlet元素,第一次触发请求实例化对象
2. **创建对象**<br/>
   			struts2： 基于类开发,发送请求时,每次都会创建对象,多例的<br/>
      			mvc:	基于方法开发,一般设计为单例(默认)
3. **接受请求参数**<br/>
   			struts2:	成员变量	依赖类存在<br/>
      			mvc:		局部变量	依赖方法存在

:::

:::details 25.数据库中的符号

​	 and 相当于	&&<br/>
​	 or 相当于	||<br/>
​	 `&gt; ` 相当于	><br/>
​	` &lt;` 相当于	<<br/>

:::

:::details 26.事务的	隔离机制和七种传播途径

- 脏读:读到了其他事物未提交的数据

- 不可重复读:一次读取到记录之后其他事物对这条数据进行了修改,再次读取数据不一致

- 幻读:相同的查询条件首次查询后,其他事物添加或删除了新的数据,再次查询不一致

- 隔离机制：(解决脏读,不可重复读,幻读)

|  |脏读|				不可重复读|			幻读|
|--|--|--|--|
|Read uncommitted : |		会	|				会		|		会|
|Read committed :	|	不会	|				会		|		会|
|Repeatable read : 	|	不会		|			不会		|		会|
|Serializable : 	|		不会		|			不会	|			不会|

- 传播行为:<br/>
	国内最常用的就是propagation_required
	**事务的操作有异常是都得向上抛**,不能向上抛就自己new一个异常,不要try(非要try的话,就自己在造一个异常)。

:::

:::details 27.随便写一个自增编号

```java
Calendar c = Calendar.getInstance();
String no = "ABC" + c.get(1) + String.format("%04d",(++count));
```

:::

:::details 28.maven的作用

- 依赖管理jar包
- 基于多模块

:::

:::details 29.xml和对象的互转

​	java jaxb

:::

:::details 30.网络传输,跨项目访问

- ***webService***: 既可以当客户端又可以当服务端
  1. 跨平台	跨语言
  2. 多用在企业
  3. soap协议
  4. `http://localhost:8080/SSM/ws/user?wsdl`
- ***httpclient***: 相当于客户端
  1. 多用在互联网  调接口/新老系统模块的调用
  2. http协议
  3. `http://localhost:8080/SSM/ws/user`

:::

:::details 31.webService如何使用

- **服务端**：

  
  
  0. 先在web.xml文件中配置
  1. 配置服务端cxf.xml文件
  2. 定义一个bean类
  3. 争对这个bean写一个接口,在接口前加注解@javax.jws.WebService
  4. 在这个接口里写响应的增删该查(定义方法的参数和返回值时 注意不要使用Map对象)
  5. 针对接口写实现类
  6. 在实现类上加@javax.jws.WebService
      ，@org.springframework.stereotype.Service //这是一个服务层
         		在类里写响应的实现
  
- **客户端**：

  0. 新建一个测试项目
  1. 配置客户端cxf.xml文件
       	（具体使用见下一题）<br/>
       将生成的文件复制到工程中,新建一个test类测试

:::

:::details 32.cxf测试接口的工具如何使用:

1. **配置cxf环境变量**<br/>
   path=E:\web server\apache-cxf-3.1.11\bin

2. **cmd下输入命令**<br/>
	`wsdl2java -d d:/ws  -p com.etoak.client http://localhost:8080/SSM/ws/user?wsdl`<br/>
`-d`表示生成客户端代码的位置<br/>
`-p`表示生成客户端代码的包结构
- 其它方式：**soapui工具**
:::
