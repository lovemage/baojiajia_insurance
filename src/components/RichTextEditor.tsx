import { useRef, useMemo, useCallback } from 'react';
import ReactQuill, { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
const isBrowser = typeof window !== 'undefined';

class ImageResizeModule {
  private quill: any;
  private overlay: HTMLDivElement | null = null;
  private image: HTMLImageElement | null = null;
  private dragData: { startX: number; startWidth: number; direction: 'left' | 'right' } | null = null;
  private container: HTMLElement;

  constructor(quill: any) {
    this.quill = quill;
    this.container = quill.root.parentElement || quill.root;

    this.handleImageClick = this.handleImageClick.bind(this);
    this.handleDocumentClick = this.handleDocumentClick.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.stopDragging = this.stopDragging.bind(this);

    this.quill.root.addEventListener('click', this.handleImageClick, false);
    document.addEventListener('click', this.handleDocumentClick, false);
  }

  handleImageClick(evt: MouseEvent) {
    const target = evt.target as HTMLElement;
    if (!target) return;

    const image = target.closest('img');
    if (image && this.quill.root.contains(image)) {
      evt.preventDefault();
      evt.stopPropagation();
      this.selectImage(image as HTMLImageElement);
    }
  }

  handleDocumentClick(evt: MouseEvent) {
    if (!this.overlay || !this.image) return;
    if (evt.target instanceof Node && this.overlay.contains(evt.target)) return;
    this.deselect();
  }

  selectImage(image: HTMLImageElement) {
    this.image = image;
    this.createOverlay();
    this.updateOverlay();
  }

  deselect() {
    this.image = null;
    this.removeOverlay();
    this.stopDragging();
  }

  createOverlay() {
    if (!this.overlay) {
      this.overlay = document.createElement('div');
      this.overlay.className = 'ql-image-resize-overlay';
      this.container.appendChild(this.overlay);

      ['left', 'right'].forEach((direction) => {
        const handle = document.createElement('span');
        handle.className = 'ql-image-resize-handle';
        handle.dataset.side = direction;
        handle.addEventListener('mousedown', (evt) => this.startDragging(evt, direction as 'left' | 'right'));
        this.overlay?.appendChild(handle);
      });
    }
  }

  removeOverlay() {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
  }

  updateOverlay() {
    if (!this.overlay || !this.image) return;
    const imageRect = this.image.getBoundingClientRect();
    const containerRect = this.container.getBoundingClientRect();

    const top = imageRect.top - containerRect.top + this.container.scrollTop;
    const left = imageRect.left - containerRect.left + this.container.scrollLeft;

    Object.assign(this.overlay.style, {
      top: `${top - 2}px`,
      left: `${left - 2}px`,
      width: `${imageRect.width + 4}px`,
      height: `${imageRect.height + 4}px`
    });

    const handles = this.overlay.querySelectorAll<HTMLSpanElement>('.ql-image-resize-handle');
    handles.forEach((handle) => {
      const side = handle.dataset.side;
      if (side === 'left') {
        Object.assign(handle.style, { left: '-6px', top: '50%', transform: 'translate(-50%, -50%)' });
      } else {
        Object.assign(handle.style, { right: '-6px', top: '50%', transform: 'translate(50%, -50%)' });
      }
    });
  }

  startDragging(evt: MouseEvent, direction: 'left' | 'right') {
    evt.preventDefault();
    evt.stopPropagation();
    if (!this.image) return;

    this.dragData = {
      startX: evt.clientX,
      startWidth: this.image.getBoundingClientRect().width,
      direction
    };

    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.stopDragging);
  }

  handleMouseMove(evt: MouseEvent) {
    if (!this.dragData || !this.image) return;
    const { startX, startWidth, direction } = this.dragData;
    const delta = evt.clientX - startX;
    const factor = direction === 'left' ? -1 : 1;
    const newWidth = Math.max(60, startWidth + factor * delta);
    this.image.style.width = `${newWidth}px`;
    this.image.style.height = 'auto';
    this.updateOverlay();
  }

  stopDragging() {
    if (!this.dragData) return;
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.stopDragging);
    this.dragData = null;
  }

  destroy() {
    this.deselect();
    this.quill.root.removeEventListener('click', this.handleImageClick);
    document.removeEventListener('click', this.handleDocumentClick);
  }
}

if (isBrowser && typeof Quill !== 'undefined') {
  const QuillWithImports = Quill as typeof Quill & { imports?: Record<string, any> };
  const registered = QuillWithImports.imports?.['modules/imageResizeSimple'];
  if (!registered) {
    QuillWithImports.register('modules/imageResizeSimple', ImageResizeModule);
  }
}
import { uploadToCloudinary } from '../lib/cloudinary';

interface Props {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
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
      base.imageResizeSimple = {};
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
        .ql-image-resize-overlay {
          position: absolute;
          border: 1px dashed #0f766e;
          box-sizing: border-box;
          pointer-events: none;
          z-index: 10;
        }
        .ql-image-resize-overlay::before {
          content: "";
          position: absolute;
          inset: -4px;
          border: 1px dashed rgba(15, 118, 110, 0.3);
        }
        .ql-image-resize-handle {
          position: absolute;
          width: 12px;
          height: 12px;
          background: #fff;
          border: 1px solid #0f766e;
          border-radius: 9999px;
          pointer-events: all;
        }
        .ql-image-resize-handle[data-side="left"] {
          cursor: ew-resize;
        }
        .ql-image-resize-handle[data-side="right"] {
          cursor: ew-resize;
        }
      `}</style>
    </div>
  );
}
