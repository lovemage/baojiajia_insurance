import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabase';

interface ServiceDetail {
  id: string;
  service_id: string;
  content: string;
  updated_at: string;
}

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  image_url: string;
  slug: string;
  display_order: number;
  is_active: boolean;
}

interface Props {
  service: ServiceItem;
  onBack: () => void;
}

export default function ServiceDetailEditor({ service, onBack }: Props) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    fetchContent();
  }, [service.id]);

  // 初始化編輯器內容
  useEffect(() => {
    if (content && contentEditableRef.current && !isInitialized.current) {
      contentEditableRef.current.innerHTML = content;
      isInitialized.current = true;
    }
  }, [content]);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('service_details')
        .select('*')
        .eq('service_id', service.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setContent(data.content || '');
      }
    } catch (error) {
      console.error('Error fetching service detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: existing } = await supabase
        .from('service_details')
        .select('id')
        .eq('service_id', service.id)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('service_details')
          .update({ content, updated_at: new Date().toISOString() })
          .eq('service_id', service.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('service_details')
          .insert({ service_id: service.id, content });
        if (error) throw error;
      }

      alert('儲存成功！');
      onBack();
    } catch (error) {
      console.error('Error saving service detail:', error);
      alert('儲存失敗，請稍後再試');
    } finally {
      setSaving(false);
    }
  };

  // Rich text editor functions
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    contentEditableRef.current?.focus();
  };

  const insertImage = () => {
    const url = prompt('請輸入圖片網址：');
    if (url) {
      execCommand('insertImage', url);
    }
  };

  const changeFontSize = (size: string) => {
    execCommand('fontSize', size);
  };

  const changeTextColor = () => {
    const color = prompt('請輸入顏色代碼（例如：#FF0000）：');
    if (color) {
      execCommand('foreColor', color);
    }
  };

  const handleContentChange = () => {
    if (contentEditableRef.current) {
      setContent(contentEditableRef.current.innerHTML);
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-teal-600 mb-4 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-arrow-left-line"></i>
            返回列表
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">編輯內容：{service.title}</h1>
          <p className="text-gray-600">編輯服務項目的詳細內容</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          {/* Rich Text Editor Toolbar */}
          <div className="border border-gray-300 rounded-t-lg bg-gray-50 p-3 flex flex-wrap gap-2">
            {/* Font Size */}
            <select
              onChange={(e) => changeFontSize(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded cursor-pointer text-sm"
              defaultValue=""
            >
              <option value="" disabled>字體大小</option>
              <option value="1">極小</option>
              <option value="2">小</option>
              <option value="3">正常</option>
              <option value="4">中</option>
              <option value="5">大</option>
              <option value="6">極大</option>
              <option value="7">超大</option>
            </select>

            <div className="w-px h-8 bg-gray-300"></div>

            {/* Text Formatting */}
            <button
              type="button"
              onClick={() => execCommand('bold')}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200 transition-colors cursor-pointer"
              title="粗體"
            >
              <i className="ri-bold"></i>
            </button>
            <button
              type="button"
              onClick={() => execCommand('italic')}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200 transition-colors cursor-pointer"
              title="斜體"
            >
              <i className="ri-italic"></i>
            </button>
            <button
              type="button"
              onClick={() => execCommand('underline')}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200 transition-colors cursor-pointer"
              title="底線"
            >
              <i className="ri-underline"></i>
            </button>
            <button
              type="button"
              onClick={changeTextColor}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200 transition-colors cursor-pointer"
              title="文字顏色"
            >
              <i className="ri-font-color"></i>
            </button>

            <div className="w-px h-8 bg-gray-300"></div>

            {/* Alignment */}
            <button
              type="button"
              onClick={() => execCommand('justifyLeft')}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200 transition-colors cursor-pointer"
              title="靠左對齊"
            >
              <i className="ri-align-left"></i>
            </button>
            <button
              type="button"
              onClick={() => execCommand('justifyCenter')}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200 transition-colors cursor-pointer"
              title="置中對齊"
            >
              <i className="ri-align-center"></i>
            </button>
            <button
              type="button"
              onClick={() => execCommand('justifyRight')}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200 transition-colors cursor-pointer"
              title="靠右對齊"
            >
              <i className="ri-align-right"></i>
            </button>

            <div className="w-px h-8 bg-gray-300"></div>

            {/* Lists */}
            <button
              type="button"
              onClick={() => execCommand('insertUnorderedList')}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200 transition-colors cursor-pointer"
              title="項目符號"
            >
              <i className="ri-list-unordered"></i>
            </button>
            <button
              type="button"
              onClick={() => execCommand('insertOrderedList')}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200 transition-colors cursor-pointer"
              title="編號清單"
            >
              <i className="ri-list-ordered"></i>
            </button>

            <div className="w-px h-8 bg-gray-300"></div>

            {/* Heading */}
            <button
              type="button"
              onClick={() => execCommand('formatBlock', '<h2>')}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200 transition-colors cursor-pointer text-sm font-semibold"
              title="大標題"
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => execCommand('formatBlock', '<h3>')}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200 transition-colors cursor-pointer text-sm font-semibold"
              title="小標題"
            >
              H3
            </button>
            <button
              type="button"
              onClick={() => execCommand('formatBlock', '<p>')}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200 transition-colors cursor-pointer text-sm"
              title="段落"
            >
              P
            </button>

            <div className="w-px h-8 bg-gray-300"></div>

            {/* Image */}
            <button
              type="button"
              onClick={insertImage}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200 transition-colors cursor-pointer"
              title="插入圖片"
            >
              <i className="ri-image-add-line"></i>
            </button>

            <div className="w-px h-8 bg-gray-300"></div>

            {/* Clear Formatting */}
            <button
              type="button"
              onClick={() => execCommand('removeFormat')}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200 transition-colors cursor-pointer"
              title="清除格式"
            >
              <i className="ri-format-clear"></i>
            </button>
          </div>

          {/* Content Editable Area */}
          <div
            ref={contentEditableRef}
            contentEditable
            onInput={handleContentChange}
            dir="ltr"
            className="w-full min-h-[500px] px-4 py-3 border border-gray-300 border-t-0 rounded-b-lg focus:ring-2 focus:ring-teal-500 focus:outline-none text-left"
            style={{
              maxWidth: '100%',
              overflowWrap: 'break-word',
              direction: 'ltr',
              textAlign: 'left'
            }}
          />
          <p className="text-xs text-gray-500 mt-2">
            <i className="ri-information-line mr-1"></i>
            提示：點擊「插入圖片」按鈕可以輸入圖片網址
          </p>

          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={onBack}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors cursor-pointer whitespace-nowrap"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
            >
              {saving ? '儲存中...' : '儲存變更'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
