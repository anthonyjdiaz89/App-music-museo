/**
 * Script para copiar archivos de audio a la carpeta public antes del build web
 */
const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '..', 'assets', 'audio');
const targetDir = path.join(__dirname, '..', 'public', 'audio');

// Crear directorio de destino si no existe
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
  console.log('✓ Creado directorio public/audio');
}

// Copiar archivos MP3
const files = fs.readdirSync(sourceDir).filter(file => 
  file.endsWith('.mp3') || file.endsWith('.m4a') || file.endsWith('.wav')
);

console.log(`📦 Copiando ${files.length} archivos de audio a public/audio...`);

let copied = 0;
files.forEach(file => {
  const sourcePath = path.join(sourceDir, file);
  const targetPath = path.join(targetDir, file);
  
  if (fs.statSync(sourcePath).isFile()) {
    fs.copyFileSync(sourcePath, targetPath);
    copied++;
  }
});

console.log(`✓ ${copied} archivos copiados exitosamente a public/audio`);
