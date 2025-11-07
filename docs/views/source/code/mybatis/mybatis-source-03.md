---
title: 手写Mybatis-03：基本框架优化，使用Mapper接口代替StatementId
date: 2025-11-22
tags:
  - 源码分析
  - Mybatis
categories:
  - 源码 Source-code
isShowComments: true
---

<Boxx/>

上一节我们已经跑通了最小可用的查询流程。本篇在此基础上做 “开发体验” 优化：提供 `Mapper 接口` 与 `JDK 动态代理`，让调用端不再需要手写 `statementId`，以更贴近真实 MyBatis 的使用方式。

<!-- more -->

[[toc]]

> 仓库地址: https://github.com/zpj80231/snail

## 问题与目标

- 现状：调用端需要自己传 `statementId`，易错、不直观
- 目标：像 MyBatis 一样，定义一个 `UserMapper` 接口，直接 `userMapper.selectList()` 或 `userMapper.selectOne(user)` 即可
- 思路：使用 JDK 动态代理
  1. 按 “接口全限定名 + 方法名” 拼接出 `statementId`
  2. 每个 **方法名、入参、返回值** 和 mapper.xml 中 `<select>` 标签的 **id、parameterType、resultType** 一一对应
  3. 获取 `statementId` 对应的 `mapper sql`，并且判断是 `增/删/改/查` 那种操作
  4. 自动分辨返回值类型（单值 or 集合）以便执行器自动调用 `selectOne/selectList`


## SqlSession 增强

如同 Mybatis 一样，添加一个 getMapper 方法，免去手动设置 statementId 的烦恼。

```java
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

    /**
     * 获取 Mapper 代理对象
     *
     * @param mapperClass 映射器类
     * @return {@link T }
     */
    <T> T getMapper(Class<T> mapperClass);

}
```

## Mapper 接口与命名约定

接口定义：

```java
public interface UserMapper {

    List<User> selectList();

    User selectOne(User user);

}
```

与之匹配的 mapper.xml（命名空间必须是接口全限定名，使得 `statementId` === `接口全限定名.方法名`）

```xml
<!--命名空间必须是接口全限定名-->
<mapper namespace="com.snail.source.mybatis.mapper.UserMapper">
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

## JDK 动态代理实现

核心逻辑在 `DefaultSqlSession#getMapper`：

要点：

- 通过返回值是否是参数化类型（如 `List<User>`）来判断调用 `selectList` 还是 `selectOne`
- `namespace` 与 `id` 的组合必须与接口和方法对应：`com.xxx.UserMapper.selectOne`
- statementId、参数、返回值都有了，但是 DefaultSqlSession 要有 CRUD 查询和更新操作，所以根据 `sqlCommandType` 来区分
- 目前只实现了 `select`，增删改留作扩展点

```java
@Override
public <T> T getMapper(Class<T> mapperClass) {
    // 使用 JDK 动态代理生成代理对象
    Object proxyInstance = Proxy.newProxyInstance(mapperClass.getClassLoader(), new Class[]{mapperClass}, (proxy, method, args) -> {
        // 1. 约定 statementId：接口名 + 方法名
        String className = mapperClass.getName();
        String methodName = method.getName();
        String statementId = className + "." + methodName;

        // 2. 获取 statementId 对应的 mapper sql 语句
        MapperStatement mapperStatement = configuration.getMapperStatementMap().get(statementId);
        String sqlCommandType = mapperStatement.getSqlCommandType();

        // 3. 根据 sqlCommandType 执行对应的操作
        switch (sqlCommandType) {
            case "select":
                Type genericReturnType = method.getGenericReturnType();
                if (genericReturnType instanceof ParameterizedType) {
                    if (args != null) {
                        return selectList(statementId, args[0]);
                    }
                    return selectList(statementId, null);
                }
                return selectOne(statementId, args[0]);
            case "insert":
                // 执行新增
                break;
            case "update":
                // 执行修改
                break;
            case "delete":
                // 执行删除
                break;
            default:
        }
        return null;
    });
    return (T) proxyInstance;
}
```

## 运行测试

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
        <mapper resource="mapper/UserMapper-02.xml"/>
    </mappers>

</configuration>
```

### 创建 mapper 文件

```xml
<mapper namespace="com.snail.source.mybatis.mapper.UserMapper">
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

- 一键跑通（方式二：Mapper 接口 + 动态代理）

```java
public class SnailMybatisTest {
    @Test
    public void test2() throws Exception {
        // 1. 加载配置文件到内存
        InputStream resourceAsStream = Resources.getResourceAsStream("mybatis-config.xml");
        // 2. 解析配置文件，封装为 Configuration 和 MapperStatement 对象
        SqlSessionFactory sqlSessionFactory = SqlSessionFactoryBuilder.build(resourceAsStream);
        // 3. 创建数据源，创建执行器 Executor 对象
        SqlSession sqlSession = sqlSessionFactory.openSession();

        // 4. 执行 sql，使用 mapper 接口代理
        UserMapper userMapper = sqlSession.getMapper(UserMapper.class);
        List<User> userList = userMapper.selectList();
        System.out.println("mapper接口方式，selectList：" + userList);
        User user = new User(1, "张三");
        User userOne = userMapper.selectOne(user);
        System.out.println("mapper接口方式，selectOne：" + userOne);

        // 5. 关闭连接
        sqlSession.close();
    }
}
```

可以看到也能查到结果，说明代理层成功接管了调用流程：

```shell
mapper接口方式，selectList：[User(id=1, name=张三), User(id=2, name=李四)]
mapper接口方式，selectOne：User(id=1, name=张三)
```

## 小结与展望

- 通过引入 Mapper 接口 + JDK 动态代理，调用端彻底摆脱了 `statementId` 与 `SqlSession` 的强耦合，开发体验显著提升；

- 框架扩展方向：
  - 支持 `insert/update/delete` 并返回影响行数；
  - 类型别名、下划线转驼峰映射、结果映射（`resultMap`）；
  - 二级缓存、插件、拦截器等高级特性。

- Spring 整合优化：
  - 与 Spring 整合之后，InputStream、SqlSessionFactory、SqlSession、UserMapper 代理对象统统不需要自己创建
  - 全都交给了Spring 容器管理，我们要做的就是 `@Autowired UserMapper userMapper;`
  - 然后就可以用代理对象调用增删改查方法了，大大简化了代码开发过程。

<Reward/>