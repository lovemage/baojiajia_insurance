import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import ImageUpload from './ImageUpload';

interface HomepageContent {
  id: string;
  hero_title: string;
  hero_subtitle: string;
  hero_description: string;
  hero_button1_text: string;
  hero_button1_link: string;
  hero_button2_text: string;
  hero_button2_link: string;
  hero_image_url: string;
  cta_title: string;
  cta_description: string;
  cta_button1_text: string;
  cta_button1_link: string;
  cta_button2_text: string;
  cta_button2_link: string;
  instagram_text: string;
  instagram_handle: string;
  instagram_url: string;
}

interface Props {
  onBack: () => void;
}

export default function HomepageEditor({ onBack }: Props) {
  const [content, setContent] = useState<HomepageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('homepage_content')
        .select('*')
        .order('display_order');

      if (error) throw error;
      
      // 將多筆資料組織成物件格式
      if (data && data.length > 0) {
        const organized: any = {};
        data.forEach((item: any) => {
          organized[item.content_key] = item.content_value;
        });
        setContent(organized);
      }
    } catch (error) {
      console.error('Error fetching homepage content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!content) return;

    setSaving(true);
    try {
      // 先獲取所有現有記錄
      const { data: existingData } = await supabase
        .from('homepage_content')
        .select('*');

      // 更新每個欄位
      const updates = Object.entries(content).map(([key, value]) => {
        const existing = existingData?.find((item: any) => item.content_key === key);
        
        if (existing) {
          return supabase
            .from('homepage_content')
            .update({ 
              content_value: value as string,
              updated_at: new Date().toISOString()
            })
            .eq('id', existing.id);
        }
        return null;
      }).filter(Boolean);

      await Promise.all(updates);
      alert('儲存成功！');
    } catch (error) {
      console.error('Error saving homepage content:', error);
      alert('儲存失敗，請稍後再試');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof HomepageContent, value: string) => {
    if (!content) return;
    setContent({ ...content, [field]: value });
  };

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

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">無法載入內容</p>
          <button
            onClick={onBack}
            className="mt-4 px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors cursor-pointer whitespace-nowrap"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">首頁內容編輯</h1>
              <p className="text-gray-600">編輯首頁 Hero 區塊和行動呼籲內容</p>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <i className="ri-home-4-line text-purple-600 mr-3"></i>
            Hero 區塊
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                主標題
              </label>
              <input
                type="text"
                value={content.hero_title}
                onChange={(e) => handleChange('hero_title', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="我們的願景是..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                副標題
              </label>
              <input
                type="text"
                value={content.hero_subtitle}
                onChange={(e) => handleChange('hero_subtitle', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="打破傳統保險業務的框架"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                描述內容
              </label>
              <textarea
                value={content.hero_description}
                onChange={(e) => handleChange('hero_description', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                placeholder="提供對等、客觀、正確的資訊..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  按鈕1文字
                </label>
                <input
                  type="text"
                  value={content.hero_button1_text}
                  onChange={(e) => handleChange('hero_button1_text', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  按鈕1連結
                </label>
                <input
                  type="text"
                  value={content.hero_button1_link}
                  onChange={(e) => handleChange('hero_button1_link', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  按鈕2文字
                </label>
                <input
                  type="text"
                  value={content.hero_button2_text}
                  onChange={(e) => handleChange('hero_button2_text', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  按鈕2連結
                </label>
                <input
                  type="text"
                  value={content.hero_button2_link}
                  onChange={(e) => handleChange('hero_button2_link', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            <ImageUpload
              value={content.hero_image_url}
              onChange={(url) => handleChange('hero_image_url', url)}
              label="背景圖片網址"
            />
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <i className="ri-megaphone-line text-orange-600 mr-3"></i>
            行動呼籲區塊
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                標題
              </label>
              <input
                type="text"
                value={content.cta_title}
                onChange={(e) => handleChange('cta_title', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                描述內容
              </label>
              <textarea
                value={content.cta_description}
                onChange={(e) => handleChange('cta_description', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  按鈕1文字
                </label>
                <input
                  type="text"
                  value={content.cta_button1_text}
                  onChange={(e) => handleChange('cta_button1_text', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  按鈕1連結
                </label>
                <input
                  type="text"
                  value={content.cta_button1_link}
                  onChange={(e) => handleChange('cta_button1_link', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  按鈕2文字
                </label>
                <input
                  type="text"
                  value={content.cta_button2_text}
                  onChange={(e) => handleChange('cta_button2_text', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  按鈕2連結
                </label>
                <input
                  type="text"
                  value={content.cta_button2_link}
                  onChange={(e) => handleChange('cta_button2_link', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Instagram 文字
                </label>
                <input
                  type="text"
                  value={content.instagram_text}
                  onChange={(e) => handleChange('instagram_text', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Instagram 帳號
                </label>
                <input
                  type="text"
                  value={content.instagram_handle}
                  onChange={(e) => handleChange('instagram_handle', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Instagram 連結
                </label>
                <input
                  type="text"
                  value={content.instagram_url}
                  onChange={(e) => handleChange('instagram_url', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
          >
            {saving ? '儲存中...' : '儲存變更'}
          </button>
        </div>
      </div>
    </div>
  );
}
