import { DateObject } from 'react-multi-date-picker';

type ReserveStatus = {
    label: string;
    style: string;
    states: string[];
};

const RESERVE_STATUSES: ReserveStatus[] = [
    { label: 'در انتظار', style: 'bg-amber-50 text-amber-700', states: ['Pending', 'Reserved'] },
    { label: 'عدم حضور', style: 'bg-red-50 text-red-600', states: ['NoShow'] },
    { label: 'لغو شده', style: 'bg-gray-100 text-gray-500', states: ['Cancelled', 'Failed', 'Expired'] },
    { label: 'انجام شده', style: 'bg-emerald-50 text-emerald-700', states: ['Used'] },
];

export const getStatusMeta = (state: string) => {
    const match = RESERVE_STATUSES.find(s => s.states.includes(state));
    return match
        ? { label: match.label, style: match.style }
        : { label: state || '-', style: 'bg-gray-50 text-gray-600' };
};

export const STATUS_FILTER_LABELS = RESERVE_STATUSES.map(s => s.label);

export const statesForStatusLabels = (labels: string[]): string[] | undefined => {
    const states = RESERVE_STATUSES.filter(s => labels.includes(s.label)).flatMap(s => s.states);
    return states.length > 0 ? states : undefined;
};

export const splitFullName = (fullName?: string) => {
    const name = fullName || '';
    const spaceIndex = name.indexOf(' ');
    if (spaceIndex === -1) return { firstName: name, lastName: '' };
    return { firstName: name.slice(0, spaceIndex), lastName: name.slice(spaceIndex + 1) };
};

export const toGregorianDate = (d?: DateObject) => {
    if (!d) return undefined;
    const js = d.toDate();
    const y = js.getFullYear();
    const m = String(js.getMonth() + 1).padStart(2, '0');
    const day = String(js.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};
