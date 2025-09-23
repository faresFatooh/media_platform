import { Script, TrainingData } from '../types';

export const researchWithChatGPT = async (topic: string): Promise<string> => {
  const response = await fetch('/api/openai/research', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic })
  });
  const data = await response.json();
  return data.research;
};

export const generateWithChatGPT = async (
  styleName: string,
  title: string,
  duration: string,
  language: string,
  trainingData?: TrainingData
): Promise<Script> => {
  const response = await fetch('/api/openai/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ styleName, title, duration, language, trainingData })
  });
  return await response.json();
};
