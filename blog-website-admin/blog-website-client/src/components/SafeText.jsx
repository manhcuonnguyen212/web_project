// SafeText.jsx
// Hiển thị text thuần, XSS-safe tuyệt đối
import React from 'react';

// SafeText: render text thuần, XSS-safe tuyệt đối, dùng cho mọi plain text
export default function SafeText({ children, className = '', as = 'span' }) {
  const Comp = as;
  return (
    <Comp className={className} style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
      {children}
    </Comp>
  );
}