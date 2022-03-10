---
title: Spring Boot 除 xml/yml 外，利用 SPI 支持对 json 配置文件的解析
date: 2022-02-17
tags:
- SPI
categories:
- 后端 Back-end
isShowComments: true
---

<Boxx/>

[[toc]]

继上一篇[JDK/Dubbo/Spring 三种SPI机制解析](/views/backend/SPI_JDKDubboSpring.html)之后，今天就在 Spring Boot 中，利用 SPI 支持对 json 配置文件的解析。

SpringBoot 的配置文件内置支持 properties、xml、yml、yaml 几种格式，其中 properties 和 xml 对应的Loader类为 PropertiesPropertySourceLoader ，yml和yaml 对应的Loader类为 YamlPropertySourceLoader。

了解了 Spring SPI 机制后，观察这2个类可以发现，都实现自接口 PropertySourceLoader 。所以我们要新增支持别的格式的配置文件，就可以通过实现接口 PropertySourceLoader 来实现了。

参照 PropertiesPropertySourceLoader , 下面实现了一个 json 格式的配置文件 Loader类：

```java
/**
 * JSON格式配置文件加载器
 */
public class JsonPropertySourceLoader implements PropertySourceLoader {

    public String[] getFileExtensions() {
        // 配置文件格式（扩展名）
        return new String[] { "json" };
    }

    public List<PropertySource<?>> load(String name, Resource resource) throws IOException {
        if (resource == null || !resource.exists()) {
            return Collections.emptyList();
        }
        Map<String, Object> map = JSON.parseObject(resource.getInputStream(), Map.class);
        Map<String, Object> resutltMap = new HashMap<>();
        // 将json转为键值对
        parseMap("", resutltMap, map);
        return Collections.singletonList(return new MapPropertySource(name, result));
    }

    private void parseMap(String prefix, Map<String, Object> result, Map<String, Object> map) {
        if (prefix.length() > 0) {
            prefix += ".";
        }
        for (Map.Entry<String, Object> entrySet : map.entrySet()) {
            if (entrySet.getValue() instanceof Map) {
                nestMap(prefix + entrySet.getKey(), result, (Map<String, Object>) entrySet.getValue());
            } else {
                result.put(prefix + entrySet.getKey().toString(), entrySet.getValue());
            }
        }
    }
}
```

然后在 src/main/resources 中创建 META-INF/spring.factories 文件，内容为：

```properties
org.springframework.boot.env.PropertySourceLoader=\
com.shanhy.sboot.property.JsonPropertySourceLoader
```

创建测试的配置文件 application.json

```json
{
    "custom": {
        "property": {
            "message": "测试数据"
        }
    }
}
```

创建验证结果的 HelloController.java

```java
@RestController
public class HelloController {

    @Value("${custom.property.message}")
    private Object customProperty;

    @RequestMapping("/test")
    public Object test() {
        return customProperty;
    }
}
```

启动工程服务，浏览器访问 http://localhost:8080/test 即可查看输出的结果为 “测试数据”；

<Reward/>
