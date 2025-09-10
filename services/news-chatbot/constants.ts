import type { Message } from './types';

export const INITIAL_BOT_MESSAGE: Message = {
  id: 1,
  text: 'أهلاً بك في مساعد النجاح الإخباري الذكي. كيف يمكنني مساعدتك اليوم؟ اسأل عن أي خبر من موقع nn.ps.',
  sender: 'bot',
};

export const NOT_FOUND_MESSAGE: string = "عذرًا، لا تتوفر أي أخبار عن هذا الموضوع على موقع NN.PS حالياً.";