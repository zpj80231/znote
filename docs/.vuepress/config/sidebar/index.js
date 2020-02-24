//侧边栏
module.exports = {
    '/views/': [
        '',
        {
            title:'QAQ',
            collapsable: false,
            children: [
                'qaq/sum_ms_001','qaq/sum_fe_001','qaq/sum_java_001','qaq/sum_db_001','qaq/sum_spring_001',
                'qaq/sum_fe_002'
            ]
        },
        {
            title:'规范',
            collapsable: false,
            children:[
                'specification/ali'
            ]
        },
        {
            title:'前端',
            collapsable: false,
            children:[
                'front-end/EChartsStudy','front-end/js-json','front-end/viaStart','front-end/vue-demo',
                'front-end/reco-info','front-end/vuepress-plugin-boxx'
            ]
        },
        {
            title:'后端',
            collapsable: false,
            children:[
                'java/ArrayList','java/docker','java/HashMap','java/itext','java/poi','java/quartz',
                'java/rabbitmq','java/redis','java/SSH','java/swagger2','java/thread','java/jvm'
            ]
        },
        {
            title:'随笔',
            collapsable: false,
            children:[
                'essay/20190928','essay/20191109','essay/20191116','essay/20191130'
            ]
        }

    ]
}	