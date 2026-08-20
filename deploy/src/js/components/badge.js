// Badge 徽章组件
export function createBadge({ text = '', type = 'default', size = 'small' } = {}) {
    const badge = document.createElement('span');
    const colors = {
        default: 'background:var(--bg-surface-alt);color:var(--text-secondary);',
        work: 'background:var(--color-work-light);color:var(--color-work);',
        life: 'background:var(--color-life-light);color:#A08060;',
        success: 'background:var(--accent-sage-light);color:var(--accent-sage-dark);',
        warning: 'background:var(--warning-orange-light);color:#B08050;',
        danger: 'background:var(--overdue-red-light);color:var(--overdue-red);',
        birthday: 'background:var(--color-birthday-light);color:#A06060;',
        fortune: 'background:var(--color-fortune-light);color:#705080;',
    };
    const sizes = {
        small: 'padding:2px 8px;font-size:0.75rem;',
        medium: 'padding:4px 12px;font-size:0.85rem;',
    };
    badge.style.cssText = `display:inline-block;border-radius:10px;font-weight:500;${colors[type] || colors.default}${sizes[size] || sizes.small}`;
    badge.textContent = text;
    return badge;
}
