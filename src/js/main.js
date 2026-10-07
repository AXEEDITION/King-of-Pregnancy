// 孕娘王者 - 主程序入口
// Main Entry: Game Flow Control

class GameController {
    constructor() {
        this.currentBattle = null;
        this.currentEnemy = null;
        this.lastEnemyId = null;       // 上一场的敌人, 避免连续重复
        this.enemiesDefeated = 0;
        this.playerCharacter = null;   // 战斗中为 battleCharacter 对象
        this.selectedBabies = [];
        this.usedCardIds = [];
        this.defeatedCharacters = [];
        this.isContinuing = false;
        this.needsNewEnemy = false;    // 同归于尽后, 续关要换新敌人
        this.phase = 'idle';           // idle | selection | battle | result
        this._drawing = false;         // 抽卡进行中, 防止重复触发
        this._defeatClickHandler = null;
    }

    // ==================== 启动 ====================
    start() {
        game.init();
        ui.updateCoins(game.state.coins);
        this.showIdleScreen();
    }

    showIdleScreen() {
        this.phase = 'idle';
        this.clearDefeatListener();
        this._roundBusy = false;
        ui.clearScreen();
        ui.setBattleButtonsEnabled(false);

        ui.showScreenMessage(`
            <h1>孕娘王者</h1>
            <p style="color:#fbbf24">点击投币口投币开始游戏</p>
            <p style="color:#888;font-size:0.7em">或点击"浏览卡牌"查看收藏</p>
        `);

        ui.disableConfirm('确认');
        ui.disableCancel('取消');
    }

    showWelcome() {
        this.showIdleScreen();
    }

    // 作弊/读档/卖卡后刷新当前画面
    refreshScreenState() {
        ui.updateCoins(game.state.coins);
    }

    // ==================== 作弊菜单 ====================
    showCheatMenu() {
        ui.showDialog('作弊菜单', [
            { text: '硬币', primary: true, callback: () => this.cheatCoinsMenu() },
            { text: '卡牌', callback: () => this.cheatCardsMenu() },
            { text: '战斗', callback: () => this.cheatBattleMenu() },
            { text: '显示/隐藏作弊键', callback: () => ui.toggleCheatMode() },
            { text: '关闭', callback: () => {} }
        ], false, true);
    }

    cheatResult(msg, backToMenu = true) {
        const buttons = [];
        if (backToMenu) buttons.push({ text: '继续作弊', primary: true, callback: () => this.showCheatMenu() });
        buttons.push({ text: '关闭', callback: () => {} });
        ui.showDialog(msg, buttons, false, true);
    }

    // ---- 硬币 ----
    cheatCoinsMenu() {
        ui.showDialog(`当前硬币：${game.state.coins}`, [
            { text: '+100', primary: true, callback: () => this.cheatAddCoins(100) },
            { text: '+1000', callback: () => this.cheatAddCoins(1000) },
            { text: '清零', callback: () => {
                game.state.coins = 0;
                game.state.lastCoinTime = Date.now();
                game.saveGame();
                ui.updateCoins(0);
                this.cheatResult('硬币已清零');
            } },
            { text: '返回', callback: () => this.showCheatMenu() }
        ], false, true);
    }

    cheatAddCoins(n) {
        game.state.coins += n;
        game.state.lastCoinTime = Date.now();
        game.saveGame();
        ui.updateCoins(game.state.coins);
        this.cheatResult(`已添加 ${n} 硬币（当前 ${game.state.coins}）`);
    }

    // ---- 卡牌 ----
    cheatCardsMenu() {
        const owned = game.getOwnedCards();
        ui.showDialog(
            `当前拥有 ${owned.length} 种卡牌\n角色卡 ${Object.keys(CHARACTERS).length} 种 / 孕娘英灵卡 ${Object.keys(SPIRITS).length} 种`,
            [
                { text: '全角色卡', primary: true, callback: () => this.cheatGrant('character') },
                { text: '全英灵卡', callback: () => this.cheatGrant('spirit') },
                { text: '全部图鉴', callback: () => this.cheatGrant('all') },
                { text: '每种×5', callback: () => this.cheatGrant('all', 5) },
                { text: '清空卡牌', callback: () => {
                    game.state.ownedCards = [];
                    game.saveGame();
                    this.cheatResult('卡牌已全部清空');
                } },
                { text: '返回', callback: () => this.showCheatMenu() }
            ], false, true
        );
    }

    cheatGrant(kind, countEach = 1) {
        let list;
        if (kind === 'character') list = Object.values(CHARACTERS);
        else if (kind === 'spirit') list = Object.values(SPIRITS);
        else list = [...Object.values(CHARACTERS), ...Object.values(SPIRITS)];

        list.forEach(card => {
            const owned = game.state.ownedCards.find(c => c.cardId === card.id);
            if (owned) owned.count += countEach;
            else game.state.ownedCards.push({ cardId: card.id, count: countEach });
        });
        game.saveGame();
        this.refreshScreenState();
        this.cheatResult(`已发放 ${list.length} 种卡牌（每种 ${countEach} 张）`);
    }

    // ---- 战斗 ----
    cheatBattleMenu() {
        const inBattle = this.phase === 'battle' && this.currentBattle;
        const info = inBattle
            ? `第 ${this.enemiesDefeated + 1} / ${GAME_CONFIG.enemiesPerRound} 场\n我方 ${this.playerCharacter.currentHealth}/${this.playerCharacter.maxHealth}　对手 ${this.currentEnemy.currentHealth}/${this.currentEnemy.maxHealth}`
            : '当前不在战斗中';
        ui.showDialog(info, [
            { text: '我方回满血', primary: true, callback: () => this.cheatHeal() },
            { text: '秒杀对手', callback: () => this.cheatKillEnemy() },
            { text: '直接通关', callback: () => this.cheatInstantWin() },
            { text: '返回', callback: () => this.showCheatMenu() }
        ], false, true);
    }

    cheatHeal() {
        if (this.phase !== 'battle' || !this.playerCharacter) {
            this.cheatResult('当前不在战斗中');
            return;
        }
        this.playerCharacter.currentHealth = this.playerCharacter.maxHealth;
        ui.updateHealth('player', this.playerCharacter);
        this.cheatResult('我方血量已回满');
    }

    cheatKillEnemy() {
        if (this.phase !== 'battle' || !this.currentEnemy || !this.currentBattle) {
            this.cheatResult('当前不在战斗中');
            return;
        }
        this.currentEnemy.currentHealth = 0;
        ui.updateHealth('enemy', this.currentEnemy);
        this.endBattle();
    }

    cheatInstantWin() {
        this.enemiesDefeated = GAME_CONFIG.enemiesPerRound;
        this.victoryScreen();
    }

    // ==================== 浏览卡牌 ====================
    openCardBrowser() {
        ui.showCardBrowser(() => this.restoreScreen());
    }

    restoreScreen() {
        if (this.phase === 'battle' && this.currentBattle && this.playerCharacter && this.currentEnemy) {
            ui.showBattleScreen(this.playerCharacter, this.currentEnemy, this.battleBg, this.roundInfo());
            ui.clearButtonHighlight();
            ui.setBattleButtonsEnabled(true);
            this.setupBattleControls();
            return;
        }
        if (this.phase === 'selection') {
            this.showCardSelectionList();
            return;
        }
        this.showIdleScreen();
    }

    afterLoad() {
        this.phase = 'idle';
        this.clearDefeatListener();
        this._roundBusy = false;
        this.currentBattle = null;
        this.currentEnemy = null;
        this.lastEnemyId = null;
        game.resetBattleBackgroundBag();
        this.playerCharacter = null;
        this.selectedBabies = [];
        this.usedCardIds = [];
        this.enemiesDefeated = 0;
        this.isContinuing = false;
        this.needsNewEnemy = false;
        this._drawing = false;
        ui.updateCoins(game.state.coins);
        this.showIdleScreen();
    }

    // ==================== 抽卡(带重复触发保护) ====================
    drawCardOnce(callback) {
        if (this._drawing) return false;
        this._drawing = true;
        const card = game.drawCard();
        ui.showCard(card, () => {
            this._drawing = false;
            if (callback) callback(card);
        });
        return true;
    }

    // ==================== 投币开始 ====================
    insertCoinAndStart() {
        if (this._drawing) return;
        if (this.phase !== 'idle') {
            ui.showDialog('游戏正在进行中。', [{ text: '确定', primary: true }]);
            return;
        }
        if (!game.insertCoin(GAME_CONFIG.coinToStart)) {
            ui.showDialog(`硬币不足！投币开始需要 ${GAME_CONFIG.coinToStart} 币。`, [{ text: '确定', primary: true }]);
            return;
        }

        ui.updateCoins(game.state.coins);
        this.isContinuing = false;
        this.usedCardIds = [];
        this.defeatedCharacters = [];
        this.enemiesDefeated = 0;
        this.lastEnemyId = null;
        game.resetBattleBackgroundBag();

        this.drawCardOnce(() => this.startCardSelection());
    }

    // ==================== 刷卡 ====================
    startCardSelection() {
        this.phase = 'selection';
        this.selectedBabies = [];
        this.playerCharacter = null;
        this.showCardSelectionList();
    }

    showCardSelectionList() {
        this.phase = 'selection';
        ui.setBattleButtonsEnabled(false);
        ui.showCardSelectionScreen(
            game.getOwnedCards(),
            this.usedCardIds,
            (card) => this.onCardThumbnailClick(card),
            () => this.finishCardSelection()
        );
    }

    onCardThumbnailClick(card) {
        if (this.usedCardIds.includes(card.id)) return;

        if (card.type === 'character' && this.playerCharacter) {
            ui.showDialog('只能刷取一张角色卡！', [{ text: '确定', primary: true }]);
            return;
        }

        ui.showCardDetail(
            card,
            () => this.onCardSwipe(card),
            () => this.showCardSelectionList()
        );
    }

    onCardSwipe(card) {
        if (card.type === 'character') this.playerCharacter = card;
        else this.selectedBabies.push(card);

        if (!this.usedCardIds.includes(card.id)) this.usedCardIds.push(card.id);
        this.showCardSelectionList();
    }

    finishCardSelection() {
        if (!this.playerCharacter) {
            ui.showDialog(TEXTS.tutorial.noCharacter, [
                {
                    text: '使用默认角色',
                    primary: true,
                    callback: () => {
                        this.playerCharacter = CHARACTERS.character_default;
                        this.startBattle(this.isContinuing);
                    }
                },
                { text: '返回', callback: () => this.showCardSelectionList() }
            ]);
            return;
        }
        this.startBattle(this.isContinuing);
    }

    // ==================== 战斗 ====================
    startBattle(isContinue = false) {
        this.phase = 'battle';
        this.clearDefeatListener();
        this._roundBusy = false;

        const isPregnant = this.selectedBabies.length > 0;
        this.playerCharacter = game.createBattleCharacter(
            this.playerCharacter,
            this.selectedBabies,
            isPregnant
        );

        if (!isContinue) {
            this.enemiesDefeated = 0;
            this.generateNextEnemy();
            return;
        }

        // 续关: 若敌方已阵亡(含同归于尽)则换新敌人, 否则保持其残血状态
        const enemyDead = this.needsNewEnemy ||
            !this.currentEnemy ||
            this.currentEnemy.currentHealth <= 0;

        if (enemyDead) {
            this.needsNewEnemy = false;
            this.generateNextEnemy();
        } else {
            this.currentBattle = new Battle(this.playerCharacter, this.currentEnemy);
            ui.showBattleScreen(this.playerCharacter, this.currentEnemy, this.battleBg, this.roundInfo());
            ui.clearButtonHighlight();
            ui.setBattleButtonsEnabled(true);
            this.setupBattleControls();
        }
    }

    // 当前场次(第 N / 5 场)
    roundInfo() {
        return {
            current: Math.min(this.enemiesDefeated + 1, GAME_CONFIG.enemiesPerRound),
            total: GAME_CONFIG.enemiesPerRound
        };
    }

    generateNextEnemy() {
        // 自己声明阶段, 不依赖调用方 —— 否则战斗中断打开卡牌收藏再关闭会回到错误界面
        this.phase = 'battle';
        this.clearDefeatListener();
        this._roundBusy = false;

        const myId = this.playerCharacter ? this.playerCharacter.id : null;
        // 避开我方角色 与 上一场的敌人
        this.currentEnemy = game.generateEnemy(this.enemiesDefeated + 1, [myId, this.lastEnemyId]);
        this.lastEnemyId = this.currentEnemy.id;

        // 每场随机换背景
        this.battleBg = game.randomBattleBackground();

        this.currentBattle = new Battle(this.playerCharacter, this.currentEnemy);
        ui.showBattleScreen(this.playerCharacter, this.currentEnemy, this.battleBg, this.roundInfo());
        ui.clearButtonHighlight();
        ui.setBattleButtonsEnabled(true);
        this.setupBattleControls();
    }

    setupBattleControls() {
        document.querySelectorAll('#controls .game-button').forEach(btn => {
            btn.onclick = () => {
                if (this.phase !== 'battle' || !this.currentBattle) return;
                this.currentBattle.setPlayerChoice(btn.dataset.action);
                ui.highlightButton(btn.dataset.action);
            };
        });
        ui.setConfirm('确认', () => this.executeRound());
        ui.disableCancel('取消');
    }

    executeRound() {
        if (this.phase !== 'battle') return;
        if (this._roundBusy) return;        // 特效播放中, 拒绝重复触发
        if (!this.currentBattle || !this.currentBattle.playerChoice) {
            ui.showDialog('请先选择石头、剪刀或布！', [{ text: '确定', primary: true }]);
            return;
        }

        const result = this.currentBattle.executeRound();
        ui.clearButtonHighlight();

        // 任何一方受到伤害都播放攻击特效, 特效结束后再弹回合结算
        const hits = [];
        if (result.playerDamage > 0) hits.push({ side: 'player', damage: result.playerDamage });
        if (result.enemyDamage > 0) hits.push({ side: 'enemy', damage: result.enemyDamage });

        const settle = () => {
            ui.updateHealth('player', this.playerCharacter);
            ui.updateHealth('enemy', this.currentEnemy);
            this._roundBusy = false;
            ui.showRoundResult(result, () => {
                if (this.currentBattle.isOver()) this.endBattle();
            });
        };

        if (hits.length > 0) {
            this._roundBusy = true;
            ui.playHitEffects(hits);
            setTimeout(settle, 430);
        } else {
            settle();
        }
    }

    endBattle() {
        const playerDead = this.playerCharacter.currentHealth <= 0;
        const enemyDead = this.currentEnemy.currentHealth <= 0;

        // 敌方阵亡就算过关(含同归于尽)
        if (enemyDead) {
            this.enemiesDefeated++;

            // 打完最后一场 -> 直接判定游戏成功, 不再询问是否续关
            if (this.enemiesDefeated >= GAME_CONFIG.enemiesPerRound) {
                this.victoryScreen();
                return;
            }

            // 同归于尽: 玩家也算战败, 但下一场必须换新敌人(不留 0 血对手)
            if (playerDead) {
                this.needsNewEnemy = true;
                this.defeatScreen();
                return;
            }

            ui.showDialog(
                `击败对手 ${this.enemiesDefeated} / ${GAME_CONFIG.enemiesPerRound}！`,
                [{ text: '继续', primary: true, callback: () => this.generateNextEnemy() }]
            );
            return;
        }

        this.defeatScreen();
    }

    // ==================== 胜利(文案在屏幕内) ====================
    victoryScreen() {
        this.phase = 'result';
        this.clearDefeatListener();
        this._roundBusy = false;
        ui.setBattleButtonsEnabled(false);

        ui.showScreenMessage(`
            <h2 style="color:#fbbf24">你真厉害！你打赢了所有对手！</h2>
            <p>投币领取你的奖励吧！</p>
        `);

        ui.setConfirm('投币领奖', () => {
            if (!game.insertCoin(GAME_CONFIG.coinForBonus)) {
                this.showRewardScreen(false);
                return;
            }
            ui.updateCoins(game.state.coins);
            this.drawCardOnce(() => this.showRewardScreen(true));
        });
        ui.setCancel('不投币', () => this.endGame(false));
    }

    // 领奖结果也放在屏幕内, 不用对话框
    showRewardScreen(gotCard) {
        this.phase = 'result';
        ui.setBattleButtonsEnabled(false);

        ui.showScreenMessage(gotCard
            ? `<h2 style="color:#fbbf24">领取你的卡牌</h2><p>欢迎下次再来玩哦！</p>`
            : `<h2 style="color:#fbbf24">硬币不足</h2><p>真遗憾！下次也要来玩哦！</p>`
        );

        ui.setConfirm('返回主界面', () => {
            this.currentBattle = null;
            this.currentEnemy = null;
            this.playerCharacter = null;
            this.selectedBabies = [];
            this.usedCardIds = [];
            this.isContinuing = false;
            this.showIdleScreen();
        });
        ui.disableCancel('取消');
    }

    // ==================== 战败 ====================
    // 第一段: 点击任意区域(含屏幕外)继续; 第二段: 选择续关/放弃
    defeatScreen() {
        this.phase = 'result';
        ui.setBattleButtonsEnabled(false);
        this.renderDefeatStage1();
    }

    renderDefeatStage1() {
        ui.showScreenMessage(`
            <h2 style="color:#ef4444">你战败了!</h2>
            <p class="hint">（点击任意区域继续）</p>
        `, { imageSrc: game.getCharacterImage(this.playerCharacter, true), clickAnywhere: true });

        ui.setConfirm('继续', () => this.renderDefeatStage2());
        ui.disableCancel('放弃');

        // 点击屏幕外也能继续
        this.clearDefeatListener();
        this._roundBusy = false;
        this._defeatClickHandler = (e) => {
            // 对话框/抽卡浮层上的点击不触发
            if (document.getElementById('dialog-overlay').classList.contains('hidden') === false) return;
            if (document.getElementById('card-overlay').classList.contains('hidden') === false) return;
            // 顶栏按钮与机台圆键不触发
            if (e.target.closest && e.target.closest('#top-controls, #universal-confirm-btn, #universal-cancel-btn')) return;
            this.renderDefeatStage2();
        };
        document.addEventListener('click', this._defeatClickHandler, true);
    }

    renderDefeatStage2() {
        this.clearDefeatListener();
        this._roundBusy = false;

        ui.showScreenMessage(`
            <h2 style="color:#ef4444">你战败了!</h2>
            <p>是否续关？（花费 ${GAME_CONFIG.coinToContinue} 硬币）</p>
        `, { imageSrc: game.getCharacterImage(this.playerCharacter, true) });

        ui.setConfirm('续关', () => this.continueGame());
        ui.setCancel('放弃', () => this.endGame(false));
    }

    clearDefeatListener() {
        if (this._defeatClickHandler) {
            document.removeEventListener('click', this._defeatClickHandler, true);
            this._defeatClickHandler = null;
        }
    }

    // ==================== 续关 ====================
    continueGame() {
        if (this._drawing) return;

        if (!game.insertCoin(GAME_CONFIG.coinToContinue)) {
            ui.showDialog('硬币不足，无法续关。', [
                { text: '确定', primary: true, callback: () => this.endGame(false) }
            ]);
            return;
        }

        ui.updateCoins(game.state.coins);

        if (this.playerCharacter && this.playerCharacter.id) {
            this.defeatedCharacters.push(this.playerCharacter.id);
        }

        this.drawCardOnce(() => {
            this.isContinuing = true;          // 不清空 usedCardIds → 已用卡不可再刷
            this.playerCharacter = null;
            this.selectedBabies = [];
            this.phase = 'selection';
            this.showCardSelectionList();
        });
    }

    // ==================== 结束 ====================
    endGame(gotReward) {
        this.phase = 'idle';
        this.clearDefeatListener();
        this._roundBusy = false;
        ui.setBattleButtonsEnabled(false);

        ui.showScreenMessage(`
            <h2 style="color:#fbbf24">${gotReward ? '领取你的卡牌' : '真遗憾！'}</h2>
            <p>${gotReward ? '欢迎下次再来玩哦！' : '下次也要来玩哦！'}</p>
        `);

        ui.setConfirm('返回主界面', () => {
            this.currentBattle = null;
            this.currentEnemy = null;
            this.lastEnemyId = null;
            this.playerCharacter = null;
            this.selectedBabies = [];
            this.usedCardIds = [];
            this.isContinuing = false;
            this.showIdleScreen();
        });
        ui.disableCancel('取消');
    }
}

// ==================== 手机/全屏适配 ====================
// 1) 首次触摸时尝试请求全屏并锁定横屏(浏览器要求必须由用户手势触发)
// 2) 双击不缩放
function setupMobileSupport() {
    const tryLock = async () => {
        try {
            if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
            }
            if (screen.orientation && screen.orientation.lock) {
                await screen.orientation.lock('landscape');
            }
        } catch (e) {
            // 桌面浏览器 / iOS Safari 不支持, 忽略即可(竖屏时会显示"请横屏"提示)
        }
    };
    document.addEventListener('touchstart', function once() {
        document.removeEventListener('touchstart', once);
        tryLock();
    }, { once: true });
}

// ==================== 启动 ====================
window.addEventListener('DOMContentLoaded', () => {
    const controller = new GameController();
    window.gameController = controller;
    controller.start();
    setupMobileSupport();
});
