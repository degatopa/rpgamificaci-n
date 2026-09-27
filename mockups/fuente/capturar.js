// Convierte cada boceto HTML de esta carpeta en una imagen PNG en mockups/.
// Uso (desde la raíz del repositorio):
//   NODE_PATH=$(npm root -g) node mockups/fuente/capturar.js [archivo.html ...]
// Necesita Playwright y Chromium instalados.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const carpeta = __dirname;
const salida = path.join(carpeta, '..');
const archivos = process.argv.slice(2).length
  ? process.argv.slice(2)
  : fs.readdirSync(carpeta).filter(f => /^\d\d-.*\.html$/.test(f));

(async () => {
  const navegador = await chromium.launch();
  const pagina = await navegador.newPage({ viewport: { width: 1440, height: 900 } });
  for (const archivo of archivos) {
    await pagina.goto('file://' + path.join(carpeta, path.basename(archivo)));
    await pagina.evaluate(() => document.fonts.ready);
    const png = path.join(salida, path.basename(archivo).replace('.html', '.png'));
    await pagina.screenshot({ path: png, fullPage: true });
    console.log('✓', path.relative(process.cwd(), png));
  }
  await navegador.close();
})();
