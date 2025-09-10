import React from 'react';
import type { NewsRefineInput, StylePrefs, OutputPrefs, Constraints } from '../types';

interface OptionsPanelProps {
  options: NewsRefineInput;
  onOptionsChange: <K extends keyof (StylePrefs & OutputPrefs & Constraints)>(
    section: 'style_prefs' | 'output' | 'constraints',
    key: K,
    value: (StylePrefs & OutputPrefs & Constraints)[K]
  ) => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="border-t border-slate-200 mt-6 pt-6">
        <h3 className="text-lg font-bold text-slate-600 mb-4">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {children}
        </div>
    </div>
);

const Toggle: React.FC<{ label: string; checked: boolean; onChange: (checked: boolean) => void }> = ({ label, checked, onChange }) => (
    <label className="flex items-center justify-between cursor-pointer">
        <span className="text-slate-700">{label}</span>
        <div className="relative">
            <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
            <div className={`block w-14 h-8 rounded-full transition-colors ${checked ? 'bg-sky-500' : 'bg-slate-300'}`}></div>
            <div className={`dot absolute right-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${checked ? 'translate-x-[-24px]' : ''}`}></div>
        </div>
    </label>
);


export const OptionsPanel: React.FC<OptionsPanelProps> = ({ options, onOptionsChange }) => {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-slate-700">2. تخصيص المخرجات</h2>
      
      <Section title="تفضيلات الأسلوب">
        <div>
          <label htmlFor="generation_engine" className="block text-sm font-medium text-slate-700 mb-1">محرك التوليد</label>
          <select id="generation_engine" value={options.style_prefs.generation_engine} onChange={e => onOptionsChange('style_prefs', 'generation_engine', e.target.value as any)} className="w-full p-2 border border-slate-300 rounded-md">
            <option value="gemini">Gemini (الافتراضي)</option>
            <option value="chatgpt">ChatGPT (تجريبي ونشط)</option>
            <option value="claude" disabled>Claude (غير متاح)</option>
          </select>
          <p className="text-xs text-slate-400 mt-1">ملاحظة: خيار ChatGPT تجريبي وقد يؤثر على جودة المخرجات. خيار Claude غير متاح حالياً.</p>
        </div>
        <div>
          <label htmlFor="editing_level" className="block text-sm font-medium text-slate-700 mb-1">مستوى التحرير</label>
          <select id="editing_level" value={options.style_prefs.editing_level} onChange={e => onOptionsChange('style_prefs', 'editing_level', e.target.value as any)} className="w-full p-2 border border-slate-300 rounded-md">
            <option value="direct">مباشر (صياغة سريعة)</option>
            <option value="detailed">تفصيلي (توسع بالشرح)</option>
            <option value="analytical">تحليلي (إضافة خلفية)</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="tone" className="block text-sm font-medium text-slate-700 mb-1">الأسلوب التحريري</label>
          <select id="tone" value={options.style_prefs.tone} onChange={e => onOptionsChange('style_prefs', 'tone', e.target.value as any)} className="w-full p-2 border border-slate-300 rounded-md">
            <option value="annajah">أسلوب النجاح</option>
            <option value="alsharq">أسلوب الشرق</option>
            <option value="neutral">محايد</option>
          </select>
        </div>
        <div className="md:col-span-2">
            <label htmlFor="custom_style" className="block text-sm font-medium text-slate-700 mb-1">
                تدريب على الأسلوب (اختياري)
            </label>
            <textarea
                id="custom_style"
                rows={3}
                value={options.style_prefs.custom_style || ''}
                onChange={e => onOptionsChange('style_prefs', 'custom_style', e.target.value)}
                placeholder="أدخل هنا مثالاً على الأسلوب التحريري الذي تفضله ليتم اتباعه..."
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow"
            ></textarea>
        </div>
        <Toggle label="تضمين اقتباسات" checked={options.style_prefs.include_quotes} onChange={v => onOptionsChange('style_prefs', 'include_quotes', v)} />
        <Toggle label="تضمين صندوق خلفية" checked={options.style_prefs.include_context_box} onChange={v => onOptionsChange('style_prefs', 'include_context_box', v)} />
      </Section>

      <Section title="خيارات الإخراج">
         <Toggle label="تضمين بيانات AISEO" checked={options.output.include_aiseo} onChange={v => onOptionsChange('output', 'include_aiseo', v)} />
         <Toggle label="إضافة صورة للمقال" checked={options.output.include_image} onChange={v => onOptionsChange('output', 'include_image', v)} />
         <Toggle label="البحث عن صور مفتوحة المصدر" checked={options.output.search_open_source_images} onChange={v => onOptionsChange('output', 'search_open_source_images', v)} />
         <Toggle label="توليد نسخة إنجليزية" checked={options.output.dual_language} onChange={v => onOptionsChange('output', 'dual_language', v)} />
      </Section>

      <Section title="القيود الفنية">
        <div>
            <label htmlFor="max_words" className="block text-sm font-medium text-slate-700 mb-1">الحد الأقصى للكلمات</label>
            <input type="number" id="max_words" value={options.constraints.max_words} onChange={e => onOptionsChange('constraints', 'max_words', parseInt(e.target.value, 10))} className="w-full p-2 border border-slate-300 rounded-md" />
        </div>
        <div>
            <label htmlFor="min_sources" className="block text-sm font-medium text-slate-700 mb-1">الحد الأدنى للمصادر</label>
            <input type="number" id="min_sources" value={options.constraints.min_sources} onChange={e => onOptionsChange('constraints', 'min_sources', parseInt(e.target.value, 10))} className="w-full p-2 border border-slate-300 rounded-md" />
        </div>
      </Section>
    </div>
  );
};