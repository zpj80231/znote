---
title: JWT登陆认证
date: 2019-04-21
tags:
- jwt
categories:
- 后端
isShowComments: false
---

<Boxx/>

基于客户端的用户登录认证（ **轻量**，**安全**，服务端不用记录用户状态信息(**无状态**) ）

<!-- more -->

[[toc]]

## 使用场景

- 分布式的单点登录

## 初识JWT

> 官网：[ https://jwt.io/ ]( https://jwt.io/ )

### jwt的组成

jwt的组成方式： `header.payload.signature `

第一部分我们称它为头部（header)， 用于存放签名的生成算法 

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

第二部分我们称其为载荷（payload)，用于存放内容

```json
{
  "sub": "1234567890",
  "name": "John Doe",
  "iat": 1516239022
}
```

第三部分是签证（String signature)， 一旦header和payload被篡改，验证将失败 

```json
//secret为加密算法的密钥，密钥只能由服务端和客户端知悉
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),your-256-bit-secret
) 
```

### jwt实例

![](/znote/img/backEnd/jwt.png)

- 最终的JWT串

```json
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

## JWT登陆认证

### 认证原理

- 用户调用登录接口，登录成功后获取到JWT的token；
- 之后用户每次调用接口都在http的header中添加一个叫Authorization的头，值为JWT的token；
- 后台程序通过对Authorization头中信息的解码及数字签名校验来获取其中的用户信息，从而实现认证和授权。
- JWT登录授权过滤器，拦截请求，从每个请求中获取token，从token中获取负载，从负载中获取用户名放入SpringSecurity中，之后认证授权由SpringSecurity框架管理。
- 第一次登陆还没有token，用户的登陆信息由SpringSecurity管理认证通过之后，生成jwtToken返回给客户端保存，客户端之后发送请求头携带我们需要的token即可

### 引入pom依赖

```xml
<!-- JWT -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt</artifactId>
    <version>0.9.0</version>
</dependency>
```

### JwtTokenUtil工具类

- 主要包括生成token，设置过期时间，验证token是否有效，获取token负载等
- 工具类可具体参考mall项目

```java
package com.macro.mall.tiny.common.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * JwtToken生成的工具类
 * Created by macro on 2018/4/26.
 */
@Component
public class JwtTokenUtil {
    private static final Logger LOGGER = LoggerFactory.getLogger(JwtTokenUtil.class);
    private static final String CLAIM_KEY_USERNAME = "sub";
    private static final String CLAIM_KEY_CREATED = "created";
    @Value("${jwt.secret}")
    private String secret;
    @Value("${jwt.expiration}")
    private Long expiration;

    /**
     * 根据负责生成JWT的token
     */
    private String generateToken(Map<String, Object> claims) {
        return Jwts.builder()
                .setClaims(claims)
                .setExpiration(generateExpirationDate())
                .signWith(SignatureAlgorithm.HS512, secret)
                .compact();
    }

    /**
     * 从token中获取JWT中的负载
     */
    private Claims getClaimsFromToken(String token) {
        Claims claims = null;
        try {
            claims = Jwts.parser()
                    .setSigningKey(secret)
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            LOGGER.info("JWT格式验证失败:{}",token);
        }
        return claims;
    }

    /**
     * 生成token的过期时间
     */
    private Date generateExpirationDate() {
        return new Date(System.currentTimeMillis() + expiration * 1000);
    }

    /**
     * 从token中获取登录用户名
     */
    public String getUserNameFromToken(String token) {
        String username;
        try {
            Claims claims = getClaimsFromToken(token);
            username =  claims.getSubject();
        } catch (Exception e) {
            username = null;
        }
        return username;
    }

    /**
     * 验证token是否还有效
     *
     * @param token       客户端传入的token
     * @param userDetails 从数据库中查询出来的用户信息
     */
    public boolean validateToken(String token, UserDetails userDetails) {
        String username = getUserNameFromToken(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    /**
     * 判断token是否已经失效
     */
    private boolean isTokenExpired(String token) {
        Date expiredDate = getExpiredDateFromToken(token);
        return expiredDate.before(new Date());
    }

    /**
     * 从token中获取过期时间
     */
    private Date getExpiredDateFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return claims.getExpiration();
    }

    /**
     * 根据用户信息生成token
     */
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put(CLAIM_KEY_USERNAME, userDetails.getUsername());
        claims.put(CLAIM_KEY_CREATED, new Date());
        return generateToken(claims);
    }

    /**
     * 判断token是否可以被刷新
     */
    public boolean canRefresh(String token) {
        return !isTokenExpired(token);
    }

    /**
     * 刷新token
     */
    public String refreshToken(String token) {
        Claims claims = getClaimsFromToken(token);
        claims.put(CLAIM_KEY_CREATED, new Date());
        return generateToken(claims);
    }
}
```

## 客户端添加请求头

- [js操作cookie](https://www.w3school.com.cn/js/js_cookies.asp)
- js发送请求头
  - jQuery Ajax可以通过headers或beforeSend修改request的HTTP headers，例如：

``` javascript
$.ajax({
	url: "./test.php",
	type: "POST",
    headers: {
   		"Accept" : "text/plain; charset=utf-8",
   		"Content-Type": "text/plain; charset=utf-8"
    },
    /*
    beforeSend: function(jqXHR, settings) {
    	jqXHR.setRequestHeader('Accept', 'text/plain; charset=utf-8');
    	jqXHR.setRequestHeader('Content-Type', 'text/plain; charset=utf-8');
    },
    */
    data: {"user" : "min", "pass" : "he"},
    error: function(jqXHR, textStatus, errorThrown) {
    	//....
    },
    success: function(data, textStatus, jqXHR) {
    	//....
    }
}
```

## jwt+redis使用流程

1. 登录：用户第一次登录，校验通过，生成token并存到redis里，返回客户端（token设置过期时间1天，redis设置过期时间0.5小时）。

2. 鉴权：之后客户端每次请求都携带token，服务端校验token通过并且redis过期时间没过，则redis续期然后返回token；服务端校验token通过但如果redis中token已过期，则失效。

3. 登出：服务端校验token通过，将redis中的token删除。

## 总结

- 优点：在非跨域环境下使用JWT机制是一个非常不错的选择，实现方式简单，操作方便，能够快速实现。由于服务端不存储用户状态信息，因此大用户量，对后台服务也不会造成压力。

- 缺点：跨域实现相对比较麻烦，安全性也有待探讨。因为JWT令牌返回到页面中，可以使用js获取到，如果遇到XSS攻击令牌可能会被盗取，在JWT还没超时的情况下，就会被获取到敏感数据信息。 



## 其他

- [10分钟了解JSON Web令牌（JWT）](https://baijiahao.baidu.com/s?id=1608021814182894637&wfr=spider&for=pc)
- [使用JWT实现单点登录（完全跨域方案）*](https://blog.csdn.net/weixin_42873937/article/details/82460997)
- [SpringBoot+Security+JWT基础](https://www.jianshu.com/p/6e4371d74248)
- [SpringBoot集成JWT实现token验证](https://www.jianshu.com/p/e88d3f8151db)
- [JWT的使用流程 *](https://blog.csdn.net/shmely/article/details/85915044)