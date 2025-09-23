import { Script, TrainingData } from '../types';

export const researchWithClaude = async (topic: string): Promise<string> => {
  const response = await fetch('/api/claude/research', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic })
  });
  const data = await response.json();
  return data.research;
};

export const transformWithClaude = async (
  styleName: string,
  title: string,
  duration: string,
  language: string,
  sourceText: string,
  trainingData?: TrainingData
): Promise<Script> => {
  const response = await fetch('/api/claude/transform', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ styleName, title, duration, language, sourceText, trainingData })
  });
  return await response.json();
};
