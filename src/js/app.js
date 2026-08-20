// CST APP — 应用主体
// 负责路由、导航、全局状态管理

import { Storage } from './storage/db.js';
import { ImageStore } from './storage/imageStore.js';
import { Toast } from './components/toast.js';
import { Modal } from './components/modal.js';
import { Drawer } from './components/drawer.js';
import { today } from './utils/date.js';

// 页面模块（后续 Phase 逐步实现）
import { HomePage } from './pages/home.js';
import { PlansPage } from './pages/plans.js';
import { CountdownPage } from './pages/countdown.js';
import { EntertainmentPage } from './pages/entertainment.js';
import { SettingsPage } from './pages/settings.js';

export class App {
    constructor() {
        this.storage = null;
        this.imageStore = null;
        this.currentPage = 'home';
        this.pages = {};
        this.listeners = [];
    }

    async init() {
        // 初始化数据层
        this.storage = new Storage();
        await this.storage.init();

        // 初始化图片存储
        this.imageStore = new ImageStore();
        await this.imageStore.init();

        // 检测后端是否可用（纯前端模式下后端不可用）
        this.backendAvailable = await this.checkBackendAvailable();

        // PWA 初始化
        this.deviceId = this.getDeviceId();
        this.cloudSyncEnabled = !window.location.protocol.startsWith('file:');
        this.registerServiceWorker();

        // 初始化 UI 组件
        this.toast = new Toast();
        this.modal = new Modal();
        this.drawer = new Drawer();

        // 初始化页面
        this.pages = {
            home: new HomePage(this),
            plans: new PlansPage(this),
            countdown: new CountdownPage(this),
            entertainment: new EntertainmentPage(this),
            settings: new SettingsPage(this),
        };

        // 绑定导航
        this.bindNavigation();

        // 初始化习惯打卡（左侧导航栏）
        this.initHabits();

        // 应用界面缩放设置
        this.applyUIScale();

        // 跨标签页数据同步
        this.setupCrossTabSync();

        // 每日重置（免费浇水/施肥、木鱼今日计数）
        this.checkDailyReset();

        // 自动备份检查（每7天）
        this.checkAutoBackup();

        // 渲染首页
        this.navigate('home');

        // 首次使用引导
        this.checkFirstRun();

        // 云同步：页面关闭前自动同步
        window.addEventListener('beforeunload', () => {
            if (this.cloudSyncEnabled) {
                this.syncToCloud();
            }
        });

        console.log('[CST APP] 初始化完成');
    }

    // === 首次使用引导 ===
    checkFirstRun() {
        const profile = this.storage.getProfile();
        const settings = this.storage.getSettings();
        const isFirstRun = !profile.birthDate && !settings.backupFolder;

        if (isFirstRun) {
            setTimeout(() => {
                this.showToast('👋 欢迎使用！建议先去设置页填写出生日期', 'info');
            }, 1000);
        }
    }

    bindNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const page = item.dataset.page;
                this.navigate(page);
                this.closeSidebar();
            });
        });

        // 侧边栏开关
        const menuToggle = document.getElementById('menu-toggle');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');

        if (menuToggle && sidebar && overlay) {
            menuToggle.addEventListener('click', () => {
                this.toggleSidebar();
            });
            overlay.addEventListener('click', () => {
                this.closeSidebar();
            });
        }

        // 快速添加按钮
        const quickAddBtn = document.getElementById('quick-add-btn');
        if (quickAddBtn) {
            quickAddBtn.addEventListener('click', () => {
                this.handleQuickAdd();
            });
        }
    }

    // 侧边栏控制
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        if (sidebar && overlay) {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('show');
        }
    }

    closeSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        if (sidebar && overlay) {
            sidebar.classList.remove('open');
            overlay.classList.remove('show');
        }
    }

    // 快速添加（根据当前页面）
    handleQuickAdd() {
        switch (this.currentPage) {
            case 'plans':
                this.pages.plans.openPlanDrawer?.();
                break;
            case 'countdown':
                this.pages.countdown.openEventDrawer?.();
                break;
            case 'settings':
                this.pages.settings.openFriendDrawer?.(null);
                break;
            default:
                this.showToast('当前页面没有快速添加功能');
        }
    }

    // === 习惯打卡（左侧导航栏） ===
    initHabits() {
        this.updateHabitChecks();
        const fitnessCheck = document.getElementById('habit-fitness-check');
        const tidyCheck = document.getElementById('habit-tidy-check');
        if (fitnessCheck) {
            fitnessCheck.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.habitCheckIn('fitness', '健身打卡', 'water', 1);
                }
            });
        }
        if (tidyCheck) {
            tidyCheck.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.habitCheckIn('tidy', '整理环境', 'fertilizer', 1);
                }
            });
        }
    }

    updateHabitChecks() {
        const todayStr = new Date().toISOString().split('T')[0];
        const habits = this.storage.getHabitForDate(todayStr);
        const fitnessCheck = document.getElementById('habit-fitness-check');
        const tidyCheck = document.getElementById('habit-tidy-check');
        if (fitnessCheck) fitnessCheck.checked = !!habits.fitness;
        if (tidyCheck) tidyCheck.checked = !!habits.tidy;
    }

    habitCheckIn(habitType, reason, rewardType, amount) {
        const todayStr = new Date().toISOString().split('T')[0];
        const rewardId = `habit_${habitType}_${todayStr}`;
        if (this.storage.hasReward(rewardId)) {
            this.showToast('今天已经打卡过了', 'info');
            this.updateHabitChecks();
            return;
        }
        this.storage.setHabitForDate(todayStr, habitType, true);
        this.storage.addReward(rewardId, rewardType, amount);
        this.showToast(`${reason}成功！获得${rewardType === 'water' ? '浇水' : '施肥'}×${amount}`, 'success');
        this.updateHabitChecks();
    }

    navigate(pageName) {
        if (!this.pages[pageName]) {
            console.error(`页面不存在: ${pageName}`);
            return;
        }

        // 更新导航状态
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === pageName);
        });

        // 更新顶部导航标题
        const titleMap = {
            home: '🌿 CST',
            plans: '📋 计划',
            countdown: '📅 时光记',
            entertainment: '🎮 娱乐',
            settings: '⚙️ 设置',
        };
        const titleEl = document.getElementById('top-nav-title');
        if (titleEl) {
            titleEl.textContent = titleMap[pageName] || '🌿 CST';
        }

        // 渲染页面
        const container = document.getElementById('page-container');
        container.innerHTML = '';
        this.currentPage = pageName;
        this.pages[pageName].render(container);

        // 更新 URL hash（不触发刷新）
        window.location.hash = pageName;
    }

    applyUIScale() {
        const settings = this.storage.getSettings();
        const scale = settings.uiScale || 'standard';
        document.body.classList.remove('scale-small', 'scale-large');
        if (scale === 'small') document.body.classList.add('scale-small');
        if (scale === 'large') document.body.classList.add('scale-large');
    }

    setupCrossTabSync() {
        // 监听其他标签页的数据变更
        window.addEventListener('storage', (e) => {
            if (e.key === 'cst_app_data') {
                // 数据被其他标签页修改，重新加载
                this.storage.reload();
                // 刷新当前页面
                if (this.pages[this.currentPage]) {
                    const container = document.getElementById('page-container');
                    container.innerHTML = '';
                    this.pages[this.currentPage].render(container);
                }
                this.toast.show('数据已从其他标签页同步', 'info');
            }
        });
    }

    // 全局工具方法
    showToast(message, type = 'success') {
        this.toast.show(message, type);
    }

    showModal(options) {
        return this.modal.show(options);
    }

    showDrawer(options) {
        return this.drawer.show(options);
    }

    // === 每日重置 ===
    checkDailyReset() {
        const todayStr = today();
        const plant = this.storage.getPlantState();
        const wf = this.storage.getWoodenFish();

        if (plant.lastDailyReset !== todayStr) {
            // 重置每日免费浇水/施肥使用次数
            this.storage.updatePlantState({
                lastDailyReset: todayStr,
                dailyWaterUsed: 0,
                dailyFertilizerUsed: 0,
            });
        }

        if (wf.todayDate !== todayStr) {
            // 重置木鱼今日计数
            this.storage.updateWoodenFish({ todayCount: 0, todayDate: todayStr });
        }
    }

    // === 自动备份检查 ===
    async checkAutoBackup() {
        const settings = this.storage.getSettings();
        if (!settings.autoBackupEnabled || !settings.backupFolder) return;

        const todayStr = today();
        const lastBackup = settings.lastBackup;
        if (!lastBackup) {
            // 从未备份过，不自动备份（等用户手动设置）
            return;
        }

        // 计算距上次备份天数
        const last = new Date(lastBackup);
        const now = new Date(todayStr);
        const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));

        if (diffDays >= 7) {
            try {
                await this.performBackup();
                this.showToast('自动备份完成');
            } catch (e) {
                console.error('自动备份失败', e);
                this.showToast('自动备份失败，请检查备份文件夹', 'error');
            }
        }
    }

    // === 执行备份 ===
    // 检测后端是否可用
    async checkBackendAvailable() {
        try {
            // 如果是 file:// 协议，直接认为后端不可用（纯前端模式）
            if (window.location.protocol === 'file:') {
                return false;
            }
            const res = await fetch('/api/config', { method: 'GET' });
            return res.ok;
        } catch (e) {
            return false;
        }
    }

    // === PWA 相关方法 ===

    // 获取或创建设备ID（匿名标识）
    getDeviceId() {
        let deviceId = localStorage.getItem('cst_device_id');
        if (!deviceId) {
            deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);
            localStorage.setItem('cst_device_id', deviceId);
        }
        return deviceId;
    }

    // 注册 Service Worker
    async registerServiceWorker() {
        if (!('serviceWorker' in navigator)) return;
        if (window.location.protocol.startsWith('file:')) return; // file:// 不支持
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            this.swRegistration = registration;
            console.log('[CST APP] Service Worker 注册成功');
        } catch (e) {
            console.error('[CST APP] Service Worker 注册失败:', e);
        }
    }

    // 同步数据到云端
    async syncToCloud() {
        if (!this.cloudSyncEnabled || !this.deviceId) return;
        try {
            const data = this.storage.exportAll();
            await fetch('/.netlify/functions/sync-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deviceId: this.deviceId, data }),
            });
        } catch (e) {
            console.error('[CST APP] 云同步失败:', e);
        }
    }

    // 请求通知权限并订阅推送
    async subscribePush() {
        if (!('Notification' in window) || !this.swRegistration) {
            this.showToast('当前浏览器不支持推送通知', 'error');
            return false;
        }

        // 请求权限
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            this.showToast('通知权限被拒绝', 'error');
            return false;
        }

        try {
            // 获取 VAPID 公钥
            const vapidPublicKey = 'BJ4EDkAfNFU4XszTmrIgyfNQQFLw7r9dbfajatTtjLIonidH9trID3_nUpPZI_JZPkgkKxa9OpP23bSw7_oumlo';
            const subscription = await this.swRegistration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey),
            });

            // 保存订阅到云端
            await fetch('/.netlify/functions/subscribe-push', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deviceId: this.deviceId, subscription: subscription.toJSON() }),
            });

            this.showToast('推送通知已开启');
            return true;
        } catch (e) {
            console.error('[CST APP] 推送订阅失败:', e);
            this.showToast('推送订阅失败', 'error');
            return false;
        }
    }

    // VAPID 公钥转换
    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    // 导出数据到文件（纯前端模式）
    exportToFile() {
        const data = this.storage.exportAll();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cst_app_backup_${today()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // 从文件导入数据（纯前端模式）
    async importFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    this.storage.importAll(data);
                    resolve({ success: true });
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    async performBackup() {
        // 纯前端模式：导出为文件下载
        if (!this.backendAvailable) {
            this.exportToFile();
            this.storage.updateSettings({ lastBackup: today() });
            return { success: true, mode: 'file' };
        }

        const data = this.storage.exportAll();
        let images = [];
        try {
            images = await this.imageStore.getAll();
        } catch (e) { /* 忽略图片获取失败 */ }

        const res = await fetch('/api/backups', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data, images }),
        });
        const result = await res.json();
        if (result.success) {
            this.storage.updateSettings({ lastBackup: today() });
        }
        return result;
    }

    // === 奖励触发（计划完成、习惯打卡等）===
    triggerReward(rewardId, type, amount, reason) {
        if (this.storage.hasReward(rewardId)) {
            return false; // 已领取过，防重复
        }
        // addReward 内部已经会增加库存并保存
        const record = this.storage.addReward(rewardId, type, amount);
        if (record) {
            this.showToast(`🎁 获得奖励：${reason}`);
            return true;
        }
        return false;
    }
}
