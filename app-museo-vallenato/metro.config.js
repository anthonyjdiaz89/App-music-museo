// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Agregar soporte para extensiones de imagen en mayúsculas
config.resolver = {
  ...config.resolver,
  assetExts: [
    ...config.resolver.assetExts,
    'JPG', 'JPEG', 'PNG', 'GIF', 'WEBP'
  ],
};

// Fix para Windows: normalizar rutas con barras forward
if (process.platform === 'win32') {
  config.server = {
    ...config.server,
    enhanceMiddleware: (middleware, metroServer) => {
      return (req, res, next) => {
        if (req.url) {
          // Reemplazar %5C (barra invertida codificada) con barra forward
          req.url = req.url.replace(/%5C/gi, '/');
          // También reemplazar barras invertidas normales por si acaso
          req.url = req.url.replace(/\\/g, '/');
        }
        return middleware(req, res, next);
      };
    },
  };
}

module.exports = config;
