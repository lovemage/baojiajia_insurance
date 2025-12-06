
import { useState } from 'react';
import { uploadToCloudinary } from '../../../lib/cloudinary';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
  accept?: string;
}

export default function ImageUpload({ 
  value, 
  onChange, 
  label = '圖片網址', 
  className = '',
  accept = "image/*,video/*"
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      onChange(url);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('上傳失敗，請稍後再試');
    } finally {
      setUploading(false);
      // Reset input value to allow uploading same file again
      e.target.value = '';
    }
  };

  const isVideo = (url: string) => {
    return url.match(/\.(mp4|webm|ogg|mov)$/i) || url.includes('/video/');
  };

  return (
    <div className={className}>
      <label className="block text-sm font-semibold text-gray-900 mb-2">
        {label} <span className="text-red-500">*</span>
      </label>
      
      <div className="space-y-4">
        <div className="flex gap-4 items-center">
            <input
                type="url"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                placeholder="輸入圖片網址或上傳檔案"
                required
            />
            <div className="relative">
                <input
                    type="file"
                    accept={accept}
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploading}
                />
                <button
                    type="button"
                    className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium cursor-pointer whitespace-nowrap border border-gray-300 h-full flex items-center"
                    disabled={uploading}
                >
                    {uploading ? (
                        <span className="flex items-center gap-2">
                            <i className="ri-loader-4-line animate-spin"></i>
                            上傳中...
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            <i className="ri-upload-cloud-2-line"></i>
                            上傳檔案
                        </span>
                    )}
                </button>
            </div>
        </div>

        {value && (
            <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50 max-w-md">
                {isVideo(value) ? (
                    <video
                        src={value}
                        controls
                        className="w-full h-48 object-cover object-center"
                    />
                ) : (
                    <img
                        src={value}
                        alt="預覽"
                        className="w-full h-48 object-cover object-center"
                        onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/400x300?text=圖片載入失敗';
                        }}
                    />
                )}
            </div>
        )}
      </div>
    </div>
  );
}
