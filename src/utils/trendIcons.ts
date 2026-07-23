import type { ElementType } from 'react';
import {
    LuActivity,
    LuDumbbell,
    LuFlame,
    LuHeartPulse,
    LuPersonStanding,
    LuSparkles,
    LuWind,
    LuZap,
} from 'react-icons/lu';
import { MdOutlineSelfImprovement } from 'react-icons/md';

export const TREND_ICON_BY_KEY: Record<string, ElementType> = {
    fitness: LuActivity,
    bodybuilding: LuDumbbell,
    pilates: MdOutlineSelfImprovement,
    reformer: LuPersonStanding,
    physical: LuHeartPulse,
    aerial: LuWind,
    yoga: MdOutlineSelfImprovement,
    acro: LuSparkles,
    stretch: LuWind,
    strength: LuDumbbell,
    crossfit: LuFlame,
};

export const TREND_ICON_BY_TITLE: Record<string, ElementType> = {
    فیتنس: LuActivity,
    بدنسازی: LuDumbbell,
    پیلاتس: MdOutlineSelfImprovement,
    'پیلاتس ریفرمر': LuPersonStanding,
    'آمادگی جسمانی': LuHeartPulse,
    'ایریال یوگا': LuWind,
    یوگا: MdOutlineSelfImprovement,
    'آکرو یوگا': LuSparkles,
    کششی: LuWind,
    'تمرینات قدرتی': LuDumbbell,
    'کراس فیت': LuFlame,
};

export function resolveTrendIcon(title?: string, iconKey?: string): ElementType {
    if (iconKey && TREND_ICON_BY_KEY[iconKey]) return TREND_ICON_BY_KEY[iconKey];
    if (title && TREND_ICON_BY_TITLE[title]) return TREND_ICON_BY_TITLE[title];
    return LuZap;
}
