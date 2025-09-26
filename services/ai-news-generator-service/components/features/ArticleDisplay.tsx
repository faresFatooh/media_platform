import React from "react";
import type { GeneratedArticle } from "../../types";
import { DownloadIcon, RefreshIcon } from "../icons/Icons";

interface ArticleDisplayProps {
  article: GeneratedArticle | null;
  onReset: () => void;
}

export const ArticleDisplay: React.FC<ArticleDisplayProps> = ({
  article,
  onReset,
}) => {
  // ✅ --- SAFETY CHECK ---
  if (!article || !article.content) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-400">
          Loading article or article data is incomplete...
        </p>
        <button
          onClick={onReset}
          className="mt-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded"
        >
          Try Again
        </button>
      </div>
    );
  }

  // ✅ --- EXPORT TO WORD ---
  const exportToWord = () => {
    let contentHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' 
            xmlns:w='urn:schemas-microsoft-com:office:word' 
            xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Export HTML to Word Document</title>
      <style> body { font-family: 'Arial Unicode MS', sans-serif; direction: rtl; } </style>
      </head>
      <body>
        <h1>${article.title}</h1>
        <div>${article.content.replace(/\n/g, "<br />")}</div>
        <h2>ملخص النقاط الرئيسية</h2>
        <ul>${(article.summaryPoints || [])
          .map((p) => `<li>${p}</li>`)
          .join("")}</ul>
        <h2>الكلمات المفتاحية</h2>
        <p>${(article.keywords || []).join(", ")}</p>
        <h2>المصادر</h2>
        <ul>${(article.sources || [])
          .map((s) => `<li>${s}</li>`)
          .join("")}</ul>
        <h2>منشورات السوشيال ميديا</h2>
        <h3>تويتر</h3>
        <p>${article.socialMediaPosts?.twitter || ""}</p>
        <h3>فيسبوك</h3>
        <p>${article.socialMediaPosts?.facebook || ""}</p>
      </body>
      </html>`;

    const blob = new Blob(["\ufeff", contentHtml], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${article.title.replace(/\s+/g, "_")}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ✅ --- SAFE RENDERING ---
  const formattedContent = article.content.replace(/\n/g, "<br />");

  return (
    <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg border border-gray-700 animate-fade-in">
      <div className="flex justify-between items-start mb-4">
        <h1 className="text-3xl font-bold text-cyan-400">{article.title}</h1>
        <div className="flex space-x-2 rtl:space-x-reverse">
          <button
            onClick={onReset}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-md text-gray-300 transition-colors"
            title="إنشاء مقال جديد"
          >
            <RefreshIcon className="w-5 h-5" />
          </button>
          <button
            onClick={exportToWord}
            className="p-2 bg-green-600 hover:bg-green-700 rounded-md text-white transition-colors"
            title="تصدير كملف Word"
          >
            <DownloadIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {article.imageUrl && (
        <img
          src={article.imageUrl}
          alt={article.title}
          className="w-full h-64 object-cover rounded-lg mb-6"
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          className="md:col-span-2 prose prose-invert max-w-none text-gray-300"
          dangerouslySetInnerHTML={{ __html: formattedContent }}
        />

        <div className="space-y-6">
          <div className="bg-gray-900/50 p-4 rounded-lg">
            <h3 className="font-bold mb-2 text-cyan-400">
              ملخص النقاط الرئيسية
            </h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {(article.summaryPoints || []).map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </div>

          <div className="bg-gray-900/50 p-4 rounded-lg">
            <h3 className="font-bold mb-2 text-cyan-400">
              الكلمات المفتاحية (SEO)
            </h3>
            <div className="flex flex-wrap gap-2">
              {(article.keywords || []).map((keyword, i) => (
                <span
                  key={i}
                  className="bg-gray-700 text-xs font-medium px-2.5 py-1 rounded-full"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-gray-900/50 p-4 rounded-lg">
            <h3 className="font-bold mb-2 text-cyan-400">المصادر</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {(article.sources || []).map((source, i) => (
                <li key={i}>{source}</li>
              ))}
            </ul>
          </div>

          <div className="bg-gray-900/50 p-4 rounded-lg space-y-4">
            <h3 className="font-bold text-cyan-400">منشورات التواصل الاجتماعي</h3>
            <div>
              <h4 className="font-semibold text-sm mb-1">تويتر</h4>
              <p className="text-xs bg-gray-800 p-2 rounded">
                {article.socialMediaPosts?.twitter || "—"}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-1">فيسبوك</h4>
              <p className="text-xs bg-gray-800 p-2 rounded">
                {article.socialMediaPosts?.facebook || "—"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
