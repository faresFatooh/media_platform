export interface SyncResult {
    synchronized?: string;
    original?: string;
    arabic?: string;
}

export interface SrtEntry {
    id: number;
    startTime: string;
    endTime: string;
    text: string;
}
