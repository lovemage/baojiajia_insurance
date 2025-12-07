import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import type { User } from '@supabase/supabase-js';
import html2pdf from 'html2pdf.js';

// 預設模板樣式
const DEFAULT_STYLES = `
/* 基礎設定 */
* { box-sizing: border-box; margin: 0; padding: 0; }
.pdf-page { width: 794px; height: 1123px; position: relative; page-break-after: always; background: white; overflow: hidden; }
.pdf-page:last-child { page-break-after: avoid; }
.svg-bg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; }
.svg-bg img { width: 100%; height: 100%; object-fit: contain; }
.overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2; pointer-events: none; }
.field { position: absolute; font-family: "Microsoft JhengHei", "PingFang TC", sans-serif; font-size: 14px; color: #333; font-weight: 500; background: rgba(255,255,255,0.9); padding: 2px 8px; border-radius: 4px; }
.page-1 .name-field { top: 420px; left: 280px; font-size: 24px; font-weight: 700; }
.page-1 .date-field { top: 520px; left: 300px; font-size: 16px; }
.page-2 .f-name { top: 250px; left: 180px; }
.page-2 .f-phone { top: 290px; left: 180px; }
.page-2 .f-line { top: 330px; left: 180px; }
.page-2 .f-city { top: 370px; left: 180px; }
.page-3 .f-roomType { top: 320px; left: 350px; }
.page-3 .f-roomCost { top: 360px; left: 350px; }
.page-3 .f-hospitalDaily { top: 400px; left: 350px; }
.page-3 .f-surgeryRange { top: 440px; left: 350px; }
.page-3 .f-outpatient { top: 480px; left: 350px; }
.page-4 .f-salaryLoss { top: 300px; left: 350px; }
.page-4 .f-livingExpense { top: 360px; left: 350px; }
.page-4 .f-treatmentCost { top: 420px; left: 350px; }
.page-4 .f-oneTime { top: 480px; left: 350px; }
.page-5 .f-longTermCare { top: 350px; left: 350px; font-size: 18px; }
.page-6 .f-personalDebt { top: 300px; left: 350px; }
.page-6 .f-familyCare { top: 360px; left: 350px; }
.page-6 .f-disability { top: 420px; left: 350px; }
.page-7 .f-accidentDaily { top: 300px; left: 350px; }
.page-7 .f-accidentReimburse { top: 360px; left: 350px; }
.page-7 .f-majorBurn { top: 420px; left: 350px; }
.page-7 .f-homeCare { top: 480px; left: 350px; }
@media print { .pdf-page { box-shadow: none; margin: 0; } .field { background: transparent; } }
`;

// 預設模板內容
const DEFAULT_HTML_CONTENT = `
<div class="pdf-page page-1"><div class="svg-bg"><img src="/pdf-templates/adult/1.svg" alt="封面" /></div><div class="overlay"><span class="field name-field">{{name}}</span><span class="field date-field">{{generatedDate}}</span></div></div>
<div class="pdf-page page-2"><div class="svg-bg"><img src="/pdf-templates/adult/2.svg" alt="基本資料" /></div><div class="overlay"><span class="field f-name">{{name}}</span><span class="field f-phone">{{phone}}</span><span class="field f-line">{{lineId}}</span><span class="field f-city">{{city}}</span></div></div>
<div class="pdf-page page-3"><div class="svg-bg"><img src="/pdf-templates/adult/3.svg" alt="醫療保障" /></div><div class="overlay"><span class="field f-roomType">{{roomType}}</span><span class="field f-roomCost">{{roomCost}}</span><span class="field f-hospitalDaily">{{hospitalDaily}}</span><span class="field f-surgeryRange">{{surgeryRange}}</span><span class="field f-outpatient">{{outpatientSurgeryRange}}</span></div></div>
<div class="pdf-page page-4"><div class="svg-bg"><img src="/pdf-templates/adult/4.svg" alt="重症保障" /></div><div class="overlay"><span class="field f-salaryLoss">{{salaryLossInTenThousand}} 萬/月</span><span class="field f-livingExpense">{{livingExpenseInTenThousand}} 萬/年</span><span class="field f-treatmentCost">{{treatmentCostInTenThousand}} 萬</span><span class="field f-oneTime">{{fixedOneTimeBenefit}} 萬</span></div></div>
<div class="pdf-page page-5"><div class="svg-bg"><img src="/pdf-templates/adult/5.svg" alt="長照保障" /></div><div class="overlay"><span class="field f-longTermCare">{{longTermCareInTenThousand}} 萬/月</span></div></div>
<div class="pdf-page page-6"><div class="svg-bg"><img src="/pdf-templates/adult/6.svg" alt="壽險保障" /></div><div class="overlay"><span class="field f-personalDebt">{{personalDebt}}</span><span class="field f-familyCare">{{familyCare}}</span><span class="field f-disability">{{disabilityOneTimeRange}}</span></div></div>
<div class="pdf-page page-7"><div class="svg-bg"><img src="/pdf-templates/adult/7.svg" alt="意外保障" /></div><div class="overlay"><span class="field f-accidentDaily">{{accidentDailyRange}}</span><span class="field f-accidentReimburse">{{accidentReimbursementRange}}</span><span class="field f-majorBurn">{{majorBurnRange}}</span><span class="field f-homeCare">{{homeCareInTenThousand}} 萬</span></div></div>
<div class="pdf-page page-8"><div class="svg-bg"><img src="/pdf-templates/adult/8.svg" alt="page8" /></div></div>
<div class="pdf-page page-9"><div class="svg-bg"><img src="/pdf-templates/adult/9.svg" alt="page9" /></div></div>
<div class="pdf-page page-10"><div class="svg-bg"><img src="/pdf-templates/adult/10.svg" alt="page10" /></div></div>
<div class="pdf-page page-11"><div class="svg-bg"><img src="/pdf-templates/adult/11.svg" alt="page11" /></div></div>
<div class="pdf-page page-12"><div class="svg-bg"><img src="/pdf-templates/adult/12.svg" alt="page12" /></div></div>
<div class="pdf-page page-13"><div class="svg-bg"><img src="/pdf-templates/adult/13.svg" alt="page13" /></div></div>
<div class="pdf-page page-14"><div class="svg-bg"><img src="/pdf-templates/adult/14.svg" alt="page14" /></div></div>
<div class="pdf-page page-15"><div class="svg-bg"><img src="/pdf-templates/adult/15.svg" alt="page15" /></div></div>
<div class="pdf-page page-16"><div class="svg-bg"><img src="/pdf-templates/adult/16.svg" alt="page16" /></div></div>
`;

// Helper: 將圖片轉為 Base64 並等待載入
const processImages = async (container: HTMLElement) => {
  const images = Array.from(container.querySelectorAll('img'));
  console.log(`Processing ${images.length} images...`);
  
  await Promise.all(images.map(async (img) => {
    try {
      const src = img.getAttribute('src');
      if (!src || src.startsWith('data:')) return;

      const response = await fetch(src);
      const blob = await response.blob();
      
      await new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = async () => {
          if (reader.result) {
            img.src = reader.result as string;
            // 嘗試等待圖片解碼完成，確保渲染時圖片已就緒
            try {
              if (img.decode) {
                await img.decode();
              }
            } catch (e) {
              console.warn('Image decode failed', e);
            }
          }
          resolve();
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.warn('Failed to process image:', img.src, error);
    }
  }));
};

interface PdfTemplate {
  header_html: string;
  basic_info_html: string;
  medical_html: string;
  critical_html: string;
  longterm_html: string;
  life_html: string;
  accident_html: string;
  footer_html: string;
  styles: string;
}

interface ResultStepProps {
  data: any;
  onBack: () => void;
}

export default function ResultStep({ data, onBack }: ResultStepProps) {
  const [showContactForm, setShowContactForm] = useState(false);
  const [showDownloadForm, setShowDownloadForm] = useState(false);
  const [downloadData, setDownloadData] = useState({
    name: '',
    phone: '',
    city: '',
    lineId: ''
  });
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/analysis'
      }
    });
  };

  // 計算年齡
  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const age = data.birthDate ? calculateAge(data.birthDate) : 0;
  const isChildPlan = data.planType === 'child';

  // 計算各項保障建議額度
  const calculateCoverage = () => {
    const monthlyIncome = data.monthlyIncome || 0;
    
    return {
      // 醫療保障
      hospitalDaily: data.hospitalDaily || 2000,
      surgerySubsidy: data.surgerySubsidy || 100000,
      
      // 重症保障
      criticalIllness: data.criticalIllnessCoverage || (monthlyIncome * 12 * 5),
      cancerTreatment: data.cancerTreatment || 300000,
      
      // 長照保障
      longTermCare: data.longTermCare || (monthlyIncome * 12 * 10),
      
      // 壽險保障（成人才有）
      lifeInsurance: !isChildPlan ? (data.lifeInsurance || (monthlyIncome * 12 * 10)) : 0,
      
      // 意外保障
      accidentInsurance: data.accidentInsurance || 3000000,
      accidentMedical: data.accidentMedical || 50000
    };
  };

  const coverage = calculateCoverage();

  // 計算總保費預估（簡化計算）
  const estimatePremium = () => {
    let basePremium = 0;
    
    if (isChildPlan) {
      // 幼兒保險預估
      basePremium = age < 6 ? 15000 : 18000;
    } else {
      // 成人保險預估
      if (age < 30) basePremium = 25000;
      else if (age < 40) basePremium = 35000;
      else if (age < 50) basePremium = 50000;
      else basePremium = 70000;
      
      // 性別調整
      if (data.gender === 'female') basePremium *= 0.9;
    }
    
    return Math.round(basePremium);
  };

  const annualPremium = estimatePremium();

  const handleDownloadReport = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    setShowDownloadForm(true);
  };

  const handleDownloadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingPDF(true);
    setPdfProgress(0);

    // 啟動進度條動畫（6秒完成）
    const progressInterval = setInterval(() => {
      setPdfProgress(prev => {
        if (prev >= 95) {
          return prev;
        }
        return prev + (95 - prev) * 0.08; // 緩動效果
      });
    }, 100);

    try {
      // 保存會員問卷資料
      if (user) {
        const { error } = await supabase.from('member_submissions').insert({
          user_id: user.id,
          email: user.email,
          name: downloadData.name,
          phone: downloadData.phone,
          city: downloadData.city,
          line_id: downloadData.lineId,
          questionnaire_data: data
        });

        if (error) {
          console.error('Error saving member submission:', error);
        }
      }

      // 從 Supabase 獲取對應的 PDF 模板
      let templateData;
      const targetTemplateName = isChildPlan ? 'child' : 'adult';

      try {
        // 1. 嘗試獲取指定名稱的模板 (使用 ilike 模糊匹配，支援 "adult" 或 "Adult 保障需求分析報告")
        let { data: templates } = await supabase
          .from('pdf_templates')
          .select('*')
          .ilike('name', `%${targetTemplateName}%`)
          .eq('is_active', true)
          .limit(1);
        
        let data = templates?.[0];

        // 2. 如果找不到指定模板，且是 child，嘗試創建預設的 child 模板資料 (僅記憶體中，不寫入DB)
        if (!data && isChildPlan) {
           console.warn('Child template not found in DB, generating from default');
           templateData = {
             styles: DEFAULT_STYLES,
             html_content: DEFAULT_HTML_CONTENT.replace(/\/pdf-templates\/adult\//g, '/pdf-templates/child/')
           };
        } else if (!data) {
           // 3. 如果是 adult 且找不到，或者其他情況，嘗試獲取任意 active 模板
           const { data: anyTemplates } = await supabase
             .from('pdf_templates')
             .select('*')
             .eq('is_active', true)
             .limit(1);
           data = anyTemplates?.[0];
        }

        if (data) {
          templateData = data;
        } else if (!templateData) {
          // 4. 最後的 Fallback
          throw new Error('No template found');
        }

      } catch (e) {
        console.warn('Using default template due to exception', e);
        // 根據類型選擇預設模板內容
        const baseHtml = DEFAULT_HTML_CONTENT;
        const finalHtml = isChildPlan 
            ? baseHtml.replace(/\/pdf-templates\/adult\//g, '/pdf-templates/child/')
            : baseHtml;

        templateData = {
          styles: DEFAULT_STYLES,
          html_content: finalHtml
        };
      }

      // 準備 PDF 填寫資料
      const formatNumber = (num: number) => num.toLocaleString('zh-TW');
      const roomTypeText = data.roomType === 'double' ? '雙人房' :
                          data.roomType === 'single' ? '單人房' : '健保房';

      // 計算 1~11 級一次金範圍 (月薪 * 50 * 5% ~ 月薪 * 50) 單位：萬
      const monthlyIncome = data.monthlyIncome || 0;
      const disabilityMin = Math.round((monthlyIncome * 50 * 0.05) / 10000);
      const disabilityMax = Math.round((monthlyIncome * 50) / 10000);

      const pdfVariables: Record<string, string> = {
        '{{name}}': downloadData.name,
        '{{phone}}': downloadData.phone,
        '{{lineId}}': downloadData.lineId || '-',
        '{{city}}': downloadData.city || '-',
        '{{roomType}}': roomTypeText,
        '{{roomCost}}': formatNumber(data.roomType === 'double' ? 3000 : data.roomType === 'single' ? 5000 : 0),
        '{{hospitalDaily}}': formatNumber(data.hospitalDaily || 0),
        '{{surgeryRange}}': data.surgerySubsidy === 'full' ? '30~40萬' :
                           data.surgerySubsidy === 'recommended' ? '20~30萬' : '10~20萬',
        '{{outpatientSurgeryRange}}': '5~10萬',
        '{{salaryLossInTenThousand}}': String(Math.round((data.salaryLoss || 0) / 10000)),
        '{{livingExpenseInTenThousand}}': String(Math.round((data.livingExpense || 0) * 12 / 10000)),
        '{{treatmentCostInTenThousand}}': String(Math.round((data.treatmentCost || 0) / 10000)),
        '{{fixedOneTimeBenefit}}': '100',
        '{{longTermCareInTenThousand}}': String(Math.round((data.longTermCare || 0) / 10000)),
        '{{disabilityOneTimeRange}}': `${disabilityMin}萬～${disabilityMax}萬`,
        '{{personalDebt}}': formatNumber(data.personalDebt || 0),
        '{{familyCare}}': formatNumber(data.familyCare || 0),
        '{{accidentDailyRange}}': '1,000～2,000',
        '{{accidentReimbursementRange}}': '5～10',
        '{{majorBurnRange}}': '50～100',
        '{{homeCareInTenThousand}}': String(Math.round(monthlyIncome / 10000)),
        '{{monthlyIncomeInTenThousand}}': String(Math.round(monthlyIncome / 10000)),
        '{{generatedDate}}': new Date().toLocaleDateString('zh-TW'),
      };

      // 替換變數
      let processedStyles = templateData.styles || DEFAULT_STYLES;
      Object.entries(pdfVariables).forEach(([key, value]) => {
        processedStyles = processedStyles.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
      });

      // 處理 HTML 內容
      let htmlContent = templateData.html_content || DEFAULT_HTML_CONTENT;

      // 清理 HTML 內容中的雜質 (例如用戶誤貼的文字或調試信息)
      // 1. 移除主要內容之前的所有文字
      const startIndex = htmlContent.indexOf('<div class="pdf-page');
      if (startIndex > 0) {
        htmlContent = htmlContent.substring(startIndex);
      }
      // 2. 移除特定的髒字串 (針對用戶反饋)
      htmlContent = htmlContent.replace(/暫時加紅色背景[^<]*/g, '');
      
      // 若 html_content 仍為空（極端情況），嘗試舊欄位
      if (!htmlContent && (templateData as any).header_html) {
        const td = templateData as any;
        htmlContent = [
          td.header_html || '',
          td.basic_info_html || '',
          td.medical_html || '',
          td.critical_html || '',
          td.longterm_html || '',
          td.life_html || '',
          td.accident_html || '',
          td.footer_html || '',
        ].join('\n');
      }

      // 替換 HTML 中的變數
      Object.entries(pdfVariables).forEach(([key, value]) => {
        htmlContent = htmlContent.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
      });

      // 創建臨時容器
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      // 注意：這裡不強制設定寬度，讓 CSS 控制
      
      container.innerHTML = `
        <style>
          ${processedStyles}
          /* 強制樣式修正 */
          .pdf-page {
            width: 210mm !important;
            height: 296mm !important; /* 稍微小於 297mm 以防止自動分頁產生空白頁 */
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            page-break-after: always !important;
            position: relative !important;
          }
          .pdf-page:last-child {
            page-break-after: avoid !important;
          }
          
          /* 確保變數正確顯示 */
          .field {
            position: absolute !important;
            z-index: 100 !important;
            background: transparent !important;
          }
          
          /* 確保 SVG 背景在下層 */
          .svg-bg {
            z-index: 1 !important;
            width: 100% !important;
            height: 100% !important;
          }
          .svg-bg img {
            width: 100% !important;
            height: 100% !important;
            object-fit: contain !important;
          }
          
          .overlay {
            z-index: 10 !important;
            width: 100% !important;
            height: 100% !important;
          }
        </style>
        <div class="pdf-wrapper">
          ${htmlContent}
        </div>
      `;

      document.body.appendChild(container);

      // 處理圖片：將所有圖片轉換為 Base64 以解決跨域和加載問題
      // 這是解決 PDF 空白最關鍵的一步
      await processImages(container);

      // 給予充分時間讓瀏覽器渲染 (增加到 3000ms)
      // 對於 16 頁的大文件，瀏覽器需要時間重新排版和繪製
      await new Promise(resolve => setTimeout(resolve, 3000));

      const opt = {
        margin: 0,
        filename: `保障需求分析報告_${downloadData.name}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { 
          scale: 1.5, // 稍微降低縮放比例以減少記憶體消耗，避免大文件崩潰導致空白
          useCORS: true,
          letterRendering: true,
          scrollY: 0,
          logging: true // 啟用日誌以便排查
        },
        jsPDF: { 
          unit: 'mm' as const, 
          format: 'a4' as const,
          orientation: 'portrait' as const
        }
      };

      const element = container.querySelector('.pdf-wrapper') as HTMLElement;
      await html2pdf().set(opt).from(element).save();

      document.body.removeChild(container);

      // 完成進度條
      clearInterval(progressInterval);
      setPdfProgress(100);

      // 等待進度條顯示完成
      await new Promise(resolve => setTimeout(resolve, 500));

      setShowDownloadForm(false);
      setPdfProgress(0);
    } catch (error) {
      console.error('生成 PDF 失敗：', error);
      clearInterval(progressInterval);
      setPdfProgress(0);
      alert('生成 PDF 時發生錯誤，請稍後再試。');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 這裡可以整合表單提交功能
    console.log('聯絡資料：', downloadData);
    console.log('分析資料：', data);
    
    alert('感謝您的填寫！我們的專員會盡快與您聯繫。');
    setShowContactForm(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* 恭喜完成區塊 */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-full mb-4">
          <i className="ri-checkbox-circle-line text-4xl text-white"></i>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">恭喜！您已完成了最關鍵的第一步</h1>
        <p className="text-xl text-teal-600 font-semibold">了解需求</p>
      </div>

      {/* 三大難題標題 */}
      <div className="text-center space-y-3">
        <p className="text-lg text-gray-600">但在真正「獲得保障」之前，</p>
        <h2 className="text-3xl font-bold text-gray-900">90% 的人會卡在接下來的三個現實難題</h2>
      </div>

      {/* 三大難題 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* 難題 1 */}
        <div className="group relative h-full">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-100 to-pink-100 rounded-2xl transform group-hover:scale-105 transition-transform duration-300"></div>
          <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow h-full flex flex-col">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl mb-6 mx-auto">
              <i className="ri-question-line text-3xl text-white"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">商品選擇障礙</h3>
            <p className="text-gray-700 leading-relaxed flex-1">
              透過需求分析，我們已經知道需要哪些保障，也知道應該規劃多少額度，但市面上這麼多家保險公司，成千上萬種商品，<span className="font-semibold text-gray-900">該從何開始比較？哪一家條款對我最好？哪一張 CP 值最高？</span>
            </p>
          </div>
        </div>

        {/* 難題 2 */}
        <div className="group relative h-full">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl transform group-hover:scale-105 transition-transform duration-300"></div>
          <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow h-full flex flex-col">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl mb-6 mx-auto">
              <i className="ri-file-list-3-line text-3xl text-white"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">新舊保單打架</h3>
            <p className="text-gray-700 leading-relaxed flex-1">
              許多人在出社會前，父母可能已經幫忙買過保險，但這些「傳家寶」往往躺在家裡的某個角落，內容成謎。如果您不知道這些舊保單的內容，會很難判斷現在該怎麼幫自己規劃！<span className="font-semibold text-gray-900">最怕的是買了重複的保險（例如買了一堆功能重複的終身醫療險），不僅浪費預算；更怕的是會讓我們以為自己有保障，結果最後才發現保障不如自己的想像。</span>
            </p>
          </div>
        </div>

        {/* 難題 3 */}
        <div className="group relative h-full">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl transform group-hover:scale-105 transition-transform duration-300"></div>
          <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow h-full flex flex-col">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl mb-6 mx-auto">
              <i className="ri-emotion-unhappy-line text-3xl text-white"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">人情保單壓力</h3>
            <p className="text-gray-700 leading-relaxed flex-1">
              在台灣，保險往往不是「買來的」，而是「被推銷來的」。當業務員是親戚、老同學或長輩的朋友時，保險就變質了。<span className="font-semibold text-gray-900">想問問題又怕問了不買不好意思，或是明知保費太貴或不符合需求，卻又因為人情不好拒絕。最後不僅荷包大失血，未來發現保障不足時，還可能會傷了彼此的感情！</span>
            </p>
          </div>
        </div>
      </div>

      {/* 解決方案標題 */}
      <div className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600"></div>
        <div className="relative px-8 py-10 text-center">
          <h2 className="text-3xl font-bold text-white">我們將透過簡單 3 步驟幫您解決上述煩惱</h2>
        </div>
      </div>

      {/* 三步驟解決方案 */}
      <div className="space-y-6">
        {/* Step 1 */}
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl transform group-hover:translate-x-2 transition-transform duration-300"></div>
          <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-teal-100">
            <div className="flex items-start p-8 gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-teal-500 to-emerald-500 text-white rounded-xl shadow-lg">
                  <span className="text-2xl font-bold">1</span>
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-bold text-gray-900">舊保單的健診</h3>
                  <span className="inline-flex items-center px-3 py-1 bg-amber-400 text-gray-900 rounded-full text-sm font-bold">免費</span>
                </div>
                <p className="text-gray-700 leading-relaxed text-lg">
                  我們會協助您清楚了解過去規劃的保障內容，也在商品條款上替您把關，<span className="font-semibold text-gray-900">排除掉所有不利於您的地雷保單！也避免你重複或過度投保到相同功能的保險商品！把每一分保費都花在刀口上！</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-r from-sky-50 to-blue-50 rounded-2xl transform group-hover:translate-x-2 transition-transform duration-300"></div>
          <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-sky-100">
            <div className="flex items-start p-8 gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-sky-500 to-blue-500 text-white rounded-xl shadow-lg">
                  <span className="text-2xl font-bold">2</span>
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <h3 className="text-2xl font-bold text-gray-900">1對1專業諮詢</h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                  保險業務這麼多，總是各說各的好，甚至只講優點不說缺點！<span className="font-semibold text-gray-900">但在保家佳，我們會協助你看懂保險，破解這些討人厭的話術，讓您能真正安心的幫自己或家人規劃好保障！</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-2xl transform group-hover:translate-x-2 transition-transform duration-300"></div>
          <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-indigo-100">
            <div className="flex items-start p-8 gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-500 text-white rounded-xl shadow-lg">
                  <span className="text-2xl font-bold">3</span>
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <h3 className="text-2xl font-bold text-gray-900">客製化保障規劃</h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                  我們會依據您的需求在各家保險公司之間找尋最適合您的優勢商品，<span className="font-semibold text-gray-900">杜絕條款陷阱、高保費低保障、功能過時的地雷保單！替您把關並找出最適合您的規劃方式！</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 行動按鈕區塊 */}
      <div className="bg-gradient-to-b from-gray-50 to-white rounded-2xl p-8 shadow-lg">
        <div className="flex gap-4">
          <button
            onClick={() => setShowContactForm(true)}
            className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-teal-600 hover:to-emerald-600 transition-all hover:-translate-y-0.5 shadow-lg cursor-pointer whitespace-nowrap"
          >
            <i className="ri-calendar-check-line mr-2"></i>
            預約專業諮詢
          </button>
          <button
            onClick={handleDownloadReport}
            disabled={isGeneratingPDF}
            className="flex-1 bg-white text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-all shadow-md cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingPDF ? (
              <>
                <i className="ri-loader-4-line mr-2 animate-spin"></i>
                生成中...
              </>
            ) : (
              <>
                <i className="ri-download-line mr-2"></i>
                下載分析報告
              </>
            )}
          </button>
        </div>
        <div className="mt-6 text-center">
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-teal-600 transition-colors text-sm cursor-pointer"
          >
            <i className="ri-arrow-left-line mr-1"></i>
            重新開始分析
          </button>
        </div>
      </div>

      {/* 下載報告表單彈窗 */}
      {showDownloadForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">下載完整分析報告</h3>
              <button
                onClick={() => setShowDownloadForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                disabled={isGeneratingPDF}
              >
                <i className="ri-close-line text-3xl"></i>
              </button>
            </div>

            <p className="text-gray-600 mb-4">
              請填寫以下資料，我們將為您生成專屬的保障分析報告
            </p>

            {/* 報告特色說明 */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <i className="ri-file-chart-line text-teal-500"></i>
                <span>專業精美分析報告</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <i className="ri-printer-line text-teal-500"></i>
                <span>報告可直接彩色列印</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <i className="ri-robot-line text-teal-500"></i>
                <span>線上 AI 直接生成，無需等待</span>
              </div>
            </div>

            <form onSubmit={handleDownloadSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  姓名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={downloadData.name}
                  onChange={(e) => setDownloadData({ ...downloadData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                  placeholder="請輸入您的姓名"
                  disabled={isGeneratingPDF}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  手機號碼 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={downloadData.phone}
                  onChange={(e) => setDownloadData({ ...downloadData, phone: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                  placeholder="請輸入您的手機號碼"
                  disabled={isGeneratingPDF}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  居住縣市 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={downloadData.city}
                  onChange={(e) => setDownloadData({ ...downloadData, city: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                  placeholder="例如：台北市"
                  disabled={isGeneratingPDF}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Line ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={downloadData.lineId}
                  onChange={(e) => setDownloadData({ ...downloadData, lineId: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                  placeholder="請輸入您的 Line ID"
                  disabled={isGeneratingPDF}
                />
              </div>

              {/* 進度條 */}
              {isGeneratingPDF && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-teal-600">正在生成報告...</span>
                    <span className="text-sm font-medium text-teal-600">{Math.round(pdfProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${pdfProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    {pdfProgress < 30 && '正在載入模板...'}
                    {pdfProgress >= 30 && pdfProgress < 60 && '正在處理資料...'}
                    {pdfProgress >= 60 && pdfProgress < 90 && '正在生成 PDF...'}
                    {pdfProgress >= 90 && '即將完成...'}
                  </p>
                </div>
              )}

              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setShowDownloadForm(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer"
                  disabled={isGeneratingPDF}
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-teal-600 hover:to-emerald-600 transition-all whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  disabled={isGeneratingPDF}
                >
                  {isGeneratingPDF ? (
                    <span className="flex items-center justify-center">
                      <i className="ri-loader-4-line animate-spin mr-2"></i>
                      生成中...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <i className="ri-download-line mr-2"></i>
                      下載報告
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 聯絡表單彈窗 */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">聯絡專業顧問</h3>
              <button
                onClick={() => setShowContactForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-3xl"></i>
              </button>
            </div>

            <div className="text-center py-8">
              <div className="mb-6">
                <i className="ri-line-fill text-7xl text-green-500"></i>
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4">
                立即透過 LINE 諮詢
              </h4>
              <p className="text-gray-600 mb-8">
                我們的專業顧問將為您提供一對一的保險規劃服務
              </p>
              <a
                href="https://lin.ee/CXd58fG"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-10 py-4 bg-green-500 text-white rounded-xl font-bold text-lg hover:bg-green-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 whitespace-nowrap"
              >
                <i className="ri-line-fill mr-3 text-2xl"></i>
                加入 LINE 諮詢
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 登入提示彈窗 */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">請先登入會員</h3>
              <button
                onClick={() => setShowLoginModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-3xl"></i>
              </button>
            </div>

            <div className="text-center py-8">
              <div className="mb-6">
                <i className="ri-user-lock-line text-7xl text-teal-500"></i>
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4">
                登入後即可下載完整報告
              </h4>
              <p className="text-gray-600 mb-8">
                為了保護您的個人隱私資料，<br />
                請先登入會員後再下載分析報告。
              </p>
              <button
                onClick={handleLogin}
                className="inline-flex items-center justify-center px-8 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all shadow-md cursor-pointer gap-3 w-full"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                使用 Google 帳號登入
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
