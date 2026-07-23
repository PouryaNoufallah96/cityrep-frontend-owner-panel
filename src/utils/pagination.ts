export const getPageNumbers = (current: number, total: number): (number | string)[] => {
    if (total <= 1) return total === 1 ? [1] : [];
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    if (current <= 3) return [1, 2, 3, '...', total];
    if (current >= total - 2) return [1, '...', total - 2, total - 1, total];
    return [1, '...', current - 1, current, current + 1, '...', total];
};
