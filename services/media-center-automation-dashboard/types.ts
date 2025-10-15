export enum ContentStatus {
  DRAFT = 'مسودة',
  PROCESSING = 'قيد المعالجة',
  READY_FOR_REVIEW = 'جاهز للمراجعة',
  APPROVED = 'تمت الموافقة',
  PUBLISHED = 'تم النشر',
  FAILED = 'فشلت المعالجة',
}

export interface Output {
  id: string;
  type: string;
  content: string;
  icon: string;
  channel?: Channel; // إضافة اختيارية لدعم ربط المخرج بقناة معينة
}

export interface ContentItem {
  id: string;
  title: string;
  source: string;
  sourceIcon: string;
  createdAt: string;
  status: ContentStatus;
  originalContent: string;
  mainOutput: Output;
  additionalOutputs: Output[];
  publishedTo: string[];
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'input' | 'process';
  payload?: any;
}

export interface Channel {
  id: string;
  name: string;
  icon: string;
  color: string;
}