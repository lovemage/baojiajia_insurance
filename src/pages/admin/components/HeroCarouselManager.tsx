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
  button1_bg_color: string;
  button1_text_color: string;
  button2_text: string;
  button2_link: string;
  button2_bg_color: string;
  button2_text_color: string;
  image_url: string;
  cloudinary_public_id: string;
  overlay_opacity: number;
  button_position: 'left' | 'center' | 'right';
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
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
  const [showPreview, setShowPreview] = useState(false);

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
          button1_bg_color: '#0d9488',
          button1_text_color: '#ffffff',
          button2_text: '按鈕 2',
          button2_link: '/',
          button2_bg_color: '#ffffff',
          button2_text_color: '#ffffff',
          image_url: '',
          cloudinary_public_id: '',
          overlay_opacity: 90,
          button_position: 'left',
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
              className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors cursor-pointer font-medium"
            >
              <i className="ri-save-line mr-2"></i>
              更新間隔
            </button>
          </div>
        </div>

        {/* Add Hero Button */}
        <button
          onClick={handleAddHero}
          className="mb-6 px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors cursor-pointer font-medium"
        >
          <i className="ri-add-line mr-2"></i>
          新增 Hero
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
                    className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors cursor-pointer font-medium text-sm"
                  >
                    <i className={`${editingId === item.id ? 'ri-close-line' : 'ri-edit-line'} mr-1`}></i>
                    {editingId === item.id ? '關閉' : '編輯'}
                  </button>
                  <button
                    onClick={() => handleDeleteHero(item.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors cursor-pointer font-medium text-sm"
                  >
                    <i className="ri-delete-bin-line mr-1"></i>
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
                  showPreview={showPreview}
                  setShowPreview={setShowPreview}
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
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
}

function HeroItemEditor({ item, onSave, showPreview, setShowPreview }: HeroItemEditorProps) {
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

      // 驗證必填欄位
      if (!formData.title || formData.title.trim() === '') {
        alert('標題不能為空');
        setSaving(false);
        return;
      }

      // 排除 id、created_at、updated_at 欄位，只更新其他欄位
      const { id, created_at, updated_at, ...updateData } = formData;
      console.log('Saving hero with data:', updateData);
      console.log('Update data keys:', Object.keys(updateData));
      console.log('Update data values:', Object.values(updateData));

      // 只發送特定的欄位，避免發送不存在的欄位
      const safeUpdateData = {
        title: updateData.title,
        subtitle: updateData.subtitle,
        description: updateData.description,
        button1_text: updateData.button1_text,
        button1_link: updateData.button1_link,
        button1_bg_color: updateData.button1_bg_color,
        button1_text_color: updateData.button1_text_color,
        button2_text: updateData.button2_text,
        button2_link: updateData.button2_link,
        button2_bg_color: updateData.button2_bg_color,
        button2_text_color: updateData.button2_text_color,
        image_url: updateData.image_url,
        cloudinary_public_id: updateData.cloudinary_public_id,
        overlay_opacity: updateData.overlay_opacity,
        button_position: updateData.button_position,
        display_order: updateData.display_order,
        is_active: updateData.is_active
      };

      console.log('Safe update data:', safeUpdateData);
      const { error, data } = await supabase
        .from('hero_carousel')
        .update(safeUpdateData)
        .eq('id', item.id)
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      console.log('Save successful:', data);
      alert('Hero 已更新');
      onSave();
    } catch (error) {
      console.error('Error saving hero:', error);
      alert('保存失敗: ' + (error instanceof Error ? error.message : '未知錯誤'));
    } finally {
      setSaving(false);
    }
  };

  // Popup 預覽組件
  const PreviewPopup = () => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* 預覽頭部 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Hero 預覽</h3>
          <button
            onClick={() => setShowPreview(false)}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* 預覽內容 - 模擬 Hero 組件 */}
        <div className="relative min-h-screen flex items-center bg-cover bg-center overflow-hidden bg-black">
          {/* 背景圖片 */}
          {formData.image_url ? (
            <img
              src={formData.image_url}
              alt={formData.title}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-800 to-black"></div>
          )}

          {/* 動態遮罩 */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-black to-black/30"
            style={{
              opacity: formData.overlay_opacity / 100
            }}
          ></div>

          {/* 內容 */}
          <div className="relative z-10 w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-2xl">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight whitespace-pre-line">
                  {formData.title}
                  {formData.subtitle && (
                    <>
                      <br />
                      <span className="text-2xl sm:text-3xl md:text-4xl mt-2 block">{formData.subtitle}</span>
                    </>
                  )}
                </h1>
                <div className="text-lg sm:text-xl md:text-2xl text-white/90 mb-6 sm:mb-8 leading-relaxed max-w-3xl whitespace-pre-line">
                  {formData.description}
                </div>
                <div className={`flex flex-col sm:flex-row gap-3 sm:gap-4 ${
                  formData.button_position === 'center' ? 'justify-center' :
                  formData.button_position === 'right' ? 'justify-end' :
                  'justify-start'
                }`}>
                  <button
                    className="px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold transition-colors text-center cursor-pointer whitespace-nowrap"
                    style={{
                      backgroundColor: formData.button1_bg_color,
                      color: formData.button1_text_color
                    }}
                  >
                    {formData.button1_text}
                  </button>
                  <button
                    className="px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold transition-colors border-2 text-center cursor-pointer whitespace-nowrap"
                    style={{
                      backgroundColor: formData.button2_bg_color,
                      color: formData.button2_text_color,
                      borderColor: formData.button2_text_color
                    }}
                  >
                    {formData.button2_text}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {showPreview && <PreviewPopup />}
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

      {/* 按鈕 1 顏色 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">按鈕 1 背景色</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={formData.button1_bg_color}
              onChange={(e) => setFormData({ ...formData, button1_bg_color: e.target.value })}
              className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
            />
            <input
              type="text"
              value={formData.button1_bg_color}
              onChange={(e) => setFormData({ ...formData, button1_bg_color: e.target.value })}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm"
              placeholder="#0d9488"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">按鈕 1 文字色</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={formData.button1_text_color}
              onChange={(e) => setFormData({ ...formData, button1_text_color: e.target.value })}
              className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
            />
            <input
              type="text"
              value={formData.button1_text_color}
              onChange={(e) => setFormData({ ...formData, button1_text_color: e.target.value })}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm"
              placeholder="#ffffff"
            />
          </div>
        </div>
      </div>

      {/* 按鈕 2 顏色 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">按鈕 2 背景色</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={formData.button2_bg_color}
              onChange={(e) => setFormData({ ...formData, button2_bg_color: e.target.value })}
              className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
            />
            <input
              type="text"
              value={formData.button2_bg_color}
              onChange={(e) => setFormData({ ...formData, button2_bg_color: e.target.value })}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm"
              placeholder="rgba(255, 255, 255, 0.1)"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">按鈕 2 文字色</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={formData.button2_text_color}
              onChange={(e) => setFormData({ ...formData, button2_text_color: e.target.value })}
              className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
            />
            <input
              type="text"
              value={formData.button2_text_color}
              onChange={(e) => setFormData({ ...formData, button2_text_color: e.target.value })}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm"
              placeholder="#ffffff"
            />
          </div>
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
                className="px-4 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors cursor-pointer whitespace-nowrap disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
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
            <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50 relative h-48">
              <img
                src={formData.image_url}
                alt="Hero 預覽"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
                onLoad={(e) => {
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'none';
                }}
              />
              <div
                className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-500 text-sm"
                style={{ display: 'none' }}
              >
                圖片載入中或 URL 無效
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 遮罩透明度 */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          遮罩透明度: {formData.overlay_opacity}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={formData.overlay_opacity}
          onChange={(e) => setFormData({ ...formData, overlay_opacity: parseInt(e.target.value) })}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="text-xs text-gray-500 mt-1">0% = 完全透明，100% = 完全不透明</div>
      </div>

      {/* 按鈕位置 */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">CTA 按鈕位置</label>
        <div className="grid grid-cols-3 gap-2">
          {(['left', 'center', 'right'] as const).map((position) => (
            <button
              key={position}
              type="button"
              onClick={() => setFormData({ ...formData, button_position: position })}
              className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                formData.button_position === position
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {position === 'left' ? '左對齊' : position === 'center' ? '居中' : '右對齊'}
            </button>
          ))}
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
          type="button"
          onClick={() => setShowPreview(true)}
          className="flex-1 px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors cursor-pointer flex items-center justify-center gap-2 font-medium"
        >
          <i className="ri-eye-line"></i>
          預覽效果
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
        >
          <i className={`${saving ? 'ri-loader-4-line animate-spin' : 'ri-save-line'} mr-2`}></i>
          {saving ? '保存中...' : '保存'}
        </button>
      </div>
    </div>
    </>
  );
}

