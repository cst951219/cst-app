// 娱乐页 — 桌面种花 + 翻牌记忆 + 身材管理
import { createTabs } from '../components/tabs.js';
import { createEmptyState } from '../components/emptyState.js';
import { FOOD_DATABASE, getFoodsByCategory, searchFoods } from '../data/foods.js';

export class EntertainmentPage {
    constructor(app) {
        this.app = app;
    }

    render(container) {
        container.innerHTML = '';

        const header = document.createElement('div');
        header.className = 'page-header';
        header.innerHTML = `
            <div class="page-title">🎮 娱乐</div>
            <div class="page-subtitle">桌面种花与翻牌记忆，放松一下</div>
        `;
        container.appendChild(header);

        const tabs = createTabs({
            tabs: [
                { label: '🌱 桌面种花', content: this.renderPlant() },
                { label: '🃏 翻牌记忆', content: this.renderMemoryGame() },
                { label: '🏃 身材管理', content: this.renderFitness() },
            ],
            defaultIndex: 0,
        });
        container.appendChild(tabs.element);
    }

    renderPlant() {
        const div = document.createElement('div');
        const plant = this.app.storage.getPlantState();

        // 自动计算阶段
        const autoStage = this.calculateStage(plant.growth);
        const isBloom = plant.growth >= 300;
        const growthPercent = Math.min(100, (plant.growth / 300) * 100);

        // 每日免费状态
        const dailyWaterFree = plant.dailyWaterUsed < 1;
        const dailyFertilizerFree = plant.dailyFertilizerUsed < 1;

        // 阶段颜色
        const stageColors = {
            seed: '#A1887F',
            sprout: '#81C784',
            seedling: '#66BB6A',
            growing: '#4CAF50',
            bud: '#FFB74D',
            bloom: '#F06292',
        };
        const stageColor = stageColors[autoStage] || '#81C784';

        div.innerHTML = `
            <div class="card card-large" style="text-align:center;padding:32px;position:relative;overflow:hidden;">
                <!-- 装饰背景：阳光 -->
                <div style="position:absolute;top:-30px;right:-30px;width:120px;height:120px;border-radius:50%;background:radial-gradient(circle, #FFF9C4 0%, #FFF59D 40%, transparent 70%);opacity:0.6;"></div>
                <!-- 装饰背景：小云朵 -->
                <div style="position:absolute;top:20px;left:30px;font-size:1.5rem;opacity:0.4;">☁️</div>
                <div style="position:absolute;top:50px;right:60px;font-size:1.2rem;opacity:0.3;">☁️</div>

                <!-- 花盆和植物区域 -->
                <div style="position:relative;margin-bottom:20px;">
                    <!-- 植物 emoji -->
                    <div style="font-size:90px;margin-bottom:8px;position:relative;z-index:2;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.1));">
                        ${this.getPlantEmoji(autoStage)}
                    </div>
                    <!-- 花盆 SVG -->
                    <svg width="140" height="70" viewBox="0 0 140 70" style="margin-top:-10px;position:relative;z-index:1;">
                        <!-- 花盆主体 -->
                        <path d="M 25 10 L 115 10 L 105 65 Q 105 70 100 70 L 40 70 Q 35 70 35 65 Z" fill="#D4A574" stroke="#B8865A" stroke-width="2"/>
                        <!-- 花盆边缘 -->
                        <rect x="20" y="5" width="100" height="12" rx="3" fill="#C4956A" stroke="#A07040" stroke-width="2"/>
                        <!-- 花盆装饰条纹 -->
                        <path d="M 30 25 L 110 25" stroke="#B8865A" stroke-width="1" opacity="0.5"/>
                        <path d="M 33 40 L 107 40" stroke="#B8865A" stroke-width="1" opacity="0.5"/>
                        <path d="M 36 55 L 104 55" stroke="#B8865A" stroke-width="1" opacity="0.5"/>
                        <!-- 土壤 -->
                        <ellipse cx="70" cy="12" rx="42" ry="6" fill="#6D4C41"/>
                    </svg>
                    <!-- 小装饰：左右小草 -->
                    <div style="position:absolute;bottom:5px;left:15%;font-size:1.2rem;opacity:0.7;">🌿</div>
                    <div style="position:absolute;bottom:8px;right:15%;font-size:1rem;opacity:0.6;">🌱</div>
                </div>

                <!-- 阶段名称 -->
                <div style="font-size:1.3rem;font-weight:600;margin-bottom:4px;color:${stageColor};">${this.getStageName(autoStage)}</div>

                <!-- 成长进度条 -->
                <div style="margin:0 auto 16px;max-width:300px;">
                    <div style="display:flex;justify-content:space-between;font-size:0.8rem;color:var(--text-secondary);margin-bottom:4px;">
                        <span>成长值</span>
                        <span>${plant.growth} / 300</span>
                    </div>
                    <div style="height:12px;background:var(--bg-surface-alt);border-radius:6px;overflow:hidden;">
                        <div style="height:100%;width:${growthPercent}%;background:linear-gradient(90deg, #81C784, #4CAF50, ${stageColor});border-radius:6px;transition:width 0.5s ease;"></div>
                    </div>
                    <!-- 阶段标记 -->
                    <div style="display:flex;justify-content:space-between;font-size:0.65rem;color:var(--text-muted);margin-top:4px;">
                        <span>🌰种子</span>
                        <span>🌱发芽</span>
                        <span>🌿幼苗</span>
                        <span>🌳成长</span>
                        <span>🌸开花</span>
                    </div>
                </div>

                <!-- 库存显示 -->
                <div style="display:flex;justify-content:center;gap:12px;margin-bottom:20px;">
                    <span style="padding:6px 14px;background:linear-gradient(135deg, #E3F2FD, #BBDEFB);border-radius:12px;font-size:0.9rem;font-weight:500;">💧 浇水 x${plant.waterInventory}${dailyWaterFree ? ' <span style="color:#1976D2;">(+1免费)</span>' : ''}</span>
                    <span style="padding:6px 14px;background:linear-gradient(135deg, #E8F5E9, #C8E6C9);border-radius:12px;font-size:0.9rem;font-weight:500;">🌿 施肥 x${plant.fertilizerInventory}${dailyFertilizerFree ? ' <span style="color:#388E3C;">(+1免费)</span>' : ''}</span>
                </div>

                <!-- 操作按钮 -->
                <div style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap;">
                    <button class="btn btn-primary" id="water-btn" style="padding:10px 24px;font-size:1rem;">💧 浇水${dailyWaterFree ? ' (免费)' : ''}</button>
                    <button class="btn" id="fertilizer-btn" style="padding:10px 24px;font-size:1rem;">🌿 施肥${dailyFertilizerFree ? ' (免费)' : ''}</button>
                    ${isBloom ? '<button class="btn btn-primary" id="harvest-btn" style="padding:10px 24px;font-size:1rem;background:linear-gradient(135deg, #F48FB1, #F06292);">🌸 收入图鉴</button>' : ''}
                </div>
                <div style="margin-top:16px;font-size:0.8rem;color:var(--text-muted);">
                    每天可免费浇水×1、施肥×1；完成计划和习惯打卡可获得奖励
                </div>
            </div>
            <div class="card">
                <div style="font-weight:600;margin-bottom:12px;">💪 今日习惯打卡</div>
                <div style="display:flex;gap:12px;flex-wrap:wrap;">
                    <button class="btn btn-sm" id="habit-fitness-btn">🏃 健身打卡</button>
                    <button class="btn btn-sm" id="habit-tidy-btn">🧹 整理环境</button>
                </div>
                <div style="margin-top:8px;font-size:0.8rem;color:var(--text-muted);">完成习惯打卡可获得浇水/施肥奖励</div>
            </div>
            <div class="card">
                <div style="font-weight:600;margin-bottom:12px;">📖 植物图鉴</div>
                <div id="plant-collection" style="display:flex;gap:12px;flex-wrap:wrap;"></div>
            </div>
        `;

        // 渲染图鉴
        const collection = this.app.storage.getPlantCollection();
        const collectionEl = div.querySelector('#plant-collection');
        if (collection.length === 0) {
            collectionEl.innerHTML = '<div class="text-sm text-muted">还没有收集到植物，开花后收入图鉴吧~</div>';
        } else {
            collection.forEach(item => {
                const badge = document.createElement('div');
                badge.style.cssText = 'padding:8px 12px;background:var(--bg-surface-alt);border-radius:12px;font-size:0.85rem;';
                badge.textContent = `🌻 ${item.species}`;
                collectionEl.appendChild(badge);
            });
        }

        // 浇水按钮
        div.querySelector('#water-btn')?.addEventListener('click', () => {
            const current = this.app.storage.getPlantState();
            const useFree = current.dailyWaterUsed < 1;
            if (!useFree && current.waterInventory <= 0) {
                this.app.showToast('没有浇水了，完成任务获取奖励', 'error');
                return;
            }
            const updates = { growth: Math.min(300, current.growth + 10) };
            if (useFree) {
                updates.dailyWaterUsed = current.dailyWaterUsed + 1;
            } else {
                updates.waterInventory = current.waterInventory - 1;
            }
            this.app.storage.updatePlantState(updates);
            this.app.showToast(useFree ? '免费浇水成功 +10 成长值' : '浇水成功 +10 成长值');
            this.render(document.getElementById('page-container'));
        });

        // 施肥按钮
        div.querySelector('#fertilizer-btn')?.addEventListener('click', () => {
            const current = this.app.storage.getPlantState();
            const useFree = current.dailyFertilizerUsed < 1;
            if (!useFree && current.fertilizerInventory <= 0) {
                this.app.showToast('没有肥料了，完成任务获取奖励', 'error');
                return;
            }
            const updates = { growth: Math.min(300, current.growth + 20) };
            if (useFree) {
                updates.dailyFertilizerUsed = current.dailyFertilizerUsed + 1;
            } else {
                updates.fertilizerInventory = current.fertilizerInventory - 1;
            }
            this.app.storage.updatePlantState(updates);
            this.app.showToast(useFree ? '免费施肥成功 +20 成长值' : '施肥成功 +20 成长值');
            this.render(document.getElementById('page-container'));
        });

        // 收入图鉴按钮
        div.querySelector('#harvest-btn')?.addEventListener('click', () => {
            this.harvestPlant();
        });

        // 习惯打卡
        div.querySelector('#habit-fitness-btn')?.addEventListener('click', () => {
            this.habitCheckIn('fitness', '健身打卡', 'water', 1);
        });
        div.querySelector('#habit-tidy-btn')?.addEventListener('click', () => {
            this.habitCheckIn('tidy', '整理环境', 'fertilizer', 1);
        });

        return div;
    }

    // 根据成长值计算阶段
    calculateStage(growth) {
        // 每个阶段单独计算成长值，总和300，模拟真实植物生长（前期快后期慢）
        if (growth >= 300) return 'bloom';      // 开花：300+
        if (growth >= 180) return 'bud';         // 花苞：180-299（120成长值）
        if (growth >= 100) return 'growing';     // 成长期：100-179（80成长值）
        if (growth >= 50) return 'seedling';     // 幼苗：50-99（50成长值）
        if (growth >= 20) return 'sprout';       // 发芽：20-49（30成长值）
        return 'seed';                             // 种子：0-19（20成长值）
    }

    // 开花收入图鉴，获得新种子
    harvestPlant() {
        const plant = this.app.storage.getPlantState();
        const species = plant.species || '向日葵';

        // 收入图鉴
        this.app.storage.addToPlantCollection({ species, harvestedAt: new Date().toISOString() });

        // 随机获得新种子（避免连续重复）
        const allSpecies = ['向日葵', '玫瑰', '郁金香', '薰衣草', '小雏菊', '铃兰'];
        const available = allSpecies.filter(s => s !== species);
        const newSpecies = available[Math.floor(Math.random() * available.length)];

        // 重置植物
        this.app.storage.resetPlant(newSpecies);
        this.app.showToast(`🌸 已收入图鉴：${species}，获得新种子：${newSpecies}`);
        this.render(document.getElementById('page-container'));
    }

    // 习惯打卡
    habitCheckIn(habitType, reason, rewardType, amount) {
        const todayStr = new Date().toISOString().split('T')[0];
        const rewardId = `habit_${habitType}_${todayStr}`;
        const success = this.app.triggerReward(rewardId, rewardType, amount, reason);
        if (success) {
            this.app.storage.setHabitForDate(todayStr, habitType, true);
        } else {
            this.app.showToast('今天已经打卡过了', 'info');
        }
        this.render(document.getElementById('page-container'));
    }

    renderMemoryGame() {
        const div = document.createElement('div');

        // 游戏状态
        this.memoryGame = {
            cards: [],
            flipped: [],
            matched: [],
            moves: 0,
            locked: false,
        };

        // 6对图案
        const symbols = ['🌸', '🌻', '🌷', '🌹', '🌺', '🍀'];
        const cardPairs = [...symbols, ...symbols];
        // 洗牌
        for (let i = cardPairs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cardPairs[i], cardPairs[j]] = [cardPairs[j], cardPairs[i]];
        }
        this.memoryGame.cards = cardPairs;

        div.innerHTML = `
            <div class="card card-large" style="padding:32px;">
                <div style="text-align:center;margin-bottom:20px;">
                    <div style="font-size:1.3rem;font-weight:600;margin-bottom:8px;">🃏 翻牌记忆</div>
                    <div class="text-sm text-muted">找出所有配对的卡片</div>
                    <div style="margin-top:12px;font-size:1rem;">
                        <span style="padding:4px 12px;background:var(--bg-surface-alt);border-radius:10px;">步数: <strong id="memory-moves">0</strong></span>
                        <span style="padding:4px 12px;background:var(--bg-surface-alt);border-radius:10px;margin-left:8px;">已配对: <strong id="memory-matched">0</strong>/6</span>
                    </div>
                </div>
                <div id="memory-board" style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;max-width:400px;margin:0 auto;">
                    ${cardPairs.map((_, i) => `
                        <div class="memory-card" data-index="${i}" style="aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:2rem;background:linear-gradient(135deg, #A8C3A0, #8FA8B8);border-radius:12px;cursor:pointer;transition:all 0.3s;user-select:none;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
                            <span class="memory-card-front" style="display:none;">❓</span>
                            <span class="memory-card-back" style="display:none;">${cardPairs[i]}</span>
                            <span class="memory-card-question">❓</span>
                        </div>
                    `).join('')}
                </div>
                <div style="text-align:center;margin-top:20px;">
                    <button class="btn" id="memory-restart">🔄 重新开始</button>
                </div>
                <div id="memory-result" style="text-align:center;margin-top:16px;display:none;">
                    <div style="font-size:1.2rem;font-weight:600;color:var(--accent-sage-dark);">🎉 恭喜完成！</div>
                    <div class="text-sm text-muted">总共用了 <span id="memory-final-moves">0</span> 步</div>
                </div>
            </div>
        `;

        // 绑定卡片点击事件
        const board = div.querySelector('#memory-board');
        board.addEventListener('click', (e) => {
            const card = e.target.closest('.memory-card');
            if (!card || this.memoryGame.locked) return;

            const index = parseInt(card.dataset.index);
            if (this.memoryGame.matched.includes(index) || this.memoryGame.flipped.includes(index)) return;

            // 翻转卡片
            this.flipCard(card, index);

            if (this.memoryGame.flipped.length === 2) {
                this.memoryGame.locked = true;
                this.memoryGame.moves++;
                div.querySelector('#memory-moves').textContent = this.memoryGame.moves;

                const [first, second] = this.memoryGame.flipped;
                if (this.memoryGame.cards[first] === this.memoryGame.cards[second]) {
                    // 匹配成功
                    this.memoryGame.matched.push(first, second);
                    this.memoryGame.flipped = [];
                    this.memoryGame.locked = false;
                    div.querySelector('#memory-matched').textContent = this.memoryGame.matched.length / 2;

                    // 检查是否全部完成
                    if (this.memoryGame.matched.length === this.memoryGame.cards.length) {
                        div.querySelector('#memory-result').style.display = 'block';
                        div.querySelector('#memory-final-moves').textContent = this.memoryGame.moves;
                    }
                } else {
                    // 匹配失败，翻回去
                    setTimeout(() => {
                        const firstCard = board.querySelector(`[data-index="${first}"]`);
                        const secondCard = board.querySelector(`[data-index="${second}"]`);
                        this.unflipCard(firstCard);
                        this.unflipCard(secondCard);
                        this.memoryGame.flipped = [];
                        this.memoryGame.locked = false;
                    }, 800);
                }
            }
        });

        // 重新开始按钮
        div.querySelector('#memory-restart').addEventListener('click', () => {
            this.render(document.getElementById('page-container'));
        });

        return div;
    }

    flipCard(card, index) {
        this.memoryGame.flipped.push(index);
        const question = card.querySelector('.memory-card-question');
        const back = card.querySelector('.memory-card-back');
        if (question) question.style.display = 'none';
        if (back) back.style.display = 'inline';
        card.style.background = 'linear-gradient(135deg, #E8F5E9, #C8E6C9)';
        card.style.transform = 'scale(1.05)';
    }

    unflipCard(card) {
        const question = card.querySelector('.memory-card-question');
        const back = card.querySelector('.memory-card-back');
        if (question) question.style.display = 'inline';
        if (back) back.style.display = 'none';
        card.style.background = 'linear-gradient(135deg, #A8C3A0, #8FA8B8)';
        card.style.transform = 'scale(1)';
    }

    getPlantEmoji(stage) {
        const emojis = { seed: '🌰', sprout: '🌱', seedling: '🌿', growing: '🪴', bud: '🌷', bloom: '🌸' };
        return emojis[stage] || '🌱';
    }

    getStageName(stage) {
        const names = { seed: '种子', sprout: '发芽', seedling: '幼苗', growing: '成长期', bud: '花苞', bloom: '开花' };
        return names[stage] || stage;
    }

    // === 身材管理 ===
    renderFitness() {
        const div = document.createElement('div');
        const todayStr = new Date().toISOString().split('T')[0];
        const exercise = this.app.storage.getExerciseForDate(todayStr);
        const diet = this.app.storage.getDietForDate(todayStr);
        const target = 300;
        const calories = exercise.calories || 0;
        const progress = Math.min(100, (calories / target) * 100);
        const completed = calories >= target;

        // 按餐次分组
        const meals = { breakfast: [], lunch: [], dinner: [], snack: [] };
        const mealNames = { breakfast: '🌅 早餐', lunch: '☀️ 午餐', dinner: '🌙 晚餐', snack: '🍪 加餐' };
        for (const item of diet.meals) {
            if (meals[item.meal]) {
                meals[item.meal].push(item);
            } else {
                meals.snack.push(item);
            }
        }

        div.innerHTML = `
            <!-- 运动卡片 -->
            <div class="card">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                    <span style="font-weight:600;">🏃 今日运动</span>
                    <span style="font-size:0.75rem;color:var(--text-muted);">
                        ${exercise.source === 'apple_health' ? '🍎 苹果健康同步' : '✏️ 手动记录'}
                    </span>
                </div>
                <div style="display:flex;align-items:baseline;gap:4px;margin-bottom:8px;">
                    <span style="font-size:2rem;font-weight:700;color:var(--accent-sage-dark);">${calories}</span>
                    <span style="font-size:0.9rem;color:var(--text-muted);">/ ${target} 大卡</span>
                    ${completed ? '<span style="font-size:0.75rem;background:var(--accent-sage-light);color:var(--accent-sage-dark);padding:2px 10px;border-radius:10px;margin-left:auto;">✅ 目标达成</span>' : ''}
                </div>
                <div style="height:10px;background:var(--bg-surface-alt);border-radius:5px;overflow:hidden;">
                    <div style="height:100%;width:${progress}%;background:linear-gradient(90deg,var(--accent-sage-light),var(--accent-sage));border-radius:5px;transition:width 0.5s;"></div>
                </div>
                <div style="font-size:0.8rem;color:var(--text-muted);margin-top:8px;">
                    ${exercise.steps > 0 ? `👟 ${exercise.steps} 步 · ` : ''}达到目标自动完成健身打卡，植物获得浇水💧
                </div>
            </div>

            <!-- 饮食总览 -->
            <div class="card">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                    <span style="font-weight:600;">🍽️ 今日饮食</span>
                    <button class="btn btn-primary btn-sm" id="add-food-btn">+ 添加食物</button>
                </div>
                <div style="display:flex;align-items:baseline;gap:4px;margin-bottom:12px;">
                    <span style="font-size:2rem;font-weight:700;color:var(--color-work);">${diet.totalCalories}</span>
                    <span style="font-size:0.9rem;color:var(--text-muted);">大卡</span>
                    <span style="font-size:0.8rem;color:var(--text-muted);margin-left:auto;">共 ${diet.meals.length} 项</span>
                </div>
            </div>

            <!-- 饮食记录列表 -->
            <div id="diet-meals-container"></div>
        `;

        // 渲染各餐次
        const mealsContainer = div.querySelector('#diet-meals-container');
        for (const [mealKey, mealItems] of Object.entries(meals)) {
            if (mealItems.length === 0) continue;
            const mealCard = document.createElement('div');
            mealCard.className = 'card';
            mealCard.innerHTML = `
                <div style="font-weight:600;margin-bottom:10px;">${mealNames[mealKey]}</div>
                <div style="display:flex;flex-direction:column;gap:8px;">
                    ${mealItems.map(item => `
                        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--bg-surface-alt);">
                            <div style="display:flex;align-items:center;gap:8px;">
                                <span style="font-size:1.2rem;">${item.emoji}</span>
                                <div>
                                    <div style="font-size:0.9rem;font-weight:500;">${item.foodName}</div>
                                    <div style="font-size:0.75rem;color:var(--text-muted);">${item.grams}g</div>
                                </div>
                            </div>
                            <div style="display:flex;align-items:center;gap:12px;">
                                <span style="font-size:0.85rem;font-weight:600;color:var(--color-work);">${item.calories} 大卡</span>
                                <button class="btn btn-sm" style="padding:4px 8px;min-height:28px;color:var(--overdue-red);" data-delete-id="${item.id}">✕</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            mealsContainer.appendChild(mealCard);

            // 绑定删除按钮
            mealCard.querySelectorAll('[data-delete-id]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const itemId = btn.dataset.deleteId;
                    this.app.storage.deleteDietItem(todayStr, itemId);
                    this.app.showToast('已删除');
                    // 重新渲染
                    const container = document.getElementById('page-container');
                    this.render(container);
                });
            });
        }

        // 空状态
        if (diet.meals.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'card';
            empty.style.cssText = 'text-align:center;padding:32px;';
            empty.innerHTML = `
                <div style="font-size:2.5rem;margin-bottom:8px;">🍽️</div>
                <div style="color:var(--text-muted);font-size:0.9rem;">还没有记录饮食，点击上方按钮添加</div>
            `;
            mealsContainer.appendChild(empty);
        }

        // 绑定添加食物按钮
        div.querySelector('#add-food-btn').addEventListener('click', () => {
            this.openFoodDrawer(todayStr);
        });

        return div;
    }

    // 打开添加食物的抽屉
    openFoodDrawer(todayStr) {
        let selectedFood = null;
        let selectedMeal = 'lunch';

        this.app.showDrawer({
            title: '🍽️ 添加食物',
            body: (drawer) => {
                const body = document.createElement('div');
                body.style.cssText = 'display:flex;flex-direction:column;gap:16px;';

                // 搜索框
                body.innerHTML = `
                    <div>
                        <label style="display:block;font-size:0.85rem;color:var(--text-secondary);margin-bottom:6px;">搜索食物</label>
                        <input type="text" class="input" id="food-search-input" placeholder="输入食物名称，如：米饭、鸡胸肉">
                    </div>
                    <div>
                        <label style="display:block;font-size:0.85rem;color:var(--text-secondary);margin-bottom:6px;">餐次</label>
                        <div style="display:flex;gap:8px;flex-wrap:wrap;">
                            ${[
                                { key: 'breakfast', label: '🌅 早餐' },
                                { key: 'lunch', label: '☀️ 午餐' },
                                { key: 'dinner', label: '🌙 晚餐' },
                                { key: 'snack', label: '🍪 加餐' },
                            ].map(m => `
                                <button class="btn btn-sm meal-btn" data-meal="${m.key}" style="${m.key === 'lunch' ? 'background:var(--accent-sage);color:white;' : ''}">${m.label}</button>
                            `).join('')}
                        </div>
                    </div>
                    <div id="food-list" style="max-height:300px;overflow-y:auto;display:flex;flex-direction:column;gap:6px;"></div>
                    <div id="selected-food-info" style="display:none;padding:12px;background:var(--bg-surface-alt);border-radius:12px;">
                        <div style="font-weight:600;margin-bottom:8px;">已选择</div>
                        <div id="selected-food-name"></div>
                        <div style="margin-top:8px;">
                            <label style="display:block;font-size:0.85rem;color:var(--text-secondary);margin-bottom:6px;">份量（克）</label>
                            <input type="number" class="input" id="food-grams-input" placeholder="输入克数，如：150" value="100">
                        </div>
                        <div id="food-calories-preview" style="margin-top:8px;font-size:0.9rem;color:var(--color-work);font-weight:600;"></div>
                    </div>
                `;

                const foodList = body.querySelector('#food-list');
                const searchInput = body.querySelector('#food-search-input');
                const selectedInfo = body.querySelector('#selected-food-info');
                const selectedName = body.querySelector('#selected-food-name');
                const gramsInput = body.querySelector('#food-grams-input');
                const caloriesPreview = body.querySelector('#food-calories-preview');

                // 渲染食物列表
                function renderFoodList(foods) {
                    foodList.innerHTML = foods.map(f => `
                        <div class="food-item" data-food-id="${f.id}" style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;background:var(--bg-surface);border-radius:10px;cursor:pointer;transition:background 0.2s;">
                            <div style="display:flex;align-items:center;gap:10px;">
                                <span style="font-size:1.3rem;">${f.emoji}</span>
                                <span style="font-size:0.9rem;">${f.name}</span>
                            </div>
                            <span style="font-size:0.75rem;color:var(--text-muted);">${f.kcal} 大卡/100g</span>
                        </div>
                    `).join('');

                    foodList.querySelectorAll('.food-item').forEach(item => {
                        item.addEventListener('click', () => {
                            const foodId = item.dataset.foodId;
                            selectedFood = FOOD_DATABASE.find(f => f.id === foodId);
                            selectedInfo.style.display = 'block';
                            selectedName.innerHTML = `<span style="font-size:1.2rem;">${selectedFood.emoji}</span> ${selectedFood.name} <span style="font-size:0.75rem;color:var(--text-muted);">${selectedFood.kcal}大卡/100g</span>`;
                            updateCaloriesPreview();
                            // 高亮选中
                            foodList.querySelectorAll('.food-item').forEach(i => i.style.background = 'var(--bg-surface)');
                            item.style.background = 'var(--accent-sage-light)';
                        });
                    });
                }

                function updateCaloriesPreview() {
                    if (!selectedFood) return;
                    const grams = parseInt(gramsInput.value) || 0;
                    const calories = Math.round((selectedFood.kcal * grams) / 100);
                    caloriesPreview.textContent = `≈ ${calories} 大卡`;
                }

                // 初始渲染全部食物
                renderFoodList(FOOD_DATABASE);

                // 搜索
                searchInput.addEventListener('input', () => {
                    const keyword = searchInput.value.trim();
                    renderFoodList(searchFoods(keyword));
                });

                // 餐次选择
                body.querySelectorAll('.meal-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        selectedMeal = btn.dataset.meal;
                        body.querySelectorAll('.meal-btn').forEach(b => {
                            b.style.background = '';
                            b.style.color = '';
                        });
                        btn.style.background = 'var(--accent-sage)';
                        btn.style.color = 'white';
                    });
                });

                // 克数变化
                gramsInput.addEventListener('input', updateCaloriesPreview);

                return body;
            },
            confirmText: '添加',
            onConfirm: () => {
                if (!selectedFood) {
                    this.app.showToast('请先选择食物', 'error');
                    return false;
                }
                const grams = parseInt(document.getElementById('food-grams-input')?.value) || 100;
                const calories = Math.round((selectedFood.kcal * grams) / 100);
                this.app.storage.addDietItem(todayStr, {
                    foodId: selectedFood.id,
                    foodName: selectedFood.name,
                    emoji: selectedFood.emoji,
                    grams,
                    calories,
                    meal: selectedMeal,
                });
                this.app.showToast(`已添加 ${selectedFood.name} ${grams}g（${calories}大卡）`);
                // 重新渲染
                const container = document.getElementById('page-container');
                this.render(container);
                return true;
            },
        });
    }
}
