import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    gymService,
    type AddGymPayload,
    type GetAllGymsPayload,
    type EditGymCommonDataPayload,
    type EditGymGeoLocationPayload,
    type EditGymImagesPayload,
    type ToggleGymActivityTrendPayload,
} from '../services/gymService';

export function useGymTrends() {
    return useQuery({
        queryKey: ['gymTrends'],
        queryFn: () => gymService.getAllTrends(),
        staleTime: 1000 * 60 * 10, // 10 minutes
    });
}

export function useAddGym() {
    return useMutation({
        mutationFn: (data: AddGymPayload) => gymService.addGym(data),
    });
}

export function useGyms(filter?: GetAllGymsPayload) {
    return useQuery({
        queryKey: ['gyms', filter],
        queryFn: () => gymService.getAllGyms(filter),
    });
}

export function useEditGymCommonData() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: EditGymCommonDataPayload) => gymService.editGymCommonData(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gyms'] });
        },
    });
}

export function useEditGymGeoLocation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: EditGymGeoLocationPayload) => gymService.editGymGeoLocation(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gyms'] });
        },
    });
}

export function useEditGymImages() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: EditGymImagesPayload) => gymService.editGymImages(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gyms'] });
        },
    });
}

export function useToggleGymActivityTrend() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: ToggleGymActivityTrendPayload) => gymService.toggleGymActivityTrend(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gyms'] });
        },
    });
}

export function useGymOwnerOverview() {
    return useQuery({
        queryKey: ['gymOwnerOverview'],
        queryFn: () => gymService.getGymOwnerOverview(),
    });
}

export function useGymTrendCapacity() {
    return useQuery({
        queryKey: ['gymTrendCapacity'],
        queryFn: () => gymService.getGymTrendCapacityOverview(),
    });
}

export function useCurrentWeekReservations() {
    return useQuery({
        queryKey: ['currentWeekReservations'],
        queryFn: () => gymService.getCurrentWeekReservations(),
    });
}

export function useSessionPriceBand() {
    return useQuery({
        queryKey: ['sessionPriceBand'],
        queryFn: () => gymService.getSessionPriceBand(),
        staleTime: 1000 * 60 * 10,
    });
}
