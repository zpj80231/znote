---
title: IDEA MyBatisCodeHelper-Pro-3.1.9 最新版破解
date: 2023-05-19
tags:
   - 破解
   - IDEA 
categories:
   - 知识晶体 Q&A
isShowComments: true
---

<Boxx/>

MyBatisCodeHelper-Pro 是我一直使用的一款 IDEA 插件，和其他同类型插件相比，它的代码生成和自动补全等功能帮我极大的提升了开发效率。

但必须收费版才能体验到这些强大的功能，而我一直是 idea 最新版用户，网上一些 MyBatisCodeHelper-Pro 2.x 破解老版本不适用，所以搜集了一些资料，最终出来这个最新版的破解。

<!-- more -->

[[toc]]

> 提前申明：
>
> 这篇文章只用于作者个人记录，任何人不得转载、分享。如因此造成的任何损失或其他影响， 本人概不承担。
>
> MyBatisCodeHelper-Pro 是一款很不错的 IDEA 插件，有能力的还是购买正版授权。
>
> 如有其他侵权请联系我删除。

## 下载 MyBatisCodeHelper-Pro

在 idea 插件市场：https://plugins.jetbrains.com/plugin/9837-mybatiscodehelperpro/versions 下载所需版本。

下载目前最新版：MybatisCodeHelperNew-3.1.9.zip。解压，找到 jar 包：MyBatisCodeHelper-Pro-obfuss.jar。

## 下载 cfr

一个 Java 反编译器，官网：https://www.benf.org/other/cfr/

下载好后，将 cfr-0.152.jar 和 MyBatisCodeHelper-Pro-obfuss.jar 放在同一目录下，执行命令：

```java
java -jar cfr-0.152.jar MyBatisCodeHelper-Pro-obfuss.jar --renamedupmembers true --hideutf false >> a.txt
```

等待数秒钟命令执行完毕，分析 a.txt 文件：

1. 最终定位到：搜索 @SerializedName(value="validTo")

```java
/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.gson.annotations.SerializedName
 *  kotlin.TypeCastException
 */
package com.ccnode.codegenerator.e.f;

import com.ccnode.codegenerator.myconfigurable.DomainObject;
import com.google.gson.annotations.SerializedName;
import kotlin.TypeCastException;

public class c {
    // 付费密钥
    @SerializedName(value="paidKey")
    private String e;
    // 校验是否通过
    @SerializedName(value="valid")
    private Boolean c;
    // 机器码，激活时会显示
    @SerializedName(value="userMac")
    private String a;
    // 激活的截至日期
    @SerializedName(value="validTo")
    private Long b;
    private static String d;
    private static final String[] bb;
    private static final String[] cb;
```

我加了注释，然后我们使用 Java 字节码技术修改这个类的各个属性 get 方法，使之直接返回正确的值即可。

2. 通过上述方法随便输入激活码激活时，正常都是成功的，但有的可能会发现激活是吧，报错：base64解密异常，分析报错信息

最终定位到：打开 a.txt，搜索 import com.ccnode.codegenerator.e.e.c;

查看这个类所在的包及类：

```java
/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.gson.Gson
 */
package com.ccnode.codegenerator.e.e;

import com.ccnode.codegenerator.e.e.c;
import com.google.gson.Gson;
import java.io.UnsupportedEncodingException;
import java.util.Base64;

public class a {
    private static Gson a;
    private static final String[] bb;
    private static final String[] cb;

    public static com.ccnode.codegenerator.e.f.c a(String string) {
        String string2;
        byte[] byArray = c.b(c.b(com.ccnode.codegenerator.e.e.a.b(-25012, 31799)), Base64.getDecoder().decode(string));
        com.ccnode.codegenerator.e.f.c c2 = null;
        try {
            string2 = new String(byArray, com.ccnode.codegenerator.e.e.a.b(-25009, -31477));
        }
        catch (UnsupportedEncodingException unsupportedEncodingException) {
            throw new RuntimeException(unsupportedEncodingException);
        }
        try {
            c2 = (com.ccnode.codegenerator.e.f.c)a.fromJson(string2, com.ccnode.codegenerator.e.f.c.class);
        }
        catch (Exception exception) {
            throw new RuntimeException(com.ccnode.codegenerator.e.e.a.b(-25010, -18101) + string2, exception);
        }
        return c2;
    }
```

其实想想也是，肯定是这个类解析转换为指定信息，然后给了第一步的 com.ccnode.codegenerator.e.f.c。看他里面逻辑无非就是 base64 解析，然后 gson 转换。直接修改这个类即可。

## 使用 Javassist 修改类文件

添加 maven 依赖：

```xml
<dependency>
    <groupId>org.javassist</groupId>
    <artifactId>javassist</artifactId>
    <version>3.25.0-GA</version>
</dependency>
```

如上分析，主要修改的就是 `com.ccnode.codegenerator.e.e.a` 的 `a` 方法。

```java
    public static void main(String[] args) throws NotFoundException, CannotCompileException, IOException {
        // 加载类
        ClassPool classPool = ClassPool.getDefault();
        // 直接使用 jar 路径
        classPool.appendClassPath("Downloads\\Compressed\\MyBatisCodeHelper-Pro-obfuss.jar");
        classPool.appendClassPath("maven\\repositroy\\com\\google\\code\\gson\\gson\\2.10.1\\gson-2.10.1.jar");
        // 或者添加 class 目录
        //classPool.appendClassPath("");

        // 获取指定类
        CtClass ctClass = classPool.get("com.ccnode.codegenerator.e.e.a");
        CtMethod parseLicenseMethod = ctClass.getDeclaredMethod("a", new CtClass[] { classPool.get("java.lang.String") });
        StringBuffer bodyBuff = new StringBuffer();
        bodyBuff.append("{")
                .append("	com.google.gson.Gson gson = new com.google.gson.Gson();")
                .append("	com.ccnode.codegenerator.e.f.c e = (com.ccnode.codegenerator.e.f.c)gson.fromJson($1,com.ccnode.codegenerator.e.f.c.class);")
                .append("	return e;")
                .append("}");
        parseLicenseMethod.setBody(bodyBuff.toString());

        // 对修改的文件，写出到一个新文件
        ctClass.writeFile("Downloads\\Compressed\\MyBatisCodeHelper-Pro-obfuss-3.1.9-new");
    }
```

运行完成后，会将修改的 class 文件生成到指定目录下。

## 替换 jar 包的对应 class 文件

使用压缩工具 Bandzip 或 7zip 替换都有问题。

直接使用 Java 命令替换 jar 包中的指定 class 文件：

```java
// MyBatisCodeHelper-Pro-obfuss.jar 文件和 com 是同级目录
jar uvf MyBatisCodeHelper-Pro-obfuss.jar com\ccnode\codegenerator\e\e\a.class
// 输出结果
// 正在添加: com/ccnode/codegenerator/e/e/a.class(输入 = 4937) (输出 = 3210)(压缩了 34%)
```

这里值得注意的是 a.class 必须放在 com\ccnode\codegenerator\e\e\a.class 文件下，要和 jar 里的的路径对应起来。

贴出 jar 命令参数详解：

```shell
-u 添加文件到jar包中
-v 生成详细的报造，并输出至标准设备
-f 指定jar包的文件名
-c 创建一个jar包
-t 显示jar中的内容列表
-x 解压jar包
-m 指定manifest.mf文件.(manifest.mf文件中可以对jar包及其中的内容作一些一设置)
-0 产生jar包时不对其中的内容进行压缩处理
-M 不产生所有文件的清单文件(Manifest.mf)。这个参数与忽略掉-m参数的设置
-i 为指定的jar文件创建索引文件
-C 表示转到相应的目录下执行jar命令,相当于cd到那个目录，然后不带-C执行jar命令
```

## 查看结果

最后再使用 [jd-gui](https://github.com/java-decompiler/jd-gui) 或其他反编译工具，先找到对应 class 文件，看一下是否替换成功。

然后将更新后的这个 jar 包，替换原始 jar 包，重启 idea，输入离线激活码激活，大功告成。

```json
{
    "paidKey": "随便写",
    "valid": true,
    "userMac": "离线注册唯一码",
    "validTo": 4859711999000
}
```

