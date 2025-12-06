import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface Statistic {
  id: string;
  stat_key: string;
  label: string;
  value: string;
  display_order: number;
  is_active: boolean;
}

interface Props {
  onBack: () => void;
}

export default function StatisticsEditor({ onBack }: Props) {
  const [statistics, setStatistics] = useState<Statistic[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const { data, error } = await supabase
        .from('statistics')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setStatistics(data || []);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const stat of statistics) {
        const { error } = await supabase
          .from('statistics')
          .update({
            label: stat.label,
            value: stat.value,
            is_active: stat.is_active
          })
          .eq('id', stat.id);

        if (error) throw error;
      }

      alert('儲存成功！');
    } catch (error) {
      console.error('Error saving statistics:', error);
      alert('儲存失敗，請稍後再試');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (id: string, field: keyof Statistic, value: any) => {
    setStatistics(statistics.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = statistics.findIndex(s => s.id === id);
    if (currentIndex === -1) return;
    
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === statistics.length - 1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const currentStat = statistics[currentIndex];
    const targetStat = statistics[targetIndex];

    try {
      await supabase
        .from('statistics')
        .update({ display_order: targetStat.display_order })
        .eq('id', currentStat.id);

      await supabase
        .from('statistics')
        .update({ display_order: currentStat.display_order })
        .eq('id', targetStat.id);

      fetchStatistics();
    } catch (error) {
      console.error('Error reordering:', error);
      alert('調整順序失敗');
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">統計數據管理</h1>
              <p className="text-gray-600">管理「關於我們」頁面顯示的統計數字</p>
            </div>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-arrow-left-line mr-2"></i>
              返回
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {statistics.map((stat, index) => (
              <div key={stat.id} className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">統計項目 {stat.display_order}</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReorder(stat.id, 'up')}
                      disabled={index === 0}
                      className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-teal-600 disabled:opacity-30 cursor-pointer"
                    >
                      <i className="ri-arrow-up-s-line text-xl"></i>
                    </button>
                    <button
                      onClick={() => handleReorder(stat.id, 'down')}
                      disabled={index === statistics.length - 1}
                      className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-teal-600 disabled:opacity-30 cursor-pointer"
                    >
                      <i className="ri-arrow-down-s-line text-xl"></i>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      數值
                    </label>
                    <input
                      type="text"
                      value={stat.value}
                      onChange={(e) => handleChange(stat.id, 'value', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-2xl font-bold text-teal-600"
                      placeholder="例如：15.7K+"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      說明文字
                    </label>
                    <input
                      type="text"
                      value={stat.label}
                      onChange={(e) => handleChange(stat.id, 'label', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="例如：Instagram 粉絲"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id={`active_${stat.id}`}
                      checked={stat.is_active}
                      onChange={(e) => handleChange(stat.id, 'is_active', e.target.checked)}
                      className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                    />
                    <label htmlFor={`active_${stat.id}`} className="text-sm font-medium text-gray-700">
                      在頁面上顯示
                    </label>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-300">
                  <p className="text-xs text-gray-500 mb-2">預覽效果：</p>
                  <div className="text-center bg-white p-4 rounded-lg">
                    <div className="text-3xl font-bold text-teal-600 mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full px-6 py-4 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 text-lg font-semibold cursor-pointer whitespace-nowrap"
            >
              {saving ? '儲存中...' : '儲存所有統計數據'}
            </button>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <i className="ri-lightbulb-line text-2xl text-blue-600 flex-shrink-0"></i>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">數值格式建議</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 大數字可以使用 K（千）或 M（百萬）簡化，例如：15.7K+</li>
                <li>• 百分比記得加上 % 符號，例如：99%</li>
                <li>• 可以在數字後加上 + 號表示「以上」，例如：5K+</li>
                <li>• 保持格式一致，讓數據看起來更專業</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
