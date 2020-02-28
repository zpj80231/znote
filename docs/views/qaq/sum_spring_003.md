---
title: "面试宝典-spring进阶篇"
date: 2020-02-28
tags:
- 面试
categories:
- 面试
isShowComments: false
---

<Boxx/>

## Spring进阶

::: details 1. IOC控制反转底层原理

1. 自定义两个注解

   ***@Component***：判断是否注入bean容器

   ***@Autowired***：判断是否依赖注入

2. 创建ApplicationContext容器类

   1.  `private ConcurrentHashMap<String, Object> beans = null;` **存放bean的容器**

   2. initBeans(); 根据注解@Component**加载所有bean**

      - 利用反射机制，遍历一个包下的所有类，判断类上有注解@Component就放入beans容器中，` beans.put(beanId, newInstance); `
   
   3. initEntryField(); 根据注解@Autowired**加载所有依赖注入的对象**
   
      - 所有bean初始化之后，判断bean的依赖注入关系
   
      - 遍历beans容器，利用反射机制，获取bean的所有属性并遍历判断有@Autowired注解的进行依赖注入(利用java反射set注入，private不用写set方法了)
   
        ```java
        //判断当前类属性是否存在注解
        //declaredFields：利用反射得到的所有属性
        for (Field field : declaredFields) {
            SelfAutowired extResource = field.getAnnotation(SelfAutowired.class);
            if (extResource != null) {
                //属性名称：即容器中bean
                String beanId = field.getName();
                Object bean = getBean(beanId);
                if (bean != null) {
                    //默认使用属性名称，查找bean容器对象 1参数 当前对象 2参数给属性赋值
                    field.setAccessible(true); //允许访问私有属性,private不用写set()了
                    field.set(object, bean); //依赖注入
                }
            }
        }
        ```
   
        

:::