import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface PdfTemplate {
  id: string;
  name: string;
  description: string;
  header_html: string;
  basic_info_html: string;
  medical_html: string;
  critical_html: string;
  longterm_html: string;
  life_html: string;
  accident_html: string;
  footer_html: string;
  styles: string;
  is_active: boolean;
}

interface Props {
  onBack?: () => void;
}

const TEMPLATE_SECTIONS = [
  { key: 'header_html', label: '標題區塊', icon: 'ri-heading' },
  { key: 'basic_info_html', label: '基本資料', icon: 'ri-user-line' },
  { key: 'medical_html', label: '醫療保障', icon: 'ri-hospital-line' },
  { key: 'critical_html', label: '重症保障', icon: 'ri-heart-pulse-line' },
  { key: 'longterm_html', label: '長照保障', icon: 'ri-wheelchair-line' },
  { key: 'life_html', label: '壽險保障', icon: 'ri-shield-user-line' },
  { key: 'accident_html', label: '意外保障', icon: 'ri-alert-line' },
  { key: 'footer_html', label: '頁尾區塊', icon: 'ri-file-text-line' },
  { key: 'styles', label: 'CSS 樣式', icon: 'ri-code-line' },
];

const AVAILABLE_VARIABLES = [
  { var: '{{name}}', desc: '客戶姓名' },
  { var: '{{phone}}', desc: '電話' },
  { var: '{{lineId}}', desc: 'Line ID' },
  { var: '{{city}}', desc: '居住城市' },
  { var: '{{roomType}}', desc: '病房類型' },
  { var: '{{roomCost}}', desc: '病房費用' },
  { var: '{{hospitalDaily}}', desc: '住院日額' },
  { var: '{{surgeryRange}}', desc: '手術補貼範圍' },
  { var: '{{salaryLossInTenThousand}}', desc: '薪資損失(萬)' },
  { var: '{{livingExpenseInTenThousand}}', desc: '生活開銷(萬/年)' },
  { var: '{{treatmentCostInTenThousand}}', desc: '治療費用(萬)' },
  { var: '{{longTermCareInTenThousand}}', desc: '長照費用(萬)' },
  { var: '{{personalDebt}}', desc: '個人債務' },
  { var: '{{familyCare}}', desc: '家人照顧金' },
  { var: '{{monthlyIncomeInTenThousand}}', desc: '月收入(萬)' },
  { var: '{{generatedDate}}', desc: '報告生成日期' },
];

export default function PdfTemplateEditor({ onBack }: Props) {
  const [template, setTemplate] = useState<PdfTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('header_html');
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
          header_html: template.header_html,
          basic_info_html: template.basic_info_html,
          medical_html: template.medical_html,
          critical_html: template.critical_html,
          longterm_html: template.longterm_html,
          life_html: template.life_html,
          accident_html: template.accident_html,
          footer_html: template.footer_html,
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
      '{{salaryLossInTenThousand}}': '36',
      '{{livingExpenseInTenThousand}}': '48',
      '{{treatmentCostInTenThousand}}': '100',
      '{{longTermCareInTenThousand}}': '300',
      '{{personalDebt}}': '500,000',
      '{{familyCare}}': '3,000,000',
      '{{monthlyIncomeInTenThousand}}': '5',
      '{{generatedDate}}': new Date().toLocaleDateString('zh-TW'),
    };

    // 預覽時使用與前端 PDF 生成一致的結構和樣式
    // 使用 reset CSS 確保預覽效果不受外部影響
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
        ${template.styles}
      </style>
      <div class="pdf-preview-wrapper">
        <div class="pdf-page">
          ${template.header_html}
          ${template.basic_info_html}
          ${template.medical_html}
          ${template.critical_html}
          ${template.longterm_html}
          ${template.life_html}
          ${template.accident_html}
          ${template.footer_html}
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
        {/* Sidebar - Section Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="font-semibold text-gray-700 mb-3">模板區塊</h3>
          <div className="space-y-1">
            {TEMPLATE_SECTIONS.map((section) => (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  activeSection === section.key
                    ? 'bg-teal-50 text-teal-700'
                    : 'hover:bg-gray-50 text-gray-600'
                }`}
              >
                <i className={`${section.icon} text-lg`}></i>
                <span className="text-sm">{section.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Editor */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">
              {TEMPLATE_SECTIONS.find(s => s.key === activeSection)?.label}
            </h3>
            <span className="text-xs text-gray-400">支援 HTML 格式</span>
          </div>
          <textarea
            value={(template as any)[activeSection] || ''}
            onChange={(e) => handleFieldChange(activeSection, e.target.value)}
            className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="輸入 HTML 內容..."
          />
        </div>

        {/* Variables Reference */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="font-semibold text-gray-700 mb-3">可用變數</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {AVAILABLE_VARIABLES.map((v) => (
              <div
                key={v.var}
                className="text-xs p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-teal-50"
                onClick={() => navigator.clipboard.writeText(v.var)}
                title="點擊複製"
              >
                <code className="text-teal-600 font-mono">{v.var}</code>
                <p className="text-gray-500 mt-1">{v.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">點擊變數可複製</p>
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
