import axios from 'axios';  // أضف axios للـ API calls
import { ContentItem, ContentStatus, Workflow, Output } from '../types';

const USE_MOCK_API = true;  // غير لـ false لو n8n جاهز، عشان يستخدم الـ real API
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://your-n8n-instance/webhook/process-news';

const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

const mockGeminiAPICall = async (prompt: string): Promise<string> => {
  await simulateDelay(1500);
  if (prompt.includes("أعد صياغة الخبر التالي")) {
      return `**عنوان جذاب مُعاد صياغته**\nبأسلوب صحفي احترافي، تمت إعادة صياغة الخبر ليصبح أكثر جاذبية للقارئ. تم التركيز على النقاط الرئيسية وإبراز أهميتها في السياق الحالي. ${prompt.substring(25, 150)}...`;
  }
  if (prompt.includes("تغريدة قصيرة لمنصة X")) {
      return `خبر عاجل: مجلس الأمن يجتمع غدًا لبحث التوترات الأخيرة في المنطقة. دعوات لضبط النفس وتجنب التصعيد. #مجلس_الأمن #أخبار_عاجلة`;
  }
  if (prompt.includes("منشور مفصل لفيسبوك")) {
      return `في تطور هام، دعا مجلس الأمن الدولي إلى عقد جلسة طارئة يوم الثلاثاء لمناقشة التصعيد الأخير في المنطقة. يأتي هذا التحرك وسط قلق دولي متزايد من تدهور الأوضاع.\nما هي توقعاتكم لنتائج هذا الاجتماع؟ شاركونا آراءكم. \n#سياسة #اخبار_العالم #مجلس_الأمن`;
  }
   if (prompt.includes("كابشن جذاب لانستغرام")) {
      return `🌎 الأنظار تتجه نحو مجلس الأمن غدًا! اجتماع طارئ لبحث التوترات المتصاعدة في المنطقة. \n.\n.\n#أخبار #العالم #سياسة #تطورات #peace`;
  }
  if (prompt.includes("رسالة إخبارية سريعة لتلجرام")) {
      return `🚨 **عاجل** 🚨\nمجلس الأمن يعقد جلسة طارئة غدًا الثلاثاء لمناقشة التوترات الأخيرة في المنطقة.`;
  }
  if (prompt.includes("تحديث موجز لواتساب")) {
      return `*تحديث إخباري:* مجلس الأمن سيجتمع بشكل طارئ غدًا لمناقشة الأوضاع المتوترة في المنطقة.`;
  }
  if (prompt.includes("حول النص التالي إلى نص فيديو")) {
      return `(مشهد افتتاحي موسيقى حماسية) \nالخبر الذي هز العالم اليوم... (صوت معلق) إليكم التفاصيل الكاملة في هذا التقرير المصور... (مشاهد أرشيفية) ${prompt.substring(50, 150)}...`;
  }
  if (prompt.includes("Translate the following news article")) {
      return `**Attractive Translated Title**\nIn a professional journalistic style, the news has been translated for an international audience, focusing on key points and highlighting their significance. ${prompt.substring(50, 150)}...`;
  }
  if (prompt.includes("Analyze the potential performance")) {
      return `**تقرير الأداء المتوقع:**\n- **التفاعل:** مرتفع (8/10)\n- **CTR متوقع:** 4.5%\n- **ملاحظات:** المحتوى يتناول موضوعًا رائجًا، يُنصح بالنشر في أوقات الذروة.`;
  }
  if (prompt.includes("Create a news script for a digital avatar")) {
      return `(يبدأ الأفاتار بالحديث) مرحباً بكم في موجز الأنباء. نبدأ بخبرنا الرئيسي حيث... (يستعرض الأفاتار تفاصيل الخبر) ... وكان هذا أبرز ما لدينا.`;
  }
  return "تمت معالجة النص بنجاح باستخدام الذكاء الاصطناعي.";
};

const callN8nWorkflow = async (prompt: string, policy: string): Promise<string> => {
  try {
    const response = await axios.post(N8N_WEBHOOK_URL, {
      text: prompt,  // الخبر الخام أو الـ prompt
      policy: policy,  // السياسة التحريرية مثل "policy_najah_media"
    });
    // افترض إن n8n يرجع JSON مع 'output' يحتوي على الخبر المعاد صياغته
    return response.data.output || 'خطأ في معالجة الخبر';
  } catch (error) {
    console.error("n8n API call failed, falling back to mock.", error);
    return mockGeminiAPICall(prompt);
  }
};

export const triggerInputWorkflow = async (workflow: Workflow): Promise<Omit<ContentItem, 'id' | 'createdAt'>> => {
  await simulateDelay(2000); // Simulate network and processing time

  const rawContent = workflow.payload?.text || `محتوى خام من ${workflow.name} بتاريخ ${new Date().toLocaleString()}`;
  
  const editingPrompt = `أعد صياغة الخبر التالي بأسلوب صحفي احترافي وموجز، مع إضافة عنوان جذاب ومناسب للنشر. الخبر الأصلي: "${rawContent}"`;
  const editedContent = await callN8nWorkflow(editingPrompt, workflow.name);  // ربط مع n8n

  const title = editedContent.split('\n')[0].replace(/\*\*/g, '').trim() || 'خبر جديد قيد المعالجة';
  const mainContent = editedContent.substring(editedContent.indexOf('\n') + 1).trim();

  return {
    title: title,
    source: workflow.name,
    sourceIcon: workflow.icon,
    status: ContentStatus.READY_FOR_REVIEW,
    originalContent: rawContent,
    mainOutput: {
      id: `${Date.now()}-main`,
      type: 'خبر محرر وجاهز للنشر',
      icon: 'fa-solid fa-newspaper',
      content: mainContent,
    },
    additionalOutputs: [],
    publishedTo: [],
  };
};

export const triggerProcessWorkflow = async (workflow: Workflow, item: ContentItem): Promise<Output | null> => {
    await simulateDelay(1500);

    let prompt = '';
    let outputType = workflow.name;
    let outputIcon = workflow.icon;

    switch (workflow.id) {
        case 'generate-tweet':
            prompt = `بناءً على الخبر التالي، اقترح تغريدة قصيرة لمنصة X (تويتر) لا تتجاوز 280 حرفًا مع هاشتاغات مناسبة. الخبر: "${item.mainOutput.content}"`;
            break;
        case 'generate-facebook-post':
            prompt = `بناءً على الخبر التالي، اقترح منشور مفصل لفيسبوك يشجع على التفاعل. الخبر: "${item.mainOutput.content}"`;
            break;
        case 'generate-instagram-caption':
            prompt = `بناءً على الخبر التالي، اقترح كابشن جذاب لانستغرام مع إيموجيز وهاشتاغات. الخبر: "${item.mainOutput.content}"`;
            break;
        case 'generate-telegram-message':
            prompt = `بناءً على الخبر التالي، اقترح رسالة إخبارية سريعة لتلجرام. الخبر: "${item.mainOutput.content}"`;
            break;
        case 'generate-whatsapp-update':
            prompt = `بناءً على الخبر التالي، اقترح تحديث موجز لواتساب. الخبر: "${item.mainOutput.content}"`;
            break;
        case 'text-to-video':
            prompt = `حول النص التالي إلى نص فيديو قصير (سكريبت) لا يتجاوز دقيقة واحدة، مع وصف للمشاهد المقترحة. النص: "${item.mainOutput.content}"`;
            break;
        case 'text-to-podcast':
            prompt = `حول الخبر التالي إلى موجز صوتي (بودكاست) قصير. النص: "${item.mainOutput.content}"`;
            break;
        case 'translate-english':
            prompt = `Translate the following news article to professional English. Article: "${item.mainOutput.content}"`;
            break;
        case 'analyze-performance':
            prompt = `Analyze the potential performance of this content: "${item.mainOutput.content}". Provide a brief report on expected engagement, CTR, and views.`;
            break;
        case 'generate-avatar-news':
            prompt = `Create a news script for a digital avatar to read, based on this text: "${item.mainOutput.content}"`;
            break;
        default:
            prompt = `Process the following content for the task '${workflow.name}': "${item.mainOutput.content}"`;
            break;
    }

    const generatedContent = await callN8nWorkflow(prompt, workflow.name);

    return {
        id: `${Date.now()}-${workflow.id}`,
        type: outputType,
        icon: outputIcon,
        content: generatedContent,
    };
};