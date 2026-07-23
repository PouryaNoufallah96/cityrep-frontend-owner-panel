import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reservationService, type GetReservationsPayload } from '../services/reservationService';

export function useReservations(filter?: GetReservationsPayload) {
    return useQuery({
        queryKey: ['reservations', filter],
        queryFn: () => reservationService.getReservations(filter),
    });
}

function useInvalidateAttendanceViews() {
    const queryClient = useQueryClient();
    return () => {
        queryClient.invalidateQueries({ queryKey: ['reservations'] });
        queryClient.invalidateQueries({ queryKey: ['currentWeekReservations'] });
        queryClient.invalidateQueries({ queryKey: ['gymOwnerOverview'] });
    };
}

export function useVerifyAttendance() {
    const invalidate = useInvalidateAttendanceViews();
    return useMutation({
        mutationFn: (attendanceReference: string) => reservationService.verifyAttendance(attendanceReference),
        onSuccess: invalidate,
    });
}

export function useMarkNoShow() {
    const invalidate = useInvalidateAttendanceViews();
    return useMutation({
        mutationFn: (attendanceReference: string) => reservationService.markNoShow(attendanceReference),
        onSuccess: invalidate,
    });
}

export function useAttendanceByReference(reference: string) {
    return useQuery({
        queryKey: ['attendanceByReference', reference],
        queryFn: () => reservationService.getAttendanceByReference(reference),
        enabled: !!reference,
    });
}
