---
title: "RabbitMQ"
date: 2019-08-21 19:41:12
tags: 
- Java
- RabbitMQ
catagories:
- '后端'
isShowComments: false
---

<Boxx/>

[[toc]]

## RabbitMQ的5种主题模式、使用场景、在Spring、SpringBoot中的使用

## AMQP
- AMQP，即Advanced Message Queuing Protocol，一个提供统一消息服务的应用层标准高级消息队列协议，是应用层协议的一个开放标准，为面向消息的中间件设计。基于此协议的客户端与消息中间件可传递消息，并不受客户端/中间件不同产品、不同的开发语言等条件的限制。

## Message Queue
- Message queue，即消息队列，是一种进程间通信或同一进程的不同线程间的通信方式，软件的贮列用来处理一系列的输入，通常是来自用户。消息队列提供了异步的通信协议，每一个贮列中的纪录包含详细说明的数据，包含发生的时间，输入设备的种类，以及特定的输入参数，也就是说：`消息的发送者和接收者不需要同时与消息队列交互。消息会保存在队列中，直到接收者取回它。`

## RabbitMQ
- 官网：[http://www.rabbitmq.com/](http://www.rabbitmq.com/)

- RabbitMQ是基于Erlang语言开发的实现了高级消息队列协议（AMQP)的开源消息代理中间件，支持多种语言，多个平台。

  ![](/znote/img/rabbitmq/rabbitmq.png)

## RabbitMQ应用场景

1. 异步处理
2. 应用解耦
3. 流量削峰 -- [传送门](https://blog.csdn.net/qq_38455201/article/details/80308771)

## RabbitMQ的安装（基于Docker）
>  基于Windows的安装忽略（注意的就是提前安装对应版本的Erlang环境）

### Docker环境安装 

1. 安装yum-utils：

```shell
yum install -y yum -utils device -mapper -persistent -data lvm2
```

2. 为yum源添加docker仓库位置：

```shell
yum -config -manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
```

3. 安装docker：

```shell
yum install docker-ce
```

4. 启动docker：

```shell
systemctl start docker
```

### RabbitMQ安装

1. 下载rabbitmq3.7.15的docker镜像：

```shell
docker pull rabbitmq:3.7.15
```

2. 使用docker命令启动：

```shell
docker run -d --name rabbitmq \
-p 5672:5672 -p 15672:15672 \
rabbitmq:3.7.15
```

3. 进入容器并开启管理功能：

```shell
docker exec -it rabbitmq /bin/bash 
rabbitmq-plugins enable rabbitmq_management
```

4. 开启防火墙：

```shell
firewall-cmd --zone=public --add-port=15672/tcp --permanent
firewall-cmd --reload
```

5. 访问地址查看是否安装成功：
   - http://192.168.3.101:15672/ 
   - 默认账号密码均为：guest

## RabbitMQ的使用

### 九大核心要素

| 名称             | 释义                                                         |
| ---------------- | ------------------------------------------------------------ |
| **Connection**   | 获取rabbitmq连接，比如一个TCP连接                            |
| **Channel**      | 不管是发布消息、订阅队列还是接收消息，这些动作都是通过信道完成。因为对于操作系统来说建立和销毁 TCP 都是非常昂贵的开销，所以引入了信道的概念，以复用一条 TCP 连接，AMQP 命令都是通过信道发出去的 |
| **Publisher**    | 生产者                                                       |
| **Message**      | 消息体                                                       |
| **Exchange**     | 交换器，Exchange有4种类型： `direct(直接)， fanout(广播), topic(主题), 和headers`，不同类型的Exchange转发消息的策略有所区别 |
| **Queue**        | 消息队列，用来保存消息直到消费者进行消费。                   |
| **Binding**      | 绑定，用于消息队列和交换器之间的关联。**Exchange 和Queue的绑定可以是多对多的关系** |
| **Consumer**     | 消费者                                                       |
| **Virtual Host** | 虚拟主机，表示一批交换器、消息队列和相关对象。**RabbitMQ 默认的 vhost 是 /** |

### 6种消息队列模型

![](/znote/img/rabbitmq/队列模型.png)

- 官网是真的真的真的是最好的学习路径：[https://www.rabbitmq.com/getstarted.html](https://www.rabbitmq.com/getstarted.html)
- 官网实例源码rabbitmq-java-maven：[https://github.com/rabbitmq/rabbitmq-tutorials/tree/master/java-mvn](https://github.com/rabbitmq/rabbitmq-tutorials/tree/master/java-mvn)

#### 主题模型

>  这里挑最主要的`topic（主题）`模型，介绍一下

![](/znote/img/rabbitmq/topic.png)

`举例：如上图的主题模式中，交换机类型设为topic， Q1绑定 *.orange.* 路由键，Q2绑定两个路由键，分别是 *.*.rabbit 以及 lazy.#`

1. 如果生产者发送路由键为quick.orange.rabbit消息，C1和C2都可以接收到。
2. 如果为lazy.orange.elephant， C1和C2都可以接收到
3. 如果为quick.orange.fox， 只要C1可以接收到
4. 如果为lazy.brown.fox， 只有C2可以接收到
5. 如果为lazy.pink.rabbit， C1，C2都可以
6. 如果为quick.brown.fox， 都不会接收到

`topic交换机，配置路由键的时候可以配置 *, # 来模糊匹配`

1.  \* 号表示可以精确匹配一个单词
2.  \# 号可以匹配0个或者多个单词

##### 多个消费者公平分发

```java
package com.zpj.electric.rabbitMq;

import java.io.IOException;

/**
 * Created by admin on 2019/12/2.
 * 用的是：
  		<dependency>
            <groupId>com.rabbitmq</groupId>
            <artifactId>amqp-client</artifactId>
            <version>3.0.4</version>
        </dependency>
 */
public class TestConsumer {
    public static void main(String[] args) throws IOException {
        //测试公平分发
        Consumer recv1 = new Consumer("A",500);
        recv1.recv_2();

        Consumer recv2_2 = new Consumer("B",2000);
        recv2_2.recv_2();
    }
}
```

##### 生产者

```java
package com.zpj.electric.rabbitMq;

import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import com.rabbitmq.client.MessageProperties;

import java.io.IOException;
import java.util.concurrent.TimeoutException;

public class Producter {

    private static final String EXCHANGE_NAME = "test_exchange_topic";

    public static void main(String[] args) throws IOException, TimeoutException {
        // 获取连接
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("127.0.0.1");
        factory.setUsername("guest");
        factory.setPassword("guest");
        factory.setPort(5672);
        Connection connection = factory.newConnection();
        // 从连接开一个通道
        Channel channel = connection.createChannel();
        // 声明一个topic路由交换机，交换机持久化
//        channel.exchangeDeclare(EXCHANGE_NAME, BuiltinExchangeType.TOPIC);
        channel.exchangeDeclare(EXCHANGE_NAME, "topic", true);

        // 发送消息
        String message = "hello, quick.orange.rabbit";
        /*参数说明：
            String exchange -- 交换机名称
        	String routingKey -- 路由关键字
        	BasicProperties props -- 消息的基本属性，例如路由头等
        	byte[] body -- 消息体
        */
        for (int i = 0; i < 100; i++) {
            message = "hello, quick.orange.rabbit" + "  -------  " + i;

            //参数：交换机名，路由键，消息持久化的，消息体
            channel.basicPublish(EXCHANGE_NAME, "quick.orange.rabbit", MessageProperties.PERSISTENT_TEXT_PLAIN, message.getBytes());
            System.out.println(" [x] Sent message : '" + message + "'");
        }

        channel.close();
        connection.close();

    }
}
```

##### 消费者

```java
package com.zpj.electric.rabbitMq;

import com.rabbitmq.client.*;

import java.io.IOException;

public  class Consumer {

    private static final String QUEUE_NAME = "test_queue_topic_1";
    private static final String EXCHANGE_NAME = "test_exchange_topic";

    //消费者名称
    private String name;
    //休眠时间
    private int sleepTime;

    public Consumer(String name, int sleepTime) {
        this.name = name;
        this.sleepTime = sleepTime;
    }

    public void recv_2() throws IOException {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("127.0.0.1");
        factory.setUsername("guest");
        factory.setPassword("guest");
        factory.setPort(5672);
        Connection connection = factory.newConnection();

        // 打开通道
        Channel channel = connection.createChannel();

        //交换机
        channel.exchangeDeclare(EXCHANGE_NAME, "topic", true);

        // 申明要消费的队列
        //创建一个持久化的 不排他的 非自动删除的队列
        channel.queueDeclare(QUEUE_NAME, true, false, false, null);

        // 绑定队列到交换机
        channel.queueBind(QUEUE_NAME, EXCHANGE_NAME, "*.orange.*");

        // 这样RabbitMQ就会使得每个Consumer在同一个时间点最多处理一个Message。换句话说，在接收到该Consumer的ack前，他它不会将新的Message分发给它。
        //mq的公平分发也用到这个
        channel.basicQos(1);

        // 创建一个回调的消费者处理类
        com.rabbitmq.client.Consumer consumer = new DefaultConsumer(channel) {
            @Override
            public void handleDelivery(String consumerTag, Envelope envelope, AMQP.BasicProperties properties, byte[] body) throws IOException {
                // 接收到的消息
                String message = new String(body);
                System.out.println(name + " Received '" + message + "'");

                try {
                    Thread.sleep(sleepTime);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                } finally {
                    System.out.println(name + " 完成： done ");
                    channel.basicAck(envelope.getDeliveryTag(), false);
                }
            }
        };

        // 消费消息
        channel.basicConsume(QUEUE_NAME, false, consumer);

    }

}
```

## SpringBoot整合RabbitMQ

> 还是以 `topic` 为例子

1. 导入maven依赖

```xml
<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-starter-amqp</artifactId>
</dependency>
```

2.修改SpringBoot配置文件application.yml

```yml
 rabbitmq:
 	host: localhost # rabbitmq的连接地址
 	port: 5672 # rabbitmq的连接端口号
	virtual-host: /test # rabbitmq的虚拟host
	username: guest # rabbitmq的用户名
	password: guest # rabbitmq的密码
	publisher-confirms: true # 如果对异步消息需要回调必须设置为true
```

3. 配置类

```java
package com.example.rabbitmqdemo.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * @author itguang
 * @create 2018-04-21 16:10
 **/
@Configuration
public class TopicRabbitConfig {


    final static String message = "topic.message";
    final static String messages = "topic.messages";


    //创建两个 Queue
    @Bean
    public Queue queueMessage(){
        return new Queue(TopicRabbitConfig.message);
    }

    @Bean
    public Queue queueMessages(){
        return new Queue(TopicRabbitConfig.messages);
    }

    //配置 TopicExchange,指定名称为 topicExchange
    @Bean
    public TopicExchange exchange(){
        return new TopicExchange("topicExchange");
    }

    //给队列绑定 exchange 和 routing_key

    @Bean
    public Binding bindingExchangeMessage(Queue queueMessage, TopicExchange exchange){
        return BindingBuilder.bind(queueMessage).to(exchange).with("topic.message");
    }

    @Bean
    public Binding bingingExchangeMessages(Queue queueMessages,TopicExchange exchange){
        return BindingBuilder.bind(queueMessages).to(exchange).with("topic.#");
    }

}

```

4. 生产者

```java
package com.example.rabbitmqdemo.topic;

import org.springframework.amqp.core.AmqpTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * @author itguang
 * @create 2018-04-21 16:26
 **/
@Component
public class TopicSender {

    @Autowired
    AmqpTemplate amqpTemplate;

    public void send1(){
        String context = "hi, i am message 1";
        System.out.println("Sender : " + context);
        amqpTemplate.convertAndSend("topicExchange","topic.message",context);
    }

    public void send2() {
        String context = "hi, i am messages 2";
        System.out.println("Sender : " + context);
        amqpTemplate.convertAndSend("topicExchange", "topic.messages", context);
    }
}
```

5. 2个消费者

```java
package com.example.rabbitmqdemo.topic;

import org.springframework.amqp.rabbit.annotation.RabbitHandler;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

/**
 * @author itguang
 * @create 2018-04-21 16:34
 **/
@Component
@RabbitListener(queues = "topic.message")
public class TopicReceiver1 {

    @RabbitHandler
    public void process(String message){

        System.out.println("Receiver topic.message :"+ message);

    }

}
```

```java
package com.example.rabbitmqdemo.topic;

import org.springframework.amqp.rabbit.annotation.RabbitHandler;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

/**
 * @author itguang
 * @create 2018-04-21 16:34
 **/
@Component
@RabbitListener(queues = "topic.messages")
public class TopicReceiver2 {

    @RabbitHandler
    public void process(String message){

        System.out.println("Receiver topic.messages: "+ message);

    }
}
```

## 其它

- [RabbitMQ教程](https://blog.csdn.net/hellozpc/article/details/81436980#21RabbitMQ_35)
- [主题模式](https://blog.csdn.net/saytime/article/details/80541412)
- [SpringBoot整合RabbitMQ](https://blog.csdn.net/itguangit/article/details/80031595)
- [整合RabbitMQ实现延迟消息](https://mp.weixin.qq.com/s?__biz=MzU1Nzg4NjgyMw==&mid=2247483734&idx=1&sn=fa9af8e9f72e7443126aed0f7a64b88b&scene=21#wechat_redirect)