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
                'qaq/sum_spring_003'
            ]
        },
        {
            title: '规范 Standard',
            collapsable: true,
            children: [
                'specification/ali',
                'specification/git',
                'specification/linux01',
                'specification/objectModel'
            ]
        },
        {
            title: '前端 Front-end',
            collapsable: true,
            children: [
                'front-end/EChartsStudy',
                'front-end/js-json',
                'front-end/viaStart',
                'front-end/vue-demo',
                'front-end/reco-info',
                'front-end/vuepress-plugin-boxx',
                'front-end/TCP&UDP'
            ]
        },
        {
            title: '后端 Back-end',
            collapsable: true,
            children: [
                'java/ArrayList',
                'java/HashMap',
                'java/docker',
                'java/itext',
                'java/poi',
                'java/quartz',
                'java/rabbitmq001',
                'java/rabbitmq002',
                'java/redis01',
                'java/redis02',
                'java/SSH',
                'java/jwt',
                'java/swagger2',
                'java/thread',
                'java/ThreadPool',
                'java/ThreadLocal',
                'java/annotationLog',
                'java/jvm',
                'java/JUC',
                'java/javaLock',
                'java/mysql_explain',
                'java/ReentrantLock',
                'java/CountDownLatch'
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
                'essay/20200813song'
            ]
        }

    ]
}