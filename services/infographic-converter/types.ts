export interface SlideContentItem {
  text: string;
  icon: string; 
  fontSize?: number; // in rem
  textColor?: string;
  isBold?: boolean;
}

export type TextStyle = 'default' | 'highlight' | 'minimal' | 'card';

export interface Slide {
  id: string;
  title: string;
  content: SlideContentItem[];
  visual: {
    method: 'search' | 'generate';
    query: string;
  };
  userImageUrl?: string;
  titleFontSize?: number; // in rem
  contentFontSize?: number; // in rem
  fontFamily?: string;
  imageRefreshKey?: number;
  backgroundTransform?: {
    scale: number;
    position: {
      x: number; // percentage
      y: number; // percentage
    }
  };
  textTransform?: {
    position: {
      x: number; // percentage
      y: number; // percentage
    }
  };
  textStyle?: TextStyle;
  titleColor?: string;
  textColor?: string;
  isTitleBold?: boolean;
}