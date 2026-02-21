export interface LocalSession {
    _clientId: string;
    id?: string;
    dayOfWeek: number;
    trendId: string;
    fromTime: string;
    toTime: string;
    capacity: string;
    price: string;
    applyAllDays?: boolean;
    _clonedFrom?: string;
}
