package br.com.meufretelogistica.app;

import android.Manifest;
import android.app.AlertDialog;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/* Abre o app.meufretelogistica.com.br e, a cada página carregada, liga o rastreio
   em segundo plano (assets/public/mf-gps.js). */
public class MainActivity extends BridgeActivity {
    private String gpsJs = null;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        try {
            InputStream in = getAssets().open("public/mf-gps.js");
            byte[] b = new byte[in.available()]; in.read(b); in.close();
            gpsJs = new String(b, StandardCharsets.UTF_8);
        } catch (Exception e) { gpsJs = null; }
        bridge.setWebViewClient(new BridgeWebViewClient(bridge) {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                if (gpsJs != null && url != null && url.contains("meufretelogistica.com.br")) view.evaluateJavascript(gpsJs, null);
            }
        });
        pedirTudo();
    }

    /* Pede de uma vez, logo na primeira abertura, tudo o que o app usa:
       localização (rastreio), câmera (foto da nota/canhoto), microfone (áudio no chat)
       e notificações. Antes, um aviso simples explicando o que fazer. */
    private void pedirTudo() {
        List<String> faltam = new ArrayList<>();
        String[] todas = Build.VERSION.SDK_INT >= 33
            ? new String[]{ Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION, Manifest.permission.CAMERA, Manifest.permission.RECORD_AUDIO, Manifest.permission.POST_NOTIFICATIONS }
            : new String[]{ Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION, Manifest.permission.CAMERA, Manifest.permission.RECORD_AUDIO };
        for (String p : todas) if (checkSelfPermission(p) != PackageManager.PERMISSION_GRANTED) faltam.add(p);
        if (faltam.isEmpty()) return;
        final android.content.SharedPreferences sp = getSharedPreferences("mf", MODE_PRIVATE);
        int vezes = sp.getInt("pediuPerm", 0);
        if (vezes >= 2) return;   // não fica insistindo toda vez que abre
        sp.edit().putInt("pediuPerm", vezes + 1).apply();
        final String[] pedir = faltam.toArray(new String[0]);
        new AlertDialog.Builder(this)
            .setTitle("Bem-vindo ao Meu Frete")
            .setMessage("Para o app funcionar direitinho, o celular vai fazer algumas perguntas agora.\n\nEm todas, toque em PERMITIR.\n\nNa localização, escolha \"Durante o uso do app\".")
            .setCancelable(false)
            .setPositiveButton("ENTENDI", (d, w) -> requestPermissions(pedir, 7001))
            .show();
    }
}
