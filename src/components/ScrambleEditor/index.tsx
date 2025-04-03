
import React, { useState, useRef, useEffect } from 'react';
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CodeBlock from '@tiptap/extension-code-block';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import MenuBar from './MenuBar';
import { MediaEditPanel } from './MediaComponent';
import './styles.css';
import { 
  GripVertical, 
  Minimize, 
  Plus, 
  ImageIcon, 
  Bold, 
  Italic, 
  Code, 
  List
} from './Icons';

export interface ScrambleEditorProps {
  initialValue?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  height?: string;
  editorClassName?: string;
  toolbarClassName?: string;
  floatingToolbar?: boolean;
}

const ScrambleEditor: React.FC<ScrambleEditorProps> = ({ 
  initialValue = '<p>Start typing here...</p>', 
  onChange,
  placeholder = 'Start typing here...',
  height = '300px',
  editorClassName = '',
  toolbarClassName = '',
  floatingToolbar = true
}) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 20, y: 20 });
  const [isMinimized, setIsMinimized] = useState(false);
  const dragHandleRef = useRef<HTMLDivElement>(null);

  // Custom image extension with alignment support
  const CustomImage = Image.extend({
    addAttributes() {
      return {
        ...Image.config.addAttributes(),
        alignment: {
          default: 'center',
          parseHTML: element => element.getAttribute('data-alignment') || 'center',
          renderHTML: attributes => {
            return {
              'data-alignment': attributes.alignment,
              class: `media-align-${attributes.alignment}`
            }
          }
        },
        caption: {
          default: '',
          parseHTML: element => {
            const captionEl = element.querySelector('.media-caption');
            return captionEl ? captionEl.textContent : '';
          },
          renderHTML: attributes => {
            return {}
          }
        }
      }
    },
    // Add nodeView for custom rendering
    addNodeView() {
      return ({ node, editor, getPos, updateAttributes }: any) => {
        const dom = document.createElement('div');
        dom.className = `media-element media-align-${node.attrs.alignment || 'center'} group`;
        
        const img = document.createElement('img');
        img.src = node.attrs.src;
        img.alt = node.attrs.alt || '';
        img.className = 'max-w-full h-auto';
        dom.appendChild(img);
        
        const caption = document.createElement('div');
        caption.className = 'media-caption';
        caption.contentEditable = 'true';
        caption.textContent = node.attrs.caption || 'Image caption - click to edit';
        dom.appendChild(caption);
        
        caption.addEventListener('input', () => {
          updateAttributes({ caption: caption.textContent });
        });
        
        return {
          dom,
          update: (updatedNode: any) => {
            if (updatedNode.attrs.src !== node.attrs.src) {
              img.src = updatedNode.attrs.src;
            }
            if (updatedNode.attrs.alt !== node.attrs.alt) {
              img.alt = updatedNode.attrs.alt || '';
            }
            if (updatedNode.attrs.alignment !== node.attrs.alignment) {
              dom.className = `media-element media-align-${updatedNode.attrs.alignment || 'center'} group`;
            }
            return true;
          }
        }
      }
    }
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      CodeBlock,
      CustomImage,
      Placeholder.configure({
        placeholder,
      }),
      Highlight,
      Link,
    ],
    content: initialValue,
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
  });

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    
    const files = event.dataTransfer?.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const fileType = file.type.split('/')[0];
    
    if (fileType === 'image') {
      handleImageUpload(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleImageUpload = (file: File) => {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      if (editor && e.target?.result) {
        editor.chain().focus().setImage({ 
          src: e.target.result as string,
          alt: file.name,
          alignment: 'center',
          caption: file.name
        }).run();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Handle clipboard paste for images
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      
      // Check if clipboard contains an image
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            handleImageUpload(file);
            return;
          }
        }
      }
    };

    const editorElement = editorContainerRef.current;
    editorElement?.addEventListener('paste', handlePaste);
    
    return () => {
      editorElement?.removeEventListener('paste', handlePaste);
    };
  }, [editor]);

  // Toolbar dragging functionality
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const editorRect = editorContainerRef.current?.getBoundingClientRect();
      if (!editorRect) return;
      
      const newX = e.clientX - editorRect.left;
      const newY = e.clientY - editorRect.top;
      
      setToolbarPosition({
        x: Math.max(0, newX),
        y: Math.max(0, newY)
      });
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleToolbarDragStart = (e: React.MouseEvent) => {
    if (e.target === dragHandleRef.current || (e.target as Element).closest('.drag-handle')) {
      setIsDragging(true);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleTouchDragStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!editorContainerRef.current) return;
    
    const rect = editorContainerRef.current.getBoundingClientRect();
    setToolbarPosition({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    });
    
    // Add touch event listeners
    const handleTouchMove = (e: TouchEvent) => {
      if (!editorContainerRef.current) return;
      const rect = editorContainerRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      
      setToolbarPosition({
        x: Math.max(0, touch.clientX - rect.left),
        y: Math.max(0, touch.clientY - rect.top)
      });
    };
    
    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
    
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  return (
    <div 
      className={`scramble-editor ${editorClassName}`} 
      style={{ height }}
      ref={editorContainerRef}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileInputChange} 
        accept="image/*" 
        style={{ display: 'none' }} 
      />
      
      {floatingToolbar && editor && (
        <div 
          className={`floating-toolbar fixed bg-white shadow-lg rounded-md border border-gray-200 z-50 ${isMinimized ? 'w-10 h-10' : ''}`}
          style={{ 
            left: `${toolbarPosition.x}px`, 
            top: `${toolbarPosition.y}px`,
            transition: 'width 0.3s, height 0.3s'
          }}
        >
          <div 
            className="drag-handle flex items-center justify-between p-1 cursor-move border-b border-gray-200"
            onMouseDown={handleToolbarDragStart}
            onTouchStart={handleTouchDragStart}
            ref={dragHandleRef}
          >
            <div className="flex items-center">
              <GripVertical size={16} className="text-gray-400" />
              <span className="ml-1 text-sm text-gray-600">Drag to move toolbar</span>
            </div>
            <button 
              className="p-1 hover:bg-gray-100 rounded"
              onClick={toggleMinimize}
              title={isMinimized ? "Expand" : "Minimize"}
            >
              {isMinimized ? <Plus size={16} /> : <Minimize size={16} />}
            </button>
          </div>
          
          {!isMinimized && (
            <MenuBar editor={editor} onImageUpload={triggerFileInput} />
          )}
        </div>
      )}
      
      <div 
        className={`editor-content-wrapper ${isDragging ? 'drag-over' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="text-center text-gray-500 mb-2">
          <span className="inline-flex items-center">
            <ImageIcon size={16} className="mr-1" /> Drag and drop images or files to upload | Copy and paste images directly
          </span>
        </div>
        
        {editor && (
          <BubbleMenu editor={editor} className="bubble-menu">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`toolbar-button ${editor.isActive('bold') ? 'active' : ''}`}
            >
              <Bold size={16} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`toolbar-button ${editor.isActive('italic') ? 'active' : ''}`}
            >
              <Italic size={16} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleCode().run()}
              className={`toolbar-button ${editor.isActive('code') ? 'active' : ''}`}
            >
              <Code size={16} />
            </button>
          </BubbleMenu>
        )}
        
        {editor && floatingToolbar && (
          <FloatingMenu editor={editor} className="floating-menu">
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`toolbar-button ${editor.isActive('heading', { level: 1 }) ? 'active' : ''}`}
            >
              H1
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`toolbar-button ${editor.isActive('heading', { level: 2 }) ? 'active' : ''}`}
            >
              H2
            </button>
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`toolbar-button ${editor.isActive('bulletList') ? 'active' : ''}`}
            >
              <List size={16} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={`toolbar-button ${editor.isActive('codeBlock') ? 'active' : ''}`}
            >
              <Code size={16} />
            </button>
          </FloatingMenu>
        )}
        
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default ScrambleEditor;
