import { useState } from 'react';

type Props = {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
};

export default function DailyCompensationStep({ data, onUpdate, onNext, onBack }: Props) {
  const [amount, setAmount] = useState(data.dailyCompensation || 1000);
  const [inputValue, setInputValue] = useState(data.dailyCompensation?.toString() || '1000');

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setAmount(value);
    setInputValue(value.toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    const numValue = parseInt(value) || 0;
    if (numValue >= 100 && numValue <= 10000) {
      setAmount(numValue);
    }
  };

  const handleNext = () => {
    onUpdate({ dailyCompensation: amount });
    onNext();
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
        {/* 左側輔助資訊 */}
        <div className="bg-gradient-to-br from-teal-50 to-blue-50 p-8 lg:p-12 flex items-center">
          <div className="w-full space-y-6">
            <div className="mb-6">
              <img
                src="https://static.readdy.ai/image/84ccad05498cbded7957a6723736d89e/a97382e6e8942e374a4e8ba32ee8f123.png"
                alt="住院日額補償說明"
                className="w-full rounded-lg shadow-md"
              />
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <i className="ri-information-line text-teal-600 mr-2"></i>
                為什麼需要住院日額？
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <i className="ri-check-line text-teal-600 mr-2 mt-1"></i>
                  <span>補償住院期間的薪資損失</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-teal-600 mr-2 mt-1"></i>
                  <span>支付看護費用或家人照顧的機會成本</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-teal-600 mr-2 mt-1"></i>
                  <span>負擔住院期間的額外開銷</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 右側問題區 */}
        <div className="p-8 lg:p-12 flex flex-col">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-teal-600">問題 2/3</span>
              <span className="text-sm text-gray-500">醫療需求評估</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
              <div className="bg-teal-600 h-2 rounded-full" style={{ width: '66%' }}></div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              住院日額補償
            </h2>
            <p className="text-lg text-gray-600">
              孩子住院時，往往是父母陪同住院伴隨薪資損失，您希望住院時獲得多少的薪資補償？
            </p>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            {/* 金額顯示 */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center bg-teal-50 rounded-2xl px-8 py-6 mb-4">
                <span className="text-5xl font-bold text-teal-600">
                  {amount.toLocaleString()}
                </span>
                <span className="text-2xl text-gray-600 ml-3">元/天</span>
              </div>
              <p className="text-sm text-gray-500">
                每住院一天可獲得 {amount.toLocaleString()} 元補償
              </p>
            </div>

            {/* 滑桿 */}
            <div className="mb-8">
              <input
                type="range"
                min="100"
                max="10000"
                step="100"
                value={amount}
                onChange={handleSliderChange}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #0d9488 0%, #0d9488 ${((amount - 100) / 9900) * 100}%, #e5e7eb ${((amount - 100) / 9900) * 100}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>100 元</span>
                <span>10,000 元</span>
              </div>
            </div>

            {/* 手動輸入 */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                或直接輸入金額（最低 100 元）
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="100"
                  max="10000"
                  step="100"
                  value={inputValue}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-lg"
                  placeholder="請輸入金額"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                  元/天
                </span>
              </div>
            </div>
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
              className="px-8 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium whitespace-nowrap cursor-pointer"
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
