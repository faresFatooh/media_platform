import { Program, Section } from './types';

export const NAV_ITEMS: { id: Section; name: string; icon: string }[] = [
  { id: 'dashboard', name: 'لوحة التحكم', icon: '📊' },
  { id: 'newScript', name: 'نص جديد', icon: '✍️' },
  { id: 'factCheck', name: 'تدقيق الحقائق', icon: '✅' },
  { id: 'training', name: 'تدريب النماذج', icon: '🧠' },
  { id: 'api', name: 'إعدادات API', icon: '🔧' },
];

const defaultTrainingData = {
  method: 'instructions' as const,
  instructions: '',
  beforeText: '',
  afterText: '',
};

export const PROGRAMS: Program[] = [
    { id: 'earth', name: 'الأرض وما بعدها', icon: '🌍', scriptCount: 32, trainingData: { ...defaultTrainingData } },
    { id: 'killers', name: 'قتلة متسلسلون', icon: '🔪', scriptCount: 18, trainingData: { ...defaultTrainingData, instructions: 'استخدم نبرة غامضة وجادة. ركز على الجانب النفسي للمجرمين ودوافعهم. تجنب التفاصيل الدموية المبالغ فيها.' } },
    { id: 'creatures', name: 'كائنات مذهلة', icon: '🦁', scriptCount: 45, trainingData: { ...defaultTrainingData } },
    { id: 'useless', name: 'معلومة غير مفيدة', icon: '🤔', scriptCount: 67, trainingData: { ...defaultTrainingData, instructions: 'يجب أن تكون النصوص طريفة وممتعة وسريعة الإيقاع. استخدم لغة بسيطة ومباشرة.' } },
    { id: 'courts', name: 'محاكم', icon: '⚖️', scriptCount: 21, trainingData: { ...defaultTrainingData } },
    { id: 'arsenal', name: 'ترسانة الماضي', icon: '⚔️', scriptCount: 28, trainingData: { ...defaultTrainingData } },
    { id: 'dangerous', name: 'مهن خطرة', icon: '⚠️', scriptCount: 15, trainingData: { ...defaultTrainingData } },
    { id: 'maps', name: 'خرائط', icon: '🗺️', scriptCount: 12, trainingData: { ...defaultTrainingData } },
    { id: 'missing', name: 'مفقودون', icon: '🔍', scriptCount: 9, trainingData: { ...defaultTrainingData } },
    { id: 'thieves', name: 'سارقون', icon: '💰', scriptCount: 14, trainingData: { ...defaultTrainingData } },
    { id: 'dishes', name: 'أطباق غريبة', icon: '🍽️', scriptCount: 22, trainingData: { ...defaultTrainingData } },
    { id: 'carousel', name: 'كروسيل', icon: '🎪', scriptCount: 8, trainingData: { ...defaultTrainingData } },
    { id: 'facts', name: '5 حقائق', icon: '5️⃣', scriptCount: 35, trainingData: { ...defaultTrainingData } },
    { id: 'theories', name: 'نظريات', icon: '🧪', scriptCount: 19, trainingData: { ...defaultTrainingData } },
];
