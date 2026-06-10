---
title: ja-netfilter 插件 plugin-privacy 增强优化记录
date: 2026-06-10
tags:
   - Java
   - IDEA
   - ja-netfilter
categories:
   - 知识晶体 Q&A
isShowComments: true
---

<Boxx/>

plugin-privacy 是一个配合 ja-netfilter 使用的小插件，主要目标很简单：尽量减少 JetBrains IDE 中第三方插件对本地 VM options、agent 配置以及相关类资源的探测。

这次主要记录两个我增强的点：

1. 当前项目下的 `scan` 自动扫描能力；
2. 对 `.vmoptions` 文件读取链路的增强。

<!-- more -->

[[toc]]

> 提前申明：
>
> 本文仅用于个人学习和技术记录，不鼓励也不建议用于商业用途或分发传播。
>
> JetBrains IDE 和相关插件有能力的还是推荐购买正版授权。本文涉及的实现思路只讨论本地隐私防护、插件兼容和 Java 字节码增强相关内容。

## 1. 背景

早期 plugin-privacy 的思路比较直接：通过配置文件手动维护 `Hide_Package`、`Hide_Resource`、`Ignore_Class`、`Ignore_Resource` 等规则，当目标插件尝试加载或读取某些敏感类、资源、环境变量、系统属性时，再根据调用栈判断是否需要隐藏。

这种方式能用，在某些情况下维护成本比较高：

1. 某些插件在升级后频繁改动反检测类，比如（）。需要我们手动再次修改配置。
4. 某些插件的反检测机制有多种情况，比如 Extra 系列。`.vmoptions` 的读取方式不只有 `VMOptions.getUserOptionsFile()` 一种。

所以这次增强的核心，不是多写几条固定规则，而是让 plugin-privacy 能根据当前 IDE 和插件状态自动补齐规则，并且把 `.vmoptions` 的读取入口覆盖得更完整。

## 2. scan 自动扫描

`scan` 目录下主要有四个类：

| 类名 | 作用 |
| --- | --- |
| `CanaryAutoScanner` | 自动扫描入口，读取配置、执行扫描、输出生成的 class 规则 |
| `JbDirectoryScanner` | 定位当前 JetBrains IDE 的插件目录和待更新 zip |
| `CanaryScanner` | 扫描插件目录、jar、zip，解析 plugin id 并提取命中的 class |
| `RuleMerger` | 将自动扫描结果合并到现有隐藏/忽略规则 |

整体链路可以理解为：

```shell
PluginConfig
  -> CanaryAutoScanner
  -> JbDirectoryScanner 定位插件目录
  -> CanaryScanner 匹配插件 id 并扫描 jar/zip
  -> RuleMerger 合并成 Ignore_Class / Ignore_Resource / Hide_Resource
```

### 2.1 自动扫描入口

`CanaryAutoScanner` 是整个扫描能力的入口。

默认情况下，已经内置了一些规则：

```java
private static final List<FilterRule> DEFAULT_SCAN_PLUGINS = Arrays.asList(
        new FilterRule(RuleType.EQUAL, "izhangzhihao.rainbow.brackets"));
```

默认扫描的包主要是：

```java
private static final List<FilterRule> DEFAULT_SCAN_PACKAGES = Arrays.asList(
        new FilterRule(RuleType.PREFIX, "com.janetfilter."),
        new FilterRule(RuleType.PREFIX, "com.novitechie."));
```

这里有个细节：如果配置文件里显式声明了 `Auto_Scan_Plugin` 或 `Auto_Scan_Package`，就使用配置里的规则；如果没有声明，才使用默认规则。

这样既保留了开箱即用，也允许自己按需关闭：

```properties
[Auto_Scan_Plugin]
# Leave this section empty to disable default auto scan plugin rules.

[Auto_Scan_Package]
# Leave this section empty to disable default auto scan package rules.

[Auto_Scan_Exclude]
# PREFIX,com.example.safe.
```

也就是说：

1. 不写 section：使用默认扫描规则；
2. 写了 section 但留空：禁用默认扫描；
3. 写了自定义规则：按自定义规则扫描。

这个设计比较适合长期维护，因为后面插件结构再怎么变，也不需要频繁手动补 class 名。

### 2.2 定位 IDE 插件目录

扫描之前最麻烦的其实不是扫 jar，而是找到当前 IDE 真正使用的插件目录。

`JbDirectoryScanner` 做了几层兜底：

1. 优先读取自定义配置 `Auto_Scan_Ide_Plugin_Path`；
2. 根据当前 `idea.paths.selector` 匹配配置里的插件目录；
3. 如果没有配置，则回退到 JetBrains 的 `PathManager`；
4. 再尝试读取 `IDEA_PROPERTIES` 或 IDE_HOME 下的 `bin/idea.properties`；
5. 最后补充扫描待更新插件 zip。

自定义路径的配置类似这样：

```properties
[Auto_Scan_Ide_Plugin_Path]
# Match current idea.paths.selector on the left side, then scan the configured plugin root.
# EQUAL,IntelliJIdea2026.2=D:\Develop\Jetbrains\Settings\.IntelliJIdea\config\plugins
# EQUAL,IntelliJIdea2025.3=D:\Develop\Jetbrains\Settings\.IntelliJIdea2\config\plugins
```

为什么要通过 `idea.paths.selector` 来匹配？

因为同一台机器上可能同时安装多个版本的 IDEA、PyCharm、GoLand，甚至同一个 IDE 也可能有多套配置目录。只按固定路径扫描，容易扫错目录。用 selector 匹配，可以把“当前正在运行的 IDE”和“当前应该扫描的插件目录”对应起来。

### 2.3 支持待更新 zip

JetBrains 插件更新时，不一定立刻解压到插件目录。很多时候会先进入临时 staging 目录，等 IDE 重启后再完成替换。

所以 `JbDirectoryScanner` 里还有一段逻辑，会从 `PathManager.getPluginTempPath()` 或 system path 下找待更新 zip：

```text
已安装插件目录
  + staging 里的更新 zip
  -> 一起作为 scan target
```

判断逻辑也比较克制：只有 zip 名称能对应到已安装插件目录，并且 zip 的修改时间比已安装目录更新，才会纳入扫描。

这样可以提前处理 “插件更新后，需要重启再重启才会生效” 的情况。

### 2.4 扫描 jar、目录和 zip

`CanaryScanner` 支持三种输入：

1. 插件目录；
2. 单个 jar；
3. 插件更新 zip。

它会先解析 `META-INF/plugin.xml` 中的 `<id>`，再用 `Auto_Scan_Plugin` 去匹配插件 id。只有插件 id 命中，才会继续扫描里面的 class。

扫描 class 时，会把 jar entry 转成 Java 类名：

```text
com/novitechie/Foo.class
  -> com.novitechie.Foo
```

然后用 `Auto_Scan_Package` 和 `Auto_Scan_Exclude` 过滤。

这个过程最终产出的是一批精确的 `EQUAL` 规则，比如：

```properties
EQUAL,com.novitechie.SomeCanaryClass
```

相比手动写 `PREFIX`，这种结果更稳一点：只隐藏真实存在、真实命中的类，不会把范围扩大到不必要的包。

### 2.5 marker resource 的处理

扫描时还会额外关注一个 marker resource：

```text
6c81ec87e55d331c267262e892427a3d93d76683.txt
```

`RuleMerger.adjustMarkerResourceRule()` 会根据扫描结果调整 `Hide_Resource`：

1. 如果目标插件里本来就存在这个 marker resource，就移除对应的隐藏规则；
2. 如果目标插件里不存在，就补上隐藏规则。

这块主要是为了减少“固定配置”和“真实插件状态”之间的不一致。主要是为了通杀某个插件的所有版本。

## 3. 规则合并

自动扫描不是单独生效的，它会在 `PrivacyPlugin.init()` 里和用户配置合并：

```java
CanaryAutoScanner.AutoScanResult autoScanResult = CanaryAutoScanner.scanWithResult(config);
List<FilterRule> autoScanClassRules = autoScanResult.getClassRules();
List<FilterRule> autoScanResourceRules = RuleMerger.toResourceRules(autoScanClassRules);
```

然后继续处理：

```java
List<FilterRule> hideResourceRules = RuleMerger.adjustMarkerResourceRule(
        config.getBySection("Hide_Resource"), autoScanResult.isMarkerResourceExists());
List<FilterRule> ignoreClassRules = RuleMerger.merge(config.getBySection("Ignore_Class"), autoScanClassRules);
List<FilterRule> ignoreResourceRules = RuleMerger.merge(config.getBySection("Ignore_Resource"), autoScanResourceRules);
```

这里的重点是：

1. 扫出来的 class 会合并到 `Ignore_Class`；
2. class 规则会自动转换成 resource 规则合并到 `Ignore_Resource`；
3. marker resource 会动态调整到 `Hide_Resource`；
4. 合并时会去重，避免重复配置。

所以自动扫描并不是绕开配置系统，而是给现有配置系统补了一层自动生成能力。

## 4. .vmoptions 文件增强

`.vmoptions` 是 plugin-privacy 的重点保护对象。

因为里面通常会出现：

```properties
-javaagent:/path/to/ja-netfilter.jar
```

如果某些插件直接读取这个文件，就能知道当前 IDE 启动参数、agent 路径、debug 输出等信息。

早期只拦 `VMOptions.getUserOptionsFile()` 还不够，因为读取 `.vmoptions` 的方式可能很多：

1. 通过 JetBrains 自己的 `VMOptions` 类拿路径；
2. 读取系统属性 `jb.vmOptionsFile`；
3. `new FileInputStream(file)`；
4. `new FileInputStream(path)`；
5. `Files.readString(path)`；
6. `Files.readAllBytes(path)`；
7. `Files.newInputStream(path)`；
8. `Files.newBufferedReader(path)`。

这次增强就是把这些常见入口都收拢到 `VMOptionsRule` 里统一判断。

### 4.1 VMOptionsTransformer

`VMOptionsTransformer` 主要处理 JetBrains 自己的 `com.intellij.diagnostic.VMOptions`。

对 `getUserOptionsFile()`：

```text
如果 StackTraceRule.check() 命中
  -> 返回 fake.vmoptions
否则
  -> 继续原始逻辑
```

`VMOptionsRule.hook()` 会在临时目录创建一个假的 `fake.vmoptions`：

```java
File file = new File(tmpdir, "fake.vmoptions");
```

内容只有一行注释：

```properties
# This file is created by plugin-privacy
```

这样比直接返回 `null` 更稳，因为很多调用方预期拿到的是一个真实存在的文件路径。

对 `readOption(String, boolean)`：

```text
如果读取的 option 包含 javaagent
  -> 返回 null
```

这样可以避免通过 JetBrains 封装 API 直接读到 `javaagent` 配置。

### 4.2 SystemRule 中的 jb.vmOptionsFile

除了 `VMOptions.getUserOptionsFile()`，有些代码会读取系统属性：

```properties
jb.vmOptionsFile
```

我们通过 ASM 插桩和 `SystemRule.hookProperty()` 做了处理：

```java
if (checkVMOptionsProperty(name)) {
    Path path = VMOptionsRule.hook();
    return path == null ? null : path.toString();
}
```

也就是说，只要访问的是 `jb.vmOptionsFile`，就返回 fake 文件路径。

### 4.3 FileInputStreamTransformer

仅仅 hook JetBrains API 还不够，因为对方也可以直接读文件：

```java
new FileInputStream(file)
new FileInputStream(path)
```

所以 `FileInputStreamTransformer` 会增强 `java.io.FileInputStream` 的两个构造方法：

```text
FileInputStream(File)
FileInputStream(String)
```

进入构造方法前，先调用：

```java
VMOptionsRule.redirectFile(file)
VMOptionsRule.redirectPath(path)
```

如果路径以 `.vmoptions` 结尾，并且调用栈命中 `StackTraceRule.check()`，就把原路径重定向到 `fake.vmoptions`。

### 4.4 FilesTransformer

现在很多代码不会直接使用 `FileInputStream`，而是用 NIO：

```java
Files.readAllBytes(path)
Files.readString(path)
Files.readAllLines(path)
Files.newInputStream(path)
Files.newBufferedReader(path)
```

所以 `FilesTransformer` 对这些方法也做了增强。

判断入口统一是：

```java
VMOptionsRule.shouldHide(path)
```

命中后，不抛异常，而是返回空内容：

| 方法 | 返回 |
| --- | --- |
| `readAllBytes` | `new byte[0]` |
| `readString` | `""` |
| `readAllLines` | `Collections.emptyList()` |
| `newInputStream` | 空的 `ByteArrayInputStream` |
| `newBufferedReader` | 空的 `BufferedReader` |

这种处理比直接阻断更平滑。对于调用方来说，只是读到了一个空文件，不容易因为异常导致 IDE 或插件出现明显报错。

### 4.5 统一判断入口

`.vmoptions` 的判断都集中在 `VMOptionsRule`：

```java
private static boolean isVMOptions(String path) {
    return path != null && path.toLowerCase(Locale.ROOT).endsWith(VMOPTIONS_SUFFIX);
}
```

关键点有两个：

1. 只处理 `.vmoptions` 后缀；
2. 还要通过 `StackTraceRule.check()` 判断调用栈。

也就是说，它不是无脑隐藏所有 `.vmoptions` 读取，而是尽量只在可疑调用栈里生效，避免影响 IDE 自己的正常启动和配置编辑。

## 5. StackTraceRule 的作用

这套功能能不能稳定，关键还是 `StackTraceRule`。

当前判断主要有两类：

1. 方法名里出现非 ASCII 字符；
2. 短方法名配合指定包名规则，并且类加载器来自 IntelliJ 插件类加载器。

第二类逻辑是为了避免误伤。

短方法名本身不一定可疑，很多正常代码也可能有短方法名，所以这里还加了两个条件：

1. class name 必须命中 `Trace_Check_Package`；
2. class loader 必须是 `com.intellij.ide.plugins.cl.PluginClassLoader` 或它的子类。

对应配置：

```properties
[Trace_Check_Package]
# Short method names are only treated as suspicious when the stack class name matches these rules.
# PREFIX,com.example.plugin.
```

这样可以把规则限制在插件侧，而不是影响 IDE 核心类。

## 6. 一次完整启动时发生了什么

把这些逻辑串起来，IDE 启动时大概是这样：

```text
PrivacyPlugin.init()
  -> CanaryAutoScanner.scanWithResult(config)
       -> 找当前 IDE 插件目录
       -> 扫已安装插件和待更新 zip
       -> 生成 class/resource 规则
  -> RuleMerger 合并规则
  -> 初始化 Hide_Plugin / Hide_Package / Hide_Resource / System / StackTrace 规则
  -> 注册各类 Transformer
```

运行时如果有插件读取 `.vmoptions`：

```text
插件调用
  -> VMOptions / System / FileInputStream / Files
  -> Transformer 插入的 VMOptionsRule 判断
  -> StackTraceRule 判断调用栈
  -> 命中则返回 fake.vmoptions 或空内容
```

运行时如果有插件探测 class/resource：

```text
插件加载 class/resource
  -> LoadClassRule / ResourceRule
  -> 自动扫描生成的 Ignore_Class / Ignore_Resource 参与判断
  -> 按规则隐藏或放行
```

## 7. 配置示例

当前 `privacy.conf.example` 里比较关键的新增配置如下：

```properties
[Auto_Scan_Plugin]
# Auto scan matches plugin ids first, then hides matched canary classes from those plugins.
# Leave this section empty to disable default auto scan plugin rules.

[Auto_Scan_Package]
# Leave this section empty to disable default auto scan package rules.

[Auto_Scan_Exclude]
# PREFIX,com.example.safe.

[Auto_Scan_Ide_Plugin_Path]
# Match current idea.paths.selector on the left side, then scan the configured plugin root.
# EQUAL,IntelliJIdea2026.2=D:\Develop\Jetbrains\Settings\.IntelliJIdea\config\plugins
# EQUAL,IntelliJIdea2025.3=D:\Develop\Jetbrains\Settings\.IntelliJIdea2\config\plugins
```

如果想使用默认扫描，保持 section 不写即可。

如果想完全关闭默认扫描，可以保留 section 但不写任何规则。

如果有多个 IDE 配置目录，并且默认规则不生效，那建议显式配置 `Auto_Scan_Ide_Plugin_Path`，避免扫描到错误目录。

## 8. 总结

这次增强主要解决两个问题。

第一，`scan` 让规则维护从“手动追 class 名”变成“按当前插件实际内容自动生成”。它支持插件目录、jar、待更新 zip，也能根据当前 IDE selector 匹配正确插件目录。

第二，`.vmoptions` 防护从单一 API 扩展到了多入口读取链路。无论是 JetBrains 的 `VMOptions`、系统属性、`FileInputStream`，还是 NIO 的 `Files` 读取方式，都统一走 `VMOptionsRule` 和 `StackTraceRule`。

最终效果就是：配置更少，维护成本更低，对插件升级也更稳。

最后再附上截图一张：

<p><img src="/znote/img/crack/2fbbf942-547d-4d01-af83-4b6209e0372c.png" width="400px"/></p>

<Reward/>
