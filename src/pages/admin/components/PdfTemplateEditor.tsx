import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface PdfTemplate {
  id: string;
  name: string;
  description: string;
  html_content: string;
  styles: string;
  is_active: boolean;
}

interface Props {
  onBack?: () => void;
}

const AVAILABLE_VARIABLES = [
  { var: '{{name}}', desc: '客戶姓名' },
  { var: '{{phone}}', desc: '電話' },
  { var: '{{lineId}}', desc: 'Line ID' },
  { var: '{{city}}', desc: '居住城市' },
  { var: '{{roomType}}', desc: '病房類型' },
  { var: '{{roomCost}}', desc: '病房費用' },
  { var: '{{hospitalDaily}}', desc: '住院日額' },
  { var: '{{surgeryRange}}', desc: '手術補貼範圍' },
  { var: '{{outpatientSurgeryRange}}', desc: '門診雜費開銷' },
  { var: '{{salaryLossInTenThousand}}', desc: '薪資損失(萬)' },
  { var: '{{livingExpenseInTenThousand}}', desc: '生活開銷(萬/年)' },
  { var: '{{treatmentCostInTenThousand}}', desc: '治療費用(萬)' },
  { var: '{{fixedOneTimeBenefit}}', desc: '一次性理賠金(固定100)' },
  { var: '{{longTermCareInTenThousand}}', desc: '長照費用(萬)' },
  { var: '{{disabilityOneTimeRange}}', desc: '1~11級一次金範圍' },
  { var: '{{personalDebt}}', desc: '個人債務' },
  { var: '{{familyCare}}', desc: '家人照顧金' },
  { var: '{{accidentDailyRange}}', desc: '意外住院日額(固定)' },
  { var: '{{accidentReimbursementRange}}', desc: '意外實支實付(固定)' },
  { var: '{{majorBurnRange}}', desc: '重大燒燙傷(固定)' },
  { var: '{{homeCareInTenThousand}}', desc: '居家休養費用(萬)' },
  { var: '{{monthlyIncomeInTenThousand}}', desc: '月收入(萬)' },
  { var: '{{generatedDate}}', desc: '報告生成日期' },
];

export default function PdfTemplateEditor({ onBack }: Props) {
  const [template, setTemplate] = useState<PdfTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchTemplate();
  }, []);

  const fetchTemplate = async () => {
    try {
      const { data, error } = await supabase
        .from('pdf_templates')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setTemplate(data);
    } catch (error) {
      console.error('Error fetching template:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!template) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from('pdf_templates')
        .update({
          name: template.name,
          description: template.description,
          html_content: template.html_content,
          styles: template.styles,
        })
        .eq('id', template.id);

      if (error) throw error;
      alert('模板已儲存！');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('儲存失敗，請稍後再試');
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (key: string, value: string) => {
    if (!template) return;
    setTemplate({ ...template, [key]: value });
  };

  const generatePreview = () => {
    if (!template) return;

    // 模擬資料
    const mockData: Record<string, string> = {
      '{{name}}': '王小明',
      '{{phone}}': '0912-345-678',
      '{{lineId}}': 'wang_xiaoming',
      '{{city}}': '台北市',
      '{{roomType}}': '單人房',
      '{{roomCost}}': '5,000',
      '{{hospitalDaily}}': '2,000',
      '{{surgeryRange}}': '20~30萬',
      '{{outpatientSurgeryRange}}': '5~10萬',
      '{{salaryLossInTenThousand}}': '36',
      '{{livingExpenseInTenThousand}}': '48',
      '{{treatmentCostInTenThousand}}': '100',
      '{{fixedOneTimeBenefit}}': '100',
      '{{longTermCareInTenThousand}}': '300',
      '{{disabilityOneTimeRange}}': '12.5萬～250萬',
      '{{personalDebt}}': '500,000',
      '{{familyCare}}': '3,000,000',
      '{{accidentDailyRange}}': '1,000～2,000',
      '{{accidentReimbursementRange}}': '5～10',
      '{{majorBurnRange}}': '50～100',
      '{{homeCareInTenThousand}}': '5',
      '{{monthlyIncomeInTenThousand}}': '5',
      '{{generatedDate}}': new Date().toLocaleDateString('zh-TW'),
    };

    let html = `
      <style>
        .pdf-preview-wrapper {
          all: initial;
          font-family: sans-serif;
          background: #f0f0f0;
          padding: 20px;
          display: flex;
          justify-content: center;
        }
        .pdf-page {
          width: 210mm;
          min-height: 297mm;
          padding: 20mm;
          background: white;
          box-sizing: border-box;
          position: relative;
          font-family: "Microsoft JhengHei", "PingFang TC", sans-serif;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
          margin-bottom: 20px;
        }
        ${template.styles || ''}
      </style>
      <div class="pdf-preview-wrapper">
        <div class="pdf-page">
          ${template.html_content || ''}
        </div>
      </div>
    `;

    // 替換變數
    Object.entries(mockData).forEach(([key, value]) => {
      html = html.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
    });

    setPreviewHtml(html);
    setShowPreview(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="text-center py-12">
        <i className="ri-file-warning-line text-4xl text-gray-400 mb-4"></i>
        <p className="text-gray-500">找不到模板，請確認數據庫已正確設置</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
              <i className="ri-arrow-left-line text-xl"></i>
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-800">PDF 報告模板</h1>
            <p className="text-gray-500 text-sm">編輯保障需求分析報告的 PDF 模板</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={generatePreview}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
          >
            <i className="ri-eye-line"></i>
            預覽
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2"
          >
            <i className={saving ? 'ri-loader-4-line animate-spin' : 'ri-save-line'}></i>
            {saving ? '儲存中...' : '儲存模板'}
          </button>
        </div>
      </div>

      {/* Template Name */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">模板名稱</label>
            <input
              type="text"
              value={template.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">模板說明</label>
            <input
              type="text"
              value={template.description || ''}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-3 space-y-6">
          {/* CSS 樣式編輯器 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <i className="ri-code-line text-xl text-teal-600"></i>
              <h3 className="font-bold text-gray-800 text-lg">CSS 樣式</h3>
            </div>
            <textarea
              value={template.styles || ''}
              onChange={(e) => handleFieldChange('styles', e.target.value)}
              className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50"
              placeholder="輸入 CSS 樣式..."
            />
            <p className="text-xs text-gray-500 mt-2">
              <i className="ri-information-line mr-1"></i>
              此處定義的 CSS 將套用到 PDF 內容。
            </p>
          </div>

          {/* HTML 內容編輯器 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <i className="ri-file-code-line text-xl text-teal-600"></i>
              <h3 className="font-bold text-gray-800 text-lg">HTML 內容</h3>
            </div>
            <textarea
              value={template.html_content || ''}
              onChange={(e) => handleFieldChange('html_content', e.target.value)}
              className="w-full h-[500px] px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="輸入 HTML 內容，可使用變數如 {{name}}、{{phone}} 等..."
            />
            <p className="text-xs text-gray-500 mt-2">
              <i className="ri-information-line mr-1"></i>
              在 HTML 中使用右側的變數，生成 PDF 時會自動替換為實際資料。
            </p>
          </div>
        </div>

        {/* Sidebar - Variables Reference (Sticky) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-4 sticky top-6">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <i className="ri-code-s-slash-line"></i>
              可用變數
            </h3>
            <div className="space-y-2 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
              {AVAILABLE_VARIABLES.map((v) => (
                <div
                  key={v.var}
                  className="group p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-teal-50 transition-colors border border-transparent hover:border-teal-100"
                  onClick={() => {
                    navigator.clipboard.writeText(v.var);
                  }}
                  title="點擊複製變數"
                >
                  <div className="flex justify-between items-start mb-1">
                    <code className="text-teal-700 font-mono text-xs font-bold bg-teal-100 px-1.5 py-0.5 rounded">
                      {v.var}
                    </code>
                    <i className="ri-file-copy-line text-gray-400 group-hover:text-teal-500 text-xs"></i>
                  </div>
                  <p className="text-xs text-gray-600">{v.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400 flex items-center gap-1">
              <i className="ri-information-line"></i>
              點擊變數可直接複製到剪貼簿
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-gray-800">模板預覽</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6 bg-gray-50">
              <div
                className="bg-white p-8 shadow-lg mx-auto"
                style={{ maxWidth: '800px' }}
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
