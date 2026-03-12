// Cloudflare 要求的入口文件（不能改名）
export const onRequest = async (context) => {
    const { request } = context;
    const url = new URL(request.url);

    if (url.pathname.startsWith('/znote/')) {
        url.pathname = url.pathname.replace('/znote', '');
        return await context.next(new Request(url, request));
    }

    return await context.next();
};
