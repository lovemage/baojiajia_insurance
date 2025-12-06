import { useState } from 'react';
import Navigation from '../../components/feature/Navigation';
import PlanTypeStep from './components/PlanTypeStep';
import BasicInfoStep from './components/BasicInfoStep';
import MedicalNeedsStep from './components/MedicalNeedsStep';
import DailyCompensationStep from './components/DailyCompensationStep';
import SurgerySubsidyStep from './components/SurgerySubsidyStep';
import SalaryLossStep from './components/SalaryLossStep';
import LivingExpenseStep from './components/LivingExpenseStep';
import TreatmentCostStep from './components/TreatmentCostStep';
import LongTermCareStep from './components/LongTermCareStep';
import LifeInsuranceStep from './components/LifeInsuranceStep';
import OtherNeedsStep from './components/OtherNeedsStep';
import ResultStep from './components/ResultStep';

export default function AnalysisPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>({});

  const updateFormData = (data: any) => {
    setFormData({ ...formData, ...data });
  };

  const nextStep = () => setCurrentStep(currentStep + 1);
  const prevStep = () => setCurrentStep(currentStep - 1);
  
  // 判斷是否為幼兒保險規劃
  const isChildPlan = formData.planType === 'child';

  const renderStep = () => {
    switch (currentStep) {
      // 第零步：選擇保險類型
      case 0:
        return <PlanTypeStep onSelect={(type) => { updateFormData({ planType: type }); nextStep(); }} />;
      
      // 第一部分：基本資料
      case 1:
        return <BasicInfoStep data={formData} onUpdate={updateFormData} onNext={nextStep} />;
      
      // 第二部分：醫療需求（3題）
      case 2:
        return <MedicalNeedsStep data={formData} onUpdate={updateFormData} onNext={nextStep} onBack={prevStep} />;
      case 3:
        return <DailyCompensationStep data={formData} onUpdate={updateFormData} onNext={nextStep} onBack={prevStep} />;
      case 4:
        return <SurgerySubsidyStep data={formData} onUpdate={updateFormData} onNext={nextStep} onBack={prevStep} />;
      
      // 第三部分：重症需求（3題）
      case 5:
        return <SalaryLossStep data={formData} onUpdate={updateFormData} onNext={nextStep} onBack={prevStep} />;
      case 6:
        return <LivingExpenseStep data={formData} onUpdate={updateFormData} onNext={nextStep} onBack={prevStep} />;
      case 7:
        return <TreatmentCostStep data={formData} onUpdate={updateFormData} onNext={nextStep} onBack={prevStep} />;
      
      // 第四部分：長照需求（1題）
      case 8:
        return <LongTermCareStep data={formData} onUpdate={updateFormData} onNext={nextStep} onBack={prevStep} />;
      
      // 第五部分：壽險需求（2題）- 幼兒保險規劃跳過此步驟
      case 9:
        if (isChildPlan) {
          // 幼兒保險規劃跳過壽險需求，直接進入其他需求
          setCurrentStep(10);
          return null;
        }
        return <LifeInsuranceStep data={formData} onUpdate={updateFormData} onNext={nextStep} onBack={prevStep} />;
      
      // 第六部分：其他需求（3題）
      case 10:
        return <OtherNeedsStep data={formData} onUpdate={updateFormData} onNext={nextStep} onBack={prevStep} />;
      
      // 結果頁面
      case 11:
        return <ResultStep data={formData} onBack={prevStep} />;
      
      default:
        return <PlanTypeStep onSelect={(type) => { updateFormData({ planType: type }); nextStep(); }} />;
    }
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {renderStep()}
        </div>
      </div>
    </>
  );
}
