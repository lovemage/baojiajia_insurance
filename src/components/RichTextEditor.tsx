import { useRef, useMemo, useCallback } from 'react';
import ReactQuill, { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import ImageResize from 'quill-image-resize-module-react';
import { uploadToCloudinary } from '../lib/cloudinary';

interface Props {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const isBrowser = typeof window !== 'undefined';

if (isBrowser && typeof Quill !== 'undefined') {
  (window as unknown as { Quill?: typeof Quill }).Quill = Quill;
  const QuillWithImports = Quill as typeof Quill & { imports?: Record<string, any> };
  const hasRegisteredResize = QuillWithImports.imports?.['modules/imageResize'];
  if (!hasRegisteredResize) {
    QuillWithImports.register('modules/imageResize', ImageResize);
  }
}

export default function RichTextEditor({ value, onChange, placeholder }: Props) {
  const quillRef = useRef<ReactQuill>(null);

  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        try {
          const url = await uploadToCloudinary(file);
          const quill = quillRef.current?.getEditor();
          if (quill) {
            const range = quill.getSelection(true);
            const insertIndex = range ? range.index : quill.getLength();
            quill.insertEmbed(insertIndex, 'image', url, 'user');
            quill.setSelection(insertIndex + 1, 0, 'silent');
          }
        } catch (error) {
          console.error('Image upload failed:', error);
          alert('圖片上傳失敗');
        }
      }
    };
  }, []);

  const modules = useMemo(() => {
    const base: any = {
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
          [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
          [{ color: [] }, { background: [] }],
          [{ align: [] }],
          ['link', 'image', 'video'],
          ['clean']
        ],
        handlers: {
          image: imageHandler
        }
      }
    };

    if (isBrowser) {
      base.imageResize = {
        parchment: Quill.import('parchment'),
        modules: ['Resize', 'DisplaySize', 'Toolbar']
      };
    }

    return base;
  }, [imageHandler]);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video', 'color', 'background', 'align'
  ];

  return (
    <div className="rich-text-editor">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="bg-white rounded-lg"
      />
      <style>{`
        .ql-toolbar.ql-snow {
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          border-color: #d1d5db;
          background-color: #f9fafb;
        }
        .ql-container.ql-snow {
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
          border-color: #d1d5db;
          font-size: 1rem;
        }
        .ql-editor {
          min-height: 400px;
        }
        .ql-editor img {
          max-width: 100%;
          height: auto;
        }
        .ql-container .ql-image-resize-overlay {
          border: 1px dashed #0f766e !important;
        }
        .ql-container .ql-image-resize-handle {
          border: 1px solid #0f766e !important;
          background: #ffffff !important;
        }
      `}</style>
    </div>
  );
}
