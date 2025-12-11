import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { uploadToCloudinary } from '../../../lib/cloudinary';
import RichTextEditor from '../../../components/RichTextEditor';

interface ServiceDetail {
  id: string;
  service_id: string;
  content: string;
  updated_at: string;
}

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  image_url: string;
  slug: string;
  display_order: number;
  is_active: boolean;
}

interface Props {
  service: ServiceItem;
  onBack: () => void;
}

export default function ServiceDetailEditor({ service, onBack }: Props) {
  const [content, setContent] = useState('');
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  useEffect(() => {
    fetchContent();
  }, [service.id]);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('service_details')
        .select('*')
        .eq('service_id', service.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setContent(data.content || '');
        setHeroImageUrl(data.hero_image_url || '');
      }
    } catch (error) {
      console.error('Error fetching service detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingHero(true);
    try {
      const url = await uploadToCloudinary(file);
      setHeroImageUrl(url);
      alert('首圖上傳成功！');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('上傳失敗');
    } finally {
      setUploadingHero(false);
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: existing } = await supabase
        .from('service_details')
        .select('id')
        .eq('service_id', service.id)
        .single();

      const updateData = {
        content,
        hero_image_url: heroImageUrl,
        updated_at: new Date().toISOString()
      };

      if (existing) {
        const { error } = await supabase
          .from('service_details')
          .update(updateData)
          .eq('service_id', service.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('service_details')
          .insert({ service_id: service.id, ...updateData });
        if (error) throw error;
      }

      alert('儲存成功！');
      onBack();
    } catch (error) {
      console.error('Error saving service detail:', error);
      alert('儲存失敗，請稍後再試');
    } finally {
      setSaving(false);
    }
  };

  // Rich text editor functions
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-teal-600 mb-4 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-arrow-left-line"></i>
            返回列表
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">編輯內容：{service.title}</h1>
          <p className="text-gray-600">編輯服務項目的詳細內容</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
          {/* Hero Image Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">詳情頁首圖 (Hero Image)</label>
            <div className="space-y-3">
              <div className="flex gap-3">
                <input
                  type="url"
                  value={heroImageUrl}
                  onChange={(e) => setHeroImageUrl(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="圖片 URL 或上傳圖片"
                />
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleHeroImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploadingHero}
                  />
                  <button
                    type="button"
                    className="px-4 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors cursor-pointer whitespace-nowrap disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                    disabled={uploadingHero}
                  >
                    {uploadingHero ? (
                      <>
                        <i className="ri-loader-4-line animate-spin"></i>
                        上傳中...
                      </>
                    ) : (
                      <>
                        <i className="ri-upload-cloud-2-line"></i>
                        上傳圖片
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Image Preview */}
              {heroImageUrl && (
                <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50 relative h-48">
                  <img
                    src={heroImageUrl}
                    alt="Hero Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">詳細內容</label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="請輸入服務詳細內容..."
            />
            <p className="text-xs text-gray-500 mt-3">
              <i className="ri-information-line mr-1"></i>
              使用編輯器工具列中的圖片按鈕即可上傳圖片，插入後可直接拖曳調整大小並永久保存。
            </p>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={onBack}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors cursor-pointer whitespace-nowrap"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
            >
              {saving ? '儲存中...' : '儲存變更'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
