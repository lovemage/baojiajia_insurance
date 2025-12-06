
import { useState } from 'react';

type Props = {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
};

export default function OtherNeedsStep({ data, onUpdate, onNext, onBack }: Props) {
  const [currentStep, setCurrentStep] = useState(1);
  const [insuranceKnowledge, setInsuranceKnowledge] = useState(data.insuranceKnowledge || '');
  const [healthStatus, setHealthStatus] = useState(data.healthStatus || '');
  const [specialNeeds, setSpecialNeeds] = useState(data.specialNeeds || '');
  const [policyCheckExpectations, setPolicyCheckExpectations] = useState<string[]>(data.policyCheckExpectations || []);
  const [monthlyBudget, setMonthlyBudget] = useState(data.monthlyBudget || '');
  
  // 判斷是否為幼兒保險規劃
  const isChildPlan = data.planType === 'child';

  const handleNext = () => {
    if (currentStep === 1) {
      // 如果選擇「沒有規劃過保障」，跳過保單健診期望，直接到預算問題
      if (insuranceKnowledge === 'E') {
        setCurrentStep(3);
      } else {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else {
      onUpdate({ 
        insuranceKnowledge, 
        policyCheckExpectations,
        monthlyBudget
      });
      onNext();
    }
  };

  const handleBack = () => {
    if (currentStep === 3) {
      // 如果之前選擇「沒有規劃過保障」，直接回到第一題
      if (insuranceKnowledge === 'E') {
        setCurrentStep(1);
      } else {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      setCurrentStep(1);
    } else {
      onBack();
    }
  };

  const toggleExpectation = (value: string) => {
    if (policyCheckExpectations.includes(value)) {
      setPolicyCheckExpectations(policyCheckExpectations.filter(item => item !== value));
    } else {
      setPolicyCheckExpectations([...policyCheckExpectations, value]);
    }
  };

  const isStep1Valid = insuranceKnowledge !== '';
  const isStep2Valid = policyCheckExpectations.length > 0;
  const isStep3Valid = monthlyBudget !== '';

  // 計算當前問題編號（考慮跳過邏輯）
  const getCurrentQuestionNumber = () => {
    if (currentStep === 1) return '1/3';
    if (currentStep === 2) return '2/3';
    if (currentStep === 3 && insuranceKnowledge === 'E') return '2/2';
    return '3/3';
  };

  // 計算進度條百分比
  const getProgressPercentage = () => {
    if (currentStep === 1) return 33.33;
    if (currentStep === 2) return 66.66;
    if (currentStep === 3 && insuranceKnowledge === 'E') return 100;
    return 100;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
        {/* 左側輔助資訊 */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-8 lg:p-12 flex items-center">
          <div className="w-full space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <i className="ri-file-list-3-line text-emerald-600 mr-2"></i>
                保單健診的重要性
              </h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start">
                  <i className="ri-check-line text-emerald-600 mr-2 mt-1"></i>
                  <span>檢視保障是否符合現況需求</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-emerald-600 mr-2 mt-1"></i>
                  <span>找出保障缺口並及時補足</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-emerald-600 mr-2 mt-1"></i>
                  <span>避免重複投保浪費保費</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-emerald-600 mr-2 mt-1"></i>
                  <span>優化保險配置提高效益</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <i className="ri-information-line text-emerald-600 mr-2"></i>
                專業建議
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                定期檢視保單內容，確保保障隨著人生階段調整。專業的保單健診能幫助您找出最適合的保險規劃，讓每一分保費都發揮最大效益。
              </p>
            </div>
          </div>
        </div>

        {/* 右側問題區域 */}
        <div className="p-8 lg:p-12 flex flex-col">
          {currentStep === 1 ? (
            <>
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-purple-600">問題 {getCurrentQuestionNumber()}</span>
                  <span className="text-sm text-gray-500">其他需求評估</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${getProgressPercentage()}%` }}></div>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  保險了解程度
                </h2>
                <p className="text-lg text-gray-600">
                  {isChildPlan 
                    ? '過去有幫孩子規劃過保險嗎？請問您是否了解孩子的保障內容？'
                    : '過去是否規劃過保險呢？請問您是否清楚有哪些保障內容？'
                  }
                </p>
              </div>

              <div className="flex-1 flex flex-col justify-center">
                <div className="space-y-3">
                  {[
                    { value: 'A', label: '完全清楚' },
                    { value: 'B', label: '大概知道，但細節不清楚' },
                    { value: 'C', label: '不太清楚，別人幫我規劃的' },
                    { value: 'D', label: '完全不了解' },
                    { value: 'E', label: '沒有規劃過保障' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setInsuranceKnowledge(option.value)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                        insuranceKnowledge === option.value
                          ? 'border-purple-600 bg-purple-50 text-purple-900'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center flex-shrink-0 ${
                          insuranceKnowledge === option.value ? 'border-purple-600 bg-purple-600' : 'border-gray-300'
                        }`}>
                          {insuranceKnowledge === option.value && (
                            <i className="ri-check-line text-white text-sm"></i>
                          )}
                        </div>
                        <span className="font-medium">{option.label}</span>
                      </div>
                    </button>
                  ))}
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
                  className="px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium whitespace-nowrap cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  下一步
                  <i className="ri-arrow-right-line ml-2"></i>
                </button>
              </div>
            </>
          ) : currentStep === 2 ? (
            <>
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-emerald-600">問題 {getCurrentQuestionNumber()}</span>
                  <span className="text-sm text-gray-500">其他需求評估</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                  <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${getProgressPercentage()}%` }}></div>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  保單健診期望
                </h2>
                <p className="text-lg text-gray-600">
                  我們也有提供保單健診的服務，可能獲得以下效果，哪些是您期望獲得的效果？（複選）
                </p>
              </div>

              <div className="flex-1 flex flex-col justify-center">
                <div className="space-y-3">
                  {[
                    { value: 'A', label: '降低保費，提高保障' },
                    { value: 'B', label: '避免買到「地雷保單」' },
                    { value: 'C', label: '避免您重複或過度投保' },
                    { value: 'D', label: '審視保障內容符合您的個人需求' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => toggleExpectation(option.value)}
                      className={`w-full text-left px-6 py-4 rounded-xl border-2 transition-all cursor-pointer ${
                        policyCheckExpectations.includes(option.value)
                          ? 'border-emerald-600 bg-emerald-50'
                          : 'border-gray-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center mr-3 ${
                          policyCheckExpectations.includes(option.value)
                            ? 'border-emerald-600 bg-emerald-600'
                            : 'border-gray-300'
                        }`}>
                          {policyCheckExpectations.includes(option.value) && (
                            <i className="ri-check-line text-white text-sm"></i>
                          )}
                        </div>
                        <span className="font-medium text-gray-900">{option.label}</span>
                      </div>
                    </button>
                  ))}
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
                  className="px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium whitespace-nowrap cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed"
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
                  <span className="text-sm font-medium text-emerald-600">問題 {getCurrentQuestionNumber()}</span>
                  <span className="text-sm text-gray-500">其他需求評估</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                  <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${getProgressPercentage()}%` }}></div>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  每月預算
                </h2>
                <p className="text-lg text-gray-600">
                  您預期可投入風險規劃的「每月」預算？
                </p>
              </div>

              <div className="flex-1 flex flex-col justify-center">
                <div className="space-y-3">
                  {[
                    { value: 'A', label: '3000 以下' },
                    { value: 'B', label: '3000~5000 元' },
                    { value: 'C', label: '5000~10000 元' },
                    { value: 'D', label: '10000 以上' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setMonthlyBudget(option.value)}
                      className={`w-full text-left px-6 py-4 rounded-xl border-2 transition-all cursor-pointer ${
                        monthlyBudget === option.value
                          ? 'border-emerald-600 bg-emerald-50'
                          : 'border-gray-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                          monthlyBudget === option.value
                            ? 'border-emerald-600 bg-emerald-600'
                            : 'border-gray-300'
                        }`}>
                          {monthlyBudget === option.value && (
                            <i className="ri-check-line text-white text-sm"></i>
                          )}
                        </div>
                        <span className="font-medium text-gray-900">{option.label}</span>
                      </div>
                    </button>
                  ))}
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
                  disabled={!isStep3Valid}
                  className="px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium whitespace-nowrap cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  查看分析結果
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
