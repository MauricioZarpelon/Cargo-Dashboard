// Monta o painel em um único arquivo HTML: código-fonte + biblioteca de leitura de Excel (SheetJS) + (opcional) configuração do Firebase.
//
// Uso:
//   node fonte/build.js [destino.html] [firebase-config.json]   -> painel normal (sem o 2º argumento, funciona só no navegador, sem nuvem)
//   node fonte/build.js destino.html --demo                      -> versão de demonstração, com dados fictícios (nada é gravado)
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const demo = args.includes('--demo');
const [dest = path.join(process.cwd(), 'Painel de Cargas.html'), cfgFile] = args.filter((a) => !a.startsWith('--'));

const lib = fs.readFileSync(path.join(__dirname, 'xlsx.js'), 'utf8');
if (lib.includes('</script')) throw new Error('a biblioteca contém </script');
let src = fs.readFileSync(path.join(__dirname, 'painel.src.html'), 'utf8');
if (src.split('/*XLSX_LIB*/').length !== 2) throw new Error('marcador da biblioteca não encontrado');
if (src.split('/*FIREBASE_CONFIG*/null').length !== 2) throw new Error('marcador do Firebase não encontrado');

let cfg = 'null';
if (cfgFile && !demo) {
  const parsed = JSON.parse(fs.readFileSync(cfgFile, 'utf8'));
  if (!parsed.firebase || !parsed.firebase.apiKey || !parsed.sharedEmail) {
    throw new Error('o arquivo de configuração precisa de "firebase" (com apiKey) e "sharedEmail"');
  }
  cfg = JSON.stringify(parsed);
}
src = src.replace('/*FIREBASE_CONFIG*/null', () => (demo ? 'null; window.PAINEL_DEMO = true' : cfg));
let out = src.replace('/*XLSX_LIB*/', () => lib);

if (demo) {
  const seed = fs.readFileSync(path.join(__dirname, '..', 'demo', 'seed.js'), 'utf8');
  if (seed.includes('</script')) throw new Error('o seed contém </script');
  const fim = out.lastIndexOf('</body>');
  out = out.slice(0, fim) + '<script>' + seed + '</script>\n' + out.slice(fim);
}

fs.mkdirSync(path.dirname(path.resolve(dest)), { recursive: true });
fs.writeFileSync(dest, out);
console.log('ok', dest, out.length, demo ? '(demonstração)' : cfg === 'null' ? '(sem Firebase)' : '(com Firebase)');
