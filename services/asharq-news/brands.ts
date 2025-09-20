import type { Platform } from './types';

export interface Brand {
  id: string;
  name: string;
  platforms: Platform[];
  defaultHashtags: string;
}

export const BRANDS: Record<string, Brand> = {
  asharq_palestine: {
    id: 'asharq_palestine',
    name: 'الشرق فلسطين',
    platforms: ['x', 'instagram', 'facebook', 'linkedin', 'threads', 'tiktok', 'youtube_shorts', 'telegram'],
    defaultHashtags: '#الشرق_فلسطين #فلسطين',
  },
  al_najah: {
    id: 'al_najah',
    name: 'النجاح',
    platforms: ['facebook', 'instagram', 'linkedin'],
    defaultHashtags: '#النجاح #جامعة_النجاح_الوطنية',
  },
};
