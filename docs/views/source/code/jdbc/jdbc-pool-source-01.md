---
title: 手写 JDBC 连接池
date: 2024-10-08
tags:
  - 源码分析
  - Java
categories:
  - 源码 Source-code
isShowComments: true
---

<Boxx/>

在现代应用程序中，数据库连接池是提升性能和资源管理的关键组件。本文将从零开始，详细讲解如何实现一个高效的 JDBC 连接池。无论你是初学者还是有一定经验的开发者，相信本文都能为你提供有价值的指导。

项目代码地址：[传送门](https://github.com/zpj80231/snail/tree/main/snail-source-code/source-jdbc-pool)

<!-- more -->

[[toc]]

## 环境准备

在开始之前，请确保你的开发环境具备以下条件：

- **JDK 8 或以上**：确保你已经安装了 Java 开发环境，可以通过 `java -version` 命令检查。
- **Maven**：用于项目的依赖管理和构建。
- **IDE**：推荐使用 IntelliJ IDEA 或 Eclipse 进行开发和调试。

## 项目结构概览

JDBC 连接池模块主要包含以下几个核心部分：

```lua
(base) ~/IdeaProjects/snail/snail-source-code/source-jdbc-connection-pool
├── pom.xml
└── src
    ├── main
    │   ├── java
    │   │   └── com
    │   │       └── snail
    │   │           └── source
    │   │               └── code
    │   │                   └── jdbc
    │   │                       └── connection
    │   │                           ├── domain
    │   │                           │   └── PoolEntry.java
    │   │                           ├── manager
    │   │                           │   └── ConnectionPoolManager.java
    │   │                           ├── pool
    │   │                           │   ├── ConnectionPool.java
    │   │                           │   └── SimpleConnectionPool.java
    │   │                           └── properties
    │   │                               └── DataSourceProperties.java
    │   └── resources
    │       └── db.properties
    └── test
        └── java
            └── com
                └── snail
                    └── source
                        └── code
                            └── jdbc
                                └── connection
                                    └── TestDataSource.java
```

### 主要模块介绍

- **PoolEntry 接口**：封装实际的 JDBC 连接对象。
- **ConnectionPoolManager 类**：简化连接池操作的管理者，提供了一组静态方法来获取和释放数据库连接。
- **ConnectionPool 类**：定义获取和释放数据库连接的方法。
- **SimpleConnectionPool 类**：ConnectionPool 接口的具体实现。
- **DataSourceProperties 类**：管理连接池的配置参数。

## 核心模块解析实现

接下来，我们将逐个模块进行详细解析，理解其设计思想和实现细节。

### 连接池接口设计

`ConnectionPool` 定义了连接池的基本操作接口，包括获取连接、释放连接、关闭连接池等方法。

```java
package com.snail.source.code.jdbc.connection.pool;

import java.sql.Connection;
import java.sql.SQLException;

/**
 * 连接池
 *
 * @author zhangpengjun
 * @date 2024/8/21
 */
public interface ConnectionPool {

    /**
     * 获取连接
     *
     * @return {@link Connection }
     */
    Connection getConnection();

    /**
     * 释放连接
     *
     * @param conn 连接
     */
    void releaseConnection(Connection conn);

    /**
     * 关闭连接池
     */
    void shutdown() throws SQLException;

}
```

**解析：**

- `getConnection()`：从连接池中获取一个可用的数据库连接。
- `releaseConnection(Connection connection)`：将使用完毕的连接归还给连接池。
- `shutdown()`：关闭连接池，释放所有资源。

### 连接池实现

`SimpleConnectionPool` 是 `ConnectionPool` 接口的具体实现，负责管理连接的创建、分配和回收。

```java
package com.snail.source.code.jdbc.connection.pool;

import com.snail.source.code.jdbc.connection.domain.PoolEntry;
import com.snail.source.code.jdbc.connection.properties.DataSourceProperties;
import lombok.extern.slf4j.Slf4j;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.List;
import java.util.TimerTask;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * @author zhangpengjun
 * @date 2024/8/21
 */
@Slf4j
public class SimpleConnectionPool implements ConnectionPool {

    /**
     * 连接池配置
     */
    DataSourceProperties config;
    /**
     * 当前连接数
     */
    private final AtomicInteger currentConnectCount = new AtomicInteger(0);
    /**
     * 空闲中的连接池
     */
    List<Connection> freePools = new CopyOnWriteArrayList<>();
    /**
     * 正在使用中的连接池
     */
    List<PoolEntry> usedPools = new CopyOnWriteArrayList<>();
    /**
     * 调度器
     */
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1, runnable -> {
        Thread thread = new Thread(runnable);
        thread.setDaemon(true); // 设置为守护线程
        return thread;
    });

    public SimpleConnectionPool(DataSourceProperties config) {
        this.config = config;
        initializePool();
    }

    @Override
    public synchronized Connection getConnection() {
        Connection conn = null;
        if (usedPools.size() < config.getMaxSize()) {
            // 优先从空闲连接池获取连接，空闲连接池满的情况下判断是否达到最大连接数，没达到最大连接数则继续创建连接
            String connectionFrom;
            if (!freePools.isEmpty()) {
                conn = freePools.get(0);
                freePools.remove(conn);
                connectionFrom = "从空闲连接池获取连接";
            } else {
                // 空闲连接池已满，未达到最大连接数，新建连接
                conn = createConn();
                connectionFrom = "空闲连接池已满，未达到最大连接数，新建连接";
            }
            // 对连接进行校验，通过就放入活跃连接池
            if (isAlive(conn)) {
                usedPools.add(new PoolEntry(conn, true, System.currentTimeMillis()));
                log.info("[{}]，当前连接数：{}，最大连接数：{}，空闲连接池：{}，正在使用的连接池：{}",
                        connectionFrom, currentConnectCount.get(), config.getMaxSize(), freePools.size(), usedPools.size());
            } else {
                return getConnection();
            }
        } else {
            // 空闲连接池已满，达到最大连接数，等待后重试
            try {
                this.wait(100);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new RuntimeException(e);
            }
            log.info("[空闲连接池已满，达到最大连接数]，等待后重试。当前连接数：{}，最大连接数：{}，空闲连接池：{}，正在使用的连接池：{}",
                    currentConnectCount.get(), config.getMaxSize(), freePools.size(), usedPools.size());
        }
        return conn;
    }

    @Override
    public synchronized void releaseConnection(Connection conn) {
        if (!isAlive(conn)) {
            return;
        }
        // 从活跃连接池移除
        for (PoolEntry entry : usedPools) {
            if (entry.getConnection() == conn) {
                usedPools.remove(entry);
                break;
            }
        }
        // 空闲连接池没满，则归还到空闲连接池，否则关闭连接
        if (freePools.size() < config.getMaxSize()) {
            freePools.add(conn);
            log.info("[归还连接到空闲连接池]，当前连接数：{}，最大连接数：{}，空闲连接池：{}，正在使用的连接池：{}",
                    currentConnectCount.get(), config.getMaxSize(), freePools.size(), usedPools.size());
        } else {
            // 关闭连接
            try {
                conn.close();
                currentConnectCount.decrementAndGet();
            } catch (SQLException e) {
                log.error("关闭连接失败", e);
            }
        }
        notifyAll();
    }

    @Override
    public synchronized void shutdown() throws SQLException {
        // 关闭活跃连接
        for (PoolEntry entry : usedPools) {
            releaseConnection(entry.getConnection());
        }
        // 关闭空闲连接
        for (Connection conn : freePools) {
            conn.close();
            currentConnectCount.decrementAndGet();
        }
    }

    /**
     * 创建连接
     *
     * @return {@link Connection }
     */
    private synchronized Connection createConn(){
        Connection conn = null ;
        try {
            conn = DriverManager.getConnection(config.getUrl(), config.getUsername(), config.getPassword());
            currentConnectCount.incrementAndGet();
        } catch (SQLException e) {
            log.error("创建连接失败", e);
        }
        return conn;
    }

    /**
     * 校验是否有效
     *
     * @param conn 连接
     * @return boolean
     */
    private boolean isAlive(Connection conn) {
        try {
            return conn != null && conn.isValid(1000);
        } catch (SQLException e) {
            log.error("校验连接是否有效失败", e);
        }
        return false;
    }

    /**
     * 初始化
     * <br>
     * 根据配置加载连接到默认的空闲连接池
     */
    private void initializePool() {
        // 获取连接池 initSize 配置，获取连接加载到空闲连接池
        try {
            Class.forName(config.getDriver());
            for (int i = 0; i < config.getInitSize(); i++) {
                Connection conn = createConn();
                freePools.add(conn);
            }
            log.info("初始化连接池，当前连接数：{}，初始化连接数：{}, 最大连接数：{}，空闲连接池：{}，正在使用的连接池：{}",
                    currentConnectCount.get(), config.getInitSize(), config.getMaxSize(), freePools.size(), usedPools.size());
        } catch (ClassNotFoundException e) {
            log.error("加载驱动失败", e);
            throw new RuntimeException(e);
        }
        check();
    }

    /**
     * 开启定时任务检测连接
     * 1. 定时检查空闲连接池：检查连接是否可用，如果不可用，则关闭连接，并从空闲连接池中移除
     * 2. 定时检查正在使用的连接池：检查连接是否超时，如果超时，则关闭连接，并从正在使用的连接池中移除
     * 3. 定时检查最小连接数：如果空闲连接池小于最小连接数，则创建连接加载到空闲连接池
     */
    private void check() {
        if (Boolean.TRUE.equals(config.getHealth())) {
            scheduler.scheduleAtFixedRate(new CheckTask(), config.getDelay(), config.getPeriod(), TimeUnit.MILLISECONDS);
        }
    }

    class CheckTask extends TimerTask {
        @Override
        public void run() {
            // 1. 定时检查空闲连接池：检查连接是否可用，如果不可用，则关闭连接，并从空闲连接池中移除
            for (Connection conn : freePools) {
                if (!isAlive(conn)) {
                    try {
                        conn.close();
                    } catch (SQLException e) {
                        log.error("检测到连接不可用，关闭连接失败", e);
                    }
                    freePools.remove(conn);
                    currentConnectCount.decrementAndGet();
                    log.info("检测到连接不可用，关闭连接，当前连接数：{}，最大连接数：{}，空闲连接池：{}，正在使用的连接池：{}",
                            currentConnectCount.get(), config.getMaxSize(), freePools.size(), usedPools.size());
                }
            }
            // 2. 定时检查正在使用的连接池：检查连接是否超时，如果超时，则关闭连接，并从正在使用的连接池中移除
            for (PoolEntry poolEntry : usedPools) {
                if (System.currentTimeMillis() - poolEntry.getLastUsed() > config.getTimeout()) {
                    try {
                        poolEntry.getConnection().close();
                        usedPools.remove(poolEntry);
                        currentConnectCount.decrementAndGet();
                        log.info("检测到连接超时，关闭连接，当前连接数：{}，最大连接数：{}，空闲连接池：{}，正在使用的连接池：{}",
                                currentConnectCount.get(), config.getMaxSize(), freePools.size(), usedPools.size());
                    } catch (SQLException e) {
                        log.error("检测到连接超时，关闭连接失败", e);
                    }
                }
            }
            // 3. 定时检查最小连接数：如果空闲连接池小于最小连接数，则创建连接加载到空闲连接池
            while (freePools.size() < config.getInitSize()) {
                Connection conn = createConn();
                if (conn != null) {
                    freePools.add(conn);
                    log.info("检测到空闲连接池小于最小连接数，创建连接加载到空闲连接池，当前连接数：{}，最小连接数：{}，空闲连接池：{}，正在使用的连接池：{}",
                            currentConnectCount.get(), config.getInitSize(), freePools.size(), usedPools.size());
                }
            }
            // 4. 检查最小连接数、超过最小连接数则检查最大空闲时间，大于指定时间则删除连接

        }
    }

}
```

**解析：**

- **连接池初始化**：在构造函数中，根据配置参数初始化连接池，预先创建一定数量的连接。
- **创建新连接**：通过 `DriverManager` 获取新的数据库连接。
- **获取连接**：尝试从池中获取连接，如果池中无可用连接且未达到最大池容量，则创建新连接。若已达最大连接数，则等待后重试。
- **释放连接**：将使用完毕的连接归还池中，如果池已满，则关闭该连接。
- **关闭连接池**：遍历池中的所有连接并关闭，释放资源。
- **定时任务**：检查空闲和使用中的连接有效性及超时情况，并根据需要调整连接数量。

### 连接对象管理

`PoolEntry` 封装了实际的 JDBC 连接，并添加了一些额外的管理功能，如连接的使用状态、最后使用时间等。

```java
package com.snail.source.code.jdbc.connection.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Connection;

/**
 * @author zhangpengjun
 * @date 2024/8/22
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PoolEntry {

    /**
     * 连接
     */
    private Connection connection;
    /**
     * 是否使用中
     */
    private boolean inUse;
    /**
     * 最后使用时间
     */
    private long lastUsed;

}
```

**解析：**

- **状态管理**：通过 `inUse` 标记连接是否正在被使用。
- **使用时间管理**：记录连接的最后使用时间，用于连接的回收和检测。

### 配置管理

`DataSourceProperties` 负责加载和管理连接池的配置参数，如初始池大小、最大池大小、数据库连接信息等。

```java
package com.snail.source.code.jdbc.connection.properties;

import lombok.Data;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.Map;
import java.util.Properties;

/**
 * @author zhangpengjun
 * @date 2024/8/21
 */
@Data
public class DataSourceProperties {

    private String driver;
    private String url;
    private String username;
    private String password;
    private Integer initSize;
    private Integer maxSize;
    private Boolean health;
    private Long delay;
    private Long period;
    private Integer timeout;

    public DataSourceProperties() {
        Properties properties = new Properties();
        try {
            properties.load(DataSourceProperties.class.getClassLoader().getResourceAsStream("db.properties"));
            for (Map.Entry<Object, Object> entry : properties.entrySet()) {
                Object key = entry.getKey();
                Object value = entry.getValue();
                String fieldName = key.toString().replace("jdbc.", "");

                Field field = this.getClass().getDeclaredField(fieldName);
                Class<?> fieldType = field.getType();
                Object convertedValue = convertValue(value, fieldType);

                String methodName = "set" + fieldName.substring(0, 1).toUpperCase() + fieldName.substring(1);
                Method method = this.getClass().getDeclaredMethod(methodName, field.getType());
                method.invoke(this, convertedValue);            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private Object convertValue(Object value, Class<?> fieldType) {
        if (value == null && !fieldType.isPrimitive()) {
            return null;
        } else if (value == null) {
            return null;
        } else if (fieldType == Integer.TYPE || fieldType == Integer.class) {
            return Integer.parseInt((String) value);
        } else if (fieldType == Long.TYPE || fieldType == Long.class) {
            return Long.parseLong((String) value);
        } else if (fieldType == Boolean.TYPE || fieldType == Boolean.class) {
            return Boolean.parseBoolean((String) value);
        } else if (fieldType == Float.TYPE || fieldType == Float.class) {
            return Float.parseFloat((String) value);
        } else if (fieldType == Double.TYPE || fieldType == Double.class) {
            return Double.parseDouble((String) value);
        } else if (fieldType == String.class) {
            return value.toString();
        } else {
            throw new IllegalArgumentException("Unsupported type: " + fieldType.getName());
        }
    }

}
```

**解析：**

- **配置加载**：从 `db.properties` 文件中读取配置参数。
- **默认值设置**：为部分配置项设置了默认值，确保在缺少配置时系统仍能正常运行。（后续优化）
- **灵活性**：通过 Getter 和 Setter 方法，允许动态调整配置参数。（后续添加 nacos 优化）

### 添加配置文件

添加 `db.properties` 配置文件。

```properties
jdbc.driver=com.mysql.cj.jdbc.Driver
jdbc.url=jdbc:mysql://localhost:3306/imall?useUnicode=true&characterEncoding=UTF-8&serverTimezone=Asia/Shanghai&allowMultiQueries=true&useSSL=false&requireSSL=false&allowPublicKeyRetrieval=true&zeroDateTimeBehavior=convertToNull
jdbc.username=root
jdbc.password=12345678

# 初始化连接数
jdbc.initSize=3
# 最大连接数
jdbc.maxSize=6
#是否启动检查
jdbc.health=true
#检查延迟时间
jdbc.delay=2000
#间隔时间，重复获得连接的频率
jdbc.period=2000
# 连接超时时间，10S
jdbc.timeout=100000
```

### 简化连接池管理

`ConnectionPoolManager` 负责操作一个连接从连接池的获取和释放。

```Java
package com.snail.source.code.jdbc.connection.manager;

import com.snail.source.code.jdbc.connection.pool.ConnectionPool;
import com.snail.source.code.jdbc.connection.pool.SimpleConnectionPool;
import com.snail.source.code.jdbc.connection.properties.DataSourceProperties;
import lombok.NoArgsConstructor;

import java.sql.Connection;

/**
 * @author zhangpengjun
 * @date 2024/8/22
 */
@NoArgsConstructor(access = lombok.AccessLevel.PRIVATE)
public class ConnectionPoolManager {

    private static final DataSourceProperties config = new DataSourceProperties();
    private static final ConnectionPool CONNECTION_POOL = new SimpleConnectionPool(config);

    /**
     * 获取连接(重复利用机制)
     *
     * @return {@link Connection }
     */
    public static Connection getConnection() {
        return CONNECTION_POOL.getConnection();
    }

    /**
     * 释放连接(可回收机制)
     *
     * @param connection 连接
     */
    public static void releaseConnection(Connection connection) {
        CONNECTION_POOL.releaseConnection(connection);
    }

}
```

## 测试

对手写的简化版 JDBC 连接池进行并发获取测试，验证核心功能。

### 编写测试程序

```Java
package com.snail.source.code.jdbc.connection;

import com.snail.source.code.jdbc.connection.manager.ConnectionPoolManager;

import java.sql.Connection;

import static java.lang.Thread.sleep;

/**
 * @author zhangpengjun
 * @date 2024/8/22
 */
public class TestDataSource {

    public static void main(String[] args) {
        for (int i = 0; i < 10; i++) {
            new Thread(new ThreadConnection(), "thread-" + i).start();
        }
    }

    static class ThreadConnection implements Runnable {
        @Override
        public void run() {
            Connection connection = ConnectionPoolManager.getConnection();
            try {
                sleep(1000);
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            }
            ConnectionPoolManager.releaseConnection(connection);
        }
    }
}
```

### 查看结果

可以看到：初始化连接数为 3 个，最大连接数为 6 个。超过最大连接数会等待。最后释放连接。

```Java
18:11:25.432 [thread-0] INFO SimpleConnectionPool - 初始化连接池，当前连接数：3，初始化连接数：3, 最大连接数：6，空闲连接池：3，正在使用的连接池：0
18:11:25.434 [thread-0] INFO SimpleConnectionPool - [从空闲连接池获取连接]，当前连接数：3，最大连接数：6，空闲连接池：2，正在使用的连接池：1
18:11:25.434 [thread-1] INFO SimpleConnectionPool - [从空闲连接池获取连接]，当前连接数：3，最大连接数：6，空闲连接池：1，正在使用的连接池：2
18:11:25.435 [thread-3] INFO SimpleConnectionPool - [从空闲连接池获取连接]，当前连接数：3，最大连接数：6，空闲连接池：0，正在使用的连接池：3
18:11:25.438 [thread-2] INFO SimpleConnectionPool - [空闲连接池已满，未达到最大连接数，新建连接]，当前连接数：4，最大连接数：6，空闲连接池：0，正在使用的连接池：4
18:11:25.440 [thread-4] INFO SimpleConnectionPool - [空闲连接池已满，未达到最大连接数，新建连接]，当前连接数：5，最大连接数：6，空闲连接池：0，正在使用的连接池：5
18:11:25.441 [thread-6] INFO SimpleConnectionPool - [空闲连接池已满，未达到最大连接数，新建连接]，当前连接数：6，最大连接数：6，空闲连接池：0，正在使用的连接池：6
18:11:25.543 [thread-7] INFO SimpleConnectionPool - [空闲连接池已满，达到最大连接数]，等待后重试。当前连接数：6，最大连接数：6，空闲连接池：0，正在使用的连接池：6
18:11:25.543 [thread-9] INFO SimpleConnectionPool - [空闲连接池已满，达到最大连接数]，等待后重试。当前连接数：6，最大连接数：6，空闲连接池：0，正在使用的连接池：6
18:11:25.543 [thread-8] INFO SimpleConnectionPool - [空闲连接池已满，达到最大连接数]，等待后重试。当前连接数：6，最大连接数：6，空闲连接池：0，正在使用的连接池：6
18:11:25.543 [thread-5] INFO SimpleConnectionPool - [空闲连接池已满，达到最大连接数]，等待后重试。当前连接数：6，最大连接数：6，空闲连接池：0，正在使用的连接池：6
18:11:26.437 [thread-3] INFO SimpleConnectionPool - [归还连接到空闲连接池]，当前连接数：6，最大连接数：6，空闲连接池：1，正在使用的连接池：5
18:11:26.438 [thread-0] INFO SimpleConnectionPool - [归还连接到空闲连接池]，当前连接数：6，最大连接数：6，空闲连接池：2，正在使用的连接池：4
18:11:26.438 [thread-1] INFO SimpleConnectionPool - [归还连接到空闲连接池]，当前连接数：6，最大连接数：6，空闲连接池：3，正在使用的连接池：3
18:11:26.443 [thread-2] INFO SimpleConnectionPool - [归还连接到空闲连接池]，当前连接数：6，最大连接数：6，空闲连接池：4，正在使用的连接池：2
18:11:26.444 [thread-6] INFO SimpleConnectionPool - [归还连接到空闲连接池]，当前连接数：6，最大连接数：6，空闲连接池：5，正在使用的连接池：1
18:11:26.444 [thread-4] INFO SimpleConnectionPool - [归还连接到空闲连接池]，当前连接数：6，最大连接数：6，空闲连接池：6，正在使用的连接池：0
```

<Reward/>