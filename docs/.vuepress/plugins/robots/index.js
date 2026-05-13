const fs = require('fs')
const path = require('path')

function toArray(value) {
    if (typeof value === 'undefined') {
        return []
    }

    return Array.isArray(value) ? value : [value]
}

function joinUrl(host, urlPath) {
    if (/^https?:\/\//.test(urlPath)) {
        return urlPath
    }

    const normalizedHost = String(host || '').replace(/\/+$/, '')
    const normalizedPath = `/${String(urlPath || '').replace(/^\/+/, '')}`

    return `${normalizedHost}${normalizedPath}`
}

function renderPolicy(policy) {
    const lines = [`User-agent: ${policy.userAgent || '*'}`]

    toArray(policy.allow).forEach(item => {
        lines.push(`Allow: ${item}`)
    })

    toArray(policy.disallow).forEach(item => {
        lines.push(`Disallow: ${item}`)
    })

    return lines.join('\n')
}

module.exports = (options = {}, context) => {
    const {
        host = '',
        sitemap = '/sitemap.xml',
        outputFile = 'robots.txt',
        policies = [
            {
                userAgent: '*',
                allow: '/'
            }
        ]
    } = options

    return {
        name: 'vuepress-plugin-local-robots',
        async generated() {
            const robotsTxt = [
                policies.map(renderPolicy).join('\n\n'),
                `Sitemap: ${joinUrl(host, sitemap)}`
            ].join('\n')

            fs.writeFileSync(path.resolve(context.outDir, outputFile), `${robotsTxt}\n`)
        }
    }
}
