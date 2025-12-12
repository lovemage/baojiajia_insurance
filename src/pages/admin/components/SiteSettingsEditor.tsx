import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import ImageUpload from './ImageUpload';

interface SiteSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_label: string;
}

interface Props {
  onBack: () => void;
}

export default function SiteSettingsEditor({ onBack }: Props) {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');

      if (error) throw error;
      setSettings(data || []);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const setting of settings) {
        const { error } = await supabase
          .from('site_settings')
          .update({ setting_value: setting.setting_value })
          .eq('id', setting.id);

        if (error) throw error;
      }

      alert('儲存成功！');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('儲存失敗，請稍後再試');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (id: string, value: string) => {
    setSettings(settings.map(s => 
      s.id === id ? { ...s, setting_value: value } : s
    ));
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">網站設定</h1>
              <p className="text-gray-600">管理網站 Logo 和社群媒體連結</p>
            </div>
          </div>

          <div className="space-y-6">
            {settings.map((setting) => (
              <div key={setting.id}>
                {setting.setting_key === 'logo_url' ? (
                  <ImageUpload
                    value={setting.setting_value}
                    onChange={(url) => handleChange(setting.id, url)}
                    label={setting.setting_label}
                  />
                ) : (
                  <>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {setting.setting_label}
                    </label>
                    <input
                      type="url"
                      value={setting.setting_value}
                      onChange={(e) => handleChange(setting.id, e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder={`輸入 ${setting.setting_label}`}
                    />
                  </>
                )}
              </div>
            ))}

            <div className="pt-6 border-t border-gray-200">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full px-6 py-4 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 text-lg font-semibold cursor-pointer whitespace-nowrap"
              >
                {saving ? '儲存中...' : '儲存所有設定'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <i className="ri-information-line text-2xl text-blue-600 flex-shrink-0"></i>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">使用說明</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Logo 圖片建議使用透明背景的 PNG 格式</li>
                <li>• 建議 Logo 高度為 200-300px，系統會自動調整顯示大小</li>
                <li>• 社群媒體連結請輸入完整網址（包含 https://）</li>
                <li>• 如果不需要某個社群媒體連結，可以留空</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
