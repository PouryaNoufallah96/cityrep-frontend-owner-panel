import type { AxiosError } from 'axios';

const GENERIC_ERROR = 'خطای سرور';

export function getApiErrorMessage(error: unknown, fallback: string = GENERIC_ERROR): string {
    const data = (error as AxiosError)?.response?.data as
        | { Message?: string; message?: string; Exception?: string }
        | string
        | undefined;

    const raw = typeof data === 'string' ? data : data?.Message ?? data?.message ?? data?.Exception;
    const message = unwrap(raw);

    return !message || looksLikeTrace(message) ? fallback : message;
}

function unwrap(value?: string): string | undefined {
    const trimmed = value?.trim();
    if (!trimmed) return undefined;
    if (trimmed.startsWith('{')) {
        try {
            const parsed = JSON.parse(trimmed);
            return (parsed.Exception ?? parsed.Message ?? parsed.message)?.trim();
        } catch {
            return undefined;
        }
    }
    return trimmed;
}

function looksLikeTrace(message: string): boolean {
    return message.includes('StackTrace') || message.includes('   at ') || message.length > 200;
}
