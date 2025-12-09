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

interface CarouselImage {
  id: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
}

interface CarouselSettings {
  carousel_interval: string;
}

export default function HomepageEditor({ onBack }: Props) {
  const [content, setContent] = useState<HomepageContent | null>({
    id: '',
    hero_title: '我們的願景是\n打破傳統保險業務的框架',
    hero_subtitle: '',
    hero_description: '提供對等、客觀、正確的資訊，\n讓大家在資訊爆炸的環境中有辨別好壞的能力。\n用專業的知識為你在市場中找出最適合的規劃方案！',
    hero_button1_text: '需求分析 DIY',
    hero_button1_link: '/analysis',
    hero_button2_text: '保險知識分享',
    hero_button2_link: '/blog',
    hero_image_url: 'https://readdy.ai/api/search-image?query=Warm%20family%20protection%20concept%20with%20happy%20Asian%20family%20silhouette%20in%20bright%20natural%20setting%2C%20soft%20golden%20lighting%2C%20simple%20clean%20background%20showing%20security%20and%20care%2C%20professional%20lifestyle%20photography%20with%20emotional%20warmth&width=1920&height=1080&seq=hero-baojia-main&orientation=landscape',
    cta_title: '開始您的保險規劃之旅',
    cta_description: '先透過「需求分析 DIY」了解自己的保障缺口，或直接預約諮詢，讓保家佳為您量身規劃',
    cta_button1_text: '立即開始需求分析',
    cta_button1_link: '/analysis',
    cta_button2_text: '預約專人諮詢',
    cta_button2_link: '/contact',
    instagram_text: '追蹤我們的 Instagram',
    instagram_handle: '@baojiajia',
    instagram_url: 'https://instagram.com/baojiajia'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [carouselImages, setCarouselImages] = useState<CarouselImage[]>([]);
  const [carouselSettings, setCarouselSettings] = useState<CarouselSettings>({
    carousel_interval: '5000'
  });
  const [newCarouselImage, setNewCarouselImage] = useState('');

  useEffect(() => {
    fetchContent();
    fetchCarouselImages();
    fetchCarouselSettings();
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
        setContent(prev => ({ ...prev, ...organized }));
      }
    } catch (error) {
      console.error('Error fetching homepage content:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCarouselImages = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_carousel')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCarouselImages(data || []);
    } catch (error) {
      console.error('Error fetching carousel images:', error);
    }
  };

  const fetchCarouselSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('carousel_settings')
        .select('*');

      if (error) throw error;

      if (data && data.length > 0) {
        const settings: any = {};
        data.forEach((item: any) => {
          settings[item.setting_key] = item.setting_value;
        });
        setCarouselSettings(settings);
      }
    } catch (error) {
      console.error('Error fetching carousel settings:', error);
    }
  };

  const handleAddCarouselImage = async () => {
    if (!newCarouselImage.trim()) {
      alert('請輸入圖片網址');
      return;
    }

    if (carouselImages.length >= 5) {
      alert('最多只能新增 5 張輪播圖片');
      return;
    }

    try {
      const { error } = await supabase
        .from('hero_carousel')
        .insert({
          image_url: newCarouselImage,
          display_order: carouselImages.length + 1,
          is_active: true
        });

      if (error) throw error;
      setNewCarouselImage('');
      fetchCarouselImages();
      alert('圖片新增成功！');
    } catch (error) {
      console.error('Error adding carousel image:', error);
      alert('新增失敗，請稍後再試');
    }
  };

  const handleDeleteCarouselImage = async (id: string) => {
    if (!confirm('確定要刪除這張圖片嗎？')) return;

    try {
      const { error } = await supabase
        .from('hero_carousel')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchCarouselImages();
      alert('圖片已刪除');
    } catch (error) {
      console.error('Error deleting carousel image:', error);
      alert('刪除失敗，請稍後再試');
    }
  };

  const handleUpdateCarouselInterval = async (interval: string) => {
    try {
      const { data: existing } = await supabase
        .from('carousel_settings')
        .select('id')
        .eq('setting_key', 'carousel_interval');

      if (existing && existing.length > 0) {
        await supabase
          .from('carousel_settings')
          .update({ setting_value: interval })
          .eq('setting_key', 'carousel_interval');
      } else {
        await supabase
          .from('carousel_settings')
          .insert({
            setting_key: 'carousel_interval',
            setting_value: interval,
            description: '輪播間隔時間（毫秒）'
          });
      }

      setCarouselSettings(prev => ({ ...prev, carousel_interval: interval }));
      alert('輪播間隔已更新！');
    } catch (error) {
      console.error('Error updating carousel interval:', error);
      alert('更新失敗，請稍後再試');
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

      // 更新或新增每個欄位
      const updates = Object.entries(content).map(([key, value]) => {
        if (key === 'id') return null; // Skip ID

        const existing = existingData?.find((item: any) => item.content_key === key);

        if (existing) {
          return supabase
            .from('homepage_content')
            .update({
              content_value: value as string,
              updated_at: new Date().toISOString()
            })
            .eq('id', existing.id);
        } else {
          return supabase
            .from('homepage_content')
            .insert({
              content_key: key,
              content_value: value as string,
              display_order: 0 // You might want to set order logic
            });
        }
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

        {/* Hero 輪播圖片管理 */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <i className="ri-image-carousel-line text-blue-600 mr-3"></i>
            Hero 輪播圖片管理
          </h2>

          <div className="space-y-6">
            {/* 輪播間隔設定 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                輪播間隔時間（毫秒）
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={carouselSettings.carousel_interval}
                  onChange={(e) => setCarouselSettings(prev => ({ ...prev, carousel_interval: e.target.value }))}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="5000"
                  min="1000"
                  step="1000"
                />
                <button
                  onClick={() => handleUpdateCarouselInterval(carouselSettings.carousel_interval)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
                >
                  更新間隔
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">預設 5000ms = 5秒</p>
            </div>

            {/* 新增輪播圖片 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                新增輪播圖片 ({carouselImages.length}/5)
              </label>
              <div className="flex gap-3">
                <input
                  type="url"
                  value={newCarouselImage}
                  onChange={(e) => setNewCarouselImage(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="輸入圖片網址"
                  disabled={carouselImages.length >= 5}
                />
                <button
                  onClick={handleAddCarouselImage}
                  disabled={carouselImages.length >= 5}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer whitespace-nowrap disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  新增圖片
                </button>
              </div>
            </div>

            {/* 輪播圖片列表 */}
            {carouselImages.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  已新增的輪播圖片
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {carouselImages.map((image, index) => (
                    <div key={image.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="relative h-40 bg-gray-100">
                        <img
                          src={image.image_url}
                          alt={`Carousel ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/400x300?text=圖片載入失敗';
                          }}
                        />
                        <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                          #{index + 1}
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50">
                        <p className="text-xs text-gray-600 truncate mb-2">{image.image_url}</p>
                        <button
                          onClick={() => handleDeleteCarouselImage(image.id)}
                          className="w-full px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors cursor-pointer"
                        >
                          刪除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
