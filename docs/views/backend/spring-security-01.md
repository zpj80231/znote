---
title: Spring Security 初识
date: 2021-09-16
tags:
- 分布式
- Spring Security
categories:
- 后端 Back-end
isShowComments: true
---

<Boxx/>

Spring Security或者说web安全最核心的两个部分即：`认证（Authentication）` 和 `授权（Authorization）。`

- 认证：用户是否能登录
- 授权：用户是否有权限去做某些事情

即不用的用户登录之后有不同的权限可以去做某些事情。

<!-- more -->

[[toc]]

## 简介

官网是最好的答案：https://spring.io/projects/spring-security

## 主流web安全框架

**spring-security**：与spring无缝整合，可定制化程度高，权限控制较全面，缺点即重量级，配置繁琐（但springboot出来后就没简单了）。

**shiro**：轻量级，简单，缺点即没有spring-security功能完善，在web一些特殊需求下需要二次开发。

因此，一般组合如下：

- SSM + Shiro
- Spring Boot/Spring Cloud + Spring Security

## 重要组件

### UserDetailsService

- 数据库查询用户，校验密码的过程写在这里

当什么也没有配置的时候，账号和密码是由 Spring Security 定义生成的。而在实际项目中账号和密码都是从数据库中查询出来的。 所以我们要通过自定义逻辑控制认证逻辑。

如果需要自定义逻辑时，只需要实现 UserDetailsService 接口即可。

```java
public interface UserDetailsService {
    //数据库查询用户，校验密码的过程写在这里
    UserDetails loadUserByUsername(String var1) 
        throws UsernameNotFoundException;
}
```

### UserDetails

实现UserDetails接口，Spring默认实现是User，而我们自定义用户实体类（包含用户名、密码、权限），以后我们只需要使用自定义的 User 实体类即可。

```java
// 表示获取登录用户所有权限
Collection<? extends GrantedAuthority> getAuthorities();
// 表示获取密码
String getPassword();
// 表示获取用户名
String getUsername();
// 表示判断账户是否过期
boolean isAccountNonExpired();
// 表示判断账户是否被锁定
boolean isAccountNonLocked();
// 表示凭证{密码}是否过期
boolean isCredentialsNonExpired();
// 表示当前用户是否可用
boolean isEnabled();
```

### PasswordEncoder

PasswordEncoder是Spring Security密码加密的一个工具接口；

BCryptPasswordEncoder 是最好的实现方式， Spring Security 官方推荐的密码解析器，项目中一般都是用这个工具。

BCryptPasswordEncoder 是对 bcrypt 强散列方法的具体实现。是基于 Hash 算法实现的单向加密。可以通过 strength 控制加密强度，默认 10。

### WebSecurityConfigurerAdapter

详细解释见：[WebSecurityConfigurerAdapter 解析](https://www.jianshu.com/p/e0efe22a5b69)

Spring Security 的**核心配置**就是继承 WebSecurityConfigurerAdapter 并注解 @EnableWebSecurity 的配置。这个配置指明了用户名密码的处理方式、请求路径、登录登出控制等和安全相关的配置。

WebSecurityConfigurerAdapter中创建了一个SecurityConfigurer类型的HttpSecurity实例来真正完成安全的装配，HttpSecurity也提供了很多方法来方便对各种安全机制的配置。

```java
@Configuration
public class SecurityConfig extends WebSecurityConfigurerAdapter {
	//  注入 PasswordEncoder  类到 spring  容器中
	@Bean
	public PasswordEncoder passwordEncoder(){
		return new BCryptPasswordEncoder();
	}
    
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        //  配置认证
        http.formLogin()
            .loginPage("/index") //  配置哪个 url 为登录页面
            .loginProcessingUrl("/login") //  设置哪个是登录的 url 。
            .successForwardUrl("/success") //  登录成功之后跳转到哪个 url
            .failureForwardUrl("/fail");//  登录失败之后跳转到哪个 url
        http.authorizeRequests()
            .antMatchers("/layui/**","/index") // 表示配置请求路径
            .permitAll() //  指定 URL 无需保护。
            .antMatchers("/system").hasAnyAuthority('menu:system')//是否具有某个权限
            .anyRequest() //  其他请求
            .authenticated(); // 需要认证
        //  关闭 csrf
        http.csrf().disable();
    }
}
```

### 鉴权注解

如上，可以在配置类里以`http.antMatchers("/system").hasAnyAuthority('menu:system')//是否具有某个权限`配置，也可以使用相关注解

#### @Secured

判断是否具有角色，另外需要注意的是这里匹配的字符串需要添加前缀“ROLE_“。

> 使用注解先要开启注解功能！
> **@EnableGlobalMethodSecurity(securedEnabled=true)**

使用：

```java
@RequestMapping("/testSecured")
@ResponseBody
@Secured({"ROLE_normal","ROLE_admin"})
public String helloUser() {
    return "hello,user";
}
```

#### @PreAuthorize

一般作为进入方法前的权限验证使用，@PreAuthorize 可以将登录用户的 roles/permissions 参数传到方法中。

> 先开启注解功能：
> **@EnableGlobalMethodSecurity(prePostEnabled = true)**

使用：

```java
@RequestMapping("/testPreAuthorize")
@ResponseBody
//@PreAuthorize("hasRole('ROLE_ 管理员 ')")
@PreAuthorize("hasAnyAuthority('menu:system')")
public String preAuthorize(){
    System.out.println("preAuthorize");
    return "preAuthorize";
}
```

#### @PostAuthorize

使用并不多，在方法执行后再进行权限验证，适合验证带有返回值
的权限。

> 先开启注解功能：
> @EnableGlobalMethodSecurity(prePostEnabled = true)

#### @PostFilter

权限验证之后对数据进行过滤 留下用户名是 admin1 的数据

```java
@RequestMapping("getAll")
@PreAuthorize("hasRole('ROLE_ 管理员')")
//表达式中的 filterObject 引用的是方法返回值 List 中的某一个元素
@PostFilter("filterObject.username == 'admin1'")
@ResponseBody
public List<UserInfo> getAllUser(){
    ArrayList<UserInfo> list = new ArrayList<>();
    list.add(new UserInfo(1l,"admin1","6666"));
    list.add(new UserInfo(2l,"admin2","888"));
    return list;
}
```

####  @PreFilter

进入控制器之前对数据进行过滤

```java
@RequestMapping("getTestPreFilter")
@PreAuthorize("hasRole('ROLE_ 管理员')")
@PreFilter(value = "filterObject.id%2==0")
@ResponseBody
public  List<UserInfo>  getTestPreFilter(
    			@RequestBody  List<UserInfo> list){
    list.forEach(t-> {
        System.out.println(t.getId()+"\t"+t.getUsername());
    });
    return list;
}
```

### remember-me

基于数据库的记住我：

1. 添加数据库的配置文件

   ```yaml
   spring:
       datasource:	
           driver-class-name: com.mysql.jdbc.Driver
           url: jdbc:mysql://localhost:3306/test
           username: root
           password: root
   ```

2. 编写配置类

   ```java
   @Configuration
   public class RememberMeSecurityConfig {
       @Autowired
       private DataSource dataSource;
       @Bean
       public PersistentTokenRepository persistentTokenRepository(){
           JdbcTokenRepositoryImpl  jdbcTokenRepository  =  new
           JdbcTokenRepositoryImpl();
           //  赋值数据源
           jdbcTokenRepository.setDataSource(dataSource);
           //  自动创建表 , 第一次执行会创建，以后要执行就要删除掉！
           jdbcTokenRepository.setCreateTableOnStartup(true);
           return jdbcTokenRepository;
       }
   }
   ```

3. 修改WebSecurityConfigurerAdapter安全配置类

   ```java
   @Autowired
   private UsersServiceImpl usersService;
   @Autowired
   private PersistentTokenRepository tokenRepository;
   
   // 开启记住我功能
   http.rememberMe()
       	.tokenValiditySeconds()// 设置有效期，秒
           .tokenRepository(tokenRepository)
           .userDetailsService(usersService);
   // 注销
   http.logout()
       	.logoutUrl("/logout")
       	.logoutSuccessUrl("/index")
       	.permitAll;
   ```

4. 页面添加记住我复选框

   name 属性值必须位 remember-me，不能改为其他值

   ```html
   记住我：<input type="checkbox"name="remember-me"title=" 记住密码"/><br/>
   ```

5. 完毕，测试！

这次先简单了解一下SpringSecurity，下次留时间整点高级用法~

<Reward/>
