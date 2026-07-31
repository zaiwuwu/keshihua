import { useState, useRef } from 'react';
import { Camera, Image } from 'lucide-react';

export default function ImageUpload({ currentImage, onImageChange }) {
  const [preview, setPreview] = useState(currentImage || '');
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target.result);
      onImageChange(ev.target.result);
    };
    reader.onerror = () => alert('图片读取失败');
    reader.readAsDataURL(file);
  };

  const triggerPick = () => {
    // 重置 value 确保重复选同一文件仍触发 onChange
    if (fileRef.current) {
      fileRef.current.value = '';
      fileRef.current.click();
    }
  };

  return (
    <div>
      <label className="block text-xs mb-1" style={{ color: '#6b7280' }}>产品图片</label>

      {/* 隐藏的原生 file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        style={{ display: 'none' }}
      />

      {/* 点击区域 */}
      <div className="flex items-center gap-3">
        <div
          onClick={triggerPick}
          className="w-20 h-20 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden flex-shrink-0"
          style={{ borderColor: '#d1d5db', cursor: 'pointer' }}
        >
          {preview ? (
            <img src={preview} alt="" className="w-full h-full object-cover" />
          ) : (
            <Camera size={24} style={{ color: '#d1d5db' }} />
          )}
        </div>
        <button
          onClick={triggerPick}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium"
          style={{ border: '1px solid #e5e7eb', color: '#374151', backgroundColor: '#ffffff' }}
        >
          <Image size={14} />
          {preview ? '更换图片' : '从相册选择'}
        </button>
        {preview && (
          <button
            onClick={(e) => { e.stopPropagation(); setPreview(''); onImageChange(''); }}
            className="text-xs"
            style={{ color: '#ef4444' }}
          >
            清除
          </button>
        )}
      </div>
    </div>
  );
}
