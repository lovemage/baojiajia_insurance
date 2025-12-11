import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabase';

interface PdfTemplate {
  id: string;
  name: string;
  description: string;
  html_content: string;
  styles: string;
  is_active: boolean;
  custom_variables?: Record<string, string>; // key: description
  // Since we need value too, maybe we should store as array or object with value?
  // User request: "variable section add admin custom fixed variables"
  // It implies these are static values.
  // I will store as { key: { desc: string, value: string } }
  // But JSONB in Supabase is flexible.
  // Let's use a simpler array of objects in JSONB:
  // custom_variables: { key: string, desc: string, value: string }[]
}

interface CustomVariable {
  key: string;
  desc: string;
  value: string;
}

interface Props {
  onBack?: () => void;
}

const ADULT_SVG_BASE = '/pdf_svg_html_模板製作/adult/';
const CHILD_SVG_BASE = '/pdf_svg_html_模板製作/child/';
const convertHtmlAdultAssetsToChild = (html: string) => html
  .replace(/\/pdf_svg_html_模板製作\/adult\//g, CHILD_SVG_BASE)
  .replace(/\/pdf-templates\/adult\//g, CHILD_SVG_BASE);

const DEFAULT_VARIABLES = [
  // 基本資料
  { var: '{{name}}', desc: '客戶姓名' },
  { var: '{{phone}}', desc: '電話' },
  { var: '{{lineId}}', desc: 'Line ID' },
  { var: '{{city}}', desc: '居住城市' },
  { var: '{{generatedDate}}', desc: '報告生成日期' },
  
  // 問卷變數 (Adult: 17個, Child: 11個)
  { var: '{{roomCost}}', desc: '病房費用' },
  { var: '{{hospitalDaily}}', desc: '住院日額' },
  { var: '{{surgeryRange}}', desc: '手術補貼範圍' },
  // 重症
  { var: '{{salaryLossInTenThousand}}', desc: '薪資損失(萬)' },
  { var: '{{livingExpenseInTenThousand}}', desc: '生活開銷(萬/年)' },
  { var: '{{treatmentCostInTenThousand}}', desc: '治療費用(萬)' },
  { var: '{{fixedOneTimeBenefit}}', desc: '一次性理賠金(固定100)' },
  // 長照 (4個)
  { var: '{{longTermCare1to6Disease}}', desc: '1~6級扶助金(疾病)' },
  { var: '{{longTermCare1to6Accident}}', desc: '1~6級扶助金(意外)' },
  { var: '{{longTermCare1to11Disease}}', desc: '1~11級一次金(疾病)' },
  { var: '{{longTermCare1to11Accident}}', desc: '1~11級一次金(意外)' },
  // 壽險 & 意外 (Adult only)
  { var: '{{personalDebt}}', desc: '個人債務' },
  { var: '{{familyCare}}', desc: '家人照顧金' },
  { var: '{{accidentDailyRange}}', desc: '意外住院日額(固定)' },
  { var: '{{accidentReimbursementRange}}', desc: '意外實支實付(固定)' },
  { var: '{{majorBurnRange}}', desc: '重大燒燙傷(固定)' },
  { var: '{{homeCareInTenThousand}}', desc: '居家休養費用(萬)' },
  // 幼兒專用
  { var: '{{childDeathBenefit}}', desc: '幼兒身故理賠金(固定69萬)' },
];

export default function PdfTemplateEditor({ onBack }: Props) {
  const [templates, setTemplates] = useState<PdfTemplate[]>([]);
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [viewMode, setViewMode] = useState<'visual' | 'code'>('visual');
  
  // Custom Variables State
  const [showVarModal, setShowVarModal] = useState(false);
  const [newVar, setNewVar] = useState<CustomVariable>({ key: '', desc: '', value: '' });

  const currentTemplate = templates.find(t => t.id === currentTemplateId) || null;

  // Merge default and custom variables
  const customVarsArray = currentTemplate?.custom_variables && Array.isArray(currentTemplate.custom_variables) 
    ? currentTemplate.custom_variables 
    : [];
  const availableVariables = [
    ...DEFAULT_VARIABLES,
    ...customVarsArray.map((v: any) => ({
      var: v.key,
      desc: v.desc + ' (自定義)'
    }))
  ];

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('pdf_templates')
        .select('*')
        .order('name');

      if (error) throw error;
      
      if (data && data.length > 0) {
        setTemplates(data);
        const adult = data.find(t => t.name === 'adult');
        setCurrentTemplateId(adult ? adult.id : data[0].id);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChildTemplate = async () => {
    if (!currentTemplate) return;
    if (!confirm('確定要複製當前模板並創建「child」模板嗎？')) return;
    
    setSaving(true);
    try {
      const childHtml = convertHtmlAdultAssetsToChild(currentTemplate.html_content || '');
      
      const { data, error } = await supabase
        .from('pdf_templates')
        .insert({
          name: 'child',
          description: '兒童版保障需求分析報告',
          html_content: childHtml,
          styles: currentTemplate.styles,
          custom_variables: currentTemplate.custom_variables,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      
      setTemplates([...templates, data]);
      setCurrentTemplateId(data.id);
      alert('已成功創建 child 模板！');
    } catch (error) {
      console.error('Error creating child template:', error);
      alert('創建失敗');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!currentTemplate) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from('pdf_templates')
        .update({
          name: currentTemplate.name,
          description: currentTemplate.description,
          html_content: currentTemplate.html_content,
          styles: currentTemplate.styles,
          custom_variables: currentTemplate.custom_variables
        })
        .eq('id', currentTemplate.id);

      if (error) throw error;
      
      setTemplates(templates.map(t => t.id === currentTemplate.id ? currentTemplate : t));
      alert('模板已儲存！');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('儲存失敗，請稍後再試');
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (key: string, value: any) => {
    if (!currentTemplate) return;
    const updated = { ...currentTemplate, [key]: value };
    setTemplates(templates.map(t => t.id === currentTemplate.id ? updated : t));
  };

  const handleAddCustomVariable = () => {
    if (!currentTemplate) return;
    if (!newVar.key || !newVar.value) {
      alert('請填寫變數名稱和數值');
      return;
    }
    
    // Ensure key has braces
    let key = newVar.key;
    if (!key.startsWith('{{')) key = '{{' + key;
    if (!key.endsWith('}}')) key = key + '}}';

    const currentVars = (currentTemplate.custom_variables as any) || [];
    const updatedVars = [...currentVars, { ...newVar, key }];
    
    handleFieldChange('custom_variables', updatedVars);
    setNewVar({ key: '', desc: '', value: '' });
    setShowVarModal(false);
  };

  const handleDeleteCustomVariable = (key: string) => {
    if (!currentTemplate) return;
    const currentVars = (currentTemplate.custom_variables as any) || [];
    const updatedVars = currentVars.filter((v: any) => v.key !== key);
    handleFieldChange('custom_variables', updatedVars);
  };

  const generatePreview = () => {
    if (!currentTemplate) return;
    const template = currentTemplate;
    
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

    // Merge custom variables for preview
    const customVars = template.custom_variables && Array.isArray(template.custom_variables) 
      ? template.custom_variables 
      : [];
    customVars.forEach((v: any) => {
      mockData[v.key] = v.value;
    });

    let html = `
      <style>
        .pdf-preview-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          padding: 20px;
          background: #e5e5e5;
        }
        ${template.styles || ''}
      </style>
      <div class="pdf-preview-container">
        ${template.html_content || ''}
      </div>
    `;

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

  if (!currentTemplate && !loading) {
    return (
      <div className="text-center py-12">
        <i className="ri-file-warning-line text-4xl text-gray-400 mb-4"></i>
        <p className="text-gray-500">找不到模板，請確認數據庫已正確設置</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm">
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

        {/* Template Selector */}
        <div className="flex gap-2">
          <select
            value={currentTemplateId || ''}
            onChange={(e) => setCurrentTemplateId(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent min-w-[200px]"
          >
            {templates.map(t => (
              <option key={t.id} value={t.id}>{t.name} ({t.description})</option>
            ))}
          </select>
          {!templates.some(t => t.name === 'child') && (
            <button
              onClick={handleCreateChildTemplate}
              className="px-3 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 whitespace-nowrap text-sm"
              title="複製當前模板並創建「child」模板"
            >
              <i className="ri-add-line mr-1"></i>
              建Child
            </button>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setViewMode(viewMode === 'visual' ? 'code' : 'visual')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              viewMode === 'code' 
                ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <i className={`ri-${viewMode === 'code' ? 'eye-line' : 'code-line'}`}></i>
            {viewMode === 'code' ? '切換可視化編輯' : '顯示原代碼'}
          </button>
          
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
            {saving ? '儲存模板' : '儲存模板'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
        {viewMode === 'code' ? (
          <div className="flex-1 overflow-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">模板名稱</label>
                <input
                  type="text"
                  value={currentTemplate?.name || ''}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">模板說明</label>
                <input
                  type="text"
                  value={currentTemplate?.description || ''}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[800px]">
              <div className="lg:col-span-3 space-y-6 h-full flex flex-col">
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="ri-code-line text-xl text-teal-600"></i>
                    <h3 className="font-bold text-gray-800 text-lg">CSS 樣式</h3>
                  </div>
                  <textarea
                    value={currentTemplate?.styles || ''}
                    onChange={(e) => handleFieldChange('styles', e.target.value)}
                    className="w-full flex-1 px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50"
                  />
                </div>

                <div className="flex-[2] flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="ri-file-code-line text-xl text-teal-600"></i>
                    <h3 className="font-bold text-gray-800 text-lg">HTML 內容</h3>
                  </div>
                  <textarea
                    value={currentTemplate?.html_content || ''}
                    onChange={(e) => handleFieldChange('html_content', e.target.value)}
                    className="w-full flex-1 px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="lg:col-span-1 h-full overflow-hidden flex flex-col">
                <div className="bg-gray-50 rounded-xl p-4 h-full overflow-y-auto">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                      <i className="ri-code-s-slash-line"></i>
                      可用變數
                    </h3>
                    <button
                      onClick={() => setShowVarModal(true)}
                      className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded hover:bg-teal-100"
                    >
                      <i className="ri-add-line mr-1"></i>
                      新增變數
                    </button>
                  </div>
                  <div className="space-y-2">
                    {availableVariables.map((v) => (
                      <div
                        key={v.var}
                        className="group p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-teal-500 transition-all"
                      >
                        <div 
                          className="flex justify-between items-start mb-1"
                          onClick={() => navigator.clipboard.writeText(v.var)}
                        >
                          <code className="text-teal-700 font-mono text-xs font-bold bg-teal-50 px-1.5 py-0.5 rounded">
                            {v.var}
                          </code>
                          <div className="flex gap-2">
                            {v.desc.includes('(自定義)') && (
                              <i 
                                className="ri-delete-bin-line text-red-400 hover:text-red-600 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if(confirm('確定刪除此變數？')) handleDeleteCustomVariable(v.var);
                                }}
                              ></i>
                            )}
                            <i className="ri-file-copy-line text-gray-400 group-hover:text-teal-500 text-xs"></i>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600">{v.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          currentTemplate && (
            <VisualEditor
              key={currentTemplate.id}
              htmlContent={currentTemplate.html_content}
              styles={currentTemplate.styles}
              availableVariables={availableVariables}
              onSave={(newHtml, newStyles) => {
                setTemplates(prev => prev.map(t => 
                  t.id === currentTemplate.id 
                    ? { ...t, html_content: newHtml, styles: newStyles } 
                    : t
                ));
              }}
            />
          )
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-[95vw] max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-gray-800">模板預覽（共 16 頁）</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-gray-200">
              <div
                className="mx-auto"
                style={{
                  transform: 'scale(0.5)',
                  transformOrigin: 'top center',
                  width: '794px'
                }}
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Add Variable Modal */}
      {showVarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">新增自定義固定變數</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">變數名稱 (例如: companyName)</label>
                <input
                  type="text"
                  value={newVar.key}
                  onChange={(e) => setNewVar({ ...newVar, key: e.target.value })}
                  placeholder="companyName"
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-1">系統將自動加上 {'{{ }}'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <input
                  type="text"
                  value={newVar.desc}
                  onChange={(e) => setNewVar({ ...newVar, desc: e.target.value })}
                  placeholder="例如：公司名稱"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">固定數值</label>
                <input
                  type="text"
                  value={newVar.value}
                  onChange={(e) => setNewVar({ ...newVar, value: e.target.value })}
                  placeholder="例如：保家佳保險經紀人"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowVarModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                取消
              </button>
              <button
                onClick={handleAddCustomVariable}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                新增
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 可視化編輯器組件
function VisualEditor({ htmlContent, styles, availableVariables, onSave }: {
  htmlContent: string;
  styles: string;
  availableVariables: any[];
  onSave: (newHtml: string, newStyles: string) => void;
}) {
  const [scale, setScale] = useState(0.8);
  const stylesStringRef = useRef(styles); 
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null); 
  const styleTagRef = useRef<HTMLStyleElement | null>(null);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  
  // 初始化渲染
  useEffect(() => {
    if (!contentRef.current) return;
    
    contentRef.current.innerHTML = htmlContent;
    
    const styleEl = document.createElement('style');
    styleEl.textContent = styles;
    contentRef.current.appendChild(styleEl);
    styleTagRef.current = styleEl;
    
    const editorStyle = document.createElement('style');
    editorStyle.textContent = `
      .field {
        cursor: move;
        user-select: none;
        pointer-events: auto !important;
        border: 1px solid #3b82f6;
        background: rgba(59, 130, 246, 0.2);
        transition: none !important;
        z-index: 100 !important;
      }
      .overlay { z-index: 10 !important; }
      .field:hover {
        background: rgba(59, 130, 246, 0.4);
        box-shadow: 0 0 0 2px #3b82f6;
      }
      .selected-field {
        background: rgba(239, 68, 68, 0.2) !important;
        border-color: #ef4444 !important;
        box-shadow: 0 0 0 2px #ef4444, 0 0 10px rgba(0,0,0,0.2) !important;
        z-index: 101 !important;
      }
    `;
    contentRef.current.appendChild(editorStyle);
  }, []); 

  // 自動同步 (Sync Changes) - 用於替代手動保存
  const syncChanges = () => {
    if (!contentRef.current) return;
    
    const contentDiv = contentRef.current;
    
    // 構建新的 CSS 規則塊 (不移除 style 標籤)
    let newPositionStyles = '\n/* === VISUAL EDITOR POSITIONS === */\n';
    const fields = Array.from(contentDiv.querySelectorAll('.field')) as HTMLElement[];
    
    fields.forEach(el => {
      let top = el.style.top;
      let left = el.style.left;
      
      if (!top || !left) {
        const computed = window.getComputedStyle(el);
        top = computed.top !== 'auto' ? computed.top : '0px';
        left = computed.left !== 'auto' ? computed.left : '0px';
      }

      let idClass = Array.from(el.classList).find(c => c.startsWith('v-'));
      if (!idClass) {
        idClass = `v-${Math.random().toString(36).substr(2, 8)}`;
        el.classList.add(idClass);
      }

      newPositionStyles += `.${idClass} { position: absolute !important; top: ${top} !important; left: ${left} !important; }\n`;
    });
    
    newPositionStyles += '/* === END VISUAL EDITOR POSITIONS === */';

    let currentStyles = stylesStringRef.current;
    const blockRegex = /\/\* === VISUAL EDITOR POSITIONS === \*\/[\s\S]*\/\* === END VISUAL EDITOR POSITIONS === \*\//;
    
    if (blockRegex.test(currentStyles)) {
      currentStyles = currentStyles.replace(blockRegex, newPositionStyles);
    } else {
      currentStyles += '\n' + newPositionStyles;
    }
    
    // 更新本地 ref (CSS)
    stylesStringRef.current = currentStyles;
    if (styleTagRef.current) {
        // 同時更新視覺上的 CSS，這樣如果繼續拖曳新添加的元素，位置也能正確讀取
        // 不過要注意不要把新生成的規則覆蓋掉原始規則（雖然 !important 解決了這個問題）
        // 這裡我們只更新 stylesStringRef，不更新 DOM 裡的 styleTagRef，
        // 因為 DOM 裡已經有內聯樣式在撐著了。
    }

    // 準備 HTML (需要一個乾淨的副本)
    // 這裡我們不能直接操作 DOM 移除 class/style，因為那樣編輯器裡的視覺效果就沒了
    // 我們 clone 一份來處理
    const clone = contentDiv.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('style').forEach(s => s.remove());
    
    Array.from(clone.querySelectorAll('.field')).forEach(el => {
      const element = el as HTMLElement;
      element.classList.remove('selected-field');
      element.style.removeProperty('top');
      element.style.removeProperty('left');
      element.style.removeProperty('position');
    });

    const newHtml = clone.innerHTML;
    
    // 通知父組件
    onSave(newHtml, currentStyles);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement) {
        selectedElement.remove();
        setSelectedElement(null);
        syncChanges(); // 同步
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.classList.contains('field')) {
      setSelectedElement(null);
      return;
    }

    e.preventDefault();
    setSelectedElement(target);

    const startX = e.clientX;
    const startY = e.clientY;
    
    const startTop = target.offsetTop;
    const startLeft = target.offsetLeft;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = (moveEvent.clientX - startX) / scale;
      const deltaY = (moveEvent.clientY - startY) / scale;

      const newTop = Math.round(startTop + deltaY);
      const newLeft = Math.round(startLeft + deltaX);

      target.style.top = `${newTop}px`;
      target.style.left = `${newLeft}px`;
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      syncChanges(); // 拖曳結束同步
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const handleDragStart = (e: React.DragEvent, variable: string) => {
    e.dataTransfer.setData('text/plain', variable);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const variable = e.dataTransfer.getData('text/plain');
    if (!variable) return;

    const target = e.target as HTMLElement;
    const pageElement = target.closest('.pdf-page');
    
    if (pageElement) {
      const rect = pageElement.getBoundingClientRect();
      const dropX = (e.clientX - rect.left) / scale;
      const dropY = (e.clientY - rect.top) / scale;

      let overlay = pageElement.querySelector('.overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'overlay';
        pageElement.appendChild(overlay);
      }

      if (overlay) {
        const newSpan = document.createElement('span');
        newSpan.className = 'field';
        newSpan.innerText = variable;
        newSpan.style.position = 'absolute';
        newSpan.style.top = `${Math.round(dropY)}px`;
        newSpan.style.left = `${Math.round(dropX)}px`;
        
        overlay.appendChild(newSpan);
        setSelectedElement(newSpan);
        syncChanges(); // 添加結束同步
      }
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden relative">
      {/* Zoom Controls (Overlay) */}
      <div className="absolute top-4 left-4 z-30 flex items-center gap-2 bg-white rounded-lg shadow-md p-1 border border-gray-200">
        <button 
          onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
          className="p-1.5 hover:bg-gray-100 rounded text-gray-600"
          title="縮小"
        >
          <i className="ri-subtract-line"></i>
        </button>
        <span className="text-sm font-mono w-12 text-center text-gray-700">{Math.round(scale * 100)}%</span>
        <button 
          onClick={() => setScale(s => Math.min(2, s + 0.1))}
          className="p-1.5 hover:bg-gray-100 rounded text-gray-600"
          title="放大"
        >
          <i className="ri-add-line"></i>
        </button>
      </div>

      {/* Canvas Area */}
      <div 
        className="flex-1 overflow-auto p-8 relative bg-gray-100" 
        onMouseDown={handleMouseDown}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <div 
          style={{ 
            transform: `scale(${scale})`, 
            transformOrigin: 'top center',
            width: '794px',
            margin: '0 auto',
            position: 'relative'
          }}
        >
          {/* 這裡不再使用 dangerouslySetInnerHTML 直接渲染，而是交給 contentRef */}
          <div ref={contentRef} />
        </div>
      </div>

      {/* Variables Sidebar */}
      <div className="w-80 bg-white border-l shadow-lg overflow-y-auto z-20 flex flex-col">
        <div className="p-4 border-b bg-gray-50">
          <h4 className="font-bold text-gray-700 flex items-center gap-2">
            <i className="ri-list-settings-line"></i> 可用變數
          </h4>
          <p className="text-xs text-gray-500 mt-1">拖曳變數到左側畫布即可添加</p>
        </div>
        
        <div className="flex-1 p-4 space-y-2">
          {availableVariables.map((v) => (
            <div
              key={v.var}
              draggable
              onDragStart={(e) => handleDragStart(e, v.var)}
              className="group p-3 bg-white border border-gray-200 rounded-lg cursor-grab hover:border-teal-500 hover:shadow-md transition-all active:cursor-grabbing"
            >
              <div className="flex justify-between items-start mb-1">
                <code className="text-teal-700 font-mono text-xs font-bold bg-teal-50 px-1.5 py-0.5 rounded">
                  {v.var}
                </code>
                <i className="ri-drag-move-line text-gray-300 group-hover:text-teal-500"></i>
              </div>
              <p className="text-xs text-gray-600">{v.desc}</p>
            </div>
          ))}
        </div>

        {selectedElement && (
          <div className="p-4 border-t bg-red-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-red-700">已選中項目</span>
              <button 
                onClick={() => {
                  selectedElement.remove();
                  setSelectedElement(null);
                  syncChanges(); // 刪除同步
                }}
                className="text-red-600 hover:text-red-800"
                title="刪除"
              >
                <i className="ri-delete-bin-line text-lg"></i>
              </button>
            </div>
            <div className="text-xs text-gray-600 truncate bg-white p-2 rounded border border-red-100">
              {selectedElement.innerText}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
