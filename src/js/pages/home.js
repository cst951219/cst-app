// 首页 — 快速掌握近期最需要关注的信息
import { getGreeting, today, formatDateChinese, getWeekdayChinese, daysFromToday, isOverdue, isInReminderPeriod, formatDaysRemaining } from '../utils/date.js';
import { parseQuickNote } from '../utils/parser.js';
import { nextBirthday, daysUntilBirthday, nextEventDate, daysUntilEvent } from '../utils/date.js';
import { getZodiac } from '../utils/zodiac.js';

export class HomePage {
    constructor(app) {
        this.app = app;
    }

    render(container) {
        container.innerHTML = '';

        // 1. 日期问候
        this.renderGreeting(container);

        // 2. DDL 提醒横幅
        this.renderDDLBanner(container);

        // 主内容区：左右两栏
        const mainGrid = document.createElement('div');
        mainGrid.style.cssText = 'display:grid;grid-template-columns:1fr 320px;gap:20px;margin-top:20px;';

        const leftCol = document.createElement('div');
        const rightCol = document.createElement('div');

        // 3. 最近3个未完成计划
        this.renderRecentPlans(leftCol);

        // 4. 快速备忘
        this.renderQuickNote(leftCol);

        // 5. 最近便签
        this.renderRecentNotes(leftCol);

        // 6. 今日运势
        this.renderFortune(rightCol);

        // 7. 最近生日
        this.renderNearestBirthday(rightCol);

        // 8. 最近大事件
        this.renderNearestEvent(rightCol);

        // 9. 今日运动
        this.renderExerciseCard(rightCol);

        // 10. 植物摘要
        this.renderPlantSummary(rightCol);

        mainGrid.appendChild(leftCol);
        mainGrid.appendChild(rightCol);
        container.appendChild(mainGrid);
    }

    renderGreeting(container) {
        const greeting = getGreeting();
        const dateStr = formatDateChinese(today());
        const weekday = getWeekdayChinese();

        const header = document.createElement('div');
        header.className = 'page-header';
        header.innerHTML = `
            <div class="page-title">${greeting} 👋</div>
            <div class="page-subtitle">今天是 ${dateStr} ${weekday}</div>
        `;
        container.appendChild(header);
    }

    renderDDLBanner(container) {
        const plans = this.app.storage.getPlans({ completed: false });
        const overduePlans = plans.filter(p => isOverdue(p.dueDate, false));
        const reminderPlans = plans.filter(p => !isOverdue(p.dueDate, false) && isInReminderPeriod(p.dueDate, p.reminderDays));

        // 获取当天已关闭的提醒
        const today = new Date().toISOString().split('T')[0];
        const dismissedKey = `cst_reminder_dismissed_${today}`;
        let dismissedIds = [];
        try {
            dismissedIds = JSON.parse(localStorage.getItem(dismissedKey) || '[]');
        } catch (e) {
            dismissedIds = [];
        }

        // 过滤掉当天已关闭的提醒
        const activeReminders = reminderPlans.filter(p => !dismissedIds.includes(p.id));

        // 逾期横幅（始终显示）
        if (overduePlans.length > 0) {
            const mostUrgent = overduePlans.sort((a, b) => daysFromToday(a.dueDate) - daysFromToday(b.dueDate))[0];
            const extraCount = overduePlans.length - 1;
            const banner = document.createElement('div');
            banner.className = 'card';
            banner.style.cssText = 'background:var(--overdue-red-light);border-left:4px solid var(--overdue-red);margin-bottom:12px;';
            banner.innerHTML = `
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <span class="overdue" style="font-weight:700;">⚠️ 已逾期：${mostUrgent.title}</span>
                        ${extraCount > 0 ? `<span class="text-sm text-secondary" style="margin-left:8px;">另外还有 ${extraCount} 项逾期</span>` : ''}
                    </div>
                    <button class="btn btn-sm btn-primary" onclick="window.__app.navigate('plans')">查看</button>
                </div>
            `;
            container.appendChild(banner);
        }

        // 提醒横幅（浅橙色，有关闭按钮，当天不再提示）
        if (activeReminders.length > 0) {
            const sortedReminders = activeReminders.sort((a, b) => daysFromToday(a.dueDate) - daysFromToday(b.dueDate));
            const mostUrgent = sortedReminders[0];
            const days = daysFromToday(mostUrgent.dueDate);
            const extraCount = sortedReminders.length - 1;

            const banner = document.createElement('div');
            banner.className = 'card';
            // 柔和的浅黄色背景，和逾期的红色区分（逾期更鲜艳，即将到期更柔和）
            banner.style.cssText = 'background:#FFFDE7;border-left:4px solid #FBC02D;margin-bottom:12px;';
            banner.innerHTML = `
                <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
                    <div style="flex:1;min-width:0;">
                        <span style="font-weight:600;color:#827717;">📅 即将到期：${mostUrgent.title}（${formatDaysRemaining(days)}）</span>
                        ${extraCount > 0 ? `<span class="text-sm" style="margin-left:8px;color:#9E9D24;">还有 ${extraCount} 个任务也临近</span>` : ''}
                    </div>
                    <div style="display:flex;gap:6px;flex-shrink:0;">
                        ${extraCount > 0 ? `<button class="btn btn-sm" id="reminder-detail-btn" style="padding:4px 8px;">详情</button>` : ''}
                        <button class="btn btn-sm" id="reminder-close-btn" style="padding:4px 8px;font-size:1rem;line-height:1;">×</button>
                    </div>
                </div>
                ${extraCount > 0 ? `<div id="reminder-detail-list" style="display:none;margin-top:8px;padding-top:8px;border-top:1px solid #F0F4C3;">
                    ${sortedReminders.map(p => {
                        const d = daysFromToday(p.dueDate);
                        return `<div style="padding:4px 0;font-size:0.85rem;color:#827717;">• ${p.title}（${formatDaysRemaining(d)}）</div>`;
                    }).join('')}
                </div>` : ''}
            `;
            container.appendChild(banner);

            // 关闭按钮：当天不再提示
            banner.querySelector('#reminder-close-btn')?.addEventListener('click', () => {
                // 记录所有当前提醒的ID，当天都不再提示
                const allIds = sortedReminders.map(p => p.id);
                try {
                    localStorage.setItem(dismissedKey, JSON.stringify(allIds));
                } catch (e) {}
                banner.style.opacity = '0';
                setTimeout(() => banner.remove(), 200);
                this.app.showToast('已关闭，今天不再提醒');
            });

            // 详情按钮：展开/收起全部提醒
            banner.querySelector('#reminder-detail-btn')?.addEventListener('click', () => {
                const detailList = banner.querySelector('#reminder-detail-list');
                if (detailList) {
                    const isHidden = detailList.style.display === 'none';
                    detailList.style.display = isHidden ? 'block' : 'none';
                }
            });
        }
    }

    renderRecentPlans(container) {
        const plans = this.app.storage.getPlans({ completed: false })
            .filter(p => p.dueDate)
            .sort((a, b) => {
                const aOverdue = isOverdue(a.dueDate, false);
                const bOverdue = isOverdue(b.dueDate, false);
                if (aOverdue && !bOverdue) return -1;
                if (!aOverdue && bOverdue) return 1;
                return daysFromToday(a.dueDate) - daysFromToday(b.dueDate);
            })
            .slice(0, 3);

        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <span style="font-weight:600;">📋 近期计划</span>
            <a href="#" style="font-size:0.85rem;color:var(--accent-sage-dark);text-decoration:none;" onclick="event.preventDefault();window.__app.navigate('plans');">查看全部 →</a>
        </div>`;

        if (plans.length === 0) {
            card.innerHTML += '<div class="text-sm text-muted" style="padding:12px 0;">暂无待办计划</div>';
        } else {
            plans.forEach(plan => {
                const days = daysFromToday(plan.dueDate);
                const overdue = isOverdue(plan.dueDate, false);
                const item = document.createElement('div');
                item.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--bg-surface-alt);';
                item.innerHTML = `
                    <span style="${overdue ? 'color:var(--overdue-red);font-weight:600;' : ''}">${plan.title}</span>
                    <span class="text-sm ${overdue ? 'overdue' : 'text-secondary'}">${overdue ? `逾期${Math.abs(days)}天` : formatDaysRemaining(days)}</span>
                `;
                card.appendChild(item);
            });
        }
        container.appendChild(card);
    }

    renderQuickNote(container) {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div style="font-weight:600;margin-bottom:12px;">✏️ 快速备忘</div>
            <div style="display:flex;gap:8px;">
                <input type="text" class="input" id="quick-note-input" placeholder="一句话记录，自动识别待办或便签..." style="flex:1;">
                <button class="btn btn-primary" id="quick-note-btn">添加</button>
            </div>
            <div class="text-xs text-muted mt-sm" style="font-size:0.75rem;">支持"明天提交报告""预约牙医"等自然语言输入</div>
        `;
        container.appendChild(card);

        // 绑定事件
        setTimeout(() => {
            const input = document.getElementById('quick-note-input');
            const btn = document.getElementById('quick-note-btn');
            if (!input || !btn) return;

            const handleAdd = async () => {
                const text = input.value.trim();
                if (!text) return;
                const parsed = parseQuickNote(text);
                if (parsed.type === 'PLAN_CONFIDENT') {
                    let category = parsed.category;
                    // 分类不确定时，让用户选择
                    if (!category) {
                        category = await this.askCategory(parsed.title);
                        if (!category) return; // 用户取消
                    }
                    // 询问子任务
                    const subtasks = await this.askSubtasks(parsed.title);
                    // 构建 checklist
                    const checklist = subtasks.map(text => ({
                        id: 'item_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
                        text,
                        completed: false,
                        completedAt: null,
                    }));
                    this.app.storage.createPlan({
                        title: parsed.title,
                        category: category,
                        dueDate: parsed.dueDate,
                        reminderDays: parsed.reminderDays || 0,
                        checklist,
                    });
                    this.app.showToast(`已添加为计划：${parsed.title}`);
                } else {
                    this.app.storage.createNote(text);
                    this.app.showToast('已添加为便签');
                }
                input.value = '';
                this.render(document.getElementById('page-container'));
            };

            btn.addEventListener('click', handleAdd);
            input.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleAdd(); });
        }, 0);
    }

    renderRecentNotes(container) {
        const notes = this.app.storage.getNotes().slice(0, 3);
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <span style="font-weight:600;">📝 最近便签</span>
        </div>`;

        if (notes.length === 0) {
            card.innerHTML += '<div class="text-sm text-muted" style="padding:12px 0;">暂无便签</div>';
        } else {
            notes.forEach(note => {
                const item = document.createElement('div');
                item.style.cssText = 'padding:10px 0;border-bottom:1px solid var(--bg-surface-alt);font-size:0.9rem;';
                item.textContent = note.content.length > 50 ? note.content.slice(0, 50) + '...' : note.content;
                card.appendChild(item);
            });
        }
        container.appendChild(card);
    }

    renderFortune(container) {
        const profile = this.app.storage.getProfile();
        const settings = this.app.storage.getSettings();
        const card = document.createElement('div');
        card.className = 'card';

        if (!settings.fortuneEnabled || !profile.birthDate) {
            card.innerHTML = `
                <div style="font-weight:600;margin-bottom:8px;">🔮 今日运势</div>
                <div class="text-sm text-muted">设置出生日期后查看</div>
            `;
        } else {
            const zodiac = getZodiac(profile.birthDate);
            const cache = this.app.storage.getFortuneCache();
            const todayStr = today();

            // 清除旧的不完整缓存（没有work或life字段的）
            if (cache && (!cache.work || !cache.life)) {
                this.app.storage.setFortuneCache(null);
            }

            if (cache && cache.date === todayStr && cache.work && cache.life) {
                card.innerHTML = `
                    <div style="font-weight:600;margin-bottom:8px;">🔮 ${zodiac?.name || ''}今日运势</div>
                    <div style="display:flex;gap:12px;margin-bottom:8px;">
                        <span style="font-size:0.85rem;">综合: ${cache.overall}</span>
                        <span style="font-size:0.85rem;">工作: ${cache.work}</span>
                        <span style="font-size:0.85rem;">生活: ${cache.life}</span>
                    </div>
                    <div class="text-sm text-secondary">${cache.summary || cache.advice || ''}</div>
                    <div class="text-xs text-muted mt-sm" style="font-size:0.75rem;">幸运色: ${cache.luckyColor || ''} · 仅供娱乐参考</div>
                `;
            } else {
                card.id = 'fortune-card';
                card.innerHTML = `
                    <div style="font-weight:600;margin-bottom:8px;">🔮 今日运势</div>
                    <div class="text-sm text-muted">加载中...</div>
                `;
                // 异步获取运势
                this.fetchFortune(zodiac?.en, todayStr);
            }
        }
        container.appendChild(card);
    }

    async fetchFortune(zodiacEn, dateStr) {
        if (!zodiacEn) return;
        try {
            let data;
            // 纯前端模式：使用本地模拟数据
            if (!this.app.backendAvailable) {
                data = this.generateLocalFortune(zodiacEn, dateStr);
            } else {
                const res = await fetch(`/api/fortune?zodiac=${zodiacEn}&date=${dateStr}`);
                data = await res.json();
            }
            this.app.storage.setFortuneCache(data);

            // 只更新运势卡片，不重新渲染整个页面（避免重复渲染）
            const fortuneCard = document.getElementById('fortune-card');
            if (fortuneCard) {
                const zodiac = getZodiac(this.app.storage.getProfile().birthDate);
                fortuneCard.innerHTML = `
                    <div style="font-weight:600;margin-bottom:8px;">🔮 ${zodiac?.name || ''}今日运势</div>
                    <div style="display:flex;gap:12px;margin-bottom:8px;">
                        <span style="font-size:0.85rem;">综合: ${data.overall}</span>
                        <span style="font-size:0.85rem;">工作: ${data.work}</span>
                        <span style="font-size:0.85rem;">生活: ${data.life}</span>
                    </div>
                    <div class="text-sm text-secondary">${data.summary || data.advice || ''}</div>
                    <div class="text-xs text-muted mt-sm" style="font-size:0.75rem;">幸运色: ${data.luckyColor || ''} · 仅供娱乐参考</div>
                `;
                fortuneCard.id = ''; // 移除ID，避免重复更新
            }
        } catch (e) {
            console.error('运势获取失败', e);
        }
    }

    // 本地模拟运势数据（纯前端模式）
    generateLocalFortune(zodiacEn, dateStr) {
        const fortunes = ['大吉', '中吉', '小吉', '平', '小凶'];
        const workFortunes = ['顺利', '高效', '平稳', '需专注', '防失误'];
        const lifeFortunes = ['惬意', '温馨', '平静', '多休息', '宜社交'];
        const colors = ['红色', '橙色', '黄色', '绿色', '蓝色', '紫色', '粉色', '白色'];
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        const advice = [
            '今日适合专注工作，避免冲动决策。',
            '运势平稳，适合处理日常事务。',
            '今日贵人运佳，可主动寻求合作。',
            '注意休息，劳逸结合效率更高。',
            '财运不错，但需谨慎理财。',
            '感情运佳，适合与亲友联络。',
            '学习运旺盛，适合充电提升。',
            '今日宜静不宜动，保持平和心态。',
        ];
        // 基于日期和星座生成伪随机数，保证同一天同一星座结果一致
        const seed = (dateStr + zodiacEn).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const random = (index) => {
            const x = Math.sin(seed + index) * 10000;
            return x - Math.floor(x);
        };
        return {
            zodiac: zodiacEn,
            date: dateStr,
            overall: fortunes[Math.floor(random(1) * fortunes.length)],
            work: workFortunes[Math.floor(random(2) * workFortunes.length)],
            life: lifeFortunes[Math.floor(random(3) * lifeFortunes.length)],
            score: Math.floor(random(4) * 40) + 60,
            luckyColor: colors[Math.floor(random(5) * colors.length)],
            luckyNumber: numbers[Math.floor(random(6) * numbers.length)],
            advice: advice[Math.floor(random(7) * advice.length)],
            source: 'local',
        };
    }

    renderNearestBirthday(container) {
        const friends = this.app.storage.getFriends();
        const card = document.createElement('div');
        card.className = 'card';

        if (friends.length === 0) {
            card.innerHTML = `<div style="font-weight:600;margin-bottom:8px;">🎂 最近生日</div><div class="text-sm text-muted">暂无好友生日</div>`;
        } else {
            const nearest = friends
                .map(f => ({ ...f, days: daysUntilBirthday(f.birthMonth, f.birthDay) }))
                .sort((a, b) => a.days - b.days)[0];
            card.innerHTML = `
                <div style="font-weight:600;margin-bottom:8px;">🎂 最近生日</div>
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div style="display:flex;align-items:center;gap:10px;">
                        <div id="home-birthday-avatar" style="width:36px;height:36px;border-radius:50%;background:var(--color-birthday-light);display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0;overflow:hidden;">🎂</div>
                        <span>${nearest.name}</span>
                    </div>
                    <span class="text-sm ${nearest.days === 0 ? 'overdue' : 'text-secondary'}">${nearest.days === 0 ? '今天生日' : `${nearest.days}天后`}</span>
                </div>
            `;
            // 异步加载头像
            if (nearest.photo && this.app.imageStore) {
                this.app.imageStore.get(nearest.photo).then(imgData => {
                    if (imgData) {
                        const avatarEl = card.querySelector('#home-birthday-avatar');
                        if (avatarEl) {
                            avatarEl.innerHTML = `<img src="${imgData.data}" style="width:100%;height:100%;object-fit:cover;">`;
                        }
                    }
                }).catch(() => {});
            }
        }
        container.appendChild(card);
    }

    renderNearestEvent(container) {
        const events = this.app.storage.getEvents();
        const card = document.createElement('div');
        card.className = 'card';

        if (events.length === 0) {
            card.innerHTML = `<div style="font-weight:600;margin-bottom:8px;">✨ 最近大事件</div><div class="text-sm text-muted">暂无大事件</div>`;
        } else {
            const nearest = events
                .map(e => ({ ...e, days: daysUntilEvent(e.date, e.recurrence) }))
                .filter(e => e.days >= 0 || e.recurrence === 'yearly')
                .sort((a, b) => a.days - b.days)[0];
            if (nearest) {
                card.innerHTML = `
                    <div style="font-weight:600;margin-bottom:8px;">✨ 最近大事件</div>
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <span>${nearest.emoji} ${nearest.title}</span>
                        <span class="text-sm ${nearest.days <= 0 ? 'overdue' : 'text-secondary'}">${nearest.days <= 0 ? '进行中' : `${nearest.days}天后`}</span>
                    </div>
                `;
            } else {
                card.innerHTML = `<div style="font-weight:600;margin-bottom:8px;">✨ 最近大事件</div><div class="text-sm text-muted">暂无即将到来的事件</div>`;
            }
        }
        container.appendChild(card);
    }

    renderExerciseCard(container) {
        const todayStr = new Date().toISOString().split('T')[0];
        const exercise = this.app.storage.getExerciseForDate(todayStr);
        const target = 300;
        const calories = exercise.calories || 0;
        const progress = Math.min(100, (calories / target) * 100);
        const completed = calories >= target;

        // 检查是否需要自动触发健身打卡
        const habits = this.app.storage.getHabitForDate(todayStr);
        if (completed && !habits.fitness) {
            this.app.storage.setHabitForDate(todayStr, 'fitness', true);
            this.app.storage.addReward(`habit_fitness_${todayStr}`, 'water', 1);
            this.app.showToast('🎉 运动目标达成！植物获得浇水×1');
        }

        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                <span style="font-weight:600;">🏃 今日运动</span>
                <span style="font-size:0.75rem;color:var(--text-muted);">
                    ${exercise.source === 'apple_health' ? '🍎 苹果健康' : '✏️ 手动'}
                </span>
            </div>
            <div style="display:flex;align-items:baseline;gap:4px;margin-bottom:8px;">
                <span style="font-size:1.8rem;font-weight:700;color:var(--accent-sage-dark);">${calories}</span>
                <span style="font-size:0.85rem;color:var(--text-muted);">/ ${target} 大卡</span>
                ${completed ? '<span style="font-size:0.75rem;background:var(--accent-sage-light);color:var(--accent-sage-dark);padding:2px 8px;border-radius:8px;margin-left:auto;">✅ 已完成</span>' : ''}
            </div>
            <div style="height:8px;background:var(--bg-surface-alt);border-radius:4px;overflow:hidden;margin-bottom:12px;">
                <div style="height:100%;width:${progress}%;background:linear-gradient(90deg,var(--accent-sage-light),var(--accent-sage));border-radius:4px;transition:width 0.5s ease;"></div>
            </div>
            <div style="display:flex;gap:8px;">
                <input type="number" class="input" id="exercise-calories-input" placeholder="手动输入卡路里" style="flex:1;min-height:36px;font-size:0.85rem;" value="${calories > 0 && exercise.source === 'manual' ? calories : ''}">
                <button class="btn btn-sm" id="exercise-save-btn" style="min-height:36px;">保存</button>
            </div>
        `;

        // 手动保存运动数据
        card.querySelector('#exercise-save-btn').addEventListener('click', () => {
            const input = card.querySelector('#exercise-calories-input');
            const val = parseInt(input.value);
            if (isNaN(val) || val < 0) {
                this.app.showToast('请输入有效的卡路里数值', 'error');
                return;
            }
            this.app.storage.setExerciseForDate(todayStr, {
                calories: val,
                steps: exercise.steps || 0,
                source: 'manual',
            });
            this.app.showToast('运动数据已保存');
            // 重新渲染
            this.render(document.getElementById('page-container'));
        });

        container.appendChild(card);
    }

    renderPlantSummary(container) {
        const plant = this.app.storage.getPlantState();
        const stage = this.calculateStage(plant.growth);
        const card = document.createElement('div');
        card.className = 'card';
        card.style.cssText = 'text-align:center;cursor:pointer;';
        card.innerHTML = `
            <div style="font-weight:600;margin-bottom:8px;text-align:left;">🌱 我的植物</div>
            <div style="font-size:48px;margin-bottom:8px;">${this.getPlantEmoji(stage)}</div>
            <div style="font-size:0.9rem;font-weight:500;">${this.getStageName(stage)}</div>
            <div style="font-size:0.8rem;color:var(--text-muted);margin-top:4px;">成长值 ${plant.growth}/300</div>
            <div style="display:flex;justify-content:center;gap:8px;margin-top:8px;">
                <span style="font-size:0.75rem;padding:2px 8px;background:var(--color-work-light);border-radius:8px;">💧 ${plant.waterInventory}</span>
                <span style="font-size:0.75rem;padding:2px 8px;background:var(--color-life-light);border-radius:8px;">🌿 ${plant.fertilizerInventory}</span>
            </div>
        `;
        card.addEventListener('click', () => this.app.navigate('entertainment'));
        container.appendChild(card);
    }

    // 根据成长值计算阶段（和娱乐页保持一致）
    calculateStage(growth) {
        if (growth >= 300) return 'bloom';
        if (growth >= 180) return 'bud';
        if (growth >= 100) return 'growing';
        if (growth >= 50) return 'seedling';
        if (growth >= 20) return 'sprout';
        return 'seed';
    }

    getPlantEmoji(stage) {
        const emojis = { seed: '🌰', sprout: '🌱', seedling: '🌿', growing: '🪴', bud: '🌷', bloom: '🌸' };
        return emojis[stage] || '🌱';
    }

    getStageName(stage) {
        const names = { seed: '种子', sprout: '发芽', seedling: '幼苗', growing: '成长期', bud: '花苞', bloom: '开花' };
        return names[stage] || stage;
    }

    // 让用户选择计划分类（工作/生活）
    askCategory(title) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            overlay.innerHTML = `
                <div class="modal">
                    <div class="modal-header">
                        <div class="modal-title">选择计划分类</div>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p style="margin-bottom:16px;font-size:0.95rem;">"${title}" 属于哪类计划？</p>
                        <div style="display:flex;gap:12px;">
                            <button class="btn btn-primary category-work" style="flex:1;padding:12px;">💼 工作</button>
                            <button class="btn btn-primary category-life" style="flex:1;padding:12px;">🏠 生活</button>
                        </div>
                    </div>
                </div>
            `;
            document.getElementById('modal-container').appendChild(overlay);

            const close = (result) => {
                overlay.style.opacity = '0';
                setTimeout(() => overlay.remove(), 200);
                resolve(result);
            };

            overlay.querySelector('.modal-close').addEventListener('click', () => close(null));
            overlay.querySelector('.category-work').addEventListener('click', () => close('work'));
            overlay.querySelector('.category-life').addEventListener('click', () => close('life'));
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) close(null);
            });
        });
    }

    // 询问子任务（弹出输入框，一次性输入多个，逗号/换行/分号分隔）
    askSubtasks(title) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            overlay.innerHTML = `
                <div class="modal">
                    <div class="modal-header">
                        <div class="modal-title">添加子任务</div>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p style="margin-bottom:12px;font-size:0.95rem;">"${title}" 是否有子任务？</p>
                        <p style="margin-bottom:8px;font-size:0.85rem;color:var(--text-secondary);">每行一个，或用逗号/分号分隔（可选）</p>
                        <textarea class="textarea" id="subtasks-input" placeholder="例如：&#10;准备材料&#10;发送邮件&#10;跟进反馈" style="width:100%;min-height:100px;"></textarea>
                        <div style="display:flex;gap:12px;margin-top:16px;">
                            <button class="btn" id="subtasks-skip" style="flex:1;">跳过</button>
                            <button class="btn btn-primary" id="subtasks-confirm" style="flex:1;">确定</button>
                        </div>
                    </div>
                </div>
            `;
            document.getElementById('modal-container').appendChild(overlay);

            const close = (result) => {
                overlay.style.opacity = '0';
                setTimeout(() => overlay.remove(), 200);
                resolve(result);
            };

            const parseSubtasks = () => {
                const text = overlay.querySelector('#subtasks-input').value.trim();
                if (!text) return [];
                // 按换行、逗号、分号分隔
                return text.split(/[\n,，;；]/).map(s => s.trim()).filter(s => s.length > 0);
            };

            overlay.querySelector('.modal-close').addEventListener('click', () => close([]));
            overlay.querySelector('#subtasks-skip').addEventListener('click', () => close([]));
            overlay.querySelector('#subtasks-confirm').addEventListener('click', () => close(parseSubtasks()));
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) close([]);
            });
        });
    }
}
