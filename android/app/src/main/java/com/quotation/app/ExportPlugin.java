package com.quotation.app;

import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.pdf.PdfDocument;
import android.os.Environment;
import android.view.View;
import android.webkit.WebView;
import androidx.core.content.FileProvider;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;
import java.io.FileOutputStream;

@CapacitorPlugin(name = "ExportNative")
public class ExportPlugin extends Plugin {

    @PluginMethod
    public void exportImage(PluginCall call) {
        try {
            String filename = call.getString("filename", "quotation.png");
            float scale = call.getFloat("scale", 2.0f);

            WebView webView = getBridge().getWebView();
            int w = webView.getWidth();
            int h = webView.getHeight();

            // Canvas 绘制到 Bitmap
            Bitmap bitmap = Bitmap.createBitmap((int)(w * scale), (int)(h * scale), Bitmap.Config.ARGB_8888);
            Canvas canvas = new Canvas(bitmap);
            canvas.scale(scale, scale);
            webView.draw(canvas);

            // 保存 PNG
            File dir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOCUMENTS);
            File file = new File(dir, filename);
            file.getParentFile().mkdirs();
            FileOutputStream out = new FileOutputStream(file);
            bitmap.compress(Bitmap.CompressFormat.PNG, 100, out);
            out.close();
            bitmap.recycle();

            // 分享
            shareFile(file, "image/png");
            call.resolve(new JSObject().put("path", file.getAbsolutePath()));
        } catch (Exception e) {
            call.reject("导出失败: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void exportPDF(PluginCall call) {
        try {
            String filename = call.getString("filename", "quotation.pdf");
            float scale = call.getFloat("scale", 2.0f);

            WebView webView = getBridge().getWebView();
            int w = webView.getWidth();
            int h = webView.getHeight();

            // Canvas → Bitmap
            Bitmap bitmap = Bitmap.createBitmap((int)(w * scale), (int)(h * scale), Bitmap.Config.ARGB_8888);
            Canvas canvas = new Canvas(bitmap);
            canvas.scale(scale, scale);
            webView.draw(canvas);

            // Android 原生 PdfDocument
            PdfDocument pdf = new PdfDocument();
            int pageW = bitmap.getWidth();
            int pageH = bitmap.getHeight();

            // A4 比例分页
            float a4Ratio = 297f / 210f;
            int sliceH = (int)(pageW * a4Ratio);
            int y = 0;

            while (y < pageH) {
                int hh = Math.min(sliceH, pageH - y);
                PdfDocument.PageInfo info = new PdfDocument.PageInfo.Builder(pageW, hh, 1).create();
                PdfDocument.Page page = pdf.startPage(info);
                page.getCanvas().drawBitmap(bitmap, 0, y, null);
                pdf.finishPage(page);
                y += sliceH;
            }

            // 保存 PDF
            File dir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOCUMENTS);
            File file = new File(dir, filename);
            file.getParentFile().mkdirs();
            FileOutputStream out = new FileOutputStream(file);
            pdf.writeTo(out);
            pdf.close();
            out.close();
            bitmap.recycle();

            // 分享
            shareFile(file, "application/pdf");
            call.resolve(new JSObject().put("path", file.getAbsolutePath()));
        } catch (Exception e) {
            call.reject("导出失败: " + e.getMessage(), e);
        }
    }

    private void shareFile(File file, String mimeType) {
        try {
            android.net.Uri uri = FileProvider.getUriForFile(
                getContext(),
                getContext().getPackageName() + ".fileprovider",
                file
            );
            Intent intent = new Intent(Intent.ACTION_SEND);
            intent.setType(mimeType);
            intent.putExtra(Intent.EXTRA_STREAM, uri);
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            getContext().startActivity(Intent.createChooser(intent, "分享报价单"));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
