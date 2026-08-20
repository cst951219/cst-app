// ProgressBar 进度条组件
export function createProgressBar({ value = 0, max = 100, showText = true, color = 'sage' } = {}) {
    const container = document.createElement('div');
    container.style.cssText = 'width:100%;';

    const barBg = document.createElement('div');
    barBg.style.cssText = 'width:100%;height:8px;background:var(--bg-surface-alt);border-radius:4px;overflow:hidden;';

    const barFill = document.createElement('div');
    const colors = {
        sage: 'var(--accent-sage)',
        work: 'var(--color-work)',
        life: 'var(--color-life)',
        warning: 'var(--warning-orange)',
        danger: 'var(--overdue-red)',
    };
    const percent = Math.min(100, Math.max(0, (value / max) * 100));
    barFill.style.cssText = `height:100%;width:${percent}%;background:${colors[color] || colors.sage};border-radius:4px;transition:width 0.3s ease;`;

    barBg.appendChild(barFill);
    container.appendChild(barBg);

    let text = null;
    if (showText) {
        text = document.createElement('div');
        text.style.cssText = 'font-size:0.8rem;color:var(--text-muted);margin-top:4px;text-align:right;';
        text.textContent = `${value} / ${max}`;
        container.appendChild(text);
    }

    return {
        element: container,
        setValue: (v) => {
            const p = Math.min(100, Math.max(0, (v / max) * 100));
            barFill.style.width = `${p}%`;
            if (text) text.textContent = `${v} / ${max}`;
        },
    };
}
