import { SrtEntry } from '../types';

export const timeToSeconds = (time: string): number => {
    if (!time) return 0;
    const parts = time.replace(',', '.').split(':');
    if (parts.length !== 3) return 0;
    return parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseFloat(parts[2]);
};

export const parseSrt = (srtContent: string): SrtEntry[] => {
    const entries: SrtEntry[] = [];
    if (!srtContent) return entries;
    const blocks = srtContent.trim().split(/\n\s*\n/);

    for (const block of blocks) {
        const lines = block.trim().split('\n');
        if (lines.length < 3) continue;

        const idLine = lines[0];
        const timeLine = lines.length > 1 ? lines[1] : '';
        const textLines = lines.slice(2);

        const id = parseInt(idLine, 10);
        const timeMatch = timeLine.match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/);
        
        if (timeMatch && textLines.length > 0) {
            const startTime = timeMatch[1];
            const endTime = timeMatch[2];
            const text = textLines.join('\n');
            const numericId = !isNaN(id) ? id : entries.length + 1;

            entries.push({ id: numericId, startTime, endTime, text });
        } else if (!isNaN(id) && lines.length >= 3) {
            const timeMatchFallback = lines[1].match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/);
            if(timeMatchFallback) {
                const startTime = timeMatchFallback[1];
                const endTime = timeMatchFallback[2];
                const text = lines.slice(2).join('\n');
                entries.push({ id, startTime, endTime, text });
            }
        }
    }
    return entries;
};

export const srtTimeToMilliseconds = (time: string): number => {
    if (!time) return 0;
    const parts = time.split(':');
    if (parts.length !== 3) return 0;
    const secondsAndMillis = parts[2].split(',');
    if (secondsAndMillis.length !== 2) return 0;

    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseInt(secondsAndMillis[0], 10);
    const milliseconds = parseInt(secondsAndMillis[1], 10);

    return (hours * 3600 + minutes * 60 + seconds) * 1000 + milliseconds;
};

export const millisecondsToSrtTime = (ms: number): string => {
    if (ms < 0) ms = 0; // Prevent negative timestamps

    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = ms % 1000;

    const pad = (num: number, size: number = 2) => num.toString().padStart(size, '0');

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)},${pad(milliseconds, 3)}`;
};

export const convertEntriesToSrt = (entries: SrtEntry[]): string => {
    return entries
        .map(entry => `${entry.id}\n${entry.startTime} --> ${entry.endTime}\n${entry.text}`)
        .join('\n\n');
};
