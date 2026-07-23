export const toPersianDigits = (value: string | number) =>
    String(value).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)]);

export const formatNumber = (amount?: number) =>
    toPersianDigits(Number(amount || 0).toLocaleString('en-US'));

export const formatToman = (amount?: number) => `${formatNumber(amount)} تومان`;

const formatTime = (value: number | string) => {
    const s = String(value).padStart(4, '0');
    return toPersianDigits(`${s.slice(0, 2)}:${s.slice(2, 4)}`);
};

export const formatSessionTime = (start?: number | string, end?: number | string, gymTimeType?: string) => {
    if (gymTimeType?.toLowerCase().includes('free')) return 'تایم آزاد';
    return start && end ? `${formatTime(start)} ـ ${formatTime(end)}` : 'تایم آزاد';
};

const jalaliFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
});

export const formatJalali = (iso?: string) => {
    if (!iso) return '-';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '-';
    return jalaliFormatter.format(d);
};

const jalaliLongFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
});

export const formatJalaliLong = (iso?: string) => {
    if (!iso) return '-';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '-';
    return jalaliLongFormatter.format(d);
};
