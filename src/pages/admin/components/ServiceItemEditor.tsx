import { useState } from 'react';
import { supabase } from '../../../lib/supabase';

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

export default function ServiceItemEditor({ service, onBack }: Props) {
  const [formData, setFormData] = useState({
    title: service.title,
    description: service.description,
    icon: service.icon,
    image_url: service.image_url,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('service_items')
        .update({
          title: formData.title,
          description: formData.description,
          icon: formData.icon,
          image_url: formData.image_url,
        })
        .eq('id', service.id);

      if (error) throw error;

      setMessage({ type: 'success', text: '儲存成功！' });
      setTimeout(() => {
        onBack();
      }, 1500);
    } catch (error) {
      console.error('Error updating service:', error);
      setMessage({ type: 'error', text: '儲存失敗，請稍後再試' });
    } finally {
      setSaving(false);
    }
  };

  const iconOptions = [
    { value: 'ri-health-book-line', label: '健康手冊' },
    { value: 'ri-user-heart-line', label: '用戶關懷' },
    { value: 'ri-parent-line', label: '家庭' },
    { value: 'ri-heart-pulse-line', label: '心跳' },
    { value: 'ri-money-dollar-circle-line', label: '金錢' },
    { value: 'ri-calendar-check-line', label: '日曆' },
    { value: 'ri-shield-check-line', label: '盾牌' },
    { value: 'ri-hand-heart-line', label: '愛心手' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-teal-600 mb-4 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-arrow-left-line"></i>
            返回列表
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">編輯服務項目</h1>
          <p className="text-gray-600">修改服務項目的基本資訊</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-8">
          {/* Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              <div className="flex items-center gap-2">
                <i className={`${message.type === 'success' ? 'ri-checkbox-circle-fill' : 'ri-error-warning-fill'} text-xl`}></i>
                <span className="font-medium">{message.text}</span>
              </div>
            </div>
          )}

          {/* Title */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              服務項目名稱 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
              placeholder="例如：保單健診"
              required
            />
          </div>

          {/* Description - Simple Textarea */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              服務描述 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full min-h-[300px] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm resize-y"
              placeholder="輸入服務描述內容..."
              dir="ltr"
              style={{ textAlign: 'left', direction: 'ltr' }}
              required
            />
            <p className="text-xs text-gray-500 mt-1">請輸入服務的詳細描述</p>
          </div>

          {/* Icon */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              圖示 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {iconOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon: option.value })}
                  className={`p-4 border-2 rounded-lg transition-all cursor-pointer ${
                    formData.icon === option.value
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 hover:border-teal-300'
                  }`}
                >
                  <div className="w-10 h-10 mx-auto bg-teal-500 rounded-lg flex items-center justify-center mb-2">
                    <i className={`${option.value} text-xl text-white`}></i>
                  </div>
                  <p className="text-xs text-gray-600 text-center">{option.label}</p>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">或輸入自訂圖示類別名稱（Remix Icon）</p>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm mt-2"
              placeholder="例如：ri-health-book-line"
            />
          </div>

          {/* Image URL */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              服務圖片網址 <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
              placeholder="https://example.com/image.jpg"
              required
            />
            {formData.image_url && (
              <div className="mt-4 rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={formData.image_url}
                  alt="預覽"
                  className="w-full h-48 object-cover object-top"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/400x300?text=圖片載入失敗';
                  }}
                />
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium cursor-pointer whitespace-nowrap"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="ri-loader-4-line animate-spin"></i>
                  儲存中...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <i className="ri-save-line"></i>
                  儲存變更
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium cursor-pointer whitespace-nowrap"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
