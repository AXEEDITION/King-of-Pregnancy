// 孕娘王者 - UI控制系统
// UI Control: Screen Management, Dialogs, Card Display

class UI {
    constructor() {
        this.screenContent = document.getElementById('screen-content');
        this.dialogOverlay = document.getElementById('dialog-overlay');
        this.dialogText = document.getElementById('dialog-text');
        this.dialogExtra = document.getElementById('dialog-extra');
        this.dialogButtons = document.getElementById('dialog-buttons');
        this.cardOverlay = document.getElementById('card-overlay');
        this.cardImageEl = document.getElementById('card-image');
        this.cardGlow = document.getElementById('card-glow');
        this.coinCount = document.getElementById('coin-count');
        this.controls = document.getElementById('controls');
        this.confirmBtn = document.getElementById('universal-confirm-btn');
        this.cancelBtn = document.getElementById('universal-cancel-btn');

        this._cheatIdx = 0;   // 作弊序列输入进度

        this.setupButtons();
    }

    // ==================== 顶栏按钮 ====================
    setupButtons() {
        document.getElementById('save-btn').onclick = () => this.showSaveSlotDialog();
        document.getElementById('load-btn').onclick = () => this.showLoadSlotDialog();

        document.getElementById('reset-btn').onclick = () => {
            if (confirm('确定要重置游戏吗？所有存档槽位都会被清空。')) game.resetGame();
        };

        document.getElementById('cheat-btn').onclick = () => {
            if (window.gameController) window.gameController.showCheatMenu();
        };

        document.getElementById('browse-cards-btn').onclick = () => {
            if (window.gameController) window.gameController.openCardBrowser();
        };

        document.getElementById('coin-slot-clickable').onclick = () => this.onCoinSlotClick();

        // 出招键序列用于开关作弊模式(与出招逻辑无关, 任何阶段都计数)
        ['rock', 'scissors', 'paper'].forEach(action => {
            const btn = document.getElementById(`btn-${action}`);
            if (btn) btn.addEventListener('click', () => this.onCheatSequenceInput(action));
        });

        this.applyCheatVisibility();
    }

    // ==================== 作弊模式开关 ====================
    // 序列: 石头-布-剪刀-石头-剪刀-布-石头-布-剪刀
    // 即"顺时针一圈 -> 逆时针一圈 -> 顺时针一圈"
    onCheatSequenceInput(action) {
        const seq = ['rock', 'paper', 'scissors', 'rock', 'scissors', 'paper', 'rock', 'paper', 'scissors'];
        if (action === seq[this._cheatIdx]) {
            this._cheatIdx++;
            if (this._cheatIdx >= seq.length) {
                this._cheatIdx = 0;
                this.toggleCheatMode();
            }
        } else {
            // 错位时, 若当前这次正好等于序列开头则从 1 重新计数
            this._cheatIdx = (action === seq[0]) ? 1 : 0;
        }
    }

    toggleCheatMode() {
        game.state.cheatEnabled = !game.state.cheatEnabled;
        game.saveGame();
        this.applyCheatVisibility();
        this.showDialog(
            game.state.cheatEnabled
                ? '作弊模式已开启（按键已显示）'
                : '作弊模式已关闭（按键已隐藏）\n再次输入同一序列可重新开启',
            [{ text: '确定', primary: true }]
        );
    }

    applyCheatVisibility() {
        const btn = document.getElementById('cheat-btn');
        if (!btn) return;
        btn.classList.toggle('hidden', !game.state.cheatEnabled);
    }

    // ==================== 常驻圆键(位置尺寸永不变化) ====================
    // 有功能: 正常配色可点。无功能: 变灰不可点, 位置尺寸完全不变
    setConfirm(text, callback) {
        this.confirmBtn.textContent = text;
        this.confirmBtn.classList.remove('disabled');
        this.confirmBtn.onclick = callback;
    }

    disableConfirm(text = '确认') {
        this.confirmBtn.textContent = text;
        this.confirmBtn.classList.add('disabled');
        this.confirmBtn.onclick = null;
    }

    setCancel(text, callback) {
        this.cancelBtn.textContent = text;
        this.cancelBtn.classList.remove('disabled');
        this.cancelBtn.onclick = callback;
    }

    disableCancel(text = '取消') {
        this.cancelBtn.textContent = text;
        this.cancelBtn.classList.add('disabled');
        this.cancelBtn.onclick = null;
    }

    // 兼容旧调用名
    showUniversalButton(text, cb) { this.setConfirm(text, cb); }
    hideUniversalButton() { this.disableConfirm(); }
    showUniversalCancel(text, cb) { this.setCancel(text, cb); }
    hideUniversalCancel() { this.disableCancel(); }

    // ==================== 卡图工具 ====================
    // 角色卡一律用"正面卡图"(抽中/收藏/刷卡界面都用它)
    cardImage(card) {
        if (!card) return '';
        if (card.type === 'character') {
            const im = card.images || {};
            return im.card || (im.normal && im.normal.full) || '';
        }
        return card.image || '';
    }

    makeImg(src, className) {
        const img = document.createElement('img');
        img.src = src;
        if (className) img.className = className;
        img.onerror = () => {
            img.style.display = 'none';
            const ph = document.createElement('div');
            ph.className = 'img-missing';
            ph.textContent = '（图片缺失）';
            if (img.parentNode) img.parentNode.appendChild(ph);
        };
        return img;
    }

    // ==================== 存档 / 读档 ====================
    buildSlotText(title) {
        let t = title + '\n\n';
        for (let i = 1; i <= 3; i++) {
            const info = game.getSaveInfo(i);
            t += info.exists
                ? `槽位${i}：${info.coins}币 · ${info.cards}张卡 · ${info.lastTime}\n`
                : `槽位${i}：（空）\n`;
        }
        return t;
    }

    showSaveSlotDialog() {
        const buttons = [];
        for (let i = 1; i <= 3; i++) {
            buttons.push({
                text: `覆盖槽位${i}`,
                primary: i === 1,
                callback: () => {
                    if (game.saveGame(i)) this.showDialog(`已存档到槽位${i}。`, [{ text: '确定', primary: true }]);
                    else this.showDialog('存档失败！', [{ text: '确定', primary: true }]);
                }
            });
        }
        buttons.push({ text: '取消', callback: () => {} });
        this.showDialog(this.buildSlotText('选择存档槽位：'), buttons, false, true);
    }

    showLoadSlotDialog() {
        const avail = [];
        for (let i = 1; i <= 3; i++) if (game.getSaveInfo(i).exists) avail.push(i);

        if (avail.length === 0) {
            this.showDialog('没有可用的存档。', [{ text: '确定', primary: true }]);
            return;
        }

        const buttons = avail.map((i, idx) => ({
            text: `读取槽位${i}`,
            primary: idx === 0,
            callback: () => {
                if (game.loadGame(i)) {
                    game.saveGame(i);
                    this.updateCoins(game.state.coins);
                    if (window.gameController) window.gameController.afterLoad();
                    this.showDialog(`已从槽位${i}读档。`, [{ text: '确定', primary: true }]);
                } else {
                    this.showDialog('读档失败！', [{ text: '确定', primary: true }]);
                }
            }
        }));
        buttons.push({ text: '取消', callback: () => {} });
        this.showDialog(this.buildSlotText('选择读档槽位：'), buttons, false, true);
    }

    // ==================== 投币口 ====================
    onCoinSlotClick() {
        this.showDialog(
            `当前硬币：${game.state.coins}\n投币开始游戏需要 ${GAME_CONFIG.coinToStart} 币，是否投币？`,
            [
                {
                    text: '投币',
                    primary: true,
                    callback: () => { if (window.gameController) window.gameController.insertCoinAndStart(); }
                },
                { text: '取消', callback: () => {} }
            ],
            false, true
        );
    }

    // ==================== 卡牌收藏(浏览) ====================
    showCardBrowser(onClose) {
        this._browserOnClose = onClose || null;

        this.clearScreen();

        const wrap = document.createElement('div');
        wrap.className = 'screen-wrap';

        const scroll = document.createElement('div');
        scroll.className = 'screen-scroll';

        const title = document.createElement('h2');
        title.className = 'screen-title';
        title.textContent = '卡牌收藏';
        scroll.appendChild(title);

        const ownedCards = game.getOwnedCards();
        scroll.appendChild(this.buildCardSection('角色卡', '#ff6b9d', ownedCards.filter(c => c.type === 'character'), true));
        scroll.appendChild(this.buildCardSection('孕娘英灵卡', '#a855f7', ownedCards.filter(c => c.type === 'spirit'), true));

        wrap.appendChild(scroll);

        // 关闭键: 屏内按键(按用户要求不与机台圆键集成)
        const actions = document.createElement('div');
        actions.className = 'screen-actions';
        const closeBtn = document.createElement('button');
        closeBtn.className = 'screen-btn';
        closeBtn.textContent = '关闭';
        closeBtn.onclick = () => {
            if (onClose) onClose();
            else if (window.gameController) window.gameController.showIdleScreen();
        };
        actions.appendChild(closeBtn);
        wrap.appendChild(actions);

        this.screenContent.appendChild(wrap);

        // 机台圆键在浏览页无功能, 变灰常驻
        this.disableConfirm('确认');
        this.disableCancel('取消');
    }

    buildCardSection(heading, color, cards, showCount) {
        const section = document.createElement('div');

        const h = document.createElement('h3');
        h.className = 'section-title';
        h.style.color = color;
        h.textContent = `${heading}（${cards.length}）`;
        section.appendChild(h);

        if (cards.length === 0) {
            const note = document.createElement('p');
            note.className = 'empty-note';
            note.textContent = '暂无';
            section.appendChild(note);
            return section;
        }

        const grid = document.createElement('div');
        grid.className = 'card-grid';
        cards.forEach(card => grid.appendChild(this.createBrowserCardElement(card, showCount)));
        section.appendChild(grid);
        return section;
    }

    createBrowserCardElement(card, showCount) {
        const rarity = RARITY_CONFIG[card.rarity] || RARITY_CONFIG.common;

        const el = document.createElement('div');
        el.className = 'card-thumb';
        el.style.borderColor = rarity.color;
        el.style.backgroundImage = `url('${this.cardImage(card)}')`;

        const tag = document.createElement('div');
        tag.className = 'tag-name';
        tag.innerHTML =
            `<strong>${card.name}</strong>` +
            `<span class="tag-rarity" style="color:${rarity.color}">${rarity.name}</span>` +
            (showCount ? `<span class="tag-count">×${card.count}</span>` : '');
        el.appendChild(tag);

        el.onmouseenter = () => {
            el.style.transform = 'translateY(-4px)';
            el.style.boxShadow = `0 8px 22px ${rarity.color}`;
        };
        el.onmouseleave = () => { el.style.transform = 'none'; el.style.boxShadow = 'none'; };
        el.onclick = () => this.showCardBrowserDetail(card);

        return el;
    }

    showCardBrowserDetail(card) {
        // 卡已全部卖光 → 直接回到收藏列表
        const stillOwned = game.state.ownedCards.find(c => c.cardId === card.id);
        if (!stillOwned || stillOwned.count <= 0) {
            this.showCardBrowser(this._browserOnClose);
            return;
        }
        card = Object.assign({}, card, { count: stillOwned.count });

        this.clearScreen();

        const wrap = document.createElement('div');
        wrap.className = 'detail-wrap';
        wrap.appendChild(this.buildDetailLayout(card, { showCount: true, showSell: true }));

        // 屏内按键: 出卖 + 返回
        const actions = document.createElement('div');
        actions.className = 'screen-actions';

        const sellBtn = document.createElement('button');
        sellBtn.className = 'screen-btn';
        sellBtn.textContent = `出卖（${RARITY_CONFIG[card.rarity].sellPrice}币/张）`;
        sellBtn.onclick = () => this.showSellDialog(card, () => this.showCardBrowserDetail(card));
        actions.appendChild(sellBtn);

        const backBtn = document.createElement('button');
        backBtn.className = 'screen-btn';
        backBtn.textContent = '返回';
        backBtn.onclick = () => this.showCardBrowser(this._browserOnClose);
        actions.appendChild(backBtn);

        wrap.appendChild(actions);
        this.screenContent.appendChild(wrap);

        this.disableConfirm('确认');
        this.disableCancel('取消');
    }

    // ==================== 出卖卡牌 ====================
    // 文案: 要卖掉几张卡牌？（共 N 张） 下方输入数量, 再确认/取消
    showSellDialog(card, onDone) {
        const price = RARITY_CONFIG[card.rarity].sellPrice;
        const owned = game.state.ownedCards.find(c => c.cardId === card.id);
        const max = owned ? owned.count : 0;

        const input = document.createElement('input');
        input.className = 'dialog-input';
        input.type = 'number';
        input.min = '1';
        input.max = String(max);
        input.value = '1';

        const hint = document.createElement('div');
        hint.className = 'dialog-hint';
        hint.textContent = `单价 ${price} 币 · 全卖可获得 ${max * price} 币`;

        const holder = document.createElement('div');
        holder.appendChild(input);
        holder.appendChild(hint);

        this.showDialog(
            `要卖掉几张卡牌？（共 ${max} 张）`,
            [
                {
                    text: '确认',
                    primary: true,
                    callback: () => {
                        let n = parseInt(input.value, 10);
                        if (isNaN(n) || n < 1) n = 1;
                        if (n > max) n = max;
                        const gain = game.sellCard(card.id, n);
                        this.updateCoins(game.state.coins);
                        if (window.gameController) window.gameController.refreshScreenState();
                        this.showDialog(`已卖掉 ${n} 张「${card.name}」，获得 ${gain} 币。`, [
                            { text: '确定', primary: true, callback: onDone }
                        ]);
                    }
                },
                { text: '取消', callback: () => onDone && onDone() }
            ],
            false, false, holder
        );

        setTimeout(() => input.focus(), 60);
    }

    // ==================== 左图右文详情(浏览 / 刷卡共用) ====================
    buildDetailLayout(card, opts = {}) {
        const rarity = RARITY_CONFIG[card.rarity] || RARITY_CONFIG.common;

        const layout = document.createElement('div');
        layout.className = 'detail-layout';

        const left = document.createElement('div');
        left.className = 'detail-left';
        left.appendChild(this.makeImg(this.cardImage(card)));

        const right = document.createElement('div');
        right.className = 'detail-right';

        let html = `<h2>${card.name}</h2>`;
        html += `<p class="meta" style="color:${rarity.color}">稀有度：${rarity.name}</p>`;
        if (opts.showCount) {
            html += `<p class="meta" style="color:#10b981">拥有数量：×${card.count}</p>`;
        }
        if (opts.showSell) {
            html += `<p class="meta" style="color:var(--gold)">回收价：${rarity.sellPrice} 币 / 张</p>`;
        }

        if (card.type === 'character') {
            const s = card.stats;
            html += `<div class="stats">
                <p>⚔️ 重击：<strong>${s.heavyAttack}</strong></p>
                <p>⚡ 突袭：<strong>${s.rushAttack}</strong></p>
                <p>🛡️ 防御：<strong>${s.defense}</strong></p>
                <p>❤️ 健康：<strong>${s.health}</strong></p>
            </div>`;
        } else {
            const b = card.bonusStats;
            html += `<div class="stats">
                <p>⚔️ 重击加成：<strong>+${b.heavyAttack}</strong></p>
                <p>⚡ 突袭加成：<strong>+${b.rushAttack}</strong></p>
                <p>🛡️ 防御加成：<strong>+${b.defense}</strong></p>
                <p>❤️ 健康加成：<strong>+${b.health}</strong></p>
            </div>`;
        }
        right.innerHTML = html;

        layout.appendChild(left);
        layout.appendChild(right);
        return layout;
    }

    // ==================== 基础 ====================
    updateCoins(coins) {
        this.coinCount.textContent = coins;
    }

    clearScreen() {
        this.screenContent.innerHTML = '';
        this.screenContent.onclick = null;
        this.screenContent.style.cursor = 'default';
    }

    // ==================== 对话框 ====================
    showDialog(text, buttons = [], autoClose = false, clickOutsideToCancel = false, extraEl = null) {
        this.dialogText.textContent = text;
        this.dialogButtons.innerHTML = '';
        this.dialogExtra.innerHTML = '';
        if (extraEl) this.dialogExtra.appendChild(extraEl);

        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.className = 'dialog-btn' + (btn.primary ? ' primary' : '');
            button.textContent = btn.text;
            button.onclick = () => {
                this.hideDialog();
                if (btn.callback) btn.callback();
            };
            this.dialogButtons.appendChild(button);
        });

        this.dialogOverlay.classList.remove('hidden');

        if (autoClose && buttons.length === 0) {
            this.dialogOverlay.style.cursor = 'pointer';
            this.dialogOverlay.onclick = () => this.hideDialog();
            return;
        }

        if (clickOutsideToCancel) {
            this.dialogOverlay.style.cursor = 'pointer';
            this.dialogOverlay.onclick = (e) => {
                if (e.target === this.dialogOverlay) this.hideDialog();
            };
        }
    }

    hideDialog() {
        this.dialogOverlay.classList.add('hidden');
        this.dialogOverlay.onclick = null;
        this.dialogOverlay.style.cursor = 'default';
        this.dialogExtra.innerHTML = '';
    }

    // ==================== 抽卡展示 ====================
    showCard(card, callback) {
        this.cardImageEl.style.backgroundImage = `url('${this.cardDrawImage(card)}')`;
        this.cardGlow.className = '';
        this.cardGlow.classList.add(card.rarity);
        this.cardOverlay.classList.remove('hidden');

        this.cardOverlay.onclick = () => {
            this.hideCard();
            if (callback) callback();
        };
    }

    // 抽卡大图: 一律显示"正面卡图"(原图), 不显示差分
    cardDrawImage(card) {
        if (card.type === 'character') {
            return this.cardImage(card);
        }
        return card.image || '';
    }

    hideCard() {
        this.cardOverlay.classList.add('hidden');
        this.cardOverlay.onclick = null;
    }

    // ==================== 刷卡动画 ====================
    // 1. 卡面宽度 = 刷卡区(黑条)宽度
    // 2. 起点: 整张卡刚好在刷卡区上方
    // 3. 一路向下刷, 不做任何裁切 —— 卡片直接滑出网页外
    // 4. 整卡越过刷卡区之后开始淡出, 到网页外时已完全消失
    // 5. 动画层 position:fixed + z-index 9999, 卡片全程在所有画面最上层
    playSwipeAnimation(card, callback) {
        const reader = document.getElementById('card-reader');
        const slot = reader.querySelector('.card-reader-slot');
        const rarity = RARITY_CONFIG[card.rarity] || RARITY_CONFIG.common;

        const old = document.getElementById('swipe-stage');
        if (old) old.remove();

        const rr = reader.getBoundingClientRect();
        const sr = slot.getBoundingClientRect();

        // 卡面宽度 = 刷卡区(黑条)宽度
        const w = Math.round(sr.width);
        const h = Math.round(w * 1.5);

        const vh = window.innerHeight;

        const startTop = Math.round(rr.top - h - 8);   // 整卡在刷卡区上方
        const passTop = Math.round(rr.bottom);         // 整卡越过刷卡区的瞬间
        const endTop = vh + 40;                        // 终点: 整张卡已在网页底部之外

        const travel = endTop - startTop;
        const passRatio = Math.max(0, Math.min(1, (passTop - startTop) / travel));

        const DURATION = 1100;
        const fadeDelay = Math.round(passRatio * DURATION);
        const fadeDur = Math.max(200, DURATION - fadeDelay);

        // 不设任何裁切区: 卡片可以自由滑到网页外
        const stage = document.createElement('div');
        stage.id = 'swipe-stage';
        Object.assign(stage.style, {
            position: 'fixed',
            left: '0', top: '0', right: '0', bottom: '0',
            pointerEvents: 'none',
            zIndex: '9999',
        });

        const cardEl = document.createElement('div');
        cardEl.style.cssText = `
            position: absolute;
            left: ${Math.round(sr.left)}px;
            top: ${startTop}px;
            width: ${w}px;
            height: ${h}px;
            background: #1a1a1a url('${this.cardImage(card)}') center/cover;
            border: clamp(3px, 0.5vh, 7px) solid ${rarity.color};
            border-radius: 14px;
            box-shadow: 0 0 34px ${rarity.color};
            transition: top ${DURATION}ms linear,
                        opacity ${fadeDur}ms linear ${fadeDelay}ms;
        `;

        stage.appendChild(cardEl);
        document.body.appendChild(stage);

        // 强制回流, 否则初始样式未被计算, transition 不触发
        void cardEl.offsetHeight;

        requestAnimationFrame(() => {
            cardEl.style.top = `${endTop}px`;
            cardEl.style.opacity = '0';
        });

        setTimeout(() => {
            stage.remove();
            if (callback) callback();
        }, DURATION + 80);
    }

    // ==================== 刷卡界面 ====================
    showCardSelectionScreen(ownedCards, usedCardIds, onCardSelect, onFinish) {
        this.clearScreen();

        const wrap = document.createElement('div');
        wrap.className = 'screen-wrap';

        const scroll = document.createElement('div');
        scroll.className = 'screen-scroll';

        const title = document.createElement('h2');
        title.className = 'screen-title';
        title.textContent = '请刷卡！刷卡结束后点击「结束刷卡」。';
        scroll.appendChild(title);

        scroll.appendChild(this.buildSwipeSection('角色卡', '#ff6b9d',
            ownedCards.filter(c => c.type === 'character'), usedCardIds, onCardSelect));
        scroll.appendChild(this.buildSwipeSection('孕娘英灵卡', '#a855f7',
            ownedCards.filter(c => c.type === 'spirit'), usedCardIds, onCardSelect));

        wrap.appendChild(scroll);
        this.screenContent.appendChild(wrap);

        this.setConfirm('结束刷卡', onFinish);
        this.disableCancel('取消');
    }

    buildSwipeSection(heading, color, cards, usedCardIds, onSelect) {
        const section = document.createElement('div');

        const h = document.createElement('h3');
        h.className = 'section-title';
        h.style.color = color;
        const usable = cards.filter(c => !usedCardIds.includes(c.id)).length;
        h.textContent = `${heading}（可用 ${usable} / ${cards.length}）`;
        section.appendChild(h);

        if (cards.length === 0) {
            const note = document.createElement('p');
            note.className = 'empty-note';
            note.textContent = '暂无';
            section.appendChild(note);
            return section;
        }

        const grid = document.createElement('div');
        grid.className = 'card-grid';
        cards.forEach(card => {
            grid.appendChild(this.createCardThumbnail(card, usedCardIds.includes(card.id), onSelect));
        });
        section.appendChild(grid);
        return section;
    }

    createCardThumbnail(card, isUsed, onClick) {
        const rarity = RARITY_CONFIG[card.rarity] || RARITY_CONFIG.common;

        const thumb = document.createElement('div');
        thumb.className = 'card-thumb' + (isUsed ? ' used' : '');
        thumb.style.borderColor = rarity.color;
        thumb.style.backgroundImage = `url('${this.cardImage(card)}')`;
        thumb.dataset.cardId = card.id;

        const tag = document.createElement('div');
        tag.className = 'tag-name';
        tag.innerHTML = `<strong>${card.name}</strong>`;
        thumb.appendChild(tag);

        if (isUsed) {
            const check = document.createElement('div');
            check.className = 'tag-used';
            check.textContent = '✓';
            thumb.appendChild(check);
        } else {
            thumb.onmouseenter = () => {
                thumb.style.transform = 'translateY(-4px)';
                thumb.style.boxShadow = `0 6px 18px ${rarity.color}`;
            };
            thumb.onmouseleave = () => { thumb.style.transform = 'none'; thumb.style.boxShadow = 'none'; };
            thumb.onclick = () => onClick(card);
        }

        return thumb;
    }

    // ==================== 刷卡详情 ====================
    showCardDetail(card, onSwipe, onCancel) {
        this.clearScreen();

        const wrap = document.createElement('div');
        wrap.className = 'detail-wrap';
        wrap.appendChild(this.buildDetailLayout(card, { showCount: false }));
        this.screenContent.appendChild(wrap);

        this.setConfirm('刷卡', () => this.playSwipeAnimation(card, onSwipe));
        this.setCancel('取消', onCancel);
    }

    // ==================== 战斗界面 ====================
    // bg 由调用方给出(每场随机), 不传则沿用上一张
    // round: { current, total } 用于显示"第 N / 5 场"
    //
    // 背景分两层, 保证"整张场景图完整可见"且不留黑边:
    //   .battle-bg-fill  底层: cover 铺满 + 模糊, 用来填两侧留白
    //   .battle-bg-full  上层: contain 完整显示整张图(不裁切、不放大)
    showBattleScreen(player, enemy, bg, round) {
        this.clearScreen();

        const stage = document.createElement('div');
        stage.className = 'battle-stage';

        const src = bg || this._lastBattleBg || '';
        if (bg) this._lastBattleBg = bg;
        if (src) {
            const fill = document.createElement('div');
            fill.className = 'battle-bg-fill';
            fill.style.backgroundImage = `url('${src}')`;

            const full = document.createElement('div');
            full.className = 'battle-bg-full';
            full.style.backgroundImage = `url('${src}')`;

            stage.appendChild(fill);
            stage.appendChild(full);
        }

        if (round && round.total) {
            const tag = document.createElement('div');
            tag.className = 'battle-round';
            tag.textContent = `第 ${round.current} / ${round.total} 场`;
            stage.appendChild(tag);
        }

        stage.appendChild(this.createCharacterDisplay(player, 'player'));
        stage.appendChild(this.createCharacterDisplay(enemy, 'enemy'));

        this.screenContent.appendChild(stage);
    }

    createCharacterDisplay(character, side) {
        const div = document.createElement('div');
        div.id = `${side}-display`;
        div.className = `battle-side side-${side}`;

        const name = document.createElement('h3');
        name.textContent = character.name;

        const wrap = document.createElement('div');
        wrap.className = 'img-wrap';
        wrap.appendChild(this.makeImg(game.getCharacterImage(character), 'character-battle-img'));

        const hp = document.createElement('div');
        hp.className = `${side}-hp hp-container`;
        const percent = Math.max(0, (character.currentHealth / character.maxHealth) * 100);
        hp.innerHTML = `
            <div class="hp-bar-wrapper">
                <div class="hp-bar-fill" style="background:${side === 'player' ? '#10b981' : '#ef4444'}; width:${percent}%;"></div>
                <div class="hp-text">${character.currentHealth} / ${character.maxHealth}</div>
            </div>
        `;

        div.appendChild(name);
        div.appendChild(wrap);
        div.appendChild(hp);
        return div;
    }

    updateHealth(side, character) {
        const hpContainer = document.querySelector(`.${side}-hp`);
        if (!hpContainer) return;

        const percent = Math.max(0, (character.currentHealth / character.maxHealth) * 100);
        const bar = hpContainer.querySelector('.hp-bar-fill');
        const text = hpContainer.querySelector('.hp-text');
        if (bar) bar.style.width = `${percent}%`;
        if (text) text.textContent = `${character.currentHealth} / ${character.maxHealth}`;

        const wrap = document.querySelector(`#${side}-display .img-wrap`);
        if (wrap) {
            const old = wrap.querySelector('img');
            const src = game.getCharacterImage(character);
            if (old && old.getAttribute('src') !== src) {
                wrap.innerHTML = '';
                wrap.appendChild(this.makeImg(src, 'character-battle-img'));
            }
        }
    }

    // ==================== 屏内结算文字(不走对话框) ====================
    showScreenMessage(html, opts = {}) {
        this.clearScreen();

        const box = document.createElement('div');
        box.className = 'screen-message';
        box.innerHTML = html;

        if (opts.imageSrc) {
            const img = document.createElement('img');
            img.src = opts.imageSrc;
            img.onerror = () => img.remove();
            box.insertBefore(img, box.firstChild);
        }
        if (opts.clickAnywhere) box.style.cursor = 'pointer';

        this.screenContent.appendChild(box);
        return box;
    }

    // ==================== 回合结果 ====================
    showRoundResult(roundResult, callback) {
        const pChoice = Battle.getChoiceName(roundResult.playerChoice);
        const eChoice = Battle.getChoiceName(roundResult.enemyChoice);

        let resultText = `你选择${pChoice}，对方选择${eChoice}。\n`;
        if (roundResult.winner === 'player') resultText += '你的胜利！';
        else if (roundResult.winner === 'enemy') resultText += '糟糕，对方的胜利！';
        else resultText += '平局！';

        // 破防提示: 出防御方虽然赢了, 但重击高过其防御, 仍会被打出溢出伤害
        if (roundResult.enemyPierced) {
            resultText += '\n但是，对方的防御力不足以挡下我方的攻击——破防！';
        } else if (roundResult.playerPierced) {
            resultText += '\n但是，我方的防御力不足以挡下对方的攻击——破防！';
        }

        resultText += '\n\n（点击任意处继续）';

        this.showDialog(resultText, [], true);
        this.dialogOverlay.onclick = () => {
            this.hideDialog();
            if (callback) callback();
        };
    }

    // ==================== 攻击特效 ====================
    // hits: [{ side:'player'|'enemy', damage:N }]
    // 受击方震动 + 红光 + 飘伤害数字; 仅一方受伤时, 另一方做前冲动作
    playHitEffects(hits) {
        if (!hits || !hits.length) return;

        // 单侧受伤 -> 对方是攻击方, 做前冲
        if (hits.length === 1) {
            const attackerSide = hits[0].side === 'player' ? 'enemy' : 'player';
            const a = document.getElementById(`${attackerSide}-display`);
            if (a) {
                a.classList.remove('attacking');
                void a.offsetWidth;              // 强制回流, 让动画可重放
                a.classList.add('attacking');
                setTimeout(() => a.classList.remove('attacking'), 460);
            }
        }

        hits.forEach(h => {
            const el = document.getElementById(`${h.side}-display`);
            if (!el) return;

            el.classList.remove('hit');
            void el.offsetWidth;
            el.classList.add('hit');
            setTimeout(() => el.classList.remove('hit'), 460);

            const wrap = el.querySelector('.img-wrap') || el;
            const flash = document.createElement('div');
            flash.className = 'hit-flash';
            wrap.appendChild(flash);

            const pop = document.createElement('div');
            pop.className = 'damage-pop';
            pop.textContent = `-${h.damage}`;
            el.appendChild(pop);                 // 挂在外层, 避免被 img-wrap 裁掉

            setTimeout(() => { flash.remove(); pop.remove(); }, 720);
        });
    }

    // ==================== 战斗按钮 ====================
    setBattleButtonsEnabled(enabled) {
        this.controls.querySelectorAll('.game-button').forEach(btn => {
            btn.classList.toggle('inactive', !enabled);
            if (!enabled) btn.classList.remove('selected');
        });
    }

    clearButtonHighlight() {
        this.controls.querySelectorAll('.game-button').forEach(btn => btn.classList.remove('selected'));
    }

    highlightButton(action) {
        this.controls.querySelectorAll('.game-button').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.action === action);
        });
    }
}

// 全局UI实例
const ui = new UI();
