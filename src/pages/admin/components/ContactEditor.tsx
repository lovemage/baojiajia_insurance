import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface ContactInfo {
  id: string;
  address: string;
  phone: string;
  email: string;
  business_hours: string;
  map_embed_url: string;
}

interface Props {
  onBack: () => void;
}

export default function ContactEditor({ onBack }: Props) {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_info')
        .select('*')
        .limit(1);

      if (error) throw error;
      if (data && data.length > 0) {
        setContactInfo(data[0]);
      }
    } catch (error) {
      console.error('Error fetching contact info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!contactInfo) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('contact_info')
        .update({
          address: contactInfo.address,
          phone: contactInfo.phone,
          email: contactInfo.email,
          business_hours: contactInfo.business_hours,
          map_embed_url: contactInfo.map_embed_url
        })
        .eq('id', contactInfo.id);

      if (error) throw error;
      alert('儲存成功！');
    } catch (error) {
      console.error('Error saving contact info:', error);
      alert('儲存失敗，請稍後再試');
    } finally {
      setSaving(false);
    }
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

  if (!contactInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">無法載入聯絡資訊</p>
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">聯絡資訊編輯</h1>
              <p className="text-gray-600">更新聯絡方式和地址資訊</p>
            </div>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-arrow-left-line mr-2"></i>
              返回
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <i className="ri-map-pin-line text-teal-600 mr-2"></i>
                辦公地址
              </label>
              <input
                type="text"
                value={contactInfo.address}
                onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="台北市信義區信義路五段7號"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <i className="ri-phone-line text-teal-600 mr-2"></i>
                聯絡電話
              </label>
              <input
                type="text"
                value={contactInfo.phone}
                onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="+886-2-1234-5678"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <i className="ri-mail-line text-teal-600 mr-2"></i>
                電子郵件
              </label>
              <input
                type="email"
                value={contactInfo.email}
                onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="info@insurance.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <i className="ri-time-line text-teal-600 mr-2"></i>
                營業時間
              </label>
              <textarea
                value={contactInfo.business_hours}
                onChange={(e) => setContactInfo({ ...contactInfo, business_hours: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                placeholder="週一至週五 9:00-18:00&#10;週六 9:00-12:00&#10;週日及國定假日休息"
              />
              <p className="text-xs text-gray-500 mt-1">使用換行符號分隔不同時段</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <i className="ri-map-2-line text-teal-600 mr-2"></i>
                Google 地圖嵌入網址
              </label>
              <input
                type="text"
                value={contactInfo.map_embed_url}
                onChange={(e) => setContactInfo({ ...contactInfo, map_embed_url: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="https://www.google.com/maps/embed?pb=..."
              />
              <p className="text-xs text-gray-500 mt-1">
                前往 Google Maps，點擊「分享」→「嵌入地圖」，複製 iframe 中的 src 網址
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <button
              onClick={onBack}
              className="px-8 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors cursor-pointer whitespace-nowrap"
            >
              取消
            </button>
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
    </div>
  );
}
