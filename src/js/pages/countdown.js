// 倒计时页 — 好友生日 + 大事件
import { nextBirthday, daysUntilBirthday, nextEventDate, daysUntilEvent, formatDateChinese } from '../utils/date.js';
import { createEmptyState } from '../components/emptyState.js';
import { ImageStore } from '../storage/imageStore.js';

export class CountdownPage {
    constructor(app) {
        this.app = app;
    }

    render(container) {
        container.innerHTML = '';

        const header = document.createElement('div');
        header.className = 'page-header';
        header.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <div>
                    <div class="page-title">📅 时光记</div>
                    <div class="page-subtitle">重要的人和值得纪念的日子</div>
                </div>
                <div style="display:flex;gap:8px;">
                    <button class="btn btn-sm btn-primary" id="add-event-btn">+ 添加事件</button>
                </div>
            </div>
        `;
        container.appendChild(header);

        // 最近生日卡片
        const friends = this.app.storage.getFriends();
        const upcomingFriends = friends
            .map(f => ({ ...f, nextDate: nextBirthday(f.birthMonth, f.birthDay), days: daysUntilBirthday(f.birthMonth, f.birthDay) }))
            .sort((a, b) => {
                // 星标好友优先
                if (a.starred && !b.starred) return -1;
                if (!a.starred && b.starred) return 1;
                // 然后按日期排序
                return a.days - b.days;
            });

        const nearestBirthday = upcomingFriends[0];

        const birthdayCard = document.createElement('div');
        birthdayCard.className = 'card card-large hoverable';
        birthdayCard.style.cssText = 'background:linear-gradient(135deg, var(--color-birthday-light), var(--bg-surface));cursor:pointer;';
        if (nearestBirthday) {
            birthdayCard.innerHTML = `
                <div style="display:flex;justify-content:space-between;align-items:center;gap:16px;">
                    <div style="display:flex;align-items:center;gap:16px;">
                        <div id="nearest-birthday-avatar" style="width:56px;height:56px;border-radius:50%;background:var(--color-birthday-light);display:flex;align-items:center;justify-content:center;font-size:1.5rem;flex-shrink:0;overflow:hidden;">🎂</div>
                        <div>
                            <div style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:4px;">🎂 最近生日</div>
                            <div style="font-size:1.3rem;font-weight:600;">${nearestBirthday.name}</div>
                            <div style="color:var(--text-secondary);margin-top:4px;">${formatDateChinese(nearestBirthday.nextDate)}</div>
                        </div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:2.5rem;font-weight:700;color:var(--color-birthday);">${nearestBirthday.days === 0 ? '今天' : nearestBirthday.days}</div>
                        <div class="text-sm text-muted">${nearestBirthday.days === 0 ? '生日' : '天后'}</div>
                    </div>
                </div>
            `;
        } else {
            birthdayCard.innerHTML = `
                <div style="text-align:center;padding:20px;">
                    <div style="font-size:2rem;margin-bottom:8px;">🎂</div>
                    <div class="text-muted">还没有添加好友生日</div>
                    <div class="text-sm text-muted mt-md" style="font-size:0.8rem;">请在「设置 → 数据管理 → 好友档案」中添加</div>
                </div>
            `;
        }
        container.appendChild(birthdayCard);

        // 最近大事件卡片
        const events = this.app.storage.getEvents();
        const upcomingEvents = events
            .map(e => ({ ...e, nextDate: nextEventDate(e.date, e.recurrence), days: daysUntilEvent(e.date, e.recurrence) }))
            .filter(e => e.days >= 0 || e.recurrence === 'yearly')
            .sort((a, b) => a.days - b.days);

        const nearestEvent = upcomingEvents[0];

        const eventCard = document.createElement('div');
        eventCard.className = 'card card-large hoverable';
        eventCard.id = 'nearest-event-card';
        eventCard.style.cssText = 'background:linear-gradient(135deg, var(--color-fortune-light), var(--bg-surface));cursor:pointer;position:relative;overflow:hidden;';
        if (nearestEvent) {
            eventCard.innerHTML = `
                <div id="nearest-event-bg" style="position:absolute;inset:0;background-size:cover;background-position:center;opacity:0;transition:opacity 0.3s;"></div>
                <div id="nearest-event-overlay" style="position:absolute;inset:0;background:rgba(255,255,255,0.6);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);opacity:0;transition:opacity 0.3s;"></div>
                <div style="position:relative;z-index:1;display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <div style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:4px;">✨ 最近大事件</div>
                        <div style="font-size:1.3rem;font-weight:600;">${nearestEvent.emoji} ${nearestEvent.title}</div>
                        <div style="color:var(--text-secondary);margin-top:4px;">${formatDateChinese(nearestEvent.nextDate)}</div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:2.5rem;font-weight:700;color:var(--color-fortune);">${nearestEvent.days <= 0 ? '今天' : nearestEvent.days}</div>
                        <div class="text-sm text-muted">${nearestEvent.days <= 0 ? '' : '天后'}</div>
                    </div>
                </div>
            `;
        } else {
            eventCard.innerHTML = `
                <div style="text-align:center;padding:20px;">
                    <div style="font-size:2rem;margin-bottom:8px;">✨</div>
                    <div class="text-muted">还没有添加大事件</div>
                    <button class="btn btn-primary btn-sm mt-md" id="empty-add-event-btn">+ 添加事件</button>
                </div>
            `;
        }
        container.appendChild(eventCard);

        // 全部生日列表
        if (friends.length > 0) {
            const section = document.createElement('div');
            section.className = 'card mt-md';
            section.innerHTML = `<div style="font-weight:600;margin-bottom:12px;">🎂 全部生日</div>`;
            const list = document.createElement('div');
            list.style.cssText = 'display:flex;flex-direction:column;gap:8px;';
            upcomingFriends.forEach(f => {
                const item = document.createElement('div');
                item.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:var(--bg-surface-alt);border-radius:10px;';
                item.innerHTML = `
                    <div style="display:flex;align-items:center;gap:10px;">
                        <div class="friend-avatar" data-photo="${f.photo || ''}" style="width:36px;height:36px;border-radius:50%;background:var(--color-birthday-light);display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0;overflow:hidden;">🎂</div>
                        <span style="display:flex;align-items:center;gap:4px;">
                            ${f.name}
                            ${f.starred ? '<span style="font-size:0.8rem;">⭐</span>' : ''}
                        </span>
                    </div>
                    <span class="text-sm ${f.days === 0 ? 'overdue' : 'text-secondary'}">${f.days === 0 ? '今天生日' : `${f.days}天后`}</span>
                `;
                list.appendChild(item);
            });
            section.appendChild(list);
            container.appendChild(section);
        }

        // 全部大事件列表
        if (events.length > 0) {
            const section = document.createElement('div');
            section.className = 'card mt-md';
            section.innerHTML = `<div style="font-weight:600;margin-bottom:12px;">✨ 全部大事件</div>`;
            const list = document.createElement('div');
            list.style.cssText = 'display:flex;flex-direction:column;gap:8px;';
            upcomingEvents.forEach(e => {
                const item = document.createElement('div');
                item.className = 'event-list-item';
                item.setAttribute('data-image', e.image || '');
                item.setAttribute('data-event-id', e.id);
                item.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:var(--bg-surface-alt);border-radius:10px;position:relative;overflow:hidden;';
                item.innerHTML = `
                    <div class="event-item-bg" style="position:absolute;inset:0;background-size:cover;background-position:center;opacity:0;"></div>
                    <div class="event-item-overlay" style="position:absolute;inset:0;background:rgba(255,255,255,0.65);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);opacity:0;"></div>
                    <div style="display:flex;align-items:center;gap:8px;position:relative;z-index:1;flex:1;min-width:0;">
                        <span>${e.emoji} ${e.title}</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:8px;position:relative;z-index:1;flex-shrink:0;">
                        <span class="text-sm ${e.days <= 0 ? 'overdue' : 'text-secondary'}">${e.days <= 0 ? '进行中' : `${e.days}天后`}</span>
                        <button class="btn btn-danger btn-sm event-delete-btn" data-event-id="${e.id}" style="padding:2px 8px;font-size:0.75rem;">删除</button>
                    </div>
                `;
                list.appendChild(item);
            });
            section.appendChild(list);
            container.appendChild(section);

            // 绑定大事件删除按钮
            list.querySelectorAll('.event-delete-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const eventId = btn.getAttribute('data-event-id');
                    const event = this.app.storage.getEvent(eventId);
                    if (!event) return;
                    const confirmed = await this.app.showModal({
                        title: '删除大事件',
                        content: `<p>确定要删除大事件"${event.title}"吗？</p>`,
                        confirmText: '删除',
                        danger: true,
                    });
                    if (confirmed) {
                        this.app.storage.deleteEvent(eventId);
                        this.app.showToast('大事件已删除');
                        this.render(document.getElementById('page-container'));
                    }
                });
            });
        }

        // 已过去的大事件（仅一次性事件，按日期倒序）
        const pastEvents = events
            .map(e => ({ ...e, nextDate: nextEventDate(e.date, e.recurrence), days: daysUntilEvent(e.date, e.recurrence) }))
            .filter(e => e.recurrence === 'once' && e.days < 0)
            .sort((a, b) => b.days - a.days); // 越近的越靠前（days是负数，-1比-10大）

        if (pastEvents.length > 0) {
            const pastSection = document.createElement('div');
            pastSection.className = 'card mt-md';
            pastSection.innerHTML = `<div style="font-weight:600;margin-bottom:12px;">📜 已过去的大事件</div>`;
            const pastList = document.createElement('div');
            pastList.style.cssText = 'display:flex;flex-direction:column;gap:8px;';
            pastEvents.forEach(e => {
                const item = document.createElement('div');
                item.className = 'event-list-item';
                item.setAttribute('data-image', e.image || '');
                item.setAttribute('data-event-id', e.id);
                item.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:var(--bg-surface-alt);border-radius:10px;position:relative;overflow:hidden;opacity:0.7;';
                const pastDays = Math.abs(e.days);
                item.innerHTML = `
                    <div class="event-item-bg" style="position:absolute;inset:0;background-size:cover;background-position:center;opacity:0;"></div>
                    <div class="event-item-overlay" style="position:absolute;inset:0;background:rgba(255,255,255,0.65);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);opacity:0;"></div>
                    <div style="display:flex;align-items:center;gap:8px;position:relative;z-index:1;flex:1;min-width:0;">
                        <span>${e.emoji} ${e.title}</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:8px;position:relative;z-index:1;flex-shrink:0;">
                        <span class="text-sm text-secondary">${formatDateChinese(e.date)} · ${pastDays}天前</span>
                        <button class="btn btn-danger btn-sm event-delete-btn" data-event-id="${e.id}" style="padding:2px 8px;font-size:0.75rem;">删除</button>
                    </div>
                `;
                pastList.appendChild(item);
            });
            pastSection.appendChild(pastList);
            container.appendChild(pastSection);

            // 绑定已过去大事件的删除按钮
            pastList.querySelectorAll('.event-delete-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const eventId = btn.getAttribute('data-event-id');
                    const event = this.app.storage.getEvent(eventId);
                    if (!event) return;
                    const confirmed = await this.app.showModal({
                        title: '删除大事件',
                        content: `<p>确定要删除大事件"${event.title}"吗？</p>`,
                        confirmText: '删除',
                        danger: true,
                    });
                    if (confirmed) {
                        this.app.storage.deleteEvent(eventId);
                        this.app.showToast('大事件已删除');
                        this.render(document.getElementById('page-container'));
                    }
                });
            });
        }

        // 绑定按钮
        container.querySelector('#add-event-btn')?.addEventListener('click', () => this.openEventDrawer());
        container.querySelector('#empty-add-event-btn')?.addEventListener('click', () => this.openEventDrawer());

        // 异步加载好友头像
        this.loadFriendAvatars(container, nearestBirthday);

        // 异步加载大事件图片背景
        this.loadEventImages(container, nearestEvent);
    }

    // 异步加载好友头像（从 IndexedDB）
    async loadFriendAvatars(container, nearestBirthday) {
        // 加载最近生日头像
        if (nearestBirthday?.photo && this.app.imageStore) {
            try {
                const imgData = await this.app.imageStore.get(nearestBirthday.photo);
                if (imgData) {
                    const avatarEl = container.querySelector('#nearest-birthday-avatar');
                    if (avatarEl) {
                        avatarEl.innerHTML = `<img src="${imgData.data}" style="width:100%;height:100%;object-fit:cover;">`;
                    }
                }
            } catch (e) { /* 忽略图片加载错误 */ }
        }

        // 加载全部生日列表中的头像
        const avatarEls = container.querySelectorAll('.friend-avatar');
        avatarEls.forEach(async (el) => {
            const photoId = el.getAttribute('data-photo');
            if (photoId && this.app.imageStore) {
                try {
                    const imgData = await this.app.imageStore.get(photoId);
                    if (imgData) {
                        el.innerHTML = `<img src="${imgData.data}" style="width:100%;height:100%;object-fit:cover;">`;
                    }
                } catch (e) { /* 忽略图片加载错误 */ }
            }
        });
    }

    // 异步加载大事件图片背景（从 IndexedDB）
    async loadEventImages(container, nearestEvent) {
        // 加载最近大事件卡片背景
        if (nearestEvent?.image && this.app.imageStore) {
            try {
                const imgData = await this.app.imageStore.get(nearestEvent.image);
                if (imgData) {
                    const bgEl = container.querySelector('#nearest-event-bg');
                    const overlayEl = container.querySelector('#nearest-event-overlay');
                    if (bgEl) {
                        bgEl.style.backgroundImage = `url(${imgData.data})`;
                        bgEl.style.opacity = '1';
                    }
                    if (overlayEl) {
                        overlayEl.style.opacity = '1';
                    }
                }
            } catch (e) { /* 忽略图片加载错误 */ }
        }

        // 加载全部大事件列表中的图片背景
        const eventItems = container.querySelectorAll('.event-list-item');
        eventItems.forEach(async (item) => {
            const imageId = item.getAttribute('data-image');
            if (imageId && this.app.imageStore) {
                try {
                    const imgData = await this.app.imageStore.get(imageId);
                    if (imgData) {
                        const bgEl = item.querySelector('.event-item-bg');
                        const overlayEl = item.querySelector('.event-item-overlay');
                        if (bgEl) {
                            bgEl.style.backgroundImage = `url(${imgData.data})`;
                            bgEl.style.opacity = '1';
                        }
                        if (overlayEl) {
                            overlayEl.style.opacity = '1';
                        }
                    }
                } catch (e) { /* 忽略图片加载错误 */ }
            }
        });
    }

    openFriendDrawer() {
        let selectedPhoto = null; // 存储选择的图片 base64
        const formHtml = `
            <div style="display:flex;flex-direction:column;gap:16px;">
                <div>
                    <label style="display:block;font-size:0.85rem;color:var(--text-secondary);margin-bottom:6px;">姓名</label>
                    <input type="text" class="input" id="friend-name" placeholder="输入好友姓名">
                </div>
                <div style="display:flex;gap:12px;">
                    <div style="flex:1;">
                        <label style="display:block;font-size:0.85rem;color:var(--text-secondary);margin-bottom:6px;">出生月份</label>
                        <select class="select" id="friend-month">
                            ${Array.from({length:12}, (_,i) => `<option value="${i+1}">${i+1}月</option>`).join('')}
                        </select>
                    </div>
                    <div style="flex:1;">
                        <label style="display:block;font-size:0.85rem;color:var(--text-secondary);margin-bottom:6px;">出生日期</label>
                        <select class="select" id="friend-day">
                            ${Array.from({length:31}, (_,i) => `<option value="${i+1}">${i+1}日</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div>
                    <label style="display:block;font-size:0.85rem;color:var(--text-secondary);margin-bottom:6px;">头像照片（可选）</label>
                    <input type="file" class="input" id="friend-photo" accept="image/*" style="padding:8px;">
                    <div id="friend-photo-preview" style="margin-top:8px;display:none;">
                        <img id="friend-photo-img" style="width:60px;height:60px;object-fit:cover;border-radius:8px;">
                        <button class="btn" id="friend-photo-remove" style="margin-left:8px;padding:4px 10px;font-size:0.8rem;">移除</button>
                    </div>
                </div>
            </div>
        `;
        const footerHtml = `
            <button class="btn" id="cancel-btn">取消</button>
            <button class="btn btn-primary" id="save-btn">添加</button>
        `;

        this.app.showDrawer({ title: '添加好友生日', content: formHtml, footer: footerHtml }).then(({ body, close }) => {
            body.querySelector('#cancel-btn').addEventListener('click', close);

            // 图片选择预览
            body.querySelector('#friend-photo').addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                try {
                    selectedPhoto = await ImageStore.fileToBase64(file);
                    body.querySelector('#friend-photo-img').src = selectedPhoto;
                    body.querySelector('#friend-photo-preview').style.display = 'flex';
                    body.querySelector('#friend-photo-preview').style.alignItems = 'center';
                } catch (err) {
                    this.app.showToast('图片读取失败', 'error');
                }
            });

            // 移除图片
            body.querySelector('#friend-photo-remove').addEventListener('click', () => {
                selectedPhoto = null;
                body.querySelector('#friend-photo').value = '';
                body.querySelector('#friend-photo-preview').style.display = 'none';
            });

            body.querySelector('#save-btn').addEventListener('click', async () => {
                const name = body.querySelector('#friend-name').value.trim();
                if (!name) { this.app.showToast('请输入姓名', 'error'); return; }

                let photoId = null;
                if (selectedPhoto && this.app.imageStore) {
                    photoId = 'friend_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
                    try {
                        await this.app.imageStore.put(photoId, selectedPhoto, 'image/png');
                    } catch (err) {
                        this.app.showToast('图片保存失败', 'error');
                        return;
                    }
                }

                this.app.storage.createFriend({
                    name,
                    birthMonth: parseInt(body.querySelector('#friend-month').value),
                    birthDay: parseInt(body.querySelector('#friend-day').value),
                    photo: photoId,
                });
                this.app.showToast('好友已添加');
                close();
                this.render(document.getElementById('page-container'));
            });
        });
    }

    openEventDrawer() {
        let selectedImage = null; // 存储选择的图片 base64
        const formHtml = `
            <div style="display:flex;flex-direction:column;gap:16px;">
                <div>
                    <label style="display:block;font-size:0.85rem;color:var(--text-secondary);margin-bottom:6px;">事件名称</label>
                    <input type="text" class="input" id="event-title" placeholder="如：春节、旅行、纪念日">
                </div>
                <div>
                    <label style="display:block;font-size:0.85rem;color:var(--text-secondary);margin-bottom:6px;">Emoji</label>
                    <select class="select" id="event-emoji">
                        <option value="✨">✨ 庆祝</option>
                        <option value="🎉">🎉 派对</option>
                        <option value="🎂">🎂 生日</option>
                        <option value="💍">💍 纪念日</option>
                        <option value="🎄">🎄 节日</option>
                        <option value="❤️">❤️ 爱情</option>
                        <option value="🏖️">🏖️ 旅行</option>
                        <option value="✈️">✈️ 出行</option>
                        <option value="🎓">🎓 毕业</option>
                        <option value="🌟">🌟 重要</option>
                        <option value="📅">📅 日程</option>
                        <option value="🏠">🏠 家庭</option>
                        <option value="💼">💼 工作</option>
                        <option value="🎊">🎊 庆典</option>
                        <option value="🎃">🎃 万圣节</option>
                    </select>
                </div>
                <div>
                    <label style="display:block;font-size:0.85rem;color:var(--text-secondary);margin-bottom:6px;">日期</label>
                    <input type="date" class="input" id="event-date">
                </div>
                <div>
                    <label style="display:block;font-size:0.85rem;color:var(--text-secondary);margin-bottom:6px;">重复</label>
                    <select class="select" id="event-recurrence">
                        <option value="once">一次性</option>
                        <option value="yearly">每年重复</option>
                    </select>
                </div>
                <div>
                    <label style="display:block;font-size:0.85rem;color:var(--text-secondary);margin-bottom:6px;">事件图片（可选）</label>
                    <input type="file" class="input" id="event-image" accept="image/*" style="padding:8px;">
                    <div id="event-image-preview" style="margin-top:8px;display:none;">
                        <img id="event-image-img" style="width:60px;height:60px;object-fit:cover;border-radius:8px;">
                        <button class="btn" id="event-image-remove" style="margin-left:8px;padding:4px 10px;font-size:0.8rem;">移除</button>
                    </div>
                </div>
            </div>
        `;
        const footerHtml = `
            <button class="btn" id="cancel-btn">取消</button>
            <button class="btn btn-primary" id="save-btn">添加</button>
        `;

        this.app.showDrawer({ title: '添加大事件', content: formHtml, footer: footerHtml }).then(({ body, close }) => {
            body.querySelector('#cancel-btn').addEventListener('click', close);

            // 图片选择预览
            body.querySelector('#event-image').addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                try {
                    selectedImage = await ImageStore.fileToBase64(file);
                    body.querySelector('#event-image-img').src = selectedImage;
                    body.querySelector('#event-image-preview').style.display = 'flex';
                    body.querySelector('#event-image-preview').style.alignItems = 'center';
                } catch (err) {
                    this.app.showToast('图片读取失败', 'error');
                }
            });

            // 移除图片
            body.querySelector('#event-image-remove').addEventListener('click', () => {
                selectedImage = null;
                body.querySelector('#event-image').value = '';
                body.querySelector('#event-image-preview').style.display = 'none';
            });

            body.querySelector('#save-btn').addEventListener('click', async () => {
                const title = body.querySelector('#event-title').value.trim();
                const date = body.querySelector('#event-date').value;
                if (!title || !date) { this.app.showToast('请填写名称和日期', 'error'); return; }

                let imageId = null;
                if (selectedImage && this.app.imageStore) {
                    imageId = 'event_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
                    try {
                        await this.app.imageStore.put(imageId, selectedImage, 'image/png');
                    } catch (err) {
                        this.app.showToast('图片保存失败', 'error');
                        return;
                    }
                }

                this.app.storage.createEvent({
                    title,
                    date,
                    emoji: body.querySelector('#event-emoji').value || '✨',
                    recurrence: body.querySelector('#event-recurrence').value,
                    image: imageId,
                });
                this.app.showToast('大事件已添加');
                close();
                this.render(document.getElementById('page-container'));
            });
        });
    }
}
