// CST APP — 统一数据访问层
// 所有业务数据通过 localStorage 持久化
// 提供统一的 CRUD 接口，业务页面不得直接操作 localStorage

const STORAGE_KEY = 'cst_app_data';
const CURRENT_SCHEMA_VERSION = 1;

// 默认数据结构
function getDefaultData() {
    const now = new Date().toISOString();
    return {
        schemaVersion: CURRENT_SCHEMA_VERSION,
        createdAt: now,
        updatedAt: now,
        plans: [],
        notes: [],
        friends: [],
        events: [],
        plant: getDefaultPlant(),
        plantCollection: [],
        plantRewards: [],
        habits: {},
        exercise: {},
        diet: {},
        woodenFish: { todayCount: 0, todayDate: '', totalCount: 0, soundEnabled: true },
        profile: { birthDate: null, birthTime: null, birthCity: null },
        fortuneCache: null,
        settings: {
            uiScale: 'standard',
            woodenFishSound: true,
            gameSound: true,
            fortuneEnabled: true,
            autoBackupEnabled: true,
            backupFolder: null,
            lastBackup: null,
        },
    };
}

function getDefaultPlant() {
    return {
        species: 'sunflower',
        stage: 'seed',
        growth: 0,
        waterInventory: 0,
        fertilizerInventory: 0,
        lastDailyReset: '',
        dailyWaterUsed: 0,
        dailyFertilizerUsed: 0,
        currentPot: 'default',
        currentBackground: 'default',
        currentDecoration: 'none',
        unlockedItems: ['pot:default', 'bg:default', 'deco:none'],
    };
}

// 生成唯一 ID
export function generateId() {
    return 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
}

export class Storage {
    constructor() {
        this.data = null;
        this.listeners = [];
    }

    async init() {
        this.load();
        this.runMigrations();
        this.save();
    }

    load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                this.data = JSON.parse(raw);
                // 确保所有字段存在
                const defaults = getDefaultData();
                for (const key of Object.keys(defaults)) {
                    if (this.data[key] === undefined) {
                        this.data[key] = defaults[key];
                    }
                }
            } else {
                this.data = getDefaultData();
            }
        } catch (e) {
            console.error('数据加载失败，使用默认数据', e);
            this.data = getDefaultData();
        }
    }

    reload() {
        this.load();
        this.notifyListeners();
    }

    save() {
        try {
            this.data.updatedAt = new Date().toISOString();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
            this.notifyListeners();
        } catch (e) {
            console.error('数据保存失败', e);
            throw new Error('数据保存失败：' + e.message);
        }
    }

    // === 迁移框架 ===
    runMigrations() {
        const migrations = [
            // { from: 1, to: 2, up: (data) => { ... } }
        ];

        let currentVersion = this.data.schemaVersion || 0;
        for (const migration of migrations) {
            if (currentVersion === migration.from) {
                try {
                    migration.up(this.data);
                    this.data.schemaVersion = migration.to;
                    currentVersion = migration.to;
                    console.log(`数据迁移完成: v${migration.from} -> v${migration.to}`);
                } catch (e) {
                    console.error(`数据迁移失败 v${migration.from} -> v${migration.to}`, e);
                    throw e;
                }
            }
        }
    }

    // === 监听器 ===
    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    notifyListeners() {
        this.listeners.forEach(cb => {
            try { cb(this.data); } catch (e) { console.error(e); }
        });
    }

    // === 原始数据访问 ===
    getData() {
        return this.data;
    }

    getSettings() {
        return this.data.settings;
    }

    updateSettings(patch) {
        Object.assign(this.data.settings, patch);
        this.save();
    }

    getProfile() {
        return this.data.profile;
    }

    updateProfile(patch) {
        Object.assign(this.data.profile, patch);
        this.save();
    }

    // === 计划 CRUD ===
    getPlans(filter = {}) {
        let plans = [...this.data.plans];
        if (filter.category) {
            plans = plans.filter(p => p.category === filter.category);
        }
        if (filter.completed !== undefined) {
            plans = plans.filter(p => p.completed === filter.completed);
        }
        return plans;
    }

    getPlan(id) {
        return this.data.plans.find(p => p.id === id);
    }

    createPlan(planData) {
        const now = new Date().toISOString();
        const plan = {
            id: generateId(),
            title: planData.title || '',
            category: planData.category || 'work',
            dueDate: planData.dueDate || null,
            reminderDays: planData.reminderDays !== undefined ? planData.reminderDays : 0,
            note: planData.note || '',
            completed: false,
            completedAt: null,
            createdAt: now,
            updatedAt: now,
            checklist: (planData.checklist || []).map(item => ({
                id: item.id || generateId(),
                text: item.text || item,
                completed: item.completed !== undefined ? item.completed : false,
                completedAt: item.completedAt || null,
            })),
        };
        this.data.plans.push(plan);
        this.save();
        return plan;
    }

    updatePlan(id, patch) {
        const plan = this.getPlan(id);
        if (!plan) return null;
        Object.assign(plan, patch, { updatedAt: new Date().toISOString() });
        this.save();
        return plan;
    }

    deletePlan(id) {
        const index = this.data.plans.findIndex(p => p.id === id);
        if (index === -1) return false;
        this.data.plans.splice(index, 1);
        this.save();
        return true;
    }

    completePlan(id) {
        return this.updatePlan(id, { completed: true, completedAt: new Date().toISOString() });
    }

    uncompletePlan(id) {
        return this.updatePlan(id, { completed: false, completedAt: null });
    }

    // Checklist 操作
    addChecklistItem(planId, text) {
        const plan = this.getPlan(planId);
        if (!plan) return null;
        const item = { id: generateId(), text, completed: false, completedAt: null };
        plan.checklist.push(item);
        this.save();
        return item;
    }

    updateChecklistItem(planId, itemId, patch) {
        const plan = this.getPlan(planId);
        if (!plan) return null;
        const item = plan.checklist.find(i => i.id === itemId);
        if (!item) return null;
        Object.assign(item, patch);
        if (patch.completed !== undefined) {
            item.completedAt = patch.completed ? new Date().toISOString() : null;
        }
        this.save();
        return item;
    }

    deleteChecklistItem(planId, itemId) {
        const plan = this.getPlan(planId);
        if (!plan) return false;
        const index = plan.checklist.findIndex(i => i.id === itemId);
        if (index === -1) return false;
        plan.checklist.splice(index, 1);
        this.save();
        return true;
    }

    // === 便签 CRUD ===
    getNotes() {
        return [...this.data.notes].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }

    getNote(id) {
        return this.data.notes.find(n => n.id === id);
    }

    createNote(content) {
        const now = new Date().toISOString();
        const note = { id: generateId(), content, createdAt: now, updatedAt: now };
        this.data.notes.push(note);
        this.save();
        return note;
    }

    updateNote(id, content) {
        const note = this.getNote(id);
        if (!note) return null;
        note.content = content;
        note.updatedAt = new Date().toISOString();
        this.save();
        return note;
    }

    deleteNote(id) {
        const index = this.data.notes.findIndex(n => n.id === id);
        if (index === -1) return false;
        this.data.notes.splice(index, 1);
        this.save();
        return true;
    }

    // === 好友生日 CRUD ===
    getFriends() {
        return [...this.data.friends];
    }

    getFriend(id) {
        return this.data.friends.find(f => f.id === id);
    }

    createFriend(friendData) {
        const now = new Date().toISOString();
        const friend = {
            id: generateId(),
            name: friendData.name || '',
            birthMonth: friendData.birthMonth,
            birthDay: friendData.birthDay,
            photo: friendData.photo || null,
            starred: friendData.starred || false,
            createdAt: now,
            updatedAt: now,
        };
        this.data.friends.push(friend);
        this.save();
        return friend;
    }

    updateFriend(id, patch) {
        const friend = this.getFriend(id);
        if (!friend) return null;
        Object.assign(friend, patch, { updatedAt: new Date().toISOString() });
        this.save();
        return friend;
    }

    deleteFriend(id) {
        const index = this.data.friends.findIndex(f => f.id === id);
        if (index === -1) return false;
        this.data.friends.splice(index, 1);
        this.save();
        return true;
    }

    // === 大事件 CRUD ===
    getEvents() {
        return [...this.data.events];
    }

    getEvent(id) {
        return this.data.events.find(e => e.id === id);
    }

    createEvent(eventData) {
        const now = new Date().toISOString();
        const event = {
            id: generateId(),
            title: eventData.title || '',
            date: eventData.date,
            recurrence: eventData.recurrence || 'once',
            emoji: eventData.emoji || '✨',
            image: eventData.image || null,
            createdAt: now,
            updatedAt: now,
        };
        this.data.events.push(event);
        this.save();
        return event;
    }

    updateEvent(id, patch) {
        const event = this.getEvent(id);
        if (!event) return null;
        Object.assign(event, patch, { updatedAt: new Date().toISOString() });
        this.save();
        return event;
    }

    deleteEvent(id) {
        const index = this.data.events.findIndex(e => e.id === id);
        if (index === -1) return false;
        this.data.events.splice(index, 1);
        this.save();
        return true;
    }

    // === 植物状态 ===
    getPlantState() {
        return this.data.plant;
    }

    updatePlantState(patch) {
        Object.assign(this.data.plant, patch);
        this.save();
        return this.data.plant;
    }

    resetPlant(newSpecies = 'sunflower') {
        this.data.plant = { ...getDefaultPlant(), species: newSpecies };
        this.save();
        return this.data.plant;
    }

    // === 植物图鉴 ===
    getPlantCollection() {
        return [...this.data.plantCollection];
    }

    addToCollection(plantData) {
        const entry = {
            id: generateId(),
            species: plantData.species,
            collectedAt: new Date().toISOString(),
            ...plantData,
        };
        this.data.plantCollection.push(entry);
        this.save();
        return entry;
    }

    // === 奖励记录 ===
    getRewardHistory() {
        return [...this.data.plantRewards];
    }

    hasReward(rewardId) {
        return this.data.plantRewards.some(r => r.id === rewardId);
    }

    addReward(rewardId, type, amount) {
        if (this.hasReward(rewardId)) return null;
        const record = {
            id: rewardId,
            type,
            amount,
            createdAt: new Date().toISOString(),
        };
        this.data.plantRewards.push(record);
        // 增加库存
        if (type === 'water') {
            this.data.plant.waterInventory += amount;
        } else if (type === 'fertilizer') {
            this.data.plant.fertilizerInventory += amount;
        }
        this.save();
        return record;
    }

    // === 习惯打卡 ===
    getHabitRecords() {
        return this.data.habits;
    }

    getHabitForDate(dateStr) {
        return this.data.habits[dateStr] || { fitness: false, tidy: false };
    }

    setHabitForDate(dateStr, habit, value) {
        if (!this.data.habits[dateStr]) {
            this.data.habits[dateStr] = { fitness: false, tidy: false };
        }
        this.data.habits[dateStr][habit] = value;
        this.save();
    }

    // === 木鱼统计 ===
    getWoodenFish() {
        return this.data.woodenFish;
    }

    incrementWoodenFish(todayStr) {
        if (this.data.woodenFish.todayDate !== todayStr) {
            this.data.woodenFish.todayDate = todayStr;
            this.data.woodenFish.todayCount = 0;
        }
        this.data.woodenFish.todayCount++;
        this.data.woodenFish.totalCount++;
        this.save();
        return this.data.woodenFish;
    }

    updateWoodenFish(patch) {
        Object.assign(this.data.woodenFish, patch);
        this.save();
    }

    // === 运势缓存 ===
    getFortuneCache() {
        return this.data.fortuneCache;
    }

    setFortuneCache(cache) {
        this.data.fortuneCache = cache;
        this.save();
    }

    // === 运动数据 ===
    getExerciseForDate(dateStr) {
        return this.data.exercise[dateStr] || { calories: 0, steps: 0, source: 'manual', syncedAt: null };
    }

    setExerciseForDate(dateStr, exerciseData) {
        this.data.exercise[dateStr] = {
            calories: exerciseData.calories || 0,
            steps: exerciseData.steps || 0,
            source: exerciseData.source || 'manual',
            syncedAt: new Date().toISOString(),
        };
        this.save();
        return this.data.exercise[dateStr];
    }

    // === 饮食记录 ===
    getDietForDate(dateStr) {
        return this.data.diet[dateStr] || { meals: [], totalCalories: 0 };
    }

    addDietItem(dateStr, item) {
        if (!this.data.diet[dateStr]) {
            this.data.diet[dateStr] = { meals: [], totalCalories: 0 };
        }
        const newItem = {
            id: 'diet_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
            foodId: item.foodId,
            foodName: item.foodName,
            emoji: item.emoji,
            grams: item.grams,
            calories: item.calories,
            meal: item.meal || 'other', // breakfast/lunch/dinner/snack
            createdAt: new Date().toISOString(),
        };
        this.data.diet[dateStr].meals.push(newItem);
        this.data.diet[dateStr].totalCalories = this.data.diet[dateStr].meals.reduce(
            (sum, m) => sum + m.calories, 0
        );
        this.save();
        return newItem;
    }

    deleteDietItem(dateStr, itemId) {
        if (!this.data.diet[dateStr]) return;
        this.data.diet[dateStr].meals = this.data.diet[dateStr].meals.filter(m => m.id !== itemId);
        this.data.diet[dateStr].totalCalories = this.data.diet[dateStr].meals.reduce(
            (sum, m) => sum + m.calories, 0
        );
        this.save();
    }

    // === 导出/导入全部数据 ===
    exportAll() {
        return JSON.parse(JSON.stringify(this.data));
    }

    importAll(data) {
        // 基本验证
        if (!data || typeof data !== 'object') {
            throw new Error('无效的数据格式');
        }
        // 确保必要字段
        const defaults = getDefaultData();
        for (const key of Object.keys(defaults)) {
            if (data[key] === undefined) {
                data[key] = defaults[key];
            }
        }
        this.data = data;
        this.runMigrations();
        this.save();
    }

    clearAll() {
        this.data = getDefaultData();
        this.save();
    }
}
