/**
 * Cloudflare 入口文件（不能改名），自动识别，用于兼容项目根路径问题
 *
 * 职责：
 *   1. /znote/* 请求：内部改写到 dist 实际文件路径，并规避 Cloudflare Pages 的 URL 规范化
 *      （否则 /znote/foo.html 会被 308 到 /foo，丢失 /znote/ 前缀导致 VuePress base 错位、Vue 渲染失败）
 *   2. 其他请求：301 重定向到 /znote/...，统一 URL 命名空间，避免 Google 抓到「重复网页 + 自动重定向」
 *
 * @param context
 * @returns onRequest
 */
export const onRequest = async (context) => {
    const { request } = context;
    const url = new URL(request.url);
    const path = url.pathname;

    // Case 1: /znote/* —— 改写到 dist 实际文件路径
    if (path === '/znote' || path.startsWith('/znote/')) {
        let target = path.replace(/^\/znote/, '') || '/';
        // 预先按 Cloudflare Pages 的规范化规则改写，避免触发 308 规范化：
        // Pages 会把 /xxx.html → /xxx、/xxx/index.html → /xxx/，且 Location 头不带 /znote/ 前缀，
        // 浏览器跳转后 URL 与 VuePress 的 base ('/znote/') 不匹配，Vue Router 渲染会抛 HierarchyRequestError。
        if (target.endsWith('/index.html')) {
            target = target.slice(0, -'index.html'.length);
        } else if (target.endsWith('.html')) {
            target = target.slice(0, -'.html'.length);
        }
        url.pathname = target;

        const response = await context.next(new Request(url, request));

        // 兜底：仍可能产生目录尾部斜杠等规范化（如 /foo → /foo/），把 Location 加回 /znote
        if (response.status >= 300 && response.status < 400) {
            const location = response.headers.get('Location');
            if (location && location.startsWith('/') && !location.startsWith('/znote')) {
                const fixed = new Response(response.body, response);
                fixed.headers.set('Location', '/znote' + location);
                return fixed;
            }
        }
        return response;
    }

    // Case 2: 其他所有请求 —— 301 永久重定向到 /znote/... 统一命名空间
    // 避免 Google 把 /foo 和 /znote/foo 当作两套重复内容；保留 search 与 hash
    // 但 robots.txt / sitemap.xml 等爬虫期望在根路径直接 200 响应，不走重定向
    const SERVE_AT_ROOT = new Set(['/robots.txt', '/sitemap.xml', '/favicon.ico']);
    if (SERVE_AT_ROOT.has(path)) {
        return await context.next();
    }
    const redirectTo = new URL('/znote' + path, url.origin);
    redirectTo.search = url.search;
    redirectTo.hash = url.hash;
    return Response.redirect(redirectTo.toString(), 301);
};
