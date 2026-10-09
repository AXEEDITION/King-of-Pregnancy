// 孕娘王者 - 游戏核心逻辑
// Game Core Logic: State Management, Save/Load, Card System

// 敌人强度 = 抽到的角色自带数值 + 真实抽到的英灵卡加成, 与玩家同一套规则, 不写死任何缩放系数。
// 难度靠两个旋钮:
//   1) 英灵卡数量逐场增加
//   2) 越往后越容易抽到高稀有度英灵卡(卡本身仍是真抽, 只是"装备更好")
const ENEMY_SPIRIT_COUNT = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 5 };

// 逐场开放的稀有度 —— 高级角色不会在第 1 战就跳出来虐人:
//   普通: 全程
//   稀有: 第 2 场起
//   史诗: 第 3 场起
//   传说: 第 4 场起
// 档位之内仍然全随机, 所以同一场也不会总是同一个人。
const ENEMY_RARITY_TIERS = {
    1: ['common'],
    2: ['common', 'rare'],
    3: ['common', 'rare', 'epic'],
    4: ['common', 'rare', 'epic', 'legendary'],
    5: ['common', 'rare', 'epic', 'legendary'],
};

const ENEMY_SPIRIT_WEIGHT = {
    1: { common: 1.00, rare: 0.40, epic: 0.12, legendary: 0.03 },
    2: { common: 1.00, rare: 0.65, epic: 0.24, legendary: 0.08 },
    3: { common: 1.00, rare: 0.95, epic: 0.42, legendary: 0.16 },
    4: { common: 1.00, rare: 1.30, epic: 0.68, legendary: 0.28 },
    5: { common: 1.00, rare: 1.75, epic: 1.00, legendary: 0.48 },
};

class Game {
    constructor() {
        this.state = this.freshState();
        this.currentSlot = 1;
        this.loadGame();
    }

    freshState() {
        return {
            coins: 0,
            tutorialCompleted: false,
            firstPlayTime: null,
            lastPlayTime: null,
            lastCoinTime: null,      // 上次结算自动产币的时间点
            ownedCards: [],
            currentSession: null,
            cheatEnabled: false      // 作弊键是否显示(默认隐藏, 由机台按键序列切换)
        };
    }

    // ==================== 初始化 ====================
    init() {
        if (!this.state.firstPlayTime) {
            this.state.firstPlayTime = Date.now();
            this.state.coins = GAME_CONFIG.initialCoins;
            this.state.lastCoinTime = Date.now();
        }
        if (!this.state.lastCoinTime) {
            this.state.lastCoinTime = Date.now();
        }
        this.updateCoins();
        this.saveGame();
    }

    // 自动产币: 只按"距上次结算经过的完整周期"增量发放,
    // 不再从零重算 —— 否则会把存档里的硬币冲掉
    updateCoins() {
        if (!this.state.lastCoinTime) {
            this.state.lastCoinTime = Date.now();
            return;
        }
        const intervalMs = GAME_CONFIG.intervalMinutes * 60 * 1000;
        const elapsed = Date.now() - this.state.lastCoinTime;
        const intervals = Math.floor(elapsed / intervalMs);

        if (intervals > 0) {
            this.state.coins += intervals * GAME_CONFIG.coinsPerInterval;
            this.state.lastCoinTime += intervals * intervalMs;
        }
        this.state.lastPlayTime = Date.now();
    }

    // ==================== 存档 ====================
    saveKey(slot) {
        return `pregnant_queens_save_slot${slot}`;
    }

    saveGame(slot) {
        if (slot !== undefined) this.currentSlot = slot;
        try {
            localStorage.setItem(this.saveKey(this.currentSlot), JSON.stringify(this.state));
            return true;
        } catch (e) {
            console.error('保存失败:', e);
            return false;
        }
    }

    loadGame(slot) {
        if (slot !== undefined) this.currentSlot = slot;
        try {
            const saved = localStorage.getItem(this.saveKey(this.currentSlot));
            if (!saved) return false;
            const data = JSON.parse(saved);
            // 用默认值补齐旧存档缺失的字段
            this.state = Object.assign(this.freshState(), data);
            return true;
        } catch (e) {
            console.error('读取存档失败:', e);
            return false;
        }
    }

    getSaveInfo(slot) {
        try {
            const saved = localStorage.getItem(this.saveKey(slot));
            if (!saved) return { exists: false };
            const data = JSON.parse(saved);
            return {
                exists: true,
                coins: data.coins || 0,
                cards: (data.ownedCards || []).length,
                lastTime: data.lastPlayTime
                    ? new Date(data.lastPlayTime).toLocaleString('zh-CN')
                    : '未知'
            };
        } catch (e) {
            return { exists: false };
        }
    }

    // ==================== 存档导出 / 导入 ====================
    // 用途: 备份到文件、换设备/换浏览器、清理浏览器数据后恢复。
    // (游戏本身每次操作都会自动存档, 所以"存档/读档"按钮的日常意义不大,
    //  真正有用的是把进度导出成一个能带走、能留底的文件。)
    exportSaveData() {
        const slots = {};
        for (let i = 1; i <= 3; i++) {
            try {
                const raw = localStorage.getItem(this.saveKey(i));
                if (raw) slots[i] = JSON.parse(raw);
            } catch (e) { /* 坏档跳过 */ }
        }
        return {
            _format: 'pregnant-queens-save',
            _version: 1,
            _exportedAt: new Date().toISOString(),
            currentSlot: this.currentSlot,
            current: this.state,
            slots: slots,
        };
    }

    // 返回 { ok, msg }
    importSaveData(obj) {
        if (!obj || typeof obj !== 'object') return { ok: false, msg: '文件内容不是有效的存档格式。' };
        if (obj._format !== 'pregnant-queens-save') {
            return { ok: false, msg: '这不是「孕娘王者」的存档文件。' };
        }
        if (!obj.current || typeof obj.current !== 'object') {
            return { ok: false, msg: '存档里没有找到游戏进度数据。' };
        }

        try {
            // 槽位: 有就覆盖, 没有就保留原样(不清空)
            const slots = obj.slots || {};
            let slotCount = 0;
            for (let i = 1; i <= 3; i++) {
                if (slots[i]) {
                    localStorage.setItem(this.saveKey(i), JSON.stringify(slots[i]));
                    slotCount++;
                }
            }
            // 当前进度
            const slot = Number.isInteger(obj.currentSlot) ? obj.currentSlot : this.currentSlot;
            this.currentSlot = slot;
            localStorage.setItem(this.saveKey(slot), JSON.stringify(obj.current));
            if (slotCount === 0) slotCount = 1;

            this.state = Object.assign(this.freshState(), obj.current);
            return { ok: true, msg: `导入成功：硬币 ${this.state.coins}，卡牌 ${(this.state.ownedCards || []).length} 种，存档槽位 ${slotCount} 个。` };
        } catch (e) {
            return { ok: false, msg: '写入存档失败：' + (e && e.message ? e.message : e) };
        }
    }

    resetGame() {
        for (let i = 1; i <= 3; i++) {
            localStorage.removeItem(this.saveKey(i));
        }
        localStorage.removeItem('pregnant_queens_save');
        location.reload();
    }

    // ==================== 硬币 ====================
    insertCoin(amount = 1) {
        if (this.state.coins >= amount) {
            this.state.coins -= amount;
            this.saveGame();
            return true;
        }
        return false;
    }

    // ==================== 抽卡 ====================
    drawCard() {
        const card = Math.random() < 0.5 ? this.drawCharacter() : this.drawSpirit();
        this.addCard(card);
        return card;
    }

    drawCharacter() {
        const list = Object.values(CHARACTERS);
        const picked = this.weightedPick(list, c => RARITY_CONFIG[c.rarity].probability);
        return picked;
    }

    drawSpirit() {
        const list = Object.values(SPIRITS);
        return this.weightedPick(list, b => RARITY_CONFIG[b.rarity].probability);
    }

    weightedPick(list, weightFn) {
        const weights = list.map(weightFn);
        const total = weights.reduce((s, w) => s + w, 0);
        let r = Math.random() * total;
        for (let i = 0; i < list.length; i++) {
            r -= weights[i];
            if (r <= 0) return list[i];
        }
        return list[list.length - 1];
    }

    addCard(card) {
        const existing = this.state.ownedCards.find(c => c.cardId === card.id);
        if (existing) {
            existing.count++;
        } else {
            this.state.ownedCards.push({ cardId: card.id, count: 1 });
        }
        this.saveGame();
    }

    // 拥有卡牌: 先按稀有度(普通->传说), 再按卡牌自带 order 编号排序
    // (order 与卡名无关, 改中文名不影响排序)
    getOwnedCards() {
        return this.state.ownedCards
            .map(owned => {
                const card = CHARACTERS[owned.cardId] || SPIRITS[owned.cardId];
                if (!card) return null;
                return Object.assign({}, card, { count: owned.count });
            })
            .filter(Boolean)
            .sort(compareCards);
    }

    // 出卖卡牌: 返回获得的硬币数(0 表示失败)
    sellCard(cardId, count = 1) {
        const owned = this.state.ownedCards.find(c => c.cardId === cardId);
        if (!owned || owned.count <= 0) return 0;

        const card = CHARACTERS[cardId] || SPIRITS[cardId];
        if (!card) return 0;

        const n = Math.max(1, Math.min(count, owned.count));
        owned.count -= n;
        if (owned.count <= 0) {
            this.state.ownedCards = this.state.ownedCards.filter(c => c.cardId !== cardId);
        }

        const gain = n * RARITY_CONFIG[card.rarity].sellPrice;
        this.state.coins += gain;
        this.saveGame();
        return gain;
    }

    // ==================== 战斗角色 ====================
    // statsOverride: 敌人用, 传入按场次缩放后的数值, 代替角色自带数值
    createBattleCharacter(character, spirits = [], isPregnant = false, statsOverride = null) {
        // 四项先给 0 兜底: 万一 character.stats 缺失, `undefined += 数字` 会
        // 让整条数值链变成 NaN, 然后扩散到血条和所有战斗计算里。
        const finalStats = Object.assign(
            { heavyAttack: 0, rushAttack: 0, defense: 0, health: 0 },
            statsOverride || character.stats || {}
        );

        spirits.forEach(spirit => {
            const b = (spirit && spirit.bonusStats) || {};
            finalStats.heavyAttack += b.heavyAttack || 0;
            finalStats.rushAttack += b.rushAttack || 0;
            finalStats.defense += b.defense || 0;
            finalStats.health += b.health || 0;
        });

        // 最后再扫一遍: 任何非有限数字一律归零, 血量至少 1
        // (血量为 0 会让血条百分比变成 Infinity/NaN)
        ['heavyAttack', 'rushAttack', 'defense', 'health'].forEach(k => {
            if (!Number.isFinite(finalStats[k])) finalStats[k] = 0;
        });
        if (finalStats.health < 1) finalStats.health = 1;

        return {
            id: character.id,
            name: character.name,
            baseCharacter: character,
            appliedSpirits: spirits,
            finalStats: finalStats,
            currentHealth: finalStats.health,
            maxHealth: finalStats.health,
            isPregnant: isPregnant,
            images: character.images
        };
    }

    // ==================== 敌人生成 ====================
    // difficulty: 第几场(从1开始)。excludeIds: 不希望抽到的角色id(我方角色/上一场敌人)
    generateEnemy(difficulty = 1, excludeIds = []) {
        const allChars = Object.values(CHARACTERS);

        // 在本场开放的稀有度档位内全随机 —— 既不出现"第 1 战就撞传说",
        // 也不会像早期那样后期只剩 2~3 张卡可选、每局都是同一个人。
        const tiers = ENEMY_RARITY_TIERS[Math.min(Math.max(difficulty, 1), 5)] || ['common'];
        let pool = allChars.filter(c => tiers.includes(c.rarity));
        if (pool.length === 0) pool = allChars.slice();

        // 尽量避开我方角色 与 上一场的敌人, 避免"又是同一个"
        const avoid = [].concat(excludeIds).filter(Boolean);
        const distinct = pool.filter(c => !avoid.includes(c.id));
        if (distinct.length > 0) pool = distinct;

        const character = pool[Math.floor(Math.random() * pool.length)];

        // 英灵数量随难度递增: 第1场 0 张(热身), 之后 1/2/3/4 张
        // 同一敌人不重复带同一张英灵卡
        const d = Math.min(Math.max(difficulty, 1), 5);
        const spiritCount = ENEMY_SPIRIT_COUNT[d] ?? 0;
        const tierWeight = ENEMY_SPIRIT_WEIGHT[d] || ENEMY_SPIRIT_WEIGHT[1];

        // 按稀有度加权、无放回地抽 —— 抽出来的都是真实的英灵卡
        const bag = Object.values(SPIRITS).slice();
        const enemySpirits = [];
        for (let i = 0; i < spiritCount && bag.length > 0; i++) {
            const weights = bag.map(s => tierWeight[s.rarity] ?? 1);
            const total = weights.reduce((a, b) => a + b, 0);
            let r = Math.random() * total;
            let idx = bag.length - 1;
            for (let k = 0; k < bag.length; k++) {
                r -= weights[k];
                if (r <= 0) { idx = k; break; }
            }
            enemySpirits.push(bag.splice(idx, 1)[0]);
        }

        // 怀孕与否 = 是否带英灵卡, 与玩家侧规则一致:
        // 不带英灵卡 -> 未孕立绘; 带英灵卡 -> 怀孕立绘(显示孕肚)
        const isPregnant = enemySpirits.length > 0;
        // 与玩家完全同一套组装方式: 角色自带数值 + 真实抽到的英灵卡加成
        // (不写死任何缩放系数 —— 敌人强不强, 取决于它真的抽到了谁、抽到了什么卡)
        return this.createBattleCharacter(character, enemySpirits, isPregnant);
    }

    // 随机取一张战斗背景
    // 不重复抽背景: 把全部背景洗牌成"袋", 抽一张少一张, 抽完再重新洗。
    // 一局 5 场战斗、10 张背景 -> 同一局内绝不会撞背景。
    randomBattleBackground() {
        const list = GAME_CONFIG.battleBackgrounds || [];
        if (list.length === 0) return '';

        if (!this._bgBag || this._bgBag.length === 0) {
            this._bgBag = list.slice();
            for (let i = this._bgBag.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [this._bgBag[i], this._bgBag[j]] = [this._bgBag[j], this._bgBag[i]];
            }
        }
        return this._bgBag.pop();
    }

    // 开新一局时重置背景袋
    resetBattleBackgroundBag() {
        this._bgBag = null;
    }

    // ==================== 立绘 ====================
    getCharacterImage(battleCharacter, isDefeated = false) {
        if (!battleCharacter || !battleCharacter.images) return '';

        const statePrefix = battleCharacter.isPregnant ? 'pregnant' : 'normal';
        const images = battleCharacter.images[statePrefix] || battleCharacter.images.normal;
        if (!images) return '';

        if (isDefeated) return images.defeated || images.naked || images.full || '';

        const ratio = battleCharacter.maxHealth > 0
            ? battleCharacter.currentHealth / battleCharacter.maxHealth
            : 0;

        if (ratio > GAME_CONFIG.damagedThreshold) return images.full || '';
        if (ratio > GAME_CONFIG.nakedThreshold) return images.damaged || images.full || '';
        return images.naked || images.damaged || images.full || '';
    }
}

// 全局游戏实例
const game = new Game();
