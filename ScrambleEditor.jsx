import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import CodeBlock from '@tiptap/extension-code-block'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import { useState, useRef, useEffect } from 'react'

// Import icons
import { 
  Bold, Italic, Code, List, ListOrdered, Image as ImageIcon, 
  AlignLeft, AlignCenter, AlignRight, Trash2, Edit, 
  Maximize2, Check, X, Crop, Link as LinkIcon, Smile
} from 'lucide-react'

const MenuBar = ({ editor, onImageUpload }) => {
  if (!editor) {
    return null
  }

  const addImage = () => {
    if (onImageUpload) {
      onImageUpload()
    } else {
      const url = window.prompt('URL')
      if (url) {
        editor.chain().focus().setImage({ src: url }).run()
      }
    }
  }

  const addCodeBlock = () => {
    editor.chain().focus().toggleCodeBlock().run()
  }

  const addLink = () => {
    const url = window.prompt('URL')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  return (
    <div className="flex flex-wrap gap-1 p-2 bg-white border-b border-gray-200">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`toolbar-button ${editor.isActive('bold') ? 'active' : ''}`}
        title="Bold"
      >
        <Bold size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`toolbar-button ${editor.isActive('italic') ? 'active' : ''}`}
        title="Italic"
      >
        <Italic size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={`toolbar-button ${editor.isActive('code') ? 'active' : ''}`}
        title="Inline Code"
      >
        <Code size={18} />
      </button>
      <button
        onClick={addLink}
        className={`toolbar-button ${editor.isActive('link') ? 'active' : ''}`}
        title="Add Link"
      >
        <LinkIcon size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`toolbar-button ${editor.isActive('bulletList') ? 'active' : ''}`}
        title="Bullet List"
      >
        <List size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`toolbar-button ${editor.isActive('orderedList') ? 'active' : ''}`}
        title="Ordered List"
      >
        <ListOrdered size={18} />
      </button>
      <button
        onClick={addCodeBlock}
        className={`toolbar-button ${editor.isActive('codeBlock') ? 'active' : ''}`}
        title="Code Block"
      >
        <Code size={18} />
      </button>
      <button
        onClick={addImage}
        className="toolbar-button"
        title="Add Image"
      >
        <ImageIcon size={18} />
      </button>
      <button
        onClick={() => {
          const emoji = window.prompt('Enter emoji')
          if (emoji) {
            editor.chain().focus().insertContent(emoji).run()
          }
        }}
        className="toolbar-button"
        title="Add Emoji"
      >
        <Smile size={18} />
      </button>
    </div>
  )
}

const MediaToolbar = ({ editor, node, onDelete, onEdit, alignment, onAlignChange }) => {
  const handleAlignChange = () => {
    const alignments = ['left', 'center', 'right']
    const currentIndex = alignments.indexOf(alignment)
    const nextIndex = (currentIndex + 1) % alignments.length
    onAlignChange(alignments[nextIndex])
  }

  return (
    <div className="media-toolbar">
      <button className="p-1 hover:bg-gray-100 rounded-md" title="Edit" onClick={onEdit}>
        <Edit size={16} />
      </button>
      <button className="p-1 hover:bg-gray-100 rounded-md" title={`Align (${alignment})`} onClick={handleAlignChange}>
        {alignment === 'left' && <AlignLeft size={16} />}
        {alignment === 'center' && <AlignCenter size={16} />}
        {alignment === 'right' && <AlignRight size={16} />}
      </button>
      <button className="p-1 hover:bg-gray-100 rounded-md text-red-500 hover:text-red-700" title="Delete" onClick={onDelete}>
        <Trash2 size={16} />
      </button>
    </div>
  )
}

const MediaEditPanel = ({ onApply, onCancel, alignment, onAlignChange }) => {
  return (
    <div className="media-edit-panel">
      <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-md">
        <h3 className="text-lg font-medium mb-4">Edit Media</h3>
        <div className="cropper-container relative bg-gray-100 mb-4 aspect-video">
          <div className="crop-overlay absolute border-2 border-blue-500 cursor-move"
               style={{ width: '80%', height: '80%', top: '10%', left: '10%' }}>
            <div className="resize-handle resize-handle-nw absolute w-3 h-3 bg-white border-2 border-blue-500 rounded-full top-0 left-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize"></div>
            <div className="resize-handle resize-handle-ne absolute w-3 h-3 bg-white border-2 border-blue-500 rounded-full top-0 right-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize"></div>
            <div className="resize-handle resize-handle-sw absolute w-3 h-3 bg-white border-2 border-blue-500 rounded-full bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize"></div>
            <div className="resize-handle resize-handle-se absolute w-3 h-3 bg-white border-2 border-blue-500 rounded-full bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize"></div>
          </div>
        </div>
        <div className="edit-controls flex flex-wrap gap-2 mb-4">
          <button className="flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded" title="Crop">
            <Crop size={16} />
            Crop
          </button>
          <button className="flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded" title="Resize">
            <Maximize2 size={16} />
            Resize
          </button>
          <button className="flex items-center gap-1 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded ml-auto" title="Apply" onClick={onApply}>
            <Check size={16} />
            Apply
          </button>
          <button className="flex items-center gap-1 px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded" title="Cancel" onClick={onCancel}>
            <X size={16} />
            Cancel
          </button>
        </div>
        <div className="alignment-controls flex justify-center gap-2">
          <button 
            className={`p-2 rounded ${alignment === 'left' ? 'bg-blue-100' : 'bg-gray-100 hover:bg-gray-200'}`} 
            title="Align Left"
            onClick={() => onAlignChange('left')}
          >
            <AlignLeft size={16} />
          </button>
          <button 
            className={`p-2 rounded ${alignment === 'center' ? 'bg-blue-100' : 'bg-gray-100 hover:bg-gray-200'}`} 
            title="Align Center"
            onClick={() => onAlignChange('center')}
          >
            <AlignCenter size={16} />
          </button>
          <button 
            className={`p-2 rounded ${alignment === 'right' ? 'bg-blue-100' : 'bg-gray-100 hover:bg-gray-200'}`} 
            title="Align Right"
            onClick={() => onAlignChange('right')}
          >
            <AlignRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

// Custom extension for handling media alignment
const MediaComponent = ({ node, updateAttributes, selected }) => {
  const [showEditPanel, setShowEditPanel] = useState(false)
  const [alignment, setAlignment] = useState(node.attrs.alignment || 'center')
  
  useEffect(() => {
    updateAttributes({ alignment })
  }, [alignment, updateAttributes])

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this media?')) {
      // The node will be deleted by the editor
    }
  }

  const handleEdit = () => {
    setShowEditPanel(true)
  }

  const handleApply = () => {
    setShowEditPanel(false)
    // Apply edits to the image
  }

  const handleCancel = () => {
    setShowEditPanel(false)
  }

  const handleAlignChange = (newAlignment) => {
    setAlignment(newAlignment)
  }

  return (
    <div className={`media-element media-align-${alignment} group`}>
      <img 
        src={node.attrs.src} 
        alt={node.attrs.alt || ''} 
        className="max-w-full h-auto"
      />
      
      {selected && (
        <MediaToolbar 
          alignment={alignment}
          onAlignChange={handleAlignChange}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      )}
      
      {showEditPanel && (
        <MediaEditPanel 
          alignment={alignment}
          onAlignChange={handleAlignChange}
          onApply={handleApply}
          onCancel={handleCancel}
        />
      )}
      
      <div className="media-caption" contentEditable>
        {node.attrs.caption || 'Image caption - click to edit'}
      </div>
    </div>
  )
}

const ScrambleEditor = ({ 
  initialValue = '<p>Start typing here...</p>', 
  onChange,
  placeholder = 'Start typing here...',
  height = '300px',
  editorClassName = '',
  toolbarClassName = '',
  floatingToolbar = true
}) => {
  const [selectedImage, setSelectedImage] = useState(null)
  const fileInputRef = useRef(null)
  const editorContainerRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [toolbarPosition, setToolbarPosition] = useState({ x: 20, y: 20 })
  const [isMinimized, setIsMinimized] = useState(false)
  const dragHandleRef = useRef(null)

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
            const captionEl = element.querySelector('.media-caption')
            return captionEl ? captionEl.textContent : ''
          },
          renderHTML: attributes => {
            return {}
          }
        }
      }
    },
    // Add nodeView for custom rendering
    addNodeView() {
      return ({ node, editor, getPos, updateAttributes }) => {
        const dom = document.createElement('div')
        dom.className = `media-element media-align-${node.attrs.alignment || 'center'} group`
        
        const img = document.createElement('img')
        img.src = node.attrs.src
        img.alt = node.attrs.alt || ''
        img.className = 'max-w-full h-auto'
        dom.appendChild(img)
        
        const caption = document.createElement('div')
        caption.className = 'media-caption'
        caption.contentEditable = 'true'
        caption.textContent = node.attrs.caption || 'Image caption - click to edit'
        dom.appendChild(caption)
        
        caption.addEventListener('input', () => {
          updateAttributes({ caption: caption.textContent })
        })
        
        return {
          dom,
          update: (updatedNode) => {
            if (updatedNode.attrs.src !== node.attrs.src) {
              img.src = updatedNode.attrs.src
            }
            if (updatedNode.attrs.alt !== node.attrs.alt) {
              img.alt = updatedNode.attrs.alt || ''
            }
            if (updatedNode.attrs.alignment !== node.attrs.alignment) {
              dom.className = `media-element media-align-${updatedNode.attrs.alignment || 'center'} group`
            }
            return true
          }
        }
      }
    }
  })

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
        onChange(editor.getHTML())
      }
    },
  })

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)
    
    const files = event.dataTransfer?.files
    if (!files || files.length === 0) return
    
    const file = files[0]
    const fileType = file.type.split('/')[0]
    
    if (fileType === 'image') {
      handleImageUpload(file)
    }
  }

  const handleDragOver = (event) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (event) => {
    event.preventDefault()
    setIsDragging(false)
  }

  const handleImageUpload = (file) => {
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      if (editor) {
        editor.chain().focus().setImage({ 
          src: e.target.result,
          alt: file.name,
          alignment: 'center',
          caption: file.name
        }).run()
      }
    }
    reader.readAsDataURL(file)
  }

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  // Toolbar dragging functionality
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return
      
      const editorRect = editorContainerRef.current?.getBoundingClientRect()
      if (!editorRect) return
      
      const newX = e.clientX - editorRect.left
      const newY = e.clientY - editorRect.top
      
      setToolbarPosition({
        x: Math.max(0, newX),
        y: Math.max(0, newY)
      })
    }
    
    const handleMouseUp = () => {
      setIsDragging(false)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  const handleToolbarDragStart = (e) => {
    if (e.target === dragHandleRef.current || e.target.closest('.drag-handle')) {
      setIsDragging(true)
    }
  }

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

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
  )
}

// Add missing components
const GripVertical = ({ size = 24, className = '' }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="9" cy="12" r="1" />
    <circle cx="9" cy="5" r="1" />
    <circle cx="9" cy="19" r="1" />
    <circle cx="15" cy="12" r="1" />
    <circle cx="15" cy="5" r="1" />
    <circle cx="15" cy="19" r="1" />
  </svg>
)

export default ScrambleEditor
