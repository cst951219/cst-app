// 空状态组件
export function createEmptyState({ emoji = '📭', title = '暂无数据', subtitle = '' } = {}) {
    const div = document.createElement('div');
    div.className = 'empty-state';
    div.innerHTML = `
        <div class="emoji" style="font-size:2.5rem;margin-bottom:12px;">${emoji}</div>
        <div class="text" style="font-size:0.95rem;color:var(--text-muted);">${title}</div>
        ${subtitle ? `<div class="subtitle" style="font-size:0.8rem;color:var(--text-muted);margin-top:4px;">${subtitle}</div>` : ''}
    `;
    return div;
}
