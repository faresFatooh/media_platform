
import React, { useState } from 'react';
import { CodeIcon } from './icons/CodeIcon';

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button onClick={handleCopy} className="absolute top-3 left-3 bg-slate-700 text-white px-3 py-1 rounded text-xs hover:bg-slate-800 transition-colors">
            {copied ? 'تم النسخ!' : 'نسخ'}
        </button>
    );
};

export const IntegrationPanel: React.FC = () => {
  const widgetCode = `<div id="newsrefine-widget" data-endpoint="https://YOUR_DOMAIN/api/newsrefine/build"></div>
<script>
  (function(){
    async function submitLinks(urls){
      const res = await fetch(document.getElementById('newsrefine-widget').dataset.endpoint, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ urls, style_prefs:{ length:'standard', tone:'agency', include_quotes:true, include_context_box:true }, output:{ dual_language:false, include_seo:true, include_html:true }, constraints:{ max_words:450, plagiarism_threshold:0.85, min_sources:2 } })
      });
      const data = await res.json();
      document.getElementById('newsrefine-widget').innerHTML = data.html;
    }
    // Example usage:
    // submitLinks(['https://example.com/a','https://example.com/b']);
  })();
<\/script>`;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden p-6 md:p-8">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <CodeIcon />
        <span className="mr-3">التكامل والربط</span>
      </h2>
      <p className="text-slate-600 mb-6">
        استخدم الكود التالي لتضمين أداة NewsRefine مباشرة في موقعك.
      </p>
      <div className="space-y-2">
        <h3 className="font-semibold text-slate-700">ودجت تضمين (Embed)</h3>
        <p className="text-sm text-slate-500">
          انسخ هذا المقطع والصقه في صفحة HTML الخاصة بك لعرض النتائج مباشرة.
        </p>
        <div className="relative">
            <CopyButton text={widgetCode} />
            <pre className="bg-slate-800 text-white p-4 rounded-lg overflow-x-auto text-sm" dir="ltr">
                <code>{widgetCode}</code>
            </pre>
        </div>
      </div>
    </div>
  );
};
