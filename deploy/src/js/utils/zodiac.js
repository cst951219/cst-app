// 星座计算工具

const ZODIAC_SIGNS = [
    { name: '摩羯座', en: 'capricorn', startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 },
    { name: '水瓶座', en: 'aquarius', startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
    { name: '双鱼座', en: 'pisces', startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 },
    { name: '白羊座', en: 'aries', startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
    { name: '金牛座', en: 'taurus', startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
    { name: '双子座', en: 'gemini', startMonth: 5, startDay: 21, endMonth: 6, endDay: 21 },
    { name: '巨蟹座', en: 'cancer', startMonth: 6, startDay: 22, endMonth: 7, endDay: 22 },
    { name: '狮子座', en: 'leo', startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
    { name: '处女座', en: 'virgo', startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
    { name: '天秤座', en: 'libra', startMonth: 9, startDay: 23, endMonth: 10, endDay: 23 },
    { name: '天蝎座', en: 'scorpio', startMonth: 10, startDay: 24, endMonth: 11, endDay: 22 },
    { name: '射手座', en: 'sagittarius', startMonth: 11, startDay: 23, endMonth: 12, endDay: 21 },
];

/** 根据出生日期（YYYY-MM-DD）计算星座 */
export function getZodiac(birthDateStr) {
    if (!birthDateStr) return null;
    const [, month, day] = birthDateStr.split('-').map(Number);
    if (!month || !day) return null;

    for (const sign of ZODIAC_SIGNS) {
        if (isDateInRange(month, day, sign.startMonth, sign.startDay, sign.endMonth, sign.endDay)) {
            return sign;
        }
    }
    return null;
}

function isDateInRange(month, day, startMonth, startDay, endMonth, endDay) {
    // 处理跨年的情况（如摩羯座 12.22-1.19）
    if (startMonth > endMonth) {
        return (month === startMonth && day >= startDay) || (month === endMonth && day <= endDay);
    }
    if (month === startMonth) return day >= startDay;
    if (month === endMonth) return day <= endDay;
    return month > startMonth && month < endMonth;
}

/** 获取所有星座列表 */
export function getAllZodiacs() {
    return ZODIAC_SIGNS.map(s => ({ name: s.name, en: s.en }));
}
