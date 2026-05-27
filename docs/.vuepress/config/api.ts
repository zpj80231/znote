const env = typeof process !== 'undefined' && process.env ? process.env : {}

const SITE_URL = env.SITE_URL || 'https://bree.de5.net'
const SITE_BASE = env.SITE_BASE || '/znote/'
const SITE_BASE_URL = `${SITE_URL}${SITE_BASE}`.replace(/\/+$/, '/')

export default {
    site: {
        url: SITE_URL,
        base: SITE_BASE,
        baseUrl: SITE_BASE_URL,
    },
    scripts: {
        googleAnalytics: 'https://www.googletagmanager.com/gtag/js?id=G-NCYBBYN93V',
        wwads: 'https://cdn.wwads.cn/js/makemoney.js',
    },
    services: {
        cwd: 'https://cwd.bree.de5.net',
        githubRepos: 'https://api.github.com/users/zpj80231/repos',
    },
    music: {
        url: 'https://music.bree.de5.net',
        devProxyPrefix: '/music-api',
    },
}
