// 计划页 — Phase 3 完整实现，Phase 2 先搭建骨架
import { createTabs } from '../components/tabs.js';
import { createEmptyState } from '../components/emptyState.js';

export class PlansPage {
    constructor(app) {
        this.app = app;
        this.currentTab = 0;
    }

    render(container) {
        container.innerHTML = '';

        // 页面头部
        const header = document.createElement('div');
        header.className = 'page-header';
        header.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <div>
                    <div class="page-title">📋 计划</div>
                    <div class="page-subtitle">管理工作与生活中的待办事项</div>
                </div>
                <button class="btn btn-primary" id="new-plan-btn">+ 新建计划</button>
            </div>
        `;
        container.appendChild(header);

        // Tabs
        const tabs = createTabs({
            tabs: [
                { label: '📋 总览', content: this.renderTab('all') },
                { label: '💼 工作', content: this.renderTab('work') },
                { label: '🏠 生活', content: this.renderTab('life') },
            ],
            defaultIndex: 0,
            onChange: (index) => { this.currentTab = index; },
        });
        container.appendChild(tabs.element);

        // 绑定新建按钮
        const btn = document.getElementById('new-plan-btn');
        if (btn) {
            btn.addEventListener('click', () => this.openPlanDrawer());
        }
    }

    renderTab(category) {
        const div = document.createElement('div');
        const plans = this.app.storage.getPlans(
            category === 'all' ? {} : { category }
        );

        if (plans.length === 0) {
            div.appendChild(createEmptyState({
                emoji: category === 'work' ? '💼' : category === 'life' ? '🏠' : '📋',
                title: '暂无计划',
                subtitle: '点击右上角"新建计划"开始添加',
            }));
        } else {
            plans.forEach(plan => {
                div.appendChild(this.renderPlanCard(plan));
            });
        }
        return div;
    }

    renderPlanCard(plan) {
        const card = document.createElement('div');
        card.className = 'card hoverable';

        // 计算子任务是否全部完成（没有子任务视为全部完成）
        const hasChecklist = plan.checklist && plan.checklist.length > 0;
        const allChecklistDone = !hasChecklist || plan.checklist.every(i => i.completed);
        // 只有子任务全部完成时，总任务才能被标记为完成
        const canComplete = allChecklistDone;
        const isCompleted = canComplete && plan.completed;

        card.style.cssText = `cursor:pointer;${isCompleted ? 'opacity:0.6;' : ''}`;

        const categoryColor = plan.category === 'work' ? 'var(--color-work)' : 'var(--color-life)';
        const categoryLabel = plan.category === 'work' ? '工作' : '生活';

        card.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
                <div style="flex:1;">
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                        <span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:0.75rem;background:${plan.category === 'work' ? 'var(--color-work-light)' : 'var(--color-life-light)'};color:${categoryColor};">${categoryLabel}</span>
                        ${plan.dueDate ? `<span class="text-sm text-secondary">📅 ${plan.dueDate}</span>` : ''}
                    </div>
                    <div class="${isCompleted ? 'completed' : ''}" style="font-weight:500;">${plan.title}</div>
                    ${plan.note ? `<div class="text-sm text-muted mt-sm">${plan.note}</div>` : ''}
                    ${hasChecklist ? `
                        <div class="plan-checklist" style="margin-top:10px;display:flex;flex-direction:column;gap:4px;">
                            ${plan.checklist.map(item => `
                                <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:0.85rem;${item.completed ? 'text-decoration:line-through;color:var(--text-secondary);' : ''}" data-item-id="${item.id}">
                                    <input type="checkbox" class="checklist-item-check" ${item.completed ? 'checked' : ''} style="width:14px;height:14px;cursor:pointer;accent-color:var(--accent-sage);" data-item-id="${item.id}">
                                    <span>${item.text}</span>
                                </label>
                            `).join('')}
                            <div class="text-sm text-muted" style="margin-top:4px;">子任务进度：${plan.checklist.filter(i => i.completed).length}/${plan.checklist.length}${!allChecklistDone ? '（全部完成后才能完成总任务）' : ''}</div>
                        </div>
                    ` : ''}
                </div>
                ${canComplete ? `<input type="checkbox" ${isCompleted ? 'checked' : ''} style="width:18px;height:18px;cursor:pointer;accent-color:var(--accent-sage);">` : ''}
            </div>
        `;

        // 勾选完成（只有子任务全部完成时才显示勾选框）
        const checkbox = card.querySelector('input[type="checkbox"]:not(.checklist-item-check)');
        if (checkbox) {
            checkbox.addEventListener('click', (e) => {
                e.stopPropagation();
                if (checkbox.checked) {
                    this.app.storage.completePlan(plan.id);
                    // 完成计划触发奖励（每天每个计划只奖励一次）
                    const todayStr = new Date().toISOString().split('T')[0];
                    this.app.triggerReward(`plan_${plan.id}_${todayStr}`, 'water', 1, '完成计划');
                } else {
                    this.app.storage.uncompletePlan(plan.id);
                }
                this.app.showToast(checkbox.checked ? '已完成' : '已取消完成');
                // 重新渲染
                this.render(document.getElementById('page-container'));
            });
        }

        // 子任务勾选
        const checklistChecks = card.querySelectorAll('.checklist-item-check');
        checklistChecks.forEach(check => {
            check.addEventListener('click', (e) => {
                e.stopPropagation();
                const itemId = check.getAttribute('data-item-id');
                const todayStr = new Date().toISOString().split('T')[0];

                if (check.checked) {
                    this.app.storage.updateChecklistItem(plan.id, itemId, { completed: true, completedAt: new Date().toISOString() });
                    // 计算该计划今天已完成的子任务数（包含本次）
                    const updatedPlan = this.app.storage.getPlans().find(p => p.id === plan.id);
                    const completedToday = updatedPlan.checklist.filter(i => i.completed).length;
                    // 每完成3个子任务触发1次浇水奖励
                    if (completedToday > 0 && completedToday % 3 === 0) {
                        const rewardIndex = Math.floor(completedToday / 3);
                        const rewardId = `subtask_${plan.id}_${rewardIndex}_${todayStr}`;
                        this.app.triggerReward(rewardId, 'water', 1, '完成3个子任务');
                    }
                } else {
                    this.app.storage.updateChecklistItem(plan.id, itemId, { completed: false, completedAt: null });
                }
                // 重新渲染
                this.render(document.getElementById('page-container'));
            });
        });

        // 点击卡片打开编辑
        card.addEventListener('click', () => this.openPlanDrawer(plan));

        return card;
    }

    openPlanDrawer(plan = null) {
        const isEdit = !!plan;
        const title = isEdit ? '编辑计划' : '新建计划';

        const formHtml = `
            <div style="display:flex;flex-direction:column;gap:16px;">
                <div>
                    <label style="display:block;font-size:0.85rem;color:var(--text-secondary);margin-bottom:6px;">计划标题</label>
                    <input type="text" class="input" id="plan-title" placeholder="输入计划标题" value="${plan ? plan.title : ''}">
                </div>
                <div>
                    <label style="display:block;font-size:0.85rem;color:var(--text-secondary);margin-bottom:6px;">分类</label>
                    <select class="select" id="plan-category">
                        <option value="work" ${plan && plan.category === 'work' ? 'selected' : ''}>💼 工作</option>
                        <option value="life" ${plan && plan.category === 'life' ? 'selected' : ''}>🏠 生活</option>
                    </select>
                </div>
                <div>
                    <label style="display:block;font-size:0.85rem;color:var(--text-secondary);margin-bottom:6px;">截止日期（可选）</label>
                    <input type="date" class="input" id="plan-duedate" value="${plan ? plan.dueDate || '' : ''}">
                </div>
                <div>
                    <label style="display:block;font-size:0.85rem;color:var(--text-secondary);margin-bottom:6px;">提前提醒（天）</label>
                    <select class="select" id="plan-reminder">
                        <option value="0" ${plan && plan.reminderDays === 0 ? 'selected' : ''}>不提醒</option>
                        <option value="1" ${plan && plan.reminderDays === 1 ? 'selected' : ''}>提前1天</option>
                        <option value="3" ${plan && plan.reminderDays === 3 ? 'selected' : ''}>提前3天</option>
                        <option value="7" ${plan && plan.reminderDays === 7 ? 'selected' : ''}>提前7天</option>
                    </select>
                </div>
                <div>
                    <label style="display:block;font-size:0.85rem;color:var(--text-secondary);margin-bottom:6px;">备注（可选）</label>
                    <textarea class="textarea" id="plan-note" placeholder="添加备注">${plan ? plan.note || '' : ''}</textarea>
                </div>
                <div>
                    <label style="display:block;font-size:0.85rem;color:var(--text-secondary);margin-bottom:6px;">子任务（每行一个，可选）</label>
                    <textarea class="textarea" id="plan-checklist" placeholder="输入子任务，每行一个&#10;例如：&#10;准备材料&#10;发送邮件&#10;跟进反馈" style="min-height:80px;">${plan && plan.checklist ? plan.checklist.map(i => i.text).join('\n') : ''}</textarea>
                </div>
            </div>
        `;

        const footerHtml = `
            ${isEdit ? '<button class="btn btn-danger" id="delete-plan-btn">删除</button>' : ''}
            <button class="btn" id="cancel-plan-btn">取消</button>
            <button class="btn btn-primary" id="save-plan-btn">${isEdit ? '保存' : '创建'}</button>
        `;

        this.app.showDrawer({ title, content: formHtml, footer: footerHtml }).then(({ body, close }) => {
            // 取消
            body.querySelector('#cancel-plan-btn')?.addEventListener('click', close);

            // 保存
            body.querySelector('#save-plan-btn')?.addEventListener('click', () => {
                const titleVal = body.querySelector('#plan-title').value.trim();
                if (!titleVal) {
                    this.app.showToast('请输入计划标题', 'error');
                    return;
                }
                // 解析子任务
                const checklistText = body.querySelector('#plan-checklist').value.trim();
                const checklist = checklistText
                    ? checklistText.split('\n').map(line => line.trim()).filter(line => line.length > 0).map(text => ({
                        id: 'item_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
                        text,
                        completed: false,
                        completedAt: null,
                    }))
                    : [];

                const data = {
                    title: titleVal,
                    category: body.querySelector('#plan-category').value,
                    dueDate: body.querySelector('#plan-duedate').value || null,
                    reminderDays: parseInt(body.querySelector('#plan-reminder').value),
                    note: body.querySelector('#plan-note').value.trim(),
                    checklist,
                };
                if (isEdit) {
                    // 编辑时保留已完成子任务的状态
                    if (plan && plan.checklist) {
                        const existingItems = plan.checklist;
                        data.checklist = checklist.map(newItem => {
                            const existing = existingItems.find(e => e.text === newItem.text);
                            return existing ? { ...newItem, id: existing.id, completed: existing.completed, completedAt: existing.completedAt } : newItem;
                        });
                    }
                    this.app.storage.updatePlan(plan.id, data);
                    this.app.showToast('计划已更新');
                } else {
                    this.app.storage.createPlan(data);
                    this.app.showToast('计划已创建');
                }
                close();
                this.render(document.getElementById('page-container'));
            });

            // 删除
            body.querySelector('#delete-plan-btn')?.addEventListener('click', async () => {
                const confirmed = await this.app.showModal({
                    title: '删除计划',
                    content: '<p>确定要删除这个计划吗？此操作不可撤销。</p>',
                    confirmText: '删除',
                    danger: true,
                });
                if (confirmed) {
                    this.app.storage.deletePlan(plan.id);
                    this.app.showToast('计划已删除');
                    close();
                    this.render(document.getElementById('page-container'));
                }
            });
        });
    }
}
