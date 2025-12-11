import { useRef, useMemo, useCallback } from 'react';
import ReactQuill, { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { uploadToCloudinary } from '../lib/cloudinary';

interface Props {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const isBrowser = typeof window !== 'undefined';

type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se';

class SimpleImageResize {
  private quill: any;
  private options: { minWidth: number };
  private overlay: HTMLDivElement | null = null;
  private image: HTMLImageElement | null = null;
  private dragState: { handle: ResizeHandle; startX: number; startWidth: number } | null = null;
  private container: HTMLElement;

  constructor(quill: any, options: { minWidth?: number } = {}) {
    this.quill = quill;
    this.container = quill.root.parentElement || quill.root;
    if (getComputedStyle(this.container).position === 'static') {
      this.container.style.position = 'relative';
    }

    this.options = { minWidth: 60, ...options };

    this.handleClick = this.handleClick.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.handleSelectionChange = this.handleSelectionChange.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onMove = this.onMove.bind(this);
    this.stopDrag = this.stopDrag.bind(this);

    this.quill.root.addEventListener('click', this.handleClick, false);
    this.quill.root.addEventListener('keyup', this.onKeyUp, false);
    this.quill.on('selection-change', this.handleSelectionChange);
    window.addEventListener('scroll', this.handleScroll, true);
  }

  handleClick(evt: MouseEvent) {
    const target = evt.target as HTMLElement | null;
    if (!target) return;
    const img = target.closest('img');
    if (img && this.quill.root.contains(img)) {
      if (this.image === img) {
        return;
      }
      this.show(img as HTMLImageElement);
    } else if (this.image) {
      this.hide();
    }
  }

  handleSelectionChange() {
    if (this.image && !this.quill.root.contains(this.image)) {
      this.hide();
    }
  }

  handleScroll() {
    if (this.image) {
      this.reposition();
    }
  }

  onKeyUp(evt: KeyboardEvent) {
    if (!this.image) return;
    if (evt.key === 'Delete' || evt.key === 'Backspace') {
      setTimeout(() => {
        if (this.image && !this.quill.root.contains(this.image)) {
          this.hide();
        } else {
          this.reposition();
        }
      }, 0);
    }
  }

  show(image: HTMLImageElement) {
    this.image = image;
    this.createOverlay();
    this.reposition();
  }

  hide() {
    if (this.overlay) {
      this.overlay.remove();
    }
    this.overlay = null;
    this.image = null;
    this.stopDrag();
  }

  createOverlay() {
    if (this.overlay) {
      this.overlay.innerHTML = '';
    } else {
      this.overlay = document.createElement('div');
      this.overlay.className = 'ql-image-resize-overlay';
      this.container.appendChild(this.overlay);
    }

    ['nw', 'ne', 'sw', 'se'].forEach((dir) => {
      const handle = document.createElement('span');
      handle.className = 'ql-image-resize-handle';
      handle.dataset.dir = dir;
      handle.addEventListener('mousedown', (evt) => this.startDrag(evt, dir as ResizeHandle));
      this.overlay?.appendChild(handle);
    });
  }

  startDrag(evt: MouseEvent, handle: ResizeHandle) {
    evt.preventDefault();
    if (!this.image) return;
    this.dragState = {
      handle,
      startX: evt.clientX,
      startWidth: this.image.getBoundingClientRect().width
    };
    document.addEventListener('mousemove', this.onMove);
    document.addEventListener('mouseup', this.stopDrag);
  }

  onMove(evt: MouseEvent) {
    if (!this.dragState || !this.image) return;
    const { handle, startX, startWidth } = this.dragState;
    const direction = handle.includes('w') ? -1 : 1;
    const deltaX = evt.clientX - startX;
    const newWidth = Math.max(this.options.minWidth, startWidth + direction * deltaX);
    this.image.style.width = `${newWidth}px`;
    this.image.style.height = 'auto';
    this.reposition();
  }

  stopDrag() {
    if (!this.dragState) return;
    document.removeEventListener('mousemove', this.onMove);
    document.removeEventListener('mouseup', this.stopDrag);
    this.dragState = null;
  }

  reposition() {
    if (!this.overlay || !this.image) return;
    const imageRect = this.image.getBoundingClientRect();
    const containerRect = this.container.getBoundingClientRect();
    const top = imageRect.top - containerRect.top + this.container.scrollTop;
    const left = imageRect.left - containerRect.left + this.container.scrollLeft;
    this.overlay.style.top = `${top}px`;
    this.overlay.style.left = `${left}px`;
    this.overlay.style.width = `${imageRect.width}px`;
    this.overlay.style.height = `${imageRect.height}px`;
  }

  destroy() {
    this.hide();
    this.quill.root.removeEventListener('click', this.handleClick);
    this.quill.root.removeEventListener('keyup', this.onKeyUp);
    this.quill.off('selection-change', this.handleSelectionChange);
    window.removeEventListener('scroll', this.handleScroll, true);
  }
}

if (isBrowser && typeof Quill !== 'undefined') {
  const QuillWithImports = Quill as typeof Quill & { imports?: Record<string, any> };
  const hasRegisteredResize = QuillWithImports.imports?.['modules/imageResize'];
  if (!hasRegisteredResize) {
    QuillWithImports.register('modules/imageResize', SimpleImageResize);
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
      base.imageResize = {};
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
        .ql-image-resize-handle {
          position: absolute;
          width: 12px;
          height: 12px;
          background: #fff;
          border: 1px solid #0f766e;
          border-radius: 9999px;
          pointer-events: all;
        }
        .ql-image-resize-handle[data-dir="nw"] {
          top: -6px;
          left: -6px;
          cursor: nwse-resize;
        }
        .ql-image-resize-handle[data-dir="ne"] {
          top: -6px;
          right: -6px;
          cursor: nesw-resize;
        }
        .ql-image-resize-handle[data-dir="sw"] {
          bottom: -6px;
          left: -6px;
          cursor: nesw-resize;
        }
        .ql-image-resize-handle[data-dir="se"] {
          bottom: -6px;
          right: -6px;
          cursor: nwse-resize;
        }
      `}</style>
    </div>
  );
}
