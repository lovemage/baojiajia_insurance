
import { useState } from 'react';

interface BasicInfoStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

export default function BasicInfoStep({ data, onUpdate, onNext }: BasicInfoStepProps) {
  const planType = data.planType || 'adult';
  
  const [formData, setFormData] = useState({
    birthDate: data.birthDate || '',
    gender: data.gender || '',
    monthlyIncome: data.monthlyIncome || 0,
    maritalStatus: data.maritalStatus || ''
  });

  const [rocDate, setRocDate] = useState({
    year: '',
    month: '',
    day: ''
  });

  const handleRocDateChange = (field: 'year' | 'month' | 'day', value: string) => {
    const newRocDate = { ...rocDate, [field]: value };
    setRocDate(newRocDate);

    // 如果三個欄位都有值,轉換成西元日期
    if (newRocDate.year && newRocDate.month && newRocDate.day) {
      const adYear = parseInt(newRocDate.year) + 1911;
      const formattedDate = `${adYear}-${newRocDate.month.padStart(2, '0')}-${newRocDate.day.padStart(2, '0')}`;
      setFormData({ ...formData, birthDate: formattedDate });
    }
  };

  const handleSubmit = () => {
    // 確保所有數據都被傳遞,包括可能為0的monthlyIncome
    onUpdate({
      ...formData,
      monthlyIncome: formData.monthlyIncome
    });
    onNext();
  };

  const isFormValid = () => {
    if (planType === 'child') {
      // 幼兒保險規劃只需要出生年月日和性別
      return formData.birthDate && formData.gender;
    }
    // 成人保險規劃需要所有欄位
    return formData.birthDate && formData.gender && formData.monthlyIncome > 0 && formData.maritalStatus;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-bold text-gray-900">基本資料</h2>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <i className="ri-information-line"></i>
            <span>步驟 1/6</span>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-teal-500 h-2 rounded-full transition-all duration-300" style={{ width: '16.67%' }}></div>
        </div>
      </div>

      <div className="space-y-6">
        {/* 出生年月日 - 民國格式 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            出生年月日 <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">民國年</label>
              <input
                type="number"
                placeholder="85"
                value={rocDate.year}
                onChange={(e) => handleRocDateChange('year', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                min="1"
                max="999"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">月</label>
              <input
                type="number"
                placeholder="1-12"
                value={rocDate.month}
                onChange={(e) => handleRocDateChange('month', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                min="1"
                max="12"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">日</label>
              <input
                type="number"
                placeholder="1-31"
                value={rocDate.day}
                onChange={(e) => handleRocDateChange('day', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                min="1"
                max="31"
              />
            </div>
          </div>
        </div>

        {/* 性別 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            性別 <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, gender: 'male' })}
              className={`px-6 py-4 rounded-lg border-2 transition-all whitespace-nowrap cursor-pointer ${
                formData.gender === 'male'
                  ? 'border-teal-500 bg-teal-50 text-teal-700'
                  : 'border-gray-300 hover:border-teal-300'
              }`}
            >
              <i className="ri-men-line text-2xl mb-2"></i>
              <div className="font-medium">男性</div>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, gender: 'female' })}
              className={`px-6 py-4 rounded-lg border-2 transition-all whitespace-nowrap cursor-pointer ${
                formData.gender === 'female'
                  ? 'border-teal-500 bg-teal-50 text-teal-700'
                  : 'border-gray-300 hover:border-teal-300'
              }`}
            >
              <i className="ri-women-line text-2xl mb-2"></i>
              <div className="font-medium">女性</div>
            </button>
          </div>
        </div>

        {/* 平均月薪收入 - 只在成人保險規劃時顯示 */}
        {planType === 'adult' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              平均月薪收入 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">NT$</span>
              <input
                type="number"
                value={formData.monthlyIncome || ''}
                onChange={(e) => setFormData({ ...formData, monthlyIncome: parseInt(e.target.value) || 0 })}
                placeholder="請輸入月薪"
                className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                min="0"
              />
            </div>
          </div>
        )}

        {/* 婚姻狀況 - 只在成人保險規劃時顯示 */}
        {planType === 'adult' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              婚姻狀況 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, maritalStatus: 'single' })}
                className={`px-6 py-4 rounded-lg border-2 transition-all whitespace-nowrap cursor-pointer ${
                  formData.maritalStatus === 'single'
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-gray-300 hover:border-teal-300'
                }`}
              >
                <i className="ri-user-line text-2xl mb-2"></i>
                <div className="font-medium">單身</div>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, maritalStatus: 'married' })}
                className={`px-6 py-4 rounded-lg border-2 transition-all whitespace-nowrap cursor-pointer ${
                  formData.maritalStatus === 'married'
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-gray-300 hover:border-teal-300'
                }`}
              >
                <i className="ri-parent-line text-2xl mb-2"></i>
                <div className="font-medium">已婚</div>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={!isFormValid()}
          className={`px-8 py-3 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer ${
            isFormValid()
              ? 'bg-teal-500 text-white hover:bg-teal-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          下一步
          <i className="ri-arrow-right-line ml-2"></i>
        </button>
      </div>
    </div>
  );
}
