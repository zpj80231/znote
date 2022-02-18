//侧边栏
module.exports = {
    '/views/': [
        '',
        {
            title: '知识晶体 Q&A',
            collapsable: true,
            children: [
                'qaq/sum_ms_001',
                'qaq/sum_fe_001',
                'qaq/sum_fe_002',
                'qaq/sum_java_001',
                'qaq/sum_java_002',
                'qaq/sum_db_001',
                'qaq/sum_spring_001',
                'qaq/sum_spring_002',
                'qaq/sum_spring_003',
            ]
        },
        {
            title: '规范 Standard',
            collapsable: true,
            children: [
                'specification/ali',
                'specification/git',
                'specification/linux01',
                'specification/objectModel',
                'specification/提交规范',
                'specification/javaNamingConvention',
                'specification/k8s基本命令与pod管理',
            ]
        },
        {
            title: '前端 Front-end',
            collapsable: true,
            children: [
                'frontend/EChartsStudy',
                'frontend/js-json',
                'frontend/viaStart',
                'frontend/vue-demo',
                'frontend/reco-info',
                'frontend/vuepress-plugin-boxx',
                'frontend/TCP&UDP',
            ]
        },
        {
            title: '后端 Back-end',
            collapsable: true,
            children: [
                'backend/ArrayList',
                'backend/HashMap',
                'backend/docker',
                'backend/itext',
                'backend/poi',
                'backend/quartz',
                'backend/junit4',
                'backend/rabbitmq001',
                'backend/rabbitmq002',
                'backend/redis01',
                'backend/redis02',
                'backend/SSH',
                'backend/jwt',
                'backend/swagger2',
                'backend/thread',
                'backend/ThreadLocal',
                'backend/ThreadPool',
                'backend/ThreadPool2',
                'backend/annotationLog',
                'backend/jvm',
                'backend/JUC',
                'backend/javaLock',
                'backend/mysql_explain',
                'backend/mybatis一二级缓存',
                'backend/ReentrantLock',
                'backend/CountDownLatch',
                'backend/zookeeper',
                'backend/分布式系统概述',
                'backend/API网关概述',
                'backend/spring-security-01',
                'backend/SchedulingConfigurer',
                'backend/ThreadTopCPU',
                'backend/EasyExcel',
                'backend/java io模型',
                'backend/SPI_JDKDubboSpring',
                'backend/spring_application_json.md',
            ]
        },
        {
            title: '随笔 Essay',
            collapsable: true,
            children: [
                'essay/20190928',
                'essay/20191109',
                'essay/20191116',
                'essay/20191130',
                'essay/20200227',
                'essay/20200301',
                'essay/20200703',
                'essay/20200715',
                'essay/20200813',
                'essay/20201012',
                'essay/20201119',
                'essay/20211216',
            ]
        }

    ]
}
