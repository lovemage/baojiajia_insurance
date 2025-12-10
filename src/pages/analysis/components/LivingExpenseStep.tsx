
import { useState } from 'react';

type Props = {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
};

export default function LivingExpenseStep({ data, onUpdate, onNext, onBack }: Props) {
  const [livingExpense, setLivingExpense] = useState(data.cancerLivingExpense || 40000);

  const handleNext = () => {
    onUpdate({ 
      livingExpense: livingExpense,
      cancerLivingExpense: livingExpense 
    });
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
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <i className="ri-shopping-basket-line text-pink-600 mr-2"></i>
                常見生活開銷項目
              </h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start">
                  <i className="ri-home-4-line text-pink-600 mr-2 mt-0.5"></i>
                  <span>房租或房貸</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-lightbulb-line text-pink-600 mr-2 mt-0.5"></i>
                  <span>水電瓦斯等公用事業費</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-bank-card-line text-pink-600 mr-2 mt-0.5"></i>
                  <span>貸款費用</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-car-line text-pink-600 mr-2 mt-0.5"></i>
                  <span>交通費用</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-shopping-cart-line text-pink-600 mr-2 mt-0.5"></i>
                  <span>家庭日常開銷</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <i className="ri-information-line text-pink-600 mr-2"></i>
                為什麼需要生活費補償？
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <i className="ri-check-line text-pink-600 mr-2 mt-1"></i>
                  <span>治療期間仍需維持家庭開銷</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-pink-600 mr-2 mt-1"></i>
                  <span>避免因經濟壓力影響治療品質</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-pink-600 mr-2 mt-1"></i>
                  <span>確保家人生活不受影響</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 右側問題區域 */}
        <div className="p-8 lg:p-12 flex flex-col">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-pink-600">問題 2/3</span>
              <span className="text-sm text-gray-500">重症需求評估</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
              <div className="bg-pink-600 h-2 rounded-full" style={{ width: '66.66%' }}></div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              每月生活開銷
            </h2>
            <p className="text-lg text-gray-600">
              {isChildPlan
                ? '為了照顧孩子暫時放下工作，但日常的生活開銷仍需要持續支出，您每個月的生活開銷是多少呢？'
                : '當罹患癌症，若需要休養一年無法工作，您每個月的生活開銷是多少？'
              }
            </p>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center bg-pink-50 rounded-2xl px-8 py-6 mb-4">
                <span className="text-5xl font-bold text-pink-600">
                  {livingExpense.toLocaleString()}
                </span>
                <span className="text-2xl text-gray-600 ml-3">元/月</span>
              </div>
              <p className="text-sm text-gray-500">
                每月生活開銷補償
              </p>
            </div>

            <div className="mb-8">
              <input
                type="range"
                min="10000"
                max="200000"
                step="1000"
                value={livingExpense}
                onChange={(e) => setLivingExpense(parseInt(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #db2777 0%, #db2777 ${((livingExpense - 10000) / 190000) * 100}%, #e5e7eb ${((livingExpense - 10000) / 190000) * 100}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>1 萬</span>
                <span>20 萬</span>
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
