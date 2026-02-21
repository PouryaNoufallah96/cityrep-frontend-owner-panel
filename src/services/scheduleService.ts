export interface ISession {
    id: string;
    dayOfWeek: number; // 0 to 6 (Saturday = 0)
    trendId: string;
    fromTime: string;
    toTime: string;
    capacity: number;
    price: number;
}

// Mock database in memory
let mockSessions: ISession[] = [];

// Simulate latency
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const scheduleService = {
    async getSessions(trendId: string): Promise<ISession[]> {
        await delay(500);
        return mockSessions.filter(s => s.trendId === trendId);
    },

    async addSession(session: Omit<ISession, 'id'>, applyToAllDays: boolean): Promise<void> {
        await delay(500);

        // Add logic for all days
        const daysToAdd = applyToAllDays ? [0, 1, 2, 3, 4, 5, 6] : [session.dayOfWeek];

        daysToAdd.forEach(day => {
            mockSessions.push({
                ...session,
                id: Math.random().toString(36).substring(7),
                dayOfWeek: day
            });
        });
    },

    async deleteSession(sessionId: string): Promise<void> {
        await delay(300);
        mockSessions = mockSessions.filter(s => s.id !== sessionId);
    }
};
