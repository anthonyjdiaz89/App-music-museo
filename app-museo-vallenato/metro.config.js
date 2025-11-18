// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Fix para Windows: normalizar rutas con barras forward
if (process.platform === 'win32') {
  const originalNormalize = config.server?.enhanceMiddleware;
  config.server = {
    ...config.server,
    enhanceMiddleware: (middleware, metroServer) => {
      return (req, res, next) => {
        // Reemplazar barras invertidas con barras forward en la URL
        if (req.url) {
          req.url = req.url.replace(/\\/g, '/');
        }
        if (originalNormalize) {
          return originalNormalize(middleware, metroServer)(req, res, next);
        }
        return middleware(req, res, next);
      };
    },
  };
}

module.exports = config;
