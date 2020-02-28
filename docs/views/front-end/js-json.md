---
title: JavaScript中JSON对象和串的互转
date: 2019-03-23
tags:
- JavaScript
- json
categories:
- '前端'
isShowComments: false
---

<Boxx/>

[[toc]]

## JavaScript中的JSON

> 在实际工作中，我么最常用的就是简单的 `JSON.parse(str)`  和 ` JSON.stringify (obj)`  做JSON对象和字符串之间的相互转换

- JSON.parse(string) ：接受一个 JSON 字符串并将其转换成一个 JavaScript 对象
- JSON.stringify(obj) ：接受一个 JavaScript 对象并将其转换为一个 JSON 字符串

> 上面那种JSON.parse(string)用法只能转普通对象，当对象中有function事件的时候会自动过滤掉。如下：

```java
var json={
  name:'json',
  getName:function(){
     return this.name;   
  }
}

console.log(JSON.stringify(json));
//"{"name":"json"}"
```

- 这就坑了，因为需要，必须要得把function也转了才行，怎么办呢？其实大家都没注意到 `JSON.stringify还有些参数`

## JSON互转的第二种用法

- 从Object转为String

```javascript
  var json={
    name:'json',
    getName:function(){
       return this.name;   
    }
  }
  
  var s=JSON.stringify(json, function(key, val) {
    if (typeof val === 'function') {
      return val + '';
    }
    return val;
  });
  
  console.log(s);
  //"{"name":"json","getName":"function (){\n     return this.name;   \n  }"}"
```

注意转换完成之后记得把 `\n` 全部删掉，不然从string再转为object的时候会报错，没错，就是这么坑。

不信的话可以去这么网址试一下：[传送们](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse)

- 从String转为Object

```javascript
var s=`{"name":"json","getName":"function (){     return this.name;     }"}`;

var o = JSON.parse(s,function(k,v){
  if(v.indexOf&&v.indexOf('function')>-1){
     return eval("(function(){return "+v+" })()")
  }
  return v;
});

console.log(o);//就是原对象啦
//{ name: "json", getName: function (){     return this.name;     } }
```

## 写给自己的js规范

#### 在js中书写代码给自己定的规范：（或者objet转string之前）

1. 在js中能用的话 **一定要用单引号**
2. 在使用 `if(){}else{}` 的时候，**一定不要省略大括号**
3. js中一段代码结束后**一定要加 `;`**（虽然在js中不加不会报错，把对象转为串的时候也不会报错，但是json从串转为对象的时候就会报错了，亲身经历啊！！）

#### 在js中书写代码给自己定的规范：（或者string转object之前）

1. 把所有的 **\r\n** 删掉
2. 把所有的 **\t** 删掉
3. 把所有的 function 中的注释都删掉
4. 注意有没有代码不规范的地方（如上规范）

## 其它

- [JSON转换简单使用](https://www.html.cn/archives/3919)
- [JSON转换的第二个参数](https://www.cnblogs.com/sparkbj/p/8203343.html)
- [在线写js尝试JSON转换](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse)