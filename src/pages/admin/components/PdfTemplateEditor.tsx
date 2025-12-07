import { useState, useEffect, useRef } from 'react';
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
  const [templates, setTemplates] = useState<PdfTemplate[]>([]);
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showVisualEditor, setShowVisualEditor] = useState(false);

  const currentTemplate = templates.find(t => t.id === currentTemplateId) || null;

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
      const childHtml = currentTemplate.html_content.replace(/\/pdf-templates\/adult\//g, '/pdf-templates/child/');
      
      const { data, error } = await supabase
        .from('pdf_templates')
        .insert({
          name: 'child',
          description: '兒童版保障需求分析報告',
          html_content: childHtml,
          styles: currentTemplate.styles,
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

  const handleFieldChange = (key: string, value: string) => {
    if (!currentTemplate) return;
    const updated = { ...currentTemplate, [key]: value };
    setTemplates(templates.map(t => t.id === currentTemplate.id ? updated : t));
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
            onClick={() => setShowVisualEditor(true)}
            className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 flex items-center gap-2"
          >
            <i className="ri-drag-move-2-line"></i>
            可視化調整位置
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
            {saving ? '儲存中...' : '儲存模板'}
          </button>
        </div>
      </div>

      {/* Template Selector & Info */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">選擇模板</label>
            <div className="flex gap-2">
              <select
                value={currentTemplateId || ''}
                onChange={(e) => setCurrentTemplateId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
          </div>
          
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">模板名稱 (識別代碼)</label>
            <input
              type="text"
              value={currentTemplate?.name || ''}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="例如: adult, child"
            />
            <p className="text-xs text-gray-500 mt-1">請使用 'adult' 或 'child' 以便系統識別</p>
          </div>
          
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">模板說明</label>
            <input
              type="text"
              value={currentTemplate?.description || ''}
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
              value={currentTemplate?.styles || ''}
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
              value={currentTemplate?.html_content || ''}
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

      {/* Visual Editor Modal */}
      {showVisualEditor && currentTemplate && (
        <VisualEditor
          htmlContent={currentTemplate.html_content}
          styles={currentTemplate.styles}
          onSave={(newHtml, newStyles) => {
            handleFieldChange('html_content', newHtml);
            handleFieldChange('styles', newStyles);
            setShowVisualEditor(false);
          }}
          onClose={() => setShowVisualEditor(false)}
        />
      )}
    </div>
  );
}

// 可視化編輯器組件
function VisualEditor({ htmlContent, styles, onSave, onClose }: {
  htmlContent: string;
  styles: string;
  onSave: (newHtml: string, newStyles: string) => void;
  onClose: () => void;
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
    
    // 1. 設置 HTML
    contentRef.current.innerHTML = htmlContent;
    
    // 2. 遷移舊元素：確保每個 .field 都有唯一的 ID class
    const fields = contentRef.current.querySelectorAll('.field');
    fields.forEach(el => {
      const element = el as HTMLElement;
      // 檢查是否有以 v- 開頭的 class
      const hasIdClass = Array.from(element.classList).some(c => c.startsWith('v-'));
      if (!hasIdClass) {
        // 如果沒有，生成一個並加上
        const newIdClass = `v-${Math.random().toString(36).substr(2, 8)}`;
        element.classList.add(newIdClass);
      }
    });

    // 3. 設置樣式
    const styleEl = document.createElement('style');
    styleEl.textContent = styles;
    contentRef.current.appendChild(styleEl);
    styleTagRef.current = styleEl;
    
    // 4. 注入編輯器專用樣式
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

  const handleSave = () => {
    if (!contentRef.current) return;
    
    const contentDiv = contentRef.current;
    
    // 1. 移除注入的 style 標籤
    contentDiv.querySelectorAll('style').forEach(s => s.remove());
    
    // 2. 構建新的 CSS 規則塊
    let newPositionStyles = '\n/* === VISUAL EDITOR POSITIONS === */\n';
    
    const fields = Array.from(contentDiv.querySelectorAll('.field')) as HTMLElement[];
    
    fields.forEach(el => {
      // 移除選中狀態
      el.classList.remove('selected-field');

      // 獲取位置 (優先從 style 獲取，如果是拖曳過的；如果沒動過，這裡可能是空，則需要讀取 computed)
      // 注意：如果是剛初始化的舊元素，style.top 是空的。
      // 我們需要確保所有元素的位置都被寫入。
      
      let top = el.style.top;
      let left = el.style.left;
      
      if (!top || !left) {
        // 如果內聯樣式為空，嘗試讀取 computed style
        const computed = window.getComputedStyle(el);
        top = computed.top !== 'auto' ? computed.top : '0px';
        left = computed.left !== 'auto' ? computed.left : '0px';
      }

      // 獲取 Unique Class
      const idClass = Array.from(el.classList).find(c => c.startsWith('v-'));
      
      if (idClass) {
        // 生成 CSS 規則，使用 !important 確保覆蓋舊樣式
        newPositionStyles += `.${idClass} { position: absolute !important; top: ${top} !important; left: ${left} !important; }\n`;
      }

      // 清理內聯樣式 (保持 HTML 整潔)
      el.style.removeProperty('top');
      el.style.removeProperty('left');
      el.style.removeProperty('position');
    });
    
    newPositionStyles += '/* === END VISUAL EDITOR POSITIONS === */';

    // 3. 更新 CSS 字串
    let currentStyles = stylesStringRef.current;
    
    // 移除舊的 VISUAL EDITOR POSITIONS 區塊 (如果存在)
    const blockRegex = /\/\* === VISUAL EDITOR POSITIONS === \*\/[\s\S]*\/\* === END VISUAL EDITOR POSITIONS === \*\//;
    if (blockRegex.test(currentStyles)) {
      currentStyles = currentStyles.replace(blockRegex, newPositionStyles);
    } else {
      currentStyles += '\n' + newPositionStyles;
    }

    // 4. 獲取清理後的 HTML
    const newHtml = contentDiv.innerHTML;
    
    onSave(newHtml, currentStyles);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement) {
        selectedElement.remove();
        setSelectedElement(null);
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

      const overlay = pageElement.querySelector('.overlay');
      if (overlay) {
        const newSpan = document.createElement('span');
        const uniqueClass = `v-${Math.random().toString(36).substr(2, 8)}`;
        
        newSpan.className = `field ${uniqueClass}`;
        newSpan.innerText = variable;
        newSpan.style.position = 'absolute';
        newSpan.style.top = `${Math.round(dropY)}px`;
        newSpan.style.left = `${Math.round(dropX)}px`;
        
        overlay.appendChild(newSpan);
        setSelectedElement(newSpan);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col">
      {/* Toolbar */}
      <div className="bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <h3 className="font-bold text-gray-800">可視化編輯器</h3>
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button 
              onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
              className="p-1 hover:bg-white rounded"
            >
              <i className="ri-subtract-line"></i>
            </button>
            <span className="text-sm font-mono w-12 text-center">{Math.round(scale * 100)}%</span>
            <button 
              onClick={() => setScale(s => Math.min(2, s + 0.1))}
              className="p-1 hover:bg-white rounded"
            >
              <i className="ri-add-line"></i>
            </button>
          </div>
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <span className="flex items-center"><i className="ri-drag-move-2-line mr-1"></i> 拖曳調整位置</span>
            <span className="flex items-center"><i className="ri-add-box-line mr-1"></i> 拖曳右側變數添加</span>
            <span className="flex items-center"><i className="ri-delete-bin-line mr-1"></i> 選中後按 Delete 刪除</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 shadow-sm"
          >
            <i className="ri-save-line mr-2"></i>
            保存更改
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Canvas Area */}
        <div 
          className="flex-1 overflow-auto p-8 relative bg-gray-500/10" 
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
            {AVAILABLE_VARIABLES.map((v) => (
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
    </div>
  );
}
