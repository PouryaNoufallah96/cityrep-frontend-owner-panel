import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    gymService,
    type AddGymPayload,
    type GetAllGymsPayload,
    type EditGymCommonDataPayload,
    type EditGymGeoLocationPayload,
    type EditGymImagesPayload,
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
