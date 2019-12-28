//侧边栏
module.exports = {
    '/views/': [
        '',
        {
            title:'规范',
            collapsable: true,
            children:[
                'specification/ali'
            ]
        },
        {
            title:'前端',
            collapsable: true,
            children:[
                'front-end/EChartsStudy','front-end/js-json','front-end/viaStart','front-end/vue-demo',
                'front-end/reco-info','front-end/vuepress-plugin-boxx'
            ]
        },
        {
            title:'后端',
            collapsable: true,
            children:[
                'java/ArrayList','java/docker','java/HashMap','java/itext','java/poi','java/quartz',
                'java/rabbitmq','java/redis','java/SSH','java/swagger2','java/thread',
            ]
        },
        {
            title:'随笔',
            collapsable: true,
            children:[
                'essay/20190928','essay/20191109','essay/20191116','essay/20191130'
            ]
        }

    ]
}	