import { useState } from 'react';
import { X, Download } from 'lucide-react';
import { Filesystem, Directory } from '@capacitor/filesystem';

/**
 * 全屏图片查看器
 * - 点击图片区域外关闭
 * - 支持保存图片到手机相册
 */
export default function ImageViewerModal({ image, onClose }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!image) return null;

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);

    // 优先使用 Web Share API（移动端可存到相册）
    try {
      const blob = await (await fetch(image)).blob();
      const file = new File([blob], `product_${Date.now()}.png`, { type: 'image/png' });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: '产品图片' });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        setSaving(false);
        return;
      }
    } catch (_) { /* fall through */ }

    // Capacitor 原生保存
    try {
      const base64Data = image.includes('base64,') ? image.split('base64,')[1] : image;
      const filename = `product_${Date.now()}.png`;
      const path = `Pictures/${filename}`;

      await Filesystem.writeFile({
        path,
        data: base64Data,
        directory: Directory.ExternalStorage,
        recursive: true,
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (_) {
      // 降级：浏览器下载
      try {
        const link = document.createElement('a');
        link.download = `product_${Date.now()}.png`;
        link.href = image;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch (_) {
        alert('保存失败，请长按图片保存');
      }
    }
    setSaving(false);
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-[#000000] bg-opacity-95 flex flex-col items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ backgroundColor: 'rgba(0,0,0,0.95)' }}
    >
      {/* 顶栏 */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 z-10">
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#ffffff' }}
        >
          <X size={20} />
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
          style={{
            backgroundColor: saved ? '#16a34a' : 'rgba(255,255,255,0.15)',
            color: '#ffffff',
          }}
        >
          <Download size={16} />
          {saved ? '已保存' : saving ? '保存中...' : '保存到相册'}
        </button>
      </div>

      {/* 图片 */}
      <img
        src={image}
        alt=""
        className="max-w-full max-h-full object-contain p-4"
        onClick={(e) => e.stopPropagation()}
        style={{ touchAction: 'pinch-zoom' }}
      />

      {/* 底部提示 */}
      <div className="absolute bottom-8 text-xs" style={{ color: '#9ca3af' }}>
        点击图片外区域关闭
      </div>
    </div>
  );
}
