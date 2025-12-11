
import { useState } from 'react';

type Props = {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
};

export default function TreatmentCostStep({ data, onUpdate, onNext, onBack }: Props) {
  const [treatmentCost, setTreatmentCost] = useState(data.cancerTreatmentCost || 1000000);
  
  // 判斷是否為幼兒保險規劃
  const isChildPlan = data.planType === 'child';

  const handleNext = () => {
    onUpdate({ 
      treatmentCost: treatmentCost,
      cancerTreatmentCost: treatmentCost 
    });
    onNext();
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
        {/* 左側輔助資訊 */}
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-8 lg:p-12 flex items-center">
          <div className="w-full space-y-6">
            <div className="mb-8">
              <img
                src={isChildPlan 
                  ? "/images/analysis/treatment-cost-child.png"
                  : "/images/analysis/treatment-cost-adult.png"
                }
                alt="治療費用說明"
                className="w-full rounded-xl shadow-md"
              />
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <i className="ri-information-line text-pink-600 mr-2"></i>
                為什麼需要保障？
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <i className="ri-check-line text-pink-600 mr-2 mt-1"></i>
                  <span>新藥物療效更好但多為自費</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-pink-600 mr-2 mt-1"></i>
                  <span>能提高治癒率和存活率</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-pink-600 mr-2 mt-1"></i>
                  <span>減少治療副作用和痛苦</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 右側問題區域 */}
        <div className="p-8 lg:p-12 flex flex-col">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-pink-600">問題 3/3</span>
              <span className="text-sm text-gray-500">重症需求評估</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
              <div className="bg-pink-600 h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              治療費用補償
            </h2>
            <p className="text-lg text-gray-600">
              隨著癌症用藥日新月異，想要使用新的藥品、技術治療，大多數需要自費，您期望得到多少補償？
            </p>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center bg-pink-50 rounded-2xl px-8 py-6 mb-4">
                <span className="text-5xl font-bold text-pink-600">
                  {treatmentCost.toLocaleString()}
                </span>
                <span className="text-2xl text-gray-600 ml-3">元</span>
              </div>
              <p className="text-sm text-gray-500">
                癌症治療費用補償
              </p>
            </div>

            <div className="mb-8">
              <input
                type="range"
                min="10000"
                max="5000000"
                step="10000"
                value={treatmentCost}
                onChange={(e) => setTreatmentCost(parseInt(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #db2777 0%, #db2777 ${((treatmentCost - 10000) / 4990000) * 100}%, #e5e7eb ${((treatmentCost - 10000) / 4990000) * 100}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>1 萬</span>
                <span>500 萬</span>
              </div>
            </div>
          </div>

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
              className="px-8 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-medium whitespace-nowrap cursor-pointer"
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
