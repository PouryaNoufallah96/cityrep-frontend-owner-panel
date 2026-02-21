import api from '../config/api';

export interface GetVerificationCodePayload {
    phoneNumber: string;
    clientId: string;
    clientSecret: string;
}

export interface VerifyAndLoginPayload {
    phoneNumber: string;
    verificationCode: string;
    clientId: string;
    clientSecret: string;
    captchaKey?: string;
    captchaCode?: string;
}
export interface GymOwnerData {
    createdMoment: string;
    modifiedMoment: string;
    status: string;
    loginDates: string[];
    phoneNumber: string;
    role: string;
    fullName?: string;
    address?: {
        geoLocation: {
            longitude: number;
            latitude: number;
        };
        province?: string;
        city?: string;
        address?: string;
        postalCode?: string;
    };
    birthDay?: string;
    nationalId?: string;
    description: string;
    contact?: {
        phoneNumber: string;
        email: string;
        socialMedia: Record<string, string>;
    };
    identityDocumentUrls?: Array<{
        identityDocumentInfoId: string;
        createdMoment: string;
        modifiedMoment: string;
        status: string;
        title: string;
        url: string;
    }>;
}


// Client credentials from env
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_CLIENT_SECRET;
const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY || 'xfit_access_token';

export const authService = {
    async requestVerificationCode(phoneNumber: string): Promise<boolean> {
        const response = await api.post('/GymOwner/GetVerificationCodeForAuthentication', {
            phoneNumber,
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
        });
        return response.data;
    },

    async verifyAndLogin(phoneNumber: string, verificationCode: string): Promise<any> {
        const response = await api.post('/GymOwner/VerifyAndLoginWithVerificationCode', {
            phoneNumber,
            verificationCode,
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
        });
        return response.data;
    },

    async getGymOwnerData(): Promise<GymOwnerData> {
        const response = await api.get('/GymOwner/GetGymOnwerData');
        return response.data;
    },

    async renewToken(): Promise<any> {
        const response = await api.get('/GymOwner/RenewToken');
        return response.data;
    },

    logout() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('gymOwner');
    },
};
