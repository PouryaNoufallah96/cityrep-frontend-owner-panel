import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';

export function useRequestOtp() {
    return useMutation({
        mutationFn: (phoneNumber: string) => authService.requestVerificationCode(phoneNumber),
    });
}

export function useVerifyOtp() {
    return useMutation({
        mutationFn: ({ phoneNumber, code }: { phoneNumber: string; code: string }) =>
            authService.verifyAndLogin(phoneNumber, code),
    });
}

export function useGymOwnerData() {
    return useMutation({
        mutationFn: () => authService.getGymOwnerData(),
    });
}
