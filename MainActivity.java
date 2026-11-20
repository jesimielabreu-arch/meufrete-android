package br.com.meufretelogistica.app;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

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
        if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{ Manifest.permission.POST_NOTIFICATIONS }, 7001);
        }
    }
}
