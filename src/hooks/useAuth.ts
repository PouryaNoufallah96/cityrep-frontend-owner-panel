import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';

export function useRequestOtp() {
    return useMutation({
        mutationFn: (phoneNumber: string) => authService.requestVerificationCode(phoneNumber),
    });
}

export function useVerifyOtp() {
    const { login } = useAuth()
    return useMutation({
        mutationFn: ({ phoneNumber, code }: { phoneNumber: string; code: string }) =>
            authService.verifyAndLogin(phoneNumber, code),
        onSuccess: (data) => {
            login(data.access_token);
        }
    });
}

export function useGymOwnerData() {
    return useMutation({
        mutationFn: () => authService.getGymOwnerData(),
    });
}
