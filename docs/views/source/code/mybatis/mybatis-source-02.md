---
title: 手写Mybatis-02：核心框架编码实现
date: 2025-11-05
tags:
  - 源码分析
  - Mybatis
categories:
  - 源码 Source-code
isShowComments: true
---

<Boxx/>

本篇动手实现 “迷你版 MyBatis” 的完整闭环：加载配置、解析 mapper、打开会话、执行 SQL、结果映射与资源释放。你将看到每一步对应到的类与职责。

<!-- more -->

[[toc]]

> 仓库地址: https://github.com/zpj80231/snail

## 流程总览：框架都做了什么

1. 读取 `mybatis-config.xml`，解析数据源与 mapper 文件
2. 读取 `mapper/*.xml`，注册 `statementId -> MapperStatement`
3. 通过 `SqlSessionFactory` 打开 `SqlSession`
4. 调用 `SqlSession.selectList/selectOne`，由 `Executor` 执行 JDBC
5. 使用 `#{}` 参数占位符替换与绑定
6. 将 `ResultSet` 映射为返回对象
7. 关闭资源

---

## 第0步：导入依赖（pom.xml）

基础依赖：`mysql-connector-java`、`druid`（数据源）、`dom4j`（XML 解析）、`lombok`、`junit`。

```xml
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
</dependency>

<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>8.0.30</version>
</dependency>
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>druid</artifactId>
    <version>1.2.24</version>
</dependency>
<dependency>
    <groupId>org.dom4j</groupId>
    <artifactId>dom4j</artifactId>
    <version>2.1.4</version>
</dependency>

<dependency>
    <groupId>junit</groupId>
    <artifactId>junit</artifactId>
    <scope>test</scope>
</dependency>
```

---

## 第1步：准备配置与 mapper

- 全局配置：数据源和 mapper 列表

```xml
<configuration>

    <!--数据源配置-->
    <dataSource>
        <property name="driverClassname" value="com.mysql.jdbc.Driver"></property>
        <property name="url" value="jdbc:mysql://localhost:3306/test"></property>
        <property name="username" value="root"></property>
        <property name="password" value="12345678"></property>
    </dataSource>

    <!--mapper文件配置-->
    <mappers>
        <mapper resource="mapper/UserMapper-01.xml"/>
    </mappers>

</configuration>
```

- mapper 示例 `UserMapper-01.xml`（命名空间决定 `statementId` 前缀）

  **某个 sql 语句的唯一标示 statementId：namespace.id**

  **如：user.selectList**

```xml
<mapper namespace="user">
    <!--查询所有-->
    <select id="selectList" resultType="com.snail.source.mybatis.entity.User">
        select *
        from user
    </select>

    <!--查询单个-->
    <select id="selectOne" resultType="com.snail.source.mybatis.entity.User"
            parameterType="com.snail.source.mybatis.entity.User">
        select * from user where id = #{id} and name = #{name}
    </select>
</mapper>
```

## 第2步：定义核心模型

- `Configuration`：保存数据源与语句映射表

  **是很重要的一个类，将所有的配置文件都聚合到 Configuration 中，方便一次读取以及统一管理**

```java
@Data
public class Configuration {

    /**
     * 数据源
     */
    private DataSource dataSource;
    /**
     * mapper statementId 语句映射集合
     */
    private Map<String, MapperStatement> mapperStatementMap = new HashMap<>();

}
```

- `MapperStatement`：封装每条 SQL 的元信息

  **mapper.xml 解析出来内容**

```java
@Data
public class MapperStatement {

    /**
     * SQL 语句 唯一ID：namespace.id
     */
    private String statementId;
    /**
     * 返回值类型
     */
    private String resultType;
    /**
     * 参数类型
     */
    private String parameterType;
    /**
     * SQL 语句
     */
    private String sql;

    /**
     * SQL 命令类型（增删改查，下一篇用到）
     */
    private String sqlCommandType;

}
```

## 第3步：资源加载工具

- `Resources`：从 classpath 读取配置流

```java
public class Resources {

    /**
     * 加载指定配置文件，获取资源作为流返回
     *
     * @param path 路径
     * @return {@link InputStream }
     * @throws Exception 异常
     */
    public static InputStream getResourceAsStream(String path) throws Exception {
        return Resources.class.getClassLoader().getResourceAsStream(path);
    }

}
```

## 第4步：解析配置与 mapper

### 解析全局配置

- 解析全局配置，构建数据源并装配 `Configuration`
  - **XMLConfigBuilder 核心配置解析类里面嵌套着 XMLMapperBuilder 映射配置文件解析类**
  - **输入流转化为 Document 对象，一是根据 property 标签获取数据库配置信息并创建数据源添加到 configuration**
  - **二是根据 mapper 标签通过 XMLMapperBuilder 解析类遍历解析配置文件同样添加到 configuration 的 map 集合类**


```java
public class XMLConfigBuilder {

    private final Configuration configuration;

    public XMLConfigBuilder() {
        this.configuration = new Configuration();
    }

    public Configuration parse(InputStream inputStream) throws Exception {
        // 将 xml 转为 document
        Document document = new SAXReader().read(inputStream);
        // 获取根节点，即 <configuration>
        Element rootElement = document.getRootElement();

        // ----- 解析 数据库 配置 -----
        /*
            1. 获取 <property> 节点
            2. 解析并构建为数据源对象
            3. 将数据源对象设置到 Configuration 中
        */
        // '//'表示匹配当前所有节点，而不考虑它们的位置
        // 如：<property name="driverClassName" value="com.mysql.jdbc.Driver"></property>
        Element dataSourceElement = rootElement.element("dataSource");
        List<Element> propertyList = dataSourceElement.elements("property");
        Properties properties = new Properties();
        for (Element element : propertyList) {
            String name = element.attributeValue("name");
            String value = element.attributeValue("value");
            properties.setProperty(name, value);
        }
        // 构建数据源对象
        DruidDataSource dataSource = new DruidDataSource();
        dataSource.setDriverClassName(properties.getProperty("driver"));
        dataSource.setUrl(properties.getProperty("url"));
        dataSource.setUsername(properties.getProperty("username"));
        dataSource.setPassword(properties.getProperty("password"));
        // 将构建好的数据源对象设置到 Configuration 中
        configuration.setDataSource(dataSource);

        // ----- 解析 Mapper Resource 配置 -----
        /*
           1. 获取 <mapper> 节点的 resource 属性值，即 mapper.xml 文件的相对路径
           2. 解析 mapper 文件，将 mapper.xml 文件中的 statement 配置解析为 MapperStatement 对象
           3. 将 MapperStatement 对象设置到 Configuration 中
        */
        // 如：<mapper resource="com/snail/source/mybatis/mapper/UserMapper.xml"></mapper>
        Element mappers = rootElement.element("mappers");
        List<Element> mapperList = mappers.elements("mapper");
        for (Element element : mapperList) {
            String resource = element.attributeValue("resource");
            InputStream mapperInputStream = Resources.getResourceAsStream(resource);
            XMLMapperBuilder xmlMapperBuilder = new XMLMapperBuilder(configuration);
            xmlMapperBuilder.parse(mapperInputStream);
        }

        return configuration;
    }

}
```

### 解析 mapper 文件

- 同 XMLConfigBuilder 解析类原理一样，传入configuration，注册 `statementId -> MapperStatement`

```java
public class XMLMapperBuilder {

    private final Configuration configuration;

    public XMLMapperBuilder(Configuration configuration) {
        this.configuration = configuration;
    }

    public void parse(InputStream mapperInputStream) throws Exception {
        // 解析流并获取根节点，即 <mapper>
        Document document = new SAXReader().read(mapperInputStream);
        Element rootElement = document.getRootElement();

        // ----- 解析 mapper 文件 -----
        /*
            如：<select id="selectOne" resultType="com.snail.source.mybatis.entity.User"
                        parameterType="com.snail.source.mybatis.entity.User">
                    select * from user where id = #{id} and name = #{name}
                </select>
            1. 获取 namespace，拼装 statementId
            2. 解析 mapper sql 语句，封装为 MapperStatement 对象
            3. 将 MapperStatement 对象设置到 Configuration 中
         */
        String namespace = rootElement.attributeValue("namespace");
        List<Element> selectList = rootElement.elements("select");
        for (Element element : selectList) {
            String value = element.attributeValue("id");
            String statementId = namespace + "." + value;
            String resultType = element.attributeValue("resultType");
            String parameterType = element.attributeValue("parameterType");
            String sql = element.getTextTrim();

            MapperStatement mapperStatement = new MapperStatement();
            mapperStatement.setStatementId(statementId);
            mapperStatement.setResultType(resultType);
            mapperStatement.setParameterType(parameterType);
            mapperStatement.setSql(sql);
            mapperStatement.setSqlCommandType("select");

          	// 核心：注册
            configuration.getMapperStatementMap().put(statementId, mapperStatement);
        }
    }

}
```

## 第5步：会话工厂与会话

- `SqlSessionFactoryBuilder`：解析输入流，产出会话工厂
  - **创建 XMLConfigBuilder 并调用 parse 方法：解析核心配置类，返回 Configuration 对象**
  - **创建 SqlSessionFactory 对象，以便之后创建 SqlSession 会话**


```java
public class SqlSessionFactoryBuilder {

    /**
     * 解析配置文件，创建 SqlSessionFactory 对象
     *
     * @param inputStream 输入流
     * @return {@link SqlSessionFactory }
     * @throws Exception 异常
     */
    public static SqlSessionFactory build(InputStream inputStream) throws Exception {
        // 1. 解析配置文件，创建 Configuration 核心对象
        Configuration configuration = new XMLConfigBuilder().parse(inputStream);
        // 2. 创建 SqlSessionFactory 对象
        return new DefaultSqlSessionFactory(configuration);
    }

}
```

- `DefaultSqlSessionFactory`：基于配置打开 `SqlSession`
  - **主要为了创建 SqlSession 会话，调用增删改查方法**
  - **创建简单执行器，与核心配置类共同创建 SqlSession 会话实现类**
  - **configuration 提供数据源配置和 sql 以及参数和结果集封装**
  - **simpleExecutor 提供 JDBC 执行 sql 的底层实现**


```java
public interface SqlSessionFactory {

    SqlSession openSession();

}

public class DefaultSqlSessionFactory implements SqlSessionFactory {

  	// 提供数据源配置和 sql 以及参数和结果集封装
    private final Configuration configuration;

    public DefaultSqlSessionFactory(Configuration configuration) {
        this.configuration = configuration;
    }

    @Override
    public SqlSession openSession() {
        // 简单执行器对象
        SimpleExecutor simpleExecutor = new SimpleExecutor();
        // 返回 SqlSession 对象
        // SqlSession 是一层代理或拦截器，真正干活的是 Executor
        return new DefaultSqlSession(configuration, simpleExecutor);
    }

}
```

- `SqlSession` 与 `DefaultSqlSession`：对外 API（增删改查、关闭资源等）
  - **statementId(“namespace.id”)：定位具体 Mapper.xml 的 sql 语句以及入参和返回**
  - **param：替换 sql 语句中的占位符 ？，可能字符串、对象、Map、集合**


```java
/**
 * SqlSession 数据库操作接口
 *
 * @author zhangpj
 * @date 2025/10/27
 */
public interface SqlSession {

    /**
     * 查询多条
     *
     * @param statementId 语句 ID
     * @param param       查询参数
     * @return {@link List }<{@link E }>
     */
    <E> List<E> selectList(String statementId, Object param) throws Exception;

    /**
     * 查询单条
     *
     * @param statementId 语句 ID
     * @param param       参数
     * @return {@link T }
     */
    <T> T selectOne(String statementId, Object param) throws Exception;

    /**
     * 关闭资源
     *
     */
    void close();

}
```

> 利用聚合进来的 configuration 对象获取 MapperStatement 映射配置对象向下传给执行器<br>利用聚合进来的 executor 简单执行器来执行底层 JDBC 操作<br>
> DefaultSqlSession 的作用则是聚合配置类分发到不同执行器的不同方法<br>
> 执行器种类：简单执行器、可重用执行器、批量执行器（这里只模拟第一种）<br>

```java
public class DefaultSqlSession implements SqlSession {

    private final Configuration configuration;
    private final Executor executor;

    public DefaultSqlSession(Configuration configuration, Executor executor) {
        this.configuration = configuration;
        this.executor = executor;
    }

    @Override
    public <E> List<E> selectList(String statementId, Object param) throws Exception {
        // 根据 statementId 获取 mapper sql 语句配置
        MapperStatement mapperStatement = configuration.getMapperStatementMap().get(statementId);
        // 将查询（数据源、sql、参数）委托给 Executor 执行器
        return executor.query(configuration, mapperStatement, param);
    }

    @Override
    public <T> T selectOne(String statementId, Object param) throws Exception {
        List<Object> list = selectList(statementId, param);
        if (list.size() == 1) {
            return (T) list.get(0);
        } else if (list.size() > 1) {
            throw new RuntimeException("Expected one result (or null) to be returned by selectOne(), but found: " + list.size());
        } else {
            return null;
        }
    }

    @Override
    public void close() {
        executor.close();
    }

}
```

## 第6步：执行器与 `#{}` 绑定

- 执行器接口：底层 JDBC 的封装。**执行器接口定义增删改查方法，具体的JDBC底层操作由它的实现类来完成**

```java
public interface Executor {

    <E> List<E> query(Configuration configuration, MapperStatement mapperStatement, Object param) throws Exception;

    void close();

}
```

- 简单执行器：获取连接 → 预编译 → 绑定参数 → 执行查询 → 映射结果 → 返回
  - 执行器实现类整体流程就是 JDBC 那一套，从加载驱动到处理结果集
  - **解析参数** getBoundSql 方法功能：
    > - 一是将 `<select>` 标签的sql语句 “#{字段名}” 替换成 ? 赋值给 finalSql。（这里使用的 mybatis 代码，不用深究）
    > - 二是将替换 ? 时候的字段名取出来放到 ParameterMapping 对象中，有多个，根据 ? 次序，放入 parameterMappingList 集合
  - **入参** 根据 `<select>` 标签的 parameterType 属性获取全限定类名，反射获取 Class 对象
    > - 遍历 parameterMappingList，获取字段名，加上 Class 对象获取 Field 属性类
    > - query 查询方法有个 param 参数，即入参对象（有可能字符串、集合，这里只考虑对象），通过 Field 属性和 param 对象通过反射获取属性值
  - **结果集** 根据 `<select>` 标签的 resultType 属性获取全限定类名，反射获取实例对象
    > - 通过结果集元数据获取字段名 columnName，再 resultSet.getObject 获取数据库中对应字段值
    > - 通过 java 实体字段名和 Class 对象获取对应字段的 get 方法的 Method
    > - 这里说下数据库字段和实体类的两个字段不是一回事，如果数据库和实体中不一样，就需要转化成一致


```java
public class SimpleExecutor implements Executor {

    private Connection connection;
    private ResultSet resultSet;
    private PreparedStatement preparedStatement = null;

    @Override
    public <E> List<E> query(Configuration configuration, MapperStatement mapperStatement, Object param)
            throws Exception {
        // 1. 加载驱动，获取连接
        connection = configuration.getDataSource().getConnection();

        // 2. 转换 sql，创建 PreparedStatement
        // 获取 mapper sql 模版
        // 如：select * from user where id = #{id} and username = #{username}
        String sql = mapperStatement.getSql();
        String parameterType = mapperStatement.getParameterType();
        // 解析 sql 模版，将 #{id} 替换为 ?
        BoundSql boundSql = getBoundSql(sql);
        String finalSql = boundSql.getFinalSql();
        preparedStatement = connection.prepareStatement(finalSql);

        // 3. 参数赋值
        if (parameterType != null && param != null) {
            Class<?> parameterTypeClass = Class.forName(parameterType);
            List<ParameterMapping> parameterMappings = boundSql.getParameterMappings();
            for (int i = 0; i < parameterMappings.size(); i++) {
                // 获取参数字段名
                ParameterMapping parameterMapping = parameterMappings.get(i);
                String paramName = parameterMapping.getContent();
                // 获取参数值
                Field field = parameterTypeClass.getDeclaredField(paramName);
                field.setAccessible(true);
                Object paramValue = field.get(param);
                preparedStatement.setObject(i + 1, paramValue);
            }
        }

        // 4. 执行 sql
        resultSet = preparedStatement.executeQuery();

        // 5. 解析结果集
        List<E> list = new ArrayList<>();
        while (resultSet.next()) {
            // mapper 模板标签的返回值类型
            String resultType = mapperStatement.getResultType();
            Class<?> resultTypeClass = Class.forName(resultType);
            Object obj = resultTypeClass.newInstance();

            // 数据库中的结果集
            ResultSetMetaData metaData = resultSet.getMetaData();
            for (int i = 1; i <= metaData.getColumnCount(); i++) {
                String columnName = metaData.getColumnName(i);
                Object columnValue = resultSet.getObject(columnName);
                // columnName：数据库字段名，而java实体类中字段名可能与数据库字段名不一致，所以需要一个转换
                // 可以获取实体类的 get、set 方法
                PropertyDescriptor propertyDescriptor = new PropertyDescriptor(columnName, resultTypeClass);
                Method writeMethod = propertyDescriptor.getWriteMethod();
                writeMethod.invoke(obj, columnValue);
            }
            list.add((E) obj);
        }

        return list;
    }

    /**
     * 获取绑定SQL及对应的参数
     * 1. 解析 mapper sql 模板，将 #{字段} 替换为 ?，最终赋值为 finalSql
     * 2. 获取参数映射。将 #{} 解析后的字段名，封装为 ParameterMapping 对象，并保存在 List<ParameterMapping> 中
     *
     * @param sql mapper sql
     * @return {@link BoundSql }
     */
    private BoundSql getBoundSql(String sql) {
        // 1. 标记处理器
        ParameterMappingTokenHandler parameterMappingTokenHandler = new ParameterMappingTokenHandler();
        // 2. 标记解析器
        GenericTokenParser genericTokenParser = new GenericTokenParser("#{", "}", parameterMappingTokenHandler);
        // 3. 解析器开始解析 sql
        // #{} 占位符替换成 ？
        // #{} 的字段名也会保存在标记处理器中
        String finalSql = genericTokenParser.parse(sql);
        // 4. 从标记处理器获取参数映射真实值
        List<ParameterMapping> parameterMappings = parameterMappingTokenHandler.getParameterMappings();
        return new BoundSql(finalSql, parameterMappings);
    }

    @Override
    public void close() {
        if (resultSet != null) {
            try {
                resultSet.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
        if (preparedStatement != null) {
            try {
                preparedStatement.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
        if (connection != null) {
            try {
                connection.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

}
```

- 其中 `getBoundSql` 主要用于**解析 SQL 和保存绑定参数**

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BoundSql {

    /**
     * 最终 SQL，占位符替换后的 SQL
     * 如：select * from user where id = ? and username = ?
     */
    private String finalSql;
    /**
     * 按顺序保存的映射参数值
     */
    private List<ParameterMapping> parameterMappings;

}
```

- 解析 `#{}` 占位符并记录字段顺序（工具而已不用深究，直接拿 Mybatis 的就好）

```java
public class GenericTokenParser {

    private final String openToken;
    private final String closeToken;
    private final TokenHandler handler;

    public GenericTokenParser(String openToken, String closeToken, TokenHandler handler) {
        this.openToken = openToken;
        this.closeToken = closeToken;
        this.handler = handler;
    }

    /**
     * 解析 ${} 和 #{}
     *
     * @param text 待处理的 sql 模板 字符串
     * @return 该方法主要实现了配置文件、脚本等片段中占位符的解析、处理工作，并返回最终需要的数据。
     * 其中，解析工作由该方法完成，处理工作是由处理器handler的handleToken()方法来实现
     */
    public String parse(String text) {
        // 验证参数问题，如果是null，就返回空字符串。
        if (text == null || text.isEmpty()) {
            return "";
        }

        // 下面继续验证是否包含开始标签，如果不包含，默认不是占位符，直接原样返回即可，否则继续执行。
        int start = text.indexOf(openToken, 0);
        if (start == -1) {
            return text;
        }

        // 把text转成字符数组src，并且定义默认偏移量offset=0、存储最终需要返回字符串的变量builder，
        // text变量中占位符对应的变量名expression。判断start是否大于-1(即text中是否存在openToken)，如果存在就执行下面代码
        char[] src = text.toCharArray();
        int offset = 0;
        final StringBuilder builder = new StringBuilder();
        StringBuilder expression = null;
        while (start > -1) {
            // 判断如果开始标记前如果有转义字符，就不作为openToken进行处理，否则继续处理
            if (start > 0 && src[start - 1] == '\\') {
                builder.append(src, offset, start - offset - 1).append(openToken);
                offset = start + openToken.length();
            } else {
                // 重置expression变量，避免空指针或者老数据干扰。
                if (expression == null) {
                    expression = new StringBuilder();
                } else {
                    expression.setLength(0);
                }
                builder.append(src, offset, start - offset);
                offset = start + openToken.length();
                int end = text.indexOf(closeToken, offset);
                while (end > -1) {////存在结束标记时
                    if (end > offset && src[end - 1] == '\\') {// 如果结束标记前面有转义字符时
                        // this close token is escaped. remove the backslash and continue.
                        expression.append(src, offset, end - offset - 1).append(closeToken);
                        offset = end + closeToken.length();
                        end = text.indexOf(closeToken, offset);
                    } else {// 不存在转义字符，即需要作为参数进行处理
                        expression.append(src, offset, end - offset);
                        offset = end + closeToken.length();
                        break;
                    }
                }
                if (end == -1) {
                    // close token was not found.
                    builder.append(src, start, src.length - start);
                    offset = src.length;
                } else {
                    // 首先根据参数的key（即expression）进行参数处理，返回?作为占位符
                    builder.append(handler.handleToken(expression.toString()));
                    offset = end + closeToken.length();
                }
            }
            start = text.indexOf(openToken, offset);
        }
        if (offset < src.length) {
            builder.append(src, offset, src.length - offset);
        }
        return builder.toString();
    }

}
```

```java
@Data
@AllArgsConstructor
public class ParameterMapping {

    /**
     * 保存 #{} 中对应的字段名称
     */
    private String content;

}

public interface TokenHandler {

    /**
     * 解析占位符。context是参数名称，如 #{id} 的 id。
     *
     * @param content 内容
     * @return {@link String }
     */
    String handleToken(String content);

}

@Data
public class ParameterMappingTokenHandler implements TokenHandler {

    /**
     * 按顺序保存 #{} 中对应的字段名称
     */
    private List<ParameterMapping> parameterMappings = new ArrayList<>();

    @Override
    public String handleToken(String content) {
        parameterMappings.add(buildParameterMapping(content));
        return "?";
    }

    private ParameterMapping buildParameterMapping(String content) {
        return new ParameterMapping(content);
    }

}
```

## 第7步：运行测试

### 数据库脚本

```sql
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of user
-- ----------------------------
BEGIN;
INSERT INTO `user` (`id`, `name`) VALUES (1, '张三');
INSERT INTO `user` (`id`, `name`) VALUES (2, '李四');
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
```

### 创建实体类

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    private Integer id;

    private String name;

}
```

### 创建配置文件

```java
<configuration>

    <!--数据源配置-->
    <dataSource>
        <property name="driverClassname" value="com.mysql.jdbc.Driver"></property>
        <property name="url" value="jdbc:mysql://localhost:3306/test"></property>
        <property name="username" value="root"></property>
        <property name="password" value="12345678"></property>
    </dataSource>

    <!--mapper文件配置-->
    <mappers>
        <mapper resource="mapper/UserMapper-01.xml"/>
    </mappers>

</configuration>
```

### 创建 mapper 文件

```xml
<mapper namespace="user">
    <!--查询所有-->
    <select id="selectList" resultType="com.snail.source.mybatis.entity.User">
        select *
        from user
    </select>

    <!--查询单个-->
    <select id="selectOne" resultType="com.snail.source.mybatis.entity.User"
            parameterType="com.snail.source.mybatis.entity.User">
        select * from user where id = #{id} and name = #{name}
    </select>
</mapper>
```

### 测试用例

- 一键跑通（方式一：手动传入 `statementId`）

```java
public class SnailMybatisTest {
    @Test
    public void test1() throws Exception {
        // 1. 加载配置文件到内存
        InputStream resourceAsStream = Resources.getResourceAsStream("mybatis-config.xml");
        // 2. 解析配置文件，封装为 Configuration 和 MapperStatement 对象
        SqlSessionFactory sqlSessionFactory = SqlSessionFactoryBuilder.build(resourceAsStream);
        // 3. 创建数据源，创建执行器 Executor 对象
        SqlSession sqlSession = sqlSessionFactory.openSession();

        // 4. 执行 sql，手动传入 statementId
        List<User> userList = sqlSession.selectList("user.selectList", null);
        System.out.println("指定statementId方式，selectList：" + userList);
        User user = new User(1, "张三");
        User userOne = sqlSession.selectOne("user.selectOne", user);
        System.out.println("指定statementId方式，selectOne：" + userOne);

        // 5. 关闭连接
        sqlSession.close();
    }
}
```

可以看到控制台正确打印查询结果，即表示核心流程已打通。

```shell
指定statementId方式，selectList：[User(id=1, name=张三), User(id=2, name=李四)]
指定statementId方式，selectOne：User(id=1, name=张三)
```

| 缺点                                    | 优点                                                       |
|---------------------------------------| ---------------------------------------------------------- |
| 调用方法需要手动设置参数 statementId：namespace.id | 完成一张表的增删改查只需要创建一个实体类和 mapper.xml 文件 |


> - 一键跑通（方式二：Mapper 接口 + 动态代理，下一篇内容）

## 小结

- 我们按 “依赖 → 模型 → 解析 → 工厂 → 会话 → 执行器 → 参数拼装/结果映射 -> 测试” 的顺序，从零完成了一个可运行的最小 MyBatis。

- 核心抽象与真实 MyBatis 一致：`Configuration/MapperStatement/SqlSession/Executor`。

- 下一篇将聚焦开发体验：通过 Mapper 接口与 JDK 动态代理，消除手写 `statementId` 的心智负担。

<Reward/>