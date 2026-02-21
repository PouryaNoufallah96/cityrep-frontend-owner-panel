import api from '../config/api';

export interface AddressInfoUpdate {
    province?: string;
    city?: string;
    address?: string;
    postalCode?: string;
    geoLocation?: {
        longitude: number;
        latitude: number;
    };
}

export interface GymTrendInfoUpdate {
    gymTrendId: string;
    men?: Array<{
        dayOfWeek: string;
        sessions?: Array<{
            price: number;
            timeType: string;
            from: number;
            to: number;
            capacity?: number;
        }>;
    }>;
    women?: Array<{
        dayOfWeek: string;
        sessions?: Array<{
            price: number;
            timeType: string;
            from: number;
            to: number;
            capacity?: number;
        }>;
    }>;
}

export interface AddGymPayload {
    title: string;
    description?: string;
    level?: string;
    address?: AddressInfoUpdate;
    contact?: {
        phoneNumber?: string;
        email?: string;
        socialMedia?: Record<string, string>;
    };
    images?: Array<{
        imageUrl: string;
        order: number;
    }>;
    trends?: GymTrendInfoUpdate[];
    facilityIds?: string[];
}

export interface GymTrend {
    gymTrendId: string;
    title: string;
    iconUrl: string;
}

export const gymService = {
    async addGym(data: AddGymPayload) {
        const response = await api.post('/Gym/AddGym', data);
        return response.data;
    },

    async editGym(data: AddGymPayload & { gymId: string }) {
        const response = await api.post('/Gym/EditGym', data);
        return response.data;
    },

    async getAllGyms(filter?: any) {
        const response = await api.post('/Gym/GetAllGyms', filter || { pagination: { page: 1, pageSize: 10 } });
        return response.data;
    },

    async getAllTrends() {
        const response = await api.post('/GymTrend/GetAll', {
            pagination: { page: 1, pageSize: 100 },
            filters: [],
            sorts: [],
        });
        return response.data;
    },
};
