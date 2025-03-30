
import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Strike from '@tiptap/extension-strike';
import Underline from '@tiptap/extension-underline';
import Heading from '@tiptap/extension-heading';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import Highlight from '@tiptap/extension-highlight';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Blockquote from '@tiptap/extension-blockquote';
import CodeBlock from '@tiptap/extension-code-block';
import Code from '@tiptap/extension-code';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import ListItem from '@tiptap/extension-list-item';
import OrderedList from '@tiptap/extension-ordered-list';
import BulletList from '@tiptap/extension-bullet-list';
import TextAlign from '@tiptap/extension-text-align';
import FontSize from '@tiptap/extension-font-size';
import { TiptapToolbar } from './TiptapToolbar';
import './TextEditor.css';

export const TiptapEditor: React.FC = () => {
  const [showTableSelector, setShowTableSelector] = useState(false);
  const [hoveredCells, setHoveredCells] = useState({ rows: 0, cols: 0 });

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Bold,
      Italic,
      Strike,
      Underline,
      Heading.configure({
        levels: [1, 2, 3],
      }),
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      Highlight,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      Blockquote,
      CodeBlock,
      Code,
      Image,
      Link,
      HorizontalRule,
      ListItem,
      OrderedList,
      BulletList,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: 'Start typing here...',
      }),
    ],
    content: '<p>Start typing here...</p>',
    autofocus: 'end',
  });

  const handleTableCellHover = (rows: number, cols: number) => {
    setHoveredCells({ rows, cols });
  };

  const handleTableCellClick = (rows: number, cols: number) => {
    if (editor) {
      editor
        .chain()
        .focus()
        .insertTable({ rows, cols, withHeaderRow: true })
        .run();
      setShowTableSelector(false);
    }
  };

  return (
    <div className="editor-container animate-in">
      {editor && (
        <TiptapToolbar 
          editor={editor} 
          showTableSelector={showTableSelector}
          setShowTableSelector={setShowTableSelector}
          hoveredCells={hoveredCells}
          onTableCellHover={handleTableCellHover}
          onTableCellClick={handleTableCellClick}
        />
      )}
      <EditorContent editor={editor} className="content-area" />
    </div>
  );
};

export default TiptapEditor;
