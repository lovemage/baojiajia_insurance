import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
  display_order: number;
  is_active: boolean;
}

interface Props {
  onBack: () => void;
}

export default function FeaturesEditor({ onBack }: Props) {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      const { data, error } = await supabase
        .from('features')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setFeatures(data || []);
    } catch (error) {
      console.error('Error fetching features:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingFeature) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('features')
        .update({
          icon: editingFeature.icon,
          title: editingFeature.title,
          description: editingFeature.description,
          is_active: editingFeature.is_active
        })
        .eq('id', editingFeature.id);

      if (error) throw error;
      
      setEditingFeature(null);
      fetchFeatures();
      alert('儲存成功！');
    } catch (error) {
      console.error('Error saving feature:', error);
      alert('儲存失敗，請稍後再試');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('features')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      fetchFeatures();
    } catch (error) {
      console.error('Error toggling feature status:', error);
      alert('更新狀態失敗，請稍後再試');
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

  if (editingFeature) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">編輯特色項目</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  圖示 (Remix Icon 類別名稱)
                </label>
                <input
                  type="text"
                  value={editingFeature.icon}
                  onChange={(e) => setEditingFeature({ ...editingFeature, icon: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="ri-line-chart-line"
                />
                <p className="text-xs text-gray-500 mt-1">
                  請至 <a href="https://remixicon.com/" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline cursor-pointer">Remix Icon</a> 查找圖示名稱
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  標題
                </label>
                <input
                  type="text"
                  value={editingFeature.title}
                  onChange={(e) => setEditingFeature({ ...editingFeature, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  描述
                </label>
                <textarea
                  value={editingFeature.description}
                  onChange={(e) => setEditingFeature({ ...editingFeature, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={editingFeature.is_active}
                  onChange={(e) => setEditingFeature({ ...editingFeature, is_active: e.target.checked })}
                  className="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500 cursor-pointer"
                />
                <label htmlFor="is_active" className="ml-3 text-sm font-semibold text-gray-700 cursor-pointer">
                  啟用此特色項目
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={() => setEditingFeature(null)}
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">為什麼選擇我們</h1>
              <p className="text-gray-600">管理首頁特色項目內容</p>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div key={feature.id} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center">
                  <i className={`${feature.icon} text-2xl text-teal-600`}></i>
                </div>
                <button
                  onClick={() => handleToggleActive(feature.id, feature.is_active)}
                  className="cursor-pointer"
                >
                  {feature.is_active ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium whitespace-nowrap">
                      <i className="ri-checkbox-circle-fill"></i>
                      已啟用
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium whitespace-nowrap">
                      <i className="ri-close-circle-fill"></i>
                      已停用
                    </span>
                  )}
                </button>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">{feature.description}</p>

              <button
                onClick={() => setEditingFeature(feature)}
                className="w-full px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-edit-line mr-2"></i>
                編輯
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
