
import { useState, useEffect } from 'react';

type Props = {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
};

export default function SalaryLossStep({ data, onUpdate, onNext, onBack }: Props) {
  // 根據月薪計算初始值（月薪 × 12）
  const initialValue = data.monthlyIncome ? data.monthlyIncome * 12 : 600000;
  const [salaryLoss, setSalaryLoss] = useState(data.cancerSalaryLoss || initialValue);

  // 當組件載入時，如果還沒有設定過值，使用計算出的初始值
  useEffect(() => {
    if (!data.cancerSalaryLoss && data.monthlyIncome) {
      setSalaryLoss(data.monthlyIncome * 12);
    }
  }, [data.monthlyIncome, data.cancerSalaryLoss]);

  const handleNext = () => {
    onUpdate({ cancerSalaryLoss: salaryLoss });
    onNext();
  };

  // 判斷是否為幼兒保險規劃
  const isChildPlan = data.planType === 'child';

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
        {/* 左側輔助資訊 */}
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-8 lg:p-12 flex items-center">
          <div className="w-full space-y-6">
            <div className="mb-8">
              <img
                src={isChildPlan 
                  ? "https://static.readdy.ai/image/84ccad05498cbded7957a6723736d89e/301e43cfd890b3f6b120cc1a9553894d.png"
                  : "https://static.readdy.ai/image/84ccad05498cbded7957a6723736d89e/0f6d55fb06d3368e2db435c598391710.png"
                }
                alt="薪資損失說明"
                className="w-full rounded-xl shadow-md"
              />
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <i className="ri-information-line text-pink-600 mr-2"></i>
                為什麼需要薪資補償？
              </h4>
              {isChildPlan ? (
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <i className="ri-check-line text-pink-600 mr-2 mt-1"></i>
                    <span>能暫時放下工作專心照顧孩子</span>
                  </li>
                  <li className="flex items-start">
                    <i className="ri-check-line text-pink-600 mr-2 mt-1"></i>
                    <span>避免因經濟壓力影響治療</span>
                  </li>
                  <li className="flex items-start">
                    <i className="ri-check-line text-pink-600 mr-2 mt-1"></i>
                    <span>幼童罹癌多為治療時間較長的癌症</span>
                  </li>
                </ul>
              ) : (
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <i className="ri-check-line text-pink-600 mr-2 mt-1"></i>
                    <span>癌症治療期間難以正常工作</span>
                  </li>
                  <li className="flex items-start">
                    <i className="ri-check-line text-pink-600 mr-2 mt-1"></i>
                    <span>化療、放療會造成身體虛弱</span>
                  </li>
                  <li className="flex items-start">
                    <i className="ri-check-line text-pink-600 mr-2 mt-1"></i>
                    <span>需要長時間休養恢復體力</span>
                  </li>
                  <li className="flex items-start">
                    <i className="ri-check-line text-pink-600 mr-2 mt-1"></i>
                    <span>避免因經濟壓力影響治療</span>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* 右側問題區域 */}
        <div className="p-8 lg:p-12 flex flex-col">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-pink-600">問題 1/3</span>
              <span className="text-sm text-gray-500">重症需求評估</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
              <div className="bg-pink-600 h-2 rounded-full" style={{ width: '33.33%' }}></div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              薪資損失補償
            </h2>
            <p className="text-lg text-gray-600">
              {isChildPlan 
                ? '為了照顧孩子，工作被迫停擺一年的時間，您的薪資損失是多少？'
                : '當罹患癌症，難以一邊工作，一邊治療，若需要休養一年無法工作，您的薪資損失是多少？'
              }
            </p>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center bg-pink-50 rounded-2xl px-8 py-6 mb-4">
                <span className="text-5xl font-bold text-pink-600">
                  {salaryLoss.toLocaleString()}
                </span>
                <span className="text-2xl text-gray-600 ml-3">元</span>
              </div>
              <p className="text-sm text-gray-500">
                建議至少規劃一年的薪資
              </p>
            </div>

            <div className="mb-8">
              <input
                type="range"
                min="10000"
                max="5000000"
                step="10000"
                value={salaryLoss}
                onChange={(e) => setSalaryLoss(parseInt(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #db2777 0%, #db2777 ${((salaryLoss - 10000) / 4990000) * 100}%, #e5e7eb ${((salaryLoss - 10000) / 4990000) * 100}%, #e5e7eb 100%)`
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
