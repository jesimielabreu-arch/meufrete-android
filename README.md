# Meu Frete — app Android

Instalador Android do app do motorista (app.meufretelogistica.com.br).
O app abre o mesmo sistema do site; a diferença é que o rastreio da viagem
continua funcionando com a tela bloqueada (aviso fixo "Meu Frete — viagem em andamento").

- `android-extra/mf-gps.js` — liga/desliga o rastreio conforme a viagem ativa e grava em `posicoes` (Supabase).
- `android-extra/MainActivity.java` — carrega o script e pede permissão de notificação.
- `.github/workflows/android.yml` — o GitHub monta o APK a cada atualização e publica em Releases.
