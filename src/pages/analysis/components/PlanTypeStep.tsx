import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

type Props = {
  onSelect: (planType: 'adult' | 'child') => void;
};

export default function PlanTypeStep({ onSelect }: Props) {
  const [selectedType, setSelectedType] = useState<'adult' | 'child' | ''>('');
  const [adultIcon, setAdultIcon] = useState('');
  const [childIcon, setChildIcon] = useState('');

  useEffect(() => {
    fetchIcons();
  }, []);

  const fetchIcons = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['analysis_adult_icon', 'analysis_child_icon']);

      if (error) throw error;

      data?.forEach(setting => {
        if (setting.setting_key === 'analysis_adult_icon') {
          setAdultIcon(setting.setting_value);
        } else if (setting.setting_key === 'analysis_child_icon') {
          setChildIcon(setting.setting_value);
        }
      });
    } catch (error) {
      console.error('Error fetching icons:', error);
    }
  };

  const handleSubmit = () => {
    if (selectedType) {
      onSelect(selectedType);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
      <div className="mb-12 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">選擇保險規劃類型</h2>
        <p className="text-xl text-gray-600">請選擇您需要的保險規劃方案</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
        {/* 成人保險規劃 */}
        <button
          onClick={() => setSelectedType('adult')}
          className={`p-8 rounded-2xl border-2 transition-all cursor-pointer ${
            selectedType === 'adult'
              ? 'border-teal-600 bg-teal-50 shadow-lg'
              : 'border-gray-200 hover:border-teal-300 hover:shadow-md'
          }`}
        >
          <div className="flex flex-col items-center text-center">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 overflow-hidden ${
              selectedType === 'adult' ? 'bg-teal-100' : 'bg-gray-100'
            }`}>
              {adultIcon ? (
                <img src={adultIcon} alt="成人保險" className="w-full h-full object-cover" />
              ) : (
                <i className={`ri-user-line text-5xl ${
                  selectedType === 'adult' ? 'text-teal-600' : 'text-gray-400'
                }`}></i>
              )}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">成人保險規劃</h3>
            <p className="text-gray-600 mb-4">
              為成年人量身打造的保險方案，涵蓋醫療、癌症、意外等全方位保障
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <i className="ri-check-line text-teal-600"></i>
              <span>適合 18 歲以上成年人</span>
            </div>
          </div>
        </button>

        {/* 幼兒保險規劃 */}
        <button
          onClick={() => setSelectedType('child')}
          className={`p-8 rounded-2xl border-2 transition-all cursor-pointer ${
            selectedType === 'child'
              ? 'border-teal-600 bg-teal-50 shadow-lg'
              : 'border-gray-200 hover:border-teal-300 hover:shadow-md'
          }`}
        >
          <div className="flex flex-col items-center text-center">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 overflow-hidden ${
              selectedType === 'child' ? 'bg-teal-100' : 'bg-gray-100'
            }`}>
              {childIcon ? (
                <img src={childIcon} alt="幼兒保險" className="w-full h-full object-cover" />
              ) : (
                <i className={`ri-parent-line text-5xl ${
                  selectedType === 'child' ? 'text-teal-600' : 'text-gray-400'
                }`}></i>
              )}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">幼兒保險規劃</h3>
            <p className="text-gray-600 mb-4">
              專為兒童設計的保險方案，提供成長階段所需的醫療與意外保障
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <i className="ri-check-line text-teal-600"></i>
              <span>適合 0-17 歲兒童</span>
            </div>
          </div>
        </button>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={!selectedType}
          className={`px-12 py-4 rounded-lg font-semibold text-lg transition-colors cursor-pointer whitespace-nowrap ${
            !selectedType
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-teal-600 text-white hover:bg-teal-700'
          }`}
        >
          開始分析
          <i className="ri-arrow-right-line ml-2"></i>
        </button>
      </div>
    </div>
  );
}
