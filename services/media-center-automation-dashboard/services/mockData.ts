
import { ContentItem, ContentStatus } from '../types';

export const initialContentItems: ContentItem[] = [
  {
    id: 'item-1',
    title: 'اجتماع طارئ لمجلس الأمن لمناقشة التوترات الأخيرة',
    source: 'سحب من الجزيرة',
    sourceIcon: 'fa-solid fa-satellite-dish',
    createdAt: 'منذ 5 دقائق',
    status: ContentStatus.READY_FOR_REVIEW,
    originalContent: 'أعلن مجلس الأمن عن عقد اجتماع طارئ يوم غد لمناقشة التوترات الأخيرة في المنطقة، وسط دعوات لضبط النفس.',
    mainOutput: {
      id: 'output-1-main',
      type: 'خبر محرر وجاهز للنشر',
      icon: 'fa-solid fa-newspaper',
      content: 'دعا مجلس الأمن الدولي إلى عقد جلسة طارئة غدًا الثلاثاء، بهدف بحث التصعيد الأخير في المنطقة. وتأتي هذه الدعوة في ظل تزايد القلق الدولي من اتساع رقعة الصراع، مع مطالبة عدة أطراف دولية بضرورة ضبط النفس وتجنب المزيد من الإجراءات التي قد تفاقم الوضع.',
    },
    additionalOutputs: [
      {
        id: 'output-1-social',
        type: 'منشور سوشال ميديا',
        icon: 'fa-solid fa-share-nodes',
        content: '#عاجل | مجلس الأمن يعقد جلسة طارئة غدًا لمناقشة التوترات الأخيرة في المنطقة.\n#أخبار #سياسة',
      }
    ],
    publishedTo: [],
  },
  {
    id: 'item-2',
    title: 'إطلاق هاتف ذكي جديد بميزات ثورية',
    source: 'إدخال نص يدوي',
    sourceIcon: 'fa-solid fa-file-pen',
    createdAt: 'منذ ساعة',
    status: ContentStatus.PUBLISHED,
    originalContent: 'شركة تكنولوجيا تكشف عن هاتف جديد ببطارية تدوم أسبوع وكاميرا تصور في الظلام الدامس',
    mainOutput: {
      id: 'output-2-main',
      type: 'خبر محرر وجاهز للنشر',
      icon: 'fa-solid fa-newspaper',
      content: 'كشفت شركة "تيك كورب" الرائدة في مجال التكنولوجيا عن هاتفها الذكي الجديد "Evo X"، الذي يأتي بمواصفات ثورية تهدف إلى تغيير قواعد المنافسة. يتميز الهاتف ببطارية تدوم حتى سبعة أيام من الاستخدام المعتدل، بالإضافة إلى كاميرا مزودة بتقنية "الرؤية الليلية الفائقة" التي تتيح التصوير بوضوح عالٍ في ظروف الإضاءة المنخفضة جدًا.',
    },
    additionalOutputs: [
      {
        id: 'output-2-video-script',
        type: 'نص فيديو قصير',
        icon: 'fa-solid fa-film',
        content: 'هل تخيلت يومًا هاتفًا لا تحتاج لشحنه إلا مرة واحدة في الأسبوع؟ شركة تيك كورب تجعل الخيال حقيقة بهاتفها الجديد Evo X! وبكاميرا ترى في الظلام، استعدوا لثورة في عالم الهواتف الذكية.',
      }
    ],
    publishedTo: ['youtube', 'facebook'],
  },
];
