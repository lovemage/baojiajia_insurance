import { useState } from 'react';

type Props = {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
};

export default function SurgerySubsidyStep({ data, onUpdate, onNext, onBack }: Props) {
  const [selectedLevel, setSelectedLevel] = useState(data.surgerySubsidy || '');

  const subsidyLevels = [
    {
      id: 'partial',
      title: '部分補貼',
      amount: '10~20萬',
      description: '基本的自費醫療補貼，適合預算有限者',
      icon: 'ri-shield-line'
    },
    {
      id: 'recommended',
      title: '建議補貼',
      amount: '20~30萬',
      description: '較完整的醫療補貼，涵蓋大部分自費項目',
      icon: 'ri-shield-check-line',
      recommended: true
    },
    {
      id: 'complete',
      title: '完整補貼',
      amount: '30~40萬',
      description: '全方位的醫療補貼，無需擔心費用問題',
      icon: 'ri-shield-star-line'
    }
  ];

  const handleNext = () => {
    if (selectedLevel) {
      onUpdate({ surgerySubsidy: selectedLevel });
      onNext();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
        {/* 左側輔助資訊 */}
        <div className="bg-gradient-to-br from-teal-50 to-blue-50 p-8 lg:p-12 flex items-center">
          <div className="w-full space-y-6">
            <div className="mb-6">
              <img
                src="/images/analysis/surgery-subsidy.png"
                alt="自費醫療項目說明"
                className="w-full rounded-lg shadow-md"
              />
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <i className="ri-information-line text-teal-600 mr-2"></i>
                為什麼需要手術補貼？
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <i className="ri-check-line text-teal-600 mr-2 mt-1"></i>
                  <span>隨著醫療技術進步，自費醫療需求增加</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-teal-600 mr-2 mt-1"></i>
                  <span>更好的治療選擇往往需要自費</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-teal-600 mr-2 mt-1"></i>
                  <span>不必因經濟考量放棄更好的治療</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 右側問題區 */}
        <div className="p-8 lg:p-12 flex flex-col">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-teal-600">問題 3/3</span>
              <span className="text-sm text-gray-500">醫療需求評估</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
              <div className="bg-teal-600 h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              手術醫療補貼
            </h2>
            <p className="text-lg text-gray-600">
              隨著醫療技術、儀器、材料的進步，自費醫療的需求增加，您希望在需要時獲得多少比例的補貼？
            </p>
          </div>

          <div className="flex-1 flex flex-col justify-center space-y-4">
            {subsidyLevels.map((level) => (
              <button
                key={level.id}
                onClick={() => setSelectedLevel(level.id)}
                className={`relative p-5 rounded-xl border-2 transition-all text-left cursor-pointer ${
                  selectedLevel === level.id
                    ? 'border-teal-600 bg-teal-50 shadow-lg'
                    : 'border-gray-200 hover:border-teal-300 hover:shadow-md'
                }`}
              >
                {level.recommended && (
                  <div className="absolute -top-3 right-6 bg-gradient-to-r from-teal-600 to-blue-600 text-white px-4 py-1 rounded-full text-xs font-semibold">
                    ✨ 推薦方案
                  </div>
                )}
                <div className="flex items-start">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                    selectedLevel === level.id ? 'bg-teal-100' : 'bg-gray-100'
                  }`}>
                    <i className={`${level.icon} text-2xl ${
                      selectedLevel === level.id ? 'text-teal-600' : 'text-gray-400'
                    }`}></i>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-lg font-bold text-gray-900">{level.title}</h3>
                      {selectedLevel === level.id && (
                        <div className="w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center">
                          <i className="ri-check-line text-white text-sm"></i>
                        </div>
                      )}
                    </div>
                    <p className="text-xl font-bold text-teal-600 mb-1">{level.amount}</p>
                    <p className="text-sm text-gray-600">{level.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* 按鈕 */}
          <div className="flex justify-between mt-8">
            <button
              onClick={onBack}
              className="px-8 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium whitespace-nowrap cursor-pointer"
            >
              <i className="ri-arrow-left-line mr-2"></i>
              上一步
            </button>
            <button
              onClick={handleNext}
              disabled={!selectedLevel}
              className={`px-8 py-3 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
                !selectedLevel
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-teal-600 text-white hover:bg-teal-700'
              }`}
            >
              下一步
              <i className="ri-arrow-right-line ml-2"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
