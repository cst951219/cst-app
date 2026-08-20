// DatePicker 日期选择器（原生 input type=date 封装）
import { formatDate, parseDate } from '../utils/date.js';

export function createDatePicker({ value = null, onChange = null, placeholder = '选择日期' } = {}) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'position:relative;';

    const input = document.createElement('input');
    input.type = 'date';
    input.className = 'input';
    input.placeholder = placeholder;
    if (value) input.value = value;

    input.addEventListener('change', () => {
        if (onChange) onChange(input.value || null);
    });

    wrapper.appendChild(input);

    return {
        element: wrapper,
        input,
        getValue: () => input.value || null,
        setValue: (v) => { input.value = v || ''; },
        clear: () => { input.value = ''; },
    };
}

export function createDateDisplay({ dateStr, format = 'chinese' } = {}) {
    const span = document.createElement('span');
    if (!dateStr) {
        span.textContent = '未设置';
        span.style.color = 'var(--text-muted)';
    } else if (format === 'chinese') {
        const d = parseDate(dateStr);
        span.textContent = `${d.getMonth() + 1}月${d.getDate()}日`;
    } else {
        span.textContent = dateStr;
    }
    return span;
}
