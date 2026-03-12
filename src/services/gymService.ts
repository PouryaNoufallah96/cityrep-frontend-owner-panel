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
    // level?: string;
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
    supportedGender?: string[] //Male, Female
}

export interface GymTrend {
    gymTrendId: string;
    title: string;
    iconUrl: string;
}

export interface GymData {
    gymId: string;
    title: string;
    description: string;
    level: string;
    slug: string;
    supportedGender?: string[] //Male, Female

    address?: {
        geoLocation?: {
            longitude: number;
            latitude: number;
        };
        address?: string;
    };
    contact?: {
        phoneNumber: string;
    };
    trends: Array<{
        gymTrendId: string;
        trendIconUrl: string;
        title: string;
        isActive: boolean;
    }>;
    gymTotalWorkingHour: Array<{
        dayOfWeek: string;
        isClosed: boolean;
    }>;
    images: any[];
    facilities: any[];
    state: string;
    weekPrices: any[];
    rate: number;
    createdMoment: string;
}

export interface GetAllGymsResponse {
    data: {
        data: GymData[];
        pageCount: number;
        totalCount: number;
    };
    isSuccess: boolean;
    statusCode: number;
    message: string;
}

export interface GetAllGymsPayload {
    pagination?: {
        page: number;
        size: number;
    };
    genders?: string[];
    gymLevels?: string[];
    gymTrendIds?: string[];
    facilityIds?: string[];
    search?: string;
}

export interface EditGymCommonDataPayload {
    gymId: string;
    title: string;
    phoneNumber: string;
    genders: string[];
    addressText: string;
}

export interface EditGymGeoLocationPayload {
    gymId: string;
    geoLocation: {
        longitude: number;
        latitude: number;
    };
}

export interface EditGymImagesPayload {
    gymId: string;
    images: Array<{
        imageUrl: string;
        order: number;
    }>;
}

export interface ToggleGymActivityTrendPayload {
    gymId: string;
    gymTrendId: string;
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

    async editGymCommonData(data: EditGymCommonDataPayload) {
        const response = await api.post('/Gym/EditGymCommonData', data);
        return response.data;
    },

    async editGymGeoLocation(data: EditGymGeoLocationPayload) {
        const response = await api.post('/Gym/EditGymGeoLocationSync', data);
        return response.data;
    },

    async editGymImages(data: EditGymImagesPayload) {
        const response = await api.post('/Gym/EditGymImages', data);
        return response.data;
    },

    async getAllGyms(filter?: GetAllGymsPayload): Promise<GetAllGymsResponse> {
        const response = await api.post('/Gym/GetAllGyms', filter || { pagination: { page: 1, size: 10 } });
        return response.data;
    },

    async getAllTrends() {
        const response = await api.post('/GymTrend/GetAllForGymOwner');
        return response.data;
    },

    async toggleGymActivityTrend(data: ToggleGymActivityTrendPayload) {
        const response = await api.post('/Gym/ToggleGymActivityTrend', data);
        return response.data;
    },
};
