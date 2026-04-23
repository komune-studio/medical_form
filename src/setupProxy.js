const { createProxyMiddleware } = require('http-proxy-middleware');

const DEV_IMAGE_PROXY_PREFIX = '/__image_proxy__';

module.exports = function setupProxy(app) {
  app.use(
    DEV_IMAGE_PROXY_PREFIX,
    createProxyMiddleware({
      target: 'https://wellsource.sgp1.digitaloceanspaces.com',
      changeOrigin: true,
      secure: true,
      pathRewrite: (path, req) => {
        const rawUrl = req.query?.url;

        if (!rawUrl) {
          return '/';
        }

        try {
          const requestedUrl = new URL(rawUrl);
          if (requestedUrl.hostname !== 'wellsource.sgp1.digitaloceanspaces.com') {
            return '/';
          }

          return `${requestedUrl.pathname}${requestedUrl.search}`;
        } catch (error) {
          return '/';
        }
      },
      onProxyRes(proxyRes) {
        proxyRes.headers['access-control-allow-origin'] = '*';
        proxyRes.headers['cross-origin-resource-policy'] = 'cross-origin';
      },
      logLevel: 'silent',
    })
  );
};
