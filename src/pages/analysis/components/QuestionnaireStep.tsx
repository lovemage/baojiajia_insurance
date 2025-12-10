import { useState } from 'react';
import { AnalysisData } from '../page';

type Props = {
  onComplete: (data: AnalysisData) => void;
};

export default function QuestionnaireStep({ onComplete }: Props) {
  const [formData, setFormData] = useState<AnalysisData>({
    age: '',
    familyStatus: '',
    income: '',
    hasChildren: '',
    currentInsurance: [],
    concerns: [],
    budget: '',
    priority: ''
  });

  const [currentQuestion, setCurrentQuestion] = useState(0);

  const questions = [
    {
      id: 'age',
      question: '請問您的年齡層？',
      type: 'single',
      options: [
        { value: '20-30', label: '20-30歲' },
        { value: '31-40', label: '31-40歲' },
        { value: '41-50', label: '41-50歲' },
        { value: '51-60', label: '51-60歲' },
        { value: '60+', label: '60歲以上' }
      ]
    },
    {
      id: 'familyStatus',
      question: '您的家庭狀況？',
      type: 'single',
      options: [
        { value: 'single', label: '單身' },
        { value: 'married', label: '已婚' },
        { value: 'divorced', label: '離婚' }
      ]
    },
    {
      id: 'hasChildren',
      question: '您是否有子女？',
      type: 'single',
      options: [
        { value: 'yes', label: '是' },
        { value: 'no', label: '否' }
      ]
    },
    {
      id: 'income',
      question: '您的年收入範圍？',
      type: 'single',
      options: [
        { value: 'low', label: '50萬以下' },
        { value: 'medium', label: '50-100萬' },
        { value: 'high', label: '100萬以上' }
      ]
    },
    {
      id: 'currentInsurance',
      question: '您目前已有哪些保險？（可複選）',
      type: 'multiple',
      options: [
        { value: 'life', label: '人壽保險' },
        { value: 'medical', label: '醫療保險' },
        { value: 'accident', label: '意外保險' },
        { value: 'critical', label: '重大疾病保險' },
        { value: 'none', label: '尚未投保' }
      ]
    },
    {
      id: 'concerns',
      question: '您最關注哪些保障？（可複選）',
      type: 'multiple',
      options: [
        { value: 'medical', label: '醫療保障' },
        { value: 'critical', label: '重大疾病' },
        { value: 'accident', label: '意外風險' },
        { value: 'retirement', label: '退休規劃' },
        { value: 'savings', label: '儲蓄理財' },
        { value: 'family', label: '家庭保障' }
      ]
    },
    {
      id: 'budget',
      question: '您的保險預算？',
      type: 'single',
      options: [
        { value: 'low', label: '每月3,000元以下' },
        { value: 'medium', label: '每月3,000-10,000元' },
        { value: 'high', label: '每月10,000元以上' }
      ]
    },
    {
      id: 'priority',
      question: '您的保險規劃重點？',
      type: 'single',
      options: [
        { value: 'protection', label: '保障優先' },
        { value: 'savings', label: '儲蓄優先' },
        { value: 'balanced', label: '保障與儲蓄並重' }
      ]
    }
  ];

  const handleOptionClick = (questionId: string, value: string, type: string) => {
    if (type === 'single') {
      setFormData(prev => ({
        ...prev,
        [questionId]: value
      }));
    } else {
      setFormData(prev => {
        const currentValues = prev[questionId as keyof AnalysisData] as string[];
        const newValues = currentValues.includes(value)
          ? currentValues.filter(v => v !== value)
          : [...currentValues, value];
        return {
          ...prev,
          [questionId]: newValues
        };
      });
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      onComplete(formData);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const isCurrentQuestionAnswered = () => {
    const question = questions[currentQuestion];
    const value = formData[question.id as keyof AnalysisData];
    
    if (question.type === 'single') {
      return value !== '';
    } else {
      return Array.isArray(value) && value.length > 0;
    }
  };

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-teal-600">
            問題 {currentQuestion + 1} / {questions.length}
          </span>
          <span className="text-sm text-gray-500">{Math.round(progress)}% 完成</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-teal-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
          {currentQ.question}
        </h2>

        <div className="space-y-3">
          {currentQ.options && Array.isArray(currentQ.options) && currentQ.options.map((option) => {
            const isSelected = currentQ.type === 'single'
              ? formData[currentQ.id as keyof AnalysisData] === option.value
              : (formData[currentQ.id as keyof AnalysisData] as string[]).includes(option.value);

            return (
              <button
                key={option.value}
                onClick={() => handleOptionClick(currentQ.id, option.value, currentQ.type)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'border-teal-600 bg-teal-50 text-teal-900'
                    : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'border-teal-600 bg-teal-600' : 'border-gray-300'
                  }`}>
                    {isSelected && (
                      <i className="ri-check-line text-white text-sm"></i>
                    )}
                  </div>
                  <span className="font-medium">{option.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            currentQuestion === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <i className="ri-arrow-left-line mr-2"></i>
          上一題
        </button>

        <button
          onClick={handleNext}
          disabled={!isCurrentQuestionAnswered()}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            !isCurrentQuestionAnswered()
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-teal-600 text-white hover:bg-teal-700'
          }`}
        >
          {currentQuestion === questions.length - 1 ? '查看分析結果' : '下一題'}
          <i className="ri-arrow-right-line ml-2"></i>
        </button>
      </div>
    </div>
  );
}
