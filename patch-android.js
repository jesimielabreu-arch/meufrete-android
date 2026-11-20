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
  'android.permission.POST_NOTIFICATIONS', 'android.permission.WAKE_LOCK'
];
perms.forEach(p => { if (!x.includes(p)) x = x.replace('</manifest>', `    <uses-permission android:name="${p}" />\n</manifest>`); });
if (!x.includes('android.hardware.location.gps')) x = x.replace('</manifest>', '    <uses-feature android:name="android.hardware.location.gps" android:required="false" />\n</manifest>');
fs.writeFileSync(man, x);
// nome que aparece no celular
const strings = path.join(root, 'android/app/src/main/res/values/strings.xml');
if (fs.existsSync(strings)) fs.writeFileSync(strings, fs.readFileSync(strings, 'utf8').replace(/<string name="app_name">[^<]*<\/string>/, '<string name="app_name">Meu Frete</string>').replace(/<string name="title_activity_main">[^<]*<\/string>/, '<string name="title_activity_main">Meu Frete</string>'));
console.log('Android ajustado: MainActivity, mf-gps.js e permissões.');
