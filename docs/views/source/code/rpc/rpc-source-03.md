---
title: 手写RPC-03：核心实现解析
date: 2025-07-10
tags:
  - 源码分析
  - Java
categories:
  - 源码 Source-code
isShowComments: true
---

<Boxx/>

`snail-source-code/source-rpc` 是一个轻量级的 RPC（远程过程调用）框架，旨在提供服务间通信的能力。它基于 Netty 构建底层网络通信，并通过自定义协议、序列化、负载均衡和服务注册发现等机制，实现了高效、可扩展的远程服务调用。本文将详细解析该 RPC 框架的各个核心组件和实现原理。

<!-- more -->

[[toc]]

## 1. RPC 核心概念与基础构建

RPC 框架的核心在于定义清晰的消息协议、高效的数据传输（序列化与编解码）、以及灵活的扩展机制。

### 1.1 消息结构

RPC 调用需要在客户端和服务端之间传输请求和响应数据。Snail RPC 定义了标准的消息结构来承载这些数据。

*   **`Message.java`**: 基础消息抽象类，定义了所有消息共有的属性，如 `sequenceId`（唯一标识请求/响应的序号）和 `messageType`（消息类型，区分请求、响应、心跳等）。

    ```java
    package com.sanil.source.code.rpc.core.message;

    import lombok.AccessLevel;
    import lombok.Data;
    import lombok.Setter;

    import java.io.Serializable;

    /**
     * 基础消息类
     *
     * @author zhangpengjun
     * @date 2025/5/7
     */
    @Data
    public abstract class Message implements Serializable {

        private static final long serialVersionUID = 2543388113851841657L;

        /**
         * 序列 ID，每个消息是唯一的
         */
        private long sequenceId;
        /**
         * 消息类型，表示不同消息的类型，比如：登录、退出、各种请求、各种响应、心跳、异常等
         */
        @Setter(AccessLevel.NONE)
        private MessageType messageType;

        /**
         * 获取消息类型，留待子类实现
         */
        public abstract MessageType getMessageType();

    }
    ```

*   **`RequestMessage.java`**: RPC 请求消息的具体实现，继承自 `Message`。它包含了调用远程服务所需的所有信息：
    
    *   `interfaceName`: 接口名称（全限定名）。
    *   `group`: 接口分组，用于多实现或环境隔离。
    *   `version`: 接口版本，用于多版本兼容。
    *   `methodName`: 待调用的方法名。
    *   `parameterTypes`: 方法参数类型数组。
    *   `parameterValues`: 方法参数值数组。
    *   `returnType`: 方法返回值类型。
    此外，它还提供了 `getRpcServiceName()` 方法，用于生成唯一的服务名称（`interfaceName#group#version`），方便服务注册与查找。
    
    ```java
    package com.sanil.source.code.rpc.core.message;
    
    import com.sanil.source.code.rpc.core.enums.MessageTypeEnum;
    import com.sanil.source.code.rpc.core.util.RpcServiceUtil;
    import lombok.Data;
    
    /**
     * @author zhangpengjun
     * @date 2025/5/7
     */
    @Data
    public class RequestMessage extends Message {
    
        private static final long serialVersionUID = 5860473646720164597L;
    
        /**
         * 接口名称
         */
        private String interfaceName;
        /**
         * 接口分组
         */
        private String group;
        /**
         * 接口版本
         */
        private String version;
        /**
         * 方法名称
         */
        private String methodName;
        /**
         * 参数类型
         */
        private Class<?>[] parameterTypes;
        /**
         * 参数值
         */
        private Object[] parameterValues;
        /**
         * 返回类型
         */
        private Class<?> returnType;
    
        @Override
        public MessageTypeEnum getMessageType() {
            return MessageTypeEnum.REQUEST;
        }
    
        public String getRpcServiceName() {
            return RpcServiceUtil.getProviderName(interfaceName, group, version);
        }
    
    }
    ```
    
*   **`ResponseMessage.java`**: RPC 响应消息的具体实现，继承自 `Message`。它包含了远程调用的结果：
    *   `returnValue`: 方法的返回值。
    *   `exceptionValue`: 如果方法执行发生异常，则包含异常信息。

    ```java
    package com.sanil.source.code.rpc.core.message;
    
    import com.sanil.source.code.rpc.core.enums.MessageTypeEnum;
    import lombok.Data;
    
    /**
     * @author zhangpengjun
     * @date 2025/5/7
     */
    @Data
    public class ResponseMessage extends Message {
    
        private static final long serialVersionUID = 4043827980668524857L;
    
        /**
         * 返回值
         */
        private Object returnValue;
        /**
         * 异常值
         */
        private Throwable exceptionValue;
    
        @Override
        public MessageTypeEnum getMessageType() {
            return MessageTypeEnum.RESPONSE;
        }
    }
    ```

### 1.2 序列化

序列化是将对象转换为字节序列的过程，反序列化则相反。Snail RPC 框架支持可插拔的序列化机制。

*   **`Serializer.java`**: 序列化器接口，定义了 `serialize`（序列化）和 `deserialize`（反序列化）两个核心方法。

    ```java
    package com.sanil.source.code.rpc.core.serialize;

    import com.sanil.source.code.rpc.core.extension.SPI;

    /**
     * 序列化器
     * 用于扩展序列化、反序列化算法
     *
     * @author zhangpengjun
     * @date 2025/5/7
     */
    @SPI
    public interface Serializer {

        /**
         * 序列化
         *
         * @param object 对象
         * @return {@link byte[] }
         */
        <T> byte[] serialize(T object);

        /**
         * 反序列化
         *
         * @param bytes 字节
         * @param clazz clazz
         * @return {@link T }
         */
        <T> T deserialize(byte[] bytes, Class<T> clazz);

    }
    ```

*   **`JavaSerializer.java`**: 基于 Java 自身序列化机制的实现。

    ```java
    package com.sanil.source.code.rpc.core.serialize;

    import cn.hutool.core.util.ObjectUtil;

    /**
     * @author zhangpengjun
     * @date 2025/5/7
     */
    public class JavaSerializer implements Serializer {

        @Override
        public <T> byte[] serialize(T object) {
            if (object != null) {
                return ObjectUtil.serialize(object);
            }
            return new byte[0];
        }

        @Override
        public <T> T deserialize(byte[] bytes, Class<T> clazz) {
            return ObjectUtil.deserialize(bytes);
        }

    }
    ```

*   **`JsonSerializer.java`**: 基于 Fastjson 库的 JSON 序列化实现。

    ```java
    package com.sanil.source.code.rpc.core.serialize;
    
    import com.alibaba.fastjson.JSON;
    import com.alibaba.fastjson.parser.Feature;
    
    /**
     * @author zhangpengjun
     * @date 2025/5/7
     */
    public class JsonSerializer implements Serializer {
    
        @Override
        public <T> byte[] serialize(T object) {
            return JSON.toJSONBytes(object);
        }
    
        @Override
        public <T> T deserialize(byte[] bytes, Class<T> clazz) {
            return JSON.parseObject(bytes, clazz, Feature.SupportClassForName);
        }
    
    }
    ```

### 1.3 编解码

为了在网络中传输 RPC 消息，需要将消息对象编码为字节流，并在接收端解码回消息对象。同时，为了解决 TCP 粘包/拆包问题，需要定义协议帧。

*   **`ProtocolFrameDecoder.java`**: 基于 Netty 的 `LengthFieldBasedFrameDecoder` 实现，用于解决 TCP 粘包/拆包问题。它通过读取消息头中预定义的长度字段来确定整个消息帧的长度，从而正确地解析消息。

    ```java
    package com.sanil.source.code.rpc.core.codec;

    import io.netty.handler.codec.LengthFieldBasedFrameDecoder;

    /**
     * 协议帧解码器，配合自定义协议解析使用
     *
     * @author zhangpengjun
     * @date 2025/5/7
     */
    public class ProtocolFrameDecoder extends LengthFieldBasedFrameDecoder {

        /**
         * 默认构造函数，使用默认的参数初始化ProtocolFrameDecoder
         * <p>
         * <table style="border:1px solid black; border-collapse:collapse;">
         *   <tr style="border:1px solid black;"><th style="border:1px solid black; padding: 10px;">参数名</th><th style="border:1px solid black; padding: 10px;">值</th><th style="border:1px solid black; padding: 10px;">含义</th></tr>
         *   <tr style="border:1px solid black;"><td style="border:1px solid black; padding: 6px;">maxFrameLength</td><td style="border:1px solid black; padding: 6px;">1024</td><td style="border:1px solid black; padding: 6px;">协议帧的最大长度，防止解码时占用过多内存。</td></tr>
         *   <tr style="border:1px solid black;"><td style="border:1px solid black; padding: 6px;">lengthFieldOffset</td><td style="border:1px solid black; padding: 6px;">24</td><td style="border:1px solid black; padding: 6px;">长度字段在协议帧中的起始偏移量（单位是字节）。</td></tr>
         *   <tr style="border:1px solid black;"><td style="border:1px solid black; padding: 6px;">lengthFieldLength</td><td style="border:1px solid black; padding: 6px;">4</td><td style="border:1px solid black; padding: 6px;">长度字段的字节数。这里为 4 字节，表示使用 32 位整数存储帧长度。</td></tr>
         *   <tr style="border:1px solid black;"><td style="border:1px solid black; padding: 6px;">lengthAdjustment</td><td style="border:1px solid black; padding: 6px;">0</td><td style="border:1px solid black; padding: 6px;">在计算实际帧长度时对读取到的长度值进行调整。</td></tr>
         *   <tr style="border:1px solid black;"><td style="border:1px solid black; padding: 6px;">initialBytesToStrip</td><td style="border:1px solid black; padding: 6px;">0</td><td style="border:1px solid black; padding: 6px;">解码后从缓冲区中移除的初始字节数。设置为 0 表示不解码后不移除任何字节。</td></tr>
         * </table>
         */
        public ProtocolFrameDecoder() {
            this(2 * 1024 * 1024, 20, 4, 0, 0);
        }

        /**
         * 构造函数，允许用户指定帧解码的参数
         *
         * @param maxFrameLength          期望解码的最大帧长度
         * @param lengthFieldOffset       长度字段的偏移量，即长度字段在帧中的位置
         * @param lengthFieldLength       长度字段的长度，以字节为单位
         * @param lengthAdjustment        长度调整值，用于计算帧长度
         * @param initialBytesToStrip     解码后初始需要移除的字节数
         */
        public ProtocolFrameDecoder(int maxFrameLength, int lengthFieldOffset, int lengthFieldLength, int lengthAdjustment, int initialBytesToStrip) {
            super(maxFrameLength, lengthFieldOffset, lengthFieldLength, lengthAdjustment, initialBytesToStrip);
        }

    }
    ```

*   **`MessageCodec.java`**: 核心编解码器，它继承自 Netty 的 `MessageToMessageCodec`。该编解码器定义了 RPC 协议的二进制格式，包括魔数、版本号、序列化类型、压缩类型、消息类型、序列 ID 和消息体长度，以及实际的消息体数据。它利用 SPI 机制动态加载序列化器和压缩器。

    ```java
    package com.sanil.source.code.rpc.core.codec;
    
    import com.sanil.source.code.rpc.core.compress.Compress;
    import com.sanil.source.code.rpc.core.config.RpcConfig;
    import com.sanil.source.code.rpc.core.enums.CompressEnum;
    import com.sanil.source.code.rpc.core.enums.SerializerEnum;
    import com.sanil.source.code.rpc.core.exception.RpcException;
    import com.sanil.source.code.rpc.core.extension.ExtensionLoader;
    import com.sanil.source.code.rpc.core.factory.MessageTypeFactory;
    import com.sanil.source.code.rpc.core.message.Message;
    import com.sanil.source.code.rpc.core.serialize.Serializer;
    import com.sanil.source.code.rpc.core.util.NettyAttrUtil;
    import io.netty.buffer.ByteBuf;
    import io.netty.channel.ChannelHandler;
    import io.netty.channel.ChannelHandlerContext;
    import io.netty.handler.codec.MessageToMessageCodec;
    import lombok.extern.slf4j.Slf4j;
    
    import java.util.List;
    
    /**
     * 消息编解码器
     *
     * @author zhangpengjun
     * @date 2025/5/7
     */
    @Slf4j
    @ChannelHandler.Sharable
    public class MessageCodec extends MessageToMessageCodec<ByteBuf, Message> {
    
        @Override
        protected void encode(ChannelHandlerContext ctx, Message msg, List<Object> out) throws Exception {
            RpcConfig config = NettyAttrUtil.getRpcConfig(ctx.channel());
            try {
                // 压缩方式
                String compressName = config.getCompress();
                byte compressType = CompressEnum.getType(compressName);
                Compress compress = ExtensionLoader.getExtensionLoader(Compress.class).getExtension(compressName);
                // 获取序列化方式
                String serializerName = config.getSerializer();
                byte serializerType = SerializerEnum.getType(serializerName);
                Serializer serializer = ExtensionLoader.getExtensionLoader(Serializer.class).getExtension(serializerName);
    
                int magicNum = config.getMagicNum();
                byte version = config.getVersion();
                int messageType = msg.getMessageType().getType();
                long sequenceId = msg.getSequenceId();
    
                ByteBuf buf = ctx.alloc().buffer();
                // 4个字节的魔数
                buf.writeInt(magicNum);
                // 1个字节的版本号
                buf.writeByte(version);
                // 1个字节的序列化方式
                buf.writeByte(serializerType);
                // 1个字节的压缩算法
                buf.writeByte(compressType);
                // 1个填充字节，补齐长度
                buf.writeBytes(new byte[]{0});
                // 4个字节的消息指令类型
                buf.writeInt(messageType);
                // 8个字节的消息序号
                buf.writeLong(sequenceId);
                // 4个字节的消息体长度
                byte[] bytes = serializer.serialize(msg);
                bytes = compress.compress(bytes);
                buf.writeInt(bytes.length);
                // 消息体
                buf.writeBytes(bytes);
    
                // log.debug("magicNum: {}, version: {}, serializerType: {}, messageType: {}, sequenceId: {}, length: {}",
                //         magicNum, version, serializerType, messageType, sequenceId, bytes.length);
                // log.debug("ByteBuf encode: {}", ByteBufUtil.prettyHexDump(buf));
    
                out.add(buf);
            } catch (Exception e) {
                throw new RpcException("编码过程中发生异常，请检查相关配置和数据。", e);
            }
        }
    
        @Override
        protected void decode(ChannelHandlerContext ctx, ByteBuf buf, List<Object> out) throws Exception {
            // log.debug("ByteBuf decode: {}", ByteBufUtil.prettyHexDump(buf));
            try {
                // 4个字节的魔数
                int magicNum = buf.readInt();
                // 1个字节的版本号
                byte version = buf.readByte();
                // 1个字节的序列化方式
                byte serializerType = buf.readByte();
                String serializerName = SerializerEnum.getName(serializerType);
                // 1个字节，压缩算法
                byte compressType = buf.readByte();
                String compressName = CompressEnum.getName(compressType);
                // 1个填充字节，补齐长度
                buf.readBytes(1);
                // 4个字节的消息指令类型
                int messageType = buf.readInt();
                // 8个字节的消息序号
                long sequenceId = buf.readLong();
                // 4个字节的消息体长度
                int length = buf.readInt();
                // 消息体
                byte[] bytes = new byte[length];
                buf.readBytes(bytes, 0, length);
    
                // log.debug("magicNum: {}, version: {}, serializerType: {}, messageType: {}, sequenceId: {}, length: {}",
                //         magicNum, version, serializerType, messageType, sequenceId, length);
    
                // 解压缩
                Compress compress = ExtensionLoader.getExtensionLoader(Compress.class).getExtension(compressName);
                bytes = compress.decompress(bytes);
                // 反序列化
                Serializer serializer = ExtensionLoader.getExtensionLoader(Serializer.class).getExtension(serializerName);
                Class<? extends Message> messageClass = MessageTypeFactory.getInstance().getMessageType(messageType);
                Message message = serializer.deserialize(bytes, messageClass);
    
                out.add(message);
            } catch (Exception e) {
                throw new RpcException("解码过程中发生异常，请检查相关配置和数据。", e);
            }
        }
    
    }
    ```

### 1.4 消息压缩

为了减少网络传输的数据量，提高通信效率，RPC 框架支持对消息体进行压缩。

*   **`Compress.java`**: 压缩器接口，定义了 `compress`（压缩）和 `decompress`（解压缩）方法。

    ```java
    package com.sanil.source.code.rpc.core.compress;

    import com.sanil.source.code.rpc.core.extension.SPI;

    /**
     * @author zhangpj
     * @date 2025/5/29
     */
    @SPI
    public interface Compress {

        byte[] compress(byte[] bytes);

        byte[] decompress(byte[] bytes);

    }
    ```

*   **`GzipCompress.java`**: 基于 Gzip 算法的压缩实现。

    ```java
    package com.sanil.source.code.rpc.core.compress;
    
    import com.sanil.source.code.rpc.core.exception.RpcException;
    
    import java.io.ByteArrayInputStream;
    import java.io.ByteArrayOutputStream;
    import java.io.IOException;
    import java.util.zip.GZIPInputStream;
    import java.util.zip.GZIPOutputStream;
    
    /**
     * @author zhangpj
     * @date 2025/5/29
     */
    public class GzipCompress implements Compress {
    
        private static final int BUFFER_SIZE = 1024 * 4;
    
        @Override
        public byte[] compress(byte[] bytes) {
            if (bytes == null) {
                throw new NullPointerException("bytes is null");
            }
            try (ByteArrayOutputStream out = new ByteArrayOutputStream();
                 GZIPOutputStream gzip = new GZIPOutputStream(out)) {
                gzip.write(bytes);
                gzip.flush();
                gzip.finish();
                return out.toByteArray();
            } catch (IOException e) {
                throw new RpcException("gzip compress error", e);
            }
        }
    
        @Override
        public byte[] decompress(byte[] bytes) {
            if (bytes == null) {
                throw new NullPointerException("bytes is null");
            }
            try (ByteArrayOutputStream out = new ByteArrayOutputStream();
                 GZIPInputStream gunzip = new GZIPInputStream(new ByteArrayInputStream(bytes))) {
                byte[] buffer = new byte[BUFFER_SIZE];
                int n;
                while ((n = gunzip.read(buffer)) > -1) {
                    out.write(buffer, 0, n);
                }
                return out.toByteArray();
            } catch (IOException e) {
                throw new RpcException("gzip decompress error", e);
            }
        }
    
    }
    ```

### 1.5 负载均衡

当一个服务有多个提供者时，客户端需要选择一个服务实例进行调用。Snail RPC 提供了可插拔的负载均衡策略。

*   **`LoadBalance.java`**: 负载均衡器接口，定义了 `select` 方法，用于从服务列表中选择一个地址。

    ```java
    package com.sanil.source.code.rpc.core.loadbalance;

    import com.sanil.source.code.rpc.core.extension.SPI;

    import java.net.InetSocketAddress;
    import java.util.List;

    /**
     * @author zhangpj
     * @date 2025/5/19
     */
    @SPI
    public interface LoadBalance {

        /**
         * 选择
         *
         * @param servers 服务器
         * @return {@link InetSocketAddress }
         */
        InetSocketAddress select(List<InetSocketAddress> servers);

    }
    ```

*   **`AbstractLoadBalance.java`**: 负载均衡的抽象基类，提供了默认的单服务器处理逻辑，将具体的选择逻辑留给子类实现。

    ```java
    package com.sanil.source.code.rpc.core.loadbalance;

    import com.sun.istack.internal.NotNull;

    import java.net.InetSocketAddress;
    import java.util.List;

    /**
     * @author zhangpj
     * @date 2025/5/19
     */
    public abstract class AbstractLoadBalance implements LoadBalance {

        @Override
        public InetSocketAddress select(@NotNull List<InetSocketAddress> servers) {
            if (servers.size() == 1) {
                return servers.get(0);
            }
            return doSelect(servers);
        }

        abstract InetSocketAddress doSelect(List<InetSocketAddress> servers);

    }
    ```

*   **`RoundRobinLoadBalance.java`**: 轮询负载均衡实现，依次选择服务列表中的下一个服务。

    ```java
    package com.sanil.source.code.rpc.core.loadbalance;

    import java.net.InetSocketAddress;
    import java.util.List;
    import java.util.concurrent.atomic.AtomicInteger;

    /**
     * @author zhangpj
     * @date 2025/5/19
     */
    public class RoundRobinLoadBalance extends AbstractLoadBalance {

        private final AtomicInteger index = new AtomicInteger(0);

        @Override
        InetSocketAddress doSelect(List<InetSocketAddress> servers) {
            int current;
            int next;
            do {
                current = index.get();
                next = current == Integer.MAX_VALUE ? 0 : current + 1;
            } while (!index.compareAndSet(current, next));
            int pos = current % servers.size();
            return servers.get(pos);
        }

    }
    ```

*   **`RandomLoadBalance.java`**: 随机负载均衡实现，从服务列表中随机选择一个服务。

    ```java
    package com.sanil.source.code.rpc.core.loadbalance;
    
    import cn.hutool.core.util.RandomUtil;
    
    import java.net.InetSocketAddress;
    import java.util.List;
    
    /**
     * @author zhangpj
     * @date 2025/5/19
     */
    public class RandomLoadBalance extends AbstractLoadBalance {
    
        @Override
        InetSocketAddress doSelect(List<InetSocketAddress> servers) {
            return RandomUtil.randomEle(servers);
        }
    
    }
    ```

### 1.6 服务注册与发现

服务注册与发现是 RPC 框架不可或缺的一部分，它允许服务提供者注册自己的服务，并允许服务消费者查找和调用这些服务。

*   **`ServerRegistry.java`**: 服务注册表接口，定义了服务的注册、取消注册、获取服务地址等操作。

    ```java
    package com.sanil.source.code.rpc.core.registry;

    import com.sanil.source.code.rpc.core.extension.SPI;

    import java.net.InetSocketAddress;
    import java.util.Map;
    import java.util.Set;

    /**
     * 服务端注册表：记录服务在哪个server服务器地址的对应关系
     *
     * @author zhangpengjun
     * @date 2025/5/7
     */
    @SPI
    public interface ServerRegistry {

        /**
         * 注册
         *
         * @param serviceName   服务名称
         * @param serverAddress 服务器地址
         */
        void register(String serviceName, InetSocketAddress serverAddress);

        /**
         * 取消注册
         *
         * @param serviceName 服务名称
         * @return
         */
        InetSocketAddress unregister(String serviceName, InetSocketAddress serverAddress);

        /**
         * 获取服务器地址
         *
         * @param serviceName 服务名称
         * @return {@link InetSocketAddress }
         */
        Set<InetSocketAddress> getServerAddress(String serviceName);

        /**
         * 获取所有服务器
         *
         * @return {@link Map }<{@link String }, {@link Object }>
         */
        Map<String, Set<InetSocketAddress>> getServers();

    }
    ```

*   **`LocalServerRegistry.java`**: 本地服务注册表实现，将服务名称与服务器地址的映射关系存储在本地文件系统（`/tmp/snail-rpc/` 目录）中。这是一种简化的注册中心实现，适用于单机或测试环境。

    ```java
    package com.sanil.source.code.rpc.core.registry;

    import cn.hutool.core.collection.CollUtil;
    import cn.hutool.core.io.FileUtil;
    import cn.hutool.core.util.ArrayUtil;
    import lombok.extern.slf4j.Slf4j;

    import java.io.File;
    import java.net.InetSocketAddress;
    import java.nio.file.Paths;
    import java.util.Arrays;
    import java.util.List;
    import java.util.Map;
    import java.util.Set;
    import java.util.concurrent.ConcurrentHashMap;

    /**
     * @author zhangpengjun
     * @date 2025/5/7
     */
    @Slf4j
    public class LocalServerRegistry implements ServerRegistry {

        private static final String BASE_DIR = "/tmp/snail-rpc/";

        @Override
        public void register(String serviceName, InetSocketAddress serverAddress) {
            saveToFile(serviceName, serverAddress);
        }

        @Override
        public InetSocketAddress unregister(String serviceName, InetSocketAddress serverAddress) {
            return removeToFile(serviceName, serverAddress);
        }

        @Override
        public Set<InetSocketAddress> getServerAddress(String serviceName) {
            return getServers().get(serviceName);
        }

        @Override
        public Map<String, Set<InetSocketAddress>> getServers() {
            return loadFromFile();
        }

        private void saveToFile(String serviceName, InetSocketAddress serverAddress) {
            String addrPath = getAddrPath(serviceName, serverAddress);
            FileUtil.touch(addrPath);
        }

        private InetSocketAddress removeToFile(String serviceName, InetSocketAddress serverAddress) {
            String addrPath = getAddrPath(serviceName, serverAddress);
            File addrDir = FileUtil.getParent(FileUtil.file(addrPath), 1);
            boolean success = FileUtil.del(addrPath);
            if (addrDir != null && FileUtil.isDirEmpty(addrDir)) {
                try {
                    FileUtil.del(addrDir);
                } catch (Exception e) {
                    // nothing
                }
            }
            return success ? serverAddress : null;
        }

        private static Map<String, Set<InetSocketAddress>> loadFromFile() {
            File[] serviceDirs = FileUtil.ls(BASE_DIR);
            if (ArrayUtil.isEmpty(serviceDirs)) {
                return new ConcurrentHashMap<>();
            }
            Map<String, Set<InetSocketAddress>> caches = new java.util.HashMap<>();
            Arrays.stream(serviceDirs).filter(File::isDirectory).forEach(serviceNameFile -> {
                List<String> servers = FileUtil.listFileNames(serviceNameFile.getAbsolutePath());
                Set<InetSocketAddress> inetSocketAddresses = CollUtil.newHashSet();
                servers.forEach(server -> {
                    String[] split = server.split(":");
                    inetSocketAddresses.add(new InetSocketAddress(split[0], Integer.parseInt(split[1])));
                });
                caches.put(serviceNameFile.getName(), inetSocketAddresses);
            });
            return caches;
        }

        private String getAddrPath(String serviceName, InetSocketAddress serverAddress) {
            String servicePath = getServicePath(serviceName);
            String serverAddressStr  = serverAddress.getHostString() + ":" + serverAddress.getPort();
            return Paths.get(servicePath, serverAddressStr).toString();
        }

        private String getServicePath(String serviceName) {
            return Paths.get(BASE_DIR, serviceName).toString();
        }

    }
    ```

*   **`ServiceProvider.java`**: 服务提供者接口，维护服务名称与具体服务实例之间的映射关系。

    ```java
    package com.sanil.source.code.rpc.core.registry;

    import com.sanil.source.code.rpc.core.extension.SPI;

    import java.util.Map;

    /**
     * 服务注册中心：维护服务和具体的服务实例之间的映射关系
     *
     * @author zhangpengjun
     * @date 2025/5/7
     */
    @SPI
    public interface ServiceProvider {

        /**
         * 注册
         *
         * @param serviceName 服务名称
         * @param service     服务
         */
        void register(String serviceName, Object service);

        /**
         * 取消注册
         *
         * @param serviceName 服务名称
         * @return
         */
        Object unregister(String serviceName);

        /**
         * 获取服务器地址
         *
         * @param serviceName 服务名称
         * @return {@link Object }
         */
        Object getService(String serviceName);

        /**
         * 获取所有服务
         *
         * @return {@link Map }<{@link String }, {@link Object }>
         */
        Map<String, Object> getServices();

    }
    ```

*   **`LocalServiceProvider.java`**: 本地服务提供者实现，通过 `ConcurrentHashMap` 维护已暴露的服务实例。

    ```java
    package com.sanil.source.code.rpc.core.registry;
    
    import lombok.extern.slf4j.Slf4j;
    
    import java.util.Map;
    import java.util.concurrent.ConcurrentHashMap;
    
    /**
     * @author zhangpengjun
     * @date 2025/5/7
     */
    @Slf4j
    public class LocalServiceProvider implements ServiceProvider {
    
        private static final Map<String, Object> SERVICE_REGISTRY = new ConcurrentHashMap<>();
    
        @Override
        public void register(String serviceName, Object service) {
            SERVICE_REGISTRY.put(serviceName, service);
        }
    
        @Override
        public Object unregister(String serviceName) {
            return SERVICE_REGISTRY.remove(serviceName);
        }
    
        @Override
        public Object getService(String serviceName) {
            return SERVICE_REGISTRY.get(serviceName);
        }
    
        @Override
        public Map<String, Object> getServices() {
            return SERVICE_REGISTRY;
        }
    
    }
    ```

### 1.7 扩展机制 (SPI)

Snail RPC 框架采用了类似 Dubbo 的 SPI（Service Provider Interface）机制，实现了框架的高度可扩展性，允许开发者轻松替换或添加新的序列化、压缩、负载均衡和注册中心实现。

*   **`SPI.java`**: 一个标记接口，用于标注那些可以通过 SPI 机制进行扩展的接口。

    ```java
    package com.sanil.source.code.rpc.core.extension;

    import java.lang.annotation.ElementType;
    import java.lang.annotation.Retention;
    import java.lang.annotation.Target;

    @Documented
    @Retention(RetentionPolicy.RUNTIME)
    @Target(ElementType.TYPE)
    public @interface SPI {

    }
    ```

*   **`ExtensionLoader.java`**: SPI 机制的核心。它负责：
    *   加载 `META-INF/extensions/` 目录下（遵循 Java SPI 规范）配置的扩展实现类。
    *   通过 `getExtension(String name)` 方法根据名称获取扩展实例，并支持单例模式。
    *   在加载时会检查接口是否被 `@SPI` 注解标记。

    ```java
    package com.sanil.source.code.rpc.core.extension;
    
    import cn.hutool.core.util.StrUtil;
    import lombok.extern.slf4j.Slf4j;
    
    import java.io.BufferedReader;
    import java.io.IOException;
    import java.io.InputStreamReader;
    import java.net.URL;
    import java.util.Enumeration;
    import java.util.HashMap;
    import java.util.Map;
    import java.util.concurrent.ConcurrentHashMap;
    
    import static java.nio.charset.StandardCharsets.UTF_8;
    
    /**
     * refer to dubbo spi: https://dubbo.apache.org/zh-cn/docs/source_code_guide/dubbo-spi.html
     */
    @Slf4j
    public final class ExtensionLoader<T> {
    
        private static final String SERVICE_DIRECTORY = "META-INF/extensions/";
        private static final Map<Class<?>, ExtensionLoader<?>> EXTENSION_LOADERS = new ConcurrentHashMap<>();
        private static final Map<Class<?>, Object> EXTENSION_INSTANCES = new ConcurrentHashMap<>();
    
        private final Class<?> type;
        private final Map<String, Holder<Object>> cachedInstances = new ConcurrentHashMap<>();
        private final Holder<Map<String, Class<?>>> cachedClasses = new Holder<>();
    
        private ExtensionLoader(Class<?> type) {
            this.type = type;
        }
    
        public static <S> ExtensionLoader<S> getExtensionLoader(Class<S> type) {
            if (type == null) {
                throw new IllegalArgumentException("Extension type should not be null.");
            }
            if (!type.isInterface()) {
                throw new IllegalArgumentException("Extension type must be an interface.");
            }
            if (type.getAnnotation(SPI.class) == null) {
                throw new IllegalArgumentException("Extension type must be annotated by @SPI");
            }
            // firstly get from cache, if not hit, create one
            ExtensionLoader<S> extensionLoader = (ExtensionLoader<S>) EXTENSION_LOADERS.get(type);
            if (extensionLoader == null) {
                EXTENSION_LOADERS.putIfAbsent(type, new ExtensionLoader<S>(type));
                extensionLoader = (ExtensionLoader<S>) EXTENSION_LOADERS.get(type);
            }
            return extensionLoader;
        }
    
        public T getExtension(String name) {
            if (StrUtil.isBlank(name)) {
                throw new IllegalArgumentException("Extension name should not be null or empty.");
            }
            // firstly get from cache, if not hit, create one
            Holder<Object> holder = cachedInstances.get(name);
            if (holder == null) {
                cachedInstances.putIfAbsent(name, new Holder<>());
                holder = cachedInstances.get(name);
            }
            // create a singleton if no instance exists
            Object instance = holder.get();
            if (instance == null) {
                synchronized (holder) {
                    instance = holder.get();
                    if (instance == null) {
                        instance = createExtension(name);
                        holder.set(instance);
                    }
                }
            }
            return (T) instance;
        }
    
        private T createExtension(String name) {
            // load all extension classes of type T from file and get specific one by name
            Class<?> clazz = getExtensionClasses().get(name);
            if (clazz == null) {
                throw new RuntimeException("No such extension of name " + name);
            }
            T instance = (T) EXTENSION_INSTANCES.get(clazz);
            if (instance == null) {
                try {
                    EXTENSION_INSTANCES.putIfAbsent(clazz, clazz.newInstance());
                    instance = (T) EXTENSION_INSTANCES.get(clazz);
                } catch (Exception e) {
                    log.error(e.getMessage());
                }
            }
            return instance;
        }
    
        private Map<String, Class<?>> getExtensionClasses() {
            // get the loaded extension class from the cache
            Map<String, Class<?>> classes = cachedClasses.get();
            // double check
            if (classes == null) {
                synchronized (cachedClasses) {
                    classes = cachedClasses.get();
                    if (classes == null) {
                        classes = new HashMap<>();
                        // load all extensions from our extensions directory
                        loadDirectory(classes);
                        cachedClasses.set(classes);
                    }
                }
            }
            return classes;
        }
    
        private void loadDirectory(Map<String, Class<?>> extensionClasses) {
            String fileName = ExtensionLoader.SERVICE_DIRECTORY + type.getName();
            try {
                Enumeration<URL> urls;
                ClassLoader classLoader = ExtensionLoader.class.getClassLoader();
                urls = classLoader.getResources(fileName);
                if (urls != null) {
                    while (urls.hasMoreElements()) {
                        URL resourceUrl = urls.nextElement();
                        loadResource(extensionClasses, classLoader, resourceUrl);
                    }
                }
            } catch (IOException e) {
                log.error(e.getMessage());
            }
        }
    
        private void loadResource(Map<String, Class<?>> extensionClasses, ClassLoader classLoader, URL resourceUrl) {
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(resourceUrl.openStream(), UTF_8))) {
                String line;
                // read every line
                while ((line = reader.readLine()) != null) {
                    // get index of comment
                    final int ci = line.indexOf('#');
                    if (ci >= 0) {
                        // string after # is comment so we ignore it
                        line = line.substring(0, ci);
                    }
                    line = line.trim();
                    if (line.length() > 0) {
                        try {
                            final int ei = line.indexOf('=');
                            String name = line.substring(0, ei).trim();
                            String clazzName = line.substring(ei + 1).trim();
                            // our SPI use key-value pair so both of them must not be empty
                            if (name.length() > 0 && clazzName.length() > 0) {
                                Class<?> clazz = classLoader.loadClass(clazzName);
                                extensionClasses.put(name, clazz);
                            }
                        } catch (ClassNotFoundException e) {
                            log.error(e.getMessage());
                        }
                    }
    
                }
            } catch (IOException e) {
                log.error(e.getMessage());
            }
        }
    }
    ```

## 2. 客户端实现

Snail RPC 客户端负责代理远程服务接口、发送 RPC 请求并处理响应。

### 2.1 客户端注解

*   **`RpcReference.java`**: 用于标记需要远程调用的服务接口或字段，并可配置服务的 `serviceName`、`group` 和 `version`。

    ```java
    package com.sanil.source.code.rpc.client.annotation;
    
    import java.lang.annotation.ElementType;
    import java.lang.annotation.Retention;
    import java.lang.annotation.RetentionPolicy;
    import java.lang.annotation.Target;
    
    /**
     * @author zhangpj
     * @date 2025/5/29
     */
    @Target({ElementType.TYPE, ElementType.FIELD})
    @Retention(RetentionPolicy.RUNTIME)
    public @interface RpcReference {
    
        String serviceName() default "";
    
        String group() default "";
    
        String version() default "";
    
    }
    ```

### 2.2 客户端代理

客户端通过动态代理（JDK 动态代理）为远程服务接口生成本地代理对象。当调用代理对象的方法时，实际会触发 RPC 请求的发送。

*   **`RpcClientProxy.java`**: 实现了 `InvocationHandler` 接口，是客户端代理的核心。当代理对象的任何方法被调用时，`invoke` 方法会被触发：
    1.  生成唯一的 `sequenceId` 用于标识请求。
    2.  创建一个 Netty `Promise` 对象，用于异步接收 RPC 响应。
    3.  构建 `RequestMessage`，填充方法名、参数类型、参数值、接口名等信息。
    4.  通过 `RpcClientManager` 发送 `RequestMessage`。
    5.  阻塞等待 `Promise` 结果，当接收到对应的响应时，`Promise` 会被设值并唤醒等待的线程，从而返回远程调用结果或抛出异常。

    ```java
    package com.sanil.source.code.rpc.client.proxy;
    
    import cn.hutool.core.util.IdUtil;
    import cn.hutool.core.util.StrUtil;
    import com.sanil.source.code.rpc.client.RpcClientManager;
    import com.sanil.source.code.rpc.client.annotation.RpcReference;
    import com.sanil.source.code.rpc.core.exception.RpcException;
    import com.sanil.source.code.rpc.core.message.RequestMessage;
    import com.sanil.source.code.rpc.core.util.PromiseManager;
    import io.netty.util.concurrent.DefaultPromise;
    import io.netty.util.concurrent.Promise;
    import lombok.extern.slf4j.Slf4j;
    
    import java.lang.reflect.InvocationHandler;
    import java.lang.reflect.Method;
    import java.lang.reflect.Proxy;
    import java.util.Optional;
    
    /**
     * RPC 客户端服务代理
     *
     * @author zhangpengjun
     * @date 2025/5/8
     */
    @Slf4j
    public class RpcClientProxy implements InvocationHandler {
        
        private final RpcClientManager manager;
        private RpcReferenceBuilder rpcReferenceBuilder;
    
        public RpcClientProxy(RpcClientManager manager) {
            this.manager = manager;
        }
    
        public RpcClientProxy(RpcClientManager manager, RpcReferenceBuilder config) {
            this.manager = manager;
            this.rpcReferenceBuilder = config;
        }
    
        /**
         * 创建代理
         *
         * @param interfaceClazz 被代理的类
         * @return {@link T }
         */
        @SuppressWarnings("unchecked")
        public <T> T getProxyService(Class<T> interfaceClazz) {
            ClassLoader classLoader = interfaceClazz.getClassLoader();
            RpcReference rpcReference = interfaceClazz.getAnnotation(RpcReference.class);
            if (rpcReference != null && rpcReferenceBuilder == null) {
                rpcReferenceBuilder = RpcReferenceBuilder.builder()
                        .group(rpcReference.group())
                        .version(rpcReference.version())
                        .service(interfaceClazz)
                        .build();
            }
            return (T) Proxy.newProxyInstance(classLoader, new Class[]{interfaceClazz}, this);
        }
    
        @Override
        public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
            long sequenceId = IdUtil.getSnowflakeNextId();
            Promise<Object> promise = new DefaultPromise<>(manager.getGroup().next());
            PromiseManager.add(sequenceId, promise);
    
            // 构造请求消息，进行远程调用
            RequestMessage requestMessage = new RequestMessage();
            requestMessage.setSequenceId(sequenceId);
            requestMessage.setInterfaceName(method.getDeclaringClass().getName());
            requestMessage.setMethodName(method.getName());
            requestMessage.setParameterTypes(method.getParameterTypes());
            requestMessage.setParameterValues(args);
            requestMessage.setReturnType(method.getReturnType());
            if (rpcReferenceBuilder != null) {
                String serviceName = Optional.ofNullable(rpcReferenceBuilder.getService()).map(Class::getName).orElse(null);
                requestMessage.setInterfaceName(StrUtil.isNotBlank(serviceName) ? serviceName : requestMessage.getInterfaceName());
                requestMessage.setGroup(rpcReferenceBuilder.getGroup());
                requestMessage.setVersion(rpcReferenceBuilder.getVersion());
            }
    
            // 发起rpc请求
            manager.sendRpcRequest(requestMessage);
    
            // 等待远程调用结果
            promise.await(5000);
            if (promise.isSuccess()) {
                return promise.getNow();
            } else {
                throw new RpcException(promise.cause());
            }
        }
    
    }
    ```

### 2.3 客户端连接管理

客户端通过 Netty 管理与服务端的连接，并负责请求的发送。

*   **`RpcClientManager.java`**: RPC 客户端的核心管理器，负责：
    1.  **初始化 Netty 客户端**: 配置 `NioEventLoopGroup` 和 `Bootstrap`，并添加 `RpcClientInitializer` 到 ChannelPipeline。
    2.  **连接管理**: 维护与服务端的连接池，支持连接复用。在发送请求前，会尝试从连接池获取或创建新连接。
    3.  **服务发现**: 通过 `ServerDiscovery` 接口（SPI 扩展）查找指定服务对应的服务端地址。
    4.  **请求发送**: 将构建好的 `RequestMessage` 通过 Netty `Channel` 发送给服务端。
    5.  **资源关闭**: 在客户端关闭时，优雅地关闭 Netty 资源。

    ```java
    package com.sanil.source.code.rpc.client;
    
    import cn.hutool.core.collection.CollUtil;
    import com.sanil.source.code.rpc.client.handler.RpcClientInitializer;
    import com.sanil.source.code.rpc.core.config.RpcConfig;
    import com.sanil.source.code.rpc.core.exception.RpcException;
    import com.sanil.source.code.rpc.core.extension.ExtensionLoader;
    import com.sanil.source.code.rpc.core.loadbalance.ServerDiscovery;
    import com.sanil.source.code.rpc.core.message.RequestMessage;
    import com.sanil.source.code.rpc.core.util.ChannelManager;
    import io.netty.bootstrap.Bootstrap;
    import io.netty.channel.Channel;
    import io.netty.channel.ChannelOption;
    import io.netty.channel.nio.NioEventLoopGroup;
    import io.netty.channel.socket.nio.NioSocketChannel;
    import lombok.Getter;
    import lombok.extern.slf4j.Slf4j;
    
    import java.net.InetSocketAddress;
    
    /**
     * RPC 客户端管理器
     *
     * @author zhangpengjun
     * @date 2025/5/8
     */
    @Slf4j
    @Getter
    public class RpcClientManager {
    
        private static final RpcConfig rpcConfig = RpcConfig.loadFromFile();
        private NioEventLoopGroup group;
        private Bootstrap bootstrap;
        private final ServerDiscovery serverDiscovery;
    
        public RpcClientManager() {
            this.serverDiscovery = ExtensionLoader.getExtensionLoader(ServerDiscovery.class).getExtension(rpcConfig.getDiscovery());
            initBootStrap();
        }
    
        private void initBootStrap() {
            group = new NioEventLoopGroup();
            bootstrap = new Bootstrap();
            bootstrap.group(group)
                    .channel(NioSocketChannel.class)
                    .option(ChannelOption.TCP_NODELAY, true)
                    .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 5000)
                    .handler(new RpcClientInitializer(rpcConfig));
        }
    
        /**
         * 连接
         *
         * @return {@link Channel }
         */
        public Channel connect() {
            return connect(rpcConfig.getServerHost(), rpcConfig.getServerPort());
        }
    
        /**
         * 连接
         *
         * @param host 主机
         * @param port 端口
         * @return {@link Channel }
         */
        public Channel connect(String host, int port) {
            return connect(InetSocketAddress.createUnresolved(host, port));
        }
    
        /**
         * 连接
         *
         * @param socketAddress socket 地址
         * @return {@link Channel }
         */
        public Channel connect(InetSocketAddress socketAddress) {
            // 连接复用
            Channel channel = ChannelManager.get(socketAddress.toString());
            if (channel != null && channel.isOpen() && channel.isActive()) {
                return channel;
            } else {
                ChannelManager.removeAndClose(socketAddress.toString());
            }
    
            // 创建连接
            try {
                channel = bootstrap.connect(socketAddress).sync().channel();
                channel.closeFuture().addListener(future -> ChannelManager.removeAndClose(socketAddress.toString()));
                log.info("rpc client 连接成功 -> {}", socketAddress);
                ChannelManager.add(socketAddress.toString(), channel);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new RpcException("连接被中断", e);
            } catch (Exception e) {
                Throwable cause = e.getCause() == null ? e : e.getCause();
                throw new RpcException("rpc client 启动失败 -> " + cause.getMessage(), e);
            }
    
            return channel;
        }
    
        /**
         * 发送 RPC 请求
         *
         * @param requestMessage 请求消息
         */
        public void sendRpcRequest(RequestMessage requestMessage) {
            InetSocketAddress socketAddress = serverDiscovery.lookup(requestMessage.getRpcServiceName());
            Channel channel = connect(socketAddress);
            if (!channel.isOpen() || !channel.isActive()) {
                ChannelManager.removeAndClose(socketAddress.toString());
                return;
            }
            channel.writeAndFlush(requestMessage);
        }
    
        /**
         * 关闭
         */
        public void shutdown() {
            if (CollUtil.isEmpty(ChannelManager.getChannels())) {
                group.shutdownGracefully();
            }
        }
    
    }
    ```

### 2.4 客户端 Netty 处理器

客户端 Netty ChannelPipeline 中包含了处理消息编解码、心跳、以及 RPC 响应的处理器。

*   **`RpcClientInitializer.java`**: 负责初始化 Netty 客户端的 `ChannelPipeline`。它添加了：
    *   `IdleStateHandler`: 用于处理空闲超时，发送心跳包。
    *   `ProtocolFrameDecoder`: 处理 TCP 粘包/拆包。
    *   `MessageCodec`: 负责 RPC 消息的编解码。
    *   `HeartBeatClientHandler`: 客户端心跳处理器。
    *   `PongMessageHandler`: 处理服务器端发送的 Pong 消息（心跳响应）。
    *   `RpcResponseMessageHandler`: 处理 RPC 响应消息。

    ```java
    package com.sanil.source.code.rpc.client.handler;
    
    import com.sanil.source.code.rpc.core.codec.MessageCodec;
    import com.sanil.source.code.rpc.core.codec.ProtocolFrameDecoder;
    import com.sanil.source.code.rpc.core.config.RpcConfig;
    import com.sanil.source.code.rpc.core.util.NettyAttrUtil;
    import io.netty.channel.Channel;
    import io.netty.channel.ChannelHandler;
    import io.netty.channel.ChannelInitializer;
    import io.netty.channel.ChannelPipeline;
    import io.netty.handler.logging.LogLevel;
    import io.netty.handler.logging.LoggingHandler;
    import io.netty.handler.timeout.IdleStateHandler;
    
    /**
     * RPC 客户端初始化器
     *
     * @author zhangpengjun
     * @date 2025/5/8
     */
    @ChannelHandler.Sharable
    public class RpcClientInitializer extends ChannelInitializer<Channel> {
    
        private final RpcConfig rpcConfig;
    
        public static final MessageCodec MESSAGE_CODEC = new MessageCodec();
        public static final LoggingHandler LOGGING_HANDLER = new LoggingHandler(LogLevel.DEBUG);
        public static final HeartBeatClientHandler HEART_BEAT_CLIENT_HANDLER = new HeartBeatClientHandler();
        public static final PongMessageHandler PONG_MESSAGE_HANDLER = new PongMessageHandler();
        public static final RpcResponseMessageHandler RPC_RESPONSE_MESSAGE_HANDLER = new RpcResponseMessageHandler();
    
        public RpcClientInitializer(RpcConfig rpcConfig) {
            this.rpcConfig = rpcConfig;
        }
    
        @Override
        protected void initChannel(Channel ch) throws Exception {
            ChannelPipeline pipeline = ch.pipeline();
            NettyAttrUtil.setRpcConfig(ch, rpcConfig);
            pipeline.addLast(new IdleStateHandler(0, 15, 0));
            pipeline.addLast(new ProtocolFrameDecoder());
            pipeline.addLast(MESSAGE_CODEC);
            // pipeline.addLast(LOGGING_HANDLER);
            pipeline.addLast(HEART_BEAT_CLIENT_HANDLER);
            pipeline.addLast(PONG_MESSAGE_HANDLER);
            pipeline.addLast(RPC_RESPONSE_MESSAGE_HANDLER);
        }
    
    }
    ```

*   **`RpcResponseMessageHandler.java`**: 负责处理从服务端接收到的 `ResponseMessage`。它根据 `sequenceId` 从 `PromiseManager` 中查找对应的 `Promise`，然后将远程调用结果或异常设置到 `Promise` 中，从而通知等待的客户端线程。

    ```java
    package com.sanil.source.code.rpc.client.handler;
    
    import com.sanil.source.code.rpc.core.exception.RpcException;
    import com.sanil.source.code.rpc.core.message.ResponseMessage;
    import com.sanil.source.code.rpc.core.util.PromiseManager;
    import io.netty.channel.ChannelHandler;
    import io.netty.channel.ChannelHandlerContext;
    import io.netty.channel.SimpleChannelInboundHandler;
    import io.netty.util.concurrent.Promise;
    import lombok.extern.slf4j.Slf4j;
    
    /**
     * @author zhangpengjun
     * @date 2025/5/8
     */
    @Slf4j
    @ChannelHandler.Sharable
    public class RpcResponseMessageHandler extends SimpleChannelInboundHandler<ResponseMessage> {
    
        @Override
        protected void channelRead0(ChannelHandlerContext ctx, ResponseMessage msg) throws Exception {
            // 获取远程调用结果
            long sequenceId = msg.getSequenceId();
            Object returnValue = msg.getReturnValue();
            Throwable exceptionValue = msg.getExceptionValue();
            Promise<Object> promise = PromiseManager.remove(sequenceId);
            if (promise == null) {
                throw new RpcException("未找到对应的promise, sequenceId: " + sequenceId);
            }
            if (exceptionValue != null) {
                promise.setFailure(exceptionValue);
            }
            promise.setSuccess(returnValue);
        }
    
    }
    ```

## 3. 服务端实现

Snail RPC 服务端负责暴露服务、接收客户端请求、执行服务方法并返回响应。

### 3.1 服务端注解

*   **`RpcService.java`**: 用于标记需要暴露为 RPC 服务的实现类，并可配置服务的 `name`、`group` 和 `version`。

    ```java
    package com.sanil.source.code.rpc.server.annotation;

    import java.lang.annotation.ElementType;
    import java.lang.annotation.Retention;
    import java.lang.annotation.Target;

    /**
     * @author zhangpengjun
     * @date 2025/5/7
     */
    @Target(ElementType.TYPE)
    @Retention(java.lang.annotation.RetentionPolicy.RUNTIME)
    public @interface RpcService {

        /**
         * 默认为提供者的接口名，可以自定义
         *
         * @return {@link String }
         */
        String name() default "";

        /**
         * 同一接口有多实现的话，可以分组。如：dev、uat、prod
         *
         * @return {@link String }
         */
        String group() default "";

        /**
         * 同一接口有多实现的话，可以分版本。如：1.0.0、1.0.1
         *
         * @return {@link String }
         */
        String version() default "";

    }
    ```

*   **`EnableRpcServer.java`**: 通常用于 Spring Boot 应用程序中，通过该注解启用 RPC 服务器的自动配置和服务的自动扫描注册。

    ```java
    package com.sanil.source.code.rpc.server.annotation;
    
    import java.lang.annotation.ElementType;
    import java.lang.annotation.Inherited;
    import java.lang.annotation.Retention;
    import java.lang.annotation.Target;
    
    /**
     * @author zhangpengjun
     * @date 2025/5/7
     */
    @Target(ElementType.TYPE)
    @Retention(java.lang.annotation.RetentionPolicy.RUNTIME)
    @Inherited
    public @interface EnableRpcServer {
    
        String[] value() default {};
    
    }
    ```

### 3.2 服务端管理器

服务端的核心逻辑由 `RpcServerManager` 管理。

*   **`RpcServerManager.java`**: RPC 服务器的核心管理器，负责：
    1.  **初始化 Netty 服务器**: 配置 `NioEventLoopGroup` 和 `ServerBootstrap`，并添加 `RpcServerInitializer` 到 ChannelPipeline。
    2.  **服务注册**: 在启动时，根据 `@EnableRpcServer` 和 `@RpcService` 注解自动扫描并注册服务实例到 `ServiceProvider` 和 `ServerRegistry`。
    3.  **资源管理**: 管理 Netty 资源，并在服务器关闭时取消服务的注册，释放资源。

    ```java
    package com.sanil.source.code.rpc.server;
    
    import cn.hutool.core.annotation.AnnotationUtil;
    import cn.hutool.core.thread.ThreadUtil;
    import cn.hutool.core.util.ArrayUtil;
    import cn.hutool.core.util.ClassUtil;
    import cn.hutool.core.util.ReflectUtil;
    import cn.hutool.core.util.StrUtil;
    import com.sanil.source.code.rpc.core.config.RpcConfig;
    import com.sanil.source.code.rpc.core.exception.RpcException;
    import com.sanil.source.code.rpc.core.extension.ExtensionLoader;
    import com.sanil.source.code.rpc.core.registry.ServerRegistry;
    import com.sanil.source.code.rpc.core.registry.ServiceProvider;
    import com.sanil.source.code.rpc.core.util.RpcServiceUtil;
    import com.sanil.source.code.rpc.server.annotation.EnableRpcServer;
    import com.sanil.source.code.rpc.server.annotation.RpcService;
    import com.sanil.source.code.rpc.server.handler.RpcServerInitializer;
    import io.netty.bootstrap.ServerBootstrap;
    import io.netty.channel.Channel;
    import io.netty.channel.ChannelOption;
    import io.netty.channel.nio.NioEventLoopGroup;
    import io.netty.channel.socket.nio.NioServerSocketChannel;
    import lombok.Getter;
    import lombok.extern.slf4j.Slf4j;
    
    import java.lang.annotation.Annotation;
    import java.lang.reflect.Modifier;
    import java.net.InetSocketAddress;
    import java.util.Arrays;
    import java.util.HashSet;
    import java.util.Optional;
    import java.util.Set;
    
    /**
     * RPC 服务器管理器
     *
     * @author zhangpengjun
     * @date 2025/5/7
     */
    @Slf4j
    @Getter
    public class RpcServerManager {
    
        private static final RpcConfig RPC_CONFIG = RpcConfig.loadFromFile();
        private final InetSocketAddress serverAddress;
        private final ServerRegistry serverRegistry;
        private final ServiceProvider serviceProvider;
    
        NioEventLoopGroup bossGroup;
        NioEventLoopGroup workerGroup;
        ServerBootstrap bootstrap;
        Channel channel;
    
        private boolean autoRegister = true;
    
        public RpcServerManager() {
            this(RPC_CONFIG.getServerPort());
        }
    
        public RpcServerManager(int port) {
            this(new InetSocketAddress(RPC_CONFIG.getServerHost(), port));
        }
    
        public RpcServerManager(String host, int port) {
            this(new InetSocketAddress(host, port));
        }
    
        public RpcServerManager(InetSocketAddress serverAddress) {
            this(serverAddress,
                    ExtensionLoader.getExtensionLoader(ServerRegistry.class).getExtension(RPC_CONFIG.getServerRegistry()),
                    ExtensionLoader.getExtensionLoader(ServiceProvider.class).getExtension(RPC_CONFIG.getServiceProvider()));
        }
    
        public RpcServerManager(InetSocketAddress serverAddress, ServerRegistry serverRegistry, ServiceProvider serviceProvider) {
            this.serverAddress = serverAddress;
            this.serverRegistry = serverRegistry;
            this.serviceProvider = serviceProvider;
        }
    
        public void setAutoRegister(boolean autoRegister) {
            this.autoRegister = autoRegister;
        }
    
        /**
         * rpc服务端启动，同步
         */
        public void start() {
            bossGroup = new NioEventLoopGroup();
            workerGroup = new NioEventLoopGroup();
            bootstrap = new ServerBootstrap();
            bootstrap.group(bossGroup, workerGroup)
                    .channel(NioServerSocketChannel.class)
                    .childOption(ChannelOption.SO_KEEPALIVE, true)
                    .childOption(ChannelOption.TCP_NODELAY, true)
                    .childHandler(new RpcServerInitializer(RPC_CONFIG, this));
            try {
                autoRegister();
                channel = bootstrap.bind(serverAddress.getPort()).sync().channel();
                log.info("rpc server 启动成功，监听地址: {}", serverAddress);
                channel.closeFuture().sync().addListener(future -> unregisterResource());
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.error("rpc server 启动被中断", e);
            } catch (Exception e) {
                log.error("rpc server 启动失败: {}", e.getMessage(), e);
                throw new RpcException("rpc server 启动失败: " + e.getMessage(), e);
            } finally {
                bossGroup.shutdownGracefully();
                workerGroup.shutdownGracefully();
            }
        }
    
        /**
         * rpc服务端启动，异步
         */
        public void startAsync() {
            ThreadUtil.execAsync(this::start);
        }
    
    
        /**
         * 自动注册相关提供者
         */
        private void autoRegister() {
            // 是否自动注册服务
            // 1. Spring集成时用的是 @EnableRpcService 注解，作为bean注入，不用走默认的 autoRegister()
            // 2. RPC服务端单独使用时，使用的是的 @EnableRpcServer 注解，走 autoRegister() 逻辑
            if (!autoRegister) {
                return;
            }
    
            // 根据 Enable注解 确定扫描范围（为空则从main类开始扫描），扫描指定包下的类，并完成注册
            String mainClassPath = findMainClassPath();
            Class<?> mainClass = ClassUtil.loadClass(mainClassPath);
            EnableRpcServer enableRpcServer = AnnotationUtil.getAnnotation(mainClass, EnableRpcServer.class);
            if (enableRpcServer == null) {
                mainClassPath = findAnnotationClassPath(EnableRpcServer.class);
                mainClass = ClassUtil.loadClass(mainClassPath);
                enableRpcServer = AnnotationUtil.getAnnotation(mainClass, EnableRpcServer.class);
                if (enableRpcServer == null) {
                    throw new RpcException("启动类未添加或未找到 @EnableRpcServer 注解");
                }
            }
    
            // 处理多个包路径
            Set<Class<?>> classSet = new HashSet<>();
            String[] basePackages = enableRpcServer.value();
            if (ArrayUtil.isEmpty(basePackages) || (basePackages.length == 1 && StrUtil.isBlank(basePackages[0]))) {
                // 没有指定包路径，使用默认包路径
                String defaultPackage = mainClassPath.substring(0, mainClassPath.lastIndexOf("."));
                classSet.addAll(ClassUtil.scanPackageByAnnotation(defaultPackage, RpcService.class));
            } else {
                // 扫描所有指定的包路径
                Arrays.stream(basePackages).filter(StrUtil::isNotBlank)
                        .forEach(basePackage -> classSet.addAll(ClassUtil.scanPackageByAnnotation(basePackage, RpcService.class)));
            }
    
            // 注册符合条件的服务
            for (Class<?> aClass : classSet) {
                if (isInvalidServiceImpl(aClass)) {
                    continue;
                }
                RpcService rpcServiceAnnotation = aClass.getAnnotation(RpcService.class);
                String serviceName = Optional.ofNullable(rpcServiceAnnotation.name())
                        .filter(StrUtil::isNotBlank).orElse(aClass.getInterfaces()[0].getName());
                String group = rpcServiceAnnotation.group();
                String version = rpcServiceAnnotation.version();
                Object service = ReflectUtil.newInstance(aClass);
                doRegister(RpcServiceUtil.getProviderName(serviceName, group, version), service);
            }
    
            Runtime.getRuntime().addShutdownHook(new Thread(this::unregisterResource));
        }
    
        /**
         * 是否为无效的 serviceImpl
         *
         * @param clazz 克拉兹
         * @return boolean
         */
        private boolean isInvalidServiceImpl(Class<?> clazz) {
            return ArrayUtil.isEmpty(clazz.getInterfaces()) || clazz.isInterface() || Modifier.isAbstract(clazz.getModifiers());
        }
    
        /**
         * 注册
         *
         * @param serviceName 服务名称
         * @param service     服务
         */
        private void doRegister(String serviceName, Object service) {
            if (log.isDebugEnabled()) {
                log.debug("register serviceName: {}, service: {}, serverAddress: {}", serviceName, service, serverAddress);
            }
            serviceProvider.register(serviceName, service);
            serverRegistry.register(serviceName, serverAddress);
        }
    
        /**
         * 查找主类路径
         *
         * @return {@link String }
         */
        private static String findMainClassPath() {
            StackTraceElement[] stack = new Throwable().getStackTrace();
            return stack[stack.length - 1].getClassName();
        }
    
        /**
         * 查找 指定注解 类路径
         *
         * @return {@link String }
         */
        private static <A extends Annotation> String findAnnotationClassPath(Class<A> annotationType) {
            Set<Class<?>> classes = ClassUtil.scanPackage("");
            for (Class<?> clazz : classes) {
                if (Modifier.isPublic(clazz.getModifiers()) && Modifier.isStatic(clazz.getModifiers())) {
                    continue;
                }
                Annotation annotation = AnnotationUtil.getAnnotation(clazz, annotationType);
                if (annotation != null) {
                    return clazz.getName();
                }
            }
            return "";
        }
    
        /**
         * unregister 资源
         */
        private void unregisterResource() {
            log.debug("unregister rpc server resource");
            serviceProvider.getServices().keySet().parallelStream().forEach(serviceProvider::unregister);
            serverRegistry.getServers().keySet().parallelStream().forEach(serviceName -> serverRegistry.unregister(serviceName, serverAddress));
        }
    
        /**
         * 销毁 rpc 服务
         */
        public void destroy() {
            unregisterResource();
            if (channel != null) {
                channel.close();
            }
            if (bossGroup != null) {
                bossGroup.shutdownGracefully();
            }
            if (workerGroup != null) {
                workerGroup.shutdownGracefully();
            }
            log.debug("destroy rpc server");
        }
    
    }
    ```

### 3.3 服务端 Netty 处理器

服务端 Netty ChannelPipeline 中包含了处理消息编解码、心跳、以及 RPC 请求的处理器。

*   **`RpcServerInitializer.java`**: 负责初始化 Netty 服务端的 `ChannelPipeline`。它添加了：
    
    *   `IdleStateHandler`: 用于处理空闲超时，检测客户端连接的存活。
    *   `ProtocolFrameDecoder`: 处理 TCP 粘包/拆包。
    *   `MessageCodec`: 负责 RPC 消息的编解码。
    *   `HeartBeatServerHandler`: 服务端心跳处理器。
    *   `PingMessageHandler`: 处理客户端发送的 Ping 消息（心跳请求）。
    *   `RpcRequestMessageHandler`: 处理 RPC 请求消息。
    
    ```java
    package com.sanil.source.code.rpc.server.handler;
    
    import com.sanil.source.code.rpc.core.codec.MessageCodec;
    import com.sanil.source.code.rpc.core.codec.ProtocolFrameDecoder;
    import com.sanil.source.code.rpc.core.config.RpcConfig;
    import com.sanil.source.code.rpc.core.util.NettyAttrUtil;
    import com.sanil.source.code.rpc.server.RpcServerManager;
    import io.netty.channel.Channel;
    import io.netty.channel.ChannelInitializer;
    import io.netty.channel.ChannelPipeline;
    import io.netty.handler.logging.LogLevel;
    import io.netty.handler.logging.LoggingHandler;
    import io.netty.handler.timeout.IdleStateHandler;
    
    /**
     * RPC 服务器初始化器
     *
     * @author zhangpengjun
     * @date 2025/5/7
     */
    public class RpcServerInitializer extends ChannelInitializer<Channel> {
    
        private final RpcConfig rpcConfig;
        private final RpcServerManager rpcServerManager;
    
        public static final MessageCodec MESSAGE_CODEC = new MessageCodec();
        public static final LoggingHandler LOGGING_HANDLER = new LoggingHandler(LogLevel.DEBUG);
        public static final HeartBeatServerHandler HEART_BEAT_SERVER_HANDLER = new HeartBeatServerHandler();
        public static final PingMessageHandler PING_MESSAGE_HANDLER = new PingMessageHandler();
        public static final RpcRequestMessageHandler RPC_REQUEST_MESSAGE_HANDLER = new RpcRequestMessageHandler();
    
        public RpcServerInitializer(RpcConfig rpcConfig, RpcServerManager rpcServerManager) {
            this.rpcConfig = rpcConfig;
            this.rpcServerManager = rpcServerManager;
        }
    
        @Override
        protected void initChannel(Channel channel) throws Exception {
            ChannelPipeline pipeline = channel.pipeline();
            NettyAttrUtil.setManager(channel, rpcServerManager);
            NettyAttrUtil.setRpcConfig(channel, rpcConfig);
            pipeline.addLast(new IdleStateHandler(30, 0, 0));
            pipeline.addLast(new ProtocolFrameDecoder());
            pipeline.addLast(MESSAGE_CODEC);
            // pipeline.addLast(LOGGING_HANDLER);
            pipeline.addLast(HEART_BEAT_SERVER_HANDLER);
            pipeline.addLast(PING_MESSAGE_HANDLER);
            pipeline.addLast(RPC_REQUEST_MESSAGE_HANDLER);
        }
    
    }
    ```

*   **`RpcRequestMessageHandler.java`**: 负责处理从客户端接收到的 `RequestMessage`。它根据请求消息中的服务名称，从 `ServiceProvider` 中获取对应的服务实例，然后通过反射调用指定的方法。最后，将方法执行的结果或异常封装成 `ResponseMessage` 返回给客户端。

    ```java
    package com.sanil.source.code.rpc.server.handler;
    
    import com.sanil.source.code.rpc.core.exception.RpcException;
    import com.sanil.source.code.rpc.core.message.RequestMessage;
    import com.sanil.source.code.rpc.core.message.ResponseMessage;
    import com.sanil.source.code.rpc.core.registry.ServiceProvider;
    import com.sanil.source.code.rpc.core.util.NettyAttrUtil;
    import com.sanil.source.code.rpc.server.RpcServerManager;
    import io.netty.channel.ChannelHandler;
    import io.netty.channel.ChannelHandlerContext;
    import io.netty.channel.SimpleChannelInboundHandler;
    import lombok.extern.slf4j.Slf4j;
    
    import java.lang.reflect.InvocationTargetException;
    import java.lang.reflect.Method;
    
    /**
     * @author zhangpengjun
     * @date 2025/5/7
     */
    @Slf4j
    @ChannelHandler.Sharable
    public class RpcRequestMessageHandler extends SimpleChannelInboundHandler<RequestMessage> {
    
        @Override
        protected void channelRead0(ChannelHandlerContext ctx, RequestMessage msg) {
            // 构造响应消息
            ResponseMessage responseMessage = new ResponseMessage();
            responseMessage.setSequenceId(msg.getSequenceId());
    
            // 获取service实现类，本地调用
            RpcServerManager manager = NettyAttrUtil.getManager(ctx.channel());
            ServiceProvider serviceProvider = manager.getServiceProvider();
            Object service = serviceProvider.getService(msg.getRpcServiceName());
            if (service == null) {
                String message = "服务未找到：" + msg.getRpcServiceName();
                log.error(message);
                responseMessage.setExceptionValue(new RpcException(message));
                ctx.writeAndFlush(responseMessage);
                return;
            }
    
            // 调用方法
            Method method;
            try {
                method = service.getClass().getMethod(msg.getMethodName(), msg.getParameterTypes());
                Object result = method.invoke(service, msg.getParameterValues());
                responseMessage.setReturnValue(result);
            } catch (NoSuchMethodException | IllegalAccessException | InvocationTargetException e) {
                log.error("远程调用异常", e);
                responseMessage.setExceptionValue(new RpcException("远程调用异常：" + e.getCause().getMessage()));
            }
    
            ctx.writeAndFlush(responseMessage);
        }
    
    }
    ```

## 4. Spring 集成

Snail RPC 框架与 Spring 框架的集成使得在 Spring Boot 项目中可以更便捷地使用 RPC 功能。（下一章我们再详细介绍与 Spring 的深度集成）

*   **服务端 Spring 集成**: 
    *   通过 `@EnableRpcServer` 配合扫描带有 `@RpcService` 注解的服务实现类。
    *   将这些服务实现类注册到 Spring 容器中，并通过 `RpcServerManager` 将它们暴露为 RPC 服务，注册到服务注册中心。

*   **客户端 Spring 集成**: 
    *   扫描带有 `@RpcReference` 注解的字段。
    *   为这些接口或字段创建 `RpcClientProxy` 代理，并将其注入到 Spring 容器中，从而实现透明的远程服务引用。

## 5. 总结

Snail RPC 框架通过模块化和可扩展的设计，以及精心设计的消息协议、可插拔的序列化和压缩机制、灵活的负载均衡策略、简化的服务注册与发现，构建了一个功能相对完善的 RPC 解决方案。它利用 Netty 作为底层通信框架，确保了高性能和可伸缩性。同时，通过 Spring AOP 和自定义注解，它提供了声明式的服务暴露和引用方式，极大地简化了开发者的使用。