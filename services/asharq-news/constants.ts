import React from 'react';
import type { Platform } from './types';

// FIX: Replaced all JSX syntax with React.createElement calls to make this file valid TypeScript (.ts).
// This resolves numerous parsing errors. In a typical setup, this file would be renamed to `constants.tsx`.

function PlatformIconX() {
  return React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "currentColor" },
      React.createElement('path', { d: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" })
  );
}
function PlatformIconInstagram() {
  return React.createElement('svg', { xmlns: "http://www.w.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" },
      React.createElement('rect', { width: "20", height: "20", x: "2", y: "2", rx: "5", ry: "5" }),
      React.createElement('path', { d: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" }),
      React.createElement('line', { x1: "17.5", x2: "17.51", y1: "6.5", y2: "6.5" })
  );
}
function PlatformIconFacebook() {
  return React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "currentColor" },
      React.createElement('path', { d: "M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" })
  );
}
function PlatformIconLinkedIn() {
    return React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "currentColor" },
        React.createElement('path', { d: "M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" })
    );
}
function PlatformIconThreads() {
    return React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "currentColor" },
        React.createElement('path', { d: "M14.51 2.04C13.29.74 11.53 0 9.17 0 4.1 0 0 3.93 0 9.13c0 2.45.99 4.7 2.66 6.36l.24.23c.31.3.69.46 1.08.46.4 0 .79-.17 1.08-.45.6-.58.6-1.54.02-2.13-.1-.1-.21-.2-.33-.31C3.65 12.18 3 10.7 3 9.13 3 5.54 5.75 3 9.17 3c1.64 0 3.03.7 4.02 1.83.6.68.79 1.62.53 2.48-.32 1.05-1.2 2.2-2.67 3.43-1.8 1.5-3.64 2.89-3.64 5.39 0 .28.23.5.5.5h3c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-2.5c0-1.8 1.15-2.85 2.86-4.25 2.1-1.73 3.32-3.32 3.69-4.83.4-1.56.09-3-1.07-4.17M20.93 11.23c-1.1-1.3-2.6-2.08-4.48-2.08-3.41 0-6.17 2.54-6.17 6.13 0 1.57.65 3.05 1.81 4.17.12.11.23.21.33.31.58.59 1.54.59 2.13.02.58-.58.59-1.54.02-2.13-.1-.1-.21-.2-.33-.31-1.17-1.12-1.81-2.6-1.81-4.17 0-2.59 2.75-5.13 5.17-5.13 1.64 0 3.03.7 4.02 1.83.6.68.79 1.62.53 2.48-.32 1.05-1.2 2.2-2.67 3.43-1.8 1.5-3.64 2.89-3.64 5.39 0 .28.23.5.5.5h3c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-2.5c0-1.8 1.15-2.85 2.86-4.25 2.1-1.73 3.32-3.32 3.69-4.83.4-1.56.09-3-1.07-4.17" })
    );
}
function PlatformIconTikTok() {
    return React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "currentColor" },
        React.createElement('path', { d: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-2.43.05-4.86-.95-6.69-2.81-1.77-1.8-2.55-4.18-2.4-6.64.15-2.47 1.1-4.86 2.82-6.58 1.7-1.7 3.98-2.62 6.35-2.71.01 1.56-.01 3.12.01 4.67.01.21.01.42.02.64-.31-.02-.62-.03-.93-.03-1.14 0-2.27.39-3.21 1.15-.88.72-1.45 1.7-1.56 2.85-.11 1.14.21 2.28 1.02 3.11.83.84 1.98 1.25 3.13 1.25 1.14 0 2.27-.39 3.21-1.15.88-.72 1.45 1.7 1.56-2.85.11-1.19-.19-2.38-1-3.26-.4-.42-.88-.75-1.39-1.01-.13-.07-.25-.16-.38-.23v-4.67c.83.13 1.64.38 2.41.73z" })
    );
}
function PlatformIconYouTube() {
    return React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "currentColor" },
        React.createElement('path', { d: "M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" })
    );
}
function PlatformIconTelegram() {
    return React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "currentColor" },
        React.createElement('path', { d: "M9.78 18.39a.74.74 0 001.03-.23l1.85-2.89 3.69 2.72a.75.75 0 001.2-.53V5.54a.75.75 0 00-1.13-.67L3.4 11.12a.75.75 0 00.16 1.34l4.1 1.28 9.49-5.97c.33-.2.6.14.31.39l-7.53 6.81z" })
    );
}

// FIX: Changed type from JSX.Element to React.ReactElement and used React.createElement for icons to ensure compatibility with .ts files.
export const PLATFORMS: Record<Platform, { name: string; icon: React.ReactElement; charLimit: number }> = {
  x: { name: 'X (Twitter)', icon: React.createElement(PlatformIconX), charLimit: 280 },
  instagram: { name: 'Instagram', icon: React.createElement(PlatformIconInstagram), charLimit: 2200 },
  facebook: { name: 'Facebook', icon: React.createElement(PlatformIconFacebook), charLimit: 63206 },
  linkedin: { name: 'LinkedIn', icon: React.createElement(PlatformIconLinkedIn), charLimit: 3000 },
  threads: { name: 'Threads', icon: React.createElement(PlatformIconThreads), charLimit: 500 },
  tiktok: { name: 'TikTok', icon: React.createElement(PlatformIconTikTok), charLimit: 2200 },
  youtube_shorts: { name: 'YouTube Shorts', icon: React.createElement(PlatformIconYouTube), charLimit: 150 },
  telegram: { name: 'Telegram', icon: React.createElement(PlatformIconTelegram), charLimit: 4096 },
};

// FIX: Exported the LogoIcon component so it can be imported by other modules.
export const LogoIcon: React.FC = () => (
    React.createElement('svg', { width: "40", height: "40", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" },
        React.createElement('path', { d: "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" }),
        React.createElement('path', { d: "M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" })
    )
);
