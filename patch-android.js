// Ajusta o projeto Android gerado pelo Capacitor: MainActivity com o rastreio, script de GPS e permissões.
const fs = require('fs'), path = require('path');
const root = __dirname;
const pkgDir = path.join(root, 'android/app/src/main/java/br/com/meufretelogistica/app');
fs.mkdirSync(pkgDir, { recursive: true });
fs.copyFileSync(path.join(root, 'MainActivity.java'), path.join(pkgDir, 'MainActivity.java'));
const pub = path.join(root, 'android/app/src/main/assets/public');
fs.mkdirSync(pub, { recursive: true });
fs.copyFileSync(path.join(root, 'mf-gps.js'), path.join(pub, 'mf-gps.js'));
const man = path.join(root, 'android/app/src/main/AndroidManifest.xml');
let x = fs.readFileSync(man, 'utf8');
const perms = [
  'android.permission.ACCESS_COARSE_LOCATION', 'android.permission.ACCESS_FINE_LOCATION',
  'android.permission.FOREGROUND_SERVICE', 'android.permission.FOREGROUND_SERVICE_LOCATION',
  'android.permission.POST_NOTIFICATIONS', 'android.permission.WAKE_LOCK',
  'android.permission.RECORD_AUDIO', 'android.permission.MODIFY_AUDIO_SETTINGS',   // áudio no chat do rastreio
  'android.permission.CAMERA'   // foto da nota/canhoto
];
perms.forEach(p => { if (!x.includes(p)) x = x.replace('</manifest>', `    <uses-permission android:name="${p}" />\n</manifest>`); });
if (!x.includes('android.hardware.location.gps')) x = x.replace('</manifest>', '    <uses-feature android:name="android.hardware.location.gps" android:required="false" />\n</manifest>');
fs.writeFileSync(man, x);
// nome que aparece no celular
const strings = path.join(root, 'android/app/src/main/res/values/strings.xml');
if (fs.existsSync(strings)) fs.writeFileSync(strings, fs.readFileSync(strings, 'utf8').replace(/<string name="app_name">[^<]*<\/string>/, '<string name="app_name">Meu Frete</string>').replace(/<string name="title_activity_main">[^<]*<\/string>/, '<string name="title_activity_main">Meu Frete</string>'));
// ícone do app = logo Meu Frete (o mesmo do app instalado pelo site)
(async () => {
  const res = path.join(root, 'android/app/src/main/res');
  try {
    const r = await fetch('https://app.meufretelogistica.com.br/img/icone-512.png');
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const png = Buffer.from(await r.arrayBuffer());
    fs.readdirSync(res).filter(d => d.startsWith('mipmap-')).forEach(d => {
      const dir = path.join(res, d);
      if (d.includes('anydpi')) { fs.rmSync(dir, { recursive: true, force: true }); return; }
      ['ic_launcher.png', 'ic_launcher_round.png', 'ic_launcher_foreground.png'].forEach(f => fs.writeFileSync(path.join(dir, f), png));
    });
    console.log('Ícone Meu Frete aplicado.');
  } catch (e) { console.log('Ícone não aplicado:', e.message); process.exitCode = 1; }
  console.log('Android ajustado: MainActivity, mf-gps.js e permissões.');
})();
