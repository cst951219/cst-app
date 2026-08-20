// 设置页 — 个人资料 / 今日运势 / 数据管理 / APP设置
import { createTabs } from '../components/tabs.js';
import { ImageStore } from '../storage/imageStore.js';

export class SettingsPage {
    constructor(app) {
        this.app = app;
    }

    render(container) {
        container.innerHTML = '';

        const header = document.createElement('div');
        header.className = 'page-header';
        header.innerHTML = `
            <div class="page-title">⚙️ 数据与设置</div>
            <div class="page-subtitle">个人资料、运势、数据管理与APP设置</div>
        `;
        container.appendChild(header);

        const tabs = createTabs({
            tabs: [
                { label: '👤 个人资料', content: this.renderProfile() },
                { label: '👥 好友档案', content: this.renderFriendManagement() },
                { label: '🔮 今日运势', content: this.renderFortune() },
                { label: '💾 数据管理', content: this.renderDataManagement() },
                { label: '⚙️ APP设置', content: this.renderAppSettings() },
            ],
            defaultIndex: 0,
        });
        container.appendChild(tabs.element);
    }

    renderProfile() {
        const div = document.createElement('div');
        const profile = this.app.storage.getProfile();

        div.innerHTML = `
            <div class="card">
                <div style="font-weight:600;margin-bottom:16px;">👤 个人资料</div>
                <div style="display:flex;flex-direction:column;gap:16px;">
                    <div>
                        <label style="display:block;font-size:0.85rem;color:var(--text-secondary);margin-bottom:6px;">出生日期</label>
                        <input type="date" class="input" id="profile-birthdate" value="${profile.birthDate || ''}">
                    </div>
                    <div>
                        <label style="display:block;font-size:0.85rem;color:var(--text-secondary);margin-bottom:6px;">出生时间（可选）</label>
                        <input type="time" class="input" id="profile-birthtime" value="${profile.birthTime || ''}">
                    </div>
                    <div>
                        <label style="display:block;font-size:0.85rem;color:var(--text-secondary);margin-bottom:6px;">出生城市（可选）</label>
                        <input type="text" class="input" id="profile-birthcity" placeholder="如：上海" value="${profile.birthCity || ''}">
                    </div>
                    <button class="btn btn-primary" id="save-profile-btn" style="align-self:flex-start;">保存资料</button>
                </div>
            </div>
        `;

        div.querySelector('#save-profile-btn').addEventListener('click', () => {
            this.app.storage.updateProfile({
                birthDate: div.querySelector('#profile-birthdate').value || null,
                birthTime: div.querySelector('#profile-birthtime').value || null,
                birthCity: div.querySelector('#profile-birthcity').value.trim() || null,
            });
            this.app.showToast('个人资料已保存');
        });

        return div;
    }

    renderFortune() {
        const div = document.createElement('div');
        div.innerHTML = `
            <div class="card">
                <div style="font-weight:600;margin-bottom:12px;">🔮 今日运势</div>
                <div id="fortune-content">
                    <div class="text-muted text-sm">设置出生日期后可查看每日星座运势</div>
                    <button class="btn mt-md" id="refresh-fortune-btn">刷新运势</button>
                </div>
                <div class="text-xs text-muted mt-md" style="font-size:0.75rem;">仅供娱乐参考</div>
            </div>
        `;
        return div;
    }

    renderDataManagement() {
        const div = document.createElement('div');
        const isPureFrontend = !this.app.backendAvailable;
        div.innerHTML = `
            <div class="card">
                <div style="font-weight:600;margin-bottom:16px;">💾 数据管理</div>
                ${isPureFrontend ? `
                <div style="padding:10px 12px;background:#E8F5E9;border-radius:8px;margin-bottom:12px;font-size:0.85rem;color:#2E7D32;">
                    🌿 当前运行模式：<strong>纯前端模式</strong>（无需安装Python）<br>
                    数据保存在浏览器本地，备份请使用"导出"功能下载JSON文件。
                </div>` : `
                <div style="padding:10px 12px;background:#E3F2FD;border-radius:8px;margin-bottom:12px;font-size:0.85rem;color:#1565C0;">
                    ⚙️ 当前运行模式：<strong>完整模式</strong>（已检测到Python）<br>
                    支持自动备份到本地文件夹。
                </div>`}
                <div style="display:flex;flex-direction:column;gap:12px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;background:var(--bg-surface-alt);border-radius:12px;">
                        <div>
                            <div style="font-weight:500;">立即备份</div>
                            <div class="text-sm text-muted">${isPureFrontend ? '导出JSON文件到下载文件夹' : '将当前数据保存到备份文件夹'}</div>
                        </div>
                        <button class="btn btn-primary btn-sm" id="backup-now-btn">立即备份</button>
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;background:var(--bg-surface-alt);border-radius:12px;">
                        <div>
                            <div style="font-weight:500;">导出全部数据</div>
                            <div class="text-sm text-muted">下载 JSON 格式的数据文件</div>
                        </div>
                        <button class="btn btn-sm" id="export-btn">导出</button>
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;background:var(--bg-surface-alt);border-radius:12px;">
                        <div>
                            <div style="font-weight:500;">从备份恢复</div>
                            <div class="text-sm text-muted">选择备份文件恢复数据</div>
                        </div>
                        <button class="btn btn-sm" id="restore-btn">恢复</button>
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;background:var(--overdue-red-light);border-radius:12px;">
                        <div>
                            <div style="font-weight:500;color:var(--overdue-red);">清空全部数据</div>
                            <div class="text-sm text-muted">此操作不可撤销，请谨慎操作</div>
                        </div>
                        <button class="btn btn-danger btn-sm" id="clear-btn">清空</button>
                    </div>
                </div>
            </div>
        `;

        // 立即备份
        div.querySelector('#backup-now-btn')?.addEventListener('click', async () => {
            try {
                this.app.showToast('正在备份...', 'info');
                const result = await this.app.performBackup();
                if (result.success) {
                    this.app.showToast('备份成功');
                } else {
                    this.app.showToast('备份失败', 'error');
                }
            } catch (e) {
                console.error(e);
                this.app.showToast('备份失败：' + e.message, 'error');
            }
        });

        // 导出全部数据
        div.querySelector('#export-btn')?.addEventListener('click', () => {
            const data = this.app.storage.exportAll();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cst_app_backup_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            this.app.showToast('数据已导出');
        });

        // 从备份恢复
        div.querySelector('#restore-btn')?.addEventListener('click', async () => {
            try {
                // 纯前端模式：文件选择上传
                if (!this.app.backendAvailable) {
                    const fileInput = document.createElement('input');
                    fileInput.type = 'file';
                    fileInput.accept = '.json,application/json';
                    fileInput.onchange = async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        try {
                            const confirmed = await this.app.showModal({
                                title: '确认恢复',
                                content: `<p>将从文件 "${file.name}" 恢复数据，覆盖当前数据，确定吗？</p>`,
                                confirmText: '确认恢复',
                                danger: true,
                            });
                            if (confirmed) {
                                await this.app.importFromFile(file);
                                this.app.showToast('数据已恢复，页面即将刷新');
                                setTimeout(() => location.reload(), 1500);
                            }
                        } catch (err) {
                            this.app.showToast('恢复失败：文件格式不正确', 'error');
                        }
                    };
                    fileInput.click();
                    return;
                }

                // 完整模式：从服务器备份列表恢复
                const res = await fetch('/api/backups');
                const data = await res.json();
                if (!data.backups || data.backups.length === 0) {
                    this.app.showToast('没有可用的备份', 'info');
                    return;
                }
                // 显示备份列表让用户选择
                const backupList = data.backups.map((b, i) =>
                    `<div style="padding:8px;border-bottom:1px solid var(--bg-surface-alt);cursor:pointer;" class="backup-item" data-index="${i}">
                        <div style="font-weight:500;">${b.filename}</div>
                        <div class="text-sm text-muted">${b.createdAt || ''}</div>
                    </div>`
                ).join('');
                const confirmed = await this.app.showModal({
                    title: '选择备份恢复',
                    content: `<div>${backupList}</div><div class="text-sm text-muted mt-md">恢复将覆盖当前数据，请谨慎操作</div>`,
                    confirmText: '取消',
                    cancelText: '',
                });
                // 简化处理：恢复最新备份
                if (confirmed) {
                    const latest = data.backups[0];
                    const restoreRes = await fetch(`/api/backups/${latest.filename}`);
                    const backupData = await restoreRes.json();
                    if (backupData.data) {
                        this.app.storage.importAll(backupData.data);
                        this.app.showToast('数据已恢复，页面即将刷新');
                        setTimeout(() => location.reload(), 1500);
                    }
                }
            } catch (e) {
                console.error(e);
                this.app.showToast('恢复失败：' + e.message, 'error');
            }
        });

        // 清空全部数据
        div.querySelector('#clear-btn')?.addEventListener('click', async () => {
            let confirmed = false;
            await this.app.showModal({
                title: '清空全部数据',
                content: `
                    <p style="color:var(--overdue-red);font-weight:600;">此操作不可撤销！</p>
                    <p>将删除所有计划、便签、好友、大事件、植物和设置数据。</p>
                    <p>请输入 <strong>DELETE</strong> 确认：</p>
                    <input type="text" class="input" id="clear-confirm-input" placeholder="输入 DELETE">
                `,
                confirmText: '确认清空',
                danger: true,
                onConfirm: () => {
                    const input = document.querySelector('#clear-confirm-input');
                    if (input && input.value === 'DELETE') {
                        confirmed = true;
                    } else {
                        this.app.showToast('确认文本不正确，已取消', 'error');
                    }
                },
            });
            if (confirmed) {
                this.app.storage.clearAll();
                this.app.showToast('数据已清空，页面即将刷新');
                setTimeout(() => location.reload(), 1500);
            }
        });

        return div;
    }

    // 好友档案管理
    renderFriendManagement() {
        const container = document.createElement('div');
        const friends = this.app.storage.getFriends();
        // 按星标排序，星标在前
        const sortedFriends = [...friends].sort((a, b) => {
            if (a.starred && !b.starred) return -1;
            if (!a.starred && b.starred) return 1;
            return 0;
        });

        container.innerHTML = `
            <div class="card" style="margin-top:16px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                    <div style="font-weight:600;">👥 好友档案</div>
                    <button class="btn btn-primary btn-sm" id="add-friend-btn">+ 添加好友</button>
                </div>
                <div id="friend-list-container">
                    ${sortedFriends.length === 0 ? 
                        '<div class="text-sm text-muted" style="padding:20px 0;text-align:center;">暂无好友档案，点击上方按钮添加</div>' :
                        sortedFriends.map(friend => this.renderFriendItem(friend)).join('')
                    }
                </div>
            </div>
        `;

        // 添加好友按钮
        container.querySelector('#add-friend-btn')?.addEventListener('click', () => {
            this.openFriendDrawer(null);
        });

        // 绑定好友项的事件
        sortedFriends.forEach(friend => {
            const item = container.querySelector(`[data-friend-id="${friend.id}"]`);
            if (!item) return;

            // 星标切换
            item.querySelector('.friend-star-btn')?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleFriendStar(friend.id);
            });

            // 编辑
            item.querySelector('.friend-edit-btn')?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openFriendDrawer(friend);
            });

            // 删除
            item.querySelector('.friend-delete-btn')?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteFriend(friend.id);
            });
        });

        // 异步加载好友头像
        this.loadFriendAvatars(container);

        return container;
    }

    // 异步加载好友头像
    async loadFriendAvatars(container) {
        if (!this.app.imageStore) return;
        const avatarEls = container.querySelectorAll('.friend-avatar');
        for (const el of avatarEls) {
            const photoId = el.getAttribute('data-photo');
            if (photoId) {
                try {
                    const imgData = await this.app.imageStore.get(photoId);
                    if (imgData && imgData.data) {
                        el.innerHTML = `<img src="${imgData.data}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
                    }
                } catch (e) { /* 忽略加载失败 */ }
            }
        }
    }

    // 渲染单个好友项
    renderFriendItem(friend) {
        const starIcon = friend.starred ? '⭐' : '☆';
        return `
            <div data-friend-id="${friend.id}" style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--bg-surface-alt);">
                <div class="friend-avatar" data-photo="${friend.photo || ''}" style="width:40px;height:40px;border-radius:50%;background:var(--color-birthday-light);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">🎂</div>
                <div style="flex:1;min-width:0;">
                    <div style="font-weight:500;display:flex;align-items:center;gap:6px;">
                        <span>${friend.name}</span>
                        ${friend.starred ? '<span style="font-size:0.8rem;">⭐</span>' : ''}
                    </div>
                    <div class="text-sm text-muted">${friend.birthMonth}月${friend.birthDay}日生日</div>
                </div>
                <div style="display:flex;gap:4px;flex-shrink:0;">
                    <button class="friend-star-btn" style="background:none;border:none;cursor:pointer;font-size:1.1rem;padding:4px;" title="星标">${starIcon}</button>
                    <button class="friend-edit-btn btn btn-sm" style="padding:4px 8px;">编辑</button>
                    <button class="friend-delete-btn btn btn-danger btn-sm" style="padding:4px 8px;">删除</button>
                </div>
            </div>
        `;
    }

    // 打开添加/编辑好友的抽屉
    async openFriendDrawer(friend) {
        const isEdit = !!friend;
        let selectedPhoto = null; // 存储选择的图片 base64

        const result = await this.app.showDrawer({
            title: isEdit ? '编辑好友' : '添加好友',
            content: `
                <div style="display:flex;flex-direction:column;gap:16px;">
                    <div>
                        <label style="display:block;font-size:0.85rem;color:var(--text-secondary);margin-bottom:6px;">姓名</label>
                        <input type="text" class="input" id="friend-name-input" placeholder="请输入好友姓名" value="${friend?.name || ''}">
                    </div>
                    <div style="display:flex;gap:12px;">
                        <div style="flex:1;">
                            <label style="display:block;font-size:0.85rem;color:var(--text-secondary);margin-bottom:6px;">生日月份</label>
                            <select class="select" id="friend-month-input">
                                ${Array.from({length: 12}, (_, i) => i + 1).map(m => 
                                    `<option value="${m}" ${friend?.birthMonth === m ? 'selected' : ''}>${m}月</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div style="flex:1;">
                            <label style="display:block;font-size:0.85rem;color:var(--text-secondary);margin-bottom:6px;">生日日期</label>
                            <select class="select" id="friend-day-input">
                                ${Array.from({length: 31}, (_, i) => i + 1).map(d => 
                                    `<option value="${d}" ${friend?.birthDay === d ? 'selected' : ''}>${d}日</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label style="display:block;font-size:0.85rem;color:var(--text-secondary);margin-bottom:6px;">头像照片（可选）</label>
                        <input type="file" class="input" id="friend-photo-input" accept="image/*">
                        <div id="friend-photo-preview" style="margin-top:8px;"></div>
                    </div>
                    <div style="display:flex;align-items:center;gap:8px;">
                        <input type="checkbox" id="friend-starred-input" ${friend?.starred ? 'checked' : ''} style="width:16px;height:16px;">
                        <label for="friend-starred-input" style="font-size:0.9rem;cursor:pointer;">标记为星标好友</label>
                    </div>
                </div>
            `,
            confirmText: isEdit ? '保存修改' : '添加好友',
            onConfirm: async (drawer) => {
                const name = drawer.querySelector('#friend-name-input')?.value.trim();
                const birthMonth = parseInt(drawer.querySelector('#friend-month-input')?.value);
                const birthDay = parseInt(drawer.querySelector('#friend-day-input')?.value);
                const starred = drawer.querySelector('#friend-starred-input')?.checked || false;

                if (!name) {
                    this.app.showToast('请输入好友姓名', 'error');
                    return false;
                }

                // 处理图片保存
                let photoId = friend?.photo || null;
                if (selectedPhoto && this.app.imageStore) {
                    photoId = 'friend_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
                    try {
                        await this.app.imageStore.put(photoId, selectedPhoto, 'image/png');
                    } catch (err) {
                        this.app.showToast('图片保存失败', 'error');
                        return false;
                    }
                }

                if (isEdit) {
                    this.app.storage.updateFriend(friend.id, { name, birthMonth, birthDay, starred, photo: photoId });
                    this.app.showToast('好友信息已更新');
                } else {
                    this.app.storage.createFriend({ name, birthMonth, birthDay, starred, photo: photoId });
                    this.app.showToast('好友已添加');
                }

                // 刷新好友列表
                this.refreshFriendList();
                return true;
            },
        });

        // 绑定图片上传事件
        const drawer = result?.element || result?.body;
        if (drawer) {
            const photoInput = drawer.querySelector('#friend-photo-input');
            const preview = drawer.querySelector('#friend-photo-preview');

            // 编辑时如果已有照片，显示预览
            if (isEdit && friend?.photo && this.app.imageStore) {
                try {
                    const imgData = await this.app.imageStore.get(friend.photo);
                    if (imgData && preview) {
                        preview.innerHTML = `<div style="display:flex;align-items:center;gap:12px;">
                            <img src="${imgData}" style="width:60px;height:60px;border-radius:50%;object-fit:cover;">
                            <button type="button" class="btn btn-sm" id="friend-photo-remove">移除照片</button>
                        </div>`;
                        drawer.querySelector('#friend-photo-remove')?.addEventListener('click', () => {
                            selectedPhoto = null;
                            if (photoInput) photoInput.value = '';
                            preview.innerHTML = '';
                        });
                    }
                } catch (e) { /* 忽略 */ }
            }

            photoInput?.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                try {
                    selectedPhoto = await ImageStore.fileToBase64(file);
                    if (preview) {
                        preview.innerHTML = `<div style="display:flex;align-items:center;gap:12px;">
                            <img src="${selectedPhoto}" style="width:60px;height:60px;border-radius:50%;object-fit:cover;">
                            <button type="button" class="btn btn-sm" id="friend-photo-remove">移除照片</button>
                        </div>`;
                        drawer.querySelector('#friend-photo-remove')?.addEventListener('click', () => {
                            selectedPhoto = null;
                            if (photoInput) photoInput.value = '';
                            preview.innerHTML = '';
                        });
                    }
                } catch (err) {
                    this.app.showToast('图片读取失败', 'error');
                }
            });
        }
    }

    // 切换好友星标
    toggleFriendStar(friendId) {
        const friend = this.app.storage.getFriend(friendId);
        if (!friend) return;
        this.app.storage.updateFriend(friendId, { starred: !friend.starred });
        this.app.showToast(friend.starred ? '已取消星标' : '已标记为星标');
        this.refreshFriendList();
    }

    // 删除好友
    async deleteFriend(friendId) {
        const friend = this.app.storage.getFriend(friendId);
        if (!friend) return;

        const confirmed = await this.app.showModal({
            title: '删除好友',
            content: `<p>确定要删除好友"${friend.name}"吗？</p><p style="color:var(--text-secondary);font-size:0.85rem;">此操作不可撤销</p>`,
            confirmText: '删除',
            danger: true,
        });

        if (confirmed) {
            this.app.storage.deleteFriend(friendId);
            this.app.showToast('好友已删除');
            this.refreshFriendList();
        }
    }

    // 刷新好友列表
    refreshFriendList() {
        const container = document.querySelector('#friend-list-container');
        if (!container) return;
        const friends = this.app.storage.getFriends();
        const sortedFriends = [...friends].sort((a, b) => {
            if (a.starred && !b.starred) return -1;
            if (!a.starred && b.starred) return 1;
            return 0;
        });

        if (sortedFriends.length === 0) {
            container.innerHTML = '<div class="text-sm text-muted" style="padding:20px 0;text-align:center;">暂无好友档案，点击上方按钮添加</div>';
        } else {
            container.innerHTML = sortedFriends.map(friend => this.renderFriendItem(friend)).join('');
            // 重新绑定事件
            sortedFriends.forEach(friend => {
                const item = container.querySelector(`[data-friend-id="${friend.id}"]`);
                if (!item) return;
                item.querySelector('.friend-star-btn')?.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleFriendStar(friend.id);
                });
                item.querySelector('.friend-edit-btn')?.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.openFriendDrawer(friend);
                });
                item.querySelector('.friend-delete-btn')?.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.deleteFriend(friend.id);
                });
            });
        }

        // 异步加载好友头像
        this.loadFriendAvatars(container);
    }

    renderAppSettings() {
        const div = document.createElement('div');
        const settings = this.app.storage.getSettings();

        div.innerHTML = `
            <div class="card">
                <div style="font-weight:600;margin-bottom:16px;">⚙️ APP设置</div>
                <div style="display:flex;flex-direction:column;gap:16px;">
                    <div>
                        <label style="display:block;font-size:0.85rem;color:var(--text-secondary);margin-bottom:6px;">界面缩放</label>
                        <select class="select" id="setting-scale">
                            <option value="small" ${settings.uiScale === 'small' ? 'selected' : ''}>小</option>
                            <option value="standard" ${settings.uiScale === 'standard' ? 'selected' : ''}>标准</option>
                            <option value="large" ${settings.uiScale === 'large' ? 'selected' : ''}>大</option>
                        </select>
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <div>
                            <div style="font-weight:500;">木鱼声音</div>
                            <div class="text-sm text-muted">敲击木鱼时播放声音</div>
                        </div>
                        <input type="checkbox" ${settings.woodenFishSound ? 'checked' : ''} id="setting-wooden-sound" style="width:20px;height:20px;accent-color:var(--accent-sage);">
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <div>
                            <div style="font-weight:500;">游戏音效</div>
                            <div class="text-sm text-muted">种花等游戏操作时播放音效</div>
                        </div>
                        <input type="checkbox" ${settings.gameSound ? 'checked' : ''} id="setting-game-sound" style="width:20px;height:20px;accent-color:var(--accent-sage);">
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <div>
                            <div style="font-weight:500;">每日运势</div>
                            <div class="text-sm text-muted">首页显示今日星座运势</div>
                        </div>
                        <input type="checkbox" ${settings.fortuneEnabled ? 'checked' : ''} id="setting-fortune" style="width:20px;height:20px;accent-color:var(--accent-sage);">
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <div>
                            <div style="font-weight:500;">自动备份</div>
                            <div class="text-sm text-muted">每7天自动备份一次</div>
                        </div>
                        <input type="checkbox" ${settings.autoBackupEnabled ? 'checked' : ''} id="setting-autobackup" style="width:20px;height:20px;accent-color:var(--accent-sage);">
                    </div>
                    ${this.app.cloudSyncEnabled ? `
                    <div style="padding:12px;background:var(--bg-surface-alt);border-radius:12px;">
                        <div style="font-weight:600;margin-bottom:8px;">📱 手机推送通知</div>
                        <div class="text-sm text-muted" style="margin-bottom:8px;">开启后，计划到期、大事件、好友生日时会推送提醒</div>
                        <div style="display:flex;gap:8px;">
                            <button class="btn btn-primary btn-sm" id="enable-push-btn">开启推送通知</button>
                            <button class="btn btn-sm" id="sync-now-btn">立即同步数据</button>
                        </div>
                        <div id="push-status" class="text-sm text-muted" style="margin-top:8px;"></div>
                    </div>
                    <div style="padding:12px;background:var(--bg-surface-alt);border-radius:12px;">
                        <div style="font-weight:600;margin-bottom:8px;">🆔 设备ID</div>
                        <div class="text-sm text-muted" style="margin-bottom:8px;">苹果快捷指令同步运动数据时需要用到此ID</div>
                        <div style="display:flex;gap:8px;">
                            <input type="text" class="input" id="device-id-display" value="${this.app.deviceId || ''}" readonly style="flex:1;font-size:0.8rem;">
                            <button class="btn btn-sm" id="copy-device-id-btn">复制</button>
                        </div>
                    </div>
                    ` : ''}
                    <div>
                        <label style="display:block;font-size:0.85rem;color:var(--text-secondary);margin-bottom:6px;">备份文件夹</label>
                        <div style="display:flex;gap:8px;">
                            <input type="text" class="input" id="setting-backup-folder" placeholder="未设置" value="${settings.backupFolder || ''}" readonly>
                            <button class="btn btn-sm" id="select-folder-btn">选择</button>
                        </div>
                    </div>
                    <button class="btn btn-primary" id="save-settings-btn" style="align-self:flex-start;">保存设置</button>
                </div>
            </div>
        `;

        // 保存设置
        div.querySelector('#save-settings-btn').addEventListener('click', () => {
            this.app.storage.updateSettings({
                uiScale: div.querySelector('#setting-scale').value,
                woodenFishSound: div.querySelector('#setting-wooden-sound').checked,
                gameSound: div.querySelector('#setting-game-sound').checked,
                fortuneEnabled: div.querySelector('#setting-fortune').checked,
                autoBackupEnabled: div.querySelector('#setting-autobackup').checked,
            });
            this.app.applyUIScale();
            this.app.showToast('设置已保存');
        });

        // 开启推送通知
        div.querySelector('#enable-push-btn')?.addEventListener('click', async () => {
            const statusEl = div.querySelector('#push-status');
            if (statusEl) statusEl.textContent = '正在请求权限...';
            const success = await this.app.subscribePush();
            if (statusEl) {
                statusEl.textContent = success ? '✅ 推送通知已开启' : '❌ 开启失败，请检查浏览器通知权限';
                statusEl.style.color = success ? 'var(--accent-sage-dark)' : 'var(--overdue-red)';
            }
        });

        // 立即同步数据
        div.querySelector('#sync-now-btn')?.addEventListener('click', async () => {
            const statusEl = div.querySelector('#push-status');
            if (statusEl) statusEl.textContent = '正在同步...';
            await this.app.syncToCloud();
            if (statusEl) {
                statusEl.textContent = '✅ 数据已同步到云端';
                statusEl.style.color = 'var(--accent-sage-dark)';
            }
        });

        // 复制设备ID
        div.querySelector('#copy-device-id-btn')?.addEventListener('click', () => {
            const input = div.querySelector('#device-id-display');
            if (input) {
                input.select();
                document.execCommand('copy');
                this.app.showToast('设备ID已复制');
            }
        });

        return div;
    }
}
