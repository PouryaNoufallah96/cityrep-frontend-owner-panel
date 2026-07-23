import api from '../config/api';

const RESERVATION_STATES = ['Pending', 'Reserved', 'Used', 'Expired', 'Failed', 'NoShow', 'Cancelled'];

export interface GetReservationsPayload {
    pagination?: { page: number; size: number };
    states?: string[];
    gymTrendIds?: string[];
    sessionDateFrom?: string;
    sessionDateTo?: string;
    search?: string;
}

export interface ReservationItem {
    gymAttendanceId: string;
    clinetFullName: string;
    clientPhoneNumber: string;
    clientBirthDay: string;
    gymTrendTitle: string;
    gymTimeType: string;
    sessionPrice: number;
    gymStart: number;
    gymEnd: number;
    sessionDate: string;
    createdMoment: string;
    gymAttendanceState: string;
}

export interface ReservationsResult {
    items: ReservationItem[];
    pageCount: number;
    totalCount: number;
}

export interface AttendanceDetail {
    gymAttendanceReference: string;
    clinetFullName: string;
    clientPhoneNumber: string;
    gymTrendTitle: string;
    sessionDate: string;
    gymStart: number;
    gymEnd: number;
    sessionPrice: number;
    gymTimeType: string;
}

export const reservationService = {
    async getReservations(filter?: GetReservationsPayload): Promise<ReservationsResult> {
        const payload = {
            pagination: filter?.pagination ?? { page: 1, size: 10 },
            states: filter?.states ?? RESERVATION_STATES,
            gymTrendIds: filter?.gymTrendIds ?? [],
            sessionDateFrom: filter?.sessionDateFrom,
            sessionDateTo: filter?.sessionDateTo,
            search: filter?.search ?? '',
        };

        const response = await api.post('/GymAttendance/GetGymOwnerList', payload);

        return {
            items: response.data?.data?.data ?? [],
            pageCount: response.data?.data?.pageCount ?? 0,
            totalCount: response.data?.data?.totalCount ?? 0,
        };
    },

    async verifyAttendance(attendanceReference: string): Promise<boolean> {
        const response = await api.post('/GymAttendance/VerifyByGymOwner', { attendanceReference });
        return response.data?.data ?? false;
    },

    async getAttendanceByReference(attendanceReference: string): Promise<AttendanceDetail | null> {
        const response = await api.post('/GymAttendance/GetAttendanceByReferenceByGymOwner', { attendanceReference });
        return response.data?.data ?? null;
    },

    async markNoShow(attendanceReference: string): Promise<boolean> {
        const response = await api.post('/GymAttendance/MarkNoShowByGymOwner', { attendanceReference });
        return response.data?.data ?? false;
    },
};
