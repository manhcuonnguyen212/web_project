// SafeQuillDeltaViewer.jsx
// Hiển thị Quill Delta (JSON) ở chế độ read-only, tuyệt đối không render HTML string, không XSS
// Chỉ hỗ trợ các định dạng cơ bản: đoạn văn, in đậm, nghiêng, danh sách, xuống dòng
import React from 'react';

function renderDelta(delta) {
  if (!delta || !Array.isArray(delta.ops)) return null;
  const elements = [];
  let listBuffer = null;

  delta.ops.forEach((op, idx) => {
    const { insert, attributes } = op;
    if (typeof insert !== 'string') return; // chỉ xử lý text
    const text = insert.replace(/\n/g, '\n');
    const attr = attributes || {};

    // List handling
    if (attr.list) {
      if (!listBuffer) listBuffer = [];
      listBuffer.push({ text, attr });
      // Nếu là cuối hoặc tiếp theo không phải list, flush
      const next = delta.ops[idx + 1];
      if (!next || !next.attributes || next.attributes.list !== attr.list) {
        const Tag = attr.list === 'ordered' ? 'ol' : 'ul';
        elements.push(
          <Tag key={`list-${idx}`}>{listBuffer.map((item, i) => (
            <li key={i}>{formatText(item.text, item.attr)}</li>
          ))}</Tag>
        );
        listBuffer = null;
      }
      return;
    }
    // Định dạng đoạn văn
    if (text === '\n') {
      elements.push(<br key={`br-${idx}`} />);
      return;
    }
    elements.push(
      <p key={idx}>{formatText(text, attr)}</p>
    );
  });
  return elements;
}

function formatText(text, attr) {
  let el = text.replace(/\n$/, '');
  if (attr.bold) el = <strong>{el}</strong>;
  if (attr.italic) el = <em>{el}</em>;
  if (attr.underline) el = <u>{el}</u>;
  return el;
}

export default function SafeQuillDeltaViewer({ delta }) {
  return (
    <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
      {renderDelta(delta)}
    </div>
  );
}
