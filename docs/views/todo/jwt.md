## JWT登陆认证

1. 引入pom依赖
2. JwtTokenUtil工具类（主要包括生成token，设置过期时间，验证token是否有效，获取token负载等）
3. JWT登录授权过滤器
   - 拦截请求，从每个请求中获取token，从token中获取负载，从负载中获取用户名放入SpringSecurity中，之后认证授权由SpringSecurity框架管理。
4. 第一次登陆还没有token，用户的登陆信息由SpringSecurity管理认证通过之后，生成jwtToken返回给客户端保存，客户端之后发送请求头携带我们需要的token即可



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

## 其他

- [10分钟了解JSON Web令牌（JWT）](https://baijiahao.baidu.com/s?id=1608021814182894637&wfr=spider&for=pc)
- [使用JWT实现单点登录（完全跨域方案）](https://blog.csdn.net/weixin_42873937/article/details/82460997)
- [SpringBoot+Security+JWT基础](https://www.jianshu.com/p/6e4371d74248)
- [SpringBoot集成JWT实现token验证](https://www.jianshu.com/p/e88d3f8151db)