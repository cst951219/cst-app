// 快速备忘本地规则解析器
// 不依赖付费 AI API，使用关键词和规则匹配

import { today, formatDate } from './date.js';

// 工作倾向关键词
const WORK_KEYWORDS = [
    '报告', '提交', '项目', '客户', '预算', '文件', '工作', '会议',
    '汇报', '审批', '合同', '方案', '需求', '开发', '测试', '上线',
    '邮件', '回复', '跟进', '复盘', '总结', '计划', '目标', 'KPI',
    '绩效', '培训', '出差', '面试', '招聘',
];

// 生活倾向关键词
const LIFE_KEYWORDS = [
    '买', '保险', '缴费', '家里', '预约', '快递', '超市', '买菜',
    '做饭', '打扫', '洗衣', '修理', '搬家', '装修', '看病', '体检',
    '牙医', '理发', '健身', '运动', '跑步', '瑜伽', '聚会', '聚餐',
    '生日', '礼物', '旅行', '机票', '酒店', '签证', '银行', '证件',
    '宠物', '浇花', '取件', '退货',
];

// 待办倾向关键词（动词）
const TODO_VERBS = [
    '记得', '完成', '提交', '买', '处理', '预约', '去', '做', '准备',
    '发送', '写', '看', '读', '学', '练习', '联系', '打电话', '回复',
    '安排', '确认', '检查', '更新', '修改', '整理', '打扫', '缴费',
    '报名', '注册', '下载', '安装', '设置',
];

// 日期识别模式
const DATE_PATTERNS = [
    // 相对日期（注意顺序：长词优先，避免"大后天"被"后天"匹配）
    { regex: /大后天/, getDate: () => addDays(today(), 3) },
    { regex: /后天/, getDate: () => addDays(today(), 2) },
    { regex: /明天/, getDate: () => addDays(today(), 1) },
    { regex: /今天/, getDate: () => today() },
    // 本周星期
    { regex: /(本周|这周)?(周一|星期一|周二|星期二|周三|星期三|周四|星期四|周五|星期五|周六|星期六|周日|星期日|周天)/, getDate: (m) => getThisWeekday(m[2]) },
    // 下周星期
    { regex: /(下周|下个星期)(周一|星期一|周二|星期二|周三|星期三|周四|星期四|周五|星期五|周六|星期六|周日|星期日|周天)/, getDate: (m) => getNextWeekday(m[2]) },
    // 月底
    { regex: /月底/, getDate: () => getEndOfMonth() },
    // 具体日期 X月X日
    { regex: /(\d{1,2})月(\d{1,2})[日号]/, getDate: (m) => getSpecificDate(Number(m[1]), Number(m[2])) },
    // X号（默认本月）
    { regex: /(\d{1,2})[日号]/, getDate: (m) => getSpecificDate(new Date().getMonth() + 1, Number(m[1])) },
];

// 中文数字转阿拉伯数字
function chineseToNumber(str) {
    const map = { '一': 1, '二': 2, '两': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10 };
    if (map[str] !== undefined) return map[str];
    // 处理"十一"到"十九"
    if (str.length === 2 && str[0] === '十') return 10 + (map[str[1]] || 0);
    return Number(str) || 0;
}

// 提前提醒识别模式
const REMINDER_PATTERNS = [
    { regex: /提前\s*(\d{1,2})\s*[天日](?:提醒)?/, getDays: (m) => Math.min(7, Number(m[1])) },
    { regex: /提前\s*([一二两三四五六七八九十]{1,2})\s*[天日](?:提醒)?/, getDays: (m) => Math.min(7, chineseToNumber(m[1])) },
    { regex: /提前\s*一?周(?:提醒)?/, getDays: () => 7 },
    { regex: /提前\s*半?个月(?:提醒)?/, getDays: () => 7 },
    { regex: /提前\s*3天(?:提醒)?/, getDays: () => 3 },
    { regex: /提前\s*1天(?:提醒)?/, getDays: () => 1 },
];

function addDays(dateStr, days) {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return formatDate(d);
}

function getThisWeekday(weekdayName) {
    const map = { '周一': 1, '星期一': 1, '周二': 2, '星期二': 2, '周三': 3, '星期三': 3, '周四': 4, '星期四': 4, '周五': 5, '星期五': 5, '周六': 6, '星期六': 6, '周日': 0, '星期日': 0, '周天': 0 };
    const target = map[weekdayName];
    const now = new Date();
    const current = now.getDay();
    let diff = target - current;
    if (diff < 0) diff += 7;
    return addDays(today(), diff);
}

function getNextWeekday(weekdayName) {
    const thisWeek = getThisWeekday(weekdayName);
    return addDays(thisWeek, 7);
}

function getEndOfMonth() {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return formatDate(lastDay);
}

function getSpecificDate(month, day) {
    const now = new Date();
    let year = now.getFullYear();
    let date = new Date(year, month - 1, day);
    // 如果日期已过，使用明年
    if (date < new Date(today())) {
        date = new Date(year + 1, month - 1, day);
    }
    return formatDate(date);
}

/**
 * 解析快速备忘输入
 * @param {string} input 用户输入文本
 * @returns {Object} 解析结果
 *   { type: 'PLAN_CONFIDENT'|'NOTE_CONFIDENT'|'UNCERTAIN',
 *     title: string, category: 'work'|'life'|null,
 *     dueDate: string|null, reminderDays: number,
 *     confidence: number }
 */
export function parseQuickNote(input) {
    const text = input.trim();
    if (!text) {
        return { type: 'UNCERTAIN', title: '', category: null, dueDate: null, confidence: 0 };
    }

    let result = {
        type: 'UNCERTAIN',
        title: text,
        category: null,
        dueDate: null,
        reminderDays: 0,
        confidence: 0,
    };

    // 1. 识别日期
    for (const pattern of DATE_PATTERNS) {
        const match = text.match(pattern.regex);
        if (match) {
            result.dueDate = pattern.getDate(match);
            // 从标题中移除日期部分
            result.title = result.title.replace(match[0], '').trim();
            break;
        }
    }

    // 2. 识别提前提醒
    for (const pattern of REMINDER_PATTERNS) {
        const match = text.match(pattern.regex);
        if (match) {
            result.reminderDays = pattern.getDays(match);
            // 从标题中移除提醒部分
            result.title = result.title.replace(match[0], '').trim();
            break;
        }
    }

    // 2. 识别分类倾向
    const workScore = WORK_KEYWORDS.filter(kw => text.includes(kw)).length;
    const lifeScore = LIFE_KEYWORDS.filter(kw => text.includes(kw)).length;

    if (workScore > lifeScore && workScore > 0) {
        result.category = 'work';
    } else if (lifeScore > workScore && lifeScore > 0) {
        result.category = 'life';
    }

    // 3. 识别待办倾向
    const hasTodoVerb = TODO_VERBS.some(verb => text.includes(verb));
    const hasDate = !!result.dueDate;
    const hasCategory = !!result.category;

    // 计算置信度
    let confidence = 0;
    if (hasTodoVerb) confidence += 2;
    if (hasDate) confidence += 2;
    if (hasCategory) confidence += 1;

    // 普通记录特征：较长的描述性文字、以句号/感叹号结尾、无明确待办动词
    const isDescriptive = text.length > 15 && !hasTodoVerb;
    const endsWithPeriod = /[。.!！?？]$/.test(text);
    const isLongNarrative = text.length > 20 && (endsWithPeriod || isDescriptive);

    if (isLongNarrative && endsWithPeriod) {
        // 以句子结尾的长描述性文字，优先判定为便签（即使包含日期词）
        result.type = 'NOTE_CONFIDENT';
    } else if (hasDate && confidence >= 2) {
        // 有明确日期且有一定置信度，优先判定为计划
        result.type = 'PLAN_CONFIDENT';
    } else if (isLongNarrative) {
        // 其他长描述性文字判定为便签
        result.type = 'NOTE_CONFIDENT';
    } else if (confidence >= 3) {
        result.type = 'PLAN_CONFIDENT';
    } else if (isDescriptive || endsWithPeriod) {
        result.type = 'NOTE_CONFIDENT';
    } else if (confidence >= 2) {
        result.type = 'PLAN_CONFIDENT'; // 有日期或动词，倾向待办
    } else {
        result.type = 'UNCERTAIN';
    }

    result.confidence = confidence;

    // 如果标题被日期替换后为空，恢复原文
    if (!result.title) {
        result.title = text;
    }

    return result;
}
