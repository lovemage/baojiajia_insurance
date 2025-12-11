import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import html2pdf from 'html2pdf.js';
import { sendTelegramNotification } from '../../../services/telegramService';

interface MemberSubmission {
  id: string;
  user_id: string;
  email: string;
  name: string;
  phone: string;
  city: string;
  line_id: string;
  questionnaire_data: any;
  created_at: string;
}

interface ContactSubmission {
  id: string;
  name: string;
  phone: string;
  line_id: string;
  gender: string;
  birth_date: string;
  occupation: string;
  annual_income: string;
  monthly_budget: string;
  consultation_type: string;
  additional_message: string;
  created_at: string;
}



// 安全讀取數據的輔助函數 - 加強版
const safeGet = (obj: any, path: string, defaultValue: any = '-') => {
  try {
    const value = path.split('.').reduce((o, k) => (o || {})[k], obj);
    if (value === undefined || value === null || value === '') return defaultValue;
    return value;
  } catch {
    return defaultValue;
  }
};

// 格式化數字為千分位
const formatNumber = (num: any) => {
  if (!num && num !== 0) return '0';
  return Number(num).toLocaleString('zh-TW');
};

// 選項映射
const OPTIONS_MAP = {
  insuranceKnowledge: {
    'A': '完全清楚',
    'B': '大概知道，但細節不清楚',
    'C': '不太清楚，別人幫我規劃的',
    'D': '完全不了解',
    'E': '沒有規劃過保障'
  } as Record<string, string>,
  policyCheckExpectations: {
    'A': '降低保費，提高保障',
    'B': '避免買到「地雷保單」',
    'C': '避免您重複或過度投保',
    'D': '審視保障內容符合您的個人需求'
  } as Record<string, string>,
  monthlyBudget: {
    'A': '3000 以下',
    'B': '3000~5000 元',
    'C': '5000~10000 元',
    'D': '10000 以上'
  } as Record<string, string>
};

export default function MemberManager() {
  const [submissions, setSubmissions] = useState<MemberSubmission[]>([]);
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<MemberSubmission | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);

  // Tab 狀態
  const [activeTab, setActiveTab] = useState<'downloads' | 'contacts'>('downloads');

  // 下載限制編輯狀態
  const [editingLimit, setEditingLimit] = useState<{
    email: string;
    name: string;
    limit: number;
    downloadCount: number;
  } | null>(null);
  const [isSavingLimit, setIsSavingLimit] = useState(false);

  // 多選狀態
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(new Set());

  // 諮詢表單刪除確認
  const [showContactDeleteConfirm, setShowContactDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchMembers();
    fetchContactSubmissions();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('member_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // 直接使用所有提交記錄，按下載時間排序
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContactSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContactSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching contact submissions:', error);
    }
  };

  const handleDeleteContact = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setContactSubmissions(prev => prev.filter(c => c.id !== id));
      setShowContactDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const handleSelectAllContacts = () => {
    if (selectedContactIds.size === contactSubmissions.length) {
      setSelectedContactIds(new Set());
    } else {
      setSelectedContactIds(new Set(contactSubmissions.map(c => c.id)));
    }
  };

  const handleSelectOneContact = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedContactIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedContactIds(newSelected);
  };

  const handleExportContactCSV = () => {
    const selectedContacts = contactSubmissions.filter(c => selectedContactIds.has(c.id));
    if (selectedContacts.length === 0) return;

    const headers = ['姓名', '電話', 'Line ID', '性別', '生日', '職等', '年收入', '月預算', '諮詢需求', '補充說明', '提交時間'];
    const csvRows = [headers.join(',')];

    selectedContacts.forEach(contact => {
      const row = [
        contact.name,
        contact.phone,
        contact.line_id || '-',
        contact.gender || '-',
        contact.birth_date || '-',
        contact.occupation || '-',
        contact.annual_income || '-',
        contact.monthly_budget || '-',
        contact.consultation_type || '-',
        contact.additional_message || '-',
        new Date(contact.created_at).toLocaleString('zh-TW')
      ].map(val => {
        const str = String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      });
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `諮詢表單匯出_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEditLimitClick = async (member: MemberSubmission) => {
    setEditingLimit({
      email: member.email,
      name: member.name,
      limit: -1,
      downloadCount: 0
    });

    try {
      const { data, error } = await supabase
        .from('user_download_limits')
        .select('download_limit, download_count')
        .eq('email', member.email)
        .maybeSingle();

      if (error) {
        console.error('Error fetching limit:', error);
      }

      if (data) {
        setEditingLimit((prev) => {
          if (!prev || prev.email !== member.email) return prev;
          return {
            ...prev,
            limit: data.download_limit ?? -1,
            downloadCount: data.download_count ?? 0
          };
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveLimit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLimit) return;
    setIsSavingLimit(true);
    try {
      const normalizedLimit = Number.isNaN(Number(editingLimit.limit)) ? -1 : editingLimit.limit;
      const { error } = await supabase
        .from('user_download_limits')
        .upsert({
          email: editingLimit.email,
          download_limit: normalizedLimit,
          updated_at: new Date().toISOString()
        }, { onConflict: 'email' });

      if (error) throw error;
      alert('設定成功');
      setEditingLimit(null);
    } catch (error) {
      console.error('Error saving limit:', error);
      alert('設定失敗');
    } finally {
      setIsSavingLimit(false);
    }
  };

  const handleDeleteSubmission = async (id: string) => {
    try {
      const { error } = await supabase
        .from('member_submissions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // 如果正在查看被刪除的會員，關閉彈窗
      if (selectedMember?.id === id) {
        setSelectedMember(null);
      }

      await fetchMembers();
      setShowDeleteConfirm(null);
      alert('刪除成功');
    } catch (error) {
      console.error('Error deleting submission:', error);
      alert('刪除失敗，請確認您有權限執行此操作');
    } finally {
    }
  };

  // 全選/取消全選
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = new Set(submissions.map(s => s.id));
      setSelectedIds(allIds);
    } else {
      setSelectedIds(new Set());
    }
  };

  // 單選
  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  // 匯出 CSV
  const handleExportCSV = () => {
    if (selectedIds.size === 0) {
      alert('請先選擇要匯出的記錄');
      return;
    }

    const csvRows: string[] = [];

    // 定義 CSV 標題
    const headers = [
      '姓名', 'Email', '電話', '居住地', 'Line ID', '下載時間',
      '性別', '出生日期', '職業等級', '規劃對象',
      '期望病房', '期望住院日額', '手術補貼', '薪資損失(萬/月)', '生活開銷(萬/年)', '治療費用(萬)', '長照需求(萬/月)', '家人照顧金', '個人負債', '月收入(萬)',
      '保險了解程度', '保單健診期望', '每月預算'
    ];
    csvRows.push('\ufeff' + headers.join(',')); // 加入 BOM 確保 Excel 中文顯示正常

    // 收集數據
    submissions.forEach(sub => {
      if (!selectedIds.has(sub.id)) return;

      const qData = sub.questionnaire_data || {};

      // 處理多選欄位
      const expectations = (safeGet(qData, 'policyCheckExpectations', []) as string[])
        .map(val => OPTIONS_MAP.policyCheckExpectations[val] || val)
        .join('; ');

      const row = [
        sub.name,
        sub.email,
        sub.phone,
        sub.city,
        sub.line_id,
        new Date(sub.created_at).toLocaleString('zh-TW'),
        // 問卷資料
        qData.gender === 'male' ? '男' : qData.gender === 'female' ? '女' : '-',
        qData.birthDate || '-',
        qData.occupation || '-',
        qData.planType === 'self' ? '本人' : qData.planType === 'child' ? '子女' : '-',
        qData.roomType === 'single' ? '單人房' : qData.roomType === 'double' ? '雙人房' : qData.roomType === 'health-insurance' ? '健保房' : '-',
        qData.hospitalDaily || 0,
        qData.surgerySubsidy === 'full' || qData.surgerySubsidy === 'complete'
          ? '全額負擔'
          : qData.surgerySubsidy === 'recommended'
            ? '建議額度'
            : '基本額度',
        Math.round((qData.salaryLoss || 0) / 10000),
        Math.round((qData.livingExpense || 0) * 12 / 10000),
        Math.round((qData.treatmentCost || 0) / 10000),
        Math.round((qData.longTermCare || 0) / 10000),
        qData.familyCare || 0,
        qData.personalDebt || 0,
        Math.round((qData.monthlyIncome || 0) / 10000),
        OPTIONS_MAP.insuranceKnowledge[qData.insuranceKnowledge] || qData.insuranceKnowledge || '-',
        expectations,
        OPTIONS_MAP.monthlyBudget[qData.monthlyBudget] || qData.monthlyBudget || '-'
      ].map(val => {
        // 處理包含逗號的內容，用引號包起來
        const str = String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      });

      csvRows.push(row.join(','));
    });

    // 建立 Blob 並下載
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `會員資料匯出_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF 下載功能
  const handleDownloadPDF = async (member: MemberSubmission) => {
    setIsGeneratingPDF(true);
    setPdfProgress(0);

    // 啟動進度條動畫
    const progressInterval = setInterval(() => {
      setPdfProgress(prev => {
        if (prev >= 95) return prev;
        return prev + (95 - prev) * 0.08;
      });
    }, 100);

    try {
      const data = member.questionnaire_data || {};

      // 判斷是 adult 還是 child 模板
      const isChildPlan = data.planType === 'child';
      const targetTemplateName = isChildPlan ? 'child' : 'adult';

      // 從 Supabase 獲取對應的 PDF 模板
      const { data: templates, error: templateError } = await supabase
        .from('pdf_templates')
        .select('*')
        .ilike('name', `%${targetTemplateName}%`)
        .eq('is_active', true)
        .limit(1);

      if (templateError || !templates || templates.length === 0) {
        throw new Error('無法載入 PDF 模板');
      }

      const templateData = templates[0];

      // 準備 PDF 填寫資料
      const formatNumber = (num: number) => (num || 0).toLocaleString('zh-TW');
      const roomTypeText = data.roomType === 'double' ? '雙人房' :
                          data.roomType === 'single' ? '單人房' : '健保房';

      // 計算 1~11 級一次金範圍 (月薪 * 50 * 5% ~ 月薪 * 50) 單位：萬
      const monthlyIncome = data.monthlyIncome || 0;
      const disabilityMin = Math.round((monthlyIncome * 50 * 0.05) / 10000);
      const disabilityMax = Math.round((monthlyIncome * 50) / 10000);

      // 處理自定義變數
      const customVars: Record<string, string> = {};
      if (templateData.custom_variables) {
        try {
          let vars: any[] = [];
          
          if (Array.isArray(templateData.custom_variables)) {
            vars = templateData.custom_variables;
          } else if (typeof templateData.custom_variables === 'string') {
            // Try to parse if it's a JSON string
            try {
              const parsed = JSON.parse(templateData.custom_variables);
              if (Array.isArray(parsed)) {
                vars = parsed;
              }
            } catch {
              console.warn('Could not parse custom_variables as JSON string');
            }
          }
          
          // Only process if vars is a valid array
          if (Array.isArray(vars) && vars.length > 0) {
            vars.forEach((v: any) => {
              if (v && typeof v === 'object' && v.key && v.value) {
                customVars[v.key] = v.value;
              }
            });
          }
        } catch (e) {
          console.error('Error parsing custom variables:', e);
        }
      }

      const pdfVariables: Record<string, string> = {
        ...customVars,
        '{{name}}': member.name || '-',
        '{{phone}}': member.phone || '-',
        '{{lineId}}': member.line_id || '-',
        '{{city}}': member.city || '-',
        '{{roomType}}': roomTypeText,
        '{{roomCost}}': formatNumber(data.roomType === 'double' ? 3000 : data.roomType === 'single' ? 5000 : 0),
        '{{hospitalDaily}}': formatNumber(data.hospitalDaily || 0),
        '{{surgeryRange}}': data.surgerySubsidy === 'full' || data.surgerySubsidy === 'complete'
                           ? '30~40萬'
                           : data.surgerySubsidy === 'recommended'
                             ? '20~30萬'
                             : '10~20萬',
        '{{salaryLossInTenThousand}}': String(Math.round((data.salaryLoss || 0) / 10000)),
        '{{livingExpenseInTenThousand}}': String(Math.round((data.livingExpense || 0) * 12 / 10000)),
        '{{treatmentCostInTenThousand}}': String(Math.round((data.treatmentCost || 0) / 10000)),
        '{{longTermCareInTenThousand}}': String(Math.round((data.longTermCare || 0) / 10000)),
        '{{longTermCare1to6Disease}}': String(Math.round((data.longTermCare || 0) / 10000)),
        '{{longTermCare1to6Accident}}': String(Math.round((data.longTermCare || 0) / 10000)),
        '{{disabilityOneTimeRange}}': `${disabilityMin}萬～${disabilityMax}萬`, // Assuming min/max are available in scope or need recalc
        '{{longTermCare1to11Disease}}': `${disabilityMin}萬～${disabilityMax}萬`,
        '{{longTermCare1to11Accident}}': `${disabilityMin}萬～${disabilityMax}萬`,
        '{{personalDebt}}': formatNumber(data.personalDebt || 0),
        '{{familyCare}}': formatNumber(data.familyCare || 0),
        '{{monthlyIncomeInTenThousand}}': String(Math.round((data.monthlyIncome || 0) / 10000)),
        '{{generatedDate}}': new Date().toLocaleDateString('zh-TW'),
        // 幼兒專用變數
        '{{childDeathBenefit}}': '69',
      };

      // 替換變數
      let processedStyles = templateData.styles || '';
      Object.entries(pdfVariables).forEach(([key, value]) => {
        processedStyles = processedStyles.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
      });

      // 處理 HTML 內容（支持新的 html_content 或舊的分區欄位）
      let htmlContent = templateData.html_content || '';

      // 如果沒有 html_content，則使用舊的分區欄位組合
      if (!htmlContent) {
        htmlContent = [
          templateData.header_html || '',
          templateData.basic_info_html || '',
          templateData.medical_html || '',
          templateData.critical_html || '',
          templateData.longterm_html || '',
          templateData.life_html || '',
          templateData.accident_html || '',
          templateData.footer_html || '',
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
      container.style.width = '210mm';

      container.innerHTML = `
        <style>
          ${processedStyles}
          .pdf-page {
            width: 210mm;
            min-height: 297mm;
            padding: 20mm;
            background: white;
            box-sizing: border-box;
            position: relative;
            page-break-after: always;
            font-family: "Microsoft JhengHei", "PingFang TC", sans-serif;
          }
          .pdf-page:last-child {
            page-break-after: avoid;
          }
          * { box-sizing: border-box; }
        </style>
        <div class="pdf-wrapper">
          ${htmlContent}
        </div>
      `;

      document.body.appendChild(container);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const opt = {
        margin: 0,
        filename: `保障需求分析報告_${member.name}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          logging: false,
          scrollY: 0
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

      // 發送 Telegram 通知 - Admin PDF 下載
      try {
        const currentUser = await supabase.auth.getUser();
        await sendTelegramNotification({
          type: 'admin_pdf_downloaded',
          memberName: member.name,
          memberEmail: member.email,
          planType: isChildPlan ? 'child' : 'adult',
          timestamp: new Date(),
          adminUser: currentUser.data.user?.email || '未知管理員'
        });
      } catch (notificationError) {
        console.error('Error sending admin PDF download notification:', notificationError);
        // 不影響主要流程，只記錄錯誤
      }

      clearInterval(progressInterval);
      setPdfProgress(100);
      await new Promise(resolve => setTimeout(resolve, 500));
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">下載管理中心</h1>
              <p className="text-gray-600">查看下載記錄與諮詢表單</p>
            </div>
            <div>
              {activeTab === 'downloads' ? (
                <button
                  onClick={handleExportCSV}
                  disabled={selectedIds.size === 0}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedIds.size === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm'
                  }`}
                >
                  <i className="ri-file-excel-line mr-2"></i>
                  匯出 CSV ({selectedIds.size})
                </button>
              ) : (
                <button
                  onClick={handleExportContactCSV}
                  disabled={selectedContactIds.size === 0}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedContactIds.size === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm'
                  }`}
                >
                  <i className="ri-file-excel-line mr-2"></i>
                  匯出 CSV ({selectedContactIds.size})
                </button>
              )}
            </div>
          </div>

          {/* Tab 切換 */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('downloads')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'downloads'
                  ? 'text-teal-600 border-b-2 border-teal-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <i className="ri-download-line mr-2"></i>
              下載記錄 ({submissions.length})
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'contacts'
                  ? 'text-teal-600 border-b-2 border-teal-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <i className="ri-customer-service-line mr-2"></i>
              諮詢表單 ({contactSubmissions.length})
            </button>
          </div>
        </div>

        {/* 下載記錄 Tab */}
        {activeTab === 'downloads' && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 w-12 text-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                      onChange={handleSelectAll}
                      checked={submissions.length > 0 && selectedIds.size === submissions.length}
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">姓名</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">電話</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">居住地</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Line ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">下載時間</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {submissions.map((submission) => (
                  <tr
                    key={submission.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      selectedIds.has(submission.id) ? 'bg-teal-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                        checked={selectedIds.has(submission.id)}
                        onChange={(e) => handleSelectOne(submission.id, e.target.checked)}
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{submission.name || '未填寫'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{submission.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{submission.phone || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{submission.city || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{submission.line_id || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(submission.created_at).toLocaleString('zh-TW')}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleEditLimitClick(submission)}
                        className="text-indigo-600 hover:text-indigo-900 font-medium"
                      >
                        限制
                      </button>
                      <button
                        onClick={() => setSelectedMember(submission)}
                        className="text-teal-600 hover:text-teal-900 font-medium"
                      >
                        詳情
                      </button>
                      {showDeleteConfirm === submission.id ? (
                        <>
                          <button
                            onClick={() => handleDeleteSubmission(submission.id)}
                            className="text-red-600 hover:text-red-900 font-medium"
                          >
                            確認
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(null)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            取消
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setShowDeleteConfirm(submission.id)}
                          className="text-red-600 hover:text-red-900 font-medium"
                        >
                          刪除
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {submissions.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      尚無下載記錄
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* 諮詢表單 Tab */}
        {activeTab === 'contacts' && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 w-12 text-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                      onChange={handleSelectAllContacts}
                      checked={contactSubmissions.length > 0 && selectedContactIds.size === contactSubmissions.length}
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">姓名</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">電話</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Line ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">諮詢需求</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">提交時間</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {contactSubmissions.map((contact) => (
                  <tr
                    key={contact.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      selectedContactIds.has(contact.id) ? 'bg-teal-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                        checked={selectedContactIds.has(contact.id)}
                        onChange={(e) => handleSelectOneContact(contact.id, e.target.checked)}
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{contact.name || '未填寫'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{contact.phone || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{contact.line_id || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{contact.consultation_type || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(contact.created_at).toLocaleString('zh-TW')}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {showContactDeleteConfirm === contact.id ? (
                        <>
                          <button
                            onClick={() => handleDeleteContact(contact.id)}
                            className="text-red-600 hover:text-red-900 font-medium"
                          >
                            確認
                          </button>
                          <button
                            onClick={() => setShowContactDeleteConfirm(null)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            取消
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setShowContactDeleteConfirm(contact.id)}
                          className="text-red-600 hover:text-red-900 font-medium"
                        >
                          刪除
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {contactSubmissions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      尚無諮詢表單
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </div>

      {/* 下載限制設定彈窗 */}
      {editingLimit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <p className="text-sm text-gray-500">{editingLimit.email}</p>
                <h3 className="text-2xl font-bold text-gray-900">設定下載限制</h3>
                <p className="text-gray-600 mt-1">{editingLimit.name || '未填寫姓名'}</p>
              </div>
              <button
                onClick={() => setEditingLimit(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                type="button"
              >
                <i className="ri-close-line text-3xl"></i>
              </button>
            </div>

            <form onSubmit={handleSaveLimit} className="px-6 py-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">已下載次數</p>
                  <p className="text-3xl font-bold text-gray-900">{editingLimit.downloadCount}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">目前限制</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {editingLimit.limit === -1 ? '無限制' : `${editingLimit.limit} 次`}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  下載次數限制 (輸入 -1 代表無限制)
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="number"
                    required
                    value={editingLimit.limit}
                    onChange={(e) => {
                      const parsed = parseInt(e.target.value, 10);
                      setEditingLimit((prev) => prev ? {
                        ...prev,
                        limit: Number.isNaN(parsed) ? -1 : parsed
                      } : prev);
                    }}
                    disabled={isSavingLimit}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100"
                  />
                  <button
                    type="button"
                    onClick={() => setEditingLimit((prev) => prev ? { ...prev, limit: -1 } : prev)}
                    disabled={isSavingLimit}
                    className="px-4 py-3 border border-teal-200 text-teal-600 rounded-xl hover:bg-teal-50 transition-colors disabled:opacity-50"
                  >
                    設為無限制
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingLimit(null)}
                  className="px-5 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isSavingLimit}
                  className="px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-teal-600 hover:to-emerald-600 transition-all disabled:opacity-50"
                >
                  {isSavingLimit ? '儲存中...' : '儲存設定'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 詳細資料彈窗 */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-8 py-6 flex items-center justify-between z-10">
              <h3 className="text-2xl font-bold text-gray-900">
                {selectedMember.name} 的保障分析報告
              </h3>
              <button
                onClick={() => setSelectedMember(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-3xl"></i>
              </button>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">基本資料</h4>
                  <div className="space-y-3">
                    <p className="flex justify-between"><span className="text-gray-500">姓名：</span> <span className="font-medium">{selectedMember.name}</span></p>
                    <p className="flex justify-between"><span className="text-gray-500">電話：</span> <span className="font-medium">{selectedMember.phone}</span></p>
                    <p className="flex justify-between"><span className="text-gray-500">Email：</span> <span className="font-medium">{selectedMember.email}</span></p>
                    <p className="flex justify-between"><span className="text-gray-500">居住地：</span> <span className="font-medium">{selectedMember.city}</span></p>
                    <p className="flex justify-between"><span className="text-gray-500">Line ID：</span> <span className="font-medium">{selectedMember.line_id}</span></p>
                    <p className="flex justify-between"><span className="text-gray-500">提交時間：</span> <span className="font-medium">{new Date(selectedMember.created_at).toLocaleString('zh-TW')}</span></p>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">個人背景</h4>
                  <div className="space-y-3">
                    <p className="flex justify-between"><span className="text-gray-500">性別：</span> <span className="font-medium">{safeGet(selectedMember.questionnaire_data, 'gender') === 'male' ? '男' : safeGet(selectedMember.questionnaire_data, 'gender') === 'female' ? '女' : '-'}</span></p>
                    <p className="flex justify-between"><span className="text-gray-500">出生日期：</span> <span className="font-medium">{safeGet(selectedMember.questionnaire_data, 'birthDate')}</span></p>
                    <p className="flex justify-between"><span className="text-gray-500">職業等級：</span> <span className="font-medium">{safeGet(selectedMember.questionnaire_data, 'occupation')}</span></p>
                    <p className="flex justify-between"><span className="text-gray-500">規劃對象：</span> <span className="font-medium">{safeGet(selectedMember.questionnaire_data, 'planType') === 'self' ? '本人' : safeGet(selectedMember.questionnaire_data, 'planType') === 'child' ? '子女' : '-'}</span></p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-xl font-bold text-gray-900">問卷詳細內容</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">期望病房類型</div>
                    <div className="font-medium text-lg">
                      {safeGet(selectedMember.questionnaire_data, 'roomType') === 'single' ? '單人房' :
                       safeGet(selectedMember.questionnaire_data, 'roomType') === 'double' ? '雙人房' :
                       safeGet(selectedMember.questionnaire_data, 'roomType') === 'health-insurance' ? '健保房' : '-'}
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">期望住院日額</div>
                    <div className="font-medium text-lg text-teal-600">
                      {formatNumber(safeGet(selectedMember.questionnaire_data, 'hospitalDaily', 0))} 元/日
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">手術醫療補貼</div>
                    <div className="font-medium text-lg">
                      {(() => {
                        const value = safeGet(selectedMember.questionnaire_data, 'surgerySubsidy');
                        if (value === 'full' || value === 'complete') return '全額負擔 (30-40萬)';
                        if (value === 'recommended') return '建議額度 (20-30萬)';
                        if (value === 'basic' || value === 'partial') return '基本額度 (10-20萬)';
                        return '-';
                      })()}
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">薪資損失補償（萬/月）</div>
                    <div className="font-medium text-lg text-teal-600">
                      {Math.round(safeGet(selectedMember.questionnaire_data, 'salaryLoss', 0) / 10000)} 萬/月
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">每月生活開銷（萬/年）</div>
                    <div className="font-medium text-lg text-teal-600">
                      {Math.round(safeGet(selectedMember.questionnaire_data, 'livingExpense', 0) * 12 / 10000)} 萬/年
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">治療費用補償（萬）</div>
                    <div className="font-medium text-lg text-teal-600">
                      {Math.round(safeGet(selectedMember.questionnaire_data, 'treatmentCost', 0) / 10000)} 萬
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">長照費用需求（萬/月）</div>
                    <div className="font-medium text-lg text-teal-600">
                      {Math.round(safeGet(selectedMember.questionnaire_data, 'longTermCare', 0) / 10000)} 萬/月
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">家人照顧金</div>
                    <div className="font-medium text-lg text-teal-600">
                      {formatNumber(safeGet(selectedMember.questionnaire_data, 'familyCare', 0))} 元
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">個人負債</div>
                    <div className="font-medium text-lg text-teal-600">
                      {formatNumber(safeGet(selectedMember.questionnaire_data, 'personalDebt', 0))} 元
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">月收入（萬）</div>
                    <div className="font-medium text-lg text-teal-600">
                      {Math.round(safeGet(selectedMember.questionnaire_data, 'monthlyIncome', 0) / 10000)} 萬/月
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 space-y-6">
                <h4 className="text-xl font-bold text-gray-900">其他需求評估</h4>
                <div className="grid grid-cols-1 gap-6">
                  <div className="border border-gray-200 rounded-lg p-4 bg-purple-50">
                    <div className="text-sm text-gray-500 mb-1">保險了解程度</div>
                    <div className="font-medium text-lg text-purple-700">
                      {OPTIONS_MAP.insuranceKnowledge[safeGet(selectedMember.questionnaire_data, 'insuranceKnowledge')] || safeGet(selectedMember.questionnaire_data, 'insuranceKnowledge')}
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4 bg-emerald-50">
                    <div className="text-sm text-gray-500 mb-1">保單健診期望</div>
                    <div className="font-medium text-lg text-emerald-700">
                      {(safeGet(selectedMember.questionnaire_data, 'policyCheckExpectations', []) as string[])
                        .map(val => OPTIONS_MAP.policyCheckExpectations[val] || val)
                        .join('、') || '-'}
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
                    <div className="text-sm text-gray-500 mb-1">每月預算</div>
                    <div className="font-medium text-lg text-blue-700">
                      {OPTIONS_MAP.monthlyBudget[safeGet(selectedMember.questionnaire_data, 'monthlyBudget')] || safeGet(selectedMember.questionnaire_data, 'monthlyBudget')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 進度條 */}
            {isGeneratingPDF && (
              <div className="px-8 py-4 bg-teal-50 border-t border-teal-100">
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
              </div>
            )}

            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6 flex justify-end">
              <div className="flex gap-3">
                <button
                  onClick={() => handleDownloadPDF(selectedMember)}
                  disabled={isGeneratingPDF}
                  className="px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-teal-600 hover:to-emerald-600 transition-all cursor-pointer disabled:opacity-50 shadow-lg"
                >
                  {isGeneratingPDF ? (
                    <>
                      <i className="ri-loader-4-line animate-spin mr-2"></i>
                      生成中...
                    </>
                  ) : (
                    <>
                      <i className="ri-download-line mr-2"></i>
                      下載 PDF
                    </>
                  )}
                </button>
                <button
                  onClick={() => setSelectedMember(null)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  關閉
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
