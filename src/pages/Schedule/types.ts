export interface LocalSession {
    _clientId: string;
    id?: string;
    pairedId?: string;
    dayOfWeek: number;
    trendId: string;
    fromTime: string;
    toTime: string;
    capacity: string;
    price: string;
    gender: 'men' | 'women' | 'both';
    applyAllDays?: boolean;
    _clonedFrom?: string;
}
