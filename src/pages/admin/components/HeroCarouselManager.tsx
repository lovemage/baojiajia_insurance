import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import ImageUpload from './ImageUpload';
import { uploadToCloudinary } from '../../../lib/cloudinary';

interface HeroItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  button1_text: string;
  button1_link: string;
  button2_text: string;
  button2_link: string;
  image_url: string;
  cloudinary_public_id: string;
  display_order: number;
  is_active: boolean;
}

interface Props {
  onBack: () => void;
}

export default function HeroCarouselManager({ onBack }: Props) {
  const [heroItems, setHeroItems] = useState<HeroItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [carouselInterval, setCarouselInterval] = useState('5000');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<HeroItem | null>(null);

  useEffect(() => {
    fetchHeroItems();
    fetchCarouselSettings();
  }, []);

  const fetchHeroItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('hero_carousel')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setHeroItems(data || []);
    } catch (error) {
      console.error('Error fetching hero items:', error);
      alert('載入 Hero 項目失敗');
    } finally {
      setLoading(false);
    }
  };

  const fetchCarouselSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('carousel_settings')
        .select('*')
        .eq('setting_key', 'carousel_interval');

      if (error) throw error;
      if (data && data.length > 0) {
        setCarouselInterval(data[0].setting_value);
      }
    } catch (error) {
      console.error('Error fetching carousel settings:', error);
    }
  };

  const handleUpdateCarouselInterval = async () => {
    try {
      const { data: existing } = await supabase
        .from('carousel_settings')
        .select('id')
        .eq('setting_key', 'carousel_interval');

      if (existing && existing.length > 0) {
        await supabase
          .from('carousel_settings')
          .update({ setting_value: carouselInterval })
          .eq('setting_key', 'carousel_interval');
      } else {
        await supabase
          .from('carousel_settings')
          .insert({
            setting_key: 'carousel_interval',
            setting_value: carouselInterval,
            description: '輪播間隔時間（毫秒）'
          });
      }
      alert('輪播間隔已更新！');
    } catch (error) {
      console.error('Error updating carousel interval:', error);
      alert('更新失敗');
    }
  };

  const handleAddHero = async () => {
    try {
      const newOrder = Math.max(...heroItems.map(h => h.display_order), 0) + 1;
      const { error } = await supabase
        .from('hero_carousel')
        .insert({
          title: '新 Hero 標題',
          subtitle: '',
          description: '描述',
          button1_text: '按鈕 1',
          button1_link: '/',
          button2_text: '按鈕 2',
          button2_link: '/',
          image_url: '',
          cloudinary_public_id: '',
          display_order: newOrder,
          is_active: true
        });

      if (error) throw error;
      fetchHeroItems();
      alert('新 Hero 已新增');
    } catch (error) {
      console.error('Error adding hero:', error);
      alert('新增失敗');
    }
  };

  const handleDeleteHero = async (id: string) => {
    if (!confirm('確定要刪除這個 Hero 嗎？')) return;

    try {
      const { error } = await supabase
        .from('hero_carousel')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchHeroItems();
      alert('Hero 已刪除');
    } catch (error) {
      console.error('Error deleting hero:', error);
      alert('刪除失敗');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-center text-gray-600">載入中...</p>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Hero 輪播管理</h1>
              <p className="text-gray-600">管理首頁 Hero 輪播項目</p>
            </div>
            <button
              onClick={onBack}
              className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors cursor-pointer"
            >
              返回
            </button>
          </div>
        </div>

        {/* Carousel Settings */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">輪播設定</h2>
          <div className="flex gap-3">
            <input
              type="number"
              value={carouselInterval}
              onChange={(e) => setCarouselInterval(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              min="1000"
              step="1000"
            />
            <button
              onClick={handleUpdateCarouselInterval}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
            >
              更新間隔
            </button>
          </div>
        </div>

        {/* Add Hero Button */}
        <button
          onClick={handleAddHero}
          className="mb-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer"
        >
          + 新增 Hero
        </button>

        {/* Hero Items List */}
        <div className="space-y-4">
          {heroItems.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingId(editingId === item.id ? null : item.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
                  >
                    {editingId === item.id ? '關閉' : '編輯'}
                  </button>
                  <button
                    onClick={() => handleDeleteHero(item.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
                  >
                    刪除
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">順序: {item.display_order}</p>

              {editingId === item.id && (
                <HeroItemEditor
                  item={item}
                  onSave={() => {
                    fetchHeroItems();
                    setEditingId(null);
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface HeroItemEditorProps {
  item: HeroItem;
  onSave: () => void;
}

function HeroItemEditor({ item, onSave }: HeroItemEditorProps) {
  const [formData, setFormData] = useState(item);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setFormData({ ...formData, image_url: url });
      alert('圖片上傳成功！');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('上傳失敗，請稍後再試');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('hero_carousel')
        .update(formData)
        .eq('id', item.id);

      if (error) throw error;
      alert('Hero 已更新');
      onSave();
    } catch (error) {
      console.error('Error saving hero:', error);
      alert('保存失敗');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">標題</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">副標題</label>
        <input
          type="text"
          value={formData.subtitle}
          onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">描述</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 h-24"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">按鈕 1 文字</label>
          <input
            type="text"
            value={formData.button1_text}
            onChange={(e) => setFormData({ ...formData, button1_text: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">按鈕 1 連結</label>
          <input
            type="text"
            value={formData.button1_link}
            onChange={(e) => setFormData({ ...formData, button1_link: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">按鈕 2 文字</label>
          <input
            type="text"
            value={formData.button2_text}
            onChange={(e) => setFormData({ ...formData, button2_text: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">按鈕 2 連結</label>
          <input
            type="text"
            value={formData.button2_link}
            onChange={(e) => setFormData({ ...formData, button2_link: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* 圖片上傳區域 */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Hero 背景圖片</label>
        <div className="space-y-3">
          <div className="flex gap-3">
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              placeholder="https://res.cloudinary.com/..."
            />
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploading}
              />
              <button
                type="button"
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap disabled:bg-gray-400 flex items-center gap-2"
                disabled={uploading}
              >
                {uploading ? (
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

          {/* 圖片預覽 */}
          {formData.image_url && (
            <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
              <img
                src={formData.image_url}
                alt="Hero 預覽"
                className="w-full h-48 object-cover"
                onError={(e) => {
                  if (!e.currentTarget.dataset.errorHandled) {
                    e.currentTarget.dataset.errorHandled = 'true';
                    e.currentTarget.style.display = 'none';
                  }
                }}
              />
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                {formData.image_url ? '圖片載入中或 URL 無效' : '未設定圖片'}
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">順序</label>
        <input
          type="number"
          value={formData.display_order}
          onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer disabled:bg-gray-400"
        >
          {saving ? '保存中...' : '保存'}
        </button>
      </div>
    </div>
  );
}

