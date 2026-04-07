//侧边栏
module.exports = {
    '/views/': [
        '',
        {
            title: '🍕 知识晶体 Q&A',
            collapsable: true,
            children: [
                'qaq/sum_fe_001', 'qaq/sum_fe_002',
                'qaq/sum_java_001', 'qaq/sum_java_002',
                'qaq/sum_db_001',
                'qaq/sum_spring_001', 'qaq/sum_spring_002', 'qaq/sum_spring_003',
                'qaq/sum_ms_001',
            ]
        },
        {
            title: '🦄 规范 Standard',
            collapsable: true,
            children: [
                'specification/ali', 'specification/git',
                'specification/linux01', 'specification/linux02',
                'specification/objectModel', 'specification/提交规范',
                'specification/javaNamingConvention', 'specification/k8s基本命令与pod管理',
            ]
        },
        {
            title: '🏹 前端 Front-end',
            collapsable: true,
            children: [
                'frontend/EChartsStudy', 'frontend/js-json', 'frontend/viaStart', 'frontend/vue-demo',
                'frontend/reco-info', 'frontend/vuepress-plugin-boxx', 'frontend/TCP&UDP',
            ]
        },
        {
            title: '🔨 后端 Back-end',
            collapsable: true,
            children: [
                'backend/SpringGateway宕机排查',
                'backend/API网关概述', 'backend/SPI_JdkDubboSpring', 'backend/docker', 'backend/itext', 'backend/poi',
                'backend/quartz', 'backend/dubbo', 'backend/单元测试1', 'backend/单元测试2', 'backend/单元测试3',
                'backend/rabbitmq001', 'backend/rabbitmq002', 'backend/redis01', 'backend/redis02',
                'backend/redis使用场景', 'backend/SSH', 'backend/jwt', 'backend/swagger2', 'backend/thread',
                'backend/ThreadLocal', 'backend/ThreadPool', 'backend/ThreadPool2', 'backend/annotationLog',
                'backend/jvm', 'backend/juc', 'backend/javaLock', 'backend/mysql_explain', 'backend/mybatis一二级缓存',
                'backend/ReentrantLock', 'backend/CountDownLatch', 'backend/zookeeper', 'backend/分布式系统概述',
                'backend/ArrayList', 'backend/HashMap',
                'backend/spring-security-01', 'backend/spring-security-02',
                'backend/SchedulingConfigurer', 'backend/ThreadTopCPU', 'backend/OOM分类及排查',
                'backend/EasyExcel', 'backend/java_io模型',
                'backend/spring_application_json', 'backend/springboot配置文件加载顺序',
                'backend/动态代理和静态代理区别', 'backend/zk选举和一致性', 'backend/超时取消分析',
                'backend/spring-mini-ioc', 'backend/Spring的IOC源码以及流程分析',
            ]
        },
        {
            title: '🌵 能力扩展 DevOps',
            collapsable: true,
            children: [
                'devops/Deploy 服务部署',
                'devops/SpringBoot Prometheus Grafana 监控对接', 'devops/SpringBoot Skywalking 调用链路对接',
                'devops/SpringBoot Prometheus 飞书告警对接', 'devops/SpringBoot Nightingale 飞书告警',
                'devops/Kubernetes-0', 'devops/Kubernetes-1', 'devops/Kubernetes-2', 'devops/Kubernetes-3',
                'devops/Kubernetes-4', "devops/Kubernetes-5", "devops/Kubernetes-6", "devops/Kubernetes-7",
                'devops/Kubernetes-8', "devops/Kubernetes-9", "devops/Kubernetes-10"
            ]
        },
        {
            title: '🧩 手撸源码 Source-code',
            collapsable: true,
            children: [
                "source/code/rpc/rpc-source-01", "source/code/rpc/rpc-source-02",
                "source/code/rpc/rpc-source-03", "source/code/rpc/rpc-source-04",
                "source/code/mybatis/mybatis-source-01", "source/code/mybatis/mybatis-source-02",
                "source/code/mybatis/mybatis-source-03",
                'source/code/starter/spring-boot-starter-redis-01', 'source/code/starter/spring-boot-starter-redis-02',
                'source/code/spring/spring-source-01', 'source/code/spring/spring-source-02',
                'source/code/spring/spring-source-03', 'source/code/spring/spring-source-04',
                'source/code/spring/spring-source-05', 'source/code/spring/spring-source-06',
                'source/code/spring/spring-source-07', 'source/code/spring/spring-source-08',
                'source/code/spring/spring-source-09', 'source/code/spring/spring-source-10',
                'source/code/spring/spring-source-11', 'source/code/spring/spring-source-12',
                'source/code/spring/spring-source-13', 'source/code/spring/spring-source-14',
                'source/code/spring/spring-source-15',
                'source/code/jdbc/jdbc-pool-source-01',
            ]
        },
        {
            title: '🌴 命理学 Numerology',
            collapsable: true,
            children: [
                "numerology/会合冲刑害", 'numerology/十神六亲', 'numerology/十神性格', 'numerology/十神心得', 'numerology/批婚',
            ]
        },
        {
            title: '🔗 随笔 Essay',
            collapsable: true,
            children: [
                'essay/20190928', 'essay/20191109', 'essay/20191116', 'essay/20191130', 'essay/20200227',
                'essay/20200301', 'essay/20200703', 'essay/20200715', 'essay/20200813', 'essay/20201012',
                'essay/20201119', 'essay/20211216', 'essay/20220808', 'essay/20230605', "essay/20260320",
                "essay/20260401",
            ]
        }
    ]
}
