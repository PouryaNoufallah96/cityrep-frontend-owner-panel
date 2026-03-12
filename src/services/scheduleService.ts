import api from '../config/api';

export interface ISession {
    id: string;
    dayOfWeek: number; // 0 to 6 (Saturday = 0)
    trendId: string;
    fromTime: string;
    toTime: string;
    capacity: number;
    price: number;
    gender: 'men' | 'women' | 'both';
}

const DaysList = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const dayToNumber = (day: string) => DaysList.indexOf(day);
const numberToDay = (n: number) => DaysList[n];

const timeToNumber = (t: string) => parseInt(t.replace(':', ''), 10);
const numberToTime = (n: number) => {
    const s = n.toString().padStart(4, '0');
    return `${s.slice(0, 2)}:${s.slice(2, 4)}`;
};

export const scheduleService = {
    async getSessions(gymId: string, trendIds: string[]): Promise<ISession[]> {
        const payload = {
            gymId,
            pagination: { page: 1, size: 1000 },
            genders: ["Male", "Female"],
            gymTrendIds: trendIds,
            days: DaysList,
            sessionActivity: ["Active"],
            search: ""
        };

        const response = await api.post('/Gym/GetGymSessionsList', payload);
        const list = response.data?.data?.data || [];

        return list.map((s: any) => ({
            id: s.gymSessionId,
            dayOfWeek: dayToNumber(s.dayOfWeek || s.day),
            trendId: s.gymTrendId,
            fromTime: numberToTime(s.from),
            toTime: numberToTime(s.to),
            capacity: s.capacity,
            price: s.price,
            gender: s.gender === 'Female' ? 'women' : 'men'
        }));
    },

    async addSessionsForTrend(gymId: string, trendId: string, sessions: ISession[]): Promise<void> {
        const payload = {
            gymId,
            trendData: {
                gymTrendId: trendId,
                men: [] as any[],
                women: [] as any[],
            }
        };

        const mapSessions = (genderFilter: 'men' | 'women') => {
            const filteredSessions = sessions.filter(s => s.gender === genderFilter || s.gender === 'both');
            const daysObj: Record<string, any[]> = {};

            filteredSessions.forEach(s => {
                const dayName = numberToDay(s.dayOfWeek);
                if (!daysObj[dayName]) daysObj[dayName] = [];

                daysObj[dayName].push({
                    price: s.price,
                    timeType: "Session",
                    from: timeToNumber(s.fromTime),
                    to: timeToNumber(s.toTime),
                    capacity: s.capacity
                });
            });

            return Object.keys(daysObj).map(dayName => ({
                dayOfWeek: dayName,
                sessions: daysObj[dayName]
            }));
        };

        payload.trendData.men = mapSessions('men');
        payload.trendData.women = mapSessions('women');

        await api.post('/Gym/AddSessionForGymTrend', payload);
    },

    async deleteSession(gymId: string, gymTrendId: string, sessionId: string): Promise<void> {
        await api.post('/Gym/RemoveSessionForGymTrend', {
            gymId,
            gymTrendId,
            gymSessionId: sessionId
        });
    },

    async getSessionsList(payload: {
        gymId: string;
        pagination: { page: number; size: number };
        genders: string[];
        gymTrendIds: string[];
        days: string[];
        sessionActivity: string[];
        search: string;
    }) {
        const response = await api.post('/Gym/GetGymSessionsList', payload);
        return response.data;
    },

    async toggleSessionActivity(payload: { gymId: string; gymTrendId: string; gymSessionId: string }) {
        const response = await api.post('/Gym/ToggleGymSessionActivity', payload);
        return response.data;
    }
};
