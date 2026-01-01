// SafeRichTextViewer.jsx
// SafeRichTextViewer: render Quill Delta (JSON) bằng ReactQuill (readOnly, theme bubble, không toolbar)
import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.bubble.css';

export default function SafeRichTextViewer({ value }) {
  // value phải là Delta (object), không phải HTML string
  return (
    <ReactQuill
      value={value}
      readOnly={true}
      theme="bubble"
      modules={{ toolbar: false }}
    />
  );
}