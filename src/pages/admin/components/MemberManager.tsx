import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import html2pdf from 'html2pdf.js';

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

interface MemberGroup {
  email: string;
  user_id: string;
  name: string;
  phone: string;
  submissions: MemberSubmission[];
  last_submission_at: string;
}

// 安全讀取數據的輔助函數
const safeGet = (obj: any, path: string, defaultValue: any = '-') => {
  try {
    const value = path.split('.').reduce((o, k) => (o || {})[k], obj);
    return value !== undefined && value !== null ? value : defaultValue;
  } catch {
    return defaultValue;
  }
};

export default function MemberManager() {
  const [memberGroups, setMemberGroups] = useState<MemberGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<MemberSubmission | null>(null);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('member_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Group by email
      const groups: Record<string, MemberGroup> = {};
      
      (data || []).forEach((submission: MemberSubmission) => {
        const key = submission.email;
        if (!groups[key]) {
          groups[key] = {
            email: submission.email,
            user_id: submission.user_id,
            name: submission.name,
            phone: submission.phone,
            submissions: [],
            last_submission_at: submission.created_at
          };
        }
        groups[key].submissions.push(submission);
        // Keep latest info
        if (new Date(submission.created_at) > new Date(groups[key].last_submission_at)) {
           groups[key].last_submission_at = submission.created_at;
           groups[key].name = submission.name;
           groups[key].phone = submission.phone;
        }
      });

      // Sort submissions within groups
      Object.values(groups).forEach(g => {
        g.submissions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      });

      // Convert to array and sort by last submission date
      const sortedGroups = Object.values(groups).sort((a, b) => 
        new Date(b.last_submission_at).getTime() - new Date(a.last_submission_at).getTime()
      );

      setMemberGroups(sortedGroups);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubmission = async (id: string) => {
    setDeleting(id);
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
      setDeleting(null);
    }
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

      // 從 Supabase 獲取 PDF 模板
      const { data: templateData, error: templateError } = await supabase
        .from('pdf_templates')
        .select('*')
        .eq('is_active', true)
        .single();

      if (templateError) {
        throw new Error('無法載入 PDF 模板');
      }

      // 準備 PDF 填寫資料
      const formatNumber = (num: number) => (num || 0).toLocaleString('zh-TW');
      const roomTypeText = data.roomType === 'double' ? '雙人房' :
                          data.roomType === 'single' ? '單人房' : '健保房';

      const pdfVariables: Record<string, string> = {
        '{{name}}': member.name || '-',
        '{{phone}}': member.phone || '-',
        '{{lineId}}': member.line_id || '-',
        '{{city}}': member.city || '-',
        '{{roomType}}': roomTypeText,
        '{{roomCost}}': formatNumber(data.roomType === 'double' ? 3000 : data.roomType === 'single' ? 5000 : 0),
        '{{hospitalDaily}}': formatNumber(data.hospitalDaily || 0),
        '{{surgeryRange}}': data.surgerySubsidy === 'full' ? '30~40萬' :
                           data.surgerySubsidy === 'recommended' ? '20~30萬' : '10~20萬',
        '{{salaryLossInTenThousand}}': String(Math.round((data.salaryLoss || 0) / 10000)),
        '{{livingExpenseInTenThousand}}': String(Math.round((data.livingExpense || 0) * 12 / 10000)),
        '{{treatmentCostInTenThousand}}': String(Math.round((data.treatmentCost || 0) / 10000)),
        '{{longTermCareInTenThousand}}': String(Math.round((data.longTermCare || 0) / 10000)),
        '{{personalDebt}}': formatNumber(data.personalDebt || 0),
        '{{familyCare}}': formatNumber(data.familyCare || 0),
        '{{monthlyIncomeInTenThousand}}': String(Math.round((data.monthlyIncome || 0) / 10000)),
        '{{generatedDate}}': new Date().toLocaleDateString('zh-TW'),
      };

      // 替換變數
      let processedStyles = templateData.styles || '';
      Object.entries(pdfVariables).forEach(([key, value]) => {
        processedStyles = processedStyles.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
      });

      let header = templateData.header_html || '';
      let basicInfo = templateData.basic_info_html || '';
      let medical = templateData.medical_html || '';
      let critical = templateData.critical_html || '';
      let longterm = templateData.longterm_html || '';
      let life = templateData.life_html || '';
      let accident = templateData.accident_html || '';
      let footer = templateData.footer_html || '';

      [header, basicInfo, medical, critical, longterm, life, accident, footer].forEach((html, index) => {
        let processedHtml = html;
        Object.entries(pdfVariables).forEach(([key, value]) => {
          processedHtml = processedHtml.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
        });

        switch(index) {
          case 0: header = processedHtml; break;
          case 1: basicInfo = processedHtml; break;
          case 2: medical = processedHtml; break;
          case 3: critical = processedHtml; break;
          case 4: longterm = processedHtml; break;
          case 5: life = processedHtml; break;
          case 6: accident = processedHtml; break;
          case 7: footer = processedHtml; break;
        }
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
          ${header}
          ${basicInfo}
          ${medical}
          ${critical}
          ${longterm}
          ${life}
          ${accident}
          ${footer}
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">會員資訊管理</h1>
          <p className="text-gray-600">查看所有註冊會員及問卷資料</p>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900"></th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">會員資料 (姓名/Email)</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">電話</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">最新下載時間</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">下載次數</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {memberGroups.map((group) => (
                  <>
                    <tr 
                      key={group.email} 
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setExpandedGroup(expandedGroup === group.email ? null : group.email)}
                    >
                      <td className="px-6 py-4 w-10 text-center">
                        <i className={`ri-arrow-right-s-line transition-transform duration-200 text-gray-400 text-xl ${
                          expandedGroup === group.email ? 'rotate-90' : ''
                        }`}></i>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{group.name || '未填寫'}</div>
                        <div className="text-sm text-gray-500">{group.email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{group.phone || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(group.last_submission_at).toLocaleString('zh-TW')}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                          {group.submissions.length} 次
                        </span>
                      </td>
                    </tr>
                    
                    {expandedGroup === group.email && (
                      <tr>
                        <td colSpan={5} className="bg-gray-50 p-4">
                          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <table className="w-full">
                              <thead className="bg-gray-100 text-xs text-gray-500 uppercase">
                                <tr>
                                  <th className="px-4 py-2 text-left">下載時間</th>
                                  <th className="px-4 py-2 text-left">居住地</th>
                                  <th className="px-4 py-2 text-left">Line ID</th>
                                  <th className="px-4 py-2 text-right">操作</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {group.submissions.map((submission) => (
                                  <tr key={submission.id} className="text-sm hover:bg-gray-50">
                                    <td className="px-4 py-3 text-gray-600">
                                      {new Date(submission.created_at).toLocaleString('zh-TW')}
                                    </td>
                                    <td className="px-4 py-3 text-gray-900">{submission.city}</td>
                                    <td className="px-4 py-3 text-gray-900">{submission.line_id}</td>
                                    <td className="px-4 py-3 text-right space-x-2">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedMember(submission);
                                        }}
                                        className="text-teal-600 hover:text-teal-900 font-medium"
                                      >
                                        詳情
                                      </button>
                                      {showDeleteConfirm === submission.id ? (
                                        <>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteSubmission(submission.id);
                                            }}
                                            className="text-red-600 hover:text-red-900 font-medium"
                                          >
                                            確認
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setShowDeleteConfirm(null);
                                            }}
                                            className="text-gray-500 hover:text-gray-700"
                                          >
                                            取消
                                          </button>
                                        </>
                                      ) : (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setShowDeleteConfirm(submission.id);
                                          }}
                                          className="text-red-600 hover:text-red-900 font-medium"
                                        >
                                          刪除
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
                {memberGroups.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      尚無會員資料
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

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
                       safeGet(selectedMember.questionnaire_data, 'roomType') === 'standard' ? '健保房' : '-'}
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">期望住院日額</div>
                    <div className="font-medium text-lg text-teal-600">
                      {safeGet(selectedMember.questionnaire_data, 'hospitalDaily', 0)?.toLocaleString() || 0} 元/日
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">手術醫療補貼</div>
                    <div className="font-medium text-lg">
                      {safeGet(selectedMember.questionnaire_data, 'surgerySubsidy') === 'full' ? '全額負擔 (30-40萬)' :
                       safeGet(selectedMember.questionnaire_data, 'surgerySubsidy') === 'recommended' ? '建議額度 (20-30萬)' :
                       safeGet(selectedMember.questionnaire_data, 'surgerySubsidy') === 'basic' ? '基本額度 (10-20萬)' : '-'}
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">薪資損失補償</div>
                    <div className="font-medium text-lg text-teal-600">
                      {safeGet(selectedMember.questionnaire_data, 'salaryLoss', 0)?.toLocaleString() || 0} 元/月
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">每月生活開銷</div>
                    <div className="font-medium text-lg text-teal-600">
                      {safeGet(selectedMember.questionnaire_data, 'livingExpense', 0)?.toLocaleString() || 0} 元/月
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">治療費用補償</div>
                    <div className="font-medium text-lg text-teal-600">
                      {safeGet(selectedMember.questionnaire_data, 'treatmentCost', 0)?.toLocaleString() || 0} 元
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">長照費用需求</div>
                    <div className="font-medium text-lg text-teal-600">
                      {safeGet(selectedMember.questionnaire_data, 'longTermCare', 0)?.toLocaleString() || 0} 元/月
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">家人照顧金</div>
                    <div className="font-medium text-lg text-teal-600">
                      {safeGet(selectedMember.questionnaire_data, 'familyCare', 0)?.toLocaleString() || 0} 元
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">個人負債</div>
                    <div className="font-medium text-lg text-teal-600">
                      {safeGet(selectedMember.questionnaire_data, 'personalDebt', 0)?.toLocaleString() || 0} 元
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">月收入</div>
                    <div className="font-medium text-lg text-teal-600">
                      {safeGet(selectedMember.questionnaire_data, 'monthlyIncome', 0)?.toLocaleString() || 0} 元/月
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
