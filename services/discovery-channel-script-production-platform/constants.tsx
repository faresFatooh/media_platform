
import { Program, Section } from './types';

export const NAV_ITEMS: { id: Section; name: string; icon: string }[] = [
  { id: 'dashboard', name: 'لوحة التحكم', icon: '📊' },
  { id: 'newScript', name: 'نص جديد', icon: '✍️' },
  { id: 'factCheck', name: 'تدقيق الحقائق', icon: '✅' },
  { id: 'api', name: 'إعدادات API', icon: '🔧' },
];

export const PROGRAMS: Program[] = [
    { id: 'earth', name: 'الأرض وما بعدها', icon: '🌍', scriptCount: 32 },
    { id: 'killers', name: 'قتلة متسلسلون', icon: '🔪', scriptCount: 18 },
    { id: 'creatures', name: 'كائنات مذهلة', icon: '🦁', scriptCount: 45 },
    { id: 'useless', name: 'معلومة غير مفيدة', icon: '🤔', scriptCount: 67 },
    { id: 'courts', name: 'محاكم', icon: '⚖️', scriptCount: 21 },
    { id: 'arsenal', name: 'ترسانة الماضي', icon: '⚔️', scriptCount: 28 },
    { id: 'dangerous', name: 'مهن خطرة', icon: '⚠️', scriptCount: 15 },
    { id: 'maps', name: 'خرائط', icon: '🗺️', scriptCount: 12 },
    { id: 'missing', name: 'مفقودون', icon: '🔍', scriptCount: 9 },
    { id: 'thieves', name: 'سارقون', icon: '💰', scriptCount: 14 },
    { id: 'dishes', name: 'أطباق غريبة', icon: '🍽️', scriptCount: 22 },
    { id: 'carousel', name: 'كروسيل', icon: '🎪', scriptCount: 8 },
    { id: 'facts', name: '5 حقائق', icon: '5️⃣', scriptCount: 35 },
    { id: 'theories', name: 'نظريات', icon: '🧪', scriptCount: 19 },
];
