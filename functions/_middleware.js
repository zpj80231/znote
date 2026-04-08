/**
 * Cloudflare 入口文件（不能改名），自动识别，用于兼容项目根路径问题
 *
 * @param context
 * @returns onRequest
 */
export const onRequest = async (context) => {
    const { request } = context;
    const url = new URL(request.url);

    if (url.pathname === '/znote' || url.pathname.startsWith('/znote/')) {
        url.pathname = url.pathname.replace('/znote', '');
        return await context.next(new Request(url, request));
    }

    return await context.next();
};
