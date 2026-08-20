// 日期处理工具
// 所有日期使用 YYYY-MM-DD 字符串格式

/** 获取今天的日期字符串 YYYY-MM-DD */
export function today() {
    const d = new Date();
    return formatDate(d);
}

/** 格式化 Date 为 YYYY-MM-DD */
export function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/** 解析 YYYY-MM-DD 为 Date（本地时区） */
export function parseDate(dateStr) {
    if (!dateStr) return null;
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
}

/** 计算两个日期之间的天数差（date2 - date1） */
export function daysBetween(date1Str, date2Str) {
    const d1 = parseDate(date1Str);
    const d2 = parseDate(date2Str);
    if (!d1 || !d2) return null;
    const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
    return diff;
}

/** 计算距离今天还有多少天（正数=未来，负数=已过去） */
export function daysFromToday(dateStr) {
    return daysBetween(today(), dateStr);
}

/** 判断是否逾期（未完成且截止日期已过） */
export function isOverdue(dueDateStr, completed) {
    if (completed || !dueDateStr) return false;
    return daysFromToday(dueDateStr) < 0;
}

/** 计算逾期天数 */
export function overdueDays(dueDateStr) {
    const days = daysFromToday(dueDateStr);
    return days < 0 ? Math.abs(days) : 0;
}

/** 判断是否进入提醒期 */
export function isInReminderPeriod(dueDateStr, reminderDays) {
    if (!dueDateStr || !reminderDays || reminderDays === 0) return false;
    const days = daysFromToday(dueDateStr);
    return days >= 0 && days <= reminderDays;
}

/** 计算下一次生日日期（基于月/日，自动跨年） */
export function nextBirthday(birthMonth, birthDay, fromDate = null) {
    const from = fromDate ? parseDate(fromDate) : new Date();
    const year = from.getFullYear();
    let next = new Date(year, birthMonth - 1, birthDay);
    // 处理闰年 2 月 29 日：非闰年视为 2 月 28 日
    if (birthMonth === 2 && birthDay === 29 && !isLeapYear(year)) {
        next = new Date(year, 1, 28);
    }
    if (next < from) {
        const nextYear = year + 1;
        next = new Date(nextYear, birthMonth - 1, birthDay);
        if (birthMonth === 2 && birthDay === 29 && !isLeapYear(nextYear)) {
            next = new Date(nextYear, 1, 28);
        }
    }
    return formatDate(next);
}

/** 计算距离下一次生日还有多少天 */
export function daysUntilBirthday(birthMonth, birthDay) {
    const next = nextBirthday(birthMonth, birthDay);
    return daysFromToday(next);
}

/** 计算下一次大事件日期（支持 once/yearly） */
export function nextEventDate(eventDate, recurrence) {
    if (recurrence === 'yearly') {
        const [, m, d] = eventDate.split('-').map(Number);
        return nextBirthday(m, d); // 复用跨年逻辑
    }
    return eventDate; // once 类型返回原日期
}

/** 计算距离大事件还有多少天（过去的一次性事件返回负数） */
export function daysUntilEvent(eventDate, recurrence) {
    const next = nextEventDate(eventDate, recurrence);
    return daysFromToday(next);
}

/** 判断是否为闰年 */
export function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/** 获取中文星期 */
export function getWeekdayChinese(dateStr = null) {
    const d = dateStr ? parseDate(dateStr) : new Date();
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    return weekdays[d.getDay()];
}

/** 获取时间段问候语 */
export function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 6) return '夜深了';
    if (hour < 9) return '早上好';
    if (hour < 12) return '上午好';
    if (hour < 14) return '中午好';
    if (hour < 18) return '下午好';
    if (hour < 22) return '晚上好';
    return '夜深了';
}

/** 格式化日期为中文显示（如 8月14日） */
export function formatDateChinese(dateStr) {
    const d = parseDate(dateStr);
    if (!d) return '';
    return `${d.getMonth() + 1}月${d.getDate()}日`;
}

/** 格式化剩余天数为友好文本 */
export function formatDaysRemaining(days) {
    if (days === 0) return '今天';
    if (days === 1) return '明天';
    if (days > 0) return `还有 ${days} 天`;
    return `已过去 ${Math.abs(days)} 天`;
}
