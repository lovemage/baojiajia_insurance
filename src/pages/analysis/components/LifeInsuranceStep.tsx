import { useState } from 'react';

type Props = {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
};

export default function LifeInsuranceStep({ data, onUpdate, onNext, onBack }: Props) {
  const [currentStep, setCurrentStep] = useState(1);
  const [debtAmount, setDebtAmount] = useState(data.debtAmount || '');
  const [familyCareAmount, setFamilyCareAmount] = useState(data.familyCareAmount || '');

  const handleNext = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else {
      onUpdate({ 
        personalDebt: parseInt(debtAmount) || 0,
        familyCare: parseInt(familyCareAmount) || 0,
        debtAmount: parseInt(debtAmount) || 0, 
        familyCareAmount: parseInt(familyCareAmount) || 0 
      });
      onNext();
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else {
      onBack();
    }
  };

  const isStep1Valid = debtAmount && parseInt(debtAmount) >= 0;
  const isStep2Valid = familyCareAmount && parseInt(familyCareAmount) >= 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
        {/* 左側輔助資訊 */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-8 lg:p-12 flex items-center">
          <div className="w-full space-y-6">
            {/* 參考圖片 */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              <img 
                src="https://static.readdy.ai/image/84ccad05498cbded7957a6723736d89e/cdcb7ab9aba9613ba36c4c807e3b9b9e.png"
                alt="壽險保障說明"
                className="w-full h-auto object-cover"
              />
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <i className="ri-shield-check-line text-blue-600 mr-2"></i>
                為什麼需要壽險保障？
              </h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start">
                  <i className="ri-check-line text-blue-600 mr-2 mt-1"></i>
                  <span>清償未償債務，避免家人負擔</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-blue-600 mr-2 mt-1"></i>
                  <span>提供家人生活費用保障</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-blue-600 mr-2 mt-1"></i>
                  <span>確保子女教育金無虞</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-blue-600 mr-2 mt-1"></i>
                  <span>維持家庭生活品質</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 右側問題區域 */}
        <div className="p-8 lg:p-12 flex flex-col">
          {currentStep === 1 ? (
            <>
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-blue-600">問題 1/2</span>
                  <span className="text-sm text-gray-500">壽險需求評估</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '50%' }}></div>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  個人債務總額
                </h2>
                <p className="text-lg text-gray-600">
                  您目前的個人債務總額（房貸、車貸…等）？
                </p>
              </div>

              <div className="flex-1 flex flex-col justify-center">
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    請輸入債務總額（萬元）
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={debtAmount}
                      onChange={(e) => setDebtAmount(e.target.value)}
                      placeholder="例如：500"
                      className="w-full px-6 py-4 text-2xl border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none transition-colors"
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xl text-gray-400">
                      萬
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    如果沒有債務，請輸入 0
                  </p>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={handleBack}
                  className="px-8 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-arrow-left-line mr-2"></i>
                  上一步
                </button>
                <button
                  onClick={handleNext}
                  disabled={!isStep1Valid}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  下一步
                  <i className="ri-arrow-right-line ml-2"></i>
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-blue-600">問題 2/2</span>
                  <span className="text-sm text-gray-500">壽險需求評估</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  家人照顧金
                </h2>
                <p className="text-lg text-gray-600">
                  面對身故，您期望預留多少錢繼續照顧家人？
                </p>
              </div>

              <div className="flex-1 flex flex-col justify-center">
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    請輸入家人照顧金（萬元）
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="10"
                      value={familyCareAmount}
                      onChange={(e) => setFamilyCareAmount(e.target.value)}
                      placeholder="例如：300"
                      className="w-full px-6 py-4 text-2xl border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none transition-colors"
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xl text-gray-400">
                      萬
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    建議為年收入的 5-10 倍
                  </p>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={handleBack}
                  className="px-8 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-arrow-left-line mr-2"></i>
                  上一步
                </button>
                <button
                  onClick={handleNext}
                  disabled={!isStep2Valid}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  下一步
                  <i className="ri-arrow-right-line ml-2"></i>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
