//侧边栏
module.exports = {
    '/categorie/': [
        '',
        {
            title:'规范',
            collapsable: true,
            children:[
                'ali'
            ]
        },
        {
            title:'前端',
            collapsable: true,
            children:[
                'EChartsStudy','js-json','viaStart','vue-demo','reco-info','vuepress-plugin-boxx'
            ]
        },
        {
            title:'后端',
            collapsable: true,
            children:[
                'ArrayList','docker','HashMap','itext','poi','quartz',
                'rabbitmq','redis','SSH','swagger2','thread',
            ]
        },
        {
            title:'随笔',
            collapsable: true,
            children:[
                '20190928','20191109','20191116','20191130'
            ]
        }

    ]
}	