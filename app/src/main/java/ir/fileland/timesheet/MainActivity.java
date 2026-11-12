package ir.fileland.timesheet;

import android.Manifest;
import android.app.Activity;
import android.content.ContentValues;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.media.MediaScannerConnection;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.view.Gravity;
import android.view.ViewGroup;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.Toast;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;

public class MainActivity extends Activity {

    private static final String START_URL = "file:///android_asset/index.html";
    private static final int REQ_FILE = 1001;
    private static final int REQ_STORAGE = 1002;

    private WebView webView;
    private ValueCallback<Uri[]> filePathCallback;

    // فایل در انتظار اجازه‌ی حافظه (فقط اندروید ۹ و پایین‌تر)
    private String pendingB64, pendingName, pendingMime;
    private boolean pendingShare;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        FrameLayout root = new FrameLayout(this);
        webView = new WebView(this);
        root.addView(webView, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        setContentView(root);

        setupWebView();

        if (savedInstanceState != null) {
            webView.restoreState(savedInstanceState);
        } else {
            webView.loadUrl(START_URL);
        }
    }

    private void setupWebView() {
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);      // localStorage = محل ذخیره اطلاعات تایم‌شیت
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(true);        // برای خواندن index.html از داخل APK
        s.setAllowContentAccess(true);
        s.setSupportZoom(true);
        s.setBuiltInZoomControls(true);
        s.setDisplayZoomControls(false);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);

        webView.addJavascriptInterface(new Bridge(), "AndroidBridge");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                String scheme = uri.getScheme();
                if (scheme == null || scheme.equals("file") || scheme.equals("about")
                        || scheme.equals("javascript") || scheme.equals("blob") || scheme.equals("data")) {
                    return false;
                }
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, uri));
                } catch (Exception e) {
                    Toast.makeText(MainActivity.this, "برنامه‌ای برای باز کردن این لینک پیدا نشد", Toast.LENGTH_SHORT).show();
                }
                return true;
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback,
                                             FileChooserParams params) {
                if (filePathCallback != null) {
                    filePathCallback.onReceiveValue(null);
                }
                filePathCallback = callback;
                try {
                    startActivityForResult(params.createIntent(), REQ_FILE);
                } catch (Exception e) {
                    filePathCallback = null;
                    Toast.makeText(MainActivity.this, "امکان انتخاب فایل نیست", Toast.LENGTH_SHORT).show();
                    return false;
                }
                return true;
            }
        });
    }

    /** پل بین جاوااسکریپت و اندروید برای ذخیره PDF و فایل پشتیبان */
    private class Bridge {

        /** شماره نسخه از build.gradle (تنها منبع شماره نسخه در اندروید) */
        @JavascriptInterface
        public String appVersion() {
            try {
                return getPackageManager().getPackageInfo(getPackageName(), 0).versionName;
            } catch (Exception e) {
                return "1.0.0";
            }
        }
        @JavascriptInterface
        public void saveFile(String b64, String name, String mime) {
            handleFile(b64, name, mime, false);
        }

        @JavascriptInterface
        public void shareFile(String b64, String name, String mime) {
            handleFile(b64, name, mime, true);
        }
    }

    private void handleFile(final String b64, final String name, final String mime, final boolean share) {
        runOnUiThread(() -> {
            boolean needPermission = Build.VERSION.SDK_INT >= Build.VERSION_CODES.M
                    && Build.VERSION.SDK_INT < Build.VERSION_CODES.Q
                    && checkSelfPermission(Manifest.permission.WRITE_EXTERNAL_STORAGE)
                    != PackageManager.PERMISSION_GRANTED;
            if (needPermission) {
                pendingB64 = b64;
                pendingName = name;
                pendingMime = mime;
                pendingShare = share;
                requestPermissions(new String[]{Manifest.permission.WRITE_EXTERNAL_STORAGE}, REQ_STORAGE);
                return;
            }
            new Thread(() -> writeFile(b64, name, mime, share)).start();
        });
    }

    private void writeFile(String b64, String name, String mime, boolean share) {
        try {
            byte[] data = Base64.decode(b64, Base64.DEFAULT);
            Uri uri = null;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                ContentValues v = new ContentValues();
                v.put(MediaStore.MediaColumns.DISPLAY_NAME, name);
                v.put(MediaStore.MediaColumns.MIME_TYPE, mime);
                v.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);
                uri = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, v);
                if (uri == null) throw new Exception("insert failed");
                OutputStream os = getContentResolver().openOutputStream(uri);
                os.write(data);
                os.close();
            } else {
                File dir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
                dir.mkdirs();
                File f = new File(dir, name);
                int n = 1;
                while (f.exists()) {
                    int dot = name.lastIndexOf('.');
                    String base = dot > 0 ? name.substring(0, dot) : name;
                    String ext = dot > 0 ? name.substring(dot) : "";
                    f = new File(dir, base + " (" + (n++) + ")" + ext);
                }
                FileOutputStream fo = new FileOutputStream(f);
                fo.write(data);
                fo.close();
                MediaScannerConnection.scanFile(this, new String[]{f.getAbsolutePath()}, new String[]{mime}, null);
            }
            final Uri fu = uri;
            runOnUiThread(() -> {
                Toast.makeText(this, "ذخیره شد در پوشه Downloads", Toast.LENGTH_LONG).show();
                if (fu == null) return;
                try {
                    if (share) {
                        Intent send = new Intent(Intent.ACTION_SEND);
                        send.setType(mime);
                        send.putExtra(Intent.EXTRA_STREAM, fu);
                        send.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                        startActivity(Intent.createChooser(send, "اشتراک‌گذاری"));
                    } else if (mime.equals("application/pdf")) {
                        Intent view = new Intent(Intent.ACTION_VIEW);
                        view.setDataAndType(fu, mime);
                        view.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
                        startActivity(view);
                    }
                } catch (Exception ignored) {
                    // برنامه‌ی مناسبی برای باز کردن نبود؛ فایل ذخیره شده است
                }
            });
        } catch (Exception e) {
            runOnUiThread(() -> Toast.makeText(this, "ذخیره فایل انجام نشد", Toast.LENGTH_LONG).show());
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == REQ_STORAGE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED && pendingB64 != null) {
                final String b = pendingB64, n = pendingName, m = pendingMime;
                final boolean sh = pendingShare;
                pendingB64 = null;
                new Thread(() -> writeFile(b, n, m, sh)).start();
            } else {
                pendingB64 = null;
                Toast.makeText(this, "بدون اجازه‌ی حافظه امکان ذخیره فایل نیست", Toast.LENGTH_LONG).show();
            }
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == REQ_FILE && filePathCallback != null) {
            Uri[] result = null;
            if (resultCode == RESULT_OK && data != null) {
                result = WebChromeClient.FileChooserParams.parseResult(resultCode, data);
            }
            filePathCallback.onReceiveValue(result);
            filePathCallback = null;
            return;
        }
        super.onActivityResult(requestCode, resultCode, data);
    }

    @Override
    public void onBackPressed() {
        // اول بگذار خود اپ (بستن پنجره / برگشت به تقویم) تصمیم بگیرد
        webView.evaluateJavascript("(window.__back&&window.__back())?'1':'0'", value -> {
            if (value == null || !value.contains("1")) {
                finish();
            }
        });
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        webView.saveState(outState);
    }

    @Override
    protected void onPause() {
        super.onPause();
        webView.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        webView.onResume();
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.destroy();
        }
        super.onDestroy();
    }
}
