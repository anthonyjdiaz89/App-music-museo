const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

const COVERS_DIR = path.join(__dirname, 'assets', 'covers');
const MAX_SIZE = 800;
const QUALITY = 70;

async function optimizeImages() {
  console.log('Iniciando optimización de imágenes...');
  
  if (!fs.existsSync(COVERS_DIR)) {
    console.error(`Directorio no encontrado: ${COVERS_DIR}`);
    return;
  }

  const files = fs.readdirSync(COVERS_DIR);
  const imageFiles = files.filter(file => /\.(jpg|jpeg|png)$/i.test(file));

  console.log(`Encontradas ${imageFiles.length} imágenes.`);

  for (const file of imageFiles) {
    const filePath = path.join(COVERS_DIR, file);
    
    try {
      const stats = fs.statSync(filePath);
      const sizeMB = stats.size / (1024 * 1024);

      // Solo optimizar si es mayor a 1MB
      if (sizeMB > 1) {
        console.log(`Optimizando: ${file} (${sizeMB.toFixed(2)} MB)...`);
        
        const image = await Jimp.read(filePath);
        
        // Redimensionar si es muy grande
        if (image.bitmap.width > MAX_SIZE || image.bitmap.height > MAX_SIZE) {
          image.scaleToFit(MAX_SIZE, MAX_SIZE);
        }

        // Bajar calidad
        image.quality(QUALITY);

        await image.writeAsync(filePath);
        
        const newStats = fs.statSync(filePath);
        const newSizeMB = newStats.size / (1024 * 1024);
        console.log(`  -> Reducido a ${newSizeMB.toFixed(2)} MB`);
      } else {
        console.log(`Saltando: ${file} (ya es pequeño: ${sizeMB.toFixed(2)} MB)`);
      }
    } catch (error) {
      console.error(`Error optimizando ${file}:`, error.message);
    }
  }

  console.log('Optimización completada.');
}

optimizeImages();
