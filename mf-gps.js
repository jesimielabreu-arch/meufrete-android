/* Meu Frete — rastreio em segundo plano (só no app Android instalado).
   Roda dentro do app.meufretelogistica.com.br. Usa a mesma sessão do motorista (window.sb)
   e grava na mesma tabela "posicoes" que o app já usa — a torre do time não muda nada.
   Liga sozinho quando o motorista tem viagem ativa e desliga quando a viagem termina. */
(function () {
  if (window.__mfGps) return; window.__mfGps = true;
  var ATIVOS = ['indo_carregar', 'carregando', 'em_transito', 'aguardando_descarga'];
  var INTERVALO_MS = 120000;            // grava no máximo 1 posição a cada 2 min (igual ao app)
  var watcherId = null, viagemId = null, uid = null, ultimo = 0, fila = [];
  function plugin() {
    var C = window.Capacitor; if (!C) return null;
    try { return C.registerPlugin ? C.registerPlugin('BackgroundGeolocation') : (C.Plugins && C.Plugins.BackgroundGeolocation); } catch (e) { return null; }
  }
  function grava(p) {
    if (!window.sb || !viagemId || !uid) return;
    var linha = { viagem_id: viagemId, motorista_id: uid, lat: p.latitude, lng: p.longitude,
      precisao_m: p.accuracy || null, velocidade_kmh: p.speed != null ? Math.round(p.speed * 3.6) : null,
      registrado_em: new Date(p.time || Date.now()).toISOString() };
    window.sb.from('posicoes').insert(linha).then(function (r) {
      if (r && r.error) fila.push(linha); else enviaFila();
    }, function () { fila.push(linha); });
  }
  function enviaFila() {   // sem sinal na estrada: guarda e manda quando voltar
    if (!fila.length || !window.sb) return;
    var lote = fila.splice(0, 50);
    window.sb.from('posicoes').insert(lote).then(function (r) { if (r && r.error) fila = lote.concat(fila); }, function () { fila = lote.concat(fila); });
  }
  function liga() {
    var BG = plugin(); if (!BG || watcherId) return;
    BG.addWatcher({
      backgroundTitle: 'Meu Frete — viagem em andamento',
      backgroundMessage: 'Acompanhando sua viagem para a torre de controle.',
      requestPermissions: true, stale: false, distanceFilter: 30
    }, function (loc, err) {
      if (err) { if (err.code === 'NOT_AUTHORIZED') { try { if (confirm('Para acompanhar sua viagem o Meu Frete precisa da localização. Abrir as configurações?')) BG.openSettings(); } catch (e) {} } return; }
      if (!loc) return; var agora = Date.now(); if (agora - ultimo < INTERVALO_MS) return; ultimo = agora; grava(loc);
    }).then(function (id) { watcherId = id; }, function () {});
  }
  function desliga() {
    var BG = plugin(); if (!BG || !watcherId) return;
    BG.removeWatcher({ id: watcherId }).then(function () {}, function () {}); watcherId = null;
  }
  function confere() {
    if (!window.sb || !window.sb.auth) return;
    window.sb.auth.getUser().then(function (u) {
      uid = u && u.data && u.data.user && u.data.user.id; if (!uid) { viagemId = null; desliga(); return; }
      return window.sb.from('viagens').select('id,status').eq('motorista_id', uid).in('status', ATIVOS).order('criado_em', { ascending: false }).limit(1)
        .then(function (r) {
          var v = r && r.data && r.data[0];
          if (v) { viagemId = v.id; liga(); enviaFila(); } else { viagemId = null; desliga(); }
        });
    }).catch(function () {});
  }
  confere(); setInterval(confere, 60000);
})();
