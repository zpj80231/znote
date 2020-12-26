---
title: Swagger2的基本了解和使用
date: 2019-08-11 19:29:56
tags:
- Swagger2
categories:
- "后端"
isShowComments: false
---

<Boxx/>

Swagger 是一款RESTFUL接口的文档在线自动生成+功能测试功能组件，随着现在许多公司实现了前后端分离，swagger越来越受欢迎了。

<!-- more -->

[[toc]]

## 入门

我是怎么学swagger的呢，经过我一步一步的经验，推荐以下三个网址去学习即可：

- 基础篇：虽然是老外写的入门，但凭我这个英语垃圾的一批的渣渣都能看懂，相信大部分人一定可以读懂！另外作者的写作风格我很喜欢，欢迎大家去看看。[传送们](https://www.vojtechruzicka.com/documenting-spring-boot-rest-api-swagger-springfox/#gatsby-focus-wrapper)
- 中极篇：一篇不错的文章，从基础到配置到实现写的很详细。[传送们](https://blog.csdn.net/qq122516902/article/details/89417964)
- 高级篇：mall作者，我从他这学到不少东西，非常感谢！[传送们](https://mp.weixin.qq.com/s?__biz=MzU1Nzg4NjgyMw==&mid=2247483690&idx=1&sn=66019583772c03bad6896eb307409d75&scene=21#wechat_redirect)

## Swagger常用注解

| 注解 | 说明 |
| ---- | ---- |
|@Api|用于修饰Controller类，生成Controller相关文档信息|
|@ApiOperation|用于修饰Controller类中的方法，生成接口方法相关文档信息|
|@ApiParam|用于修饰接口中的参数，生成接口参数相关文档信息|
|@ApiModel|用于修饰Model实体类|
|@ApiModelProperty|用于修饰Model实体类的属性，当实体类是请求参数或返回结果时，直接生成相关文档信息|

## 简单在SpringBoot中搭建Swagger文档

- 配置完成后，通过访问`http://localhost:8080/swagger-ui.html`（自己的项目访问路径/swagger-ui.html）来访问接口文档就可以了。

![](/znote/img/backend/swagger2/swagger2.png)

### 添加依赖

```xml
<!--Swagger-UI API文档依赖-->
<dependency>
    <groupId>io.springfox</groupId>
    <artifactId>springfox-swagger2</artifactId>
    <version>2.9.2</version>
</dependency>
<dependency>
    <groupId>io.springfox</groupId>
    <artifactId>springfox-swagger-ui</artifactId>
    <version>2.9.2</version>
</dependency>
```

### 在SpringBoot中添加Swagger2Config配置类

```java
@Configuration //这是一个配置类
@EnableSwagger2 //开启Swagger2的自动配置
public class Swagger2Config {

    // 配置docket以配置Swagger具体参数
    @Bean
    public Docket docket() {
        return new Docket(DocumentationType.SWAGGER_2)
                .apiInfo(apiInfo())
                // 通过.select()方法，去配置扫描接口
                .select()
                // 为 指定的包下的所有controller 生成API文档
                .apis(RequestHandlerSelectors.basePackage("com.example.swaggerexample.controller"))
                // 配置如何通过 path过滤 即这里只扫描 请求以 /user开头的接口
                .path(PathSelectors.any("/user/**"))
                .build();
    }
    
    //不是刚需，按需配置
    private ApiInfo apiInfo() {
        Contact contact = new Contact("联系人名字", "http://xxx.xxx.com/联系人访问链接", "联系人邮箱");
        return new ApiInfo("Swagger学习", // 标题
                "学习演示如何配置Swagger", // 描述
                "v1.0", // 版本
                "http://terms.service.url/组织链接", // 组织链接
                contact, // 联系人信息
                "Apach 2.0 许可", // 许可
                "许可链接", // 许可连接
                new ArrayList<>()); // 扩展
    }
}
```

### 给Controller类添加Swagger注解

```java
@Controller
@Api(tags = "OmsOrderSettingController", description = "订单设置管理")
@RequestMapping("/orderSetting")
public class OmsOrderSettingController {
    @Autowired
    private OmsOrderSettingService orderSettingService;

    @ApiOperation("获取指定订单设置")
    @RequestMapping(value = "/{id}", method = RequestMethod.GET)
    @ResponseBody
    public CommonResult<OmsOrderSetting> getItem(@PathVariable Long id) {
        OmsOrderSetting orderSetting = orderSettingService.getItem(id);
        return CommonResult.success(orderSetting);
    }

    @ApiOperation("修改指定订单设置")
    @RequestMapping(value = "/update/{id}", method = RequestMethod.POST)
    @ResponseBody
    public CommonResult update(@PathVariable Long id, @RequestBody OmsOrderSetting orderSetting) {
        int count = orderSettingService.update(id,orderSetting);
        if(count>0){
            return CommonResult.success(count);
        }
        return CommonResult.failed();
    }
}
```

### 给model实体类添加Swagger注解

```java
@ApiModel("用户实体")
public class User {
    @ApiModelProperty("用户名")
    private String username;
    @ApiModelProperty("密码")
    private String password;
	// 省略getter/setter
}
```

