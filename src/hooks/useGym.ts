import { useMutation, useQuery } from '@tanstack/react-query';
import { gymService, type AddGymPayload } from '../services/gymService';

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

export function useGyms(filter?: any) {
    return useQuery({
        queryKey: ['gyms', filter],
        queryFn: () => gymService.getAllGyms(filter),
    });
}
